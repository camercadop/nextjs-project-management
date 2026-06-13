# Page Development

## Conventions

Pages are developed following the **Next.js 16 App Router** pattern with Route Groups for logical organization.

## Route Structure

```
app/
├── (group-a)/           → Route group (does not affect URL)
│   ├── layout.tsx
│   └── feature/page.tsx
├── (group-b)/
│   └── layout.tsx
├── layout.tsx           → Root layout
└── page.tsx             → Landing page (/)
```

## UI Stack per Page

| Library | Usage |
|---------|-------|
| `react-hook-form` | Form handling |
| `zod` + `@hookform/resolvers` | Client-side validation |
| `react-i18next` | Internationalized text |
| `next/navigation` | Programmatic navigation |
| Tailwind CSS 4 | Utility styles |

## Page Development Pattern

### 1. Mark as Client Component

All interactive pages use `'use client'` at the top of the file.

### 2. Define validation schema

In `lib/validators/` with Zod:

```ts
export const mySchema = z.object({
    email: z.email(),
    name: z.string().min(1),
})
```

### 3. Infer form type

```ts
type FormData = z.infer<typeof mySchema>
```

### 4. Configure form with react-hook-form

```tsx
const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
} = useForm<FormData>({
    resolver: zodResolver(mySchema),
})
```

### 5. API communication

Pages consume internal Route Handlers via `fetch`:

```ts
const res = await fetch('/api/resource', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
})
```

### 6. Internationalization

Uses the `useTranslation` hook with a namespace:

```tsx
const { t } = useTranslation()
// Usage: t(key)
```

### 7. Post-action navigation

```ts
const router = useRouter()
router.push('/target-route')
```

## Layouts

- **Root Layout** (`app/layout.tsx`): Wraps with `I18nProvider` and `ThemeProvider`, defines fonts (Geist) and metadata.
- **Group layouts**: Each route group defines its own layout for shared structure (centering, sidebars, etc.).

## Styles

Tailwind CSS 4 utility classes are applied directly in components. Semantic colors like `bg-primary` and `text-primary-foreground` are used for interactive elements.

## Validation

Validation schemas are centralized in `lib/validators/` and shared between client (react-hook-form) and server (route handlers) to avoid duplication.
