'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Radar, FileText, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const navItems = [
  { path: '/leads', label: 'Leads', icon: Radar },
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[#EAEAEA] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#EAEAEA]">
        <Link href="/leads" className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#0A0A0A]">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <line x1="12" y1="1" x2="12" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          </svg>
          <span className="text-lg font-semibold tracking-tight text-[#0A0A0A]">
            Karmora
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = pathname === path
            return (
              <li key={path}>
                <Link
                  href={path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-[#0A0A0A] text-white' 
                      : 'text-[#6B6B6B] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="px-3 py-4 border-t border-[#EAEAEA]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all duration-200 text-[#6B6B6B] hover:bg-[#F5F5F5]"
        >
          <LogOut size={18} />
          <span className="font-medium text-sm">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
