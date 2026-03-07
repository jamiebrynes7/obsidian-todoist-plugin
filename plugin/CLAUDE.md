# Plugin CLAUDE.md

Last verified: 2026-03-07

## Commands

All commands run from this `plugin/` directory:

- `npm run dev` - Development build with type checking
- `npm run build` - Production build
- `npm run check` - TypeScript type checking only
- `npm run test` - Run all tests (Vitest)
- `npm run test ./src/utils` - Run tests for specific directory/file
- `npm run lint:check` - Check formatting and linting (BiomeJS)
- `npm run lint:fix` - Auto-fix formatting and linting issues

## Project Structure

- `src/index.ts` - Plugin entry point; initializes services, registers commands
- `src/api/` - Todoist REST API client and domain models
- `src/data/` - Repository pattern for caching API data with sync
- `src/query/` - Custom query language parser and `todoist` code block renderer
- `src/ui/` - React components (React 19 + React Aria Components + Framer Motion)
- `src/services/` - Business logic (token management, modal orchestration)
- `src/commands/` - Obsidian command definitions
- `src/i18n/` - Internationalization (interface in `translation.ts`, implementations in `langs/`)
- `src/utils/` - Shared utilities

## Key Design Decisions

- **Repository pattern** (`src/data/repository.ts`): Generic caching layer that decouples UI from API fetch timing. All Todoist data flows through repositories.
- **Zustand for settings** (`src/settings.ts`): Reactive state management for plugin configuration, avoids prop drilling.
- **React Aria Components**: Accessibility-first UI primitives. Prefer these over custom interactive elements.
- **SCSS with component-scoped styles**: Each component has co-located `.scss`; supports Obsidian light/dark themes.

## Internationalization

- **Always use translations for user-facing text** - never hardcode strings in UI components
- Import translations with `import { t } from "@/i18n"` and use `const i18n = t().section`
- For simple text: define as `string` in translation interface and return string value
- For text with interpolation: define as `(param: Type) => string` function in translation interface
- Example with interpolation:

  ```typescript
  // translation.ts
  deleteNotice: (itemName: string) => string;

  // en.ts
  deleteNotice: ((itemName: string) => `Item "${itemName}" was deleted`,
    // component.tsx
    new Notice(i18n.deleteNotice(item.name)));
  ```

- Translation files are in `src/i18n/` with interface in `translation.ts` and implementations in `langs/`

### Testing

- Vitest with jsdom environment for React component testing
- Mocked Obsidian API (`src/mocks/obsidian.ts`)
