# GitHub Workflows Documentation

This directory contains security-hardened GitHub Actions workflows for the Cobalt project.

## Workflows Overview

### 1. AI PR Reviewer (`ai-pr-reviewer.yml`)

**Purpose**: Automated AI-powered code review using PR-Agent via OpenRouter.

**Triggers**:
- `pull_request`: opened, reopened (targets: main, master)
- `issue_comment`: created (with specific command allowlist)
- `workflow_dispatch`: manual trigger for testing

**Security Features**:
- All actions pinned to full-length commit SHA
- Concurrency limits prevent runaway costs
- 10-minute timeout prevents hanging jobs
- Fork detection prevents unauthorized execution
- Secrets passed via `with:` for better log redaction
- Minimal permissions (pull-requests: write, contents: read)

**Cost Controls**:
- Skips `synchronize` events (prevents 5x cost per active PR)
- Concurrency groups limit parallel executions
- Only runs on `imputnet/cobalt` repository

**Commands**:
The workflow responds to these PR comment commands:
- `/review` - Request AI code review
- `/describe` - Generate PR description
- `/improve` - Get code improvement suggestions
- `/ask` - Ask questions about the code
- `/update_changelog` - Update CHANGELOG.md

---

### 2. Sprint & Task Automation (`sprint-automation.yml`)

**Purpose**: Automate sprint management, issue attribution, milestone assignment, and progress tracking.

**Triggers**:
- `pull_request`: opened, reopened, closed (targets: main, master)
- `push`: feat/**, fix/**, refactor/**, chore/**, bug/**, feature/**
- `workflow_dispatch`: manual trigger

**Jobs**:

#### Sprint Attribution (`sprint-attribution`)
- Dynamically detects the nearest open milestone
- Assigns milestones to PRs and linked issues
- Updates issue status labels (idempotent)
- Supports multiple issue reference patterns

#### PR Size Labeler (`label-pr-size`)
- Categorizes PRs by size: XS (0-20), S (20-100), M (100-500), L (500-1000), XL (1000+)
- Helps with sprint planning and review load distribution

#### Sprint Digest Update (`update-sprint-digest`)
- Records merged PRs to `SPRINT-DIGEST.md`
- Includes author, commit SHA, and change statistics
- Idempotent (skips duplicates)
- Handles race conditions with rebase strategy

**Security Features**:
- All actions pinned to full-length commit SHA
- Bot commit detection prevents infinite loops
- Untrusted inputs passed via environment variables
- Fork detection (`github.repository_owner == 'imputnet'`)
- Minimal job-specific permissions
- `[skip sprint]` commit message support

**Issue Reference Patterns**:
The workflow detects issues from:
- Branch names: `feat/123-login`, `fix/456-bug`, `bug/789-issue`
- PR titles: `Fixes #123`, `Closes #456`
- PR body: GitHub's closing keywords

---

## Security Best Practices

### 1. Action Pinning
All third-party actions are pinned to full-length commit SHA:
```yaml
uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
```

This prevents supply chain attacks where a compromised action could introduce malicious code.

### 2. Minimal Permissions
Each job declares only the permissions it needs:
```yaml
permissions:
  pull-requests: write
  issues: write
  contents: read
```

### 3. Fork Detection
Workflows check `github.repository_owner` to prevent execution on forks:
```yaml
if: github.repository_owner == 'imputnet'
```

### 4. Injection Protection
Untrusted user inputs are passed via environment variables:
```yaml
env:
  PR_TITLE: ${{ github.event.pull_request.title }}
run: |
  echo "$PR_TITLE"  # Safe from injection
```

### 5. Concurrency Control
Prevents parallel execution storms:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

### 6. Timeout Limits
All jobs have explicit timeouts to prevent burning minutes:
```yaml
timeout-minutes: 10
```

---

## Required Secrets

### `OPENROUTER_API_KEY`
- **Required by**: `ai-pr-reviewer.yml`
- **Purpose**: API key for OpenRouter LLM access
- **Setup**: Add in Repository Settings > Secrets and variables > Actions

### `GITHUB_TOKEN`
- **Provided by**: GitHub automatically
- **Purpose**: API authentication for GitHub operations
- **Permissions**: Scoped per-job in workflow files

---

## Troubleshooting

### Workflow Not Running
1. Check if the trigger conditions are met
2. Verify `github.repository_owner == 'imputnet'` condition
3. Check for `[skip sprint]` in commit message

### AI Review Not Working
1. Verify `OPENROUTER_API_KEY` is set in repository secrets
2. Check workflow run logs for API errors
3. Ensure the PR targets `main` or `master`

### Sprint Digest Not Updating
1. Check if the PR was actually merged (not just closed)
2. Verify the workflow has `contents: write` permission
3. Look for race condition retry messages in logs

---

## Maintenance

### Updating Action Versions
When updating action versions:
1. Find the new version's commit SHA
2. Update the SHA and version comment
3. Test with `workflow_dispatch` trigger
4. Consider using Dependabot for automated updates

### Adding New Commands
To add new PR-Agent commands:
1. Update the command allowlist in the `if` condition
2. Add documentation to this README
3. Test the command in a PR comment

---

## References

- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [PR-Agent Documentation](https://github.com/Codium-ai/pr-agent)
- [OpenRouter API](https://openrouter.ai/docs)
