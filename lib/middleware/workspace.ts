import { prisma } from '@/lib/prisma'

type WorkspaceRole = 'OWNER' | 'MEMBER'

export async function getWorkspaceMember(userId: string, workspaceId: string) {
    return prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
    })
}

export async function requireWorkspaceRole(
    userId: string,
    workspaceId: string,
    roles: WorkspaceRole[]
) {
    const member = await getWorkspaceMember(userId, workspaceId)
    if (!member || !roles.includes(member.role as WorkspaceRole)) {
        return null
    }
    return member
}
