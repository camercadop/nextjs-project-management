vi.mock('@/lib/prisma', () => ({
    prisma: { user: { findUnique: vi.fn(), update: vi.fn() } },
}))

vi.mock('@/lib/auth', () => ({
    hashPassword: vi.fn(() => Promise.resolve('hashed_new_password')),
}))

import { POST } from '@/app/api/auth/reset-password/route'
import { prisma } from '@/lib/prisma'

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
}

describe('POST /api/auth/reset-password', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 400 if token is missing', async () => {
        const res = await POST(makeRequest({ password: 'newpass123' }))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('auth.invalid_fields')
    })

    it('should return 400 if password is missing', async () => {
        const res = await POST(makeRequest({ token: 'abc123' }))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('auth.invalid_fields')
    })

    it('should return 400 if password is too short', async () => {
        const res = await POST(makeRequest({ token: 'abc123', password: '123' }))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('auth.invalid_fields')
    })

    it('should return 400 if token does not match any user', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

        const res = await POST(makeRequest({ token: 'invalid_token', password: 'newpass123' }))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('auth.invalid_or_expired_token')
    })

    it('should return 400 if token is expired', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: '1',
            email: 'user@test.com',
            resetToken: 'valid_token',
            resetTokenExpiry: new Date(Date.now() - 3600_000), // expired 1h ago
        } as any)

        const res = await POST(makeRequest({ token: 'valid_token', password: 'newpass123' }))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('auth.invalid_or_expired_token')
    })

    it('should update password and clear reset token on success', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
            id: '1',
            email: 'user@test.com',
            resetToken: 'valid_token',
            resetTokenExpiry: new Date(Date.now() + 3600_000), // expires in 1h
        } as any)
        vi.mocked(prisma.user.update).mockResolvedValue({} as any)

        const res = await POST(makeRequest({ token: 'valid_token', password: 'newpass123' }))
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.ok).toBe(true)

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: {
                hashedPassword: 'hashed_new_password',
                resetToken: null,
                resetTokenExpiry: null,
            },
        })
    })
})
