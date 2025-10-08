import type { TraceV1 } from '../types';

export function TraceViewerV1({ trace }: { trace: TraceV1 }) {
  return (
    <div
      data-testid="viz-v1"
      style={{
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <h2>Trace Viewer v1</h2>
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
          </div>
        ))}
      </div>
    </div>
  );
}
