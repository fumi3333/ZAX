import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { signSession } from '@/lib/crypto'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Check for existing session
  const sessionCookie = request.cookies.get('zax-session')
  
  if (!sessionCookie) {
    // Create new session ID
    const newSessionId = uuidv4()
    // Sign the session ID to prevent tampering
    const signedSession = signSession(newSessionId)
    
    // Set cookie
    response.cookies.set('zax-session', signedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  return response
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
