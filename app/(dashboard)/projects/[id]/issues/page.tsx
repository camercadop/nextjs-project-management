'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { createIssueSchema } from '@/lib/validators/issue'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { fetchAuth } from '@/lib/fetch-auth'

type CreateForm = z.infer<typeof createIssueSchema>

interface Issue {
    id: string
    title: string
    status: string
    priority: string
    assignee: { id: string; email: string } | null
}

export default function ProjectIssuesPage() {
    const { id: projectId } = useParams<{ id: string }>()
    const { t } = useTranslation('issue')
    const [issues, setIssues] = useState<Issue[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('')
    const [filterPriority, setFilterPriority] = useState('')

    const { register, handleSubmit, reset } = useForm<CreateForm>({
        resolver: zodResolver(createIssueSchema),
    })

    const fetchIssues = async () => {
        const params = new URLSearchParams()
        if (filterStatus) params.set('status', filterStatus)
        if (filterPriority) params.set('priority', filterPriority)
        const res = await fetchAuth(`/api/projects/${projectId}/issues?${params}`)
        const data = await res.json()
        if (data.ok) setIssues(data.issues)
    }

    useEffect(() => {
        fetchIssues().finally(() => setLoading(false))
    }, [projectId, filterStatus, filterPriority])

    const onCreate = async (data: CreateForm) => {
        const res = await fetchAuth(`/api/projects/${projectId}/issues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            toast.success(t('issue.created'))
            reset()
            fetchIssues()
        } else {
            toast.error(t('issue.create_error'))
        }
    }

    if (loading) return <Spinner />

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            <h1 className="text-2xl font-bold">{t('issue.title')}</h1>

            {/* Filters */}
            <div className="flex gap-2">
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                >
                    <option value="">{t('issue.status')}: All</option>
                    <option value="BACKLOG">Backlog</option>
                    <option value="TODO">Todo</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                </select>
                <select
                    value={filterPriority}
                    onChange={e => setFilterPriority(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                >
                    <option value="">{t('issue.priority')}: All</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                </select>
            </div>

            {/* Issue list */}
            {issues.length === 0 ? (
                <p className="text-muted-foreground">{t('issue.empty')}</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {issues.map(issue => (
                        <li key={issue.id} className="border rounded p-3">
                            <Link href={`/issues/${issue.id}`} className="flex justify-between items-center">
                                <span className="font-medium">{issue.title}</span>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                    <span>{issue.status}</span>
                                    <span>{issue.priority}</span>
                                    <span>{issue.assignee?.email ?? t('issue.unassigned')}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {/* Create form */}
            <form onSubmit={handleSubmit(onCreate)} className="flex flex-col gap-3 border-t pt-4">
                <h2 className="text-lg font-bold">{t('issue.create_title')}</h2>
                <input
                    {...register('title')}
                    placeholder={t('issue.title_placeholder')}
                    className="border rounded px-3 py-2"
                />
                <textarea
                    {...register('description')}
                    placeholder={t('issue.description_placeholder')}
                    className="border rounded px-3 py-2"
                    rows={2}
                />
                <div className="flex gap-2">
                    <select {...register('priority')} className="border rounded px-2 py-1 text-sm">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                    <select {...register('status')} className="border rounded px-2 py-1 text-sm">
                        <option value="BACKLOG">Backlog</option>
                        <option value="TODO">Todo</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>
                <button type="submit" className="bg-primary text-primary-foreground rounded px-3 py-2 self-start">
                    {t('issue.create_button')}
                </button>
            </form>
        </div>
    )
}
