# CLAUDE.md

Last verified: 2026-03-07

## Monorepo Structure

Three npm workspaces:

- **`plugin/`** - Obsidian plugin source code (TypeScript, React, Vite)
- **`docs/`** - Documentation site (Docusaurus)
- **`scripts/`** - Release and code generation scripts

Each workspace has its own `package.json` and commands. See workspace-specific `CLAUDE.md` files for details.

## Top-Level Commands

- `npm run gen` - Run code generation scripts (delegates to `scripts/` workspace)

## Shared Tooling

- **Biome** (`biome.json` at root) - Linting and formatting for all TypeScript/React code
- **TypeScript** - Shared at root, workspace-specific `tsconfig.json` files
- **Vite** - Build tooling shared at root, configured per workspace

## Project-Wide Conventions

- No default exports (enforced by Biome `noDefaultExport` rule)
- All user-facing text in the plugin must use i18n (see `plugin/CLAUDE.md`)
- Run lint/format checks from the workspace directory: `npm run lint:check` / `npm run lint:fix`
