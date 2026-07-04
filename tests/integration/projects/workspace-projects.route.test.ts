vi.mock('@/lib/prisma', () => ({
    prisma: {
        project: { create: vi.fn(), findMany: vi.fn() },
    },
}))

vi.mock('@/lib/middleware/auth', () => ({
    authMiddleware: vi.fn(),
}))

vi.mock('@/lib/middleware/workspace', () => ({
    getWorkspaceMember: vi.fn(),
}))

import { POST, GET } from '@/app/api/workspaces/[id]/projects/route'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'

const params = Promise.resolve({ id: 'w1' })

function makeRequest(body?: unknown, query = '') {
    return new Request(`http://localhost/api/workspaces/w1/projects${query}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        ...(body && { body: JSON.stringify(body) }),
    })
}

describe('POST /api/workspaces/:id/projects', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1', role: 'MEMBER' } as any)
    })

    it('should return 404 if user is not workspace member', async () => {
        vi.mocked(getWorkspaceMember).mockResolvedValue(null)
        const res = await POST(makeRequest({ name: 'P1' }), { params })
        expect(res.status).toBe(404)
    })

    it('should return 400 if name is missing', async () => {
        const res = await POST(makeRequest({}), { params })
        expect(res.status).toBe(400)
    })

    it('should return 201 on success', async () => {
        vi.mocked(prisma.project.create).mockResolvedValue({ id: 'p1', name: 'P1' } as any)
        const res = await POST(makeRequest({ name: 'P1' }), { params })
        expect(res.status).toBe(201)
        const json = await res.json()
        expect(json.ok).toBe(true)
    })
})

describe('GET /api/workspaces/:id/projects', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1', role: 'MEMBER' } as any)
    })

    it('should return projects filtered by status', async () => {
        vi.mocked(prisma.project.findMany).mockResolvedValue([{ id: 'p1', name: 'P1' }] as any)
        const res = await GET(makeRequest(undefined, '?status=ACTIVE'), { params })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.projects).toHaveLength(1)
    })
})
