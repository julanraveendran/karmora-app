import { NextResponse, type NextRequest } from 'next/server'

// #region agent log - Hypothesis E: Module load test (no Supabase import)
console.log('[DEBUG-E] MINIMAL middleware module loaded')
// #endregion

export async function middleware(request: NextRequest) {
  // #region agent log - Hypothesis E: Function called
  console.log('[DEBUG-E] Middleware called for:', request.nextUrl.pathname)
  console.log('[DEBUG-E] Env vars present:', {
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
  // #endregion

  // Just pass through for now - testing if middleware runs at all
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
