import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOtpSecret, getOtpQrUri, verifyOtp } from '@/lib/auth'
import { authMiddleware } from '@/lib/middleware/auth'
import { otpVerifySchema } from '@/lib/validators/auth'

export async function POST(req: Request) {
    const result = await authMiddleware(req)
    if (result instanceof Response) return result

    const { user } = result

    const secret = generateOtpSecret()
    await prisma.user.update({ where: { id: user.id }, data: { otpSecret: secret } })

    const uri = getOtpQrUri(user.email, secret)

    return NextResponse.json({ secret, uri })
}

export async function PATCH(req: Request) {
    const result = await authMiddleware(req)
    if (result instanceof Response) return result

    const { user } = result

    const parsed = otpVerifySchema.safeParse(await req.json())
    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'validation.invalid_input' } }, { status: 400 })
    }

    const { code } = parsed.data
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })

    if (!dbUser?.otpSecret || !verifyOtp(code, dbUser.otpSecret)) {
        return NextResponse.json({ error: { code: 'auth.invalid_otp' } }, { status: 400 })
    }

    await prisma.user.update({ where: { id: user.id }, data: { otpEnabled: true } })

    return NextResponse.json({ ok: true })
}
