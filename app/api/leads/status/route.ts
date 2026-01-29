import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRunStatus, getDatasetItems, processRedditPosts, type ScoredPost } from '@/lib/reddit'

export const dynamic = 'force-dynamic'

// GET /api/leads/status?runId=xxx - Check scraping status and process results if ready
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('runId')

    if (!runId) {
      return NextResponse.json({ error: 'runId parameter required' }, { status: 400 })
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/status:GET:check',message:'Checking run status',data:{runId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Check run status
    const { status, datasetId } = await getRunStatus(runId)

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/status:GET:status',message:'Run status',data:{runId,status,datasetId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Handle various running states
    if (status === 'RUNNING' || status === 'READY' || status === 'READY_FOR_RUN') {
      return NextResponse.json({ 
        status: 'running',
        message: 'Scraping in progress...'
      })
    }

    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      // Clear the failed runId from user's profile
      await supabase
        .from('profiles')
        .update({ current_scrape_run_id: null })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error && error.code === '42703') {
            // Column doesn't exist - ignore
            console.warn('current_scrape_run_id column not found')
          }
        })
      
      return NextResponse.json({ 
        status: 'failed',
        error: `Scraping failed with status: ${status}`
      }, { status: 500 })
    }

    if (status === 'SUCCEEDED') {
      // Fetch and process results
      const rawPosts = await getDatasetItems(datasetId)
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/status:GET:processing',message:'Processing results',data:{runId,rawPostsCount:rawPosts.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
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
          throw insertError
        }

        addedCount = insertedLeads?.length || 0
      }

      // Get total count
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/04888eb7-f203-4669-a2a5-2bd5700effeb',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/leads/status:GET:complete',message:'Processing complete',data:{runId,addedCount,total:count},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      // Clear the runId from user's profile since scraping is complete
      await supabase
        .from('profiles')
        .update({ current_scrape_run_id: null })
        .eq('id', user.id)

      return NextResponse.json({ 
        status: 'completed',
        added: addedCount,
        total: count || 0,
        processed: rawPosts.length,
        qualified: qualifiedLeads.length,
        message: addedCount > 0 
          ? `Added ${addedCount} new leads` 
          : 'No new leads found (all duplicates or low intent)'
      })
    }

    return NextResponse.json({ 
      status: 'unknown',
      message: `Unknown status: ${status}`
    })
  } catch (error) {
    console.error('Status check error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({ 
      status: 'error',
      error: errorMessage
    }, { status: 500 })
  }
}
