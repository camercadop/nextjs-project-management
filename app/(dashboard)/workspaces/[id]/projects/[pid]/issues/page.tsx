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
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useWorkspace } from '@/components/workspace-context'
import { Columns3 } from 'lucide-react'
import { toast } from 'sonner'
import { fetchAuth } from '@/lib/fetch-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

type CreateForm = z.infer<typeof createIssueSchema>

interface Issue {
    id: string
    title: string
    status: string
    priority: string
    assignee: { id: string; email: string } | null
}

const priorityColor: Record<string, string> = {
    LOW: 'bg-muted text-muted-foreground',
    MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function ProjectIssuesPage() {
    const { id: workspaceId, pid } = useParams<{ id: string; pid: string }>()
    const { workspaceName } = useWorkspace()
    const { t } = useTranslation('issue')
    const { t: tProject } = useTranslation('project')
    const [issues, setIssues] = useState<Issue[]>([])
    const [loading, setLoading] = useState(true)
    const [projectName, setProjectName] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterPriority, setFilterPriority] = useState('')

    const { register, handleSubmit, reset } = useForm<CreateForm>({
        resolver: zodResolver(createIssueSchema),
    })

    useEffect(() => {
        fetchAuth(`/api/projects/${pid}`)
            .then(res => res.json())
            .then(data => { if (data.ok) setProjectName(data.project.name) })
    }, [pid])

    const fetchIssues = async () => {
        const params = new URLSearchParams()
        if (filterStatus) params.set('status', filterStatus)
        if (filterPriority) params.set('priority', filterPriority)
        const res = await fetchAuth(`/api/projects/${pid}/issues?${params}`)
        const data = await res.json()
        if (data.ok) setIssues(data.issues)
    }

    useEffect(() => {
        let ignore = false
        const load = async () => {
            const params = new URLSearchParams()
            if (filterStatus) params.set('status', filterStatus)
            if (filterPriority) params.set('priority', filterPriority)
            const res = await fetchAuth(`/api/projects/${pid}/issues?${params}`)
            const data = await res.json()
            if (!ignore) {
                if (data.ok) setIssues(data.issues)
                setLoading(false)
            }
        }
        load()
        return () => { ignore = true }
    }, [pid, filterStatus, filterPriority])

    const onCreate = async (data: CreateForm) => {
        const res = await fetchAuth(`/api/projects/${pid}/issues`, {
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
            <Breadcrumb items={[
                { label: workspaceName || '...', href: `/workspaces/${workspaceId}/projects` },
                { label: tProject('project.breadcrumb_projects', 'Projects'), href: `/workspaces/${workspaceId}/projects` },
                { label: projectName || '...', href: `/workspaces/${workspaceId}/projects/${pid}` },
                { label: 'Issues' },
            ]} />

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">{t('issue.title')}</h1>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/workspaces/${workspaceId}/projects/${pid}/board`}>
                        <Columns3 className="size-4" />
                        {t('issue.board', 'Board')}
                    </Link>
                </Button>
            </div>

            <div className="flex gap-2">
                <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">{t('issue.status')}: {t('issue.status_all')}</option>
                    <option value="BACKLOG">{t('issue.status_backlog')}</option>
                    <option value="TODO">{t('issue.status_todo')}</option>
                    <option value="IN_PROGRESS">{t('issue.status_in_progress')}</option>
                    <option value="DONE">{t('issue.status_done')}</option>
                </Select>
                <Select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                    <option value="">{t('issue.priority')}: {t('issue.priority_all')}</option>
                    <option value="LOW">{t('issue.priority_low')}</option>
                    <option value="MEDIUM">{t('issue.priority_medium')}</option>
                    <option value="HIGH">{t('issue.priority_high')}</option>
                    <option value="CRITICAL">{t('issue.priority_critical')}</option>
                </Select>
            </div>

            {issues.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        {t('issue.empty')}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-2">
                    {issues.map(issue => (
                        <Link key={issue.id} href={`/workspaces/${workspaceId}/projects/${pid}/issues/${issue.id}`}>
                            <Card className="transition-colors hover:bg-muted/30">
                                <CardContent className="flex justify-between items-center py-3">
                                    <span className="font-medium text-sm">{issue.title}</span>
                                    <div className="flex gap-2 items-center">
                                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', priorityColor[issue.priority] || 'bg-muted')}>
                                            {issue.priority}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{issue.status}</span>
                                        <span className="text-xs text-muted-foreground">{issue.assignee?.email ?? t('issue.unassigned')}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            <Separator />

            <Collapsible>
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer">
                            <CardTitle className="text-base flex items-center justify-between">
                                {t('issue.create_title')}
                                <ChevronDown className="size-4 transition-transform [[data-state=open]>&]:rotate-180" />
                            </CardTitle>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent>
                            <form onSubmit={handleSubmit(onCreate)} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="issue-title">{t('issue.title_placeholder', 'Title')}</Label>
                                    <Input id="issue-title" {...register('title')} placeholder={t('issue.title_placeholder')} />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="issue-desc">{t('issue.description_placeholder', 'Description')}</Label>
                                    <Textarea id="issue-desc" {...register('description')} placeholder={t('issue.description_placeholder')} rows={2} />
                                </div>
                                <div className="flex gap-2">
                                    <Select {...register('priority')}>
                                        <option value="LOW">{t('issue.priority_low')}</option>
                                        <option value="MEDIUM">{t('issue.priority_medium')}</option>
                                        <option value="HIGH">{t('issue.priority_high')}</option>
                                        <option value="CRITICAL">{t('issue.priority_critical')}</option>
                                    </Select>
                                    <Select {...register('status')}>
                                        <option value="BACKLOG">{t('issue.status_backlog')}</option>
                                        <option value="TODO">{t('issue.status_todo')}</option>
                                        <option value="IN_PROGRESS">{t('issue.status_in_progress')}</option>
                                        <option value="DONE">{t('issue.status_done')}</option>
                                    </Select>
                                </div>
                                <Button type="submit" className="self-start">
                                    {t('issue.create_button')}
                                </Button>
                            </form>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        </div>
    )
}
