import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

// POST /api/leads - Refresh leads (fetch from Reddit)
export async function POST(request: NextRequest) {
  try {
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

    // TODO: Implement Reddit API fetch
    // For now, return mock data indicating refresh happened
    // In production, this would:
    // 1. Fetch posts from Reddit API for each subreddit
    // 2. Filter by intent signals
    // 3. Score and store new leads
    // 4. Return count of new leads

    const added = Math.floor(Math.random() * 5) + 1
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({ 
      added, 
      total: (count || 0) + added,
      message: 'Leads refreshed successfully'
    })
  } catch (error) {
    console.error('Leads refresh error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
