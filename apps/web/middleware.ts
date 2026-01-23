import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get access token from cookie or check localStorage via custom header
  const accessToken = request.cookies.get('accessToken')?.value

  // Define public paths that don't require authentication
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isPublicPath = isAuthPage

  // If user is not authenticated and trying to access protected route
  if (!accessToken && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
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
