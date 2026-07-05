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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Bug, Columns3 } from 'lucide-react'

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
    }, [pid, reset])

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
        <div className="flex flex-col gap-6 max-w-lg">
            <Breadcrumb items={[
                { label: workspaceName || '...', href: `/workspaces/${workspaceId}/projects` },
                { label: t('project.breadcrumb_projects', 'Projects'), href: `/workspaces/${workspaceId}/projects` },
                { label: projectName || t('project.detail_title') },
            ]} />

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">{t('project.detail_title')}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/workspaces/${workspaceId}/projects/${pid}/issues`}>
                            <Bug className="size-4" />
                            Issues
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={`/workspaces/${workspaceId}/projects/${pid}/board`}>
                            <Columns3 className="size-4" />
                            Board
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t('project.edit_title', 'Edit project')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="name">{t('project.name_placeholder', 'Name')} <span className="text-destructive">*</span></Label>
                            <Input id="name" {...register('name')} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="description">{t('project.description_placeholder', 'Description')}</Label>
                            <Textarea id="description" {...register('description')} rows={3} />
                        </div>
                        <Button type="submit">{t('project.save_button')}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
