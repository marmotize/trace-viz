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

### Basic Setup

```typescript
import { JSONataVersionDetector, TraceOrchestrator } from '@trace-viz/core';

// Create orchestrator with version detector
const orchestrator = new TraceOrchestrator({
  versionDetector: new JSONataVersionDetector({
    expression: 'version', // JSONata expression to extract version
    fallback: '1', // Fallback version if detection fails
  }),
});

// Register visualizers for different versions
orchestrator.registerVisualizer({ version: '1', component: TraceViewerV1 });
orchestrator.registerVisualizer({ version: '2', component: TraceViewerV2 });
orchestrator.setDefaultVisualizer({ component: DefaultViewer });

// Process trace data
await orchestrator.process({ rawTrace: traceData });

// Subscribe to state changes
const unsubscribe = orchestrator.subscribe((state) => {
  if (state.status === 'success') {
    console.log('Version:', state.version);
    console.log('Visualizer:', state.visualizer);
    console.log('Prepared trace:', state.trace);
  }
});
```

### With Trace Preparer

```typescript
import { JSONataVersionDetector, TraceOrchestrator } from '@trace-viz/core';

const orchestrator = new TraceOrchestrator({
  versionDetector: new JSONataVersionDetector({
    expression: 'metadata.version',
    fallback: '1',
  }),
  preparer: {
    prepare: (trace, context) => {
      // Transform raw trace to your desired format
      return {
        ...trace,
        normalizedSpans: trace.spans.map(normalizeSpan),
      };
    },
  },
});
```

### With Optional Parameters

```typescript
// Override version detection
await orchestrator.process({
  rawTrace: traceData,
  overrideVersion: '2.1.0', // Use specific version instead of detection
});

// Use specific visualizer
await orchestrator.process({
  rawTrace: traceData,
  visualizer: CustomViewer, // Bypass version detection and registry lookup
});
```

### Version Detection

The orchestrator uses semantic version matching:

- Exact match: `"2.1.3"` matches registered `"2.1.3"`
- Major.minor fallback: `"2.1.3"` → `"2.1"` → `"2"`
- Default fallback: Uses default visualizer if no match found

## API

### `TraceOrchestrator`

Constructor options:

- `versionDetector`: Version detector instance (required)
- `preparer`: Optional trace preparer for transformation

Methods:

- `process(options)`: Process trace data
  - `rawTrace`: Trace data to process (required)
  - `overrideVersion`: Optional version to use instead of detection
  - `visualizer`: Optional visualizer component to use instead of registry lookup
- `registerVisualizer(options)`: Register visualizer for version
  - `version`: Version string (required)
  - `component`: Visualizer component (required)
- `registerVisualizers(mapping)`: Register multiple visualizers
- `setDefaultVisualizer(options)`: Set fallback visualizer
  - `component`: Visualizer component (required)
- `subscribe(callback)`: Subscribe to state changes
- `reset()`: Reset to initial state

### `JSONataVersionDetector`

Constructor options:

- `expression`: JSONata expression to extract version
- `fallback`: Optional fallback version string

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
