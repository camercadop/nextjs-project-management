'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { updateProjectSchema } from '@/lib/validators/project'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { fetchAuth } from '@/lib/fetch-auth'

type FormData = z.infer<typeof updateProjectSchema>

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>()
    const { t } = useTranslation('project')
    const { register, handleSubmit, reset } = useForm<FormData>({
        resolver: zodResolver(updateProjectSchema),
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAuth(`/api/projects/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) reset({ name: data.project.name, description: data.project.description ?? '' })
            })
            .finally(() => setLoading(false))
    }, [id])

    const onSubmit = async (data: FormData) => {
        const res = await fetchAuth(`/api/projects/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) toast.success(t('project.updated'))
        else toast.error(t('project.update_error'))
    }

    if (loading) return <Spinner />

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 max-w-lg">
            <h1 className="text-2xl font-bold">{t('project.detail_title')}</h1>
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
                {t('project.save_button')}
            </button>
        </form>
    )
}
