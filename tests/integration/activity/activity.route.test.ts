vi.mock('@/lib/prisma', () => ({
    prisma: {
        activityEvent: { findMany: vi.fn() },
    },
}))

vi.mock('@/lib/middleware/auth', () => ({
    authMiddleware: vi.fn(),
}))

vi.mock('@/lib/middleware/workspace', () => ({
    getWorkspaceMember: vi.fn(),
}))

import { GET } from '@/app/api/workspaces/[id]/activity/route'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'

const params = Promise.resolve({ id: 'w1' })

function makeRequest(query = '') {
    return new Request(`http://localhost/api/workspaces/w1/activity${query}`, { method: 'GET' })
}

describe('GET /api/workspaces/:id/activity', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({ user: { id: 'u1', email: 'a@b.com' }, payload: {} as any })
        vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1' } as any)
    })

    it('should return 404 if not a workspace member', async () => {
        vi.mocked(getWorkspaceMember).mockResolvedValue(null)
        const res = await GET(makeRequest(), { params })
        expect(res.status).toBe(404)
    })

    it('should return activity events', async () => {
        const events = [
            { id: 'e1', type: 'PROJECT_CREATED', metadata: { projectName: 'P1' }, createdAt: new Date(), user: { id: 'u1', email: 'a@b.com' } },
        ]
        vi.mocked(prisma.activityEvent.findMany).mockResolvedValue(events as any)

        const res = await GET(makeRequest(), { params })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.events).toHaveLength(1)
        expect(json.events[0].type).toBe('PROJECT_CREATED')
    })

    it('should respect limit parameter', async () => {
        vi.mocked(prisma.activityEvent.findMany).mockResolvedValue([])
        await GET(makeRequest('?limit=5'), { params })
        expect(prisma.activityEvent.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 5 })
        )
    })

    it('should cap limit at 50', async () => {
        vi.mocked(prisma.activityEvent.findMany).mockResolvedValue([])
        await GET(makeRequest('?limit=100'), { params })
        expect(prisma.activityEvent.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 50 })
        )
    })
})
