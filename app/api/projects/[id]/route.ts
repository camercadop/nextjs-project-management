import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'
import { updateProjectSchema } from '@/lib/validators/project'
import { recordActivity } from '@/lib/activity'

/**
 * Retrieves a project by ID if the user is a member of its workspace.
 *
 * @param userId - The authenticated user's ID.
 * @param projectId - The project ID to look up.
 *
 * @returns The project if found and accessible, or null otherwise.
 */
async function getProjectWithAccess(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) return null
    const member = await getWorkspaceMember(userId, project.workspaceId)
    if (!member) return null
    return project
}

// GET /api/projects/:id — Project detail
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const project = await getProjectWithAccess(auth.user.id, id)
    if (!project) {
        return NextResponse.json({ error: { code: 'project.not_found' } }, { status: 404 })
    }

    return NextResponse.json({ ok: true, project })
}

// PATCH /api/projects/:id — Update project
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const project = await getProjectWithAccess(auth.user.id, id)
    if (!project) {
        return NextResponse.json({ error: { code: 'project.not_found' } }, { status: 404 })
    }

    const parsed = updateProjectSchema.safeParse(await req.json())
    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'validation.invalid' } }, { status: 400 })
    }

    const updated = await prisma.project.update({
        where: { id },
        data: parsed.data,
    })

    await recordActivity({
        type: 'PROJECT_UPDATED',
        userId: auth.user.id,
        workspaceId: project.workspaceId,
        metadata: { projectId: id, projectName: updated.name },
    })

    return NextResponse.json({ ok: true, project: updated })
}
