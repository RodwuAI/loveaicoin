---
name: github-cli
description: |
  Use the GitHub CLI (gh) to manage repositories, issues, pull requests, CI/CD, and more directly from the command line. 
  Use when users want to check PRs, issues, CI status, create releases, or interact with GitHub repos.
---

# GitHub CLI Skill

Use `gh` (GitHub CLI) for all GitHub operations.

## Prerequisites
- Install: `brew install gh`
- Auth: `gh auth login`

## Common Commands

### Repos
```bash
gh repo list [owner]              # List repos
gh repo clone owner/repo          # Clone
gh repo view owner/repo           # View repo info
gh repo create name --public      # Create repo
```

### Issues
```bash
gh issue list                     # List open issues
gh issue view <number>            # View issue
gh issue create --title "..." --body "..."  # Create issue
gh issue close <number>           # Close issue
gh issue comment <number> --body "..."      # Comment
```

### Pull Requests
```bash
gh pr list                        # List open PRs
gh pr view <number>               # View PR
gh pr create --title "..." --body "..."     # Create PR
gh pr merge <number>              # Merge PR
gh pr checkout <number>           # Checkout PR locally
gh pr diff <number>               # View diff
gh pr review <number> --approve   # Approve PR
```

### CI/CD
```bash
gh run list                       # List workflow runs
gh run view <id>                  # View run details
gh run watch <id>                 # Watch live
gh workflow list                  # List workflows
gh workflow run <name>            # Trigger workflow
```

### Releases
```bash
gh release list                   # List releases
gh release create <tag> --title "..." --notes "..."  # Create release
gh release download <tag>         # Download assets
```

### Search & API
```bash
gh search repos <query>           # Search repos
gh search issues <query>          # Search issues
gh search code <query>            # Search code
gh api /repos/{owner}/{repo}      # Raw API call
gh api graphql -f query='...'     # GraphQL query
```

### Gist
```bash
gh gist create file.txt           # Create gist
gh gist list                      # List gists
```

## Tips
- Use `--json` flag for machine-readable output
- Use `--jq` for filtering JSON output
- Use `-R owner/repo` to target a specific repo without cd-ing into it
