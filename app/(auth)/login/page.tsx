'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/leads'
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    
    setLoading(true)
    
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail 
            size={18} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9A9A]"
          />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            placeholder="you@example.com"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9A9A]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white rounded-full py-6"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight size={16} className="ml-2" />
          </>
        )}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FEFEFE]">
      {/* Dotted background */}
      <div 
        className="fixed inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-[#EAEAEA] p-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#0A0A0A]">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            <line x1="12" y1="1" x2="12" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          </svg>
          <span className="text-xl font-semibold tracking-tight text-[#0A0A0A]">
            Karmora
          </span>
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-semibold text-center mb-2 text-[#0A0A0A]">
          Welcome Back
        </h1>
        <p className="text-center mb-8 text-[#6B6B6B]">
          Sign in to continue to your dashboard
        </p>
        
        {/* Form with Suspense */}
        <Suspense fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#0A0A0A]" />
          </div>
        }>
          <LoginForm />
        </Suspense>
        
        {/* Sign up link */}
        <p className="text-center mt-6 text-[#6B6B6B]">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium underline underline-offset-2 text-[#0A0A0A]"
          >
            Sign up
          </Link>
        </p>
        
        {/* Back to landing */}
        <div className="text-center mt-4">
          <a 
            href={process.env.NEXT_PUBLIC_LANDING_URL || 'https://karmora.com'}
            className="text-sm text-[#9A9A9A] hover:text-[#6B6B6B]"
          >
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  )
}
