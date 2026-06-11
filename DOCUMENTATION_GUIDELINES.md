# Documentation Guidelines

## Purpose
- Provide clear, consistent, and comprehensive documentation for developers, contributors, and users.
- Ensure information stays up‑to‑date and easy to navigate.

## General Conventions
- **File naming**: `kebab-case` for files, `PascalCase` for React components, `camelCase` for utilities/functions.
- **Indentation**: 2 spaces, no tabs.
- **Line length**: ≤ 100 characters.
- **Quotes**: Single quotes for strings (except JSON).
- **Trailing commas**: Include in multiline objects/arrays.
- **Blank lines**: Separate logical sections with a blank line.
- **Imports**: Grouped in order: external modules, absolute aliased imports, relative imports; alphabetically within groups.
- **Exports**: Prefer named exports; default export only for single‑component modules.

## Documentation Structure
| Section | File/Location | Description |
|---|---|---|
| Project Overview | `README.md` | High‑level description, screenshots, links to live demo, and quick start guide.
| Architecture | `docs/architecture.md` | High‑level diagram, key components, and data flow.
| Guides & Tutorials | `docs/guides/` | Step‑by‑step tutorials, onboarding, and common use‑cases.
| Contributing | `CONTRIBUTING.md` | How to get started, coding standards, testing, and PR workflow.
| Changelog | `CHANGELOG.md` | Human‑readable list of changes per release.

## Style Guide
- Use **GitHub Flavored Markdown**. Headings hierarchy: `#` (title), `##` (section), `###` (sub‑section).
- Write in **active voice**, present tense, and third‑person where appropriate.
- Limit line length to **100 characters** for readability.
- Use **bullet points** for lists; avoid excessive nesting.
- Include **code fences** with language identifiers for all snippets.

## JSDoc Standards (already applied in code)
- Document every exported function, class, and type.
- Use `@param {type} name - description` and `@returns {type} description`.
- Include a brief description above the tags.
- Separate logical groups of JSDoc tags (e.g., @param, @returns, @throws, @example) with a blank line.
- Keep JSDoc comments **directly above** the declaration, without empty lines.
- Separate each JSDoc block from surrounding code with a blank line.
- Prefer **type inference** where possible, but be explicit for public API.

## Code Formatting
- Use **Prettier** with the project's configuration (`.prettierrc`).
- Enforce **ESLint** rules defined in `.eslintrc`.
- Run `npm run lint` before committing.
- Keep imports **grouped**: third‑party, absolute aliases, relative paths.

---
*This document is part of the project's effort to maintain high‑quality, accessible documentation.*
