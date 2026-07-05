'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { loginSchema } from '@/lib/validators/auth'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { LogIn } from 'lucide-react'

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
        if (json.ok) {
            toast.success(t('auth.login_success'))
            router.push('/workspaces')
        } else {
            toast.error(json.error?.code || t('auth.login_error'))
        }
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <LogIn className="size-5" />
                    {t('auth.login_title')}
                </CardTitle>
                <CardDescription>
                    {t('auth.login_subtitle', 'Sign in to your account')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" {...register('email')} placeholder="you@example.com" />
                        {errors.email && (
                            <span className="text-destructive text-xs">{errors.email.message}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <span className="text-destructive text-xs">
                                {errors.password.message}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="otp">OTP ({t('auth.otp_optional', 'if enabled')})</Label>
                        <Input id="otp" {...register('otp')} placeholder="123456" />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                        {isSubmitting
                            ? t('auth.loading', 'Loading...')
                            : t('auth.login_button', 'Login')}
                    </Button>
                    <div className="flex justify-between text-sm text-muted-foreground pt-2">
                        {process.env.NEXT_PUBLIC_REGISTRATION_ENABLED === 'true' && (
                            <Link href="/register" className="hover:text-foreground transition-colors">
                                {t('auth.link_register')}
                            </Link>
                        )}
                        <Link
                            href="/forgot-password"
                            className="hover:text-foreground transition-colors"
                        >
                            {t('auth.link_forgot')}
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
