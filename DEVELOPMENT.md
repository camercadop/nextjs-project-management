# Development Guide

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL running locally

## Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=3d
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
NEXT_PUBLIC_DEFAULT_LOCALE=es
NEXT_PUBLIC_SUPPORTED_LOCALES=es,en
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests with Vitest |

## Database

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Project Structure

```
app/
  (auth)/             → Auth pages (login, register, forgot-password)
  (dashboard)/        → Protected pages (workspaces, projects, issues)
  api/                → Route handlers
lib/
  middleware/         → Auth & workspace middleware
  validators/         → Zod schemas
  types/              → TypeScript types
prisma/
  schema.prisma       → Database schema
  migrations/         → Migration files
tests/
  integration/        → Integration tests
docs/
  ERD.md              → Entity Relationship Diagram
```

## Conventions

- **Auth:** JWT access + refresh tokens stored in httpOnly cookies
- **Validation:** Zod schemas in `lib/validators/`
- **i18n:** Use `i18next` — client config in `lib/i18n.ts`, server in `lib/i18n-server.ts` (see [i18n usage](#i18n-usage) below)
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Testing:** Integration tests with Vitest in `tests/integration/`

## i18n Usage

Translation files live in `public/locales/{lng}/{namespace}.json`.

### Server Components

Use the `t()` helper from `lib/i18n-server.ts`:

```tsx
import { t } from '@/lib/i18n-server'

export default async function MyPage() {
    return <h1>{t('dashboard.title', 'dashboard')}</h1>
}
```

Signature: `t(key: string, ns?: string, lng?: string)`

- `key` — translation key (e.g. `issue.status_backlog`)
- `ns` — namespace matching the JSON filename (e.g. `'issue'`, `'dashboard'`), defaults to `'common'`
- `lng` — language code, defaults to `NEXT_PUBLIC_DEFAULT_LOCALE` (rarely needed)

### Rules

- Never hardcode user-facing strings — always use translation keys
- Group keys by namespace: `common.json`, `issue.json`, `dashboard.json`, etc.
- Add new keys to **all** supported locale files (`es`, `en`)
- Use lowercase snake_case for keys: `issue.status_in_progress`

## Branching

- `main` — production-ready code
- `dev` — active development
- Feature branches: `feature/short-description`
- Bugfix branches: `fix/short-description`
