vi.mock('@/lib/prisma', () => ({
    prisma: {
        workspaceMember: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
        },
        user: { findUnique: vi.fn() },
    },
}))

vi.mock('@/lib/middleware/auth', () => ({
    authMiddleware: vi.fn(),
}))

vi.mock('@/lib/middleware/workspace', () => ({
    requireWorkspaceRole: vi.fn(),
}))

import { GET, POST } from '@/app/api/workspaces/[id]/members/route'
import { DELETE } from '@/app/api/workspaces/[id]/members/[userId]/route'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { requireWorkspaceRole } from '@/lib/middleware/workspace'

const params = Promise.resolve({ id: 'w1' })
const deleteParams = Promise.resolve({ id: 'w1', userId: 'u2' })

function makeRequest(method = 'GET', body?: unknown) {
    return new Request('http://localhost/api/workspaces/w1/members', {
        method,
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    })
}

describe('GET /api/workspaces/:id/members', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({
            user: { id: 'u1', email: 'a@b.com' },
            payload: {} as any,
        })
    })

    it('should return 404 if user is not a member', async () => {
        vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue(null)
        const res = await GET(makeRequest(), { params })
        expect(res.status).toBe(404)
    })

    it('should return members list', async () => {
        vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.workspaceMember.findMany).mockResolvedValue([
            { id: 'm1', user: { id: 'u1', email: 'a@b.com' } },
        ] as any)
        const res = await GET(makeRequest(), { params })
        const json = await res.json()
        expect(json.ok).toBe(true)
        expect(json.members).toHaveLength(1)
    })
})

describe('POST /api/workspaces/:id/members', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({
            user: { id: 'u1', email: 'a@b.com' },
            payload: {} as any,
        })
    })

    it('should return 403 if not owner', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue(null)
        const res = await POST(makeRequest('POST', { email: 'b@b.com', role: 'MEMBER' }), {
            params,
        })
        expect(res.status).toBe(403)
    })

    it('should return 404 if invited user not found', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
        const res = await POST(makeRequest('POST', { email: 'b@b.com', role: 'MEMBER' }), {
            params,
        })
        expect(res.status).toBe(404)
    })

    it('should return 409 if already a member', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u2' } as any)
        vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ id: 'existing' } as any)
        const res = await POST(makeRequest('POST', { email: 'b@b.com', role: 'MEMBER' }), {
            params,
        })
        expect(res.status).toBe(409)
    })

    it('should return 201 on successful invite', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u2' } as any)
        vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.workspaceMember.create).mockResolvedValue({
            id: 'm2',
            userId: 'u2',
            role: 'MEMBER',
        } as any)
        const res = await POST(makeRequest('POST', { email: 'b@b.com', role: 'MEMBER' }), {
            params,
        })
        expect(res.status).toBe(201)
        const json = await res.json()
        expect(json.ok).toBe(true)
    })
})

describe('DELETE /api/workspaces/:id/members/:userId', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({
            user: { id: 'u1', email: 'a@b.com' },
            payload: {} as any,
        })
    })

    it('should return 403 if not owner', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue(null)
        const res = await DELETE(makeRequest('DELETE'), { params: deleteParams })
        expect(res.status).toBe(403)
    })

    it('should return 400 if trying to remove self', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue({ id: 'm1' } as any)
        const selfParams = Promise.resolve({ id: 'w1', userId: 'u1' })
        const res = await DELETE(makeRequest('DELETE'), { params: selfParams })
        expect(res.status).toBe(400)
    })

    it('should return 404 if target member not found', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue(null)
        const res = await DELETE(makeRequest('DELETE'), { params: deleteParams })
        expect(res.status).toBe(404)
    })

    it('should remove member successfully', async () => {
        vi.mocked(requireWorkspaceRole).mockResolvedValue({ id: 'm1' } as any)
        vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ id: 'm2' } as any)
        vi.mocked(prisma.workspaceMember.delete).mockResolvedValue({} as any)
        const res = await DELETE(makeRequest('DELETE'), { params: deleteParams })
        const json = await res.json()
        expect(json.ok).toBe(true)
    })
})
