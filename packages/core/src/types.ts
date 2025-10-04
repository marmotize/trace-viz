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
 * Transformer interface for converting between versions
 */
export interface Transformer {
  canTransform(fromVersion: Version): boolean;
  transform(trace: RawTrace, fromVersion: Version): Promise<unknown> | unknown;
}

/**
 * Orchestrator configuration
 */
export interface OrchestratorConfig {
  /**
   * Whether to automatically transform to latest version
   * Default: false (keep original version)
   */
  autoTransform?: boolean;

  /**
   * Optional transformer for migrating between versions
   */
  transformer?: Transformer;

  /**
   * Version detector to extract version from raw trace
   */
  versionDetector: VersionDetector;
}
