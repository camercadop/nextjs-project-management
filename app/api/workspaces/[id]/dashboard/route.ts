import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'

type IssueRow = {
    status: string
    assigneeId: string | null
    assignee: { email: string } | null
}

// GET /api/workspaces/:id/dashboard — Workspace dashboard metrics
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const member = await getWorkspaceMember(auth.user.id, id)
    if (!member) {
        return NextResponse.json({ error: { code: 'workspace.not_found' } }, { status: 404 })
    }

    const projects = await prisma.project.findMany({
        where: { workspaceId: id },
        select: { id: true, status: true },
    })

    const projectIds = projects.map(p => p.id)

    const issues: IssueRow[] = await prisma.issue.findMany({
        where: { projectId: { in: projectIds } },
        select: {
            status: true,
            priority: true,
            assigneeId: true,
            assignee: { select: { email: true } },
        },
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

    // Group by assigneeId
    const issuesByAssignee: Record<string, { email: string; count: number }> = {}
    for (const issue of issues) {
        if (issue.assigneeId && issue.assignee) {
            if (!issuesByAssignee[issue.assigneeId]) {
                issuesByAssignee[issue.assigneeId] = { email: issue.assignee.email, count: 0 }
            }
            issuesByAssignee[issue.assigneeId].count++
        }
    }

    return NextResponse.json({
        ok: true,
        metrics: {
            totalProjects,
            totalIssues,
            issuesOpen,
            issuesClosed,
            issuesByStatus,
            issuesByAssignee: Object.values(issuesByAssignee),
        },
    })
}
