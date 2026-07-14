# How To: Database

## Add a New Model

### 1. Define the model in `prisma/schema.prisma`

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  completed   Boolean  @default(false)
  projectId   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

### 2. Add the reverse relation on the parent model

```prisma
model Project {
  // ...existing fields
  tasks       Task[]
}
```

### 3. Generate and apply the migration

```bash
npx prisma migrate dev --name add_task_model
```

This generates the migration SQL in `prisma/migrations/` and updates the Prisma client.

### 4. Verify with Prisma Studio

```bash
npx prisma studio
```

## Create a Migration

```bash
# Create migration from schema changes
npx prisma migrate dev --name descriptive_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (drops all data)
npx prisma migrate reset
```

Migration naming convention: `snake_case` describing the change (e.g., `add_task_model`, `add_priority_to_issue`).

## Add Relations Between Models

### One-to-many

```prisma
model Parent {
  id       String  @id @default(uuid())
  children Child[]
}

model Child {
  id       String @id @default(uuid())
  parentId String
  parent   Parent @relation(fields: [parentId], references: [id], onDelete: Cascade)
}
```

### Many-to-many (explicit join table)

```prisma
model User {
  id          String            @id @default(uuid())
  workspaces  WorkspaceMember[]
}

model Workspace {
  id      String            @id @default(uuid())
  members WorkspaceMember[]
}

model WorkspaceMember {
  id          String    @id @default(uuid())
  userId      String
  workspaceId String
  role        String    @default("MEMBER")
  user        User      @relation(fields: [userId], references: [id])
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
}
```

### Optional relation

Use `?` on both the field and the relation:

```prisma
model Issue {
  assigneeId String?
  assignee   User?   @relation(fields: [assigneeId], references: [id], onDelete: SetNull)
}
```

## Add an Index

```prisma
model ActivityEvent {
  // ...fields
  @@index([workspaceId, createdAt])
}
```

## Common Patterns

### UUID primary keys

All models use `@id @default(uuid())` for primary keys.

### Timestamps

Include `createdAt` and `updatedAt` on every model:

```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

### Cascade deletes

Use `onDelete: Cascade` when child records should be removed with the parent. Use `onDelete: SetNull` for optional references that should be nullified.
