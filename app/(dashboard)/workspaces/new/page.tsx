'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createWorkspaceSchema } from '@/lib/validators/workspace'
import { fetchAuth } from '@/lib/fetch-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type FormData = z.infer<typeof createWorkspaceSchema>

export default function NewWorkspacePage() {
    const { t } = useTranslation('workspace')
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({ resolver: zodResolver(createWorkspaceSchema) })

    const onSubmit = async (data: FormData) => {
        const res = await fetchAuth('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const json = await res.json()
        if (json.ok) {
            toast.success(t('workspace.created'))
            router.push('/workspaces')
        } else {
            toast.error(json.error?.code || t('workspace.create_error'))
        }
    }

    return (
        <div className="max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle>{t('workspace.create_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">{t('workspace.name_placeholder', 'Name')}</Label>
                            <Input id="name" {...register('name')} placeholder={t('workspace.name_placeholder')} />
                            {errors.name && <span className="text-destructive text-xs">{errors.name.message}</span>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="description">{t('workspace.description_placeholder', 'Description')}</Label>
                            <Textarea id="description" {...register('description')} placeholder={t('workspace.description_placeholder')} rows={3} />
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="mt-2">
                            {t('workspace.create_button')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
