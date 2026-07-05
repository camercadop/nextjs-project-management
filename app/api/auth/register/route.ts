import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema } from '@/lib/validators/auth'

export async function POST(req: Request) {
    try {
        if (process.env.NEXT_PUBLIC_REGISTRATION_ENABLED !== 'true') {
            return NextResponse.json({ error: { code: 'auth.registration_disabled' } }, { status: 403 })
        }

        const parsed = registerSchema.safeParse(await req.json())
        if (!parsed.success) {
            return NextResponse.json(
                { error: { code: 'auth.invalid_fields', details: parsed.error.flatten } },
                { status: 400 }
            )
        }
        const { email, password } = parsed.data

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (existingUser) {
            return NextResponse.json({ error: { code: 'auth.email_in_use' } }, { status: 400 })
        }

        const hashed = await hashPassword(password)
        const user = await prisma.user.create({
            data: { email: email.toLowerCase(), hashedPassword: hashed },
            select: { id: true, email: true },
        })

        return NextResponse.json({ ok: true, user }, { status: 201 })
    } catch {
        return NextResponse.json({ error: { code: 'server.error' } }, { status: 500 })
    }
}
