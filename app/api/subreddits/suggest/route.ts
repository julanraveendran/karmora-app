import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLLMProvider } from '@/lib/llm/provider'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productName, oneLiner, icp } = await request.json()

    if (!productName || !oneLiner || !icp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use LLM to suggest relevant subreddits
    const llmProvider = await getLLMProvider()

    const systemPrompt = `You are a Reddit marketing expert. Your job is to suggest the most relevant subreddits where a product's target customers actively discuss their problems.

Rules:
1. Return ONLY a JSON array of subreddit names (without the r/ prefix)
2. Suggest 8-12 subreddits
3. Focus on subreddits where people ASK FOR HELP or discuss problems (not just general interest subs)
4. Include a mix of:
   - Niche subreddits specific to the product domain
   - Broader subreddits where the ICP hangs out
   - Problem-focused subreddits (e.g., "techsupport" style communities)
5. Avoid huge generic subreddits (>5M members) - they're too noisy
6. Return valid, existing subreddit names only
7. Do NOT include any explanation - just the JSON array`

    const userPrompt = `Suggest subreddits for this product:

Product: ${productName}
Value Prop: ${oneLiner}
Target Customer: ${icp}

Return a JSON array of subreddit names, e.g.: ["startups", "SaaS", "entrepreneur"]`

    const response = await llmProvider.generateReply([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    // Parse the response - extract JSON array
    let subreddits: string[] = []
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        subreddits = JSON.parse(jsonMatch[0])
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError)
      // Fallback to default suggestions
      subreddits = [
        'startups',
        'SaaS',
        'entrepreneur',
        'smallbusiness',
        'Entrepreneur',
        'indiehackers',
      ]
    }

    // Clean and validate subreddit names
    subreddits = subreddits
      .map(s => s.toLowerCase().replace(/^r\//, '').trim())
      .filter(s => s.length > 0 && s.length < 30 && /^[a-z0-9_]+$/i.test(s))
      .slice(0, 12)

    return NextResponse.json({ subreddits })
  } catch (error) {
    console.error('Subreddit suggestion error:', error)
    // Return fallback suggestions on error
    return NextResponse.json({ 
      subreddits: [
        'startups',
        'SaaS',
        'entrepreneur',
        'smallbusiness',
        'marketing',
        'growmybusiness',
      ]
    })
  }
}
