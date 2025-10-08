import { useState } from 'react';
import {
  invalidV2Trace,
  traceNoVersion,
  traceV2_1_3,
  traceV2_9_0,
} from './test-presets';
import type { UseTraceResult } from './types';
import { TraceViewerV1 } from './visualizers/TraceViewerV1';
import { TraceViewerV2 } from './visualizers/TraceViewerV2';

interface TestToolsProps {
  delayMs: number;
  onExpressionChange?: (expression: string) => void;
  onFallbackChange?: (fallback: string) => void;
  preparerEnabled: boolean;
  setDelayMs: (value: number) => void;
  setPreparerEnabled: (value: boolean) => void;
  setSimulateAsync: (value: boolean) => void;
  simulateAsync: boolean;
  useTraceResult: Pick<
    UseTraceResult,
    | 'clearVisualizers'
    | 'isError'
    | 'isProcessing'
    | 'isSuccess'
    | 'process'
    | 'registerVisualizer'
    | 'restoreVisualizers'
    | 'setDefaultVisualizer'
  >;
}

export function TestTools({
  delayMs,
  onExpressionChange,
  onFallbackChange,
  preparerEnabled,
  setDelayMs,
  setPreparerEnabled,
  setSimulateAsync,
  simulateAsync,
  useTraceResult,
}: TestToolsProps) {
  const {
    clearVisualizers,
    isError,
    isProcessing,
    isSuccess,
    process,
    registerVisualizer,
    restoreVisualizers,
    setDefaultVisualizer,
  } = useTraceResult;

  const [expression, setExpression] = useState('version');
  const [fallback, setFallback] = useState('1');
  const [customTrace, setCustomTrace] = useState('');
  const [customTraceError, setCustomTraceError] = useState<string | null>(null);

  const handleExpressionChange = (value: string) => {
    setExpression(value);
    onExpressionChange?.(value);
  };

  const handleFallbackChange = (value: string) => {
    setFallback(value);
    onFallbackChange?.(value);
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
    <div
      style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        marginTop: '20px',
        padding: '16px',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <strong>Preparer Controls:</strong>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '8px',
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
              checked={preparerEnabled}
              data-testid="control-preparer-enabled"
              onChange={(e) => setPreparerEnabled(e.target.checked)}
              type="checkbox"
            />
            Preparer Enabled
          </label>
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
              data-testid="control-preparer-delay-enabled"
              onChange={(e) => setSimulateAsync(e.target.checked)}
              type="checkbox"
            />
            Delay Enabled
          </label>
          <label
            style={{
              alignItems: 'center',
              display: 'flex',
              fontSize: '14px',
              gap: '6px',
            }}
          >
            Delay (ms):
            <input
              data-testid="control-preparer-delay-ms"
              disabled={!simulateAsync}
              min={0}
              onChange={(e) => setDelayMs(Number(e.target.value))}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '4px 6px',
                width: '80px',
              }}
              type="number"
              value={delayMs}
            />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <strong>Version Detection:</strong>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <label
            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <span style={{ fontSize: '14px' }}>JSONata Expression:</span>
            <input
              data-testid="control-expression"
              onChange={(e) => handleExpressionChange(e.target.value)}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '6px 8px',
                width: '200px',
              }}
              type="text"
              value={expression}
            />
          </label>
          <label
            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <span style={{ fontSize: '14px' }}>Fallback Version:</span>
            <input
              data-testid="control-fallback"
              onChange={(e) => handleFallbackChange(e.target.value)}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '6px 8px',
                width: '100px',
              }}
              type="text"
              value={fallback}
            />
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <strong>Registry Controls:</strong>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '8px',
          }}
        >
          <button
            data-testid="control-register-2-1"
            onClick={() =>
              registerVisualizer({ component: TraceViewerV2, version: '2.1' })
            }
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            Register 2.1
          </button>
          <button
            data-testid="control-clear-registry"
            onClick={clearVisualizers}
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            Clear Registry
          </button>
          <button
            data-testid="control-restore-defaults"
            onClick={restoreVisualizers}
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            Restore Defaults
          </button>
          <button
            data-testid="control-register-default"
            onClick={() => setDefaultVisualizer({ component: TraceViewerV1 })}
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            Set Default (V1)
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <strong>Trace Presets:</strong>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '8px',
          }}
        >
          <button
            data-testid="preset-v21-3"
            onClick={() => handlePreset('v21-3')}
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            v2.1.3
          </button>
          <button
            data-testid="preset-v2-9-0"
            onClick={() => handlePreset('v2-9-0')}
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            v2.9.0
          </button>
          <button
            data-testid="preset-no-version"
            onClick={() => handlePreset('no-version')}
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            No Version
          </button>
          <button
            data-testid="preset-invalid-v2"
            onClick={() => handlePreset('invalid-v2')}
            style={{
              background: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '6px 12px',
            }}
          >
            Invalid V2
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <strong>Custom Trace JSON:</strong>
        <div style={{ marginTop: '8px' }}>
          <textarea
            data-testid="control-custom-trace"
            onChange={(e) => {
              setCustomTrace(e.target.value);
              setCustomTraceError(null);
            }}
            placeholder='{"version": "2", "spans": [...], ...}'
            rows={4}
            style={{
              border: customTraceError
                ? '2px solid #ef4444'
                : '1px solid #d1d5db',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '13px',
              padding: '8px',
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
            marginTop: '8px',
            padding: '8px 16px',
          }}
        >
          Process Custom Trace
        </button>
        {customTraceError && (
          <div
            data-testid="custom-trace-error"
            style={{
              color: '#dc2626',
              fontSize: '14px',
              marginTop: '8px',
            }}
          >
            ⚠ {customTraceError}
          </div>
        )}
      </div>

      <div
        style={{
          borderTop: '1px solid #e5e7eb',
          fontSize: '14px',
          paddingTop: '12px',
        }}
      >
        <strong>State Flags:</strong>
        <div style={{ marginTop: '6px' }}>
          <span data-testid="flag-isProcessing">
            isProcessing: <code>{String(isProcessing)}</code>
          </span>
          {' | '}
          <span data-testid="flag-isSuccess">
            isSuccess: <code>{String(isSuccess)}</code>
          </span>
          {' | '}
          <span data-testid="flag-isError">
            isError: <code>{String(isError)}</code>
          </span>
        </div>
      </div>
    </div>
  );
}
