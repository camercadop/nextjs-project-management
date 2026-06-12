import { z } from 'zod'

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    otp: z.string().length(6).optional(),
})

export const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
})

export const resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(6),
})

export const requestPasswordResetSchema = z.object({
    email: z.email(),
})

export const otpVerifySchema = z.object({
    code: z.string().length(6),
})
