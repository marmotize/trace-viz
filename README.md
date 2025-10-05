# trace-viz

Trace visualization monorepo with automatic version detection and transformation.

## Packages

- **[@trace-viz/core](packages/core)**: Core orchestration library for trace visualization
- **[@trace-viz/react](packages/react)**: React hooks and components for trace visualization

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Watch mode for all packages
pnpm dev

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint
pnpm lint

# Typecheck
pnpm typecheck

# Format
pnpm format
```

## Release Process

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing.

1. Create a changeset: `pnpm changeset`
2. Commit the changeset
3. Open a PR
4. On merge to main, a "Version Packages" PR will be created
5. Merge the version PR to publish to npm

## Contributing

- Use [conventional commits](https://www.conventionalcommits.org/)
- Run `pnpm test` before committing
- Ensure all checks pass before merging

## License

MIT
