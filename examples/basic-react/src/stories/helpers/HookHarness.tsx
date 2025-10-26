import type { UseTraceOptions } from '@trace-viz/react';
import { useEffect, useRef } from 'react';

interface HookHarnessProps<T> {
  config: UseTraceOptions<T>;
  onReady?: (
    state: ReturnType<typeof import('@trace-viz/react').useTrace<T>>,
  ) => void;
  useTraceHook: (
    config: UseTraceOptions<T>,
  ) => ReturnType<typeof import('@trace-viz/react').useTrace<T>>;
}

export function HookHarness<T>({
  config,
  onReady,
  useTraceHook,
}: HookHarnessProps<T>) {
  const state = useTraceHook(config);
  const didCall = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (didCall.current) {
      return;
    }
    didCall.current = true;
    onReady?.(state);
    // Intentionally omit state to avoid repeated calls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onReady]);

  // Event bridge for tests to trigger process()
  useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return;
    }

    const onProcess = (evt: Event) => {
      const ce = evt as CustomEvent<{ rawTrace?: unknown }>;
      if (!state.process) {
        return;
      }
      if (ce.detail?.rawTrace !== undefined) {
        state.process({ rawTrace: ce.detail.rawTrace as never });
      }
    };

    el.addEventListener('trace:process', onProcess as EventListener);
    return () => {
      el.removeEventListener('trace:process', onProcess as EventListener);
    };
    // Intentionally depend on state (not just state.process) to get fresh process function
  }, [state]);

  const {
    error,
    isError,
    isProcessing,
    isSuccess,
    trace,
    version,
    visualizer: Visualizer,
  } = state;

  return (
    <div data-testid="harness" ref={rootRef}>
      <div data-testid="app-ready" style={{ display: 'none' }} />
      <div data-testid="flag-isProcessing">{String(isProcessing)}</div>
      <div data-testid="flag-isSuccess">{String(isSuccess)}</div>
      <div data-testid="flag-isError">{String(isError)}</div>
      {isError && <div data-testid="error">{error?.message}</div>}
      {isSuccess && version && <div data-testid="version">{version}</div>}
      {isSuccess && Visualizer && trace && (
        <div data-testid="viz-root">
          <Visualizer trace={trace} />
        </div>
      )}
    </div>
  );
}
