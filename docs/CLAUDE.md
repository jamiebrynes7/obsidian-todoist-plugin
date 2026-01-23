# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the documentation site for the Sync with Todoist Plugin for Obsidian. The site is built using Docusaurus and contains user guides, configuration instructions, and contributing information.

## Common Commands

All commands should be run from this `docs/` directory:

### Development

- `npm start` - Start local development server (usually runs on http://localhost:3000)
- `npm run build` - Build documentation site for production
- `npm run serve` - Serve built site locally
- `npm run clear` - Clear Docusaurus cache

### Documentation Management

- `npm run bump-version -- ${VERSION}` - Create new versioned documentation (e.g., `npm run bump-version -- 2.2.0`)
- `npm run write-translations` - Extract translatable strings
- `npm run write-heading-ids` - Add heading IDs to markdown files

### Quality

- `npm run typecheck` - Run TypeScript type checking

## Documentation Structure

### Core Documentation (`docs/`)

- `overview.md` - Main plugin introduction and features
- `setup.md` - Installation and initial configuration
- `configuration.md` - Detailed plugin settings
- `query-blocks.md` - Query language documentation
- `changelog.md` - Version history and changes

### Commands Documentation (`docs/commands/`)

- `add-task.md` - Creating tasks from Obsidian
- `sync-with-todoist.md` - Manual sync functionality

### Contributing Documentation (`docs/contributing/`)

- `general.md` - Development setup and workflow
- `release-process.md` - How to release new versions
- `translation.mdx` - Translation contribution guide

## Versioned Documentation

The site supports versioned documentation with past versions stored in:

- `versioned_docs/version-X.Y.Z/` - Snapshot of docs for each version
- `versioned_sidebars/` - Sidebar configuration for each version
- `versions.json` - List of available versions

## Site Configuration

### Docusaurus Config (`docusaurus.config.ts`)

- Site metadata and URL configuration
- GitHub Pages deployment settings
- Theme and navigation configuration
- Versioning setup

### Customization

- `src/css/custom.css` - Site-wide styling overrides
- `src/components/` - Custom React components
- `src/pages/` - Custom pages (like the homepage)
- `static/img/` - Static assets and images

## Development Notes

### Adding New Documentation

1. Create markdown files in the `docs/` directory
2. Update `sidebars.ts` to include new pages in navigation
3. Use MDX format for pages requiring React components

### Managing Versions

- Only cut new documentation versions for minor/major releases
- Patch releases typically don't need new doc versions
- Version bumping copies current docs to versioned storage

### Translation Support

- Site is configured for internationalization but currently English-only
- Translation status tracking in `translation-status.json`
- Custom `TranslationStatus` component for displaying translation progress
