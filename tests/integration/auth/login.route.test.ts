vi.mock('@/lib/prisma', () => ({
    prisma: { user: { findUnique: vi.fn() } },
}))

vi.mock('@/lib/auth', () => ({
    verifyPassword: vi.fn(),
    signAccessToken: vi.fn(() => 'access-token'),
    signRefreshToken: vi.fn(() => 'refresh-token'),
    DUMMY_PASSWORD_HASH: '$2a$12$dummy',
}))

const mockCookieSet = vi.fn()
vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve({ set: mockCookieSet })),
}))

import { POST } from '@/app/api/auth/login/route'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
}

describe('POST /api/auth/login', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 400 if email or password is missing', async () => {
        const res = await POST(makeRequest({ email: '' }))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('auth.missing_credentials')
    })

    it('should return 401 if user is not found', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
        vi.mocked(verifyPassword).mockResolvedValue(false)

        const res = await POST(makeRequest({ email: 'nouser@email.com', password: 'password' }))
        expect(res.status).toBe(401)
    })

    it('should return 200 on valid credentials', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: '1',
            email: 'test@test.com',
            hashedPassword: 'hash',
        } as any)
        vi.mocked(verifyPassword).mockResolvedValue(true)

        const res = await POST(makeRequest({ email: 'test@test.com', password: 'correct' }))
        const json = await res.json()
        expect(res.status).toBe(200)
        expect(json.accessToken).toBe('access-token')
    })

    it('should return 500 on unexpected error', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: '1',
            email: 'test@test.com',
            hashedPassword: 'hash',
        } as any)
        vi.mocked(verifyPassword).mockResolvedValue(true)
        mockCookieSet.mockImplementation(() => {
            throw new Error('crash')
        })

        const res = await POST(makeRequest({ email: 'test@test.com', password: 'correct' }))
        expect(res.status).toBe(500)
        const json = await res.json()
        expect(json.error.code).toBe('server.error')
    })
})

describe('parseMaxAgeSeconds (via cookie maxAge)', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: '1',
            email: 'test@test.com',
            hashedPassword: 'hash',
        } as any)
        vi.mocked(verifyPassword).mockResolvedValue(true)
    })

    const REQUEST_BODY = { email: 'test@test.com', password: 'password' }

    it('defaults to 7d when env is unset', async () => {
        delete process.env.JWT_REFRESH_EXPIRES_IN
        await POST(makeRequest(REQUEST_BODY))
        expect(mockCookieSet).toHaveBeenCalled()
        expect(mockCookieSet).toHaveBeenCalledWith(
            expect.objectContaining({ maxAge: 7 * 24 * 60 * 60 })
        )
    })

    it('parses plain number as seconds', async () => {
        process.env.JWT_REFRESH_EXPIRES_IN = '3600'
        await POST(makeRequest(REQUEST_BODY))
        expect(mockCookieSet).toHaveBeenCalledWith(expect.objectContaining({ maxAge: 3600 }))
    })

    it('parses "d" suffix as days', async () => {
        process.env.JWT_REFRESH_EXPIRES_IN = '2d'
        await POST(makeRequest(REQUEST_BODY))
        expect(mockCookieSet).toHaveBeenCalledWith(
            expect.objectContaining({ maxAge: 2 * 24 * 60 * 60 })
        )
    })

    it('parses "h" suffix as hours', async () => {
        process.env.JWT_REFRESH_EXPIRES_IN = '12h'
        await POST(makeRequest(REQUEST_BODY))
        expect(mockCookieSet).toHaveBeenCalledWith(
            expect.objectContaining({ maxAge: 12 * 60 * 60 })
        )
    })

    it('parses "m" suffix as minutes', async () => {
        process.env.JWT_REFRESH_EXPIRES_IN = '30m'
        await POST(makeRequest(REQUEST_BODY))
        expect(mockCookieSet).toHaveBeenCalledWith(expect.objectContaining({ maxAge: 30 * 60 }))
    })

    it('fall back to 7d for unrecognized suffix', async () => {
        process.env.JWT_REFRESH_EXPIRES_IN = '30z'
        await POST(makeRequest(REQUEST_BODY))
        expect(mockCookieSet).toHaveBeenCalledWith(
            expect.objectContaining({ maxAge: 7 * 24 * 60 * 60 })
        )
    })

    it('falls back to 7d for unrecognized format', async () => {
        process.env.JWT_REFRESH_EXPIRES_IN = 'invalid'
        await POST(makeRequest(REQUEST_BODY))
        expect(mockCookieSet).toHaveBeenCalledWith(
            expect.objectContaining({ maxAge: 7 * 24 * 60 * 60 })
        )
    })
})
