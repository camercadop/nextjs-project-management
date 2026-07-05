import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'
import { updateIssueSchema } from '@/lib/validators/issue'

async function getIssueWithAccess(userId: string, issueId: string) {
    const issue = await prisma.issue.findUnique({
        where: { id: issueId },
        include: { project: true },
    })
    if (!issue) return null
    const member = await getWorkspaceMember(userId, issue.project.workspaceId)
    if (!member) return null
    return issue
}

// GET /api/issues/:id — Issue detail + history
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const issue = await getIssueWithAccess(auth.user.id, id)
    if (!issue) {
        return NextResponse.json({ error: { code: 'issue.not_found' } }, { status: 404 })
    }

    const [assignee, history] = await Promise.all([
        issue.assigneeId
            ? prisma.user.findUnique({ where: { id: issue.assigneeId }, select: { id: true, email: true } })
            : null,
        prisma.issueHistory.findMany({ where: { issueId: id }, orderBy: { createdAt: 'desc' } }),
    ])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { project: _, ...issueData } = issue
    return NextResponse.json({ ok: true, issue: { ...issueData, assignee }, history })
}

// PATCH /api/issues/:id — Update issue (records history)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const issue = await getIssueWithAccess(auth.user.id, id)
    if (!issue) {
        return NextResponse.json({ error: { code: 'issue.not_found' } }, { status: 404 })
    }

    const parsed = updateIssueSchema.safeParse(await req.json())
    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'validation.invalid' } }, { status: 400 })
    }

    // Record history for changed fields
    const historyEntries = Object.entries(parsed.data)
        .filter(([key, value]) => value !== undefined && (issue as Record<string, unknown>)[key] !== value)
        .map(([field, newValue]) => ({
            issueId: id,
            field,
            oldValue: String((issue as Record<string, unknown>)[field] ?? ''),
            newValue: String(newValue ?? ''),
            changedBy: auth.user.id,
        }))

    const [updated] = await prisma.$transaction([
        prisma.issue.update({
            where: { id },
            data: parsed.data,
            include: { assignee: { select: { id: true, email: true } } },
        }),
        ...(historyEntries.length > 0
            ? [prisma.issueHistory.createMany({ data: historyEntries })]
            : []),
    ])

    return NextResponse.json({ ok: true, issue: updated })
}

// DELETE /api/issues/:id — Delete issue
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const issue = await getIssueWithAccess(auth.user.id, id)
    if (!issue) {
        return NextResponse.json({ error: { code: 'issue.not_found' } }, { status: 404 })
    }

    await prisma.issue.delete({ where: { id } })
    return NextResponse.json({ ok: true })
}
