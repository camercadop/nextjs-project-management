vi.mock('@/lib/prisma', () => ({
    prisma: {
        workspace: { create: vi.fn(), findMany: vi.fn() },
    },
}))

vi.mock('@/lib/middleware/auth', () => ({
    authMiddleware: vi.fn(),
}))

import { POST } from '@/app/api/workspaces/route'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
}

describe('POST /api/workspaces', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({
            user: { id: 'u1', email: 'a@b.com' },
            payload: {} as any,
        })
    })

    it('should return 401 if not authenticated', async () => {
        vi.mocked(authMiddleware).mockResolvedValue(new Response(null, { status: 401 }))
        const res = await POST(makeRequest({ name: 'Test' }))
        expect(res.status).toBe(401)
    })

    it('should return 400 if name is missing', async () => {
        const res = await POST(makeRequest({}))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('validation.invalid')
    })

    it('should return 201 on success', async () => {
        vi.mocked(prisma.workspace.create).mockResolvedValue({ id: 'w1', name: 'My WS' } as any)
        const res = await POST(makeRequest({ name: 'My WS' }))
        expect(res.status).toBe(201)
        const json = await res.json()
        expect(json.ok).toBe(true)
        expect(json.workspace.name).toBe('My WS')
    })
})
