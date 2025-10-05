import { z } from 'zod';

/**
 * Example trace schemas using Zod
 * Users should define their own schemas based on their trace format
 */

// Common span structure
export const SpanBase = z.object({
  attributes: z.record(z.string(), z.unknown()).optional(),
  endTime: z.number(),
  name: z.string(),
  parentId: z.string().optional(),
  spanId: z.string(),
  startTime: z.number(),
});

// Version 1: Basic trace structure
export const TraceV1Schema = z.object({
  spans: z.array(SpanBase),
  timestamp: z.number(),
  traceId: z.string(),
  version: z.literal('1'),
});

// Version 2: Enhanced with LLM-specific fields
export const SpanV2 = SpanBase.extend({
  llm: z
    .object({
      input: z.unknown(),
      model: z.string(),
      output: z.unknown(),
      provider: z.string(),
    })
    .optional(),
});

export const TraceV2Schema = z.object({
  metadata: z.record(z.string(), z.unknown()).optional(),
  spans: z.array(SpanV2),
  timestamp: z.number(),
  traceId: z.string(),
  version: z.literal('2'),
});

// Type inference
export type TraceV1 = z.infer<typeof TraceV1Schema>;
export type TraceV2 = z.infer<typeof TraceV2Schema>;
export type SpanV2 = z.infer<typeof SpanV2>;

// Union type for any version
export const AnyTraceSchema = z.discriminatedUnion('version', [
  TraceV1Schema,
  TraceV2Schema,
]);

export type AnyTrace = z.infer<typeof AnyTraceSchema>;
