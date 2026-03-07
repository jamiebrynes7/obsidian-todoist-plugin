# Docs CLAUDE.md

Last verified: 2026-03-07

## Commands

All commands run from this `docs/` directory:

- `npm start` - Start local development server
- `npm run build` - Build documentation site for production
- `npm run serve` - Serve built site locally
- `npm run clear` - Clear Docusaurus cache
- `npm run bump-version -- ${VERSION}` - Create new versioned docs (e.g., `npm run bump-version -- 2.2.0`)
- `npm run write-translations` - Extract translatable strings
- `npm run write-heading-ids` - Add heading IDs to markdown files
- `npm run typecheck` - TypeScript type checking

## Documentation Structure

- `docs/` - Current documentation (markdown/MDX)
- `docs/commands/` - Command-specific docs
- `docs/contributing/` - Developer and contributor guides
- `sidebars.ts` - Navigation structure (update when adding new pages)

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
- Version bumping copies current docs to versioned storage

### Translation Support

- Site is configured for internationalization but currently English-only
- Translation status tracking in `translation-status.json`
- Custom `TranslationStatus` component for displaying translation progress
