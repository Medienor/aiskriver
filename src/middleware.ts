import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('413 LOGS: Request method:', request.method)
  console.log('413 LOGS: Request URL:', request.url)
  console.log('413 LOGS: Request headers:', JSON.stringify(Object.fromEntries(request.headers)))
  console.log('413 LOGS: Request body size:', request.headers.get('content-length'), 'bytes')

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}