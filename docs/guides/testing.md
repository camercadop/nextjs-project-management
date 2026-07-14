# How To: Testing

## Unit Tests

Unit tests live in `tests/unit/<domain>/` and test pure logic without database access.

### Test a Utility / Pure Function

File: `tests/unit/<domain>/<module>.test.ts`

```ts
vi.hoisted(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret'
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
})

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(() => Promise.resolve('hashed')),
        compare: vi.fn(),
    },
}))

import bcrypt from 'bcryptjs'
import { hashPassword, verifyPassword } from '@/lib/auth'

describe('password utilities', () => {
    beforeEach(() => vi.clearAllMocks())

    it('hashPassword should call bcrypt.hash with cost 12', async () => {
        await hashPassword('mypass')
        expect(bcrypt.hash).toHaveBeenCalledWith('mypass', 12)
    })

    it('verifyPassword should return false on mismatch', async () => {
        vi.mocked(bcrypt.compare).mockResolvedValue(false as never)
        const result = await verifyPassword('wrong', 'hash')
        expect(result).toBe(false)
    })
})
```

Key patterns:
- Use `vi.hoisted()` to set environment variables before module loading.
- Mock external libraries (`bcryptjs`, `jsonwebtoken`, `otplib`) to isolate logic.
- No database access — test inputs and outputs only.

### Test Zod Validators

File: `tests/unit/validators/validators.test.ts`

Validator tests verify both valid and invalid payloads without mocking:

```ts
import { createProjectSchema } from '@/lib/validators/project'

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

    it('should accept optional fields', () => {
        expect(createProjectSchema.safeParse({ name: 'P', description: 'Desc' }).success).toBe(true)
    })
})
```

Validator test checklist:
- [ ] Valid payload with required fields only
- [ ] Valid payload with all optional fields
- [ ] Each required field missing
- [ ] Each field with boundary values (min/max length)
- [ ] Invalid enum values
- [ ] Invalid format (e.g., non-UUID, invalid email)

---

## Integration Tests

### Write an Integration Test for a Route

Tests live in `tests/integration/<resource>/` and follow the naming pattern `<action>.route.test.ts`.

### 1. Create the test file

```
tests/integration/<resource>/<action>.route.test.ts
```

### 2. Mock dependencies

Mock Prisma, auth middleware, and workspace middleware at the top of the file:

```ts
vi.mock('@/lib/prisma', () => ({
    prisma: {
        myModel: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
        activityEvent: { create: vi.fn() },
    },
}))

vi.mock('@/lib/middleware/auth', () => ({
    authMiddleware: vi.fn(),
}))

vi.mock('@/lib/middleware/workspace', () => ({
    getWorkspaceMember: vi.fn(),
}))
```

### 3. Import the route handler and mocked modules

```ts
import { POST, GET } from '@/app/api/<resource>/route'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'
import { getWorkspaceMember } from '@/lib/middleware/workspace'
```

### 4. Create a request helper

```ts
function makeRequest(body?: unknown, query = '') {
    return new Request(`http://localhost/api/<resource>${query}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
    })
}
```

### 5. Write test cases

```ts
describe('POST /api/<resource>', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authMiddleware).mockResolvedValue({
            user: { id: 'u1', email: 'a@b.com' },
            payload: {} as any,
        })
        vi.mocked(getWorkspaceMember).mockResolvedValue({
            id: 'm1', role: 'MEMBER',
        } as any)
    })

    it('should return 400 on invalid input', async () => {
        const res = await POST(makeRequest({}), { params })
        expect(res.status).toBe(400)
    })

    it('should return 201 on success', async () => {
        vi.mocked(prisma.myModel.create).mockResolvedValue({ id: '1' } as any)
        const res = await POST(makeRequest({ name: 'Test' }), { params })
        expect(res.status).toBe(201)
        const json = await res.json()
        expect(json.ok).toBe(true)
    })
})
```

## Mock Authentication

### Authenticated user (default for most tests)

```ts
vi.mocked(authMiddleware).mockResolvedValue({
    user: { id: 'u1', email: 'a@b.com' },
    payload: {} as any,
})
```

### Unauthenticated request (simulate 401)

```ts
vi.mocked(authMiddleware).mockResolvedValue(
    new Response(JSON.stringify({ error: { code: 'auth.token_required' } }), { status: 401 })
)
```

## Mock Workspace Membership

### User is a member

```ts
vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1', role: 'MEMBER' } as any)
```

### User is not a member

```ts
vi.mocked(getWorkspaceMember).mockResolvedValue(null)
```

### User is an owner

```ts
vi.mocked(getWorkspaceMember).mockResolvedValue({ id: 'm1', role: 'OWNER' } as any)
```

## Test Checklist

Every route handler should have tests covering:

- [ ] Unauthenticated request returns 401
- [ ] Non-member returns 404
- [ ] Invalid input returns 400
- [ ] Successful operation returns correct status (200/201)
- [ ] Role-restricted actions return 403 for insufficient role

## Test File Structure

```
tests/
  unit/
    auth/
      auth.test.ts              → Pure auth utility tests
    validators/
      validators.test.ts        → Zod schema validation tests
  integration/
    auth/
      login.route.test.ts       → Login endpoint tests
    projects/
      workspace-projects.route.test.ts
    issues/
      issue.route.test.ts
    workspaces/
      create.route.test.ts
```

## Run Tests

```bash
# Run all tests
npm test

# Run only unit tests
npx vitest tests/unit/

# Run only integration tests
npx vitest tests/integration/

# Run a specific test file
npx vitest tests/integration/projects/workspace-projects.route.test.ts

# Run tests in watch mode
npx vitest --watch
```
