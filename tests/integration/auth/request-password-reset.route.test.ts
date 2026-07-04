vi.mock('@/lib/prisma', () => ({
    prisma: { user: { findUnique: vi.fn(), update: vi.fn() } },
}))

vi.mock('@/lib/email', () => ({
    sendMail: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/lib/i18n-server', () => ({
    t: vi.fn((key: string) => key),
}))

import { POST } from '@/app/api/auth/request-password-reset/route'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/email'

function makeRequest(body: unknown) {
    return new Request('http://localhost/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
}

describe('POST /api/auth/request-password-reset', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return 400 if email is missing', async () => {
        const res = await POST(makeRequest({}))
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.error.code).toBe('auth.email_required')
    })

    it('should return 404 if user does not exist', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

        const res = await POST(makeRequest({ email: 'ghost@test.com' }))
        expect(res.status).toBe(404)
        const json = await res.json()
        expect(json.error.code).toBe('auth.user_not_found')
    })

    it('should update user with reset token and send email on success', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'user@test.com' } as any)
        vi.mocked(prisma.user.update).mockResolvedValue({} as any)

        const res = await POST(makeRequest({ email: 'user@test.com' }))
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.ok).toBe(true)

        expect(prisma.user.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { email: 'user@test.com' },
                data: expect.objectContaining({
                    resetToken: expect.any(String),
                    resetTokenExpiry: expect.any(Date),
                }),
            })
        )
        expect(sendMail).toHaveBeenCalledWith('user@test.com', expect.any(String), expect.any(String))
    })

    it('should still return ok even if sendMail fails', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: '1', email: 'user@test.com' } as any)
        vi.mocked(prisma.user.update).mockResolvedValue({} as any)
        vi.mocked(sendMail).mockRejectedValue(new Error('smtp down'))

        const res = await POST(makeRequest({ email: 'user@test.com' }))
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json.ok).toBe(true)
    })

    it('should return 500 on unexpected error', async () => {
        vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('db down'))

        const res = await POST(makeRequest({ email: 'user@test.com' }))
        expect(res.status).toBe(500)
        const json = await res.json()
        expect(json.error.code).toBe('server.error')
    })
})
