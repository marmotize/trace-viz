// Test preset traces for e2e testing

export const sampleTraceV1 = {
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
  timestamp: 1_000_000,
  traceId: 'trace-001',
  version: '1',
};

export const sampleTraceV2 = {
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
  timestamp: 1_000_000,
  traceId: 'trace-002',
  version: '2',
};

export const traceV2_1_3 = {
  metadata: {
    environment: 'staging',
    user: 'test-user',
  },
  spans: [
    {
      endTime: 3000,
      llm: {
        input: { prompt: 'v2.1.3 test' },
        model: 'gpt-4',
        output: { response: 'Success!' },
        provider: 'openai',
      },
      name: 'V2.1.3 LLM Call',
      spanId: 'span-1',
      startTime: 2000,
    },
  ],
  timestamp: 1_000_000,
  traceId: 'trace-v2.1.3',
  version: '2.1.3',
};

export const traceV2_9_0 = {
  metadata: {
    environment: 'development',
    user: 'test-user',
  },
  spans: [
    {
      endTime: 3500,
      llm: {
        input: { prompt: 'v2.9.0 test' },
        model: 'gpt-4',
        output: { response: 'Success!' },
        provider: 'openai',
      },
      name: 'V2.9.0 LLM Call',
      spanId: 'span-1',
      startTime: 2500,
    },
  ],
  timestamp: 1_000_000,
  traceId: 'trace-v2.9.0',
  version: '2.9.0',
};

export const traceNoVersion = {
  spans: [
    {
      endTime: 1500,
      name: 'No Version Operation',
      spanId: 'span-1',
      startTime: 1000,
    },
  ],
  timestamp: 1_000_000,
  traceId: 'trace-no-version',
};

export const invalidV2Trace = {
  spans: [
    {
      // Missing required fields: name, spanId, startTime, endTime
      someBadField: 'invalid',
    },
  ],
  timestamp: 1_000_000,
  traceId: 'trace-invalid-v2',
  version: '2',
};
