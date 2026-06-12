# Next.js Project Management

Plataforma SaaS de gestión de proyectos orientada a equipos pequeños y medianos, construida con Next.js 16.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** SQLite via Prisma ORM
- **Auth:** JWT (access + refresh tokens) + bcrypt + OTP (2FA via otplib)
- **Email:** Nodemailer (Gmail)
- **i18n:** i18next
- **Styling:** Tailwind CSS 4
- **Testing:** Vitest + @vitest/coverage-v8

## Características

- Autenticación con JWT (access + refresh token en httpOnly cookie)
- Protección contra timing attacks en login
- Soporte para 2FA/OTP
- Recuperación de contraseña por email
- Internacionalización (es/en)
- Tests de integración automatizados

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

### Environment Variables

Copia `.env` y configura según sea necesario:

| Variable | Descripción |
|----------|-------------|
| `JWT_ACCESS_SECRET` | Secreto para firmar access tokens |
| `JWT_REFRESH_SECRET` | Secreto para firmar refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Expiración del access token (ej: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del refresh token (ej: `3d`) |
| `DATABASE_URL` | Connection string de SQLite |
| `GMAIL_USER` | Cuenta Gmail para envío de correos |
| `GMAIL_PASS` | App password de Gmail |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Idioma por defecto (`es`) |
| `NEXT_PUBLIC_SUPPORTED_LOCALES` | Idiomas soportados (`es,en`) |

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
  api/auth/       → Route handlers de autenticación
lib/
  middleware/     → Auth middleware (verificación de token)
  types/          → Tipos TypeScript (auth)
  auth.ts         → Utilidades de password, JWT y OTP
  email.ts        → Transporte de email (Nodemailer)
  i18n.ts         → Configuración de internacionalización
  prisma.ts       → Cliente Prisma
prisma/
  schema.prisma   → Schema de base de datos
  migrations/     → Migraciones
tests/
  integration/    → Tests de integración
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
