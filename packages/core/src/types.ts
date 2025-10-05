/**
 * Core types for trace visualization orchestrator v0
 */

export type Version = string;

export interface RawTrace {
  [key: string]: unknown;
}

export type OrchestratorStatus = 'idle' | 'processing' | 'success' | 'error';

export interface OrchestratorState<T = unknown> {
  error: Error | null;
  rawTrace: RawTrace | null;
  status: OrchestratorStatus;
  trace: T | null;
  version: Version | null;
  visualizer: VisualizerComponent | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VisualizerComponent = any;

export type StateSubscriber<T = unknown> = (
  state: OrchestratorState<T>,
) => void;

/**
 * Version detector interface
 */
export interface VersionDetector {
  detect(trace: RawTrace): Version;
}

/**
 * Preparer interface for transforming raw trace into visualization-ready format
 */
export interface TracePreparer<T = unknown> {
  prepare(
    trace: RawTrace,
    ctx: { version: Version; visualizer?: VisualizerComponent | string },
  ): Promise<T> | T;
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig<T = unknown> {
  /**
   * Optional preparer for transforming trace data for visualization
   */
  preparer?: TracePreparer<T>;

  /**
   * Version detector to extract version from raw trace
   */
  versionDetector: VersionDetector;
}

/**
 * Options for processing a trace
 */
export interface ProcessOptions {
  /**
   * Force the use of a specific version instead of running version detection.
   */
  overrideVersion?: Version;
  rawTrace: RawTrace;
  /**
   * Force the use of a specific visualizer instead of looking it up.
   */
  visualizer?: VisualizerComponent;
}

/**
 * Options for registering a visualizer
 */
export interface RegisterVisualizerOptions {
  component: VisualizerComponent;
  /**
   * Whether to replace existing visualizer for the same version if present.
   * Default behavior is to replace (to match current semantics).
   */
  replace?: boolean;
  version: Version;
}

/**
 * Options for setting a default visualizer
 */
export interface SetDefaultVisualizerOptions {
  component: VisualizerComponent;
}
