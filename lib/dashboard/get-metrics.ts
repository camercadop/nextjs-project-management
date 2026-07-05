import { prisma } from '@/lib/prisma'
import { cache } from 'react'

/** Shape returned by the issues query with only the fields needed for metrics */
type IssueRow = {
    status: string
    assigneeId: string | null
    assignee: { email: string } | null
}

export interface DashboardMetrics {
    totalProjects: number
    totalIssues: number
    issuesOpen: number
    issuesClosed: number
    issuesByStatus: { BACKLOG: number; TODO: number; IN_PROGRESS: number; DONE: number }
    issuesByAssignee: { email: string; count: number }[]
}

/**
 * Fetches aggregated metrics for a workspace dashboard.
 *
 * Uses React `cache` to deduplicate DB calls when multiple server components
 * invoke this function during the same request.
 */
export const getDashboardMetrics = cache(async (workspaceId: string): Promise<DashboardMetrics> => {
    const projects = await prisma.project.findMany({
        where: { workspaceId },
        select: { id: true },
    })

    const projectIds = projects.map(p => p.id)

    const issues: IssueRow[] = await prisma.issue.findMany({
        where: { projectId: { in: projectIds } },
        select: { status: true, assigneeId: true, assignee: { select: { email: true } } },
    })

    const totalProjects = projects.length
    const totalIssues = issues.length
    const issuesClosed = issues.filter(i => i.status === 'DONE').length
    const issuesOpen = totalIssues - issuesClosed

    const issuesByStatus = {
        BACKLOG: issues.filter(i => i.status === 'BACKLOG').length,
        TODO: issues.filter(i => i.status === 'TODO').length,
        IN_PROGRESS: issues.filter(i => i.status === 'IN_PROGRESS').length,
        DONE: issuesClosed,
    }

    // Group by assigneeId in-memory to avoid an extra DB aggregation query
    const assigneeMap: Record<string, { email: string; count: number }> = {}
    for (const issue of issues) {
        if (issue.assigneeId && issue.assignee) {
            if (!assigneeMap[issue.assigneeId]) {
                assigneeMap[issue.assigneeId] = { email: issue.assignee.email, count: 0 }
            }
            assigneeMap[issue.assigneeId].count++
        }
    }

    return {
        totalProjects,
        totalIssues,
        issuesOpen,
        issuesClosed,
        issuesByStatus,
        // Sorted descending so the most loaded assignee appears first
        issuesByAssignee: Object.values(assigneeMap).sort((a, b) => b.count - a.count),
    }
})
