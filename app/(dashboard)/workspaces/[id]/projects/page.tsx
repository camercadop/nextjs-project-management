'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { fetchAuth } from '@/lib/fetch-auth'

interface Project {
    id: string
    name: string
    description: string | null
    status: string
}

export default function ProjectsPage() {
    const { id } = useParams<{ id: string }>()
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
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('project.title')}</h1>
                <Link
                    href={`/workspaces/${id}/projects/new`}
                    className="bg-primary text-primary-foreground rounded px-4 py-2"
                >
                    {t('project.create_button')}
                </Link>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => { setTab('ACTIVE'); setLoading(true) }}
                    className={`px-3 py-1 rounded ${tab === 'ACTIVE' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                    {t('project.tab_active')}
                </button>
                <button
                    onClick={() => { setTab('ARCHIVED'); setLoading(true) }}
                    className={`px-3 py-1 rounded ${tab === 'ARCHIVED' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                    {t('project.tab_archived')}
                </button>
            </div>

            {loading ? (
                <Spinner />
            ) : projects.length === 0 ? (
                <p className="text-muted-foreground">{t('project.empty')}</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {projects.map(p => (
                        <li key={p.id} className="flex justify-between items-center border rounded p-4">
                            <Link href={`/projects/${p.id}`} className="hover:underline">
                                <p className="font-medium">{p.name}</p>
                                {p.description && (
                                    <p className="text-sm text-muted-foreground">{p.description}</p>
                                )}
                            </Link>
                            <button
                                onClick={() => onArchive(p.id)}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                {tab === 'ACTIVE' ? t('project.archive_button') : t('project.unarchive_button')}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
