import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// #region agent log - Debug: page.tsx accessed
console.log('[DEBUG] Root page.tsx executing at:', new Date().toISOString())
// #endregion

export default async function Home() {
  // #region agent log - Debug: Home function called
  console.log('[DEBUG] Home function called')
  // #endregion

  try {
    const supabase = await createClient()
    
    // #region agent log - Debug: Supabase client created
    console.log('[DEBUG] Supabase client created')
    // #endregion

    const { data: { user }, error } = await supabase.auth.getUser()

    // #region agent log - Debug: getUser result
    console.log('[DEBUG] getUser result:', { hasUser: !!user, error: error?.message })
    // #endregion

    if (user) {
      // Check if onboarding is completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        console.log('[DEBUG] Redirecting to /leads')
        redirect('/leads')
      } else {
        console.log('[DEBUG] Redirecting to /onboarding')
        redirect('/onboarding')
      }
    }

    // Not logged in - redirect to signup
    console.log('[DEBUG] Redirecting to /signup')
    redirect('/signup')
  } catch (error) {
    // #region agent log - Debug: Error caught
    console.error('[DEBUG] Error in Home:', error)
    // #endregion
    // Fallback to signup on error
    redirect('/signup')
  }
}
