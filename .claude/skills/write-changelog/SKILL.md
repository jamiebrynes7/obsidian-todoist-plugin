---
name: write-changelog
description: Write or update changelog entries with user-focused language
---

# Changelog

Write or update changelog entries following these guidelines:

## Guidelines

- **Focus on user benefits** rather than implementation details
- **Keep entries concise** - typically a single line without subpoints
- **Emphasize what the user can now do** or how their experience improves
- **Avoid technical specifics** like state management, CSS classes, or internal architecture

## Categories

Entries are organized under these category headings:

- `### ✨ Features` - New functionality for users
- `### 🐛 Bug Fixes` - Corrections to existing behavior
- `### 🔁 Changes` - Modifications to existing features
- `### ⚙ Internal` - Technical changes (use sparingly, still user-focused)
- `### 🌐 Translations` - New or updated translations
- `### Breaking changes` - For major releases only
- `### Deprecated` - Features being phased out

## Unreleased Section

Always add new entries to the `## Unreleased` section at the top of the changelog. Create the appropriate category heading if it doesn't exist yet. Entries are moved to a versioned section during the release process.

## Examples

Good:

- "Added keyboard shortcuts for common actions"
- "Tasks now sync automatically when Obsidian starts"
- "Fixed tasks not appearing after editing"

Bad:

- "Refactored TaskStore to use Redux pattern with selectors"
- "Added `useEffect` hook to trigger sync on mount"
- "Fixed CSS specificity issue in task-list component"

## Location

The changelog is located at `docs/docs/changelog.md`.
