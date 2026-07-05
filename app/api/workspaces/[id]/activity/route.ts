import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'

// GET /api/workspaces/:id/activity — Activity feed for workspace
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const member = await getWorkspaceMember(auth.user.id, id)
    if (!member) {
        return NextResponse.json({ error: { code: 'workspace.not_found' } }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get('limit') || '20'), 50)

    const events = await prisma.activityEvent.findMany({
        where: { workspaceId: id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { user: { select: { id: true, email: true } } },
    })

    return NextResponse.json({ ok: true, events })
}
