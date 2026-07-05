'use client'

import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useWorkspace } from '@/components/workspace-context'

export default function DashboardPage() {
    const { id } = useParams<{ id: string }>()
    const { workspaceName } = useWorkspace()
    const { t } = useTranslation('dashboard')

    return (
        <div className="flex flex-col gap-2">
            <Breadcrumb items={[
                { label: workspaceName || '...', href: `/workspaces/${id}/projects` },
                { label: t('dashboard.title', 'Dashboard') },
            ]} />
            <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title', 'Dashboard')}</h1>
        </div>
    )
}
