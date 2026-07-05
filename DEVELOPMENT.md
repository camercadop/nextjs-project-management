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

## Documentation & Code Style

### Naming

- `kebab-case` for files
- `PascalCase` for React components
- `camelCase` for utilities/functions

### Formatting

- Indentation: 4 spaces, no tabs
- Line length: ≤100 characters
- Quotes: Single quotes for strings (except JSON)
- Trailing commas in multiline objects/arrays
- Blank lines to separate logical sections
- Imports grouped in order: external modules → absolute aliased imports → relative imports; alphabetical within groups
- Prefer named exports; default export only for single-component modules
- Run `npm run lint` before committing

### JSDoc Rules

1. **Every exported function, class, and type** must have a JSDoc block directly above the declaration.
2. **JSDoc must include:**
   - A brief one-line description of what it does.
   - `@param` tag for each parameter with description.
   - `@returns` tag describing the return value.
   - `@throws` tag if the function can throw (describe when/why).
3. **No empty lines** between the JSDoc block and the declaration.
4. **Separate** each JSDoc block from surrounding code with a blank line above.
5. Prefer **type inference** where possible, but be explicit for public API.

### Comments

- Inline comments only when the logic is non-obvious. Do not restate what the code already says.
- React components: Document props via JSDoc on the component function or a dedicated `Props` type/interface.
- Constants and config objects: Add a brief JSDoc comment explaining purpose if not self-evident from the name.
- Zod schemas: Add a comment above the schema describing what it validates and where it's used.

### Markdown (docs, READMEs)

- Use GitHub Flavored Markdown
- Headings hierarchy: `#` (title), `##` (section), `###` (sub-section)
- Write in active voice, present tense
- Use bullet points for lists; avoid excessive nesting
- Include code fences with language identifiers for all snippets

### Documentation Structure

| Section | File/Location | Description |
|---|---|---|
| Project Overview | `README.md` | High-level description, links to demo, quick start |
| Architecture | `docs/ARCHITECTURE.md` | C4 diagrams, key components, data flow |
| Development | `DEVELOPMENT.md` | Setup, scripts, conventions, code style |
| ERD | `docs/ERD.md` | Entity-relationship diagram and model descriptions |
| Testing | `TESTING.md` | Testing strategy, structure, best practices |
| Page Development | `PAGE_DEVELOPMENT.md` | Patterns for App Router page development |

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
