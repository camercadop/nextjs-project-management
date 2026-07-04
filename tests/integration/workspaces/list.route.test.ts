vi.mock('@/lib/prisma', () => ({
    prisma: {
        workspace: { findMany: vi.fn() },
    },
}))

vi.mock('@/lib/middleware/auth', () => ({
    authMiddleware: vi.fn(),
}))

import { GET } from '@/app/api/workspaces/route'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'

function makeRequest() {
    return new Request('http://localhost/api/workspaces')
}

describe('GET /api/workspaces', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({
            user: { id: 'u1', email: 'a@b.com' },
            payload: {} as any,
        })
    })

    it('should return 401 if not authenticated', async () => {
        vi.mocked(authMiddleware).mockResolvedValue(new Response(null, { status: 401 }))
        const res = await GET(makeRequest())
        expect(res.status).toBe(401)
    })

    it('should return user workspaces', async () => {
        vi.mocked(prisma.workspace.findMany).mockResolvedValue([{ id: 'w1', name: 'WS1' }] as any)
        const res = await GET(makeRequest())
        const json = await res.json()
        expect(json.ok).toBe(true)
        expect(json.workspaces).toHaveLength(1)
    })
})
