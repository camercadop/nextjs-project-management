'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { fetchAuth } from '@/lib/fetch-auth'
import { Spinner } from '@/components/ui/spinner'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useWorkspace } from '@/components/workspace-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { List } from 'lucide-react'

interface Issue {
    id: string
    title: string
    status: string
    priority: string
    assignee: { id: string; email: string } | null
}

const COLUMNS = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'] as const

const priorityColor: Record<string, string> = {
    LOW: 'bg-muted text-muted-foreground',
    MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function KanbanBoardPage() {
    const { id: workspaceId, pid } = useParams<{ id: string; pid: string }>()
    const { workspaceName } = useWorkspace()
    const { t } = useTranslation('issue')
    const { t: tProject } = useTranslation('project')
    const [issues, setIssues] = useState<Issue[]>([])
    const [loading, setLoading] = useState(true)
    const [projectName, setProjectName] = useState('')

    useEffect(() => {
        fetchAuth(`/api/projects/${pid}`)
            .then(res => res.json())
            .then(data => { if (data.ok) setProjectName(data.project.name) })
    }, [pid])

    useEffect(() => {
        fetchAuth(`/api/projects/${pid}/issues`)
            .then(res => res.json())
            .then(data => { if (data.ok) setIssues(data.issues) })
            .finally(() => setLoading(false))
    }, [pid])

    const getColumnIssues = useCallback(
        (status: string) => issues.filter(i => i.status === status),
        [issues]
    )

    const onDragEnd = async (result: DropResult) => {
        const { draggableId, destination } = result
        if (!destination) return

        const newStatus = destination.droppableId
        const issue = issues.find(i => i.id === draggableId)
        if (!issue || issue.status === newStatus) return

        // Optimistic update
        setIssues(prev => prev.map(i => i.id === draggableId ? { ...i, status: newStatus } : i))

        const res = await fetchAuth(`/api/issues/${draggableId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        })

        if (!res.ok) {
            // Revert on failure
            setIssues(prev => prev.map(i => i.id === draggableId ? { ...i, status: issue.status } : i))
            toast.error(t('issue.update_error'))
        }
    }

    if (loading) return <Spinner />

    return (
        <div className="flex flex-col gap-4 h-full">
            <Breadcrumb items={[
                { label: workspaceName || '...', href: `/workspaces/${workspaceId}/projects` },
                { label: tProject('project.breadcrumb_projects', 'Projects'), href: `/workspaces/${workspaceId}/projects` },
                { label: projectName || '...', href: `/workspaces/${workspaceId}/projects/${pid}` },
                { label: t('issue.board', 'Board') },
            ]} />

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">{t('issue.board', 'Board')}</h1>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/workspaces/${workspaceId}/projects/${pid}/issues`}>
                        <List className="size-4" />
                        Issues
                    </Link>
                </Button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
                    {COLUMNS.map(status => (
                        <div key={status} className="flex flex-col gap-2">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                                {t(`issue.status_${status.toLowerCase()}`)}
                                <span className="ml-1.5 text-xs">({getColumnIssues(status).length})</span>
                            </h2>
                            <Droppable droppableId={status}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={cn(
                                            'flex flex-col gap-2 p-2 rounded-lg border border-dashed min-h-[200px] transition-colors',
                                            snapshot.isDraggingOver && 'border-primary/50 bg-primary/5'
                                        )}
                                    >
                                        {getColumnIssues(status).map((issue, index) => (
                                            <Draggable key={issue.id} draggableId={issue.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps as React.HTMLAttributes<HTMLDivElement>}
                                                        {...provided.dragHandleProps as React.HTMLAttributes<HTMLDivElement>}
                                                    >
                                                        <Link href={`/workspaces/${workspaceId}/projects/${pid}/issues/${issue.id}`}>
                                                            <Card className={cn(
                                                                'transition-shadow hover:shadow-md',
                                                                snapshot.isDragging && 'shadow-lg rotate-2'
                                                            )}>
                                                                <CardContent className="p-3 flex flex-col gap-1.5">
                                                                    <span className="text-sm font-medium leading-tight">{issue.title}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', priorityColor[issue.priority])}>
                                                                            {issue.priority}
                                                                        </span>
                                                                        {issue.assignee && (
                                                                            <span className="text-[10px] text-muted-foreground truncate">
                                                                                {issue.assignee.email}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </Link>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    )
}
