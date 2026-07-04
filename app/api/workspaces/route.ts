import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { createWorkspaceSchema } from '@/lib/validators/workspace'

// POST /api/workspaces — Create workspace
export async function POST(req: Request) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth

    const parsed = createWorkspaceSchema.safeParse(await req.json())
    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'validation.invalid' } }, { status: 400 })
    }

    const workspace = await prisma.workspace.create({
        data: {
            name: parsed.data.name,
            description: parsed.data.description,
            members: {
                create: { userId: auth.user.id, role: 'OWNER' },
            },
        },
    })

    return NextResponse.json({ ok: true, workspace }, { status: 201 })
}

// GET /api/workspaces — List user's workspaces
export async function GET(req: Request) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth

    const workspaces = await prisma.workspace.findMany({
        where: { members: { some: { userId: auth.user.id } } },
        include: { members: { select: { role: true, userId: true } } },
        orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ok: true, workspaces })
}
