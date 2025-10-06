import type { TraceV2 } from '@trace-viz/core';

export function TraceViewerV2({ trace }: { trace: TraceV2 }) {
  return (
    <div
      data-testid="viz-v2"
      style={{
        border: '2px solid #10b981',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <h2>Trace Viewer v2 (Enhanced)</h2>
      <div style={{ marginTop: '10px' }}>
        <strong>Trace ID:</strong> {trace.traceId}
      </div>
      <div>
        <strong>Version:</strong> {trace.version}
      </div>
      <div>
        <strong>Timestamp:</strong> {new Date(trace.timestamp).toLocaleString()}
      </div>
      <div>
        <strong>Spans:</strong> {trace.spans.length}
      </div>

      {trace.metadata && (
        <div style={{ marginTop: '10px' }}>
          <strong>Metadata:</strong>
          <pre
            style={{
              background: '#f3f4f6',
              borderRadius: '4px',
              padding: '10px',
            }}
          >
            {JSON.stringify(trace.metadata, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Spans:</h3>
        {trace.spans.map((span) => (
          <div
            key={span.spanId}
            style={{
              background: '#f3f4f6',
              borderRadius: '4px',
              marginTop: '10px',
              padding: '10px',
            }}
          >
            <div>
              <strong>Name:</strong> {span.name}
            </div>
            <div>
              <strong>Duration:</strong> {span.endTime - span.startTime}ms
            </div>
            {span.parentId && (
              <div>
                <strong>Parent:</strong> {span.parentId}
              </div>
            )}

            {span.llm && (
              <div
                style={{
                  borderLeft: '2px solid #10b981',
                  marginTop: '10px',
                  paddingLeft: '10px',
                }}
              >
                <div>
                  <strong>Model:</strong> {span.llm.model}
                </div>
                <div>
                  <strong>Provider:</strong> {span.llm.provider}
                </div>
                <details>
                  <summary>Input/Output</summary>
                  <pre style={{ fontSize: '12px' }}>
                    {JSON.stringify(
                      { input: span.llm.input, output: span.llm.output },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
