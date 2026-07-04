import { z } from 'zod'

export const createWorkspaceSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
})

export const updateWorkspaceSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
})

export const inviteMemberSchema = z.object({
    email: z.email(),
    role: z.enum(['OWNER', 'MEMBER']),
})
