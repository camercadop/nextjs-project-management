vi.hoisted(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret'
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
})

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(() => Promise.resolve('hashed')),
        hashSync: vi.fn(() => '$2a$12$dummy'),
        compare: vi.fn(),
    },
}))

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'signed-token'),
        verify: vi.fn(),
    },
}))

vi.mock('otplib', () => ({
    generateSecret: vi.fn(() => 'OTP_SECRET'),
    generateURI: vi.fn(() => 'otpauth://totp/MyApp:a@b.com?secret=OTP_SECRET'),
    verifySync: vi.fn(),
}))

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { verifySync } from 'otplib'
import {
    hashPassword,
    verifyPassword,
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateOtpSecret,
    getOtpQrUri,
    verifyOtp,
} from '@/lib/auth'

describe('password utilities', () => {
    beforeEach(() => vi.clearAllMocks())

    it('hashPassword should call bcrypt.hash with cost 12', async () => {
        await hashPassword('mypass')
        expect(bcrypt.hash).toHaveBeenCalledWith('mypass', 12)
    })

    it('verifyPassword should call bcrypt.compare', async () => {
        vi.mocked(bcrypt.compare).mockResolvedValue(true as never)
        const result = await verifyPassword('pass', 'hash')
        expect(bcrypt.compare).toHaveBeenCalledWith('pass', 'hash')
        expect(result).toBe(true)
    })

    it('verifyPassword should return false on mismatch', async () => {
        vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
        const result = await verifyPassword('wrong', 'hash')
        expect(result).toBe(false)
    })
})

describe('JWT utilities', () => {
    beforeEach(() => vi.clearAllMocks())

    it('signAccessToken should sign with access secret', () => {
        const token = signAccessToken({ userId: '1' })
        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: '1' },
            'test-access-secret',
            expect.objectContaining({ expiresIn: '15m' })
        )
        expect(token).toBe('signed-token')
    })

    it('signRefreshToken should sign with refresh secret', () => {
        signRefreshToken({ userId: '1' })
        expect(jwt.sign).toHaveBeenCalledWith(
            { userId: '1' },
            'test-refresh-secret',
            expect.any(Object)
        )
    })

    it('verifyAccessToken should verify with access secret', () => {
        vi.mocked(jwt.verify).mockReturnValue({ userId: '1' } as any)
        const payload = verifyAccessToken('token')
        expect(jwt.verify).toHaveBeenCalledWith('token', 'test-access-secret')
        expect(payload.userId).toBe('1')
    })

    it('verifyRefreshToken should verify with refresh secret', () => {
        vi.mocked(jwt.verify).mockReturnValue({ userId: '1' } as any)
        verifyRefreshToken('token')
        expect(jwt.verify).toHaveBeenCalledWith('token', 'test-refresh-secret')
    })

    it('verifyAccessToken should throw on invalid token', () => {
        vi.mocked(jwt.verify).mockImplementation(() => { throw new Error('invalid') })
        expect(() => verifyAccessToken('bad')).toThrow()
    })
})

describe('OTP utilities', () => {
    beforeEach(() => vi.clearAllMocks())

    it('generateOtpSecret should return a secret', () => {
        expect(generateOtpSecret()).toBe('OTP_SECRET')
    })

    it('getOtpQrUri should return a URI with email and secret', () => {
        const uri = getOtpQrUri('a@b.com', 'SECRET')
        expect(uri).toContain('otpauth://')
    })

    it('verifyOtp should return true for valid token', () => {
        vi.mocked(verifySync).mockReturnValue({ valid: true } as any)
        expect(verifyOtp('123456', 'SECRET')).toBe(true)
    })

    it('verifyOtp should return false for invalid token', () => {
        vi.mocked(verifySync).mockReturnValue({ valid: false } as any)
        expect(verifyOtp('000000', 'SECRET')).toBe(false)
    })
})
