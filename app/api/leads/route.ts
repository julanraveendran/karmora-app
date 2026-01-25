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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/route.ts:POST:entry',message:'POST /api/leads called',data:{hasApifyToken:!!process.env.APIFY_API_TOKEN},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/route.ts:POST:auth',message:'Auth check',data:{hasUser:!!user,userId:user?.id?.substring(0,8)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subreddit targets
    const { data: targets } = await supabase
      .from('subreddit_targets')
      .select('subreddit')
      .eq('user_id', user.id)

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/route.ts:POST:targets',message:'Subreddit targets',data:{count:targets?.length||0,subreddits:targets?.map(t=>t.subreddit)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!targets || targets.length === 0) {
      return NextResponse.json({ error: 'No subreddits configured' }, { status: 400 })
    }

    const subreddits = targets.map(t => t.subreddit)
    console.log(`Refreshing leads for user ${user.id}, subreddits: ${subreddits.join(', ')}`)

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/route.ts:POST:beforeScrape',message:'About to scrape Reddit',data:{subreddits},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Scrape Reddit posts using Apify
    const rawPosts = await scrapeSubreddits(subreddits, 30)
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/route.ts:POST:afterScrape',message:'Scraping completed',data:{rawPostsCount:rawPosts.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
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
    const errorStack = error instanceof Error ? error.stack?.substring(0, 500) : null
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/route.ts:POST:catch',message:'Error caught',data:{errorMessage,errorStack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C,D'})}).catch(()=>{});
    // #endregion
    
    return NextResponse.json({ 
      error: 'Failed to refresh leads',
      details: errorMessage
    }, { status: 500 })
  }
}
