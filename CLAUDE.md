# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Coding Standards

**CRITICAL: NO EMOJIS IN SOURCE CODE**

Emoji characters are **strictly prohibited** in all source code files (.ts, .tsx, .js, .jsx, .py, etc.). This is a mandatory coding standard for this project.

**Why:**
- Terminal/console encoding issues on Windows systems
- Causes rendering problems in various development environments
- Not professional or maintainable code
- Breaks accessibility and screen readers
- Inconsistent display across different systems

**Rules:**
- ✅ Use text indicators: `[OK]`, `[ERROR]`, `[INFO]`, `[SUCCESS]`, `[WARNING]`, etc.
- ❌ Never use emoji characters in source code: 🚀, ✅, ❌, 💡, 🔧, etc.
- ✅ Emojis are allowed in documentation files (`.md` files only)
- ✅ Review all code before committing to ensure compliance

**Example:**
```typescript
// BAD - Will cause issues
console.log("✅ Success!");
console.log("🚀 Server started...");

// GOOD - Professional and compatible
console.log("[SUCCESS] Success!");
console.log("[START] Server started...");
```

All developers and AI agents must strictly follow this rule when modifying code.

## Project Overview

This is a B2B CRM system built as a monorepo using Turborepo. The project has Phase 1-4 complete with analytics dashboard planned.

**Current State**: Fully functional backend API + Next.js frontend with authentication, responsive layout, navigation, and complete Companies CRUD module. Ready for Contacts/Deals/Activities modules.

## Essential Commands

### Initial Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start Docker services (PostgreSQL, Redis, Mailhog)
npm run docker:up

# Generate Prisma client (required after schema changes)
cd packages/database && npx prisma generate

# Run database migrations
cd packages/database && npx prisma migrate dev

# Seed database with sample data
cd packages/database && npm run db:seed
```

### Development

```bash
# Start API server (port 4000)
npm run dev

# Build all packages
npm run build

# Lint all packages
npm run lint

# Format code
npm run format

# Run tests
npm run test
```

### Database Management

```bash
# Run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma client (after schema changes)
cd packages/database && npx prisma generate

# Create new migration
cd packages/database && npx prisma migrate dev --name your_migration_name

# Reset database (destroys data)
cd packages/database && npx prisma migrate reset
```

### Docker

```bash
# Start services
npm run docker:up

# Stop services
npm run docker:down

# Check running services
docker ps
```

### Testing API

Use the provided script:

```bash
./test-api.sh
```

Or test manually with default credentials:

- Admin: `admin@crm.local` / `admin123`
- Sales Rep: `sales@crm.local` / `sales123`

## Architecture

### Monorepo Structure

```
crm/
├── apps/
│   └── api/              # Express.js API server
│       ├── src/
│       │   ├── routes/   # API route handlers (auth, companies, contacts, deals, activities, analytics, users)
│       │   ├── middleware/ # auth.middleware.ts (JWT), error.middleware.ts
│       │   └── index.ts  # Express app setup with middleware chain
│       └── package.json
├── packages/
│   ├── database/         # Prisma schema, client, and seed data
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── index.ts     # Exports prisma client
│   └── types/           # Shared Zod schemas and TypeScript types
│       └── index.ts     # All validation schemas (login, company, contact, deal, activity)
└── package.json         # Root workspace config
```

### Package Dependencies

- `apps/api` depends on `@crm/database` and `@crm/types`
- `packages/database` exports Prisma client instance
- `packages/types` exports Zod validation schemas and TypeScript types

When adding new features that affect multiple packages, update in this order:

1. Database schema in `packages/database/schema.prisma`
2. Run `npx prisma generate` to update client
3. Add Zod schemas in `packages/types/index.ts`
4. Create/update routes in `apps/api/src/routes/`

### Authentication Flow

JWT-based authentication with two token types:

- **Access Token**: 15-minute expiration, used for API requests
- **Refresh Token**: 7-day expiration, used to get new access tokens

All routes except `/api/auth/*` require authentication via the `authenticate` middleware, which:

1. Extracts Bearer token from Authorization header
2. Verifies JWT signature and expiration
3. Checks user exists and is active in database
4. Attaches user info to `req.user` for downstream handlers

Use `authorize(...roles)` middleware for role-based access control (ADMIN, SALES_MANAGER, SALES_REP, VIEWER).

### Database Schema Key Points

**Core Entities**: User, Team, Company, Contact, Deal, Activity, Note, PipelineStage, EmailTemplate, AuditLog

**Important Relationships**:

- Company (1) ──< (N) Contact, Deal, Activity
- Deal belongs to PipelineStage, Company, Contact (optional), User (owner)
- Activities can link to Company, Contact, and/or Deal
- All entities use `cuid()` for IDs
- Cascade deletes configured on Company → Contact/Deal/Activity relationships

**Indexes**: Strategic indexes on foreign keys, email fields, and frequently queried fields (see schema.prisma for details).

### Request/Response Pattern

All API routes follow this pattern:

1. Zod validation of request body using schemas from `@crm/types`
2. Business logic and Prisma database queries
3. Return JSON response with proper HTTP status codes
4. Global error handling via `errorHandler` middleware

Standard response format:

- Success: `{ id, ...data }` or `{ data: [...], pagination: {...} }` for lists
- Error: `{ error: "message" }`

### Environment Variables

Required variables (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for signing access tokens
- `JWT_REFRESH_SECRET`: Secret for signing refresh tokens
- `PORT`: API server port (default: 4000)

## Development Guidelines

### Adding New Features

**For new API endpoints**:

1. Define Zod schema in `packages/types/index.ts`
2. Create route file in `apps/api/src/routes/`
3. Import and register route in `apps/api/src/index.ts`
4. Use `authenticate` middleware for protected routes

**For database changes**:

1. Update `packages/database/schema.prisma`
2. Generate Prisma client: `cd packages/database && npx prisma generate`
3. Create migration: `npx prisma migrate dev --name descriptive_name`
4. Update seed data in `seed.ts` if needed

### Code Patterns

**Authentication in routes**:

```typescript
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const userId = req.user!.id; // Available after authenticate middleware
  // ...
});
```

**Validation with Zod**:

```typescript
import { createCompanySchema } from '@crm/types';

const result = createCompanySchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: result.error.issues });
}
// Use result.data (fully typed)
```

**Prisma client usage**:

```typescript
import { prisma } from '@crm/database';

const companies = await prisma.company.findMany({
  where: {
    /* ... */
  },
  include: { contacts: true, deals: true }, // Include relations
  skip: (page - 1) * limit,
  take: limit,
});
```

### Testing

The project uses Vitest for testing. Run tests with:

```bash
npm run test              # All tests
cd apps/api && npm test   # API tests only
```

Test files should be colocated with source files using `.test.ts` or `.spec.ts` suffix.

## Important Notes

- **TypeScript Strict Mode**: All packages use strict TypeScript. Ensure type safety.
- **Turbo Caching**: Turborepo caches build outputs. Use `turbo run build --force` to bypass cache if needed.
- **Database Seeding**: Seed data includes two users (admin and sales rep) with sample companies, contacts, deals, and pipeline stages.
- **Pipeline Stages**: Default stages are Prospecting → Qualification → Proposal → Negotiation → Closing with probabilities 10%, 30%, 50%, 70%, 90%.
- **Port 4000**: API runs on port 4000 by default. Frontend (Phase 2) will use port 3000.
- **Prisma Studio**: Access at http://localhost:5555 when running `npm run db:studio`.

## Common Issues

**"Prisma Client not generated"**: Run `cd packages/database && npx prisma generate`

**Port already in use**: Kill process on port 4000 or change PORT in .env

**Docker connection issues**: Ensure Docker is running with `docker ps`, restart services with `npm run docker:down && npm run docker:up`

**Migration conflicts**: Reset database (development only) with `cd packages/database && npx prisma migrate reset`
