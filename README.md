# Next.js Project Management

SaaS project management platform for small and medium teams, built with Next.js 16.

🚀 **Demo:** [https://nextjs-project-management-desarrollador7backend.vercel.app](https://nextjs-project-management-desarrollador7backend.vercel.app/)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT (access + refresh tokens) + bcrypt + OTP (2FA via otplib)
- **Email:** Nodemailer (Gmail)
- **i18n:** i18next
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest + @vitest/coverage-v8

## Features

- JWT authentication (access + refresh token in httpOnly cookie)
- Timing attack protection on login
- 2FA/OTP support
- Password recovery via email
- Workspaces with roles (OWNER / MEMBER)
- Projects with statuses (ACTIVE / ARCHIVED)
- Issues with priority (LOW / MEDIUM / HIGH / CRITICAL) and statuses (BACKLOG / TODO / IN_PROGRESS / DONE)
- Issue change history
- Filters by status, priority, and assignee
- Internationalization (es/en)
- Zod validation
- UI with shadcn/ui + dark mode
- Automated integration tests

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL

### Installation

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

### Environment Variables

Copy `.env` and configure as needed:

| Variable | Description |
|----------|-------------|
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiration (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration (e.g. `3d`) |
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@localhost:5432/db`) |
| `GMAIL_USER` | Gmail account for sending emails |
| `GMAIL_PASS` | Gmail app password |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default language (`es`) |
| `NEXT_PUBLIC_SUPPORTED_LOCALES` | Supported languages (`es,en`) |
| `NEXT_PUBLIC_REGISTRATION_ENABLED` | Enable user registration (`true` / `false`) |

### Development

```bash
npm run dev
```

### Testing

```bash
npm test
```

## Project Structure

```
app/
  (auth)/             → Authentication pages (login, register, forgot-password)
  (dashboard)/        → Protected pages (workspaces, projects, issues)
  api/
    auth/             → Authentication route handlers
    workspaces/       → Workspaces and members CRUD
    projects/         → Projects CRUD
    issues/           → Issues CRUD + history
lib/
  middleware/         → Auth and workspace middleware
  validators/         → Zod schemas (auth, workspace, project, issue)
  types/              → TypeScript types
  auth.ts             → Password, JWT, and OTP utilities
  email.ts            → Email transport (Nodemailer)
  fetch-auth.ts       → Fetch wrapper with automatic auth
  i18n.ts             → Internationalization config (client)
  i18n-server.ts      → Internationalization config (server)
  prisma.ts           → Prisma client
  utils.ts            → General utilities
prisma/
  schema.prisma       → Database schema
  migrations/         → Migrations
tests/
  integration/        → Integration tests
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm test` | Vitest |

## Diagrams

### System Context (C4 Level 0)

```mermaid
flowchart TD
    user["User<br/><i>Team member who<br/>manages projects and issues</i>"]
    pm["Project Management Platform<br/><i>SaaS application for project management</i>"]
    gmail["Gmail SMTP<br/><i>External email sending<br/>service</i>"]
    postgres[("PostgreSQL<br/><i>Stores users, workspaces,<br/>projects and issues</i>")]

    user -->|"HTTPS"| pm
    pm -->|"SMTP/TLS"| gmail
    pm -->|"TCP/SQL"| postgres
```

### Layered Architecture

```mermaid
flowchart TD
    A["Client<br/>(React 19 + Server Components)"] --> B["Next.js App Router<br/>Route Handlers + Server Components"]
    B --> C["Middleware Layer<br/>Auth Middleware + Workspace RBAC"]
    C --> D["Validation Layer<br/>Zod Schemas"]
    D --> E["Data Layer<br/>Prisma ORM + PostgreSQL"]
```

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ WorkspaceMember : "has memberships"
    Workspace ||--o{ WorkspaceMember : "has members"
    Workspace ||--o{ Project : "contains"
    Project ||--o{ Issue : "contains"
    User ||--o{ Issue : "is assigned"
    Issue ||--o{ IssueHistory : "tracks changes"
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Server
    participant DB

    Browser->>Server: POST /api/auth/login (email + password)
    Server->>DB: Find user by email
    DB-->>Server: User record
    Server->>Server: Verify password (bcrypt)
    Server-->>Browser: Set-Cookie: accessToken (15m) + refreshToken (7d)

    Browser->>Server: GET /api/workspaces (cookie: accessToken)
    Server->>Server: Verify JWT
    Server-->>Browser: 200 OK + data

    Browser->>Server: GET /api/workspaces (expired token)
    Server-->>Browser: 401 Unauthorized
    Browser->>Server: POST /api/auth/refresh-token (cookie: refreshToken)
    Server-->>Browser: Set-Cookie: new accessToken
    Browser->>Server: Retry GET /api/workspaces
    Server-->>Browser: 200 OK + data
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System architecture, C4 diagrams, auth flows, and technical decisions |
| [ERD](docs/ERD.md) | Entity-relationship diagram, model descriptions, and constraints |
| [Development](DEVELOPMENT.md) | Setup guide, scripts, conventions, code style, and documentation rules |
| [Testing](TESTING.md) | Testing strategy, file structure, and best practices |
| [Page Development](PAGE_DEVELOPMENT.md) | Patterns for page development with App Router |
