---
name: write-git-commit
description: Create a git commit following repository conventions
---

# Git Commit

Create git commits following the repository's established conventions.

## Commit Message Format

```
<scope>: <subject>

[optional body]
```

## Scope

The scope indicates which part of the codebase is affected:

- `plugin` - Plugin source code changes (most common)
- `docs` - Documentation changes
- `scripts` - Build/release script changes
- `.github` - GitHub workflows and actions
- `.claude` - Claude configuration and skills
- `.vscode` - VS Code settings
- `*` - Changes spanning multiple packages/areas

For focused changes within a scope, you may use a more specific prefix like `plugin api`, `plugin settings`, etc.

## Subject Line

- Use lowercase after the colon
- Use imperative mood ("add feature" not "added feature")
- No period at the end
- Keep concise (ideally under 72 characters total)

Examples:

- `plugin: add support for task filtering`
- `docs: update query-blocks documentation`
- `*: bump versions across the board`
- `.github: add separate build job`

## Body (Optional)

- Separate from subject with a blank line
- Explain **why** the change was made, not what
- Use sparingly - only when the subject isn't self-explanatory

Example:

```
plugin: restore react & react-dom dedupe

While the tests pass after aligning react versions between docs/ and
plugin/, the build still breaks at runtime without this.
```

DO NOT add Claude as a coauthor to the commit.

## Process

1. Run `git status` to see staged and unstaged changes
2. Run `git diff --staged` to review what will be committed
3. Stage files with `git add <files>` (prefer specific files over `git add -A`)
4. Determine the appropriate scope based on changed files
5. Write a clear, concise subject line
6. Add a body only if the "why" isn't obvious
7. Create the commit
