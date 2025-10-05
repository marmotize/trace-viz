export { TraceOrchestrator } from './orchestrator.js';
export { VisualizerRegistry } from './visualizer-registry.js';
export { JSONataVersionDetector } from './version-detector.js';

export type {
  OrchestratorConfig,
  OrchestratorState,
  OrchestratorStatus,
  ProcessOptions,
  RawTrace,
  RegisterVisualizerOptions,
  SetDefaultVisualizerOptions,
  StateSubscriber,
  TracePreparer,
  Version,
  VersionDetector,
  VisualizerComponent,
} from './types.js';

export type { JSONataVersionDetectorConfig } from './version-detector.js';

// Re-export schema utilities for convenience
export * from './schemas/index.js';
