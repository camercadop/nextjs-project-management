import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { resetPasswordSchema } from '@/lib/validators/auth'

export async function POST(req: Request) {
    const parsedData = resetPasswordSchema.safeParse(await req.json())
    if (!parsedData.success) {
        return NextResponse.json({ error: { code: 'auth.invalid_fields' } }, { status: 400 })
    }
    const { token, password } = parsedData.data

    const user = await prisma.user.findUnique({ where: { resetToken: token } })

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return NextResponse.json(
            { error: { code: 'auth.invalid_or_expired_token' } },
            { status: 400 }
        )
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            hashedPassword: await hashPassword(password),
            resetToken: null,
            resetTokenExpiry: null,
        },
    })

    return NextResponse.json({ ok: true })
}
