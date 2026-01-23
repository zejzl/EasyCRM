# 🚀 Modern B2B CRM System

A production-ready, feature-rich CRM system built with modern technologies and best practices.

## ✨ Features

### Core CRM

- 👥 **Contact & Company Management** - Hierarchical organization structure
- 💼 **Deal Pipeline** - Customizable stages with drag-and-drop Kanban
- 📊 **Activity Tracking** - Emails, calls, meetings, tasks, and notes
- 📈 **Analytics & Reporting** - Sales funnel, revenue forecasting, performance metrics
- 🤝 **Team Collaboration** - Shared templates, @mentions, activity feeds

### Technical Highlights

- ⚡ **Monorepo Architecture** - Turborepo for efficient builds
- 🔒 **JWT Authentication** - Secure token-based auth with refresh tokens
- 📱 **TypeScript End-to-End** - Full type safety across stack
- 🎨 **Modern UI** - Next.js 14 with App Router (Phase 2-3 complete)
- 🗄️ **PostgreSQL + Prisma** - Type-safe database access
- 🚀 **Redis** - Caching and real-time features
- 🐳 **Docker** - Containerized development environment

## 🏗️ Tech Stack

### Frontend (Next.js - Phase 2)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod validation

### Backend (Express)

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Cache**: Redis 7
- **Authentication**: JWT with bcrypt

### Infrastructure

- **Monorepo**: Turborepo
- **Container**: Docker Compose
- **Package Manager**: npm workspaces

## 📦 Project Structure

```
crm/
├── apps/
│   ├── api/              # Express API server
│   │   └── src/
│   │       ├── routes/   # API routes
│   │       ├── middleware/
│   │       └── index.ts
│   └── web/              # Next.js frontend (Phase 2-3 complete)
├── packages/
│   ├── database/         # Prisma schema & client
│   ├── types/            # Shared TypeScript types & Zod schemas
│   └── ui/               # Shared React components (Phase 2)
├── docker-compose.yml    # Local development services
└── turbo.json           # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Docker** and Docker Compose
- **Git**

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd crm

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings (defaults work for local development)
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and Mailhog
npm run docker:up

# Verify services are running
docker ps
```

### 4. Database Setup

```bash
# Generate Prisma client
cd packages/database
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with sample data
npm run db:seed
```

### 5. Start Development Servers

```bash
# Return to root
cd ../..

# Start both API (port 4000) and Web (port 3000) servers
npm run dev

# Or start individually:
npm run dev --workspace=@crm/api    # API only
cd apps/web && npm run dev          # Web only (port 3000)
```

### 6. Access the Application

```bash
# API server: http://localhost:4000
# Web application: http://localhost:3000
# Companies CRUD: http://localhost:3000/companies

# Test API health
curl http://localhost:4000/health

# Default login credentials:
# Admin: admin@crm.local / admin123
# Sales: sales@crm.local / sales123
```

# Login with seed user

curl -X POST http://localhost:4000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{
"email": "admin@crm.local",
"password": "admin123"
}'

````

## 🔑 Default Credentials

After seeding, you can login with:

- **Admin**: `admin@crm.local` / `admin123`
- **Sales Rep**: `sales@crm.local` / `sales123`

## 📚 API Documentation

### Authentication

```bash
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login
POST /api/auth/refresh     # Refresh access token
POST /api/auth/logout      # Logout (client-side token removal)
````

### Companies

```bash
GET    /api/companies           # List companies (paginated)
GET    /api/companies/:id       # Get company with relationships
POST   /api/companies           # Create company
PATCH  /api/companies/:id       # Update company
DELETE /api/companies/:id       # Delete company
GET    /api/companies/search/query?q=term  # Search companies
```

### Contacts

```bash
GET    /api/contacts            # List contacts
GET    /api/contacts/:id        # Get contact
POST   /api/contacts            # Create contact
PATCH  /api/contacts/:id        # Update contact
DELETE /api/contacts/:id        # Delete contact
```

### Deals

```bash
GET    /api/deals               # List deals
GET    /api/deals/pipeline      # Get pipeline view
GET    /api/deals/:id           # Get deal
POST   /api/deals               # Create deal
PATCH  /api/deals/:id           # Update deal
PATCH  /api/deals/:id/stage     # Move to different stage
PATCH  /api/deals/:id/close     # Close deal (won/lost)
DELETE /api/deals/:id           # Delete deal
```

### Activities

```bash
GET    /api/activities          # List activities
GET    /api/activities/:id      # Get activity
POST   /api/activities          # Create activity
PATCH  /api/activities/:id      # Update activity
DELETE /api/activities/:id      # Delete activity
```

### Analytics

```bash
GET /api/analytics/overview          # Dashboard metrics
GET /api/analytics/pipeline          # Pipeline metrics
GET /api/analytics/sales-by-owner    # Sales by user
GET /api/analytics/activities        # Activity metrics
GET /api/analytics/revenue-forecast  # Revenue forecast
```

### Users

```bash
GET /api/users/me    # Get current user
GET /api/users       # List users
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Watch mode
npm run test:watch
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start all apps in development mode
npm run build        # Build all apps for production
npm run lint         # Lint all packages
npm run clean        # Clean all build artifacts
npm run format       # Format code with Prettier

# Docker
npm run docker:up    # Start Docker services
npm run docker:down  # Stop Docker services

# Database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio (database GUI)
```

## 🗄️ Database Schema

### Core Entities

- **Users** - Team members with roles and permissions
- **Teams** - Organizational groups
- **Companies** - Business accounts
- **Contacts** - Individual people at companies
- **Deals** - Sales opportunities with pipeline stages
- **Activities** - Emails, calls, meetings, tasks, notes
- **Notes** - Contextual notes on any entity
- **PipelineStages** - Customizable deal stages
- **EmailTemplates** - Reusable email templates
- **AuditLogs** - System audit trail

### Relationships

```
Company (1) ──< (N) Contact
Company (1) ──< (N) Deal
Company (1) ──< (N) Activity

Contact (1) ──< (N) Deal
Contact (1) ──< (N) Activity

Deal (1) ──< (N) Activity
Deal (N) ──> (1) PipelineStage
Deal (N) ──> (1) User (owner)

User (N) ──> (1) Team
```

## 🎯 Roadmap

### ✅ Phase 1: Backend API (Complete)

- [x] Monorepo setup with Turborepo
- [x] Database schema with Prisma
- [x] Express API with authentication
- [x] CRUD operations for all entities
- [x] Analytics endpoints
- [x] Docker development environment

### ✅ Phase 2: Authentication (Complete)

- [x] Next.js 14 app with App Router
- [x] JWT authentication with auto-refresh
- [x] Login/register forms with validation
- [x] Route protection middleware
- [x] User management and profiles

### ✅ Phase 3: Core Layout & Navigation (Complete)

- [x] Responsive dashboard layout
- [x] Sidebar navigation with active states
- [x] Professional header with user menu
- [x] Mobile-responsive design
- [x] shadcn/ui component integration

### ✅ Phase 4: CRUD Operations (Companies Complete)

- [x] Company management UI (list, create, edit, delete)
- [x] Data tables with sorting/filtering/pagination
- [x] Form validation and error handling
- [x] Company detail pages with relationship views
- [x] Search and real-time filtering
- [ ] Contact management UI (next)
- [ ] Deal pipeline with Kanban board
- [ ] Activity tracking interface

### 📋 Phase 5: Analytics Dashboard (Planned)

- [ ] Charts and metrics visualization
- [ ] Sales funnel analytics
- [ ] Performance dashboards
- [ ] Revenue forecasting
- [ ] Real-time updates

### 🚀 Phase 4: Production Ready

- [ ] Unit and E2E tests
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Security audit
- [ ] API documentation (Swagger)
- [ ] Deployment guides
- [ ] Monitoring and logging

## 📖 Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Format with Prettier
- Write meaningful commit messages

### Database Changes

```bash
# Create a new migration
cd packages/database
npx prisma migrate dev --name describe_your_change

# Reset database (⚠️ destroys data)
npx prisma migrate reset
```

### Adding New Features

1. Update Prisma schema if needed
2. Generate Prisma client: `npx prisma generate`
3. Add Zod validation schemas in `packages/types`
4. Create API routes in `apps/api/src/routes`
5. Update README

## 🐛 Troubleshooting

### Docker Issues

```bash
# Reset Docker services
npm run docker:down
docker volume prune
npm run docker:up
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Check connection
docker exec -it crm-postgres psql -U crm_user -d crm_db
```

### Port Already in Use

```bash
# Find process using port 4000
lsof -ti:4000 | xargs kill -9

# Or change PORT in .env
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:

- Open a GitHub issue
- Check existing documentation
- Review API examples

---

Built with ❤️ using modern web technologies
