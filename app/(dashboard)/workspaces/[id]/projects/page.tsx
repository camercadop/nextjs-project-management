'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/spinner'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useWorkspace } from '@/components/workspace-context'
import { toast } from 'sonner'
import { fetchAuth } from '@/lib/fetch-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Archive, ArchiveRestore, Bug, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Project {
    id: string
    name: string
    description: string | null
    status: string
}

export default function ProjectsPage() {
    const { id } = useParams<{ id: string }>()
    const { workspaceName } = useWorkspace()
    const { t } = useTranslation('project')
    const [projects, setProjects] = useState<Project[]>([])
    const [tab, setTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let stale = false
        fetchAuth(`/api/workspaces/${id}/projects?status=${tab}`)
            .then(res => res.json())
            .then(data => { if (!stale && data.ok) setProjects(data.projects) })
            .finally(() => { if (!stale) setLoading(false) })
        return () => { stale = true }
    }, [id, tab])

    const onArchive = async (projectId: string) => {
        const res = await fetchAuth(`/api/projects/${projectId}/archive`, { method: 'PATCH' })
        if (res.ok) {
            toast.success(t('project.archived'))
            setProjects(prev => prev.filter(p => p.id !== projectId))
        } else {
            toast.error(t('project.archive_error'))
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <Breadcrumb items={[
                { label: workspaceName || '...', href: `/workspaces/${id}/projects` },
                { label: t('project.breadcrumb_projects', 'Projects') },
            ]} />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">{t('project.title')}</h1>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/workspaces/${id}/dashboard`}>
                            <LayoutDashboard className="size-4" />
                            Dashboard
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href={`/workspaces/${id}/projects/new`}>
                            <Plus className="size-4" />
                            {t('project.create_button')}
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                {(['ACTIVE', 'ARCHIVED'] as const).map(value => (
                    <button
                        key={value}
                        onClick={() => { setTab(value); setLoading(true) }}
                        className={cn(
                            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                            tab === value
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {value === 'ACTIVE' ? t('project.tab_active') : t('project.tab_archived')}
                    </button>
                ))}
            </div>

            {loading ? (
                <Spinner />
            ) : projects.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        {t('project.empty')}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {projects.map(p => (
                        <Card key={p.id}>
                            <CardContent className="flex justify-between items-center py-4">
                                <Link href={`/workspaces/${id}/projects/${p.id}`} className="hover:underline">
                                    <p className="font-medium">{p.name}</p>
                                    {p.description && (
                                        <p className="text-sm text-muted-foreground mt-0.5">{p.description}</p>
                                    )}
                                </Link>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/workspaces/${id}/projects/${p.id}/issues`}>
                                            <Bug className="size-4" />
                                            Issues
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => onArchive(p.id)}>
                                        {tab === 'ACTIVE'
                                            ? <><Archive className="size-4" />{t('project.archive_button')}</>
                                            : <><ArchiveRestore className="size-4" />{t('project.unarchive_button')}</>
                                        }
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
