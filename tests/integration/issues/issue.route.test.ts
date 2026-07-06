vi.mock('@/lib/prisma', () => ({
    prisma: {
        issue: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
        issueHistory: { findMany: vi.fn(), createMany: vi.fn() },
        user: { findUnique: vi.fn() },
        activityEvent: { create: vi.fn() },
        $transaction: vi.fn(),
    },
}))

vi.mock('@/lib/middleware/auth', () => ({
    authMiddleware: vi.fn(),
}))

vi.mock('@/lib/middleware/workspace', () => ({
    getWorkspaceMember: vi.fn(),
}))

vi.mock('@/lib/activity', () => ({
    recordActivity: vi.fn(),
}))

import { GET, PATCH, DELETE } from '@/app/api/issues/[id]/route'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'

const params = Promise.resolve({ id: 'i1' })

function makeRequest(method: string, body?: unknown) {
    return new Request('http://localhost/api/issues/i1', {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    })
}

const mockIssue = {
    id: 'i1',
    title: 'Bug',
    status: 'TODO',
    priority: 'HIGH',
    assigneeId: null,
    project: { workspaceId: 'w1' },
}

describe('GET /api/issues/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(prisma.issue.findUnique).mockResolvedValue(mockIssue as any)
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.issueHistory.findMany).mockResolvedValue([])
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    })

    it('should return 404 if issue not found', async () => {
        vi.mocked(prisma.issue.findUnique).mockResolvedValue(null)
        const res = await GET(makeRequest('GET'), { params })
        expect(res.status).toBe(404)
    })

    it('should return 404 if user has no workspace access', async () => {
        vi.mocked(getWorkspaceMember).mockResolvedValue(null)
        const res = await GET(makeRequest('GET'), { params })
        expect(res.status).toBe(404)
    })

    it('should return issue with history', async () => {
        vi.mocked(prisma.issueHistory.findMany).mockResolvedValue([{ field: 'status' }] as any)
        const res = await GET(makeRequest('GET'), { params })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.issue.title).toBe('Bug')
        expect(json.history).toHaveLength(1)
    })
})

describe('PATCH /api/issues/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(prisma.issue.findUnique).mockResolvedValue(mockIssue as any)
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.$transaction).mockResolvedValue([{ id: 'i1', status: 'DONE' }])
    })

    it('should return 404 if issue not found', async () => {
        vi.mocked(prisma.issue.findUnique).mockResolvedValue(null)
        const res = await PATCH(makeRequest('PATCH', { status: 'DONE' }), { params })
        expect(res.status).toBe(404)
    })

    it('should return 400 on invalid body', async () => {
        const res = await PATCH(makeRequest('PATCH', { priority: 'INVALID' }), { params })
        expect(res.status).toBe(400)
    })

    it('should update issue and return 200', async () => {
        const res = await PATCH(makeRequest('PATCH', { status: 'DONE' }), { params })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.issue.status).toBe('DONE')
    })
})

describe('DELETE /api/issues/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(prisma.issue.findUnique).mockResolvedValue(mockIssue as any)
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.issue.delete).mockResolvedValue(mockIssue as any)
    })

    it('should return 404 if issue not found', async () => {
        vi.mocked(prisma.issue.findUnique).mockResolvedValue(null)
        const res = await DELETE(makeRequest('DELETE'), { params })
        expect(res.status).toBe(404)
    })

    it('should delete issue and return ok', async () => {
        const res = await DELETE(makeRequest('DELETE'), { params })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.ok).toBe(true)
    })
})
