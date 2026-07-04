import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import type { TokenPayload } from '@/lib/types/auth'

/** Returns a JSON error response with the given code and HTTP status. */
function jsonError(code: string, status: number = 401) {
    return new Response(JSON.stringify({ error: { code } }), {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}

/** Extracts and verifies the access token from the request, returning the authenticated user or an error response. */
export async function authMiddleware(req: Request) {
    const method = req.method
    const url = req.url
    const authHeader = req.headers.get('Authorization')
    let token: string | undefined

    // Prefer Authorization header (API clients), fall back to httpOnly cookie (browser sessions)
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim()
    } else {
        const cookieStore = await cookies()
        token = cookieStore.get('accessToken')?.value
    }

    if (!token) {
        console.warn(`[auth] ${method} ${url} - No token provided`)
        return jsonError('auth.token_required')
    }

    let payload: TokenPayload
    try {
        payload = verifyAccessToken(token) as unknown as TokenPayload
    } catch {
        console.warn(`[auth] ${method} ${url} - Invalid token`)
        throw jsonError('auth.unauthorized')
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true },
    })

    if (!user) {
        console.warn(`[auth] ${method} ${url} - User not found (id: ${payload.userId})`)
        return jsonError('auth.user_not_found')
    }

    console.info(`[auth] ${method} ${url} - Authenticated user ${user.id}`)
    return { user, payload }
}
