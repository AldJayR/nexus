# Nexus Backend - Development Todo List

## 📋 Project Overview
This todo list focuses on backend API development using **Fastify + Prisma + PostgreSQL/MySQL** for the Nexus project management system.

---

## ✅ Completed Tasks
- [x] Database schema design (Prisma)
- [x] Initial database migration
- [x] Review and validate Prisma schema for 3NF compliance
- [x] Add soft delete fields (`deletedAt`) to all required models (Task, Deliverable, Evidence, Sprint)
- [x] Add database indexes for frequently queried fields
- [x] Create database seeding script for default Phases and Deliverables
- [x] Set up database connection pooling and error handling utilities

---

## 🏗️ Phase 1: Foundation & Setup

### Database & ORM ✅
- [x] Review and validate Prisma schema for 3NF compliance
- [x] Add soft delete fields (`deletedAt`) to Task, Deliverable, and Evidence models
- [x] Create database seeding script for default Phases and Deliverables
- [x] Set up database connection pooling and error handling
- [x] Add database indexes for frequently queried fields (userId, sprintId, phaseId, etc.)

### Server Configuration ✅
- [x] Set up Fastify server with TypeScript
- [x] Configure environment variables (.env structure)
- [x] Set up CORS configuration for Next.js frontend
- [x] Configure file upload handling (multipart/form-data)
- [x] Set up request logging middleware
- [x] Configure error handling middleware
- [x] Set up API versioning strategy (e.g., `/api/v1`)

### Development Tools ✅
- [x] Set up Biome for code formatting
- [x] Configure TypeScript strict mode
- [x] Set up nodemon/tsx for hot reloading
- [x] Create npm scripts for dev, build, and start
- [x] Set up database migration workflow

---

## 🔐 Phase 2: Authentication & Authorization

### User Authentication ✅
- [x] Install and configure password hashing library (bcrypt or argon2)
- [x] Create user registration endpoint (invite-only, Team Lead access)
- [x] Generate cryptographically secure random passwords
- [x] Create login endpoint (POST `/api/auth/login`)
- [x] Implement JWT token generation and signing
- [x] Create JWT token validation middleware
- [ ] Implement refresh token mechanism (optional but recommended)
- [x] Create password change endpoint
- [x] Create logout endpoint (token invalidation)

### Role-Based Access Control (RBAC)
- [x] Create RBAC middleware for role verification
- [x] Define role permissions mapping
  - Team Member: Read own tasks, Update own tasks, Add comments, Upload evidence
  - Team Lead: All Member permissions + Create/Manage phases, sprints, deliverables, Invite users, Restore deleted items
  - Adviser: Read-only access to all data
- [x] Apply RBAC middleware to protected routes
- [ ] Create authorization helper functions

### Email Service
- [x] Set up Nodemailer or email provider (Resend/SendGrid)
- [x] Configure SMTP credentials
- [x] Create email template for credential delivery
- [x] Create email sending service
- [x] Implement user invitation flow with email delivery
- [ ] Add error handling for failed email delivery
- [ ] Create email logging for audit trail

---

## 📊 Phase 3: Core Entity CRUD APIs

### Project Management
- [x] GET `/api/project` - Fetch project details (singleton)
- [x] POST `/api/project` - Create/Initialize project (Team Lead only)
- [x] PUT `/api/project` - Update project details (Team Lead only)
- [x] PATCH `/api/project` - Partial update project

### User Management
- [x] GET `/api/users` - List all users (Team Lead/Adviser)
- [x] GET `/api/users/:id` - Get user by ID
- [x] POST `/api/users/invite` - Invite new user with auto-generated password
- [x] PUT `/api/users/:id` - Update user profile
- [x] DELETE `/api/users/:id` - Soft delete user (Team Lead only)
- [x] GET `/api/users/:id/contributions` - Get user contribution summary

### Phase Management
- [x] GET `/api/phases` - List all phases
- [x] GET `/api/phases/:id` - Get phase details with deliverables
- [x] POST `/api/phases` - Create phase (Team Lead only)
- [x] PUT `/api/phases/:id` - Update phase
- [x] DELETE `/api/phases/:id` - Delete phase (Team Lead only)

### Deliverable Management
- [x] GET `/api/deliverables` - List deliverables (filter by phase)
- [x] GET `/api/deliverables/:id` - Get deliverable details
- [x] POST `/api/deliverables` - Create deliverable (Team Lead)
- [x] PUT `/api/deliverables/:id` - Update deliverable status
- [x] DELETE `/api/deliverables/:id` - Soft delete deliverable
- [x] POST `/api/deliverables/:id/restore` - Restore soft-deleted deliverable

### Sprint Management
- [x] GET `/api/sprints` - List all sprints
- [x] GET `/api/sprints/:id` - Get sprint details with tasks
- [x] POST `/api/sprints` - Create sprint (Team Lead)
- [x] PUT `/api/sprints/:id` - Update sprint
- [x] DELETE `/api/sprints/:id` - Delete sprint (Team Lead)
- [x] GET `/api/sprints/:id/progress` - Calculate sprint completion percentage

### Task Management
- [x] GET `/api/tasks` - List tasks (filter by sprint, user, status)
- [x] GET `/api/tasks/:id` - Get task details
- [x] POST `/api/tasks` - Create task (Team Lead)
- [x] PUT `/api/tasks/:id` - Update task (assignment, status, description)
- [x] PATCH `/api/tasks/:id/status` - Update task status with validation
- [x] DELETE `/api/tasks/:id` - Soft delete task
- [x] POST `/api/tasks/:id/restore` - Restore soft-deleted task
- [x] Validate "Blocked" status requires comment

### Comment System
- [x] GET `/api/comments` - List comments (filter by entity type/ID)
- [x] GET `/api/comments/:id` - Get comment details
- [x] POST `/api/comments` - Create comment (polymorphic: Task or Deliverable)
- [x] PUT `/api/comments/:id` - Update comment (author only)
- [x] DELETE `/api/comments/:id` - Delete comment (author or Team Lead)

---

## 📁 Phase 4: File Management

### Evidence Upload
- [x] Configure file storage (Cloudinary)
- [x] Set up file upload validation (PDF, images only)
- [x] Set up file size limits
- [x] POST `/api/evidence` - Upload evidence file
- [x] GET `/api/evidence/deliverable/:id` - Get evidence by deliverable
- [x] DELETE `/api/evidence/:id` - Delete evidence (Cloudinary + DB)
- [x] Link evidence to deliverables

### Meeting Minutes (PDF)
- [x] POST `/api/meeting-logs` - Upload meeting minutes PDF
- [x] GET `/api/meeting-logs/sprint/:id` - List meeting logs (filter by sprint)
- [x] DELETE `/api/meeting-logs/:id` - Delete meeting log
- [x] Validate PDF file type on upload

---

## 📈 Phase 5: Progress Tracking & Analytics

### Dashboard Data
- [x] GET `/api/dashboard/overview` - Overall project completion percentage
- [x] GET `/api/dashboard/phases` - Phase-level progress
- [x] GET `/api/dashboard/sprints` - Sprint completion status
- [x] GET `/api/dashboard/contributions` - Team member contributions

### Timeline & Gantt
- [x] GET `/api/timeline` - Planned vs Actual completion dates
- [x] Calculate delay indicators
- [x] Format data for Gantt chart visualization

### Contribution Tracking
- [x] Implement task completion counter per user
- [x] Track sprint participation per user
- [x] GET `/api/dashboard/contributions` - Team-wide contribution summary

---

## 🔔 Phase 6: Notifications & Activity Logging

### Notification System
- [x] POST `/api/notifications` - Create notification
- [x] GET `/api/notifications` - Get user notifications (unread/all)
- [x] PATCH `/api/notifications/:id/read` - Mark notification as read
- [x] PATCH `/api/notifications/read-all` - Mark all as read
- [x] DELETE `/api/notifications/:id` - Delete notification
- [x] Create notification triggers (Integration complete)

### Activity Logging (Audit Trail)
- [x] GET `/api/activity-logs` - List activity logs (Team Lead only)
- [x] GET `/api/activity-logs/entity/:type/:id` - Get logs for specific entity
- [x] Implement activity logging middleware/hooks (Integration complete)

---

## 💾 Phase 7: Data Management & Backup

### Soft Delete Implementation
- [x] Create soft delete service/utility
- [x] Implement soft delete for Tasks
- [x] Implement soft delete for Deliverables
- [x] Implement soft delete for Evidence
- [x] Update all queries to exclude soft-deleted records by default
- [x] Create restore endpoints for each entity

### Backup & Export
- [x] GET `/api/backup/export` - Export JSON data (Team Lead only)
- [x] GET `/api/backup/files` - Download ZIP of all files (Evidence + Meeting Minutes)
- [x] Implement file compression for backup
- [ ] Add progress indicator for large exports
- [x] Include database schema version in export

---

## 🧪 Phase 8: Testing & Validation

### API Testing
- [x] Set up testing framework (Vitest + Supertest)
- [x] Write unit tests for authentication
- [x] Write unit tests for RBAC middleware
- [x] Write integration tests for core CRUD operations
  - [x] Project
  - [x] Phase
  - [x] Deliverable
  - [x] Sprint
  - [x] Task
  - [x] Comment
  - [x] Evidence
  - [x] Meeting Log
- [x] Write tests for file upload validation
- [x] Write tests for soft delete functionality
- [x] Write tests for email service
- [x] Set up test database

### Input Validation
- [ ] Implement request validation using Zod or similar
- [ ] Validate all POST/PUT request bodies
- [ ] Validate file uploads (type, size)
- [ ] Validate email formats
- [ ] Validate date ranges
- [ ] Add custom error messages for validation failures

### Error Handling
- [ ] Create centralized error handler
- [ ] Define custom error classes (AuthError, ValidationError, NotFoundError)
- [ ] Implement proper HTTP status codes
- [ ] Add detailed error logging
- [ ] Create user-friendly error responses

---

## 🔒 Phase 9: Security Hardening

### Security Measures
- [ ] Implement rate limiting on auth endpoints
- [ ] Add request sanitization (prevent XSS)
- [ ] Implement SQL injection prevention (Prisma handles this)
- [ ] Add helmet.js for security headers
- [ ] Configure secure cookie settings for JWT
- [ ] Implement CSRF protection if needed
- [ ] Add input length limits
- [ ] Validate and sanitize file names on upload
- [ ] Implement secure file storage paths

### Password Security
- [ ] Enforce minimum password strength for auto-generated passwords
- [ ] Hash passwords with sufficient salt rounds
- [ ] Never log passwords or tokens
- [ ] Implement password change security checks

---

## 📚 Phase 10: Documentation & Deployment

### API Documentation
- [ ] Document all API endpoints (Swagger/OpenAPI)
- [ ] Add request/response examples
- [ ] Document authentication flow
- [ ] Document RBAC permissions per endpoint
- [ ] Create API usage guide for frontend team

### Deployment Preparation
- [ ] Create production environment configuration
- [ ] Set up database migration strategy for production
- [ ] Configure production logging
- [ ] Set up health check endpoint (`/health`)
- [ ] Create deployment guide
- [ ] Set up database backup strategy
- [ ] Configure production email service

### Developer Documentation
- [ ] Write setup instructions (README.md)
- [ ] Document environment variables
- [ ] Create database seeding instructions
- [ ] Document code architecture
- [ ] Create contribution guidelines

---

## 🚀 Phase 11: Performance Optimization

### Database Optimization
- [ ] Add database indexes for foreign keys
- [ ] Optimize N+1 query problems (use Prisma `include` strategically)
- [ ] Implement pagination for list endpoints
- [ ] Add database query logging in development
- [ ] Optimize soft delete queries

### API Performance
- [ ] Implement response caching where appropriate
- [ ] Add compression middleware (gzip)
- [ ] Optimize file upload handling
- [ ] Set up API response time monitoring
- [ ] Implement query result caching for static data (Phases)

---

## 🔄 Phase 12: Integration & Collaboration

### Frontend Collaboration
- [ ] Define API contract with frontend team
- [ ] Provide API endpoint documentation
- [ ] Set up API testing environment for frontend
- [ ] Create mock data endpoints for frontend development
- [ ] Coordinate on error response format

### CI/CD
- [ ] Set up continuous integration
- [ ] Configure automated testing in CI
- [ ] Set up linting checks
- [ ] Configure type checking
- [ ] Set up deployment pipeline

---

## 📝 Notes & Considerations

### Priority Levels
- **P0 (Critical)**: Phase 1, Phase 2 - Foundation & Auth must be solid
- **P1 (High)**: Phase 3, Phase 4 - Core functionality
- **P2 (Medium)**: Phase 5, Phase 6, Phase 7 - Enhanced features
- **P3 (Low)**: Phase 8-12 - Quality & optimization

### Development Order Suggestion
1. Set up server and database foundation
2. Implement authentication & authorization
3. Build core CRUD APIs (Project → Phase → Sprint → Task)
4. Add file upload capabilities
5. Implement notifications and activity logging
6. Add analytics and backup features
7. Testing and security hardening
8. Documentation and deployment

### Team Communication
- API changes should be communicated to frontend team immediately
- Use feature branches for each major endpoint group
- Document breaking changes clearly
- Maintain API versioning if major changes occur

---

## 🐛 Known Issues / Blockers
- [ ] Decide on local vs cloud file storage
- [ ] Choose specific email service provider
- [ ] Confirm database choice (PostgreSQL vs MySQL)
- [ ] Define exact file size limits
- [ ] Coordinate JWT token expiration times with frontend

---

**Last Updated**: December 17, 2025
**Status**: Initial Planning Phase
