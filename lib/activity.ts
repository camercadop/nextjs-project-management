import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

export type ActivityType =
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED'
    | 'PROJECT_ARCHIVED'
    | 'ISSUE_CREATED'
    | 'ISSUE_STATUS_CHANGED'
    | 'ISSUE_ASSIGNEE_CHANGED'

interface RecordActivityParams {
    type: ActivityType
    userId: string
    workspaceId: string
    metadata: Prisma.InputJsonValue
}

/**
 * Persists an activity event for the workspace feed.
 *
 * @param params - The activity event data.
 * @param params.type - The event type (e.g. PROJECT_CREATED, ISSUE_STATUS_CHANGED).
 * @param params.userId - The ID of the user who performed the action.
 * @param params.workspaceId - The workspace where the event occurred.
 * @param params.metadata - Additional context about the event (e.g. project name, issue title).
 *
 * @returns The created ActivityEvent record.
 */
export function recordActivity({ type, userId, workspaceId, metadata }: RecordActivityParams) {
    return prisma.activityEvent.create({
        data: { type, userId, workspaceId, metadata },
    })
}
