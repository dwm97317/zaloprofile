---
name: "git-best-practices"
displayName: "Git Best Practices"
description: "Essential Git workflows and best practices for modern development teams. Covers branching strategies, commit conventions, and collaboration patterns."
keywords: ["git", "version-control", "workflow", "best-practices", "collaboration"]
author: "Demo Example"
---

# Git Best Practices

## Overview

This power provides comprehensive guidance on Git workflows and best practices for modern development teams. Learn proven patterns for branching, committing, merging, and collaborating effectively with Git.

Whether you're working solo or in a large team, these practices will help you maintain a clean history, avoid common pitfalls, and collaborate smoothly.

## Core Principles

### 1. Commit Often, Push Regularly
- Make small, focused commits
- Push to remote at least daily
- Don't let local branches diverge too far

### 2. Write Meaningful Commit Messages
- Use conventional commit format: `type(scope): description`
- First line: concise summary (50 chars max)
- Body: explain what and why, not how

### 3. Keep History Clean
- Use rebase for local cleanup
- Squash related commits before merging
- Never rewrite public history

## Common Workflows

### Workflow: Feature Branch Development

**Goal:** Develop a new feature in isolation

**Steps:**
```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/user-authentication

# 2. Make changes and commit
git add src/auth/
git commit -m "feat(auth): add user login functionality"

# 3. Keep branch updated
git fetch origin
git rebase origin/main

# 4. Push and create PR
git push origin feature/user-authentication
```

### Workflow: Bug Fix

**Goal:** Fix a bug quickly and safely

**Steps:**
```bash
# 1. Create fix branch
git checkout main
git pull origin main
git checkout -b fix/login-error

# 2. Fix and commit
git add src/auth/login.js
git commit -m "fix(auth): resolve null pointer in login handler"

# 3. Push and merge quickly
git push origin fix/login-error
# Create PR and merge after review
```

## Commit Message Conventions

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples
```bash
# Good commits
git commit -m "feat(api): add user profile endpoint"
git commit -m "fix(ui): resolve button alignment on mobile"
git commit -m "docs(readme): update installation instructions"

# Bad commits (avoid these)
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "asdfasdf"
```

## Branching Strategies

### Main Branch Protection
- Always keep `main` stable and deployable
- Require PR reviews before merging
- Run CI/CD checks on all PRs

### Branch Naming
```
feature/description    # New features
fix/description        # Bug fixes
hotfix/description     # Urgent production fixes
refactor/description   # Code refactoring
docs/description       # Documentation updates
```

## Best Practices

- **Never commit secrets** - Use environment variables and .gitignore
- **Review before pushing** - Use `git diff --staged` to review changes
- **Pull before push** - Always pull latest changes before pushing
- **Use .gitignore** - Exclude build artifacts, dependencies, IDE files
- **Tag releases** - Use semantic versioning for release tags

## Troubleshooting

### Problem: Merge Conflicts

**Symptoms:** Git reports conflicts during merge or rebase

**Solution:**
```bash
# 1. Identify conflicted files
git status

# 2. Open files and resolve conflicts
# Look for <<<<<<< HEAD markers

# 3. Mark as resolved
git add resolved-file.js

# 4. Complete merge/rebase
git rebase --continue
# or
git merge --continue
```

### Problem: Accidentally Committed to Wrong Branch

**Solution:**
```bash
# 1. Create new branch from current state
git branch correct-branch

# 2. Reset current branch
git reset --hard HEAD~1

# 3. Switch to correct branch
git checkout correct-branch
```

### Problem: Need to Undo Last Commit

**Solution:**
```bash
# Keep changes, undo commit
git reset --soft HEAD~1

# Discard changes and commit
git reset --hard HEAD~1

# Create new commit that reverses changes
git revert HEAD
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `git status` | Check working directory status |
| `git log --oneline` | View commit history |
| `git diff` | Show unstaged changes |
| `git diff --staged` | Show staged changes |
| `git stash` | Temporarily save changes |
| `git stash pop` | Restore stashed changes |
| `git branch -d branch-name` | Delete local branch |
| `git fetch --prune` | Clean up deleted remote branches |

---

**Note:** This is a Knowledge Base Power (no MCP server required)
