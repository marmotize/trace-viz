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

- Node.js >=20
- React ^18 || ^19
- ESM-only (no CommonJS support)

## Usage

### Basic Example

```typescript
import { useEffect } from 'react';
import { useTrace } from '@trace-viz/react';
import { JSONataVersionDetector } from '@trace-viz/core';

function TraceViewer({ traceData }) {
  const { state, process, registerVisualizer, setDefaultVisualizer } = useTrace(
    {
      versionDetector: new JSONataVersionDetector({
        expression: 'version',
        fallback: '1',
      }),
    },
  );

  // Register visualizers on mount
  useEffect(() => {
    registerVisualizer('1', TraceViewerV1);
    registerVisualizer('2', TraceViewerV2);
    setDefaultVisualizer(DefaultViewer);
  }, [registerVisualizer, setDefaultVisualizer]);

  // Process trace data
  useEffect(() => {
    if (traceData) {
      process(traceData);
    }
  }, [traceData, process]);

  if (state.status === 'processing') return <div>Loading...</div>;
  if (state.status === 'error') return <div>Error: {state.error?.message}</div>;
  if (state.status === 'success' && state.visualizer) {
    const Visualizer = state.visualizer;
    return <Visualizer trace={state.trace} />;
  }

  return null;
}
```

### With Initial Trace

```typescript
import { JSONataVersionDetector } from '@trace-viz/core';
import { useTrace } from '@trace-viz/react';

function TraceViewer() {
  const { state, registerVisualizer } = useTrace({
    versionDetector: new JSONataVersionDetector({
      expression: 'version',
      fallback: '1',
    }),
    initialTrace: myTraceData, // Process on mount
  });

  useEffect(() => {
    registerVisualizer('1', TraceViewerV1);
  }, [registerVisualizer]);

  // Trace is automatically processed on mount
  // ...
}
```

### With Trace Preparer

```typescript
import { JSONataVersionDetector } from '@trace-viz/core';
import { useTrace } from '@trace-viz/react';

function TraceViewer() {
  const { state, process } = useTrace({
    versionDetector: new JSONataVersionDetector({
      expression: 'metadata.version',
    }),
    preparer: {
      prepare: (trace, context) => ({
        ...trace,
        normalizedSpans: trace.spans.map(normalizeSpan),
      }),
    },
  });

  // ...
}
```

## Peer Dependencies

This package requires `react` as a peer dependency. Make sure you have React installed in your project.

## API

### `useTrace<T>(options)`

Hook options:

- `versionDetector`: Version detector instance (required)
- `preparer`: Optional trace preparer for transformation
- `initialTrace`: Optional trace to process on mount

Returns:

- `state`: Current orchestrator state (`{ status, trace, version, visualizer, error }`)
- `process(trace)`: Function to process trace data
- `reset()`: Function to reset state
- `registerVisualizer(version, component)`: Register visualizer for version
- `setDefaultVisualizer(component)`: Set default/fallback visualizer
- `orchestrator`: Direct access to TraceOrchestrator instance

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
