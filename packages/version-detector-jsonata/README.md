# @trace-viz/version-detector-jsonata

JSONata-based version detector plugin for trace-viz.

## Installation

```bash
pnpm add @trace-viz/version-detector-jsonata @trace-viz/core
```

## Usage

```typescript
import { TraceOrchestrator } from '@trace-viz/core';
import { JSONataVersionDetector } from '@trace-viz/version-detector-jsonata';

const versionDetector = new JSONataVersionDetector({
  expression: 'metadata.schemaVersion',
  fallback: '1.0',
});

const orchestrator = new TraceOrchestrator({
  versionDetector,
});
```

## API

### `JSONataVersionDetector`

A version detector that uses JSONata expressions to extract version information from trace data.

#### Constructor Options

- `expression` (required): JSONata expression to extract version from trace
  - Examples:
    - Simple: `'version'`
    - Nested: `'metadata.schemaVersion'`
    - Array: `'spans[0].version'`
    - Conditional: `'version ? version : "1.0"'`
    - Complex: `'metadata.version ? metadata.version : spans[0].schemaVersion'`
- `fallback` (optional): Fallback version if expression returns null/undefined
- `onError` (optional): Callback invoked when version detection fails but a fallback is used

## License

MIT
