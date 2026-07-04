import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'
import { createIssueSchema } from '@/lib/validators/issue'

// GET /api/projects/:id/issues — List issues (with optional filters)
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id: projectId } = await params

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
        return NextResponse.json({ error: { code: 'project.not_found' } }, { status: 404 })
    }

    const member = await getWorkspaceMember(auth.user.id, project.workspaceId)
    if (!member) {
        return NextResponse.json({ error: { code: 'project.not_found' } }, { status: 404 })
    }

    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')
    const assigneeId = url.searchParams.get('assigneeId')

    const where: Record<string, unknown> = { projectId }
    if (status) where.status = status
    if (priority) where.priority = priority
    if (assigneeId) where.assigneeId = assigneeId === 'me' ? auth.user.id : assigneeId

    const issues = await prisma.issue.findMany({
        where,
        include: { assignee: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ok: true, issues })
}

// POST /api/projects/:id/issues — Create issue
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id: projectId } = await params

    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) {
        return NextResponse.json({ error: { code: 'project.not_found' } }, { status: 404 })
    }

    const member = await getWorkspaceMember(auth.user.id, project.workspaceId)
    if (!member) {
        return NextResponse.json({ error: { code: 'project.not_found' } }, { status: 404 })
    }

    const parsed = createIssueSchema.safeParse(await req.json())
    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'validation.invalid' } }, { status: 400 })
    }

    const issue = await prisma.issue.create({
        data: { ...parsed.data, projectId },
        include: { assignee: { select: { id: true, email: true } } },
    })

    return NextResponse.json({ ok: true, issue }, { status: 201 })
}
