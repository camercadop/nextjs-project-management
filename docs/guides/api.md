# How To: API Routes

## Create a New Route Handler

Route handlers live in `app/api/` following the Next.js App Router file convention.

### 1. Create the route file

```
app/api/<resource>/route.ts          → /api/<resource>
app/api/<resource>/[id]/route.ts     → /api/<resource>/:id
```

### 2. Define the handler

Export named functions matching HTTP methods (`GET`, `POST`, `PATCH`, `DELETE`):

```ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authMiddleware } from '@/lib/middleware/auth'

export async function GET(req: Request) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth

    const data = await prisma.myModel.findMany()
    return NextResponse.json({ ok: true, data })
}
```

### 3. Handle dynamic params

For routes with path parameters, use the `params` promise pattern:

```ts
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    // use id...
}
```

## Add Request Validation with Zod

### 1. Create a validator schema

Add a file in `lib/validators/<resource>.ts`:

```ts
import { z } from 'zod'

export const createMyResourceSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
})

export const updateMyResourceSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
})
```

### 2. Use the schema in the route handler

```ts
import { createMyResourceSchema } from '@/lib/validators/my-resource'

export async function POST(req: Request) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth

    const parsed = createMyResourceSchema.safeParse(await req.json())
    if (!parsed.success) {
        return NextResponse.json({ error: { code: 'validation.invalid' } }, { status: 400 })
    }

    // Use parsed.data (fully typed)
}
```

## Handle Errors Consistently

All error responses follow the same shape:

```json
{ "error": { "code": "domain.error_code" } }
```

### Standard error patterns

| Scenario | Code | Status |
|----------|------|--------|
| Missing/invalid token | `auth.token_required` | 401 |
| Unauthorized | `auth.unauthorized` | 401 |
| Resource not found | `<resource>.not_found` | 404 |
| Validation failure | `validation.invalid` | 400 |
| Forbidden (role) | `workspace.forbidden` | 403 |

### Example

```ts
if (!resource) {
    return NextResponse.json({ error: { code: 'resource.not_found' } }, { status: 404 })
}
```

## Record Activity Events

When a route performs a significant action, record it for the workspace feed:

```ts
import { recordActivity } from '@/lib/activity'

await recordActivity({
    type: 'PROJECT_CREATED',
    userId: auth.user.id,
    workspaceId: id,
    metadata: { projectId: project.id, projectName: project.name },
})
```

Available activity types are defined in `lib/activity.ts`.
