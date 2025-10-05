import {
  TraceOrchestrator,
  type OrchestratorConfig,
  type OrchestratorState,
  type RawTrace,
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
    [config.versionDetector],
  );

  const [state, setState] = useState<OrchestratorState<T>>(
    orchestrator.getState(),
  );

  useEffect(() => {
    const unsubscribe = orchestrator.subscribe(setState);
    return unsubscribe;
  }, [orchestrator]);

  // Process initial trace on mount
  useEffect(() => {
    if (initialTrace) {
      orchestrator.process(initialTrace);
    }
  }, [initialTrace, orchestrator]);

  const process = useCallback(
    (trace: RawTrace) => orchestrator.process(trace),
    [orchestrator],
  );

  const reset = useCallback(() => orchestrator.reset(), [orchestrator]);

  const registerVisualizer = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (version: string, component: any) =>
      orchestrator.registerVisualizer(version, component),
    [orchestrator],
  );

  const setDefaultVisualizer = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component: any) => orchestrator.setDefaultVisualizer(component),
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
    process,
    registerVisualizer,
    reset,
    setDefaultVisualizer,

    // Orchestrator instance for advanced usage
    orchestrator,
  };
}
