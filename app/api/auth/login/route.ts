import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyPassword, signAccessToken, signRefreshToken, DUMMY_PASSWORD_HASH } from '@/lib/auth'

/**
 * Parses the JWT refresh token expiration time from the environment variable
 * and converts it to seconds.
 *
 * @returns
 */
function parseMaxAgeSeconds(): number {
    const DEFAULT_SECONDS = 7 * 24 * 60 * 60 // 7 days in seconds
    const v = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'

    const n = Number(v)
    if (!Number.isNaN(n)) return n
    if (Number.isNaN(Number(v.slice(0, -1)))) return DEFAULT_SECONDS
    if (v.endsWith('d')) return Number(v.slice(0, -1)) * 24 * 60 * 60
    if (v.endsWith('h')) return Number(v.slice(0, -1)) * 60 * 60
    if (v.endsWith('m')) return Number(v.slice(0, -1)) * 60

    return DEFAULT_SECONDS
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password } = body || {}
        if (!email || !password) {
            return NextResponse.json(
                { error: { code: 'auth.missing_credentials' } },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
        const hashToCheck = user ? user.hashedPassword : DUMMY_PASSWORD_HASH

        const valid = await verifyPassword(password, hashToCheck)
        if (!user || !valid) {
            return NextResponse.json(
                { error: { code: 'auth.invalid_credentials' } },
                { status: 401 }
            )
        }

        const payload = { userId: user.id, email: user.email }
        const accessToken = signAccessToken(payload)
        const refreshToken = signRefreshToken(payload)

        const maxAgeSeconds = parseMaxAgeSeconds()

        const cookieStore = await cookies()
        cookieStore.set({
            name: 'refreshToken',
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: maxAgeSeconds,
        })

        return NextResponse.json({
            ok: true,
            accessToken,
            user: { id: user.id, email: user.email },
        })
    } catch (err) {
        return NextResponse.json({ error: { code: 'server.error' } }, { status: 500 })
    }
}
