# B2B CRM System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Phase 2)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            Next.js 14 App (Port 3000)                │   │
│  │  • React Components (shadcn/ui)                      │   │
│  │  • TanStack Query (Server State)                     │   │
│  │  • Zustand (Client State)                            │   │
│  │  • React Hook Form + Zod                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            │ JWT Bearer Token
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Phase 1)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Express.js API Server (Port 4000)           │   │
│  │                                                       │   │
│  │  Routes:                                              │   │
│  │  • /api/auth          - Authentication               │   │
│  │  • /api/companies     - Company CRUD                 │   │
│  │  • /api/contacts      - Contact CRUD                 │   │
│  │  • /api/deals         - Deal & Pipeline Management   │   │
│  │  • /api/activities    - Activity Tracking            │   │
│  │  • /api/analytics     - Reporting & Metrics          │   │
│  │  • /api/users         - User Management              │   │
│  │                                                       │   │
│  │  Middleware:                                          │   │
│  │  • Authentication (JWT)                               │   │
│  │  • Authorization (Role-based)                         │   │
│  │  • Rate Limiting                                      │   │
│  │  • Error Handling                                     │   │
│  │  • CORS, Helmet, Compression                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴────────┐
                    │                │
                    ▼                ▼
        ┌────────────────┐  ┌────────────────┐
        │   PostgreSQL   │  │     Redis      │
        │   (Port 5432)  │  │  (Port 6379)   │
        │                │  │                │
        │  • Companies   │  │  • Cache       │
        │  • Contacts    │  │  • Sessions    │
        │  • Deals       │  │  • Queue       │
        │  • Activities  │  │                │
        │  • Users       │  └────────────────┘
        │  • Pipeline    │
        └────────────────┘
```

## Technology Stack

### Backend
```
┌─────────────────────────────────────────┐
│           Backend Stack                  │
├─────────────────────────────────────────┤
│ Runtime:     Node.js 18+                │
│ Framework:   Express.js 4.18            │
│ Language:    TypeScript 5.3             │
│ Database:    PostgreSQL 16              │
│ ORM:         Prisma 5.7                 │
│ Cache:       Redis 7                    │
│ Auth:        JWT + bcrypt               │
│ Validation:  Zod 3.22                   │
└─────────────────────────────────────────┘
```

### Frontend (Next Phase)
```
┌─────────────────────────────────────────┐
│           Frontend Stack                 │
├─────────────────────────────────────────┤
│ Framework:    Next.js 14 (App Router)   │
│ Language:     TypeScript 5.3            │
│ Styling:      Tailwind CSS              │
│ Components:   shadcn/ui + Radix UI      │
│ State:        TanStack Query + Zustand  │
│ Forms:        React Hook Form           │
│ Charts:       Recharts / Victory        │
└─────────────────────────────────────────┘
```

## Database Schema

### Entity Relationship Diagram

```
┌──────────┐         ┌──────────┐
│  Team    │ 1     N │   User   │
│          │◄────────│          │
└──────────┘         └──────────┘
                          │ 1
                          │ owns
                          │
                          ▼ N
┌──────────┐         ┌──────────┐         ┌──────────┐
│ Company  │ 1     N │   Deal   │ N     1 │ Pipeline │
│          │◄────────│          │────────►│  Stage   │
└──────────┘         └──────────┘         └──────────┘
     │ 1                  │ N
     │ has                │ has
     ▼ N                  ▼ N
┌──────────┐         ┌──────────┐
│ Contact  │ 1     N │ Activity │
│          │◄────────│          │
└──────────┘         └──────────┘
     │ N
     │ related to
     ▼ N
┌──────────┐
│   Note   │
│          │
└──────────┘
```

### Core Tables

**Users**
- id, email, password (hashed)
- name, avatar, role
- teamId (FK), isActive
- lastLoginAt, createdAt, updatedAt

**Companies**
- id, name, domain, industry, size
- revenue, website, phone
- address fields (city, state, country)
- tags[], customFields (JSON)

**Contacts**
- id, firstName, lastName, email
- phone, mobile, title, department
- companyId (FK), isPrimary
- tags[], customFields (JSON)

**Deals**
- id, name, value, probability
- stageId (FK), status, ownerId (FK)
- companyId (FK), contactId (FK)
- expectedCloseDate, actualCloseDate
- tags[], customFields (JSON)

**Activities**
- id, type (EMAIL|CALL|MEETING|TASK)
- subject, description, duration
- createdById (FK)
- companyId (FK), contactId (FK), dealId (FK)
- email fields (from, to, cc, body)
- scheduledAt, completedAt

**PipelineStages**
- id, name, order, probability
- isActive, color

## API Architecture

### Request Flow

```
1. Client Request
   │
   ▼
2. Express Middleware Chain
   ├─► Rate Limiter
   ├─► CORS
   ├─► Body Parser
   ├─► Authentication (JWT)
   └─► Authorization (Role Check)
   │
   ▼
3. Route Handler
   ├─► Zod Validation
   ├─► Business Logic
   └─► Database Query (Prisma)
   │
   ▼
4. Response
   ├─► Success: 200/201 + Data
   └─► Error: 4xx/5xx + Message
```

### Authentication Flow

```
┌──────────┐                  ┌──────────┐
│  Client  │                  │   API    │
└────┬─────┘                  └────┬─────┘
     │                             │
     │ POST /api/auth/login        │
     │ {email, password}           │
     ├────────────────────────────►│
     │                             │
     │                        Verify credentials
     │                        Generate tokens
     │                             │
     │ {accessToken, refreshToken} │
     │◄────────────────────────────┤
     │                             │
     │ GET /api/companies          │
     │ Authorization: Bearer token │
     ├────────────────────────────►│
     │                             │
     │                        Verify JWT
     │                        Fetch data
     │                             │
     │            {data}           │
     │◄────────────────────────────┤
     │                             │
```

### Error Handling Strategy

```
Error Types:
├─ Validation Errors (400)
│  └─ Zod schema validation failures
│
├─ Authentication Errors (401)
│  ├─ Missing token
│  ├─ Invalid token
│  └─ Expired token
│
├─ Authorization Errors (403)
│  └─ Insufficient permissions
│
├─ Not Found Errors (404)
│  └─ Resource doesn't exist
│
├─ Conflict Errors (409)
│  └─ Unique constraint violations
│
└─ Server Errors (500)
   └─ Unexpected errors
```

## Security Measures

### Implemented
- ✅ JWT with short expiration (15 min)
- ✅ Refresh tokens (7 days)
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting (100 req/15min)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ SQL injection prevention (Prisma)
- ✅ Input validation (Zod)
- ✅ Role-based access control

### Recommended for Production
- [ ] HTTPS/TLS encryption
- [ ] API key rotation
- [ ] 2FA/MFA
- [ ] IP whitelisting
- [ ] Request signing
- [ ] Audit logging
- [ ] DDoS protection
- [ ] Web Application Firewall (WAF)

## Performance Optimization

### Database
```
Indexes:
├─ companies: name, domain
├─ contacts: email, companyId, fullName
├─ deals: stageId, companyId, ownerId, status
├─ activities: type, createdById, dates
└─ users: email, teamId

Query Optimization:
├─ Use select to limit fields
├─ Include relations strategically
├─ Paginate large result sets
└─ Use aggregate for counts
```

### Caching Strategy (Redis)
```
Cache Layers:
├─ User sessions (15 min)
├─ Pipeline stages (1 hour)
├─ Analytics data (5 min)
└─ Frequently accessed companies (10 min)
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────┐
│            Load Balancer                 │
│         (Nginx / CloudFlare)             │
└─────────────┬───────────────────────────┘
              │
      ┌───────┴───────┐
      │               │
      ▼               ▼
┌──────────┐    ┌──────────┐
│ Next.js  │    │ Next.js  │
│  App 1   │    │  App 2   │
└──────────┘    └──────────┘
      │               │
      └───────┬───────┘
              │
      ┌───────┴───────┐
      │               │
      ▼               ▼
┌──────────┐    ┌──────────┐
│  API 1   │    │  API 2   │
└──────────┘    └──────────┘
      │               │
      └───────┬───────┘
              │
      ┌───────┴────────────┐
      │                    │
      ▼                    ▼
┌──────────┐        ┌──────────┐
│PostgreSQL│        │  Redis   │
│ Primary  │        │  Cluster │
└──────────┘        └──────────┘
      │
      ▼
┌──────────┐
│PostgreSQL│
│ Replica  │
└──────────┘
```

## Monitoring & Observability

### Metrics to Track
- Request rate and latency
- Error rates by endpoint
- Database query performance
- Cache hit/miss rates
- Active user sessions
- Deal conversion rates

### Recommended Tools
- **Application**: Sentry, LogRocket
- **Infrastructure**: Datadog, New Relic
- **Logs**: ELK Stack, Loki
- **Uptime**: Pingdom, UptimeRobot

## Scalability Considerations

### Horizontal Scaling
```
Component         Current    100 Users   1000 Users
─────────────────────────────────────────────────────
Next.js           1 inst.    2 inst.     4+ inst.
API Server        1 inst.    3 inst.     6+ inst.
PostgreSQL        1 inst.    1 + replica  Sharding
Redis             1 inst.    1 cluster    Multi-cluster
```

### Database Optimization
- Read replicas for analytics queries
- Connection pooling (PgBouncer)
- Table partitioning for large tables
- Archive old data (> 2 years)

### Caching Strategy
- CDN for static assets
- Redis for session/data cache
- Application-level caching
- Query result caching

## Development Workflow

```
Developer
    │
    ├─► Edit Code
    │   └─► TypeScript files
    │
    ├─► Run Tests (Vitest)
    │   └─► Unit + Integration
    │
    ├─► Commit (Husky)
    │   ├─► Pre-commit: Lint + Format
    │   └─► Pre-push: Tests
    │
    ├─► Push to GitHub
    │   └─► Triggers CI/CD
    │
    └─► Deploy
        ├─► Staging (auto)
        └─► Production (manual)
```

## Future Enhancements

### Phase 3: Advanced Features
- Email sync (IMAP/SMTP)
- Calendar integration
- WebSocket real-time updates
- Advanced search (Elasticsearch)
- File attachments (S3)
- Custom field builder
- Workflow automation
- API webhooks

### Phase 4: Enterprise
- Multi-tenancy
- SSO (SAML, OAuth)
- Advanced permissions
- Custom reporting
- Mobile apps (React Native)
- Offline mode
- White-labeling
- API rate limiting per tenant
