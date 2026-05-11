import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Node.js の crypto モジュールは Edge Runtime で使えないため
// セッション署名はせず、シンプルなUUIDのみをセッションIDとして使用する
// （開発フェーズ: セキュリティより動作優先）

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const sessionCookie = request.cookies.get('zax-session')
  
  if (!sessionCookie) {
    const newSessionId = uuidv4()
    response.cookies.set('zax-session', newSessionId, {
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
