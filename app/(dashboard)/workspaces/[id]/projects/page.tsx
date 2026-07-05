'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/spinner'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useWorkspace } from '@/components/workspace-context'
import { toast } from 'sonner'
import { fetchAuth } from '@/lib/fetch-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Archive, ArchiveRestore, Bug, LayoutDashboard, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createProjectSchema } from '@/lib/validators/project'

type FormData = z.infer<typeof createProjectSchema>

interface Project {
    id: string
    name: string
    description: string | null
    status: string
}

const COLUMNS = 'grid-cols-[1fr_auto_auto]'

export default function ProjectsPage() {
    const { id } = useParams<{ id: string }>()
    const { workspaceName } = useWorkspace()
    const { t } = useTranslation('project')
    const { t: tIssue } = useTranslation('issue')
    const [projects, setProjects] = useState<Project[]>([])
    const [tab, setTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE')
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)

    const { register, handleSubmit, reset } = useForm<FormData>({
        resolver: zodResolver(createProjectSchema),
    })

    const fetchProjects = () => {
        fetchAuth(`/api/workspaces/${id}/projects?status=${tab}`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) setProjects(data.projects)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        let ignore = false
        fetchAuth(`/api/workspaces/${id}/projects?status=${tab}`)
            .then(res => res.json())
            .then(data => {
                if (!ignore && data.ok) setProjects(data.projects)
            })
            .finally(() => {
                if (!ignore) setLoading(false)
            })
        return () => {
            ignore = true
        }
    }, [id, tab])

    const onCreate = async (data: FormData) => {
        const res = await fetchAuth(`/api/workspaces/${id}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            toast.success(t('project.created'))
            reset()
            setOpen(false)
            fetchProjects()
            return
        }
        toast.error(t('project.create_error'))
    }

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
            <Breadcrumb
                items={[
                    { label: workspaceName || '...', href: `/workspaces/${id}/projects` },
                    { label: t('project.breadcrumb_projects', 'Projects') },
                ]}
            />

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">{t('project.title')}</h1>
                    {!loading && (
                        <span className="text-sm text-muted-foreground">({projects.length})</span>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/workspaces/${id}/dashboard`}>
                            <LayoutDashboard className="size-4" />
                            Dashboard
                        </Link>
                    </Button>
                    <Button onClick={() => setOpen(true)}>
                        <Plus className="size-4" />
                        {t('project.create_button')}
                    </Button>
                </div>
            </div>

            <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                {(['ACTIVE', 'ARCHIVED'] as const).map(value => (
                    <button
                        key={value}
                        onClick={() => {
                            setTab(value)
                            setLoading(true)
                        }}
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
                    <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                        <FolderOpen className="size-10 text-muted-foreground/50" />
                        <p className="text-muted-foreground">{t('project.empty')}</p>
                        <Button size="sm" className="mt-2" onClick={() => setOpen(true)}>
                            <Plus className="size-4" />
                            {t('project.create_button')}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <div
                        className={cn(
                            'grid gap-x-4 px-4 py-2 border-b border-border text-xs font-medium text-muted-foreground',
                            COLUMNS
                        )}
                    >
                        <span>{t('project.name_placeholder')}</span>
                        <span>{tIssue('issue.title')}</span>
                        <span></span>
                    </div>
                    <div className="divide-y divide-border">
                        {projects.map(p => (
                            <Link
                                key={p.id}
                                href={`/workspaces/${id}/projects/${p.id}`}
                                className="block"
                            >
                                <div
                                    className={cn(
                                        'grid gap-x-4 items-center px-4 py-3 transition-colors hover:bg-muted/40',
                                        COLUMNS
                                    )}
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{p.name}</p>
                                        {p.description && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {p.description}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <Link href={`/workspaces/${id}/projects/${p.id}/issues`}>
                                            <Bug className="size-3.5" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                        onClick={e => {
                                            e.preventDefault()
                                            onArchive(p.id)
                                        }}
                                        title={
                                            tab === 'ACTIVE'
                                                ? t('project.archive_button')
                                                : t('project.unarchive_button')
                                        }
                                    >
                                        {tab === 'ACTIVE' ? (
                                            <Archive className="size-3.5 text-muted-foreground" />
                                        ) : (
                                            <ArchiveRestore className="size-3.5 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>
            )}

            {!loading && (
                <p className="text-xs text-muted-foreground text-right">
                    {t('project.count', { count: projects.length })}
                </p>
            )}

            <Dialog
                open={open}
                onOpenChange={v => {
                    setOpen(v)
                    if (!v) reset()
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('project.create_title')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onCreate)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="proj-name">
                                {t('project.name_placeholder')}{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="proj-name"
                                {...register('name')}
                                placeholder={t('project.name_placeholder')}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="proj-desc">
                                {t('project.description_placeholder')}
                            </Label>
                            <Textarea
                                id="proj-desc"
                                {...register('description')}
                                placeholder={t('project.description_placeholder')}
                                rows={3}
                            />
                        </div>
                        <Button type="submit">{t('project.create_button')}</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
