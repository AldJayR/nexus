# 14. Git Workflow

Standards for branches, commits, and pull requests.

## Branch Naming

Use descriptive branch names with prefixes:

```
feature/[feature-name]
fix/[bug-name]
docs/[documentation-name]
chore/[task-name]
refactor/[component-name]
test/[feature-name]
```

### Examples

```
feature/user-authentication
fix/sprint-list-pagination
docs/setup-guide
chore/update-dependencies
refactor/extract-form-validation
test/sprint-creation
```

---

## Commit Messages

Use conventional commits for clarity:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or changes
- `chore`: Dependency updates, tooling

### Examples

```
feat(auth): add two-factor authentication
fix(sprints): correct sprint end date calculation
docs(readme): add setup instructions
refactor(components): extract button component
test(api): add sprints endpoint tests
chore: upgrade next.js to v15.2
```

### Multi-line Commits

```
feat(forms): add real-time validation to user registration

- Implement React Hook Form with Zod validation
- Add error display on form fields
- Show validation errors on 'onChange' event
- Add loading state during form submission

Closes #123
```

---

## Pull Requests

### PR Title Format

Use the same commit message format:

```
feat(sprints): add sprint filtering by status
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- Feature
- Bug fix
- Documentation
- Refactoring

## Related Issue
Closes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing Performed
- Unit tests added
- Component tests added
- E2E tests added
- Manual testing completed

## Screenshots (if applicable)
[Add screenshots]

## Pre-Submission Verification
Review these areas before requesting approval:
- Code follows project naming conventions and patterns
- Self-review has been completed for obvious issues
- Complex logic includes comments explaining intent
- Tests have been added or updated for changes
- No breaking changes to existing APIs or components
```

---

## Workflow

### Create Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/user-authentication

# Or using newer git syntax
git switch -c feature/user-authentication
```

### Commit Changes

```bash
# Stage changes
git add src/components/auth/

# Commit with message
git commit -m "feat(auth): add login form component"

# Or use interactive commit
git commit
```

### Keep Branch Updated

```bash
# Fetch latest changes
git fetch origin

# Rebase on main
git rebase origin/main

# Or merge main into branch
git merge origin/main
```

### Push to Remote

```bash
git push origin feature/user-authentication
```

### Create Pull Request

```bash
# Option 1: Use GitHub CLI
gh pr create --title "feat(auth): add login form" --body "Description here"

# Option 2: Push and create via GitHub web interface
git push origin feature/user-authentication
# Then open GitHub and create PR
```

---

## Code Review

### Code Review Standards

When reviewing a pull request, verify these aspects:

- Code follows the project's naming conventions (PascalCase for components, camelCase for functions)
- No console errors, warnings, or debug logging left in the code
- New tests have been added and all tests pass (unit, component, integration)
- No hardcoded values; configuration is properly externalized
- Error handling is present for async operations and edge cases
- Performance impact is acceptable; no unnecessary re-renders or large bundle increases
- Accessibility standards are met (keyboard navigation, ARIA labels, semantic HTML)
- Documentation and comments have been updated to reflect changes

### Request Changes

```bash
# Comment on specific line in PR
# Use a comment format like:
# "This should use the shared Button component instead"
```

---

## Merge and Cleanup

### Merge PR

```bash
# Merge with conventional commit squash
git switch main
git pull origin main
git merge --squash feature/user-authentication
git commit -m "feat(auth): add two-factor authentication"
git push origin main
```

### Delete Branch

```bash
# Delete local branch
git branch -d feature/user-authentication

# Delete remote branch
git push origin --delete feature/user-authentication
```

---

## Rebasing vs Merging

### Rebase (Linear history)

```bash
git rebase origin/main
git push origin feature/branch --force-with-lease
```

Pros: Clean linear history
Cons: Rewrites history

### Merge (Preserves history)

```bash
git merge origin/main
git push origin feature/branch
```

Pros: Preserves all history
Cons: Creates merge commits

---

## Common Tasks

### Undo Last Commit

```bash
# Undo, keep changes
git reset --soft HEAD~1

# Undo, discard changes
git reset --hard HEAD~1
```

### Amend Last Commit

```bash
git add .
git commit --amend --no-edit
```

### Squash Commits

```bash
# Squash last 3 commits
git rebase -i HEAD~3
# Mark commits as 'squash' (s) except the first one
```

### Stash Changes

```bash
# Save changes temporarily
git stash

# Resume changes
git stash pop
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

---

## Best Practices

1. **Branch per feature**: Create new branch for each feature
2. **Commit frequently**: Small, focused commits
3. **Meaningful messages**: Use conventional commits
4. **Keep PRs small**: Easier to review
5. **Link issues**: Reference related issues in PR
6. **Review before merging**: Get at least one approval
7. **Protect main branch**: Require reviews before merge
8. **Delete merged branches**: Keep repo clean

---

## Git Aliases

Add to `.gitconfig` for efficiency:

```bash
[alias]
  co = checkout
  br = branch
  ci = commit
  st = status
  unstage = reset HEAD --
  last = log -1 HEAD
  amend = commit --amend --no-edit
  contrib = shortlog --summary --numbered
```

Usage:

```bash
git co feature/branch
git ci -m "message"
git st
```
