import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Check if onboarding is completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        redirect('/leads')
      } else {
        redirect('/onboarding')
      }
    }
  } catch (error) {
    // If Supabase fails, just redirect to signup
    console.error('Home page error:', error)
  }

  // Not logged in or error - redirect to signup
  redirect('/signup')
}
