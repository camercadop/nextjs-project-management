import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { inviteMemberSchema } from '@/lib/validators/workspace'
import { requireWorkspaceRole } from '@/lib/middleware/workspace'

// GET /api/workspaces/:id/members — List members
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const member = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: auth.user.id, workspaceId: id } },
    })

    if (!member) {
        return NextResponse.json({ error: { code: 'workspace.not_found' } }, { status: 404 })
    }

    const members = await prisma.workspaceMember.findMany({
        where: { workspaceId: id },
        include: { user: { select: { id: true, email: true } } },
    })

    return NextResponse.json({ ok: true, members })
}

// POST /api/workspaces/:id/members — Invite member
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const member = await requireWorkspaceRole(auth.user.id, id, ['OWNER'])
    if (!member) {
        return NextResponse.json({ error: { code: 'workspace.forbidden' } }, { status: 403 })
    }

    const parsed = inviteMemberSchema.safeParse(await req.json())
    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'validation.invalid' } }, { status: 400 })
    }

    const invitedUser = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase() },
    })

    if (!invitedUser) {
        return NextResponse.json({ error: { code: 'workspace.user_not_found' } }, { status: 404 })
    }

    const existing = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: invitedUser.id, workspaceId: id } },
    })

    if (existing) {
        return NextResponse.json({ error: { code: 'workspace.already_member' } }, { status: 409 })
    }

    const newMember = await prisma.workspaceMember.create({
        data: { userId: invitedUser.id, workspaceId: id, role: parsed.data.role },
    })

    return NextResponse.json({ ok: true, member: newMember }, { status: 201 })
}
