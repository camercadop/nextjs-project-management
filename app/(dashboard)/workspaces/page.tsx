'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/spinner'
import { fetchAuth } from '@/lib/fetch-auth'

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
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('workspace.title')}</h1>
                <Link
                    href="/workspaces/new"
                    className="bg-primary text-primary-foreground rounded px-4 py-2"
                >
                    {t('workspace.create_button')}
                </Link>
            </div>
            {loading ? (
                <Spinner />
            ) : workspaces.length === 0 ? (
                <p className="text-muted-foreground">{t('workspace.empty')}</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {workspaces.map(ws => (
                        <li key={ws.id} className="border rounded p-4 flex justify-between items-center">
                            <div>
                                <p className="font-medium">{ws.name}</p>
                                {ws.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {ws.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3 text-sm">
                                <Link href={`/workspaces/${ws.id}/projects`} className="text-primary hover:underline">
                                    {t('workspace.projects_link')}
                                </Link>
                                <Link href={`/workspaces/${ws.id}/settings`} className="text-muted-foreground hover:underline">
                                    {t('workspace.settings_link')}
                                </Link>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
