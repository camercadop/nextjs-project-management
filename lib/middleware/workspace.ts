import { prisma } from '@/lib/prisma'

type WorkspaceRole = 'OWNER' | 'MEMBER'

/** Fetches a workspace membership record, or null if the user is not a member. */
export async function getWorkspaceMember(userId: string, workspaceId: string) {
    // Uses the composite unique index (userId, workspaceId)
    return prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId, workspaceId } },
    })
}

/** Returns the member if they belong to the workspace AND have one of the required roles, otherwise null. */
export async function requireWorkspaceRole(
    userId: string,
    workspaceId: string,
    roles: WorkspaceRole[]
) {
    const member = await getWorkspaceMember(userId, workspaceId)
    // Returning null for both "not a member" and "insufficient role" intentionally
    // avoids leaking whether the workspace exists to unauthorized users
    if (!member || !roles.includes(member.role as WorkspaceRole)) {
        return null
    }
    return member
}
