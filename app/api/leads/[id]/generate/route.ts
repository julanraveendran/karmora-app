import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLLMProvider, getReplySystemPrompt } from '@/lib/llm/provider'

// POST /api/leads/[id]/generate - Generate a reply for a lead
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Get the user's product profile
    const { data: productProfile, error: profileError } = await supabase
      .from('product_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError || !productProfile) {
      return NextResponse.json({ error: 'Product profile not found' }, { status: 400 })
    }

    // Check for existing reply
    const { data: existingReply } = await supabase
      .from('generated_replies')
      .select('reply_text')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (existingReply) {
      return NextResponse.json({ replyText: existingReply.reply_text })
    }

    // Generate reply using LLM
    const llmProvider = await getLLMProvider()
    
    const systemPrompt = getReplySystemPrompt({
      productName: productProfile.product_name,
      oneLiner: productProfile.one_liner,
      icp: productProfile.icp,
      websiteUrl: productProfile.website_url,
      replyStyle: productProfile.reply_style,
      softMention: productProfile.soft_mention,
    })

    const userPrompt = `Generate a helpful Reddit reply for this post:

Subreddit: r/${lead.subreddit}
Title: ${lead.title}
${lead.snippet ? `Content: ${lead.snippet}` : ''}
Author: u/${lead.author}

Remember to be helpful, authentic, and follow all the rules in your instructions.`

    const response = await llmProvider.generateReply([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    // Store the generated reply
    await supabase.from('generated_replies').insert({
      lead_id: id,
      user_id: user.id,
      reply_text: response.content,
      provider: response.provider,
    })

    // Update lead status to viewed
    await supabase
      .from('leads')
      .update({ status: 'viewed' })
      .eq('id', id)

    return NextResponse.json({ replyText: response.content })
  } catch (error) {
    console.error('Reply generation error:', error)
    
    // Return a fallback mock reply if LLM fails
    const mockReply = `Great question! I've dealt with this exact challenge before.

Here's what worked for me:
1. Start by identifying the specific subreddits where your ICP hangs out
2. Focus on threads where people are actively asking for help
3. Always lead with value before mentioning any tools

One thing that helped me was setting up alerts for specific keywords.

Hope that helps!`

    return NextResponse.json({ replyText: mockReply })
  }
}
