import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { SaveOnboardingRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body: SaveOnboardingRequest = await request.json()

    // Validate request
    if (body.product.productName.length < 2 || body.product.productName.length > 40) {
      return NextResponse.json({ ok: false, error: 'Product name must be 2-40 characters' })
    }
    if (body.product.oneLiner.length < 20) {
      return NextResponse.json({ ok: false, error: 'One-liner must be at least 20 characters' })
    }
    if (body.product.icp.length < 20) {
      return NextResponse.json({ ok: false, error: 'ICP must be at least 20 characters' })
    }
    if (body.subreddits.length === 0 || body.subreddits.length > 5) {
      return NextResponse.json({ ok: false, error: 'Must select 1-5 subreddits' })
    }

    // Upsert product profile
    const { error: profileError } = await supabase
      .from('product_profiles')
      .upsert({
        user_id: user.id,
        product_name: body.product.productName,
        one_liner: body.product.oneLiner,
        icp: body.product.icp,
        website_url: body.product.websiteUrl || null,
        reply_style: body.product.replyStyle,
        soft_mention: body.product.softMention,
      }, {
        onConflict: 'user_id',
      })

    if (profileError) {
      console.error('Error saving product profile:', profileError)
      return NextResponse.json({ ok: false, error: 'Failed to save product profile' })
    }

    // Delete existing subreddit targets and insert new ones
    await supabase
      .from('subreddit_targets')
      .delete()
      .eq('user_id', user.id)

    const { error: subredditError } = await supabase
      .from('subreddit_targets')
      .insert(
        body.subreddits.map(sub => ({
          user_id: user.id,
          subreddit: sub.toLowerCase().replace(/^r\//, ''),
        }))
      )

    if (subredditError) {
      console.error('Error saving subreddits:', subredditError)
      return NextResponse.json({ ok: false, error: 'Failed to save subreddits' })
    }

    // Mark onboarding as completed
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ ok: false, error: 'Failed to complete onboarding' })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
