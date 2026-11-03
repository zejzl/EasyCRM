# 🚀 Modern B2B CRM System

A production-ready, feature-rich CRM system built with modern technologies and best practices.

## ✨ Features

### Core CRM

- 👥 **Contact & Company Management** - Hierarchical organization structure
- 💼 **Money Maker Pipeline** - Interactive Kanban board with drag-and-drop sales management
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
│   │       ├── routes/   # API routes (companies, contacts, deals, etc.)
│   │       ├── middleware/
│   │       └── index.ts
│   └── web/              # Next.js frontend (Phase 2-4 complete)
│       ├── app/
│       │   ├── (dashboard)/
│       │   │   ├── companies/    # Company management pages
│       │   │   ├── contacts/     # Contact management pages
│       │   │   └── ...
│       │   └── ...
│       └── components/
│           ├── companies/         # Company-specific components
│           ├── contacts/          # Contact-specific components
│           └── ...
├── packages/
│   ├── database/         # Prisma schema & client
│   ├── types/            # Shared TypeScript types & Zod schemas
│   └── ui/               # Shared React components (Phase 2)
├── docker-compose.yml    # Local development services
└── turbo.json           # Turborepo configuration
```

## 📊 Current Status

**Version**: 1.4.0  
**Last Updated**: January 24, 2026  
**Development Phase**: Phase 6 (Advanced Activity Tracking) - **Activity Intelligence Complete**

### ✅ What's Working Now

- **Authentication**: Secure JWT-based login/registration
- **Dashboard**: Responsive layout with navigation
- **Companies**: Full CRUD operations with detail views
- **Contacts**: Full CRUD operations with relationship management
- **Deals Pipeline**: Interactive Kanban board with drag-and-drop
- **Sales Intelligence**: Real-time pipeline analytics and forecasting
- **Activity Tracking**: Comprehensive activity management with intelligence
- **Money Maker**: Complete sales opportunity management
- **API**: Complete backend with search, sort, and filter capabilities
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Professional interface with shadcn/ui components

### 🎯 Next Priority

**Analytics Dashboard Expansion** - Interactive dashboards with click-through analytics and sales forecasting

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

### Accounts and access (invite-only)

Self sign-up is closed by default (`REGISTRATION_MODE=closed`); one organisation, accounts by invitation.

```bash
# First administrator (password from ADMIN_PASSWORD, or typed when asked)
npm run admin --workspace apps/api -- create-admin --email you@example.com --name "Your Name"
# Invite link for a colleague, valid 7 days (roles: ADMIN, SALES_MANAGER, SALES_REP, VIEWER)
npm run admin --workspace apps/api -- invite --email ana@example.com --name "Ana" --role SALES_REP
```

Administrators can also call `POST /api/users/invites` and `PATCH /api/users/:id` (role, `isActive`).
Roles on records: VIEWER is read-only; only ADMIN can delete. `REGISTRATION_MODE=open` restores public sign-up
(as SALES_REP) for local demos. The seed's demo accounts appear on the login page only in development.

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
# Contacts CRUD: http://localhost:3000/contacts
# Money Maker Pipeline: http://localhost:3000/deals

# Test API health
curl http://localhost:4000/health

# Default login credentials:
# Admin: admin@crm.local / admin123
# Sales: sales@crm.local / sales123

# Companies CRUD: http://localhost:3000/companies
# Contacts CRUD: http://localhost:3000/contacts
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
GET    /api/contacts            # List contacts (with search, sort, filter)
GET    /api/contacts/:id        # Get contact with relationships
POST   /api/contacts            # Create contact
PATCH  /api/contacts/:id        # Update contact
DELETE /api/contacts/:id        # Delete contact
GET    /api/contacts/search/query?q=term  # Search contacts
```

### Deals

```bash
GET    /api/deals               # List deals (with filters)
GET    /api/deals/pipeline      # Get pipeline view (grouped by stage)
GET    /api/deals/:id           # Get deal with relationships
POST   /api/deals               # Create deal
PATCH  /api/deals/:id           # Update deal
PATCH  /api/deals/:id/stage     # Move deal to different stage
PATCH  /api/deals/:id/close     # Close deal (won/lost)
DELETE /api/deals/:id           # Delete deal
GET    /api/deals/search/query?q=term  # Search deals
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

## 🧪 Testing Pipeline & Deals Management

### Quick Test Guide

1. **Access the Application**

   ```bash
   # Navigate to web application
   http://localhost:3000/deals
   ```

2. **Test Kanban Board**
   - View deals organized by pipeline stages
   - Drag deals between stages to test drag-and-drop
   - Hover over deal cards to see value, probability, owner info
   - Notice color-coded stages based on probability

3. **Create a New Deal**
   - Click "Add Deal" button
   - Fill in required fields (Name, Value, Stage, Company, Owner)
   - Associate with company and contact
   - Set expected close date and probability
   - Save to see deal appear in the pipeline

4. **Test Pipeline Analytics**
   - View the analytics cards at the top:
     - Total Deals count
     - Pipeline Value (total and weighted)
     - Average Deal Size
     - Win Rate conversion
   - Note how values update as deals move between stages

5. **Test Deal Movement**
   - Drag a deal from "Lead" to "Qualified" stage
   - Observe probability auto-update based on stage
   - Try moving deal to different stages
   - Test the search functionality

6. **View Deal Details**
   - Click on any deal to navigate to detail page
   - Explore tabs: Overview, Activities, Notes
   - Test "Edit Deal" functionality
   - Try marking deal as "Won" or "Lost"

7. **Test Deal Close Process**
   - Open a deal and click "Mark Won"
   - Notice deal moves to closed state
   - Try "Mark Lost" with a reason
   - Verify pipeline analytics update

8. **Test API Endpoints**

   ```bash
   # Get pipeline view
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/deals/pipeline

   # List deals
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/deals

   # Search deals
   curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:4000/api/deals/search/query?q=software"
   ```

## 🧪 Automated Testing the Contact Management Feature

### Quick Test Guide

1. **Access the Application**

   ```bash
   # Navigate to the web application
   http://localhost:3000/contacts
   ```

2. **Create a Test Contact**
   - Click "Add Contact" button
   - Fill in required fields (First Name, Last Name, Company)
   - Add optional details (email, phone, title, department)
   - Save to create the contact

3. **Test Search & Filtering**
   - Use the search bar to find contacts by name, email, or company
   - Test sorting by different columns
   - Navigate through pagination

4. **View Contact Details**
   - Click "View" on any contact to see detailed information
   - Explore the tabs: Overview, Deals, Activities, Notes
   - Test the "Edit Contact" functionality

5. **Test API Endpoints**

   ```bash
   # List contacts (requires authentication token)
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/contacts

   # Search contacts
   curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:4000/api/contacts/search/query?q=john"
   ```

## 🧪 Automated Testing

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

## 🎯 Recent Updates

### ✅ January 24, 2026 - Money Maker Deals Pipeline Complete

- **New Feature**: Full Contact Management CRUD interface
- **Contact List**: Advanced data table with search, sorting, and pagination
- **Contact Forms**: Create/edit modal with comprehensive validation
- **Contact Details**: Tabbed interface showing relationships (Deals, Activities, Notes)
- **Search**: Real-time search across name, email, title, and company
- **API**: Enhanced endpoints with search, sort, and filter capabilities
- **Navigation**: Fully integrated into sidebar navigation

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

### ✅ Phase 4: CRUD Operations (Companies & Contacts Complete)

- [x] Company management UI (list, create, edit, delete)
- [x] Contact management UI (list, create, edit, delete)
- [x] Data tables with sorting/filtering/pagination
- [x] Form validation and error handling
- [x] Company detail pages with relationship views
- [x] Contact detail pages with relationship views
- [x] Search and real-time filtering
- [ ] Deal pipeline with Kanban board
- [ ] Activity tracking interface

### ✅ Phase 5: Money Maker Pipeline (Complete)

- [x] Deal pipeline with Kanban board and drag-and-drop
- [x] Deal value tracking and analytics with weighted calculations
- [x] Deal stage management (Lead → Qualified → Proposal → Negotiation → Won/Lost)
- [x] Deal detail page with activities timeline
- [x] Deal-Contact-Company relationships
- [x] Real-time pipeline analytics and conversion metrics
- [x] Interactive deal cards with probability and value tracking
- [x] Mobile-responsive Kanban interface

### ✅ Phase 6: Advanced Activity Tracking (Complete)

- [x] Activity Feed with real-time activity tracking and filtering
- [x] Quick Activity Creation from Deal Cards (call, email, meeting)
- [x] Activity Dashboard with comprehensive analytics and statistics
- [x] Activity Types: Calls, Emails, Meetings, Tasks, Notes, SMS
- [x] Search and Filter by type, date range, deal, contact
- [x] Mobile-Responsive Activity Management interface
- [x] Full API integration for activities with relationships
- [x] Integration with Money Maker Pipeline deals

### 📋 Phase 7: Analytics Dashboard Expansion (Planned)

- [ ] Interactive Dashboard with click-through analytics
- [ ] Sales Forecasting based on pipeline trends
- [ ] Team Performance Metrics with individual and team analytics
- [ ] Conversion Funnel Visualization with deal flow analysis
- [ ] Revenue Reports with monthly/quarterly revenue analysis
- [ ] Custom Analytics Dashboards with user-configurable reports
- [ ] Real-time Updates with websocket streaming

### 🚀 Phase 8: Production Readiness (Planned)

- [ ] Unit and E2E Testing with comprehensive test coverage
- [ ] CI/CD Pipeline with automated testing and deployment
- [ ] Performance Optimization for large data volumes
- [ ] Security Audit with enterprise security standards
- [ ] API Documentation with complete Swagger/OpenAPI specs
- [ ] Deployment Guides for Docker, cloud deployment
- [ ] Monitoring and Logging with production alerting

### 🎯 Next Priority

**Real-time Collaboration and Analytics** - Enhanced team features with live data streaming

### 📋 Phase 6: Analytics Dashboard (Planned)

- [ ] Charts and metrics visualization
- [ ] Sales funnel analytics
- [ ] Performance dashboards
- [ ] Revenue forecasting
- [ ] Real-time updates

### 🚀 Phase 6: Production Ready

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
