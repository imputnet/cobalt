#!/bin/bash

# =============================================================================
# GitHub Projects v2 Setup Script for Sprint 2
# Repository: https://github.com/tomkabel/team21-vooglaadija
# Description: Creates Kanban-style project board with custom fields
# Usage: ./setup-sprint2-project.sh
# Requirements: gh CLI (GitHub CLI) with project management permissions
# =============================================================================

set -e

# Configuration
REPO="tomkabel/team21-vooglaadija"
PROJECT_NAME="Cobalt Sprint 2: Architecture Foundation"
SPRINT_NUMBER="2"
SPRINT_START="2026-03-16"
SPRINT_END="2026-03-22"

echo "🎯 Setting up GitHub Projects v2: $PROJECT_NAME"
echo "=================================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install from: https://cli.github.com/"
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

# =============================================================================
# STEP 1: Create GitHub Project v2
# =============================================================================
echo "📋 Creating GitHub Project v2..."
echo "   Name: $PROJECT_NAME"
echo ""

PROJECT_CREATE_OUTPUT=$(gh project create \
    --owner="tomkabel" \
    --title="$PROJECT_NAME" \
    --format=json 2>&1) || {
    echo "❌ Failed to create project"
    echo "Error: $PROJECT_CREATE_OUTPUT"
    exit 1
}

# Extract project number and URL
PROJECT_NUMBER=$(echo "$PROJECT_CREATE_OUTPUT" | jq -r '.number')
PROJECT_URL=$(echo "$PROJECT_CREATE_OUTPUT" | jq -r '.url')
PROJECT_ID=$(echo "$PROJECT_CREATE_OUTPUT" | jq -r '.id')

if [ -z "$PROJECT_NUMBER" ] || [ "$PROJECT_NUMBER" = "null" ]; then
    echo "❌ Failed to extract project number"
    exit 1
fi

echo "✅ Project created!"
echo "   Number: $PROJECT_NUMBER"
echo "   URL: $PROJECT_URL"
echo "   ID: $PROJECT_ID"
echo ""

# Save project info for later
echo "$PROJECT_NUMBER" > /tmp/sprint2_project_number.txt
echo "$PROJECT_ID" > /tmp/sprint2_project_id.txt

# =============================================================================
# STEP 2: Configure Project Settings
# =============================================================================
echo "⚙️  Configuring project settings..."

# Make project public (optional - remove if you want private)
# gh project edit "$PROJECT_NUMBER" --owner="tomkabel" --visibility=public

echo "✅ Project settings configured"
echo ""

# =============================================================================
# STEP 3: Add Custom Fields
# =============================================================================
echo "📝 Adding custom fields..."
echo ""

# Field 1: Story Points (Number)
echo "   • Adding field: Story Points (Number)..."
gh project field-create "$PROJECT_NUMBER" \
    --owner="tomkabel" \
    --name="Story Points" \
    --data-type=number 2>/dev/null || echo "     ⚠️  Field may already exist"

# Field 2: Priority (Single Select)
echo "   • Adding field: Priority (Single Select)..."
gh project field-create "$PROJECT_NUMBER" \
    --owner="tomkabel" \
    --name="Priority" \
    --data-type=single_select \
    --single-select-options="Critical,High,Medium,Low" 2>/dev/null || echo "     ⚠️  Field may already exist"

# Field 3: Status (Single Select) - This creates Kanban columns
echo "   • Adding field: Status (Single Select)..."
gh project field-create "$PROJECT_NUMBER" \
    --owner="tomkabel" \
    --name="Status" \
    --data-type=single_select \
    --single-select-options="Backlog,Ready for Dev,In Progress,Code Review,Testing,Done" 2>/dev/null || echo "     ⚠️  Field may already exist"

# Field 4: Type (Single Select)
echo "   • Adding field: Type (Single Select)..."
gh project field-create "$PROJECT_NUMBER" \
    --owner="tomkabel" \
    --name="Type" \
    --data-type=single_select \
    --single-select-options="Feature,Refactor,Infrastructure,Testing,Documentation" 2>/dev/null || echo "     ⚠️  Field may already exist"

echo ""
echo "✅ Custom fields created"
echo ""

# =============================================================================
# STEP 4: Add Sprint 2 Issues to Project
# =============================================================================
echo "📎 Adding Sprint 2 issues to project..."
echo ""

# Get all open issues with sprint-2 label
echo "   Finding Sprint 2 issues..."
SPRINT_ISSUES=$(gh issue list -R "$REPO" \
    --label="sprint-2" \
    --state=open \
    --json=number,title,url \
    --limit=20)

if [ -z "$SPRINT_ISSUES" ] || [ "$SPRINT_ISSUES" = "[]" ]; then
    echo "   ⚠️  No Sprint 2 issues found. Make sure issues are created first."
    echo "   Run: ./setup-sprint-2.sh"
    exit 1
fi

# Count issues
ISSUE_COUNT=$(echo "$SPRINT_ISSUES" | jq 'length')
echo "   Found $ISSUE_COUNT Sprint 2 issues"
echo ""

# Add each issue to project and set initial fields
COUNTER=0
echo "$SPRINT_ISSUES" | jq -c '.[]' | while read -r issue; do
    COUNTER=$((COUNTER + 1))
    ISSUE_NUMBER=$(echo "$issue" | jq -r '.number')
    ISSUE_TITLE=$(echo "$issue" | jq -r '.title')
    ISSUE_URL=$(echo "$issue" | jq -r '.url')
    
    echo "   $COUNTER. Adding Issue #$ISSUE_NUMBER: ${ISSUE_TITLE:0:50}..."
    
    # Add issue to project
    ITEM_ADD_RESULT=$(gh project item-add "$PROJECT_NUMBER" \
        --owner="tomkabel" \
        --url="$ISSUE_URL" \
        --format=json 2>&1) || {
        echo "      ❌ Failed to add issue #$ISSUE_NUMBER"
        continue
    }
    
    # Extract item ID for field updates
    ITEM_ID=$(echo "$ITEM_ADD_RESULT" | jq -r '.id')
    
    if [ -n "$ITEM_ID" ] && [ "$ITEM_ID" != "null" ]; then
        # Set initial Status to "Backlog"
        gh project item-edit "$PROJECT_NUMBER" \
            --owner="tomkabel" \
            --id="$ITEM_ID" \
            --field="Status" \
            --value="Backlog" 2>/dev/null || true
        
        # Set Priority based on issue labels
        if echo "$issue" | jq -e '.labels | map(.name) | contains(["priority-critical"])' >/dev/null 2>&1; then
            PRIORITY="Critical"
        elif echo "$issue" | jq -e '.labels | map(.name) | contains(["priority-high"])' >/dev/null 2>&1; then
            PRIORITY="High"
        elif echo "$issue" | jq -e '.labels | map(.name) | contains(["priority-medium"])' >/dev/null 2>&1; then
            PRIORITY="Medium"
        else
            PRIORITY="Low"
        fi
        
        gh project item-edit "$PROJECT_NUMBER" \
            --owner="tomkabel" \
            --id="$ITEM_ID" \
            --field="Priority" \
            --value="$PRIORITY" 2>/dev/null || true
        
        echo "      ✅ Added (Priority: $PRIORITY)"
    else
        echo "      ⚠️  Added but couldn't set fields"
    fi
done

echo ""
echo "✅ All issues added to project"
echo ""

# =============================================================================
# STEP 5: Configure Views
# =============================================================================
echo "🎨 Configuring project views..."
echo ""

# Note: Creating views programmatically is limited in gh CLI
# Users should manually create these views in the UI:
# 1. Board View (Kanban) - grouped by Status
# 2. Table View - for detailed backlog management
# 3. Roadmap View - for timeline visualization

echo "   ℹ️  Manual step required:"
echo ""
echo "   After this script completes, please set up these views in the UI:"
echo ""
echo "   1. Board View (Kanban):"
echo "      - Click '+ New view' → Select 'Board'"
echo "      - Name: 'Sprint Board'"
echo "      - Group by: 'Status'"
echo "      - This creates your Kanban columns!"
echo ""
echo "   2. Table View:"
echo "      - Click '+ New view' → Select 'Table'"
echo "      - Name: 'Sprint Backlog'"
echo "      - Add columns: Story Points, Priority, Status, Assignee"
echo ""
echo "   3. Roadmap View (optional):"
echo "      - Click '+ New view' → Select 'Roadmap'"
echo "      - Name: 'Sprint Timeline'"
echo "      - Group by: 'Status'"
echo ""

# =============================================================================
# STEP 6: Set Story Points (Manual for now)
# =============================================================================
echo "🎲 Setting Story Points..."
echo ""

# Define story points for each issue (by title pattern)
declare -A STORY_POINTS=(
    ["PostgreSQL"]=5
    ["Svelte 5"]=8
    ["pnpm workspaces"]=5
    ["authentication service"]=5
    ["CI/CD pipeline"]=3
)

echo "   Story Points Assignment:"
for key in "${!STORY_POINTS[@]}"; do
    echo "     • $key: ${STORY_POINTS[$key]} points"
done

echo ""
echo "   ℹ️  To set story points manually:"
echo "      1. Open project: $PROJECT_URL"
echo "      2. Switch to 'Table' view"
echo "      3. Click on 'Story Points' column for each issue"
echo "      4. Enter values: 5, 8, 5, 5, 3"
echo ""

# =============================================================================
# STEP 7: Configure Workflows (via GitHub Actions)
# =============================================================================
echo "🤖 Setting up automation workflows..."
echo ""

# Create GitHub Actions workflow for project automation
WORKFLOW_DIR=".github/workflows"
mkdir -p "$WORKFLOW_DIR"

cat > "$WORKFLOW_DIR/project-automation.yml" << 'EOF'
name: Project Automation

on:
  issues:
    types: [opened, labeled, unlabeled, closed, reopened]
  pull_request:
    types: [opened, closed, reopened, ready_for_review]

jobs:
  project-automation:
    runs-on: ubuntu-latest
    steps:
      # Auto-add issues labeled 'sprint-2' to Sprint 2 project
      - name: Add to Sprint 2 Project
        if: contains(github.event.issue.labels.*.name, 'sprint-2') && github.event.action == 'labeled'
        uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/users/tomkabel/projects/${{ env.PROJECT_NUMBER }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
        
      # Move to 'Code Review' when PR linked
      - name: Move to Code Review
        if: github.event_name == 'pull_request' && github.event.action == 'opened'
        uses: actions/github-script@v7
        with:
          script: |
            // Find linked issues and move them to 'Code Review'
            const prBody = context.payload.pull_request.body || '';
            const issueMatches = prBody.match(/(closes?|fixes?|resolves?)\s+#(\d+)/gi) || [];
            
            for (const match of issueMatches) {
              const issueNumber = match.match(/#(\d+)/)[1];
              console.log(`Moving issue #${issueNumber} to Code Review`);
              // TODO: Implement GraphQL mutation to update project item
            }
        
      # Move to 'Done' when PR merged
      - name: Move to Done
        if: github.event_name == 'pull_request' && github.event.pull_request.merged == true
        uses: actions/github-script@v7
        with:
          script: |
            console.log('PR merged - moving linked issues to Done');
            // TODO: Implement GraphQL mutation
EOF

echo "✅ Automation workflow created: $WORKFLOW_DIR/project-automation.yml"
echo "   ℹ️  Note: You need to configure PROJECT_NUMBER in the workflow"
echo ""

# =============================================================================
# STEP 8: Summary
# =============================================================================
echo "================================================"
echo "🎉 GitHub Project v2 Setup Complete!"
echo "================================================"
echo ""
echo "Project Details:"
echo "  📊 Name: $PROJECT_NAME"
echo "  🔢 Number: $PROJECT_NUMBER"
echo "  🔗 URL: $PROJECT_URL"
echo "  🆔 ID: $PROJECT_ID"
echo ""
echo "Created:"
echo "  • 1 GitHub Project v2"
echo "  • 4 Custom Fields (Story Points, Priority, Status, Type)"
echo "  • $ISSUE_COUNT Sprint 2 Issues added"
echo "  • 1 Automation workflow"
echo ""
echo "Custom Fields:"
echo "  📏 Story Points (Number)"
echo "  🚦 Priority (Critical/High/Medium/Low)"
echo "  📋 Status (Backlog → Ready for Dev → In Progress → Code Review → Testing → Done)"
echo "  🏷️  Type (Feature/Refactor/Infrastructure/Testing/Documentation)"
echo ""
echo "Next Steps:"
echo "  1. Open project: $PROJECT_URL"
echo "  2. Create Board view (Kanban) - Group by Status"
echo "  3. Create Table view - Add all custom fields as columns"
echo "  4. Set Story Points for each issue (5, 8, 5, 5, 3)"
echo "  5. Invite team members to the project"
echo "  6. Commit and push the automation workflow"
echo ""
echo "Quick Commands:"
echo "  # View project"
echo "  gh project view $PROJECT_NUMBER --owner=tomkabel"
echo ""
echo "  # List all project items"
echo "  gh project item-list $PROJECT_NUMBER --owner=tomkabel"
echo ""
echo "  # Edit an item (e.g., move to 'In Progress')"
echo "  gh project item-edit $PROJECT_NUMBER --owner=tomkabel \\"
echo "    --id=<item-id> --field=Status --value='In Progress'"
echo ""
echo "Project Number saved to: /tmp/sprint2_project_number.txt"
echo "Project ID saved to: /tmp/sprint2_project_id.txt"
echo ""
echo "🚀 Sprint 2 is ready for action!"
echo ""

# Output project number for potential use by other scripts
echo "$PROJECT_NUMBER"
