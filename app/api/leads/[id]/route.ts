import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateLeadRequest } from '@/types'

// PATCH /api/leads/[id] - Update lead status
export async function PATCH(
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
    const body: UpdateLeadRequest = await request.json()

    // Verify the lead belongs to the user
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('leads')
      .update({ status: body.status })
      .eq('id', id)

    if (error) {
      console.error('Error updating lead:', error)
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Lead update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
