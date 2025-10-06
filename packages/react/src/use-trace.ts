import {
  TraceOrchestrator,
  type OrchestratorConfig,
  type OrchestratorState,
  type ProcessOptions,
  type RawTrace,
  type RegisterVisualizerOptions,
  type SetDefaultVisualizerOptions,
} from '@trace-viz/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface UseTraceOptions<T = unknown> extends OrchestratorConfig<T> {
  /**
   * Initial trace to process on mount
   */
  initialTrace?: RawTrace;
}

export function useTrace<T = unknown>(options: UseTraceOptions<T>) {
  const { initialTrace, ...config } = options;

  const orchestrator = useMemo(
    () => new TraceOrchestrator<T>(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.versionDetector, config.preparer],
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

  // Process initial trace on mount
  useEffect(() => {
    if (initialTrace) {
      orchestrator.process({ rawTrace: initialTrace });
    }
  }, [initialTrace, orchestrator]);

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
    process,
    registerVisualizer,
    reset,
    setDefaultVisualizer,

    // Orchestrator instance for advanced usage
    orchestrator,
  };
}
