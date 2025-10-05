# @trace-viz/react

[![npm version](https://img.shields.io/npm/v/@trace-viz/react.svg)](https://www.npmjs.com/package/@trace-viz/react)

React hooks and components for trace visualization built on top of [@trace-viz/core](../core).

## Features

- React hooks for trace orchestration
- Optimized for React 18+
- Tree-shakeable ESM modules
- Full TypeScript support

## Installation

```bash
pnpm add @trace-viz/react react
```

## Requirements

- Node.js >=18
- React ^18 || ^19
- ESM-only (no CommonJS support)

## Usage

```typescript
import { useTraceVisualization } from '@trace-viz/react';

function MyComponent() {
  const { state, process } = useTraceVisualization();

  // Use the hook
}
```

## Peer Dependencies

This package requires `react` as a peer dependency. Make sure you have React installed in your project.

## API

See the [source code](src/index.ts) for the full API surface.

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Test
pnpm test

# Typecheck
pnpm typecheck
```

## License

MIT
