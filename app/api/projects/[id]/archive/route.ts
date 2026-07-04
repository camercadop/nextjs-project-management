import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'

// PATCH /api/projects/:id/archive — Toggle archive status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) {
        return NextResponse.json({ error: { code: 'project.not_found' } }, { status: 404 })
    }

    const member = await getWorkspaceMember(auth.user.id, project.workspaceId)
    if (!member) {
        return NextResponse.json({ error: { code: 'project.not_found' } }, { status: 404 })
    }

    const updated = await prisma.project.update({
        where: { id },
        data: { status: project.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE' },
    })

    return NextResponse.json({ ok: true, project: updated })
}
