import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic'

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

    // Not logged in - redirect to signup
    redirect('/signup')
  } catch (error) {
    console.error('Error in Home:', error)
    // Fallback to signup on error
    redirect('/signup')
  }
}
