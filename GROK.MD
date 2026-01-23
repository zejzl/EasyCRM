# GROK.MD - EasyCRM Project Context

## Overview
EasyCRM is a modern B2B Customer Relationship Management system built as a monorepo using Turborepo. The project implements a full-stack CRM solution with a focus on sales team productivity and customer relationship management.

## Current Development Status
- **Phase 1** ✅: Backend API (Express.js + TypeScript + PostgreSQL + Prisma + Redis)
- **Phase 2** ✅: Authentication Layer (JWT, login/register, route protection)
- **Phase 3** ✅: Core Layout & Navigation (Next.js 14, sidebar, responsive design)
- **Phase 4** 🔄: CRUD Operations (Companies, Contacts, Deals, Activities)
- **Phase 5** 📋: Analytics Dashboard (charts, metrics, reporting)

## Technology Stack

### Backend (Phase 1 - Complete)
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT with bcrypt
- **Validation**: Zod schemas
- **Architecture**: Monorepo with Turborepo

### Frontend (Phase 2-5 - In Progress)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Project Structure
```
crm/
├── apps/
│   ├── api/          # Express.js backend (Phase 1)
│   └── web/          # Next.js frontend (Phase 2-5)
├── packages/
│   ├── database/     # Prisma schema & client
│   ├── types/        # Shared Zod schemas & types
│   └── ui/           # Shared UI components (planned)
├── docker-compose.yml
└── package.json
```

## Key Features Implemented
- ✅ JWT Authentication with auto-refresh
- ✅ Role-based access control (ADMIN, SALES_MANAGER, SALES_REP, VIEWER)
- ✅ RESTful API with comprehensive endpoints
- ✅ Database relationships (Companies → Contacts → Deals → Activities)
- ✅ Responsive dashboard layout with navigation
- ✅ User management and profile system

## Development Workflow
1. **Backend First**: Implement API endpoints with tests
2. **Frontend Second**: Build UI components consuming the API
3. **Iterative**: Each phase builds upon the previous
4. **Quality**: TypeScript strict mode, ESLint, comprehensive validation

## API Endpoints Available
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/users/me` - Current user profile
- `GET /api/companies` - List companies (with pagination/filtering)
- `GET /api/contacts` - List contacts
- `GET /api/deals` - List deals
- `GET /api/activities` - List activities
- `GET /api/analytics/*` - Analytics and reporting

## Development Commands
```bash
# Setup
npm install
npm run docker:up
cd packages/database && npx prisma migrate dev && npm run db:seed

# Development
npm run dev              # Start both API (port 4000) and Web (port 3000)
cd apps/web && npm run dev -- -p 3001  # Web only on port 3001

# Testing
npm run test
npm run lint
npm run build
```

## Default Credentials
- **Admin**: `admin@crm.local` / `admin123`
- **Sales Rep**: `sales@crm.local` / `sales123`

## Next Development Priorities
1. **Phase 4**: Complete CRUD operations for all entities
2. **Phase 5**: Implement analytics dashboard with charts
3. **Polish**: Error handling, loading states, accessibility
4. **Production**: Docker deployment, CI/CD, monitoring

This project demonstrates modern full-stack development practices with a focus on developer experience, type safety, and scalable architecture.</content>
<parameter name="filePath">GROK.MD