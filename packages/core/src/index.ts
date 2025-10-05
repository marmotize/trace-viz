export { TraceOrchestrator } from './orchestrator.js';
export { VisualizerRegistry } from './visualizer-registry.js';
export { JSONataVersionDetector } from './version-detector.js';

export type {
  Version,
  RawTrace,
  OrchestratorStatus,
  OrchestratorState,
  VisualizerComponent,
  StateSubscriber,
  VersionDetector,
  TracePreparer,
  OrchestratorConfig,
} from './types.js';

export type { JSONataVersionDetectorConfig } from './version-detector.js';

// Re-export schema utilities for convenience
export * from './schemas/index.js';
