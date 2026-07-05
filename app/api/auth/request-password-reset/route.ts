import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/email'
import { t } from '@/lib/i18n-server'
import { requestPasswordResetSchema } from '@/lib/validators/auth'

export async function POST(req: Request) {
    try {
        const parsedData = requestPasswordResetSchema.safeParse(await req.json())

        if (!parsedData.success) {
            return NextResponse.json({ error: { code: 'auth.email_required' } }, { status: 400 })
        }

        const { email } = parsedData.data

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
        if (!user) {
            return NextResponse.json({ error: { code: 'auth.user_not_found' } }, { status: 404 })
        }

        const token = crypto.randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        await prisma.user.update({
            where: { email },
            data: {
                resetToken: token,
                resetTokenExpiry: expires,
            },
        })

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const resetLink = `${appUrl}/reset-password?token=${token}`

        const subject = t('auth.email_reset_subject')
        const html =
            '<p>' +
            t('auth.email_reset_message') +
            '</p><p><a href="' +
            resetLink +
            '">' +
            t('auth.email_reset_link') +
            '</a></p>'

        try {
            await sendMail(email, subject, html)
        } catch (e) {
            console.error('Password reset email send failed', e)
        }

        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ error: { code: 'server.error' } }, { status: 500 })
    }
}
