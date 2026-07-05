import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export interface ActivityEventRow {
    id: string
    type: string
    metadata: Record<string, unknown>
    createdAt: Date
    user: { id: string; email: string }
}

/**
 * Retrieves the most recent activity events for a workspace.
 *
 * @param workspaceId - The workspace to fetch activity for.
 * @param limit - Maximum number of events to return (default 10).
 *
 * @returns Activity events ordered by most recent first.
 */
export const getActivityFeed = cache(
    async (workspaceId: string, limit = 10): Promise<ActivityEventRow[]> => {
        return prisma.activityEvent.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: { user: { select: { id: true, email: true } } },
        }) as ActivityEventRow[]
    }
)
