import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { Toaster } from '@/components/ui/sonner'

// Force dynamic rendering since we use cookies for auth
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if onboarding is completed
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist or onboarding not completed, redirect to onboarding
  if (!profile?.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-[#FEFEFE]">
      {/* Dotted background */}
      <div 
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      
      <DashboardSidebar />
      
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
      
      <Toaster />
    </div>
  )
}
