'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { updateProjectSchema } from '@/lib/validators/project'
import { Spinner } from '@/components/ui/spinner'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useWorkspace } from '@/components/workspace-context'
import { toast } from 'sonner'
import { fetchAuth } from '@/lib/fetch-auth'

type FormData = z.infer<typeof updateProjectSchema>

export default function ProjectDetailPage() {
    const { id: workspaceId, pid } = useParams<{ id: string; pid: string }>()
    const { workspaceName } = useWorkspace()
    const { t } = useTranslation('project')
    const { register, handleSubmit, reset } = useForm<FormData>({
        resolver: zodResolver(updateProjectSchema),
    })
    const [loading, setLoading] = useState(true)
    const [projectName, setProjectName] = useState('')

    useEffect(() => {
        fetchAuth(`/api/projects/${pid}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    reset({ name: data.project.name, description: data.project.description ?? '' })
                    setProjectName(data.project.name)
                }
            })
            .finally(() => setLoading(false))
    }, [pid])

    const onSubmit = async (data: FormData) => {
        const res = await fetchAuth(`/api/projects/${pid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) toast.success(t('project.updated'))
        else toast.error(t('project.update_error'))
    }

    if (loading) return <Spinner />

    return (
        <div className="flex flex-col gap-3 max-w-lg">
            <Breadcrumb items={[
                { label: workspaceName || '...', href: `/workspaces/${workspaceId}/projects` },
                { label: t('project.breadcrumb_projects', 'Projects'), href: `/workspaces/${workspaceId}/projects` },
                { label: projectName || t('project.detail_title') },
            ]} />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('project.detail_title')}</h1>
                <Link href={`/workspaces/${workspaceId}/projects/${pid}/issues`} className="text-sm text-primary hover:underline">
                    Issues →
                </Link>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
        </div>
    )
}
