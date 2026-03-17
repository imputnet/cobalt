# GitHub Sprint Management Scripts

This directory contains scripts for managing GitHub Projects and Sprints for the Cobalt project.

## Scripts

### 1. `setup-sprint2-project.sh` - Sprint 2 Kanban Board Setup

Creates a full GitHub Projects v2 board with Kanban layout for Sprint 2.

**What it creates:**
- GitHub Project v2 board
- 4 custom fields (Story Points, Priority, Status, Type)
- Adds all Sprint 2 issues to the project
- Creates automation workflow
- Configures board views

**Usage:**
```bash
./setup-sprint2-project.sh
```

**Requirements:**
- Issues must already exist (run `setup-sprint-2.sh` first)
- `gh` CLI authenticated with project permissions

**After running:**
1. Open the project URL provided
2. Create a Board view (Kanban) - Group by "Status"
3. Create a Table view for backlog management
4. Set Story Points for each issue: 5, 8, 5, 5, 3
5. Invite team members

---

### 2. `create-sprint.sh` - Reusable Sprint Template

Creates a complete sprint with Epic, stories, milestone, and project board.

**Supported Sprints:**
- Sprint 3: Core Functionality (WebCodecs)
- Sprint 4: Cloud & CI/CD
- Sprint 5: Observability & Demo
- Sprint 6: Refinement & Security
- Sprint 7: Release & Documentation
- Sprint 8: Reflection & Final Delivery

**Usage:**
```bash
./create-sprint.sh <number> <name> <start_date> <end_date>
```

**Examples:**
```bash
# Sprint 3: Core Functionality
./create-sprint.sh 3 "Core Functionality" "2026-03-23" "2026-03-29"

# Sprint 4: Cloud & CI/CD
./create-sprint.sh 4 "Cloud & CI/CD" "2026-03-30" "2026-04-05"

# Sprint 5: Observability
./create-sprint.sh 5 "Observability & Demo" "2026-04-06" "2026-04-12"

# Sprint 6: Refinement
./create-sprint.sh 6 "Refinement & Security" "2026-04-20" "2026-04-26"

# Sprint 7: Release
./create-sprint.sh 7 "Release & Documentation" "2026-04-27" "2026-05-03"

# Sprint 8: Final Delivery
./create-sprint.sh 8 "Reflection & Final Delivery" "2026-05-04" "2026-05-10"
```

**What it creates for each sprint:**
- Sprint label (e.g., `sprint-3`)
- GitHub milestone with due date
- Epic issue with success criteria
- 4-6 detailed user stories with:
  - Acceptance criteria
  - Story points
  - Priority labels
  - Type labels
  - Dependencies
  - Definition of Done
- GitHub Project v2 board (optional)
- Custom fields (Status, Priority, Story Points)

---

## Quick Start Guide

### For Sprint 2 (Already Created)

Sprint 2 issues already exist in your repository. Now create the project board:

```bash
# 1. Create the Kanban board
./setup-sprint2-project.sh

# 2. Open the project URL (provided in output)
# 3. Configure Board view: Group by "Status"
# 4. Set Story Points: 5, 8, 5, 5, 3
```

### For Sprints 3-8

Create each sprint with one command:

```bash
# Sprint 3
./create-sprint.sh 3 "Core Functionality" "2026-03-23" "2026-03-29"

# Sprint 4
./create-sprint.sh 4 "Cloud & CI/CD" "2026-03-30" "2026-04-05"

# ... and so on
```

---

## Project Board Structure

### Custom Fields

| Field | Type | Purpose |
|-------|------|---------|
| **Story Points** | Number | Effort estimation (Fibonacci: 1,2,3,5,8,13) |
| **Status** | Single Select | Kanban columns |
| **Priority** | Single Select | Critical/High/Medium/Low |
| **Type** | Single Select | Feature/Refactor/Infrastructure/Testing/Docs |

### Status Workflow

```
Backlog → Ready for Dev → In Progress → Code Review → Testing → Done
```

### Views

1. **Board View (Kanban)** - Drag-and-drop cards between columns
2. **Table View** - Spreadsheet with sorting/filtering
3. **Roadmap View** - Timeline visualization

---

## Daily Commands

```bash
# View your assigned issues
gh issue list -R tomkabel/team21-vooglaadija --assignee=@me

# View Sprint 2 board
gh project view 1 --owner=tomkabel

# Move item to "In Progress"
gh project item-edit 1 --owner=tomkabel \
  --id=<item-id> --field=Status --value="In Progress"

# List all project items
gh project item-list 1 --owner=tomkabel

# View specific issue
gh issue view 2 -R tomkabel/team21-vooglaadija
```

---

## Sprint 2 Story Points

| Issue | Title | Points |
|-------|-------|--------|
| #2 | PostgreSQL Schema | 5 |
| #3 | Svelte 5 Environment | 8 |
| #4 | pnpm Workspaces | 5 |
| #5 | Auth Service | 5 |
| #6 | CI/CD Pipeline | 3 |
| **Total** | | **26** |

**Capacity:** 60 hours available, 52 planned (87% utilization)

---

## Requirements

- GitHub CLI (`gh`) installed
- Authenticated: `gh auth login`
- Repository: `tomkabel/team21-vooglaadija`
- Permissions: Issues, Projects, Milestones

---

## Troubleshooting

### "Project creation failed"
- Ensure `gh` CLI has project permissions
- Try creating project manually in GitHub UI first

### "Issues not found"
- Run `setup-sprint-2.sh` first to create issues
- Check issues have `sprint-2` label

### "Label already exists"
- This is normal, script continues
- Labels are idempotent

### "Field already exists"
- This is normal for project fields
- Fields are preserved between runs

---

## Tips

1. **Use Table view for planning** - Easy to sort by points/priority
2. **Use Board view for daily standups** - Visual workflow
3. **Update Status immediately** - When you start/stop work
4. **Set Story Points in Table view** - Quick batch editing
5. **Archive Done items** - Keeps board clean

---

## Next Steps After Setup

1. ✅ Issues created (`setup-sprint-2.sh`)
2. ✅ Project board created (`setup-sprint2-project.sh`)
3. 🔄 **Configure views** (manual in GitHub UI)
4. 🔄 **Sprint Planning** (assign owners, points)
5. 🔄 **Daily Standups** (update Status)
6. 🔄 **Sprint Review** (demo, gather feedback)

---

## Files Generated

- `setup-sprint2-project.sh` - Sprint 2 project setup
- `create-sprint.sh` - Reusable sprint template
- `setup-sprint-2.sh` - Sprint 2 issues/milestone/labels
- `.github/workflows/project-automation.yml` - Automation workflow

---

## Support

For issues with GitHub CLI:
```bash
gh --version
gh auth status
gh project --help
```

For project management:
- GitHub Projects docs: https://docs.github.com/en/issues/planning-and-tracking-with-projects
- gh CLI docs: https://cli.github.com/manual/
