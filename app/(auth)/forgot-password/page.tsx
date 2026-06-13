'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { requestPasswordResetSchema } from '@/lib/validators/auth'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

type ForgotForm = z.infer<typeof requestPasswordResetSchema>

export default function ForgotPasswordPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotForm>({
        resolver: zodResolver(requestPasswordResetSchema),
    })
    const { t } = useTranslation('auth')
    const [sent, setSent] = useState(false)

    const onSubmit = async (data: ForgotForm) => {
        await fetch('/api/auth/request-password-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        setSent(true)
    }

    if (sent) {
        return (
            <div className="flex flex-col gap-4 text-center">
                <p>✅ Check your email for the reset link.</p>
                <Link href="/login" className="text-sm underline">
                    {t('auth.link_login')}
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center">{t('auth.forgot_password_title')}</h1>
            <input
                {...register('email')}
                placeholder={t('auth.email_placeholder')}
                className="border rounded px-3 py-2"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground rounded px-3 py-2"
            >
                {t('auth.reset_button')}
            </button>
            <Link href="/login" className="text-sm underline text-center">
                {t('auth.link_login')}
            </Link>
        </form>
    )
}
