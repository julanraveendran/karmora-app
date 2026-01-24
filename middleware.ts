import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create base response
  let response = NextResponse.next({
    request,
  })

  // Get env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Skip auth if env vars not set
  if (!supabaseUrl || !supabaseKey) {
    return response
  }

  // Create Supabase client with try-catch for Edge Runtime compatibility
  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session if expired - wrap in try-catch
    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes
    const protectedPaths = ['/leads', '/settings', '/templates', '/onboarding']
    const isProtectedPath = protectedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    )

    if (isProtectedPath && !user) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect logged-in users away from auth pages
    const authPaths = ['/login', '/signup']
    const isAuthPath = authPaths.some(path => 
      request.nextUrl.pathname === path
    )

    if (isAuthPath && user) {
      return NextResponse.redirect(new URL('/leads', request.url))
    }
  } catch (error) {
    // If Supabase fails, just continue without auth check
    console.error('Middleware auth error:', error)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
