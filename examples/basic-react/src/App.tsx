import { TraceV1Schema, TraceV2Schema } from '@trace-viz/core';
import {
  JSONataVersionDetector,
  useTrace,
  type TracePreparer,
  type TraceV1,
  type TraceV2,
} from '@trace-viz/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  invalidV2Trace,
  sampleTraceV1,
  sampleTraceV2,
  traceNoVersion,
  traceV2_1_3,
  traceV2_9_0,
} from './test-presets';
import { TraceViewerV1 } from './visualizers/TraceViewerV1';
import { TraceViewerV2 } from './visualizers/TraceViewerV2';

export function App() {
  const [selectedTrace, setSelectedTrace] = useState<'v1' | 'v2'>('v1');
  const [expression, setExpression] = useState('version');
  const [fallback, setFallback] = useState('1');
  const [preparerEnabled, setPreparerEnabled] = useState(true);
  const [preparerDelayEnabled, setPreparerDelayEnabled] = useState(false);
  const [preparerDelayMs, setPreparerDelayMs] = useState(0);
  const [customTrace, setCustomTrace] = useState('');
  const [customTraceError, setCustomTraceError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const isTestMode = window.location.search.includes('test=1');

  // Refs to track latest preparer control values
  const preparerEnabledRef = useRef(preparerEnabled);
  const preparerDelayEnabledRef = useRef(preparerDelayEnabled);
  const preparerDelayMsRef = useRef(preparerDelayMs);

  useEffect(() => {
    preparerEnabledRef.current = preparerEnabled;
  }, [preparerEnabled]);

  useEffect(() => {
    preparerDelayEnabledRef.current = preparerDelayEnabled;
  }, [preparerDelayEnabled]);

  useEffect(() => {
    preparerDelayMsRef.current = preparerDelayMs;
  }, [preparerDelayMs]);

  // Auto-enable delay in test mode for deterministic processing state
  useEffect(() => {
    if (isTestMode) {
      setPreparerDelayEnabled(true);
      setPreparerDelayMs(150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preparer: TracePreparer<TraceV1 | TraceV2> = useMemo(
    () => ({
      prepare: async (trace, { version }) => {
        // Read latest control values from refs
        if (!preparerEnabledRef.current) {
          return trace as TraceV1 | TraceV2;
        }

        if (preparerDelayEnabledRef.current && preparerDelayMsRef.current > 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, preparerDelayMsRef.current),
          );
        }

        // Prefer version from trace itself, fall back to detected version
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const traceVersionRaw = (trace as any)?.version;
        const effectiveVersion =
          traceVersionRaw !== undefined &&
          traceVersionRaw !== null &&
          String(traceVersionRaw) !== ''
            ? String(traceVersionRaw)
            : version;

        if (effectiveVersion === '1') {
          const normalized = { ...trace, version: '1' };
          return TraceV1Schema.parse(normalized);
        }
        if (effectiveVersion === '2' || effectiveVersion?.startsWith('2.')) {
          const normalized = { ...trace, version: '2' };
          return TraceV2Schema.parse(normalized);
        }
        return trace as TraceV1 | TraceV2;
      },
    }),
    [],
  );

  const versionDetector = useMemo(
    () =>
      new JSONataVersionDetector({
        expression,
        fallback,
      }),
    [expression, fallback],
  );

  const defaultVisualizersConfig = useMemo(
    () => [
      { component: TraceViewerV1, version: '1' },
      { component: TraceViewerV2, version: '2' },
    ],
    [],
  );

  const {
    clearVisualizers,
    error,
    isError,
    isProcessing,
    isSuccess,
    process,
    registerVisualizer,
    restoreVisualizers,
    setDefaultVisualizer,
    trace,
    version,
    visualizer: Visualizer,
  } = useTrace<TraceV1 | TraceV2>({
    defaultVisualizer: { component: TraceViewerV1 },
    preparer,
    versionDetector,
    visualizers: defaultVisualizersConfig,
  });

  useEffect(() => {
    setReady(true);
  }, []);

  const handleLoadTrace = (traceVersion: 'v1' | 'v2') => {
    setCustomTraceError(null);
    setSelectedTrace(traceVersion);
    const trace = traceVersion === 'v1' ? sampleTraceV1 : sampleTraceV2;
    process({ rawTrace: trace });
  };

  const handleProcessCustom = () => {
    if (!customTrace.trim()) {
      setCustomTraceError('Provide a JSON trace before processing.');
      return;
    }

    try {
      const parsedTrace = JSON.parse(customTrace);
      setCustomTraceError(null);
      process({ rawTrace: parsedTrace });
    } catch (error) {
      setCustomTraceError(
        error instanceof Error ? error.message : 'Invalid JSON input',
      );
    }
  };

  const handleRegister21 = () => {
    registerVisualizer({ component: TraceViewerV2, version: '2.1' });
  };

  const handleClearRegistry = () => {
    clearVisualizers();
  };

  const handleRestoreDefaults = () => {
    restoreVisualizers();
  };

  const handleSetDefault = () => {
    setDefaultVisualizer({ component: TraceViewerV1 });
  };

  const handlePreset = (preset: string) => {
    const presets: Record<string, Record<string, unknown>> = {
      'invalid-v2': invalidV2Trace,
      'no-version': traceNoVersion,
      'v2-9-0': traceV2_9_0,
      'v21-3': traceV2_1_3,
    };
    if (presets[preset]) {
      process({ rawTrace: presets[preset] });
    }
  };

  return (
    <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '40px' }}>
      {isTestMode && ready && (
        <div data-testid="app-ready" style={{ display: 'none' }} />
      )}
      <h1>Trace Visualization Library - v0 Demo</h1>

      <div style={{ marginTop: '20px' }}>
        <button
          data-testid="btn-v1"
          onClick={() => handleLoadTrace('v1')}
          style={{
            background: selectedTrace === 'v1' ? '#3b82f6' : '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            color: selectedTrace === 'v1' ? 'white' : 'black',
            cursor: 'pointer',
            marginRight: '10px',
            padding: '10px 20px',
          }}
        >
          Load Trace v1
        </button>

        <button
          data-testid="btn-v2"
          onClick={() => handleLoadTrace('v2')}
          style={{
            background: selectedTrace === 'v2' ? '#10b981' : '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            color: selectedTrace === 'v2' ? 'white' : 'black',
            cursor: 'pointer',
            padding: '10px 20px',
          }}
        >
          Load Trace v2 (Enhanced)
        </button>
      </div>

      {isTestMode && (
        <div
          style={{
            background: '#f0f0f0',
            borderRadius: '8px',
            marginTop: '20px',
            padding: '20px',
          }}
        >
          <h3>🧪 Test Panel</h3>

          <div style={{ marginBottom: '15px' }}>
            <strong>Version Detection:</strong>
            <div style={{ marginTop: '5px' }}>
              <label>
                JSONata Expression:{' '}
                <input
                  data-testid="control-expression"
                  onChange={(e) => setExpression(e.target.value)}
                  style={{ marginLeft: '5px', padding: '5px', width: '200px' }}
                  type="text"
                  value={expression}
                />
              </label>
            </div>
            <div style={{ marginTop: '5px' }}>
              <label>
                Fallback Version:{' '}
                <input
                  data-testid="control-fallback"
                  onChange={(e) => setFallback(e.target.value)}
                  style={{ marginLeft: '5px', padding: '5px', width: '100px' }}
                  type="text"
                  value={fallback}
                />
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Preparer Controls:</strong>
            <div style={{ marginTop: '5px' }}>
              <label>
                <input
                  checked={preparerEnabled}
                  data-testid="control-preparer-enabled"
                  onChange={(e) => setPreparerEnabled(e.target.checked)}
                  type="checkbox"
                />{' '}
                Preparer Enabled
              </label>
            </div>
            <div style={{ marginTop: '5px' }}>
              <label>
                <input
                  checked={preparerDelayEnabled}
                  data-testid="control-preparer-delay-enabled"
                  onChange={(e) => setPreparerDelayEnabled(e.target.checked)}
                  type="checkbox"
                />{' '}
                Delay Enabled
              </label>
            </div>
            <div style={{ marginTop: '5px' }}>
              <label>
                Delay (ms):{' '}
                <input
                  data-testid="control-preparer-delay-ms"
                  onChange={(e) => setPreparerDelayMs(Number(e.target.value))}
                  style={{ marginLeft: '5px', padding: '5px', width: '100px' }}
                  type="number"
                  value={preparerDelayMs}
                />
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Registry Controls:</strong>
            <div style={{ marginTop: '5px' }}>
              <button
                data-testid="control-register-2-1"
                onClick={handleRegister21}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  padding: '5px 10px',
                }}
              >
                Register 2.1
              </button>
              <button
                data-testid="control-clear-registry"
                onClick={handleClearRegistry}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  padding: '5px 10px',
                }}
              >
                Clear Registry
              </button>
              <button
                data-testid="control-restore-defaults"
                onClick={handleRestoreDefaults}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  padding: '5px 10px',
                }}
              >
                Restore Defaults
              </button>
              <button
                data-testid="control-register-default"
                onClick={handleSetDefault}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: '5px 10px',
                }}
              >
                Set Default (V1)
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Trace Presets:</strong>
            <div style={{ marginTop: '5px' }}>
              <button
                data-testid="preset-v21-3"
                onClick={() => handlePreset('v21-3')}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '5px',
                  padding: '5px 10px',
                }}
              >
                v2.1.3
              </button>
              <button
                data-testid="preset-v2-9-0"
                onClick={() => handlePreset('v2-9-0')}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '5px',
                  padding: '5px 10px',
                }}
              >
                v2.9.0
              </button>
              <button
                data-testid="preset-no-version"
                onClick={() => handlePreset('no-version')}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '5px',
                  padding: '5px 10px',
                }}
              >
                No Version
              </button>
              <button
                data-testid="preset-invalid-v2"
                onClick={() => handlePreset('invalid-v2')}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: '5px 10px',
                }}
              >
                Invalid V2
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Custom Trace:</strong>
            <div style={{ marginTop: '5px' }}>
              <textarea
                data-testid="control-custom-trace"
                onChange={(e) => {
                  setCustomTrace(e.target.value);
                  setCustomTraceError(null);
                }}
                placeholder='{"version": "2", "spans": [...], ...}'
                rows={4}
                style={{
                  border: customTraceError ? '1px solid #ef4444' : undefined,
                  fontFamily: 'monospace',
                  padding: '5px',
                  width: '100%',
                }}
                value={customTrace}
              />
            </div>
            <button
              data-testid="control-process-custom"
              onClick={handleProcessCustom}
              style={{
                background: '#3b82f6',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                marginTop: '5px',
                padding: '8px 15px',
              }}
            >
              Process Custom Trace
            </button>
            {customTraceError && (
              <div
                data-testid="custom-trace-error"
                style={{
                  color: '#dc2626',
                  marginTop: '8px',
                }}
              >
                Unable to process trace: {customTraceError}
              </div>
            )}
          </div>

          <div style={{ marginTop: '15px' }}>
            <strong>React State Flags:</strong>
            <div style={{ marginTop: '5px' }}>
              <span data-testid="flag-isProcessing">
                isProcessing: {String(isProcessing)}
              </span>
              {' | '}
              <span data-testid="flag-isSuccess">
                isSuccess: {String(isSuccess)}
              </span>
              {' | '}
              <span data-testid="flag-isError">isError: {String(isError)}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        {isProcessing && (
          <div data-testid="status-processing">Processing trace...</div>
        )}

        {isError && (
          <div
            data-testid="status-error"
            style={{
              background: '#fee',
              borderRadius: '4px',
              color: 'red',
              padding: '10px',
            }}
          >
            Error: {error?.message}
          </div>
        )}

        {isSuccess && version && (
          <div
            data-testid="status-success"
            style={{
              background: '#f0f9ff',
              borderRadius: '4px',
              marginBottom: '10px',
              padding: '10px',
            }}
          >
            <strong>Detected Version:</strong>{' '}
            <span data-testid="version">{version}</span>
          </div>
        )}

        {isSuccess && Visualizer && trace && (
          <div data-testid="viz-root" style={{ marginTop: '20px' }}>
            <Visualizer trace={trace} />
          </div>
        )}
      </div>
    </div>
  );
}
