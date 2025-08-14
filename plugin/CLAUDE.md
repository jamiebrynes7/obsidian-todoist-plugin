# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the main plugin source code for an unofficial Obsidian plugin that enables bidirectional sync between Obsidian and Todoist. The plugin allows users to view, create, and manage Todoist tasks directly within Obsidian using code blocks and modal interfaces.

## Common Commands

All commands should be run from this `plugin/` directory:

### Development
- `npm run dev` - Build plugin in development mode with type checking
- `npm run build` - Build plugin for production
- `npm run check` - Run TypeScript type checking only

### Testing and Quality
- `npm run test` - Run all tests with Vitest
- `npm run test ./src/utils` - Run tests for specific directory/file
- `npm run lint:check` - Check code formatting and linting with BiomeJS
- `npm run lint:fix` - Auto-fix formatting and linting issues

### Other
- `npm run gen` - Generate language status file

## Architecture Overview

### Plugin Structure
- **Main Plugin** (`src/index.ts`): Core plugin class that initializes services, registers commands, and handles Obsidian lifecycle
- **API Layer** (`src/api/`): Todoist REST API client with domain models for tasks, projects, sections, and labels
- **Query System** (`src/query/`): Markdown code block processor that renders Todoist queries in notes
- **UI Components** (`src/ui/`): React-based user interface components including modals, settings, and task displays
- **Services** (`src/services/`): Business logic layer including token management and modal orchestration
- **Data Layer** (`src/data/`): Repository pattern for caching and managing Todoist data with transformations

### Key Components
- **Query Injector** (`src/query/injector.tsx`): Processes `todoist` code blocks and renders interactive task lists
- **Repository Pattern** (`src/data/repository.ts`): Generic caching layer for API data with sync capabilities
- **Settings Store** (`src/settings.ts`): Zustand-based state management for plugin configuration
- **Token Accessor** (`src/services/tokenAccessor.ts`): Secure storage and retrieval of Todoist API tokens

### UI Architecture
- Built with React 19 and React Aria Components
- Uses Framer Motion for animations
- SCSS with component-scoped styles
- Supports both light and dark themes matching Obsidian

### Query Language
The plugin supports a custom query language in `todoist` code blocks with options for:
- Filtering tasks by project, labels, due dates
- Sorting by priority, date, order
- Grouping by project, section, priority, date, labels
- Metadata display toggles for due dates, projects, labels, descriptions

## Development Environment

### Local Development
Set `VITE_OBSIDIAN_VAULT` in `.env.local` to automatically copy build output to your Obsidian vault for testing:
```
export VITE_OBSIDIAN_VAULT=/path/to/your/obsidian/vault
```

### Code Style
- Uses BiomeJS for formatting and linting
- 2-space indentation, 100 character line width
- Automatic import organization with package/alias/path grouping
- React functional components with hooks

### Testing
- Vitest with jsdom environment for React component testing
- Mocked Obsidian API (`src/mocks/obsidian.ts`)
- Tests focus on data transformations and utility functions

## File Organization

- `src/api/` - Todoist API client and domain models
- `src/commands/` - Obsidian command definitions
- `src/data/` - Data layer with repositories and transformations
- `src/i18n/` - Internationalization support
- `src/query/` - Query parsing and code block processing
- `src/services/` - Business logic and service layer
- `src/ui/` - React components organized by feature
- `src/utils/` - Shared utility functions

## Build Process

Uses Vite with:
- TypeScript compilation with path aliases
- React JSX transformation
- SCSS processing
- Library mode targeting CommonJS for Obsidian compatibility
- Manifest copying and build stamping
- Development mode auto-copying to vault