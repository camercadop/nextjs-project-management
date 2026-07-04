import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { updateWorkspaceSchema } from '@/lib/validators/workspace'
import { requireWorkspaceRole } from '@/lib/middleware/workspace'

// GET /api/workspaces/:id — Workspace detail
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const workspace = await prisma.workspace.findFirst({
        where: { id, members: { some: { userId: auth.user.id } } },
        include: { members: { include: { user: { select: { id: true, email: true } } } } },
    })

    if (!workspace) {
        return NextResponse.json({ error: { code: 'workspace.not_found' } }, { status: 404 })
    }

    return NextResponse.json({ ok: true, workspace })
}

// PATCH /api/workspaces/:id — Update workspace
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const member = await requireWorkspaceRole(auth.user.id, id, ['OWNER'])
    if (!member) {
        return NextResponse.json({ error: { code: 'workspace.forbidden' } }, { status: 403 })
    }

    const parsed = updateWorkspaceSchema.safeParse(await req.json())
    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'validation.invalid' } }, { status: 400 })
    }

    const workspace = await prisma.workspace.update({
        where: { id },
        data: parsed.data,
    })

    return NextResponse.json({ ok: true, workspace })
}
