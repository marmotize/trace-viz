import type { useTrace } from '@trace-viz/react';

export interface SpanBase {
  attributes?: Record<string, unknown>;
  endTime: number;
  name: string;
  parentId?: string;
  spanId: string;
  startTime: number;
}

export interface TraceV1 {
  spans: Array<SpanBase>;
  timestamp: number;
  traceId: string;
  version: '1';
}

export interface SpanV2 extends SpanBase {
  llm?: {
    input: unknown;
    model: string;
    output: unknown;
    provider: string;
  };
}

export interface TraceV2 {
  metadata?: Record<string, unknown>;
  spans: Array<SpanV2>;
  timestamp: number;
  traceId: string;
  version: '2';
}

export type UseTraceResult = ReturnType<typeof useTrace<TraceV1 | TraceV2>>;
