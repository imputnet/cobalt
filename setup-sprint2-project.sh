#!/bin/bash

# =============================================================================
# Production-Ready GitHub Projects v2 Setup Script
# Repository: https://github.com/tomkabel/team21-vooglaadija
# Description: Idempotent, robust Kanban board setup with rollback support
# Usage: ./setup-sprint2-project.sh [OPTIONS]
# Version: 2.0.0
# =============================================================================

set -euo pipefail

# =============================================================================
# CONFIGURATION & CONSTANTS
# =============================================================================
readonly SCRIPT_VERSION="2.0.0"
readonly SCRIPT_NAME="$(basename "$0")"

# Default values (can be overridden via command line)
REPO="${REPO:-tomkabel/team21-vooglaadija}"
SPRINT_NUMBER="${SPRINT_NUMBER:-2}"
SPRINT_NAME="${SPRINT_NAME:-Architecture Foundation}"
PROJECT_NAME="${PROJECT_NAME:-Cobalt Sprint $SPRINT_NUMBER: $SPRINT_NAME}"
SPRINT_START="${SPRINT_START:-2026-03-16}"
SPRINT_END="${SPRINT_END:-2026-03-22}"

# Field options (defined as constants for maintainability)
readonly PRIORITY_OPTIONS="Critical,High,Medium,Low"
readonly STATUS_OPTIONS="Backlog,Ready for Dev,In Progress,Code Review,Testing,Done"
readonly TYPE_OPTIONS="Feature,Refactor,Infrastructure,Testing,Documentation"

# Story points mapping (issue title substring -> points)
declare -A STORY_POINTS_MAP=(
    ["PostgreSQL"]=5
    ["Svelte 5"]=8
    ["pnpm workspaces"]=5
    ["authentication service"]=5
    ["CI/CD pipeline"]=3
)

# =============================================================================
# GLOBAL STATE
# =============================================================================
VERBOSE=false
DRY_RUN=false
PROJECT_NUMBER=""
PROJECT_ID=""
PROJECT_URL=""
CREATED_FIELDS=()
ADDED_ITEMS=()
FAILED_ITEMS=()
TMPDIR=""

# =============================================================================
# LOGGING FUNCTIONS
# =============================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp
    timestamp=$(date '+%H:%M:%S')
    
    case "$level" in
        INFO)  echo -e "\033[0;32m[${timestamp}] ℹ️  ${message}\033[0m" ;;
        WARN)  echo -e "\033[1;33m[${timestamp}] ⚠️  ${message}\033[0m" ;;
        ERROR) echo -e "\033[0;31m[${timestamp}] ❌ ${message}\033[0m" >&2 ;;
        DEBUG) 
            if [[ "$VERBOSE" == "true" ]]; then
                echo -e "\033[0;34m[${timestamp}] 🐛 ${message}\033[0m"
            fi
            ;;
        SUCCESS) echo -e "\033[0;32m[${timestamp}] ✅ ${message}\033[0m" ;;
    esac
}

# =============================================================================
# CLEANUP & ROLLBACK
# =============================================================================

cleanup_temp() {
    if [[ -n "$TMPDIR" && -d "$TMPDIR" ]]; then
        log DEBUG "Cleaning up temp directory: $TMPDIR"
        rm -rf "$TMPDIR"
    fi
}

rollback() {
    local exit_code=$?
    
    if [[ $exit_code -ne 0 ]]; then
        log ERROR "Script failed with exit code $exit_code. Initiating rollback..."
        
        # Rollback added items
        if [[ ${#ADDED_ITEMS[@]} -gt 0 ]]; then
            log WARN "Rolling back ${#ADDED_ITEMS[@]} added items..."
            for item_id in "${ADDED_ITEMS[@]}"; do
                log DEBUG "Would remove item: $item_id"
                # Note: GitHub Projects API doesn't support removing items easily
                # This is a limitation we document
            done
        fi
        
        # Rollback created fields
        if [[ ${#CREATED_FIELDS[@]} -gt 0 ]]; then
            log WARN "Note: Created fields cannot be auto-deleted via API"
            log WARN "Manual cleanup may be required"
        fi
        
        log INFO "Rollback complete. Review GitHub Project #$PROJECT_NUMBER for manual cleanup."
    fi
    
    cleanup_temp
}

trap rollback EXIT
trap 'log ERROR "Interrupted by user"; exit 130' INT TERM

# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

check_dependencies() {
    log INFO "Checking dependencies..."
    
    # Check gh CLI
    if ! command -v gh &> /dev/null; then
        log ERROR "GitHub CLI (gh) is not installed."
        log INFO "Install from: https://cli.github.com/"
        exit 1
    fi
    
    # Check jq
    if ! command -v jq &> /dev/null; then
        log ERROR "jq is required but not installed."
        log INFO "Install: apt-get install jq  # or brew install jq"
        exit 1
    fi
    
    # Check gh version (need 2.0+ for project commands)
    local gh_version
    gh_version=$(gh --version | head -n1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1)
    log DEBUG "GitHub CLI version: $gh_version"
    
    # Check authentication
    if ! gh auth status &> /dev/null; then
        log ERROR "Not authenticated with GitHub."
        log INFO "Run: gh auth login"
        exit 1
    fi
    
    log SUCCESS "All dependencies satisfied"
}

validate_inputs() {
    log INFO "Validating inputs..."
    
    # Validate sprint number
    if ! [[ "$SPRINT_NUMBER" =~ ^[0-9]+$ ]]; then
        log ERROR "SPRINT_NUMBER must be a positive integer (got: $SPRINT_NUMBER)"
        exit 1
    fi
    
    # Validate dates
    if ! date -d "$SPRINT_START" &> /dev/null; then
        log ERROR "Invalid SPRINT_START date: $SPRINT_START"
        exit 1
    fi
    
    if ! date -d "$SPRINT_END" &> /dev/null; then
        log ERROR "Invalid SPRINT_END date: $SPRINT_END"
        exit 1
    fi
    
    # Validate repo format
    if [[ ! "$REPO" =~ ^[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+$ ]]; then
        log ERROR "Invalid REPO format. Expected: owner/repo (got: $REPO)"
        exit 1
    fi
    
    log SUCCESS "Input validation passed"
}

# =============================================================================
# PROJECT FUNCTIONS
# =============================================================================

find_existing_project() {
    log INFO "Checking for existing project: $PROJECT_NAME"
    
    local owner
    owner=$(echo "$REPO" | cut -d'/' -f1)
    
    local existing
    existing=$(gh project list --owner="$owner" --format=json 2>/dev/null | \
        jq -r --arg name "$PROJECT_NAME" '.projects[] | select(.title == $name) | .number' | \
        head -n1)
    
    if [[ -n "$existing" && "$existing" != "null" ]]; then
        log WARN "Project already exists (#$existing)"
        return 0
    fi
    
    return 1
}

create_project() {
    log INFO "Creating GitHub Project v2..."
    log DEBUG "Project name: $PROJECT_NAME"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log WARN "DRY RUN: Would create project '$PROJECT_NAME'"
        PROJECT_NUMBER="DRY-RUN"
        PROJECT_ID="dry-run-id"
        PROJECT_URL="https://github.com/$REPO/projects/dry-run"
        return 0
    fi
    
    local owner
    owner=$(echo "$REPO" | cut -d'/' -f1)
    
    local output
    if ! output=$(gh project create \
        --owner="$owner" \
        --title="$PROJECT_NAME" \
        --format=json 2>&1); then
        log ERROR "Failed to create project: $output"
        return 1
    fi
    
    # Validate JSON response
    if ! echo "$output" | jq -e '.' &> /dev/null; then
        log ERROR "Invalid JSON response from GitHub API"
        log DEBUG "Response: $output"
        return 1
    fi
    
    PROJECT_NUMBER=$(echo "$output" | jq -r '.number')
    PROJECT_URL=$(echo "$output" | jq -r '.url')
    PROJECT_ID=$(echo "$output" | jq -r '.id')
    
    if [[ -z "$PROJECT_NUMBER" || "$PROJECT_NUMBER" == "null" ]]; then
        log ERROR "Failed to extract project number from response"
        return 1
    fi
    
    log SUCCESS "Project created (#$PROJECT_NUMBER)"
    log INFO "URL: $PROJECT_URL"
    
    # Save to temp file for persistence
    echo "$PROJECT_NUMBER" > "$TMPDIR/project_number.txt"
    echo "$PROJECT_ID" > "$TMPDIR/project_id.txt"
    
    return 0
}

load_existing_project() {
    local existing_number="$1"
    
    log INFO "Loading existing project #$existing_number..."
    
    local owner
    owner=$(echo "$REPO" | cut -d'/' -f1)
    
    local output
    if ! output=$(gh project view "$existing_number" \
        --owner="$owner" \
        --format=json 2>&1); then
        log ERROR "Failed to load project #$existing_number: $output"
        return 1
    fi
    
    PROJECT_NUMBER="$existing_number"
    PROJECT_URL=$(echo "$output" | jq -r '.url')
    PROJECT_ID=$(echo "$output" | jq -r '.id')
    
    log SUCCESS "Loaded existing project (#$PROJECT_NUMBER)"
}

# =============================================================================
# FIELD FUNCTIONS
# =============================================================================

field_exists() {
    local field_name="$1"
    
    local owner
    owner=$(echo "$REPO" | cut -d'/' -f1)
    
    local fields
    fields=$(gh project field-list "$PROJECT_NUMBER" \
        --owner="$owner" \
        --format=json 2>/dev/null)
    
    if echo "$fields" | jq -e --arg name "$field_name" '.fields[] | select(.name == $name)' &> /dev/null; then
        return 0
    fi
    
    return 1
}

create_field() {
    local name="$1"
    local data_type="$2"
    local options="${3:-}"
    
    log INFO "Creating field: $name ($data_type)"
    
    if field_exists "$name"; then
        log WARN "Field '$name' already exists, skipping"
        return 0
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log WARN "DRY RUN: Would create field '$name'"
        CREATED_FIELDS+=("$name")
        return 0
    fi
    
    local owner
    owner=$(echo "$REPO" | cut -d'/' -f1)
    
    local cmd=(gh project field-create "$PROJECT_NUMBER")
    cmd+=(--owner="$owner")
    cmd+=(--name="$name")
    cmd+=(--data-type="$data_type")
    
    if [[ -n "$options" && "$data_type" == "single_select" ]]; then
        cmd+=(--single-select-options="$options")
    fi
    
    local output
    if ! output=$("${cmd[@]}" 2>&1); then
        log ERROR "Failed to create field '$name': $output"
        return 1
    fi
    
    CREATED_FIELDS+=("$name")
    log SUCCESS "Created field: $name"
    
    return 0
}

configure_fields() {
    log INFO "Configuring custom fields..."
    
    # Field 1: Story Points
    create_field "Story Points" "number" "" || return 1
    
    # Field 2: Priority
    create_field "Priority" "single_select" "$PRIORITY_OPTIONS" || return 1
    
    # Field 3: Status
    create_field "Status" "single_select" "$STATUS_OPTIONS" || return 1
    
    # Field 4: Type
    create_field "Type" "single_select" "$TYPE_OPTIONS" || return 1
    
    log SUCCESS "All fields configured"
}

# =============================================================================
# ISSUE FUNCTIONS
# =============================================================================

get_sprint_issues() {
    log INFO "Fetching Sprint $SPRINT_NUMBER issues..."
    
    local output
    if ! output=$(gh issue list -R "$REPO" \
        --label="sprint-$SPRINT_NUMBER" \
        --state=open \
        --json=number,title,url,labels \
        --limit=50 2>&1); then
        log ERROR "Failed to fetch issues: $output"
        return 1
    fi
    
    # Validate JSON
    if ! echo "$output" | jq -e '.' &> /dev/null; then
        log ERROR "Invalid JSON response when fetching issues"
        return 1
    fi
    
    local count
    count=$(echo "$output" | jq 'length')
    
    if [[ "$count" -eq 0 ]]; then
        log ERROR "No Sprint $SPRINT_NUMBER issues found!"
        log INFO "Run: ./setup-sprint-2.sh first"
        return 1
    fi
    
    log SUCCESS "Found $count Sprint $SPRINT_NUMBER issues"
    echo "$output" > "$TMPDIR/issues.json"
}

determine_priority() {
    local issue_json="$1"
    
    # Validate issue has labels
    if ! echo "$issue_json" | jq -e '.labels' &> /dev/null; then
        log DEBUG "Issue missing labels field, defaulting to Medium"
        echo "Medium"
        return
    fi
    
    local labels
    labels=$(echo "$issue_json" | jq -r '.labels[].name' 2>/dev/null)
    
    if echo "$labels" | grep -q "priority-critical"; then
        echo "Critical"
    elif echo "$labels" | grep -q "priority-high"; then
        echo "High"
    elif echo "$labels" | grep -q "priority-medium"; then
        echo "Medium"
    else
        echo "Low"
    fi
}

determine_story_points() {
    local title="$1"
    
    for key in "${!STORY_POINTS_MAP[@]}"; do
        if [[ "$title" == *"$key"* ]]; then
            echo "${STORY_POINTS_MAP[$key]}"
            return
        fi
    done
    
    # Default if no match
    echo ""
}

add_issue_to_project() {
    local issue_json="$1"
    local counter="$2"
    
    local issue_number
    issue_number=$(echo "$issue_json" | jq -r '.number')
    
    local issue_title
    issue_title=$(echo "$issue_json" | jq -r '.title')
    
    local issue_url
    issue_url=$(echo "$issue_json" | jq -r '.url')
    
    log INFO "[$counter] Adding Issue #$issue_number: ${issue_title:0:50}..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log WARN "DRY RUN: Would add issue #$issue_number"
        return 0
    fi
    
    local owner
    owner=$(echo "$REPO" | cut -d'/' -f1)
    
    # Add to project
    local add_output
    if ! add_output=$(gh project item-add "$PROJECT_NUMBER" \
        --owner="$owner" \
        --url="$issue_url" \
        --format=json 2>&1); then
        log ERROR "Failed to add issue #$issue_number: $add_output"
        FAILED_ITEMS+=("$issue_number")
        return 1
    fi
    
    # Extract item ID
    local item_id
    item_id=$(echo "$add_output" | jq -r '.id')
    
    if [[ -z "$item_id" || "$item_id" == "null" ]]; then
        log ERROR "Failed to get item ID for issue #$issue_number"
        FAILED_ITEMS+=("$issue_number")
        return 1
    fi
    
    ADDED_ITEMS+=("$item_id")
    log DEBUG "Item ID: $item_id"
    
    # Determine and set Priority
    local priority
    priority=$(determine_priority "$issue_json")
    
    log DEBUG "Setting Priority: $priority"
    if ! gh project item-edit "$PROJECT_NUMBER" \
        --owner="$owner" \
        --id="$item_id" \
        --field="Priority" \
        --value="$priority" 2>/dev/null; then
        log WARN "Failed to set Priority for issue #$issue_number"
    fi
    
    # Determine and set Story Points
    local points
    points=$(determine_story_points "$issue_title")
    
    if [[ -n "$points" ]]; then
        log DEBUG "Setting Story Points: $points"
        if ! gh project item-edit "$PROJECT_NUMBER" \
            --owner="$owner" \
            --id="$item_id" \
            --field="Story Points" \
            --value="$points" 2>/dev/null; then
            log WARN "Failed to set Story Points for issue #$issue_number"
        fi
    fi
    
    # Set initial Status
    if ! gh project item-edit "$PROJECT_NUMBER" \
        --owner="$owner" \
        --id="$item_id" \
        --field="Status" \
        --value="Backlog" 2>/dev/null; then
        log WARN "Failed to set Status for issue #$issue_number"
    fi
    
    log SUCCESS "Added #$issue_number (Priority: $priority, Points: ${points:-N/A})"
    return 0
}

add_all_issues() {
    log INFO "Adding issues to project..."
    
    local issues_json
    issues_json=$(cat "$TMPDIR/issues.json")
    
    local total
    total=$(echo "$issues_json" | jq 'length')
    
    local counter=0
    
    # Use process substitution to avoid subshell variable issues
    while IFS= read -r issue; do
        counter=$((counter + 1))
        add_issue_to_project "$issue" "$counter"
    done < <(echo "$issues_json" | jq -c '.[]')
    
    log SUCCESS "Processed $counter issues"
    
    if [[ ${#FAILED_ITEMS[@]} -gt 0 ]]; then
        log WARN "${#FAILED_ITEMS[@]} items failed to add: ${FAILED_ITEMS[*]}"
    fi
}

# =============================================================================
# WORKFLOW FUNCTIONS
# =============================================================================

create_automation_workflow() {
    log INFO "Creating automation workflow..."
    
    local workflow_dir=".github/workflows"
    local workflow_file="$workflow_dir/sprint-automation.yml"
    
    # Check if workflow already exists
    if [[ -f "$workflow_file" ]]; then
        log WARN "Workflow already exists: $workflow_file"
        read -p "Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log INFO "Skipping workflow creation"
            return 0
        fi
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log WARN "DRY RUN: Would create workflow at $workflow_file"
        return 0
    fi
    
    mkdir -p "$workflow_dir"
    
    cat > "$workflow_file" << EOF
# Auto-generated by $SCRIPT_NAME v$SCRIPT_VERSION
# This workflow automates GitHub Project management for Sprint $SPRINT_NUMBER

name: Sprint $SPRINT_NUMBER Automation

on:
  issues:
    types: [opened, labeled, closed, reopened]
  pull_request:
    types: [opened, closed, reopened]

env:
  PROJECT_NUMBER: $PROJECT_NUMBER
  PROJECT_OWNER: $(echo "$REPO" | cut -d'/' -f1)

jobs:
  auto-add-issues:
    name: Auto-add Sprint Issues
    runs-on: ubuntu-latest
    if: github.event_name == 'issues' && github.event.action == 'labeled'
    steps:
      - name: Add to Sprint Project
        if: contains(github.event.issue.labels.*.name, 'sprint-$SPRINT_NUMBER')
        uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/\${{ env.PROJECT_OWNER }}/projects/\${{ env.PROJECT_NUMBER }}
          github-token: \${{ secrets.GITHUB_TOKEN }}

  sync-status:
    name: Sync PR Status
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - name: Move linked issues to Code Review
        if: github.event.action == 'opened' || github.event.action == 'reopened'
        uses: actions/github-script@v7
        with:
          script: |
            const prBody = context.payload.pull_request.body || '';
            const matches = prBody.match(/(closes?|fixes?|resolves?)\s+#(\d+)/gi) || [];
            
            for (const match of matches) {
              const issueNumber = match.match(/#(\d+)/)[1];
              console.log(\`PR linked to issue #\${issueNumber}\`);
              
              // Add comment to issue
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: parseInt(issueNumber),
                body: 'Linked to PR #' + context.payload.pull_request.number
              });
            }

  close-issues:
    name: Close Linked Issues
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' && github.event.pull_request.merged == true
    steps:
      - name: Close linked issues
        uses: actions/github-script@v7
        with:
          script: |
            const prBody = context.payload.pull_request.body || '';
            const matches = prBody.match(/(closes?|fixes?|resolves?)\s+#(\d+)/gi) || [];
            
            for (const match of matches) {
              const issueNumber = match.match(/#(\d+)/)[1];
              console.log(\`Closing issue #\${issueNumber}\`);
              
              await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: parseInt(issueNumber),
                state: 'closed'
              });
            }
EOF
    
    log SUCCESS "Created workflow: $workflow_file"
    log INFO "Remember to commit and push this file!"
}

# =============================================================================
# SUMMARY & MAIN
# =============================================================================

show_summary() {
    echo ""
    echo "================================================"
    log SUCCESS "GitHub Project Setup Complete!"
    echo "================================================"
    echo ""
    log INFO "Project Details:"
    echo "  📊 Name: $PROJECT_NAME"
    echo "  🔢 Number: $PROJECT_NUMBER"
    echo "  🔗 URL: $PROJECT_URL"
    echo "  🆔 ID: $PROJECT_ID"
    echo ""
    log INFO "Sprint Details:"
    echo "  📅 Period: $SPRINT_START → $SPRINT_END"
    echo "  📋 Sprint: $SPRINT_NUMBER"
    echo ""
    log INFO "Created/Configured:"
    echo "  • 1 GitHub Project v2"
    echo "  • ${#CREATED_FIELDS[@]} Custom Fields"
    echo "  • ${#ADDED_ITEMS[@]} Issues Added"
    echo "  • 1 Automation Workflow"
    echo ""
    
    if [[ ${#FAILED_ITEMS[@]} -gt 0 ]]; then
        log WARN "Issues requiring attention:"
        echo "  • ${#FAILED_ITEMS[@]} items failed: ${FAILED_ITEMS[*]}"
        echo ""
    fi
    
    log INFO "Next Steps:"
    echo "  1. Open project: $PROJECT_URL"
    echo "  2. Create Board view (Kanban):"
    echo "     - Click '+ New view' → Select 'Board'"
    echo "     - Name: 'Sprint Board'"
    echo "     - Group by: 'Status'"
    echo "  3. Create Table view for backlog management"
    echo "  4. Invite team members to the project"
    echo "  5. Commit and push the automation workflow"
    echo ""
    log INFO "Quick Commands:"
    echo "  # View project"
    echo "  gh project view $PROJECT_NUMBER --owner=$(echo "$REPO" | cut -d'/' -f1)"
    echo ""
    echo "  # List all items"
    echo "  gh project item-list $PROJECT_NUMBER --owner=$(echo "$REPO" | cut -d'/' -f1)"
    echo ""
    echo "  # Move item to 'In Progress'"
    echo "  gh project item-edit $PROJECT_NUMBER --owner=$(echo "$REPO" | cut -d'/' -f1) \\"
    echo "    --id=<item-id> --field=Status --value='In Progress'"
    echo ""
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log WARN "This was a DRY RUN - no actual changes were made"
    fi
    
    log SUCCESS "🚀 Sprint $SPRINT_NUMBER is ready for action!"
    echo ""
}

usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS]

Production-ready GitHub Projects v2 setup script with idempotency and rollback support.

OPTIONS:
    -n, --sprint-number NUM     Sprint number (default: $SPRINT_NUMBER)
    -s, --sprint-name NAME      Sprint name (default: "$SPRINT_NAME")
    --start-date DATE           Sprint start date (default: $SPRINT_START)
    --end-date DATE             Sprint end date (default: $SPRINT_END)
    -r, --repo OWNER/REPO       Repository (default: $REPO)
    --dry-run                   Show what would be done without making changes
    -v, --verbose               Enable verbose logging
    -h, --help                  Show this help message

EXAMPLES:
    # Basic usage (Sprint 2)
    $SCRIPT_NAME

    # Custom sprint
    $SCRIPT_NAME -n 3 -s "Core Features" --start-date 2026-03-23 --end-date 2026-03-29

    # Dry run to preview changes
    $SCRIPT_NAME --dry-run -v

    # Different repository
    $SCRIPT_NAME -r myorg/myrepo -n 5

ENVIRONMENT VARIABLES:
    REPO                    Repository (owner/repo format)
    SPRINT_NUMBER           Sprint number
    SPRINT_NAME             Sprint name
    SPRINT_START            Sprint start date (YYYY-MM-DD)
    SPRINT_END              Sprint end date (YYYY-MM-DD)
    VERBOSE                 Set to 'true' for verbose output

VERSION: $SCRIPT_VERSION
EOF
}

parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -n|--sprint-number)
                SPRINT_NUMBER="$2"
                shift 2
                ;;
            -s|--sprint-name)
                SPRINT_NAME="$2"
                shift 2
                ;;
            --start-date)
                SPRINT_START="$2"
                shift 2
                ;;
            --end-date)
                SPRINT_END="$2"
                shift 2
                ;;
            -r|--repo)
                REPO="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            *)
                log ERROR "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Update dependent variables
    PROJECT_NAME="Cobalt Sprint $SPRINT_NUMBER: $SPRINT_NAME"
}

main() {
    parse_args "$@"
    
    echo "🎯 $SCRIPT_NAME v$SCRIPT_VERSION"
    echo "=================================================="
    echo ""
    
    # Setup temp directory
    TMPDIR=$(mktemp -d -t sprint-setup-XXXXXX)
    log DEBUG "Temp directory: $TMPDIR"
    
    # Pre-flight checks
    check_dependencies
    validate_inputs
    
    log INFO "Configuration:"
    log INFO "  Repository: $REPO"
    log INFO "  Sprint: $SPRINT_NUMBER ($SPRINT_NAME)"
    log INFO "  Project: $PROJECT_NAME"
    log INFO "  Period: $SPRINT_START → $SPRINT_END"
    [[ "$DRY_RUN" == "true" ]] && log WARN "Mode: DRY RUN (no changes will be made)"
    echo ""
    
    # Check for existing project (idempotency)
    local existing_project=""
    if find_existing_project; then
        existing_project=$(gh project list --owner="$(echo "$REPO" | cut -d'/' -f1)" --format=json 2>/dev/null | \
            jq -r --arg name "$PROJECT_NAME" '.projects[] | select(.title == $name) | .number' | head -n1)
        
        log WARN "Project '$PROJECT_NAME' already exists (#$existing_project)"
        read -p "Use existing project? (Y/n): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            log INFO "Exiting. Delete the existing project first or use a different name."
            exit 0
        fi
        
        load_existing_project "$existing_project"
    else
        # Create new project
        create_project || exit 1
    fi
    
    # Configure fields
    configure_fields || exit 1
    
    # Get and add issues
    get_sprint_issues || exit 1
    add_all_issues
    
    # Create automation workflow
    create_automation_workflow
    
    # Show summary
    show_summary
    
    # Success exit (disables rollback)
    trap - EXIT
    cleanup_temp
    
    exit 0
}

# Run main
main "$@"
