import { useTrace, type TracePreparer } from '@trace-viz/react';
import { JSONataVersionDetector } from '@trace-viz/version-detector-jsonata';
import { useMemo } from 'react';
import { sampleTraceV1, sampleTraceV2 } from './stories/fixtures/traces';
import type { TraceV1, TraceV2 } from './types';
import { TraceViewerV1 } from './visualizers/TraceViewerV1';
import { TraceViewerV2 } from './visualizers/TraceViewerV2';

export function App() {
  const versionDetector = useMemo(
    () => new JSONataVersionDetector({ expression: 'version', fallback: '1' }),
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
      prepare: (raw) => raw as unknown as TraceV1 | TraceV2,
    }),
    [],
  );

  const {
    error,
    isError,
    isProcessing,
    isSuccess,
    process,
    trace,
    version,
    visualizer: Visualizer,
  } = useTrace<TraceV1 | TraceV2>({
    defaultVisualizer: { component: TraceViewerV1 },
    initialTrace: sampleTraceV2,
    preparer,
    versionDetector,
    visualizers,
  });

  return (
    <div style={{ margin: '0 auto', maxWidth: 960, padding: 24 }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>
          useTrace Demo
        </h1>
        <p style={{ color: '#6b7280', fontSize: 16 }}>
          Automatic version detection and visualizer selection for trace data
        </p>
      </header>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => process({ rawTrace: sampleTraceV1 })}
          style={{
            background: '#3b82f6',
            border: 'none',
            borderRadius: 6,
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            padding: '10px 20px',
          }}
        >
          Load v1 Trace
        </button>
        <button
          onClick={() => process({ rawTrace: sampleTraceV2 })}
          style={{
            background: '#10b981',
            border: 'none',
            borderRadius: 6,
            color: 'white',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            padding: '10px 20px',
          }}
        >
          Load v2 Trace (LLM)
        </button>
      </div>

      {isProcessing && (
        <div
          style={{
            alignItems: 'center',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 8,
            color: '#1e40af',
            display: 'flex',
            fontSize: 14,
            gap: 8,
            marginBottom: 16,
            padding: '12px 16px',
          }}
        >
          <div
            style={{
              animation: 'spin 1s linear infinite',
              border: '2px solid #bfdbfe',
              borderRadius: '50%',
              borderTop: '2px solid #3b82f6',
              height: 16,
              width: 16,
            }}
          />
          Processing trace...
        </div>
      )}

      {isError && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            color: '#991b1b',
            fontSize: 14,
            marginBottom: 16,
            padding: '12px 16px',
          }}
        >
          <strong>Error:</strong> {error?.message}
        </div>
      )}

      {isSuccess && version && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            color: '#166534',
            fontSize: 14,
            marginBottom: 16,
            padding: '12px 16px',
          }}
        >
          ✓ Detected version: <strong>{version}</strong>
        </div>
      )}

      {isSuccess && Visualizer && trace && (
        <div>
          <Visualizer trace={trace} />
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
