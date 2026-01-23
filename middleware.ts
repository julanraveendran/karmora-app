import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // #region agent log - Hypothesis A: Check env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  console.log('[DEBUG-A] Middleware start', { 
    path: request.nextUrl.pathname,
    hasUrl: !!supabaseUrl, 
    hasKey: !!supabaseKey,
    urlPrefix: supabaseUrl?.substring(0, 20) 
  })
  // #endregion

  // #region agent log - Hypothesis A: Early exit if env vars missing
  if (!supabaseUrl || !supabaseKey) {
    console.error('[DEBUG-A] MISSING ENV VARS', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey })
    return NextResponse.next({ request })
  }
  // #endregion

  let response = NextResponse.next({
    request,
  })

  try {
    // #region agent log - Hypothesis B: Supabase client creation
    console.log('[DEBUG-B] Creating Supabase client...')
    // #endregion
    
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

    // #region agent log - Hypothesis B: Client created successfully
    console.log('[DEBUG-B] Supabase client created successfully')
    // #endregion

    // #region agent log - Hypothesis C: getUser call
    console.log('[DEBUG-C] Calling supabase.auth.getUser()...')
    // #endregion

    // Refresh session if expired
    const { data: { user }, error } = await supabase.auth.getUser()

    // #region agent log - Hypothesis C: getUser result
    console.log('[DEBUG-C] getUser result', { hasUser: !!user, error: error?.message || null })
    // #endregion

    // Protected routes - redirect to login if not authenticated
    const protectedPaths = ['/leads', '/settings', '/templates', '/onboarding']
    const isProtectedPath = protectedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    )

    if (isProtectedPath && !user) {
      // #region agent log - Redirect to login
      console.log('[DEBUG] Redirecting to login - protected path without user')
      // #endregion
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
      // #region agent log - Redirect to leads
      console.log('[DEBUG] Redirecting to leads - logged in user on auth page')
      // #endregion
      return NextResponse.redirect(new URL('/leads', request.url))
    }

    // #region agent log - Success
    console.log('[DEBUG] Middleware completed successfully')
    // #endregion

    return response
  } catch (err) {
    // #region agent log - Hypothesis D: Catch any errors
    console.error('[DEBUG-D] Middleware error caught', { 
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    })
    // #endregion
    
    // Return a basic response instead of crashing
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
