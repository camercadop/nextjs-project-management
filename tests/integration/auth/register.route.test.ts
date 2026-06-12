vi.mock('@/lib/prisma', () => ({
    prisma: { user: { findUnique: vi.fn(), create: vi.fn() } },
}))

vi.mock('@/lib/auth', () => ({
    hashPassword: vi.fn(() => Promise.resolve('hashed-password')),
}))

import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/prisma'

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
}

describe('POST /api/auth/register', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 400 if email or password is missing', async () => {
        const res = await POST(makeRequest({ email: '' }))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('auth.required_fields')
    })

    it('should return 400 if password is shorter than 8 characters', async () => {
        const res = await POST(makeRequest({ email: 'a@b.com', password: 'short' }))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('auth.password_too_short')
    })

    it('should return 400 if email is already in use', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'test@test.com' } as any)

        const res = await POST(makeRequest({ email: 'test@test.com', password: 'validpass1' }))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('auth.email_in_use')
    })

    it('should return 201 on successful registration', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.user.create).mockResolvedValue({ id: '1', email: 'new@test.com' } as any)

        const res = await POST(makeRequest({ email: 'New@Test.com', password: 'validpass1' }))
        expect(res.status).toBe(201)
        const json = await res.json()
        expect(json.ok).toBe(true)
        expect(json.user).toEqual(expect.objectContaining({ id: '1', email: 'new@test.com' }))
    })

    it('should lowercase email before storing', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
        vi.mocked(prisma.user.create).mockResolvedValue({ id: '1', email: 'upper@test.com' } as any)

        await POST(makeRequest({ email: 'UPPER@Test.com', password: 'validpass1' }))
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'upper@test.com' } })
    })

    it('should return 500 on unexpected error', async () => {
        vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('db error'))

        const res = await POST(makeRequest({ email: 'a@b.com', password: 'validpass1' }))
        expect(res.status).toBe(500)
        const json = await res.json()
        expect(json.error.code).toBe('server.error')
    })
})
