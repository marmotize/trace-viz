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
      orchestrator.process({ rawTrace: initialTrace });
    }
  }, [initialTrace, orchestrator]);

  const process = useCallback(
    (optionsOrTrace: ProcessOptions | RawTrace) => {
      // Backward compatibility: if rawTrace is passed directly, wrap it
      const isProcessOptions =
        optionsOrTrace &&
        typeof optionsOrTrace === 'object' &&
        'rawTrace' in optionsOrTrace;
      const processOptions: ProcessOptions = isProcessOptions
        ? (optionsOrTrace as ProcessOptions)
        : { rawTrace: optionsOrTrace as RawTrace };
      return orchestrator.process(processOptions);
    },
    [orchestrator],
  );

  const reset = useCallback(() => orchestrator.reset(), [orchestrator]);

  const registerVisualizer = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (options: RegisterVisualizerOptions | string, component?: any) => {
      // Backward compatibility: if version is passed as first arg, wrap it
      const registerOptions: RegisterVisualizerOptions =
        typeof options === 'string' ? { component, version: options } : options;
      return orchestrator.registerVisualizer(registerOptions);
    },
    [orchestrator],
  );

  const setDefaultVisualizer = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (options: SetDefaultVisualizerOptions | any) => {
      // Backward compatibility: if component is passed directly, wrap it
      const setDefaultOptions: SetDefaultVisualizerOptions =
        typeof options === 'object' && 'component' in options
          ? options
          : { component: options };
      return orchestrator.setDefaultVisualizer(setDefaultOptions);
    },
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
