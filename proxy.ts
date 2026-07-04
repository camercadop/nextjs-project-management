import { NextRequest, NextResponse } from 'next/server'

const protectedPaths = ['/dashboard', '/workspaces', '/projects']
const authPaths = ['/login', '/register', '/forgot-password']

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl
    const token = req.cookies.get('refreshToken')?.value

    console.log(`[proxy] ${req.method} ${pathname} | token=${!!token}`)

    const isProtected = protectedPaths.some(p => pathname.startsWith(p))
    const isAuthPage = authPaths.some(p => pathname.startsWith(p))

    if (isProtected && !token) {
        console.log(`[proxy] → redirect to /login (no token)`)
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (isAuthPage && token) {
        console.log(`[proxy] → redirect to /workspaces (has token)`)
        return NextResponse.redirect(new URL('/workspaces', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/workspaces/:path*',
        '/projects/:path*',
        '/login',
        '/register',
        '/forgot-password',
    ],
}
