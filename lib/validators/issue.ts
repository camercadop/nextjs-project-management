import { z } from 'zod'

const statuses = ['BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE'] as const
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const

export const createIssueSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    status: z.enum(statuses).optional(),
    priority: z.enum(priorities).optional(),
    assigneeId: z.string().uuid().optional().nullable(),
})

export const updateIssueSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    status: z.enum(statuses).optional(),
    priority: z.enum(priorities).optional(),
    assigneeId: z.string().uuid().optional().nullable(),
})
