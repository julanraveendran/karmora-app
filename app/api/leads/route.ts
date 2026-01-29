import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startRedditScrape, getRunStatus, getDatasetItems, processRedditPosts, type ScoredPost } from '@/lib/reddit'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// GET /api/leads - Fetch leads for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subreddit = searchParams.get('subreddit')
    const status = searchParams.get('status')

    let query = supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_utc', { ascending: false })

    if (subreddit && subreddit !== 'all') {
      query = query.eq('subreddit', subreddit)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json({ leads: data || [] })
  } catch (error) {
    console.error('Leads fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/leads - Refresh leads (fetch from Reddit via Apify)
export async function POST(request: NextRequest) {
  try {
    // Check for APIFY_API_TOKEN first
    if (!process.env.APIFY_API_TOKEN) {
      console.error('APIFY_API_TOKEN is not set')
      return NextResponse.json({ 
        error: 'Reddit scraping is not configured. Please contact support.',
        details: 'APIFY_API_TOKEN environment variable is missing'
      }, { status: 500 })
    }
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subreddit targets
    const { data: targets } = await supabase
      .from('subreddit_targets')
      .select('subreddit')
      .eq('user_id', user.id)

    if (!targets || targets.length === 0) {
      return NextResponse.json({ error: 'No subreddits configured' }, { status: 400 })
    }

    const subreddits = targets.map(t => t.subreddit)
    console.log(`Starting Reddit scrape for user ${user.id}, subreddits: ${subreddits.join(', ')}`)

    // Start the Apify run (async - don't wait for completion)
    const runId = await startRedditScrape(subreddits, 30)
    console.log(`Apify run started: ${runId}`)
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/route.ts:POST:runStarted',message:'Run started async',data:{runId,subreddits},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Return immediately - scraping happens in background
    // Frontend will poll /api/leads/status?runId=xxx to check completion
    return NextResponse.json({ 
      status: 'scraping',
      runId,
      message: 'Scraping started. Leads will appear automatically when ready.'
    })
  } catch (error) {
    console.error('Leads refresh error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log full error details for debugging
    console.error('Full error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    })
    
    // Provide more helpful error messages
    let userFriendlyError = 'Failed to refresh leads'
    if (errorMessage.includes('APIFY_API_TOKEN')) {
      userFriendlyError = 'Reddit scraping service is not configured. Please contact support.'
    } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      userFriendlyError = 'Scraping took too long. Please try again in a moment.'
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      userFriendlyError = 'Invalid API token. Please check Apify configuration.'
    } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      userFriendlyError = 'API access denied. Please check Apify account permissions.'
    } else if (errorMessage.includes('Apify') || errorMessage.includes('Reddit scraping')) {
      // Include the actual error message from Apify
      userFriendlyError = errorMessage.includes('Reddit scraping failed:') 
        ? errorMessage.replace('Reddit scraping failed: ', '')
        : `Reddit scraping error: ${errorMessage}`
    }
    
    return NextResponse.json({ 
      error: userFriendlyError,
      details: process.env.NODE_ENV === 'development' ? errorMessage : errorMessage.substring(0, 200)
    }, { status: 500 })
  }
}
