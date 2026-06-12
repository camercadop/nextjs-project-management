const mockCookieDelete = vi.fn()

vi.mock('next/headers', () => ({
    cookies: vi.fn(() => Promise.resolve({ delete: mockCookieDelete })),
}))

import { POST } from '@/app/api/auth/logout/route'

describe('POST /api/auth/logout', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should delete refreshToken cookie and return 200', async () => {
        const res = await POST()
        expect(res.status).toBe(200)
        expect(mockCookieDelete).toHaveBeenCalledWith('refreshToken')
    })

    it('should return ok: true in response body', async () => {
        const res = await POST()
        const json = await res.json()
        expect(json.ok).toBe(true)
    })
})
