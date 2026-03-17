#!/bin/bash

# Sprint 2 Setup Script for Cobalt Project
# Repository: https://github.com/tomkabel/team21-vooglaadija
# Sprint: March 16-22, 2026

set -e

REPO="tomkabel/team21-vooglaadija"
SPRINT_NAME="Sprint 2: Architecture Foundation"
MILESTONE_DATE="2026-03-22T23:59:59Z"

echo "🚀 Setting up Sprint 2 for $REPO"
echo "================================================"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    exit 1
fi

# Check authentication
echo "🔐 Checking GitHub authentication..."
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated. Run: gh auth login"
    exit 1
fi

echo "✅ Authentication verified"
echo ""

# ============================================================
# STEP 1: Create Labels
# ============================================================
echo "🏷️  Creating labels..."

# Sprint labels
gh label create "sprint-2" --color "0E8A16" --description "Sprint 2 work" -R "$REPO" 2>/dev/null || echo "Label sprint-2 already exists"
gh label create "epic" --color "0052CC" --description "Epic - large body of work" -R "$REPO" 2>/dev/null || echo "Label epic already exists"

# Priority labels
gh label create "priority-critical" --color "B60205" --description "Blocks release" -R "$REPO" 2>/dev/null || echo "Label priority-critical already exists"
gh label create "priority-high" --color "D93F0B" --description "Important" -R "$REPO" 2>/dev/null || echo "Label priority-high already exists"
gh label create "priority-medium" --color "FBCA04" --description "Normal priority" -R "$REPO" 2>/dev/null || echo "Label priority-medium already exists"
gh label create "priority-low" --color "0E8A16" --description "Nice to have" -R "$REPO" 2>/dev/null || echo "Label priority-low already exists"

# Type labels
gh label create "type-feature" --color "1D76DB" --description "New feature" -R "$REPO" 2>/dev/null || echo "Label type-feature already exists"
gh label create "type-refactor" --color "5319E7" --description "Code refactoring" -R "$REPO" 2>/dev/null || echo "Label type-refactor already exists"
gh label create "type-infra" --color "0052CC" --description "Infrastructure/DevOps" -R "$REPO" 2>/dev/null || echo "Label type-infra already exists"
gh label create "type-docs" --color "0075CA" --description "Documentation" -R "$REPO" 2>/dev/null || echo "Label type-docs already exists"
gh label create "type-testing" --color "84B6EB" --description "Testing" -R "$REPO" 2>/dev/null || echo "Label type-testing already exists"

# Area labels
gh label create "area-db" --color "006B75" --description "Database" -R "$REPO" 2>/dev/null || echo "Label area-db already exists"
gh label create "area-svelte" --color "FF3E00" --description "Svelte/SvelteKit" -R "$REPO" 2>/dev/null || echo "Label area-svelte already exists"
gh label create "area-auth" --color "0052CC" --description "Authentication" -R "$REPO" 2>/dev/null || echo "Label area-auth already exists"
gh label create "area-webcodecs" --color "5319E7" --description "WebCodecs API" -R "$REPO" 2>/dev/null || echo "Label area-webcodecs already exists"
gh label create "area-aws" --color "FF9900" --description "AWS/Infrastructure" -R "$REPO" 2>/dev/null || echo "Label area-aws already exists"
gh label create "area-monitoring" --color "84B6EB" --description "Monitoring" -R "$REPO" 2>/dev/null || echo "Label area-monitoring already exists"

echo "✅ Labels created"
echo ""

# ============================================================
# STEP 2: Create Milestone
# ============================================================
echo "📅 Creating Sprint 2 milestone..."

MILESTONE_RESULT=$(gh api repos/$REPO/milestones \
  --method POST \
  --field title="$SPRINT_NAME" \
  --field state=open \
  --field description="Week of Mar 16-22: Database schema, Svelte 5 setup, pnpm workspaces, auth service. Foundation for all future work." \
  --field due_on="$MILESTONE_DATE" 2>/dev/null || echo "exists")

if [ "$MILESTONE_RESULT" = "exists" ]; then
    echo "⚠️  Milestone may already exist"
else
    echo "✅ Milestone created"
fi
echo ""

# ============================================================
# STEP 3: Create Epic Issue
# ============================================================
echo "📋 Creating Sprint 2 Epic..."

EPIC_BODY='## Epic Goal
Establish solid technical foundation before building features. This epic tracks all foundational work required for subsequent sprints.

## Success Criteria
- [ ] Database migrations run successfully in CI
- [ ] Svelte 5 compiles without errors  
- [ ] All services start locally with docker-compose
- [ ] Team can run full dev environment in <5 minutes
- [ ] Code review process documented and followed

## Sprint Capacity
- **Total Available:** 60 hours (2 devs × 5 days × 6 hrs)
- **Planned:** 42 hours (70% capacity)
- **Buffer:** 18 hours for incidents/unknowns

## Stories
1. Database Schema & Migrations (5 pts)
2. Svelte 5 Environment Setup (8 pts)
3. pnpm Workspaces & Monorepo (5 pts)
4. Auth Service API (5 pts)
5. Developer Experience & CI/CD (3 pts)

**Total: 26 points**

## Risks
| Risk | Probability | Mitigation |
|------|-------------|------------|
| Svelte 5 migration complexity | Medium | Time-box spike, reduce scope if needed |
| Database migration conflicts | Low | Use migrations from day 1 |
| Auth complexity | Medium | Cut scope (rate limiting optional) |

## Definition of Done (Epic)
- [ ] All services run locally
- [ ] CI/CD pipeline passing
- [ ] Documentation complete
- [ ] Team demo completed
- [ ] Sprint retrospective completed'

gh issue create \
  --title="[EPIC] Sprint 2: Architecture Foundation" \
  --body "$EPIC_BODY" \
  --label="epic" \
  --label="sprint-2" \
  --label="priority-high" \
  -R "$REPO"

echo "✅ Epic created"
echo ""

# ============================================================
# STEP 4: Create Story Issues
# ============================================================

echo "📝 Creating Sprint 2 Stories..."
echo ""

# Story 1: Database Schema
echo "Creating Story 1: Database Schema..."
STORY1_BODY='## User Story
As a developer, I need a reliable database schema with versioned migrations so the team can collaborate without schema conflicts.

## Acceptance Criteria

### Schema Design
- [ ] **users** table: id (UUID PK), username (unique), email (unique), password_hash, created_at, updated_at, deleted_at
- [ ] **download_history** table: id (UUID PK), user_id (FK), url (indexed), status (enum), metadata (JSONB), created_at, completed_at
- [ ] **refresh_tokens** table: id (UUID PK), user_id (FK), token_hash (unique, indexed), expires_at, revoked, created_at
- [ ] Indexes on all foreign keys and frequently queried fields
- [ ] Constraints: username 3-30 chars alphanumeric, email valid format

### Migration System
- [ ] Choose migration tool (node-pg-migrate recommended)
- [ ] Create initial migration (up/down scripts)
- [ ] Migrations run automatically in CI/CD
- [ ] Document rollback procedure

### Connection Management
- [ ] Configure pg-pool with environment variables
- [ ] Connection string from DATABASE_URL
- [ ] Pool config: min 2, max 10 connections
- [ ] Connection timeout: 30 seconds

### Testing
- [ ] Migration runs on fresh database
- [ ] Rollback completes without errors
- [ ] Pool handles 20 concurrent connections

## Technical Notes
- PostgreSQL 16+ for JSONB support
- UUID v4 for primary keys
- Soft deletes preferred

## Out of Scope
- Query optimization (future)
- Read replicas
- Connection pooling in production

## Estimated Effort
**5 story points** (~10 hours)

## Dependencies
None

## Definition of Done
- [ ] Code reviewed
- [ ] All acceptance criteria tested
- [ ] Migration runs in CI
- [ ] Documentation in /docs/database.md
- [ ] Demo completed

## Risk Assessment
**LOW** - Well-understood technology

## Time-Box
If exceeds 12 hours, scope down: Skip soft deletes, reduce indexes.'

gh issue create \
  --title="[Sprint 2] Set up PostgreSQL 16 schema with migrations" \
  --body "$STORY1_BODY" \
  --milestone "$SPRINT_NAME" \
  --label="sprint-2" \
  --label="priority-high" \
  --label="type-infra" \
  --label="area-db" \
  -R "$REPO"

echo "✅ Story 1 created"

# Story 2: Svelte 5 Environment
echo "Creating Story 2: Svelte 5 Environment..."
STORY2_BODY='## User Story
As a developer, I need a working Svelte 5 development environment so the team can build with Runes and modern patterns.

## Acceptance Criteria

### Package Updates
- [ ] Svelte 5.0.0, @sveltejs/kit 2.x, Vite 5.4.4+
- [ ] TypeScript 5.3+, ESLint, Prettier updated
- [ ] No peer dependency conflicts

### Configuration
- [ ] vite.config.ts with Svelte 5 compiler
- [ ] svelte.config.js with new adapter
- [ ] tsconfig.json strict mode
- [ ] ESLint configured for Svelte 5

### Svelte 5 Migration Demo
- [ ] Migrate ONE component demonstrating:
  - `$state` instead of writable stores
  - `$derived` for computed values
  - `$props` for component properties
  - New event handling (`onclick` vs `on:click`)
  - Snippets instead of slots
- [ ] Document patterns in MIGRATION.md

### Developer Experience
- [ ] Hot reload <1 second
- [ ] TypeScript intellisense works
- [ ] Build without warnings
- [ ] Dev server starts <3 seconds

## Technical Notes

### Breaking Changes
```svelte
<script>
  import { state, derived, props } from '"'"'svelte'"'"'
  
  let count = state(0)              // was: writable(0)
  let doubled = derived(() => count * 2)
  let { title } = props(['"'"'title'"'"'])
</script>
```

## Out of Scope
- Migrating all components (Sprint 3+)
- Store refactoring
- Production optimization

## Estimated Effort
**8 story points** (~16 hours)

## Dependencies
None

## Definition of Done
- [ ] Code reviewed
- [ ] Team member runs dev environment from scratch
- [ ] MIGRATION.md documents patterns
- [ ] CI build passes
- [ ] No console errors
- [ ] Demo: Before/after component

## Risk Assessment
**MEDIUM** - Svelte 5 stable but migration unknowns

## Spike Recommendation
If exceeds 12 hours, create spike: "Evaluate Svelte 5 migration complexity"'

gh issue create \
  --title="[Sprint 2] Configure Svelte 5.0 + Vite 5.4 development environment" \
  --body "$STORY2_BODY" \
  --milestone "$SPRINT_NAME" \
  --label="sprint-2" \
  --label="priority-high" \
  --label="type-refactor" \
  --label="area-svelte" \
  -R "$REPO"

echo "✅ Story 2 created"

# Story 3: pnpm Workspaces
echo "Creating Story 3: pnpm Workspaces..."
STORY3_BODY='## User Story
As a developer, I need a clean monorepo structure so the team can work on multiple services without conflicts.

## Acceptance Criteria

### Directory Structure
```
cobalt/
├── pnpm-workspace.yaml
├── package.json (root)
├── turbo.json
├── docker-compose.yml
├── services/
│   ├── auth/          # Fastify service
│   ├── processing/    # Placeholder
│   └── api-gateway/   # Placeholder
├── packages/
│   ├── types/         # Shared types
│   ├── utils/         # Common utilities
│   └── config/        # Shared configs
└── apps/
    └── web/           # SvelteKit frontend
```

### Workspace Configuration
- [ ] pnpm-workspace.yaml defines workspaces
- [ ] Root package.json with scripts:
  - `dev`: Start all services
  - `dev:auth`: Start auth only
  - `build`: Build all
  - `lint`, `test`
- [ ] turbo.json for build orchestration
- [ ] Shared lockfile

### Shared Packages
- [ ] `@cobalt/types`: TypeScript interfaces
- [ ] `@cobalt/utils`: Validation helpers, error classes
- [ ] `@cobalt/config`: ESLint, TS configs

### Auth Service Skeleton
- [ ] Fastify in /services/auth/
- [ ] Health endpoint: GET /health
- [ ] Basic folder structure
- [ ] Dockerfile
- [ ] README with dev instructions

### Docker Compose
- [ ] PostgreSQL service
- [ ] Auth service
- [ ] Volume mounts for hot reload
- [ ] Environment from .env

## Technical Notes

### Workspace Dependencies
```json
{
  "dependencies": {
    "@cobalt/types": "workspace:*"
  }
}
```

### Commands After Setup
```bash
pnpm install          # Install all deps
pnpm dev              # Start everything
pnpm --filter auth dev # Start auth only
```

## Out of Scope
- Full auth implementation (Story 4)
- Processing service (Sprint 3)
- Production Docker setup (Sprint 4)

## Estimated Effort
**5 story points** (~10 hours)

## Dependencies
None

## Definition of Done
- [ ] `pnpm dev` starts all services
- [ ] Changes in packages/* reflect immediately
- [ ] Docker compose runs
- [ ] README documents commands
- [ ] CI passes

## Risk Assessment
**LOW** - Proven technology

## Pitfalls to Avoid
- Don'"'"'t over-engineer shared packages
- Keep service boundaries clear
- Document which deps go in root vs packages'

gh issue create \
  --title="[Sprint 2] Configure pnpm workspaces for microservices architecture" \
  --body "$STORY3_BODY" \
  --milestone "$SPRINT_NAME" \
  --label="sprint-2" \
  --label="priority-high" \
  --label="type-infra" \
  -R "$REPO"

echo "✅ Story 3 created"

# Story 4: Auth Service
echo "Creating Story 4: Auth Service..."
STORY4_BODY='## User Story
As a user, I want to register and log in so I can access personalized features.

## Acceptance Criteria

### POST /auth/register
- [ ] Zod validation: username (3-30 chars, alphanumeric), email (valid), password (8+ chars, 1 uppercase, 1 number)
- [ ] Response 201: `{ user: { id, username, email, createdAt } }`
- [ ] Errors: 400 (validation), 409 (exists)
- [ ] Password hashed with bcrypt (10 rounds)
- [ ] User stored in PostgreSQL

### POST /auth/login
- [ ] Request: email, password
- [ ] Response 200: `{ accessToken, tokenType: "Bearer", expiresIn: 86400, user }`
- [ ] Error 401: Invalid credentials (generic message)
- [ ] JWT: userId, username, email, iat, exp (24h)
- [ ] Signed with JWT_SECRET

### POST /auth/logout
- [ ] Requires valid JWT
- [ ] Response: 204 No Content

### Security
- [ ] Rate limiting: 5 req/min per IP
- [ ] Helmet.js for security headers
- [ ] CORS configured
- [ ] Passwords never in responses
- [ ] Parameterized queries (SQL injection prevention)

### Implementation
- [ ] Fastify framework
- [ ] Pino structured logging
- [ ] Env vars: JWT_SECRET (256+ bits), DATABASE_URL, PORT
- [ ] Error handling middleware
- [ ] Zod request validation

### Testing
- [ ] Unit tests: password hashing, JWT generation
- [ ] Integration tests: all endpoints
- [ ] Test database isolation

## Technical Decisions

### Why Fastify?
- 2x faster than Express
- Built-in JSON schema validation
- Native async/await

### JWT Structure
```json
{
  "sub": "user-uuid",
  "username": "johndoe",
  "email": "john@example.com",
  "iat": 1710000000,
  "exp": 1710086400
}
```

## Out of Scope
- Refresh tokens (Sprint 3)
- Email verification
- Password reset
- OAuth
- Role-based access

## Estimated Effort
**5 story points** (~10 hours)

## Dependencies
- Story 1: Database schema
- Story 3: pnpm workspaces

## Definition of Done
- [ ] All endpoints tested (curl/Postman)
- [ ] Unit tests >80% coverage
- [ ] Integration tests in CI
- [ ] API documented in README
- [ ] Security checklist reviewed
- [ ] Code review approved
- [ ] Demo to team

## Risk Assessment
**MEDIUM** - Security-critical

## Security Checklist
- [ ] No hardcoded secrets
- [ ] Input validation
- [ ] Rate limiting
- [ ] Error messages don'"'"'t leak info
- [ ] Passwords properly hashed
- [ ] JWT secret strong

## Questions for PO
1. Email verification needed for MVP?
2. Usernames changeable?
3. Password complexity ok?'

gh issue create \
  --title="[Sprint 2] Implement authentication service with JWT" \
  --body "$STORY4_BODY" \
  --milestone "$SPRINT_NAME" \
  --label="sprint-2" \
  --label="priority-high" \
  --label="type-feature" \
  --label="area-auth" \
  -R "$REPO"

echo "✅ Story 4 created"

# Story 5: Dev Experience & CI/CD
echo "Creating Story 5: Developer Experience..."
STORY5_BODY='## User Story
As a developer, I need automated testing and consistent tooling so code quality is maintained without manual effort.

## Acceptance Criteria

### GitHub Actions CI (.github/workflows/ci.yml)
- [ ] **Lint Job**: ESLint all packages, Prettier format check
- [ ] **Type Check Job**: TypeScript compiler (noEmit) all workspaces
- [ ] **Test Job**: Vitest unit tests, coverage report
- [ ] **Build Job**: Build all packages and services
- [ ] Triggers: Every PR, push to main
- [ ] Report status on PR

### Local Development Tools
- [ ] Husky pre-commit hooks:
  - Lint staged files
  - Type-check
  - Block commit if failing
- [ ] lint-staged configuration
- [ ] .editorconfig

### Environment Setup
- [ ] .env.example with all required vars
- [ ] Environment validation on startup
- [ ] Clear error messages for missing env vars

### Documentation
- [ ] README.md:
  - Prerequisites (Node 20+, pnpm, Docker)
  - Quick start (3 commands max)
  - Available scripts
  - Troubleshooting
- [ ] CONTRIBUTING.md:
  - Branch naming
  - Commit format
  - PR checklist
  - Code review process

### IDE Integration
- [ ] .vscode/settings.json: Format on save
- [ ] .vscode/extensions.json: Recommended extensions

## CI Pipeline Flow
```
PR opened
    │
    ├──► Lint Check ──────┐
    ├──► Type Check ──────┤──► All pass? ──► Build ──► ✅
    └──► Unit Tests ──────┘    │
                               └──► ❌ Fail
```

### Required Scripts
```json
{
  "lint": "eslint . --ext .ts,.svelte",
  "lint:fix": "eslint . --ext .ts,.svelte --fix",
  "format:check": "prettier --check .",
  "type-check": "tsc --noEmit",
  "test": "vitest run"
}
```

## Out of Scope
- Deployment to AWS (Sprint 4)
- Production secrets management
- Automated releases
- Performance benchmarking

## Estimated Effort
**3 story points** (~6 hours)

## Dependencies
- Story 2: Svelte 5 (for lint config)
- Story 3: pnpm workspaces (for scripts)

## Definition of Done
- [ ] CI passes on this PR
- [ ] Team runs lint/test locally
- [ ] Pre-commit hooks working
- [ ] README verified by team member
- [ ] All team members have working dev env

## Risk Assessment
**LOW** - Standard tooling

## Common Issues
- pnpm caching in GitHub Actions
- TypeScript project references
- Monorepo path resolution in CI

## Success Metrics
- CI completes <5 minutes
- New dev setup <30 minutes
- Zero lint errors in main'

gh issue create \
  --title="[Sprint 2] Set up CI/CD pipeline and developer tooling" \
  --body "$STORY5_BODY" \
  --milestone "$SPRINT_NAME" \
  --label="sprint-2" \
  --label="priority-medium" \
  --label="type-infra" \
  -R "$REPO"

echo "✅ Story 5 created"

# ============================================================
# STEP 5: Summary
# ============================================================
echo ""
echo "================================================"
echo "🎉 Sprint 2 Setup Complete!"
echo "================================================"
echo ""
echo "Repository: https://github.com/$REPO"
echo "Milestone: $SPRINT_NAME"
echo "Due: March 22, 2026"
echo ""
echo "Created:"
echo "  • 1 Epic"
echo "  • 5 Stories (26 points)"
echo "  • 16 Labels"
echo "  • 1 Milestone"
echo ""
echo "Next Steps:"
echo "  1. View issues: gh issue list -R $REPO --milestone '$SPRINT_NAME'"
echo "  2. Set up GitHub Project board manually"
echo "  3. Run Sprint Planning meeting"
echo "  4. Move stories to 'Ready for Dev' after grooming"
echo ""
echo "Sprint Board Columns:"
echo "  Backlog → Ready for Dev → In Progress → Code Review → Testing → Done"
echo ""
echo "⚠️  Capacity Alert:"
echo "  Planned: 52 hours (87% utilization)"
echo "  Buffer: Only 8 hours (13%)"
echo "  Recommendation: Monitor Story 2 closely, be ready to scope down"
echo ""

