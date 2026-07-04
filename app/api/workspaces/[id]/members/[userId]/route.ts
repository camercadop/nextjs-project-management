import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { requireWorkspaceRole } from '@/lib/middleware/workspace'

// DELETE /api/workspaces/:id/members/:userId — Remove member
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; userId: string }> }
) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id, userId } = await params

    const member = await requireWorkspaceRole(auth.user.id, id, ['OWNER'])
    if (!member) {
        return NextResponse.json({ error: { code: 'workspace.forbidden' } }, { status: 403 })
    }

    if (userId === auth.user.id) {
        return NextResponse.json(
            { error: { code: 'workspace.cannot_remove_self' } },
            { status: 400 }
        )
    }

    const target = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId: id } },
    })

    if (!target) {
        return NextResponse.json({ error: { code: 'workspace.member_not_found' } }, { status: 404 })
    }

    await prisma.workspaceMember.delete({
        where: { userId_workspaceId: { userId, workspaceId: id } },
    })

    return NextResponse.json({ ok: true })
}
