import { getActivityFeed } from '@/lib/dashboard/get-activity'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { t } from '@/lib/i18n-server'
import { Activity } from 'lucide-react'

/**
 * Translates an activity event type into a localized human-readable string.
 *
 * @param type - The event type (e.g. PROJECT_CREATED, ISSUE_STATUS_CHANGED).
 * @param metadata - Event metadata containing interpolation values.
 *
 * @returns The translated event description, or the raw type if no translation exists.
 */
function formatEvent(type: string, metadata: Record<string, unknown>): string {
    const key = `dashboard.activity_${type.toLowerCase()}`
    const translated = t(key, 'dashboard')
    if (translated === key) return type
    return translated
        .replace('{{name}}', (metadata.projectName || metadata.issueTitle || '') as string)
        .replace('{{status}}', (metadata.newStatus || '') as string)
}

export default async function ActivitySlot({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const events = await getActivityFeed(id)

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Activity className="size-4" />
                    {t('dashboard.activity_title', 'dashboard')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t('dashboard.activity_empty', 'dashboard')}
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {events.map(event => (
                            <li key={event.id} className="flex flex-col gap-0.5 text-sm">
                                <span>
                                    <span className="font-medium">{event.user.email}</span>{' '}
                                    {formatEvent(event.type, event.metadata)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(event.createdAt).toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
