vi.mock('@/lib/prisma', () => ({
    prisma: {
        project: { findUnique: vi.fn() },
        issue: { findMany: vi.fn(), create: vi.fn() },
        activityEvent: { create: vi.fn() },
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

import { GET, POST } from '@/app/api/projects/[id]/issues/route'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'

const params = Promise.resolve({ id: 'p1' })

function makeRequest(method: string, body?: unknown, query?: string) {
    const url = `http://localhost/api/projects/p1/issues${query ?? ''}`
    return new Request(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    })
}

describe('GET /api/projects/:id/issues', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'p1', workspaceId: 'w1' } as any)
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.issue.findMany).mockResolvedValue([])
    })

    it('should return 404 if project not found', async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue(null)
        const res = await GET(makeRequest('GET'), { params })
        expect(res.status).toBe(404)
    })

    it('should return 404 if user is not a workspace member', async () => {
        vi.mocked(getWorkspaceMember).mockResolvedValue(null)
        const res = await GET(makeRequest('GET'), { params })
        expect(res.status).toBe(404)
    })

    it('should return issues list', async () => {
        vi.mocked(prisma.issue.findMany).mockResolvedValue([{ id: 'i1', title: 'Bug' }] as any)
        const res = await GET(makeRequest('GET'), { params })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.issues).toHaveLength(1)
    })

    it('should pass filters to query', async () => {
        await GET(makeRequest('GET', undefined, '?status=DONE&priority=HIGH'), { params })
        expect(prisma.issue.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ status: 'DONE', priority: 'HIGH' }),
            })
        )
    })

    it('should resolve assignee:me filter', async () => {
        await GET(makeRequest('GET', undefined, '?assigneeId=me'), { params })
        expect(prisma.issue.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ assigneeId: 'u1' }),
            })
        )
    })
})

describe('POST /api/projects/:id/issues', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'p1', workspaceId: 'w1' } as any)
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.issue.create).mockResolvedValue({ id: 'i1', title: 'New' } as any)
    })

    it('should return 404 if project not found', async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue(null)
        const res = await POST(makeRequest('POST', { title: 'X' }), { params })
        expect(res.status).toBe(404)
    })

    it('should return 400 on invalid body', async () => {
        const res = await POST(makeRequest('POST', { title: '' }), { params })
        expect(res.status).toBe(400)
    })

    it('should create issue and return 201', async () => {
        const res = await POST(makeRequest('POST', { title: 'New issue' }), { params })
        expect(res.status).toBe(201)
        const json = await res.json()
        expect(json.issue.id).toBe('i1')
    })
})
