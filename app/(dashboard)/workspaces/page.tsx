'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

interface Workspace {
    id: string
    name: string
    description: string | null
}

export default function WorkspacesPage() {
    const { t } = useTranslation('workspace')
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])

    useEffect(() => {
        // Fetch the list of workspaces for the authenticated user
        fetch('/api/workspaces')
            .then(res => res.json())
            .then(data => {
                if (data.ok) setWorkspaces(data.workspaces)
            })
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
            {workspaces.length === 0 ? (
                <p className="text-muted-foreground">{t('workspace.empty')}</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {workspaces.map(ws => (
                        <li key={ws.id}>
                            <Link
                                href={`/workspaces/${ws.id}/settings`}
                                className="block border rounded p-4 hover:bg-muted"
                            >
                                <p className="font-medium">{ws.name}</p>
                                {ws.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {ws.description}
                                    </p>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
