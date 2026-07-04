'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { requestPasswordResetSchema } from '@/lib/validators/auth'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, CheckCircle } from 'lucide-react'

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
        toast.success(t('auth.reset_email_sent'))
    }

    if (sent) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                    <CheckCircle className="size-10 text-green-500" />
                    <p className="text-sm text-muted-foreground">Check your email for the reset link.</p>
                    <Button variant="outline" asChild>
                        <Link href="/login">{t('auth.link_login')}</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <Mail className="size-5" />
                    {t('auth.forgot_password_title')}
                </CardTitle>
                <CardDescription>{t('auth.forgot_subtitle', 'We\'ll send you a reset link')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="email">{t('auth.email_placeholder', 'Email')}</Label>
                        <Input id="email" {...register('email')} placeholder="you@example.com" />
                        {errors.email && <span className="text-destructive text-xs">{errors.email.message}</span>}
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                        {t('auth.reset_button')}
                    </Button>
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
