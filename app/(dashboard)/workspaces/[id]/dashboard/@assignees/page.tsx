import { getDashboardMetrics } from '@/lib/dashboard/get-metrics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { t } from '@/lib/i18n-server'

export default async function AssigneesSlot({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const metrics = await getDashboardMetrics(id)
    const { issuesByAssignee } = metrics
    const max = issuesByAssignee[0]?.count || 1

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{t('dashboard.by_assignee', 'dashboard')}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {issuesByAssignee.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('dashboard.no_assigned', 'dashboard')}</p>
                ) : (
                    issuesByAssignee.map(a => (
                        <div key={a.email} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-36 truncate">{a.email}</span>
                            <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                                <div
                                    className="h-full bg-primary/60 rounded-md transition-all"
                                    style={{ width: `${(a.count / max) * 100}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{a.count}</span>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
