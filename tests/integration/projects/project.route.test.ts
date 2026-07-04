vi.mock('@/lib/prisma', () => ({
    prisma: {
        project: { findUnique: vi.fn(), update: vi.fn() },
    },
}))

vi.mock('@/lib/middleware/auth', () => ({
    authMiddleware: vi.fn(),
}))

vi.mock('@/lib/middleware/workspace', () => ({
    getWorkspaceMember: vi.fn(),
}))

import { GET, PATCH } from '@/app/api/projects/[id]/route'
import { PATCH as ARCHIVE } from '@/app/api/projects/[id]/archive/route'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'

const params = Promise.resolve({ id: 'p1' })

function makeRequest(method: string, body?: unknown) {
    return new Request('http://localhost/api/projects/p1', {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body && { body: JSON.stringify(body) }),
    })
}

describe('GET /api/projects/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'p1', name: 'P1', workspaceId: 'w1' } as any)
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1' } as any)
    })

    it('should return 404 if project not found', async () => {
        vi.mocked(prisma.project.findUnique).mockResolvedValue(null)
        const res = await GET(makeRequest('GET'), { params })
        expect(res.status).toBe(404)
    })

    it('should return project on success', async () => {
        const res = await GET(makeRequest('GET'), { params })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.project.name).toBe('P1')
    })
})

describe('PATCH /api/projects/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'p1', name: 'P1', workspaceId: 'w1' } as any)
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.project.update).mockResolvedValue({ id: 'p1', name: 'Updated' } as any)
    })

    it('should return 400 on invalid body', async () => {
        const res = await PATCH(makeRequest('PATCH', { name: '' }), { params })
        expect(res.status).toBe(400)
    })

    it('should update project', async () => {
        const res = await PATCH(makeRequest('PATCH', { name: 'Updated' }), { params })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.project.name).toBe('Updated')
    })
})

describe('PATCH /api/projects/:id/archive', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(prisma.project.findUnique).mockResolvedValue({ id: 'p1', status: 'ACTIVE', workspaceId: 'w1' } as any)
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.project.update).mockResolvedValue({ id: 'p1', status: 'ARCHIVED' } as any)
    })

    it('should toggle archive status', async () => {
        const res = await ARCHIVE(makeRequest('PATCH'), { params })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.project.status).toBe('ARCHIVED')
    })
})
