import { NextRequest, NextResponse } from 'next/server'

/** Routes that require authentication (refreshToken cookie). */
const protectedPaths = ['/dashboard', '/workspaces', '/projects']

/** Auth pages that should redirect to app if already authenticated. */
const authPaths = ['/login', '/register', '/forgot-password']

/**
 * Next.js 16 proxy handler — replaces the deprecated `middleware.ts`.
 *
 * Responsibilities:
 * - Logs every matched request (method, path, auth status) for debugging.
 * - Redirects unauthenticated users away from protected routes.
 * - Redirects authenticated users away from auth pages.
 *
 * @param req - The incoming request object.
 *
 * @returns A redirect response or passes the request through.
 */
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

/** Routes matched by this proxy. */
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
