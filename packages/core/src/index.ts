export { TraceOrchestrator } from './orchestrator.js';
export { VisualizerRegistry } from './visualizer-registry.js';
export { JSONataVersionDetector } from './version-detector.js';
export { JSONataTransformer } from './transformer.js';

export type {
  Version,
  RawTrace,
  OrchestratorStatus,
  OrchestratorState,
  VisualizerComponent,
  StateSubscriber,
  VersionDetector,
  Transformer,
  OrchestratorConfig,
} from './types.js';

export type { JSONataVersionDetectorConfig } from './version-detector.js';
export type { JSONataTransformerConfig } from './transformer.js';

// Re-export schema utilities for convenience
export * from './schemas/index.js';
