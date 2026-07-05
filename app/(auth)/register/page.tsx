'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { registerSchema } from '@/lib/validators/auth'
import { useTranslation } from 'react-i18next'
import { useRouter, redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UserPlus } from 'lucide-react'

const registrationEnabled = process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true'

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
    if (!registrationEnabled) redirect('/login')
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
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <UserPlus className="size-5" />
                    {t('auth.register_title')}
                </CardTitle>
                <CardDescription>{t('auth.register_subtitle', 'Create a new account')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">{t('auth.email_placeholder', 'Email')}</Label>
                        <Input id="email" {...register('email')} placeholder="you@example.com" />
                        {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password">{t('auth.password_placeholder', 'Password')}</Label>
                        <Input id="password" {...register('password')} type="password" placeholder="••••••••" />
                        {errors.password && <span className="text-destructive text-xs">{errors.password.message}</span>}
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                        {t('auth.register_button')}
                    </Button>
                    {error && (
                        <p className="text-destructive text-xs text-center">
                            <strong>{t('error_label')}: </strong>{error}
                        </p>
                    )}
                    <p className="text-center text-sm text-muted-foreground pt-2">
                        <Link href="/login" className="hover:text-foreground transition-colors">
                            {t('auth.link_login')}
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    )
}
