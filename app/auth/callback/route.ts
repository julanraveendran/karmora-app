import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()
        
        // Redirect to onboarding if not completed, otherwise to leads
        const redirectTo = profile?.onboarding_completed ? '/leads' : '/onboarding'
        return NextResponse.redirect(`${origin}${redirectTo}`)
      }
    }
  }

  // If something went wrong, redirect to signup with error
  return NextResponse.redirect(`${origin}/signup?error=auth_callback_error`)
}
