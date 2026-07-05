import { getDashboardMetrics } from '@/lib/dashboard/get-metrics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Circle } from 'lucide-react'
import { t } from '@/lib/i18n-server'

const STATUS_COLORS: Record<string, string> = {
    BACKLOG: 'bg-gray-400',
    TODO: 'bg-blue-400',
    IN_PROGRESS: 'bg-yellow-400',
    DONE: 'bg-green-400',
}

const STATUS_CIRCLE_COLORS: Record<string, string> = {
    BACKLOG: 'text-muted-foreground',
    TODO: 'text-blue-500',
    IN_PROGRESS: 'text-amber-500',
    DONE: 'text-emerald-500',
}

export default async function ChartsSlot({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const metrics = await getDashboardMetrics(id)
    const { issuesByStatus } = metrics
    const total = metrics.totalIssues || 1

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{t('dashboard.by_status', 'dashboard')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {Object.entries(issuesByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground w-24">
                            <Circle className={`size-2.5 fill-current ${STATUS_CIRCLE_COLORS[status]}`} />
                            {t(`issue.status_${status.toLowerCase()}`, 'issue')}
                        </span>
                        <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                            <div
                                className={`h-full ${STATUS_COLORS[status]} rounded-md transition-all`}
                                style={{ width: `${(count / total) * 100}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
