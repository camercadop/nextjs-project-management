'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { updateIssueSchema } from '@/lib/validators/issue'
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
import { Select } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'

type FormData = z.infer<typeof updateIssueSchema>

interface HistoryEntry {
    id: string
    field: string
    oldValue: string | null
    newValue: string | null
    createdAt: string
}

export default function IssueDetailPage() {
    const { id: workspaceId, pid, issueId } = useParams<{ id: string; pid: string; issueId: string }>()
    const { workspaceName } = useWorkspace()
    const router = useRouter()
    const { t } = useTranslation('issue')
    const { t: tProject } = useTranslation('project')
    const [loading, setLoading] = useState(true)
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [projectName, setProjectName] = useState('')
    const [issueTitle, setIssueTitle] = useState('')

    const { register, handleSubmit, reset } = useForm<FormData>({
        resolver: zodResolver(updateIssueSchema),
    })

    useEffect(() => {
        fetchAuth(`/api/projects/${pid}`)
            .then(res => res.json())
            .then(data => { if (data.ok) setProjectName(data.project.name) })
    }, [pid])

    useEffect(() => {
        fetchAuth(`/api/issues/${issueId}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    reset({
                        title: data.issue.title,
                        description: data.issue.description ?? '',
                        status: data.issue.status,
                        priority: data.issue.priority,
                        assigneeId: data.issue.assigneeId,
                    })
                    setHistory(data.history)
                    setIssueTitle(data.issue.title)
                }
            })
            .finally(() => setLoading(false))
    }, [issueId, reset])

    const onSubmit = async (data: FormData) => {
        const res = await fetchAuth(`/api/issues/${issueId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            toast.success(t('issue.updated'))
            const updated = await fetchAuth(`/api/issues/${issueId}`).then(r => r.json())
            if (updated.ok) setHistory(updated.history)
        } else {
            toast.error(t('issue.update_error'))
        }
    }

    const onDelete = async () => {
        const res = await fetchAuth(`/api/issues/${issueId}`, { method: 'DELETE' })
        if (res.ok) {
            toast.success(t('issue.deleted'))
            router.push(`/workspaces/${workspaceId}/projects/${pid}/issues`)
        } else {
            toast.error(t('issue.delete_error'))
        }
    }

    if (loading) return <Spinner />

    return (
        <div className="flex flex-col gap-6 max-w-lg">
            <Breadcrumb items={[
                { label: workspaceName || '...', href: `/workspaces/${workspaceId}/projects` },
                { label: tProject('project.breadcrumb_projects', 'Projects'), href: `/workspaces/${workspaceId}/projects` },
                { label: projectName || '...', href: `/workspaces/${workspaceId}/projects/${pid}` },
                { label: 'Issues', href: `/workspaces/${workspaceId}/projects/${pid}/issues` },
                { label: issueTitle || t('issue.detail_title') },
            ]} />

            <Card>
                <CardHeader>
                    <CardTitle>{t('issue.detail_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="title">{t('issue.title_placeholder', 'Title')}</Label>
                            <Input id="title" {...register('title')} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="description">{t('issue.description_placeholder', 'Description')}</Label>
                            <Textarea id="description" {...register('description')} rows={3} />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex flex-col gap-1.5 flex-1">
                                <Label>{t('issue.status', 'Status')}</Label>
                                <Select {...register('status')}>
                                    <option value="BACKLOG">Backlog</option>
                                    <option value="TODO">Todo</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="DONE">Done</option>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-1.5 flex-1">
                                <Label>{t('issue.priority', 'Priority')}</Label>
                                <Select {...register('priority')}>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </Select>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit">{t('issue.save_button')}</Button>
                            <Button type="button" variant="destructive" onClick={onDelete}>
                                <Trash2 className="size-4" />
                                {t('issue.delete_button')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">{t('issue.history_title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <p className="text-muted-foreground text-sm">{t('issue.history_empty')}</p>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {history.map(entry => (
                                <li key={entry.id} className="flex items-start gap-2 text-sm">
                                    <div className="mt-1.5 size-2 rounded-full bg-muted-foreground/40 shrink-0" />
                                    <div>
                                        <span className="text-foreground">
                                            {t('issue.history_entry', {
                                                field: entry.field,
                                                oldValue: entry.oldValue ?? '-',
                                                newValue: entry.newValue ?? '-',
                                            })}
                                        </span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
