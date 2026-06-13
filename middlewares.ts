import { NextRequest, NextResponse } from 'next/server'

const protectedPaths = ['/dashboard', '/workspaces', '/projects']
const authPaths = ['/login', '/register', '/forgot-password']

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const token = req.cookies.get('refreshToken')?.value

    const isProtected = protectedPaths.some(p => pathname.startsWith(p))
    const isAuthPage = authPaths.some(p => pathname.startsWith(p))

    if (isProtected && !token) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
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
