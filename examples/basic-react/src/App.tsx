import { JSONataVersionDetector, useTrace } from '@trace-viz/react';
import { useState } from 'react';
import { TraceViewerV1 } from './visualizers/TraceViewerV1';
import { TraceViewerV2 } from './visualizers/TraceViewerV2';

// Sample trace data
const sampleTraceV1 = {
  spans: [
    {
      endTime: 1500,
      name: 'Main Operation',
      spanId: 'span-1',
      startTime: 1000,
    },
    {
      endTime: 1400,
      name: 'Sub Operation',
      parentId: 'span-1',
      spanId: 'span-2',
      startTime: 1100,
    },
  ],
  timestamp: Date.now(),
  traceId: 'trace-001',
  version: '1',
};

const sampleTraceV2 = {
  metadata: {
    environment: 'production',
    user: 'test-user',
  },
  spans: [
    {
      endTime: 2000,
      llm: {
        input: { prompt: 'Hello, world!' },
        model: 'gpt-4',
        output: { response: 'Hi there!' },
        provider: 'openai',
      },
      name: 'LLM Call',
      spanId: 'span-1',
      startTime: 1000,
    },
  ],
  timestamp: Date.now(),
  traceId: 'trace-002',
  version: '2',
};

export function App() {
  const [selectedTrace, setSelectedTrace] = useState<'v1' | 'v2'>('v1');

  const {
    error,
    isError,
    isProcessing,
    isSuccess,
    process,
    registerVisualizer,
    trace,
    version,
    visualizer: Visualizer,
  } = useTrace({
    versionDetector: new JSONataVersionDetector({
      expression: 'version',
      fallback: '1',
    }),
  });

  // Register visualizers
  useState(() => {
    registerVisualizer('1', TraceViewerV1);
    registerVisualizer('2', TraceViewerV2);
  });

  const handleLoadTrace = (traceVersion: 'v1' | 'v2') => {
    setSelectedTrace(traceVersion);
    const trace = traceVersion === 'v1' ? sampleTraceV1 : sampleTraceV2;
    process(trace);
  };

  return (
    <div style={{ margin: '0 auto', maxWidth: '1200px', padding: '40px' }}>
      <h1>Trace Visualization Library - v0 Demo</h1>

      <div style={{ marginTop: '20px' }}>
        <button
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

      <div style={{ marginTop: '20px' }}>
        {isProcessing && <div>Processing trace...</div>}

        {isError && (
          <div
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
            style={{
              background: '#f0f9ff',
              borderRadius: '4px',
              marginBottom: '10px',
              padding: '10px',
            }}
          >
            <strong>Detected Version:</strong> {version}
          </div>
        )}

        {isSuccess && Visualizer && trace && (
          <div style={{ marginTop: '20px' }}>
            <Visualizer trace={trace} />
          </div>
        )}
      </div>
    </div>
  );
}
