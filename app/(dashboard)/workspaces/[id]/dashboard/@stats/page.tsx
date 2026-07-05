import { getDashboardMetrics } from '@/lib/dashboard/get-metrics'
import { Card, CardContent } from '@/components/ui/card'
import { FolderKanban, Bug, CircleDot, CheckCircle2 } from 'lucide-react'
import { t } from '@/lib/i18n-server'

export default async function StatsSlot({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const metrics = await getDashboardMetrics(id)

    const cards = [
        { label: 'dashboard.projects', value: metrics.totalProjects, icon: FolderKanban, color: 'text-blue-500' },
        { label: 'dashboard.total_issues', value: metrics.totalIssues, icon: Bug, color: 'text-purple-500' },
        { label: 'dashboard.open', value: metrics.issuesOpen, icon: CircleDot, color: 'text-orange-500' },
        { label: 'dashboard.closed', value: metrics.issuesClosed, icon: CheckCircle2, color: 'text-green-500' },
    ]

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(c => (
                <Card key={c.label}>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className={`size-10 rounded-lg bg-muted flex items-center justify-center ${c.color}`}>
                            <c.icon className="size-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{c.value}</p>
                            <p className="text-xs text-muted-foreground">{t(c.label, 'dashboard')}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
