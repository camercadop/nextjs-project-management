const mockCookieGet = vi.fn()
const mockCookieDelete = vi.fn()

vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve({ get: mockCookieGet, delete: mockCookieDelete })),
}))

vi.mock('@/lib/prisma', () => ({
    prisma: { user: { findUnique: vi.fn() } },
}))

vi.mock('@/lib/auth', () => ({
    verifyRefreshToken: vi.fn(),
    signAccessToken: vi.fn(() => 'new-access-token'),
}))

import { POST } from '@/app/api/auth/refresh-token/route'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken } from '@/lib/auth'

describe('POST /api/auth/refresh-token', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 401 if no refresh token cookie exists', async () => {
        mockCookieGet.mockReturnValue(undefined)

        const res = await POST()
        expect(res.status).toBe(401)
        const json = await res.json()
        expect(json.error.code).toBe('auth.no_refresh_token')
    })

    it('should return 401 and clear cookie if token is invalid', async () => {
        mockCookieGet.mockReturnValue({ value: 'bad-token' })
        vi.mocked(verifyRefreshToken).mockImplementation(() => {
            throw new Error('invalid')
        })

        const res = await POST()
        expect(res.status).toBe(401)
        const json = await res.json()
        expect(json.error.code).toBe('auth.invalid_refresh_token')
        expect(mockCookieDelete).toHaveBeenCalledWith('refreshToken')
    })

    it('should return 404 and clear cookie if user not found', async () => {
        mockCookieGet.mockReturnValue({ value: 'valid-token' })
        vi.mocked(verifyRefreshToken).mockReturnValue({ userId: 'no-exist', email: 'a@b.com' })
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

        const res = await POST()
        expect(res.status).toBe(404)
        const json = await res.json()
        expect(json.error.code).toBe('auth.user_not_found')
        expect(mockCookieDelete).toHaveBeenCalledWith('refreshToken')
    })

    it('should return 200 with new access token on valid refresh', async () => {
        mockCookieGet.mockReturnValue({ value: 'valid-token' })
        vi.mocked(verifyRefreshToken).mockReturnValue({ userId: '1', email: 'test@test.com' })
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: '1',
            email: 'test@test.com',
        } as any)

        const res = await POST()
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.accessToken).toBe('new-access-token')
    })

    it('should return 500 on unexpected error', async () => {
        mockCookieGet.mockImplementation(() => {
            throw new Error('crash')
        })

        const res = await POST()
        expect(res.status).toBe(500)
        const json = await res.json()
        expect(json.error.code).toBe('server.error')
    })
})
