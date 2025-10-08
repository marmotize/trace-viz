import {
  TraceOrchestrator,
  type OrchestratorConfig,
  type ProcessOptions,
  type RawTrace,
  type RegisterVisualizerOptions,
  type SetDefaultVisualizerOptions,
  type Version,
} from '@trace-viz/core';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

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

  const state = useSyncExternalStore(
    useCallback(
      (onStoreChange) => orchestrator.subscribe(onStoreChange),
      [orchestrator],
    ),
    useCallback(() => orchestrator.getState(), [orchestrator]),
    useCallback(() => orchestrator.getState(), [orchestrator]),
  );

  const configuredVisualizers = useMemo(() => visualizers ?? [], [visualizers]);

  useEffect(() => {
    if (configuredVisualizers.length > 0) {
      const entries = configuredVisualizers.map((entry) => ({
        ...entry,
        replace: true,
      }));
      orchestrator.registerVisualizerBatch(entries);
    }
    if (defaultVisualizer) {
      orchestrator.setDefaultVisualizer(defaultVisualizer);
    }
  }, [orchestrator, configuredVisualizers, defaultVisualizer]);

  const didProcessInitialTrace = useRef(false);

  useEffect(() => {
    didProcessInitialTrace.current = false;
  }, [orchestrator]);

  useEffect(() => {
    if (!didProcessInitialTrace.current && initialTrace) {
      didProcessInitialTrace.current = true;
      void orchestrator.process({ rawTrace: initialTrace });
    }
  }, [orchestrator, initialTrace]);

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
