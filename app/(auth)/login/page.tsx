'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { loginSchema } from '@/lib/validators/auth'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })
    const { t } = useTranslation('auth')
    const router = useRouter()

    const onSubmit = async (data: LoginForm) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (json.ok) router.push('/dashboard')
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-center">{t('auth.login_title')}</h1>
            <input
                {...register('email')}
                placeholder="Email"
                className="border rounded px-3 py-2"
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            <input
                {...register('password')}
                type="password"
                placeholder="Password"
                className="border rounded px-3 py-2"
            />
            {errors.password && (
                <span className="text-red-500 text-sm">{errors.password.message}</span>
            )}
            <input
                {...register('otp')}
                placeholder="OTP (if enabled)"
                className="border rounded px-3 py-2"
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground rounded px-3 py-2"
            >
                {t(isSubmitting ? 'Loading...' : 'Login')}
            </button>
            <div className="flex justify-between text-sm">
                <Link href="/register" className="underline">
                    {t('auth.link_register')}
                </Link>
                <Link href="/forgot-password" className="underline">
                    {t('auth.link_forgot')}
                </Link>
            </div>
        </form>
    )
}
