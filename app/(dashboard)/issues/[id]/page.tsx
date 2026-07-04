'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { updateIssueSchema } from '@/lib/validators/issue'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { fetchAuth } from '@/lib/fetch-auth'

type FormData = z.infer<typeof updateIssueSchema>

interface HistoryEntry {
    id: string
    field: string
    oldValue: string | null
    newValue: string | null
    createdAt: string
}

export default function IssueDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { t } = useTranslation('issue')
    const [loading, setLoading] = useState(true)
    const [history, setHistory] = useState<HistoryEntry[]>([])
    const [projectId, setProjectId] = useState('')

    const { register, handleSubmit, reset } = useForm<FormData>({
        resolver: zodResolver(updateIssueSchema),
    })

    useEffect(() => {
        fetchAuth(`/api/issues/${id}`)
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
                    setProjectId(data.issue.projectId)
                }
            })
            .finally(() => setLoading(false))
    }, [id])

    const onSubmit = async (data: FormData) => {
        const res = await fetchAuth(`/api/issues/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            toast.success(t('issue.updated'))
            const updated = await fetchAuth(`/api/issues/${id}`).then(r => r.json())
            if (updated.ok) setHistory(updated.history)
        } else {
            toast.error(t('issue.update_error'))
        }
    }

    const onDelete = async () => {
        const res = await fetchAuth(`/api/issues/${id}`, { method: 'DELETE' })
        if (res.ok) {
            toast.success(t('issue.deleted'))
            router.push(`/projects/${projectId}/issues`)
        } else {
            toast.error(t('issue.delete_error'))
        }
    }

    if (loading) return <Spinner />

    return (
        <div className="flex flex-col gap-6 max-w-lg">
            {projectId && (
                <a href={`/projects/${projectId}/issues`} className="text-sm text-muted-foreground">
                    ← {t('issue.back')}
                </a>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
                <h1 className="text-2xl font-bold">{t('issue.detail_title')}</h1>
                <input
                    {...register('title')}
                    placeholder={t('issue.title_placeholder')}
                    className="border rounded px-3 py-2"
                />
                <textarea
                    {...register('description')}
                    placeholder={t('issue.description_placeholder')}
                    className="border rounded px-3 py-2"
                    rows={3}
                />
                <div className="flex gap-2">
                    <select {...register('status')} className="border rounded px-2 py-1 text-sm">
                        <option value="BACKLOG">Backlog</option>
                        <option value="TODO">Todo</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                    <select {...register('priority')} className="border rounded px-2 py-1 text-sm">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="bg-primary text-primary-foreground rounded px-3 py-2">
                        {t('issue.save_button')}
                    </button>
                    <button type="button" onClick={onDelete} className="text-red-500 rounded px-3 py-2">
                        {t('issue.delete_button')}
                    </button>
                </div>
            </form>

            {/* History */}
            <section className="flex flex-col gap-2">
                <h2 className="text-lg font-bold">{t('issue.history_title')}</h2>
                {history.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t('issue.history_empty')}</p>
                ) : (
                    <ul className="flex flex-col gap-1 text-sm">
                        {history.map(entry => (
                            <li key={entry.id} className="text-muted-foreground">
                                {t('issue.history_entry', {
                                    field: entry.field,
                                    oldValue: entry.oldValue ?? '-',
                                    newValue: entry.newValue ?? '-',
                                })}
                                <span className="ml-2 text-xs">
                                    {new Date(entry.createdAt).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}
