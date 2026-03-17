#!/bin/bash

# =============================================================================
# Reusable Sprint Template for Cobalt Project
# Repository: https://github.com/tomkabel/team21-vooglaadija
# Description: Create a new sprint with project board, issues, and automation
# Usage: ./create-sprint.sh <sprint_number> <sprint_name> <start_date> <end_date>
# Example: ./create-sprint.sh 3 "Core Functionality" "2026-03-23" "2026-03-29"
# =============================================================================

set -e

# Check arguments
if [ $# -lt 4 ]; then
    echo "❌ Usage: $0 <sprint_number> <sprint_name> <start_date> <end_date>"
    echo ""
    echo "Example:"
    echo "  $0 3 \"Core Functionality\" \"2026-03-23\" \"2026-03-29\""
    echo ""
    echo "Sprint Templates Available:"
    echo "  Sprint 3: Core Functionality (WebCodecs)"
    echo "  Sprint 4: Cloud & CI/CD"
    echo "  Sprint 5: Observability & Demo"
    echo "  Sprint 6: Refinement & Security"
    echo "  Sprint 7: Release & Documentation"
    echo "  Sprint 8: Reflection & Final Delivery"
    exit 1
fi

SPRINT_NUMBER=$1
SPRINT_NAME="Sprint $SPRINT_NUMBER: $2"
SPRINT_START=$3
SPRINT_END=$4
REPO="tomkabel/team21-vooglaadija"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 Creating Sprint $SPRINT_NUMBER: $2${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""
echo "📅 Sprint Period: $SPRINT_START → $SPRINT_END"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed.${NC}"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated. Run: gh auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Authentication verified${NC}"
echo ""

# =============================================================================
# STEP 1: Create Sprint Label
# =============================================================================
echo "🏷️  Creating sprint label..."
gh label create "sprint-$SPRINT_NUMBER" \
    --color "0E8A16" \
    --description "Sprint $SPRINT_NUMBER work" \
    -R "$REPO" 2>/dev/null || echo -e "${YELLOW}⚠️  Label sprint-$SPRINT_NUMBER already exists${NC}"

# =============================================================================
# STEP 2: Create Milestone
# =============================================================================
echo "📅 Creating milestone..."
MILESTONE_RESULT=$(gh api repos/$REPO/milestones \
    --method POST \
    --field title="$SPRINT_NAME" \
    --field state=open \
    --field description="Sprint $SPRINT_NUMBER: $2" \
    --field due_on="${SPRINT_END}T23:59:59Z" 2>/dev/null || echo "exists")

if [ "$MILESTONE_RESULT" = "exists" ]; then
    echo -e "${YELLOW}⚠️  Milestone may already exist${NC}"
else
    echo -e "${GREEN}✅ Milestone created${NC}"
fi

# =============================================================================
# STEP 3: Create Epic Issue
# =============================================================================
echo "📋 Creating Epic..."

EPIC_BODY="## Epic Goal
Sprint $SPRINT_NUMBER focus: $2

## Sprint Details
- **Start:** $SPRINT_START
- **End:** $SPRINT_END
- **Duration:** 1 week

## Success Criteria
- [ ] All P0 stories completed
- [ ] CI/CD pipeline green
- [ ] Demo completed
- [ ] Documentation updated

## Definition of Done
- [ ] Code reviewed and approved
- [ ] Tests passing (>80% coverage)
- [ ] Documentation complete
- [ ] Demo to team

## Risk Assessment
(TBD during sprint planning)

## Team Capacity
- **Available:** 60 hours (2 devs × 5 days × 6 hrs)
- **Planned:** 42 hours (70% capacity)
- **Buffer:** 18 hours for incidents/unknowns"

EPIC_URL=$(gh issue create \
    --title="[EPIC] $SPRINT_NAME" \
    --body "$EPIC_BODY" \
    --label="epic" \
    --label="sprint-$SPRINT_NUMBER" \
    --label="priority-high" \
    -R "$REPO" | grep -o 'https://github.com.*issues/[0-9]*')

EPIC_NUMBER=$(echo "$EPIC_URL" | grep -o '[0-9]*$')

echo -e "${GREEN}✅ Epic created: #$EPIC_NUMBER${NC}"
echo ""

# =============================================================================
# STEP 4: Create Sprint Stories Based on Template
# =============================================================================
echo "📝 Creating sprint stories..."
echo ""

create_story() {
    local title="$1"
    local body="$2"
    local points="$3"
    local priority="$4"
    local type="$5"
    local area="$6"
    local dependencies="$7"
    
    # Build labels array
    labels="sprint-$SPRINT_NUMBER"
    [ -n "$priority" ] && labels="$labels,$priority"
    [ -n "$type" ] && labels="$labels,$type"
    [ -n "$area" ] && labels="$labels,$area"
    
    # Create full body with metadata
    FULL_BODY="$body

## Sprint Metadata
- **Sprint:** $SPRINT_NUMBER
- **Story Points:** $points
- **Priority:** ${priority:-Medium}
- **Type:** ${type:-Feature}
- **Epic:** #$EPIC_NUMBER
- **Dependencies:** ${dependencies:-None}
- **Sprint Dates:** $SPRINT_START → $SPRINT_END

## Time Tracking
- **Estimated Hours:** $((points * 2)) hours
- **Buffer:** Include 20% buffer time

## Definition of Done
- [ ] Acceptance criteria met
- [ ] Code reviewed by at least 1 team member
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Demo completed
- [ ] Merged to main branch

## Notes
- Start date: $SPRINT_START
- Target completion: Mid-sprint review
- Blockers to be escalated immediately"

    gh issue create \
        --title="[Sprint $SPRINT_NUMBER] $title" \
        --body "$FULL_BODY" \
        --milestone "$SPRINT_NAME" \
        --label="$labels" \
        -R "$REPO"
}

# Sprint-specific story templates
case $SPRINT_NUMBER in
    3)
        # Sprint 3: Core Functionality
        echo "Loading Sprint 3 template: Core Functionality (WebCodecs)..."
        
        create_story "Integrate WebCodecs VideoDecoder API" \
"## User Story
As a user, I want faster video processing so downloads complete quickly.

## Acceptance Criteria
- [ ] VideoDecoder wrapper implemented
- [ ] Support H.264, VP8, VP9, AV1 codecs
- [ ] Codec configuration parsing
- [ ] Error handling for unsupported formats
- [ ] Hardware acceleration detection
- [ ] Unit tests with mock decoder
- [ ] Browser compatibility matrix documented

## Technical Notes
- Browser support: Chrome 94+, Safari 16.4+, Firefox 120+
- Target: 90% payload reduction (25MB → <2MB)
- Use mp4box.js for container handling" \
            8 "priority-high" "type-feature" "area-webcodecs" "Story 3: pnpm workspaces"
        
        create_story "Integrate WebCodecs VideoEncoder API" \
"## User Story
As a user, I want videos encoded to my preferred format.

## Acceptance Criteria
- [ ] VideoEncoder wrapper implemented
- [ ] Support H.264, VP8, VP9 output
- [ ] Bitrate and quality configuration
- [ ] Keyframe insertion logic
- [ ] Hardware acceleration support
- [ ] Progress callbacks
- [ ] Performance benchmarking vs LibAV" \
            8 "priority-high" "type-feature" "area-webcodecs" "Story 1: VideoDecoder"
        
        create_story "Refactor stores to Svelte 5 Runes" \
"## User Story
As a developer, I want modern reactive state management.

## Acceptance Criteria
- [ ] Inventory all stores (identify 9 total)
- [ ] Convert writable stores to \$state
- [ ] Convert derived stores to \$derived
- [ ] Update all component imports
- [ ] Remove legacy store subscriptions
- [ ] Test reactivity in all components
- [ ] Document migration patterns

## Technical Notes
- 9 stores to migrate
- 34+ components affected
- Runes: \$state, \$derived, \$props, \$effect" \
            8 "priority-high" "type-refactor" "area-svelte" "Sprint 2: Svelte 5 environment"
        
        create_story "Implement JWT refresh token rotation" \
"## User Story
As a user, I want persistent sessions without frequent re-login.

## Acceptance Criteria
- [ ] Refresh token generation (secure random 256-bit)
- [ ] Store tokens hashed in database
- [ ] POST /auth/refresh endpoint
- [ ] Token rotation (new token on each use)
- [ ] Token expiration (7 days)
- [ ] Token revocation endpoint
- [ ] Theft detection (token reuse)

## Technical Notes
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- httpOnly cookies for refresh tokens" \
            5 "priority-high" "type-feature" "area-auth" "Sprint 2: Auth service"
        
        create_story "Build download flow UI with Svelte 5" \
"## User Story
As a user, I want an intuitive interface for downloading media.

## Acceptance Criteria
- [ ] URL input with validation
- [ ] Platform detection (YouTube, TikTok, etc.)
- [ ] Format selection (video/audio quality)
- [ ] Download progress indicator
- [ ] Real-time status updates
- [ ] Error handling and retry
- [ ] Mobile-responsive design

## Technical Notes
- Use \$state for reactive progress
- \$derived for computed status
- \$effect for SSE connection" \
            5 "priority-medium" "type-feature" "area-svelte" "Story 3: Svelte 5 Runes refactor"
        
        create_story "Implement WebCodecs AudioDecoder/Encoder" \
"## User Story
As a user, I want audio extraction and processing.

## Acceptance Criteria
- [ ] AudioDecoder wrapper
- [ ] AudioEncoder wrapper
- [ ] Support AAC, Opus, Vorbis
- [ ] Audio resampling
- [ ] Audio-video synchronization
- [ ] Audio-only download support

## Technical Notes
- Handle different sample rates
- Channel layout management
- Memory-efficient audio frames" \
            5 "priority-medium" "type-feature" "area-webcodecs" "Story 1: VideoDecoder"
        ;;
        
    4)
        # Sprint 4: Cloud & CI/CD
        echo "Loading Sprint 4 template: Cloud & CI/CD..."
        
        create_story "Set up AWS CDK infrastructure as code" \
"## User Story
As an ops engineer, I want infrastructure defined in code.

## Acceptance Criteria
- [ ] CDK project initialized in /infra/
- [ ] VPC with public/private subnets
- [ ] ECS Fargate cluster
- [ ] Application Load Balancer
- [ ] RDS PostgreSQL instance
- [ ] ElastiCache Redis
- [ ] Security groups and IAM roles
- [ ] CloudWatch logging
- [ ] Infrastructure diagram

## Technical Notes
- Use CDK v2 with TypeScript
- Multi-AZ deployment
- Auto-scaling policies
- Secrets with AWS Secrets Manager" \
            13 "priority-high" "type-infra" "area-aws" "Sprint 3 completion"
        
        create_story "Build GitHub Actions CI/CD pipeline" \
"## User Story
As a developer, I want automated testing and deployment.

## Acceptance Criteria
- [ ] CI workflow: lint, test, build on PR
- [ ] CD workflow: deploy to staging on merge
- [ ] Production deployment with approval
- [ ] Docker image building and ECR push
- [ ] Automated database migrations
- [ ] Smoke tests after deployment
- [ ] Rollback mechanism
- [ ] Build caching

## Technical Notes
- GitHub Actions matrix for parallel jobs
- OIDC authentication with AWS
- Separate workflows per service" \
            8 "priority-high" "type-infra" "" "Story 1: AWS CDK"
        
        create_story "Optimize Vite build configuration" \
"## User Story
As a user, I want fast page loads.

## Acceptance Criteria
- [ ] Manual chunking strategy
- [ ] Vendor chunks (node_modules)
- [ ] Dynamic imports for heavy components
- [ ] CSS code-splitting
- [ ] Asset optimization
- [ ] Tree-shaking config
- [ ] <50KB initial JS bundle

## Technical Notes
- Use rollupOptions for chunking
- Preload critical assets
- Bundle analyzer" \
            5 "priority-high" "type-refactor" "area-svelte" "Sprint 2: Svelte 5 environment"
        
        create_story "Dockerize all microservices" \
"## User Story
As a developer, I want consistent container builds.

## Acceptance Criteria
- [ ] Multi-stage Dockerfile per service
- [ ] Optimized image sizes
- [ ] Health checks
- [ ] Non-root user execution
- [ ] .dockerignore per service
- [ ] Docker Compose for local dev
- [ ] Vulnerability scanning

## Technical Notes
- Use BuildKit
- Layer caching optimization
- Security scanning with Trivy" \
            5 "priority-medium" "type-infra" "" "Story 1: AWS CDK"
        
        create_story "Implement API Gateway for microservices" \
"## User Story
As a client, I want a single entry point for all APIs.

## Acceptance Criteria
- [ ] API Gateway service
- [ ] Route configuration
- [ ] Request/response transformation
- [ ] Rate limiting at gateway
- [ ] Authentication middleware
- [ ] CORS configuration
- [ ] Request logging
- [ ] Circuit breaker pattern

## Technical Notes
- Use Kong, Traefik, or custom Express
- Path-based routing
- Centralized error handling" \
            5 "priority-medium" "type-feature" "" "Sprint 3: pnpm workspaces"
        ;;
        
    5)
        # Sprint 5: Observability & Demo
        echo "Loading Sprint 5 template: Observability & Demo..."
        
        create_story "Instrument API with Prometheus metrics" \
"## User Story
As an ops engineer, I want visibility into system performance.

## Acceptance Criteria
- [ ] Install prom-client
- [ ] HTTP request duration histograms
- [ ] Request counters by endpoint
- [ ] Active connections gauge
- [ ] Download success/failure rates
- [ ] Processing time metrics
- [ ] Database pool metrics
- [ ] /metrics endpoint

## Technical Notes
- Default Node.js metrics
- Custom business metrics
- Appropriate labeling" \
            5 "priority-high" "type-feature" "area-monitoring" "Sprint 4: Services deployed"
        
        create_story "Create Grafana dashboards for monitoring" \
"## User Story
As a team, I want visual monitoring of our systems.

## Acceptance Criteria
- [ ] Grafana instance setup
- [ ] System Overview dashboard
- [ ] Business Metrics dashboard
- [ ] Database dashboard
- [ ] Alerting rules
- [ ] Notification channels
- [ ] Dashboard versioning

## Technical Notes
- Use Grafana provisioning
- Reusable panels
- Alert thresholds" \
            5 "priority-high" "type-feature" "area-monitoring" "Story 1: Prometheus metrics"
        
        create_story "Implement Playwright E2E tests for critical paths" \
"## User Story
As a developer, I want confidence that core flows work.

## Acceptance Criteria
- [ ] Playwright framework setup
- [ ] User registration flow test
- [ ] Login/logout test
- [ ] Download workflow test
- [ ] Error handling tests
- [ ] Mobile responsive tests
- [ ] Cross-browser tests
- [ ] CI integration
- [ ] Video recording on failure

## Technical Notes
- Page Object Model pattern
- Test against staging
- Mock external APIs" \
            8 "priority-high" "type-testing" "" "Sprint 4: App deployed"
        
        create_story "Benchmark performance improvements" \
"## User Story
As a team, I want to measure our optimizations.

## Acceptance Criteria
- [ ] Measure initial page load (LCP)
- [ ] Compare bundle sizes
- [ ] Test download processing speed
- [ ] Memory usage analysis
- [ ] Lighthouse CI integration
- [ ] Web Vitals tracking
- [ ] Performance report

## Technical Notes
- Target LCP < 0.8s
- Target bundle < 2MB
- Regression detection" \
            3 "priority-medium" "type-testing" "" "Sprint 4: WebCodecs complete"
        
        create_story "Create and record video presentation" \
"## User Story
As a stakeholder, I want to see the project demo.

## Acceptance Criteria
- [ ] Write video script (5-7 min)
- [ ] Record live demo
- [ ] Show before/after comparison
- [ ] Explain architecture decisions
- [ ] Demonstrate monitoring
- [ ] Add captions
- [ ] Edit and finalize
- [ ] Upload to platform

## Technical Notes
- Focus on technical achievements
- Show actual metrics
- Professional but accessible" \
            5 "priority-high" "type-docs" "" "All Sprint 5 features"
        ;;
        
    6)
        # Sprint 6: Refinement & Security
        echo "Loading Sprint 6 template: Refinement & Security..."
        
        create_story "Implement comprehensive Zod input validation" \
"## User Story
As a user, I want secure input handling.

## Acceptance Criteria
- [ ] Validation schemas for all endpoints
- [ ] URL validation with format checks
- [ ] Input sanitization
- [ ] File upload validation
- [ ] Query parameter validation
- [ ] Error messages for failures
- [ ] Frontend form sync
- [ ] Test coverage for schemas

## Technical Notes
- Zod for TypeScript-first validation
- Coercion for type conversion
- Reusable components" \
            5 "priority-high" "type-feature" "" "Sprint 5: Core functionality"
        
        create_story "Implement OWASP security hardening" \
"## User Story
As a user, I want a secure application.

## Acceptance Criteria
- [ ] Helmet.js for security headers
- [ ] Strict CORS origin policy
- [ ] Content Security Policy
- [ ] XSS protection
- [ ] Clickjacking prevention
- [ ] HSTS configuration
- [ ] Secure cookie settings
- [ ] SQL injection prevention
- [ ] Rate limiting enhancement
- [ ] OWASP ZAP audit

## Technical Notes
- Helmet for Express/Fastify
- Strict CSP with nonce
- Environment-based CORS" \
            5 "priority-high" "type-feature" "area-auth" "Sprint 5: Auth complete"
        
        create_story "Complete Tailwind CSS migration" \
"## User Story
As a developer, I want consistent utility-first styling.

## Acceptance Criteria
- [ ] Audit custom CSS files
- [ ] Create Tailwind config
- [ ] Migrate app.css to directives
- [ ] Convert component styles
- [ ] Custom theme (colors, fonts)
- [ ] Responsive design parity
- [ ] Dark mode support
- [ ] Purge unused styles

## Technical Notes
- Tailwind 3.x with JIT
- Custom config for design system
- Use @apply for patterns" \
            8 "priority-medium" "type-refactor" "area-svelte" "Sprint 3: Svelte 5 migration"
        
        create_story "Implement global error handling" \
"## User Story
As a user, I want graceful error handling.

## Acceptance Criteria
- [ ] Custom error classes
- [ ] Global error boundary
- [ ] API error middleware
- [ ] User-friendly messages
- [ ] Error logging
- [ ] Recovery mechanisms
- [ ] Fallback UI
- [ ] Error reporting (Sentry)
- [ ] Toast notifications

## Technical Notes
- Svelte error boundaries
- Structured error responses
- Error codes for i18n" \
            5 "priority-medium" "type-feature" "area-svelte" "Sprint 3: Svelte 5"
        
        create_story "UI/UX polish and micro-interactions" \
"## User Story
As a user, I want a polished interface.

## Acceptance Criteria
- [ ] Loading animations
- [ ] Page transitions
- [ ] Button micro-interactions
- [ ] Skeleton screens
- [ ] Success/error animations
- [ ] Smooth scrolling
- [ ] Focus states
- [ ] Hover effects

## Technical Notes
- Svelte transitions
- CSS transforms
- prefers-reduced-motion" \
            5 "priority-medium" "type-feature" "area-svelte" "Story 3: Tailwind migration"
        
        create_story "Achieve 80% unit test coverage" \
"## User Story
As a developer, I want confidence in code quality.

## Acceptance Criteria
- [ ] Vitest setup
- [ ] Utility function tests
- [ ] Store logic tests
- [ ] Service method tests
- [ ] Mock external deps
- [ ] Error scenario tests
- [ ] Coverage reports in CI
- [ ] 80% coverage threshold

## Technical Notes
- Vitest for fast testing
- @testing-library/svelte
- MSW for API mocking" \
            8 "priority-medium" "type-testing" "" "Sprint 5: Core functionality"
        ;;
        
    7)
        # Sprint 7: Release & Documentation
        echo "Loading Sprint 7 template: Release & Documentation..."
        
        create_story "Generate OpenAPI 3.0 specification" \
"## User Story
As an integrator, I want API documentation.

## Acceptance Criteria
- [ ] Document all endpoints
- [ ] Define request/response schemas
- [ ] Authentication requirements
- [ ] Example requests/responses
- [ ] Error response docs
- [ ] Swagger UI integration
- [ ] Generate client SDKs
- [ ] Version the API spec

## Technical Notes
- Use @fastify/swagger
- OpenAPI 3.0 spec
- JSON Schema validation" \
            5 "priority-high" "type-docs" "" "All API endpoints complete"
        
        create_story "Implement Service Worker for offline" \
"## User Story
As a user, I want offline capability.

## Acceptance Criteria
- [ ] Service Worker registration
- [ ] Cache static assets
- [ ] Cache-first network strategy
- [ ] Background sync
- [ ] Push notifications (optional)
- [ ] Cache versioning
- [ ] Offline fallback page
- [ ] PWA audit

## Technical Notes
- Workbox for SW management
- Precache static assets
- Runtime caching" \
            5 "priority-medium" "type-feature" "" "Sprint 4: Vite optimization"
        
        create_story "Write comprehensive technical documentation" \
"## User Story
As a developer, I want complete docs.

## Acceptance Criteria
- [ ] Architecture overview
- [ ] API documentation (OpenAPI)
- [ ] Database schema docs
- [ ] Deployment guide
- [ ] Development setup guide
- [ ] Environment configuration
- [ ] Troubleshooting guide
- [ ] Contributing guidelines
- [ ] Changelog

## Technical Notes
- Markdown in /docs
- Mermaid diagrams
- Code examples" \
            5 "priority-high" "type-docs" "" "All features complete"
        
        create_story "Create end-user documentation and FAQ" \
"## User Story
As a user, I want help using the app.

## Acceptance Criteria
- [ ] User guide / tutorial
- [ ] FAQ section
- [ ] Troubleshooting for users
- [ ] Supported platforms list
- [ ] Format options guide
- [ ] Privacy information
- [ ] Terms of service
- [ ] Help tooltips in UI

## Technical Notes
- Simple, accessible language
- Screenshots and GIFs
- i18n support" \
            3 "priority-medium" "type-docs" "" "Story 2: Technical docs"
        
        create_story "Prepare release candidate" \
"## User Story
As a team, I want a stable release.

## Acceptance Criteria
- [ ] Code freeze
- [ ] Bug fixes from testing
- [ ] Performance regression testing
- [ ] Security audit
- [ ] Migration testing
- [ ] Rollback plan
- [ ] Release notes
- [ ] Version tagging
- [ ] Production dry-run

## Technical Notes
- Semantic versioning
- Git tags
- Migration rollback scripts" \
            5 "priority-high" "" "" "All Sprint 7 features"
        
        create_story "Prepare for first project presentation" \
"## User Story
As a team, I want to present our work.

## Acceptance Criteria
- [ ] Create presentation slides
- [ ] Architecture diagrams
- [ ] Demo preparation
- [ ] Talking points
- [ ] Q&A preparation
- [ ] Backup plans
- [ ] Rehearsal

## Technical Notes
- 10-15 minute presentation
- Live demo with backup
- Focus on achievements" \
            3 "priority-high" "type-docs" "" "Release candidate"
        ;;
        
    8)
        # Sprint 8: Reflection & Final Delivery
        echo "Loading Sprint 8 template: Reflection & Final Delivery..."
        
        create_story "Conduct final project retrospective" \
"## User Story
As a team, I want to learn from our journey.

## Acceptance Criteria
- [ ] Schedule retrospective
- [ ] Gather team feedback
- [ ] Review goals vs outcomes
- [ ] Identify successes
- [ ] Identify improvements
- [ ] Document lessons learned
- [ ] Create action items
- [ ] Share summary

## Technical Notes
- Start/Stop/Continue format
- Anonymous feedback option" \
            3 "priority-high" "type-docs" "" "All previous work"
        
        create_story "Final bug fixes and polish" \
"## User Story
As a user, I want a polished final product.

## Acceptance Criteria
- [ ] Triage open issues
- [ ] Fix critical bugs
- [ ] Fix high-priority bugs
- [ ] UI/UX improvements
- [ ] Performance tuning
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Accessibility audit
- [ ] Final code review

## Technical Notes
- Prioritize user-facing bugs
- Regression testing
- No new features" \
            8 "priority-high" "" "" "Release candidate"
        
        create_story "Deliver final project presentation" \
"## User Story
As a team, I want to showcase our work.

## Acceptance Criteria
- [ ] Finalize slides
- [ ] Prepare live demo
- [ ] Technical setup check
- [ ] Present to audience
- [ ] Handle Q&A
- [ ] Collect feedback
- [ ] Document outcomes

## Technical Notes
- 15-20 minute presentation
- Live demo with backup
- Professional delivery" \
            5 "priority-high" "type-docs" "" "All previous work"
        
        create_story "Write final reflection report" \
"## User Story
As a student, I need to document my learning.

## Acceptance Criteria
- [ ] Project overview
- [ ] Technical achievements
- [ ] Challenges and solutions
- [ ] Team collaboration
- [ ] Individual contributions
- [ ] Lessons learned
- [ ] Future improvements
- [ ] Metrics and stats
- [ ] Final conclusions

## Technical Notes
- Honest reflection
- Include metrics
- Professional writing" \
            5 "priority-high" "type-docs" "" "Project completion"
        
        create_story "Archive project and create handover" \
"## User Story
As a team, I want proper project closure.

## Acceptance Criteria
- [ ] Final code cleanup
- [ ] Update documentation
- [ ] Maintenance guide
- [ ] Known issues doc
- [ ] Runbook for tasks
- [ ] Archive schemas
- [ ] Export configs
- [ ] Handover document
- [ ] Tag final release

## Technical Notes
- Clear docs for future devs
- Contact information
- Deployment procedures" \
            3 "priority-medium" "type-docs" "" "All previous work"
        ;;
        
    *)
        echo -e "${RED}❌ Unknown sprint number: $SPRINT_NUMBER${NC}"
        echo "Available templates: 3, 4, 5, 6, 7, 8"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Sprint $SPRINT_NUMBER stories created${NC}"
echo ""

# =============================================================================
# STEP 5: Create GitHub Project
# =============================================================================
echo "📊 Creating GitHub Project v2..."

PROJECT_CREATE_OUTPUT=$(gh project create \
    --owner="tomkabel" \
    --title="$SPRINT_NAME" \
    --format=json 2>&1) || {
    echo -e "${YELLOW}⚠️  Could not create project automatically${NC}"
    echo "   Create manually at: https://github.com/tomkabel/projects"
    PROJECT_NUMBER=""
}

if [ -n "$PROJECT_CREATE_OUTPUT" ]; then
    PROJECT_NUMBER=$(echo "$PROJECT_CREATE_OUTPUT" | jq -r '.number')
    PROJECT_URL=$(echo "$PROJECT_CREATE_OUTPUT" | jq -r '.url')
    
    echo -e "${GREEN}✅ Project created: #$PROJECT_NUMBER${NC}"
    echo "   URL: $PROJECT_URL"
    
    # Add custom fields
    echo "   Adding custom fields..."
    gh project field-create "$PROJECT_NUMBER" \
        --owner="tomkabel" \
        --name="Story Points" \
        --data-type=number 2>/dev/null || true
    
    gh project field-create "$PROJECT_NUMBER" \
        --owner="tomkabel" \
        --name="Status" \
        --data-type=single_select \
        --single-select-options="Backlog,Ready for Dev,In Progress,Code Review,Testing,Done" 2>/dev/null || true
    
    gh project field-create "$PROJECT_NUMBER" \
        --owner="tomkabel" \
        --name="Priority" \
        --data-type=single_select \
        --single-select-options="Critical,High,Medium,Low" 2>/dev/null || true
    
    # Add issues to project
    echo "   Adding issues to project..."
    ISSUES=$(gh issue list -R "$REPO" --label="sprint-$SPRINT_NUMBER" --json=url --limit=20)
    echo "$ISSUES" | jq -r '.[].url' | while read -r url; do
        gh project item-add "$PROJECT_NUMBER" --owner="tomkabel" --url="$url" 2>/dev/null || true
    done
else
    PROJECT_URL="https://github.com/tomkabel/projects"
fi

# =============================================================================
# STEP 6: Summary
# =============================================================================
echo ""
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}🎉 Sprint $SPRINT_NUMBER Created Successfully!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo "Sprint Details:"
echo "  📅 Period: $SPRINT_START → $SPRINT_END"
echo "  📋 Epic: #$EPIC_NUMBER"
echo "  📊 Milestone: $SPRINT_NAME"
[ -n "$PROJECT_NUMBER" ] && echo "  📈 Project: #$PROJECT_NUMBER"
[ -n "$PROJECT_URL" ] && echo "  🔗 URL: $PROJECT_URL"
echo ""
echo "Next Steps:"
echo "  1. Review and refine stories in GitHub"
echo "  2. Run Sprint Planning meeting"
echo "  3. Assign owners to stories"
echo "  4. Set Story Points (if not auto-set)"
echo "  5. Move ready stories to 'Ready for Dev'"
[ -z "$PROJECT_NUMBER" ] && echo "  6. Create GitHub Project board manually"
echo ""
echo "Quick Commands:"
echo "  # View sprint issues"
echo "  gh issue list -R $REPO --milestone \"$SPRINT_NAME\""
echo ""
[ -n "$PROJECT_NUMBER" ] && echo "  # View project board"
[ -n "$PROJECT_NUMBER" ] && echo "  gh project view $PROJECT_NUMBER --owner=tomkabel"
echo ""
echo -e "${GREEN}🚀 Sprint $SPRINT_NUMBER is ready!${NC}"
echo ""
