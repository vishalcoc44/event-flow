import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Check if this is a password reset link
  const type = searchParams.get('type')
  const accessToken = searchParams.get('access_token')
  
  // If it's a recovery type with tokens, redirect to reset-password
  if (type === 'recovery' && accessToken) {
    const resetUrl = new URL('/reset-password', request.url)
    // Preserve all query parameters
    searchParams.forEach((value, key) => {
      resetUrl.searchParams.set(key, value)
    })
    
    return NextResponse.redirect(resetUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
