import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'
import { createProjectSchema } from '@/lib/validators/project'

// POST /api/workspaces/:id/projects — Create project
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const member = await getWorkspaceMember(auth.user.id, id)
    if (!member) {
        return NextResponse.json({ error: { code: 'workspace.not_found' } }, { status: 404 })
    }

    const parsed = createProjectSchema.safeParse(await req.json())
    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'validation.invalid' } }, { status: 400 })
    }

    const project = await prisma.project.create({
        data: { ...parsed.data, workspaceId: id },
    })

    return NextResponse.json({ ok: true, project }, { status: 201 })
}

// GET /api/workspaces/:id/projects — List projects
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const member = await getWorkspaceMember(auth.user.id, id)
    if (!member) {
        return NextResponse.json({ error: { code: 'workspace.not_found' } }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? 'ACTIVE'

    const projects = await prisma.project.findMany({
        where: { workspaceId: id, status },
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ok: true, projects })
}
