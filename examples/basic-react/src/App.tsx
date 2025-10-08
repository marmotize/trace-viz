import { useTrace, type TracePreparer } from '@trace-viz/react';
import { JSONataVersionDetector } from '@trace-viz/version-detector-jsonata';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sampleTraceV1, sampleTraceV2 } from './test-presets';
import { TestTools } from './TestTools';
import type { TraceV1, TraceV2 } from './types';
import { TraceViewerV1 } from './visualizers/TraceViewerV1';
import { TraceViewerV2 } from './visualizers/TraceViewerV2';

export function App() {
  const isTestMode =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('test') === '1';

  const [simulateAsync, setSimulateAsync] = useState(() => isTestMode);
  const [delayMs, setDelayMs] = useState(() => (isTestMode ? 150 : 400));
  const [preparerEnabled, setPreparerEnabled] = useState(true);

  const simulateAsyncRef = useRef(simulateAsync);
  const delayMsRef = useRef(delayMs);
  const preparerEnabledRef = useRef(preparerEnabled);

  useEffect(() => {
    simulateAsyncRef.current = simulateAsync;
  }, [simulateAsync]);

  useEffect(() => {
    delayMsRef.current = delayMs;
  }, [delayMs]);

  useEffect(() => {
    preparerEnabledRef.current = preparerEnabled;
  }, [preparerEnabled]);

  const versionDetector = useMemo(
    () =>
      new JSONataVersionDetector({
        expression: 'version',
        fallback: '1',
      }),
    [],
  );

  const visualizers = useMemo(
    () => [
      { component: TraceViewerV1, version: '1' },
      { component: TraceViewerV2, version: '2' },
    ],
    [],
  );

  const preparer: TracePreparer<TraceV1 | TraceV2> = useMemo(
    () => ({
      prepare: async (raw, { version }) => {
        if (!preparerEnabledRef.current) {
          return raw as unknown as TraceV1 | TraceV2;
        }

        if (simulateAsyncRef.current && delayMsRef.current > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayMsRef.current),
          );
        }

        const traceVersion = String(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (raw as any)?.version ?? version ?? '1',
        );

        if (traceVersion === '1') {
          return { ...raw, version: '1' } as TraceV1;
        }
        if (traceVersion === '2' || traceVersion.startsWith('2.')) {
          return { ...raw, version: '2' } as TraceV2;
        }

        return { ...raw, version: '1' } as TraceV1;
      },
    }),
    [],
  );

  const useTraceResult = useTrace<TraceV1 | TraceV2>({
    defaultVisualizer: isTestMode ? undefined : { component: TraceViewerV1 },
    initialTrace: isTestMode ? undefined : sampleTraceV2,
    preparer,
    versionDetector,
    visualizers,
  });

  const {
    error,
    isError,
    isProcessing,
    isSuccess,
    process,
    trace,
    version,
    visualizer: Visualizer,
  } = useTraceResult;

  return (
    <div
      style={{
        margin: '0 auto',
        maxWidth: '960px',
        padding: '24px',
      }}
    >
      {isTestMode && (
        <div data-testid="app-ready" style={{ display: 'none' }} />
      )}

      <header style={{ marginBottom: '32px' }}>
        <h1
          style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}
        >
          useTrace Demo
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Automatic version detection and visualizer selection for trace data
        </p>
      </header>

      <section
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '24px',
          padding: '20px',
        }}
      >
        <h2
          style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}
        >
          Load Trace
        </h2>

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <button
            data-testid="btn-v1"
            onClick={() => process({ rawTrace: sampleTraceV1 })}
            style={{
              background: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              padding: '10px 20px',
            }}
          >
            Load v1 Trace
          </button>

          <button
            data-testid="btn-v2"
            onClick={() => process({ rawTrace: sampleTraceV2 })}
            style={{
              background: '#10b981',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              padding: '10px 20px',
            }}
          >
            Load v2 Trace (LLM)
          </button>

          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '8px',
              marginLeft: 'auto',
            }}
          >
            <label
              style={{
                alignItems: 'center',
                cursor: 'pointer',
                display: 'flex',
                fontSize: '14px',
                gap: '6px',
              }}
            >
              <input
                checked={simulateAsync}
                data-testid="control-simulate-async"
                onChange={(e) => setSimulateAsync(e.target.checked)}
                type="checkbox"
              />
              Simulate async processing
            </label>
            <input
              data-testid="control-delay-ms"
              disabled={!simulateAsync}
              max={2000}
              min={0}
              onChange={(e) => setDelayMs(Number(e.target.value))}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '6px 8px',
                width: '70px',
              }}
              type="number"
              value={delayMs}
            />
            <span style={{ fontSize: '14px' }}>ms</span>
          </div>
        </div>
      </section>

      <section>
        {isProcessing && (
          <div
            data-testid="status-processing"
            style={{
              alignItems: 'center',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              color: '#1e40af',
              display: 'flex',
              fontSize: '14px',
              gap: '8px',
              padding: '12px 16px',
            }}
          >
            <div
              style={{
                animation: 'spin 1s linear infinite',
                border: '2px solid #bfdbfe',
                borderRadius: '50%',
                borderTop: '2px solid #3b82f6',
                height: '16px',
                width: '16px',
              }}
            />
            Processing trace...
          </div>
        )}

        {isError && (
          <div
            data-testid="status-error"
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#991b1b',
              fontSize: '14px',
              padding: '12px 16px',
            }}
          >
            <strong>Error:</strong> {error?.message}
          </div>
        )}

        {isSuccess && version && (
          <div
            data-testid="status-success"
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              color: '#166534',
              fontSize: '14px',
              marginBottom: '16px',
              padding: '12px 16px',
            }}
          >
            ✓ Detected version:{' '}
            <strong data-testid="version" style={{ fontFamily: 'monospace' }}>
              {version}
            </strong>
          </div>
        )}

        {isSuccess && Visualizer && trace && (
          <div data-testid="viz-root">
            <Visualizer trace={trace} />
          </div>
        )}
      </section>

      <details open={isTestMode} style={{ marginTop: '32px' }}>
        <summary
          style={{
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px',
          }}
        >
          🧪 Test Tools
        </summary>
        <TestTools
          delayMs={delayMs}
          preparerEnabled={preparerEnabled}
          setDelayMs={setDelayMs}
          setPreparerEnabled={setPreparerEnabled}
          setSimulateAsync={setSimulateAsync}
          simulateAsync={simulateAsync}
          useTraceResult={useTraceResult}
        />
      </details>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
