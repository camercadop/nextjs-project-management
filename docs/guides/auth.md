# How To: Authentication

## Protect a Route with Auth Middleware

Every protected route must call `authMiddleware` as its first step:

```ts
import { authMiddleware } from '@/lib/middleware/auth'

export async function GET(req: Request) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth

    // auth.user contains { id, email }
    // auth.payload contains the decoded JWT claims
}
```

The middleware:
1. Reads the token from the `Authorization: Bearer <token>` header or the `accessToken` httpOnly cookie.
2. Verifies the JWT signature and expiration.
3. Fetches the user from the database.
4. Returns the user object on success, or a `Response` (401) on failure.

## Enforce Workspace Roles

Use `requireWorkspaceRole` when an action requires a specific role (e.g., only owners can delete a workspace):

```ts
import { requireWorkspaceRole } from '@/lib/middleware/workspace'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await authMiddleware(req)
    if (auth instanceof Response) return auth
    const { id } = await params

    const member = await requireWorkspaceRole(auth.user.id, id, ['OWNER'])
    if (!member) {
        return NextResponse.json({ error: { code: 'workspace.forbidden' } }, { status: 403 })
    }

    // proceed with deletion...
}
```

### Available roles

| Role | Description |
|------|-------------|
| `OWNER` | Full control over the workspace |
| `MEMBER` | Can view and manage projects/issues |

## Check Workspace Membership (Any Role)

When you only need to verify the user belongs to the workspace (regardless of role):

```ts
import { getWorkspaceMember } from '@/lib/middleware/workspace'

const member = await getWorkspaceMember(auth.user.id, workspaceId)
if (!member) {
    return NextResponse.json({ error: { code: 'workspace.not_found' } }, { status: 404 })
}
```

Returning 404 (instead of 403) avoids leaking whether the workspace exists to unauthorized users.

## Add 2FA/OTP to a Flow

The project uses `otplib` for TOTP-based two-factor authentication.

### 1. Enable OTP for a user

Store the generated secret in the `otpSecret` field and set `otpEnabled` to `true`:

```ts
import { generateOtpSecret } from '@/lib/auth'

const secret = generateOtpSecret()
await prisma.user.update({
    where: { id: userId },
    data: { otpSecret: secret, otpEnabled: true },
})
```

### 2. Verify OTP during login

After password verification, check if the user has OTP enabled and validate the token:

```ts
import { verifyOtp } from '@/lib/auth'

if (user.otpEnabled) {
    const valid = verifyOtp(user.otpSecret!, otpToken)
    if (!valid) {
        return NextResponse.json({ error: { code: 'auth.invalid_otp' } }, { status: 401 })
    }
}
```

## Token Refresh Flow

The client uses `lib/fetch-auth.ts` which automatically:
1. Sends requests with the `accessToken` cookie.
2. On 401, calls `POST /api/auth/refresh-token` to get a new access token.
3. Retries the original request.

No manual intervention is needed on the frontend when using `fetchAuth()`.
