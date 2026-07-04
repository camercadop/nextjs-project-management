'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createProjectSchema } from '@/lib/validators/project'
import { fetchAuth } from '@/lib/fetch-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type FormData = z.infer<typeof createProjectSchema>

export default function NewProjectPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { t } = useTranslation('project')
    const { register, handleSubmit } = useForm<FormData>({
        resolver: zodResolver(createProjectSchema),
    })

    const onSubmit = async (data: FormData) => {
        const res = await fetchAuth(`/api/workspaces/${id}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            toast.success(t('project.created'))
            router.push(`/workspaces/${id}/projects`)
        } else {
            toast.error(t('project.create_error'))
        }
    }

    return (
        <div className="max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle>{t('project.create_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">{t('project.name_placeholder', 'Name')}</Label>
                            <Input id="name" {...register('name')} placeholder={t('project.name_placeholder')} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="description">{t('project.description_placeholder', 'Description')}</Label>
                            <Textarea id="description" {...register('description')} placeholder={t('project.description_placeholder')} rows={3} />
                        </div>
                        <Button type="submit" className="mt-2">
                            {t('project.create_button')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
