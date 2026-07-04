'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { createProjectSchema } from '@/lib/validators/project'
import { fetchAuth } from '@/lib/fetch-auth'

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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 max-w-lg">
            <h1 className="text-2xl font-bold">{t('project.create_title')}</h1>
            <input
                {...register('name')}
                placeholder={t('project.name_placeholder')}
                className="border rounded px-3 py-2"
            />
            <textarea
                {...register('description')}
                placeholder={t('project.description_placeholder')}
                className="border rounded px-3 py-2"
                rows={3}
            />
            <button type="submit" className="bg-primary text-primary-foreground rounded px-3 py-2">
                {t('project.create_button')}
            </button>
        </form>
    )
}
