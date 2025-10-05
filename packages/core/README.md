# @trace-viz/core

[![npm version](https://img.shields.io/npm/v/@trace-viz/core.svg)](https://www.npmjs.com/package/@trace-viz/core)

Core orchestration library for trace visualization with automatic version detection and transformation.

## Features

- Automatic version detection for trace data
- Pluggable visualizer registry
- Transformation pipeline for trace data
- TypeScript-first with full type safety
- Tree-shakeable ESM modules

## Installation

```bash
pnpm add @trace-viz/core
```

## Requirements

- Node.js >=20
- ESM-only (no CommonJS support)

## Usage

```typescript
import { TraceOrchestrator, VisualizerRegistry } from '@trace-viz/core';

// Create orchestrator instance
const orchestrator = new TraceOrchestrator();

// Process trace data
const result = await orchestrator.process(traceData);
```

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
