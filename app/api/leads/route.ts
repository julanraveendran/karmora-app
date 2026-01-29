import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeSubreddits, processRedditPosts, type ScoredPost } from '@/lib/reddit'

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
    console.log(`Refreshing leads for user ${user.id}, subreddits: ${subreddits.join(', ')}`)

    // Scrape Reddit posts using Apify
    const rawPosts = await scrapeSubreddits(subreddits, 30)
    
    // Process and filter for high-intent leads
    const qualifiedLeads = processRedditPosts(rawPosts, {
      windowDays: 7,
      minScore: 2,
    })

    // Get existing reddit_post_ids to avoid duplicates
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('reddit_post_id')
      .eq('user_id', user.id)

    const existingIds = new Set(existingLeads?.map(l => l.reddit_post_id) || [])

    // Filter out duplicates
    const newLeads = qualifiedLeads.filter(
      post => !existingIds.has(post.parsedId)
    )

    // Insert new leads into database
    let addedCount = 0
    if (newLeads.length > 0) {
      const leadsToInsert = newLeads.map((post: ScoredPost) => ({
        user_id: user.id,
        subreddit: post.parsedCommunityName,
        reddit_post_id: post.parsedId,
        title: post.title,
        author: post.username,
        url: post.url,
        created_utc: post.createdAt,
        snippet: post.body?.substring(0, 500) || null,
        status: 'new',
        score: post.intentScore,
        fetched_at: new Date().toISOString(),
      }))

      const { data: insertedLeads, error: insertError } = await supabase
        .from('leads')
        .insert(leadsToInsert)
        .select()

      if (insertError) {
        console.error('Error inserting leads:', insertError)
        // Continue anyway, some leads might have been inserted
      }

      addedCount = insertedLeads?.length || 0
    }

    // Get total count
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({ 
      added: addedCount,
      total: count || 0,
      processed: rawPosts.length,
      qualified: qualifiedLeads.length,
      message: addedCount > 0 
        ? `Added ${addedCount} new leads` 
        : 'No new leads found (all duplicates or low intent)'
    })
  } catch (error) {
    console.error('Leads refresh error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Provide more helpful error messages
    let userFriendlyError = 'Failed to refresh leads'
    if (errorMessage.includes('APIFY_API_TOKEN')) {
      userFriendlyError = 'Reddit scraping service is not configured. Please contact support.'
    } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      userFriendlyError = 'Scraping took too long. Please try again in a moment.'
    } else if (errorMessage.includes('Apify')) {
      userFriendlyError = 'Reddit scraping service error. Please try again.'
    }
    
    return NextResponse.json({ 
      error: userFriendlyError,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 })
  }
}
