'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/spinner'
import { fetchAuth } from '@/lib/fetch-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FolderKanban, Settings, ArrowRight, Layers } from 'lucide-react'

interface Workspace {
    id: string
    name: string
    description: string | null
}

export default function WorkspacesPage() {
    const { t, ready } = useTranslation('workspace')
    const router = useRouter()
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAuth('/api/workspaces')
            .then(res => res.json())
            .then(data => {
                if (data.ok) setWorkspaces(data.workspaces)
            })
            .finally(() => setLoading(false))
    }, [])

    if (!ready) return <Spinner />

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('workspace.title')}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {t('workspace.subtitle', 'Manage your team workspaces')}
                    </p>
                </div>
                <Button asChild>
                    <Link href="/workspaces/new">
                        <Plus className="size-4" />
                        {t('workspace.create_button')}
                    </Link>
                </Button>
            </div>
            {loading ? (
                <Spinner />
            ) : workspaces.length === 0 ? (
                <Card>
                    <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                        <Layers className="size-10 text-muted-foreground/50" />
                        <p className="text-muted-foreground">{t('workspace.empty')}</p>
                        <Button asChild size="sm" className="mt-2">
                            <Link href="/workspaces/new">
                                <Plus className="size-4" />
                                {t('workspace.create_button')}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {workspaces.map(ws => (
                        <Link key={ws.id} href={`/workspaces/${ws.id}/projects`} className="group">
                            <Card className="h-full transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 border-0 shadow-sm">
                                <CardContent className="p-5 flex flex-col gap-3">
                                    <div className="flex items-start justify-between">
                                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <FolderKanban className="size-4 text-primary" />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={e => {
                                                e.preventDefault()
                                                router.push(`/workspaces/${ws.id}/settings`)
                                            }}
                                        >
                                            <Settings className="size-3.5 text-muted-foreground" />
                                        </Button>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{ws.name}</p>
                                        {ws.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                {ws.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-2 border-t border-border/50">
                                        <span>{t('workspace.projects_link')}</span>
                                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
