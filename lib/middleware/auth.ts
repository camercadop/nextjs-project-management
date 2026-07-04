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
        return jsonError('auth.token_required')
    }

    let payload: TokenPayload
    try {
        payload = verifyAccessToken(token) as unknown as TokenPayload
    } catch {
        // Throw instead of return so callers can distinguish auth failures from normal error responses
        throw jsonError('auth.unauthorized')
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true },
    })

    if (!user) {
        return jsonError('auth.user_not_found')
    }

    return { user, payload }
}
