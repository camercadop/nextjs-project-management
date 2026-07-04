'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/spinner'
import { fetchAuth } from '@/lib/fetch-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FolderKanban, Settings } from 'lucide-react'

interface Workspace {
    id: string
    name: string
    description: string | null
}

export default function WorkspacesPage() {
    const { t } = useTranslation('workspace')
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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">{t('workspace.title')}</h1>
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
                    <CardContent className="py-12 text-center text-muted-foreground">
                        {t('workspace.empty')}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {workspaces.map(ws => (
                        <Card key={ws.id}>
                            <CardContent className="flex justify-between items-center py-4">
                                <div>
                                    <p className="font-medium">{ws.name}</p>
                                    {ws.description && (
                                        <p className="text-sm text-muted-foreground mt-0.5">{ws.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/workspaces/${ws.id}/projects`}>
                                            <FolderKanban className="size-4" />
                                            {t('workspace.projects_link')}
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/workspaces/${ws.id}/settings`}>
                                            <Settings className="size-4" />
                                        </Link>
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
