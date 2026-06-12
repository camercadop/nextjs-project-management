# Testing Guidelines

## Stack

- **Framework:** [Vitest](https://vitest.dev/) v4
- **Coverage:** v8 provider (text reporter)
- **Globals:** enabled (`describe`, `it`, `expect`, `vi` available without imports)

## Running Tests

```bash
npm test            # run all tests
npx vitest --coverage  # run with coverage report
```

## Project Structure

```
tests/
├── unit/
│   └── <domain>/
│       └── <subject>.test.ts
├── integration/
│   └── <domain>/
│       └── <subject>.test.ts
├── e2e/
│   └── <domain>/
│       └── <subject>.test.ts
├── helpers/       # shared utilities for tests
└── fixtures/      # mock data and reusable test objects
```

### Rules

- All tests live under `tests/` — never colocate tests with source code.
- First level groups by test type: `unit/`, `integration/`, `e2e/`.
- Name test files as `<subject>.test.ts`.

## Conventions

### Mocking

- Use `vi.mock()` at the top of the file for module-level mocks.
- Mock external dependencies (Prisma, `next/headers`, utilities) — never hit real databases or services.
- Call `vi.clearAllMocks()` in `beforeEach` to prevent state leakage between tests.

### Request Helpers

Create factory functions (e.g. `makeRequest`) to build `Request` objects for route handler tests.

### Assertions

- Assert HTTP status codes first, then response body.
- Use `expect.objectContaining()` for partial object matching.

### Environment Variables

- Manipulate `process.env` within tests to cover configuration branches.
- Clean up with `delete process.env.VAR` or restore in `beforeEach`.

## Best Practices

- Test one behavior per `it` block — keep tests focused and descriptive.
- Use the Arrange → Act → Assert pattern.
- Prefer explicit assertions over snapshot tests for business logic.
- Avoid testing implementation details; test inputs and outputs.
- Keep tests independent — no test should depend on the execution order of another.
- Name tests as sentences that describe expected behavior.
- Avoid logic (conditionals, loops) inside tests.
- Colocate related setup in `describe` blocks with shared `beforeEach`.

## Path Aliases

The `@` alias resolves to the project root (configured in `vitest.config.js`), matching the Next.js `tsconfig` paths.
