import { Suspense } from 'react'
import { Spinner } from '@/components/ui/spinner'

export default function DashboardLayout({
    children,
    stats,
    charts,
    assignees,
    activity,
}: {
    children: React.ReactNode
    stats: React.ReactNode
    charts: React.ReactNode
    assignees: React.ReactNode
    activity: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-6">
            {children}
            <Suspense fallback={<Spinner />}>{stats}</Suspense>
            <div className="grid gap-6 md:grid-cols-2">
                <Suspense fallback={<Spinner />}>{charts}</Suspense>
                <Suspense fallback={<Spinner />}>{assignees}</Suspense>
            </div>
            <Suspense fallback={<Spinner />}>{activity}</Suspense>
        </div>
    )
}
