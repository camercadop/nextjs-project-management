import { loginSchema, registerSchema, resetPasswordSchema, requestPasswordResetSchema, otpVerifySchema } from '@/lib/validators/auth'
import { createIssueSchema, updateIssueSchema } from '@/lib/validators/issue'
import { createProjectSchema, updateProjectSchema } from '@/lib/validators/project'
import { createWorkspaceSchema, updateWorkspaceSchema, inviteMemberSchema } from '@/lib/validators/workspace'

describe('auth validators', () => {
    describe('loginSchema', () => {
        it('should accept valid credentials', () => {
            const result = loginSchema.safeParse({ email: 'a@b.com', password: '123456' })
            expect(result.success).toBe(true)
        })

        it('should accept optional otp', () => {
            const result = loginSchema.safeParse({ email: 'a@b.com', password: '123456', otp: '123456' })
            expect(result.success).toBe(true)
        })

        it('should reject invalid email', () => {
            const result = loginSchema.safeParse({ email: 'invalid', password: '123456' })
            expect(result.success).toBe(false)
        })

        it('should reject short password', () => {
            const result = loginSchema.safeParse({ email: 'a@b.com', password: '12345' })
            expect(result.success).toBe(false)
        })

        it('should reject otp with wrong length', () => {
            const result = loginSchema.safeParse({ email: 'a@b.com', password: '123456', otp: '123' })
            expect(result.success).toBe(false)
        })
    })

    describe('registerSchema', () => {
        it('should accept valid data', () => {
            expect(registerSchema.safeParse({ email: 'a@b.com', password: '123456' }).success).toBe(true)
        })

        it('should reject missing email', () => {
            expect(registerSchema.safeParse({ password: '123456' }).success).toBe(false)
        })
    })

    describe('resetPasswordSchema', () => {
        it('should accept valid token and password', () => {
            expect(resetPasswordSchema.safeParse({ token: 'abc', password: '123456' }).success).toBe(true)
        })

        it('should reject empty token', () => {
            expect(resetPasswordSchema.safeParse({ token: '', password: '123456' }).success).toBe(false)
        })
    })

    describe('requestPasswordResetSchema', () => {
        it('should accept valid email', () => {
            expect(requestPasswordResetSchema.safeParse({ email: 'a@b.com' }).success).toBe(true)
        })

        it('should reject invalid email', () => {
            expect(requestPasswordResetSchema.safeParse({ email: 'nope' }).success).toBe(false)
        })
    })

    describe('otpVerifySchema', () => {
        it('should accept 6-char code', () => {
            expect(otpVerifySchema.safeParse({ code: '123456' }).success).toBe(true)
        })

        it('should reject wrong length', () => {
            expect(otpVerifySchema.safeParse({ code: '12345' }).success).toBe(false)
        })
    })
})

describe('issue validators', () => {
    describe('createIssueSchema', () => {
        it('should accept valid issue', () => {
            expect(createIssueSchema.safeParse({ title: 'Bug fix' }).success).toBe(true)
        })

        it('should accept all optional fields', () => {
            const result = createIssueSchema.safeParse({
                title: 'Bug',
                description: 'Details',
                status: 'TODO',
                priority: 'HIGH',
                assigneeId: '550e8400-e29b-41d4-a716-446655440000',
            })
            expect(result.success).toBe(true)
        })

        it('should reject empty title', () => {
            expect(createIssueSchema.safeParse({ title: '' }).success).toBe(false)
        })

        it('should reject title over 200 chars', () => {
            expect(createIssueSchema.safeParse({ title: 'x'.repeat(201) }).success).toBe(false)
        })

        it('should reject invalid status', () => {
            expect(createIssueSchema.safeParse({ title: 'X', status: 'INVALID' }).success).toBe(false)
        })

        it('should reject invalid priority', () => {
            expect(createIssueSchema.safeParse({ title: 'X', priority: 'URGENT' }).success).toBe(false)
        })

        it('should reject non-uuid assigneeId', () => {
            expect(createIssueSchema.safeParse({ title: 'X', assigneeId: 'not-uuid' }).success).toBe(false)
        })
    })

    describe('updateIssueSchema', () => {
        it('should accept partial update', () => {
            expect(updateIssueSchema.safeParse({ status: 'DONE' }).success).toBe(true)
        })

        it('should accept empty object', () => {
            expect(updateIssueSchema.safeParse({}).success).toBe(true)
        })

        it('should accept nullable assigneeId', () => {
            expect(updateIssueSchema.safeParse({ assigneeId: null }).success).toBe(true)
        })
    })
})

describe('project validators', () => {
    describe('createProjectSchema', () => {
        it('should accept valid project', () => {
            expect(createProjectSchema.safeParse({ name: 'My Project' }).success).toBe(true)
        })

        it('should reject empty name', () => {
            expect(createProjectSchema.safeParse({ name: '' }).success).toBe(false)
        })

        it('should reject name over 100 chars', () => {
            expect(createProjectSchema.safeParse({ name: 'x'.repeat(101) }).success).toBe(false)
        })

        it('should reject description over 500 chars', () => {
            expect(createProjectSchema.safeParse({ name: 'P', description: 'x'.repeat(501) }).success).toBe(false)
        })
    })

    describe('updateProjectSchema', () => {
        it('should accept partial update', () => {
            expect(updateProjectSchema.safeParse({ name: 'New' }).success).toBe(true)
        })

        it('should accept empty object', () => {
            expect(updateProjectSchema.safeParse({}).success).toBe(true)
        })
    })
})

describe('workspace validators', () => {
    describe('createWorkspaceSchema', () => {
        it('should accept valid workspace', () => {
            expect(createWorkspaceSchema.safeParse({ name: 'Team' }).success).toBe(true)
        })

        it('should reject empty name', () => {
            expect(createWorkspaceSchema.safeParse({ name: '' }).success).toBe(false)
        })
    })

    describe('updateWorkspaceSchema', () => {
        it('should accept partial update', () => {
            expect(updateWorkspaceSchema.safeParse({ description: 'New desc' }).success).toBe(true)
        })
    })

    describe('inviteMemberSchema', () => {
        it('should accept valid invite', () => {
            expect(inviteMemberSchema.safeParse({ email: 'a@b.com', role: 'MEMBER' }).success).toBe(true)
        })

        it('should reject invalid role', () => {
            expect(inviteMemberSchema.safeParse({ email: 'a@b.com', role: 'ADMIN' }).success).toBe(false)
        })

        it('should reject invalid email', () => {
            expect(inviteMemberSchema.safeParse({ email: 'bad', role: 'OWNER' }).success).toBe(false)
        })
    })
})
