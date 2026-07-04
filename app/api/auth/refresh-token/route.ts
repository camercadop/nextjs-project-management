import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, signAccessToken } from '@/lib/auth'

export async function POST() {
    try {
        const cookieStore = await cookies()
        const cookie = cookieStore.get('refreshToken')
        const token = cookie?.value
        if (!token) {
            return NextResponse.json({ error: { code: 'auth.no_refresh_token' } }, { status: 401 })
        }

        let payload

        try {
            payload = await verifyRefreshToken(token)
        } catch (err) {
            // clear cookie and return unauthorized response
            cookieStore.delete('refreshToken')
            return NextResponse.json(
                { error: { code: 'auth.invalid_refresh_token' } },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({ where: { id: payload.userId } })
        if (!user) {
            // clear cookie and return not found response
            cookieStore.delete('refreshToken')
            return NextResponse.json({ error: { code: 'auth.user_not_found' } }, { status: 404 })
        }

        const newAccessToken = await signAccessToken({ userId: user.id, email: user.email })

        cookieStore.set({
            name: 'accessToken',
            value: newAccessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60,
        })

        return NextResponse.json({ accessToken: newAccessToken }, { status: 200 })
    } catch (err) {
        return NextResponse.json({ error: { code: 'server.error' } }, { status: 500 })
    }
}
