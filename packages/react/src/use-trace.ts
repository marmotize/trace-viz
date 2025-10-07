import {
  TraceOrchestrator,
  type OrchestratorConfig,
  type OrchestratorState,
  type ProcessOptions,
  type RawTrace,
  type RegisterVisualizerOptions,
  type SetDefaultVisualizerOptions,
  type Version,
} from '@trace-viz/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseTraceOptions<T = unknown> extends OrchestratorConfig<T> {
  /**
   * Default visualizer to configure automatically.
   */
  defaultVisualizer?: SetDefaultVisualizerOptions;

  /**
   * Initial trace to process on mount
   */
  initialTrace?: RawTrace;

  /**
   * Dependencies controlling when a new orchestrator instance is created.
   * Falls back to `[versionDetector, preparer]` when not provided.
   */
  orchestratorDependencies?: ReadonlyArray<unknown>;

  /**
   * Optional factory for constructing the orchestrator instance.
   * Useful when callers need full control over instantiation.
   */
  orchestratorFactory?: () => TraceOrchestrator<T>;

  /**
   * Visualizers to register automatically when the orchestrator is created.
   */
  visualizers?: Array<RegisterVisualizerOptions>;
}

export function useTrace<T = unknown>(options: UseTraceOptions<T>) {
  const {
    defaultVisualizer,
    initialTrace,
    orchestratorDependencies,
    orchestratorFactory,
    visualizers,
    ...config
  } = options;

  // Orchestrator dependencies can be customized via orchestratorDependencies
  const orchestrator = useMemo(
    () => {
      if (orchestratorFactory) {
        return orchestratorFactory();
      }
      return new TraceOrchestrator<T>(config);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    orchestratorDependencies ?? [config.preparer, config.versionDetector],
  );

  const [state, setState] = useState<OrchestratorState<T>>(
    orchestrator.getState(),
  );

  useEffect(() => {
    // Resync state when orchestrator changes
    setState(orchestrator.getState());
  }, [orchestrator]);

  useEffect(() => {
    const unsubscribe = orchestrator.subscribe(setState);
    return unsubscribe;
  }, [orchestrator]);

  const configuredVisualizers = useMemo(() => visualizers ?? [], [visualizers]);

  // Combined effect: apply registry configuration first, then process initialTrace
  // This prevents a race where initialTrace processing happens before visualizers are registered
  useEffect(() => {
    // Apply registry first
    if (configuredVisualizers.length > 0) {
      // Use replace: true for idempotency
      const entries = configuredVisualizers.map((entry) => ({
        ...entry,
        replace: true,
      }));
      orchestrator.registerVisualizerBatch(entries);
    }
    if (defaultVisualizer) {
      orchestrator.setDefaultVisualizer(defaultVisualizer);
    }

    // Then process initial trace
    if (initialTrace) {
      void orchestrator.process({ rawTrace: initialTrace });
    }
  }, [orchestrator, configuredVisualizers, defaultVisualizer, initialTrace]);

  const process = useCallback(
    (options: ProcessOptions) => orchestrator.process(options),
    [orchestrator],
  );

  const reset = useCallback(() => orchestrator.reset(), [orchestrator]);

  const registerVisualizer = useCallback(
    (options: RegisterVisualizerOptions) =>
      orchestrator.registerVisualizer(options),
    [orchestrator],
  );

  const setDefaultVisualizer = useCallback(
    (options: SetDefaultVisualizerOptions) =>
      orchestrator.setDefaultVisualizer(options),
    [orchestrator],
  );

  const clearVisualizers = useCallback(
    () => orchestrator.clearVisualizers(),
    [orchestrator],
  );

  const restoreVisualizers = useCallback(() => {
    orchestrator
      .clearVisualizers()
      .registerVisualizerBatch(configuredVisualizers);
    if (defaultVisualizer) {
      orchestrator.setDefaultVisualizer(defaultVisualizer);
    }
  }, [configuredVisualizers, defaultVisualizer, orchestrator]);

  const getRegisteredVersions = useCallback(
    () => orchestrator.getRegisteredVersions(),
    [orchestrator],
  );

  const hasVisualizer = useCallback(
    (version: Version) => orchestrator.hasVisualizer(version),
    [orchestrator],
  );

  return {
    // State
    state,

    // Computed flags
    isError: state.status === 'error',
    isIdle: state.status === 'idle',
    isProcessing: state.status === 'processing',
    isSuccess: state.status === 'success',

    // Data
    error: state.error,
    rawTrace: state.rawTrace,
    trace: state.trace,
    version: state.version,
    visualizer: state.visualizer,

    // Actions
    clearVisualizers,
    getRegisteredVersions,
    hasVisualizer,
    process,
    registerVisualizer,
    reset,
    restoreVisualizers,
    setDefaultVisualizer,

    // Orchestrator instance for advanced usage
    orchestrator,
  };
}
