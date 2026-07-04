vi.mock('@/lib/prisma', () => ({
    prisma: {
        workspace: { findFirst: vi.fn(), update: vi.fn() },
        workspaceMember: { findUnique: vi.fn() },
    },
}))

vi.mock('@/lib/middleware/auth', () => ({
    authMiddleware: vi.fn(),
}))

vi.mock('@/lib/middleware/workspace', () => ({
    requireWorkspaceRole: vi.fn(),
}))

import { GET, PATCH } from '@/app/api/workspaces/[id]/route'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { requireWorkspaceRole } from '@/lib/middleware/workspace'

const params = Promise.resolve({ id: 'w1' })

function makeRequest(method = 'GET', body?: unknown) {
    return new Request('http://localhost/api/workspaces/w1', {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    })
}

describe('GET /api/workspaces/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({
            user: { id: 'u1', email: 'a@b.com' },
            payload: {} as any,
        })
    })

    it('should return 404 if workspace not found or user not member', async () => {
        vi.mocked(prisma.workspace.findFirst).mockResolvedValue(null)
        const res = await GET(makeRequest(), { params })
        expect(res.status).toBe(404)
    })

    it('should return workspace detail', async () => {
        vi.mocked(prisma.workspace.findFirst).mockResolvedValue({
            id: 'w1',
            name: 'WS',
            members: [],
        } as any)
        const res = await GET(makeRequest(), { params })
        const json = await res.json()
        expect(json.ok).toBe(true)
        expect(json.workspace.id).toBe('w1')
    })
})

describe('PATCH /api/workspaces/:id', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({
            user: { id: 'u1', email: 'a@b.com' },
            payload: {} as any,
        })
    })

    it('should return 403 if not owner', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue(null)
        const res = await PATCH(makeRequest('PATCH', { name: 'New' }), { params })
        expect(res.status).toBe(403)
    })

    it('should return 400 on invalid body', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue({ id: 'm1', role: 'OWNER' } as any)
        const res = await PATCH(makeRequest('PATCH', { name: '' }), { params })
        expect(res.status).toBe(400)
    })

    it('should update workspace', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue({ id: 'm1', role: 'OWNER' } as any)
        vi.mocked(prisma.workspace.update).mockResolvedValue({ id: 'w1', name: 'Updated' } as any)
        const res = await PATCH(makeRequest('PATCH', { name: 'Updated' }), { params })
        const json = await res.json()
        expect(json.ok).toBe(true)
        expect(json.workspace.name).toBe('Updated')
    })
})
