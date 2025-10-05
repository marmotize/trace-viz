# trace-viz Agent Guide

## Commands

- **Build all**: `pnpm build` (at root) - builds all packages
- **Dev all**: `pnpm dev` (at root) - watch mode for all packages in parallel
- **Test all**: `pnpm test` (at root) - runs lint, typecheck, tests, and format check in parallel
- **Test run**: `pnpm test:run` (at root) - runs vitest in all packages
- **Test watch**: `pnpm test:watch` (at root) - runs vitest in watch mode
- **Test single file**: `pnpm test <filename>` (in packages/core or packages/react)
- **Typecheck**: `pnpm typecheck` (at root or in individual package)
- **Lint**: `pnpm lint` (at root) - runs ESLint with cache
- **Lint fix**: `pnpm lint:fix` (at root) - auto-fix ESLint issues
- **Format**: `pnpm format` (at root) - format with Prettier
- **Format check**: `pnpm format:check` (at root) - check formatting

## Git Hooks

- **Pre-commit**: Runs lint-staged (lints and formats staged files)
- **Commit-msg**: Validates commit message follows conventional commits
- **Pre-push**: Runs full test suite before pushing

## Architecture

- **Monorepo**: pnpm workspace with packages (core, react) and examples
- **@trace-viz/core**: Core orchestration logic - TraceOrchestrator, VisualizerRegistry, version detection, transformers
- **@trace-viz/react**: React hooks and components built on top of core
- **Build tool**: tsdown for bundling ESM modules
- **Key concepts**: Version detection → Transformation → Visualization pipeline

## Code Style

- **TypeScript strict mode**: Always use explicit types, no any (except VisualizerComponent), strict enabled
- **Module system**: ESM with .js extensions in imports (e.g., `'./types.js'`)
- **Exports**: Use named exports, re-export types explicitly
- **File naming**: kebab-case for files (e.g., version-detector.ts)
- **Type naming**: PascalCase for types/interfaces, descriptive names
- **Error handling**: Use OrchestratorState with error field, typed Error objects
- **Commits**: Follow conventional commits format (feat:, fix:, chore:, docs:, etc.)

## Documentation

- **README.md**: Always check and update the README before pushing changes
  - Run `pnpm format` to ensure proper formatting (Prettier adds blank lines between Mermaid code blocks)
  - Keep architecture diagrams and documentation in sync with code changes
  - Update usage examples if APIs change
