'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { registerSchema } from '@/lib/validators/auth'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    })
    const { t } = useTranslation('auth')
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)

    const onSubmit = async (data: RegisterForm) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (json.ok) {
            toast.success(t('auth.register_success'))
            router.push('/login')
        } else {
            const msg = json.error.code || t('auth.register_error')
            setError(msg)
            toast.error(msg)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center">{t('auth.register_title')}</h1>
            <input
                {...register('email')}
                placeholder={t('auth.email_placeholder')}
                className="border rounded px-3 py-2"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            <input
                {...register('password')}
                type="password"
                placeholder={t('auth.password_placeholder')}
                className="border rounded px-3 py-2"
            />
            {errors.password && (
                <span className="text-red-500 text-sm">{errors.password.message}</span>
            )}
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground rounded px-3 py-2"
            >
                {t('auth.register_button')}
            </button>
            {error && (
                <span className="text-red-500 text-sm text-center">
                    <strong>{t('error_label')}: </strong>
                    {error}
                </span>
            )}
            <Link href="/login" className="text-sm underline text-center">
                {t('auth.link_login')}
            </Link>
        </form>
    )
}
