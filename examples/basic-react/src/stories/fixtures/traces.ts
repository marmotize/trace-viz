export const sampleTraceV1 = {
  spans: [
    {
      endTime: 1250,
      name: 'HTTP GET /api/users',
      spanId: 'span-1',
      startTime: 1000,
    },
    {
      endTime: 1150,
      name: 'Database Query',
      parentId: 'span-1',
      spanId: 'span-2',
      startTime: 1050,
    },
    {
      endTime: 1230,
      name: 'Serialize Response',
      parentId: 'span-1',
      spanId: 'span-3',
      startTime: 1160,
    },
  ],
  timestamp: 1_704_067_200_000,
  traceId: 'trace-001',
  version: '1',
};

export const sampleTraceV2 = {
  metadata: {
    environment: 'production',
    region: 'us-east-1',
    service: 'chat-api',
  },
  spans: [
    {
      endTime: 3200,
      llm: {
        input: {
          messages: [
            { content: 'You are a helpful assistant.', role: 'system' },
            {
              content: 'Explain quantum computing in simple terms.',
              role: 'user',
            },
          ],
          temperature: 0.7,
        },
        model: 'gpt-4',
        output: {
          completion_tokens: 156,
          response:
            'Quantum computing uses quantum bits that can be both 0 and 1 simultaneously...',
        },
        provider: 'openai',
      },
      name: 'LLM Completion',
      spanId: 'span-1',
      startTime: 1000,
    },
    {
      endTime: 1150,
      name: 'Load User Context',
      parentId: 'span-1',
      spanId: 'span-2',
      startTime: 1000,
    },
    {
      endTime: 3250,
      name: 'Store Conversation',
      parentId: 'span-1',
      spanId: 'span-3',
      startTime: 3200,
    },
  ],
  timestamp: 1_704_067_200_000,
  traceId: 'trace-002',
  version: '2',
};

export const traceV2_1_3 = {
  metadata: {
    environment: 'staging',
    service: 'recommendation-engine',
  },
  spans: [
    {
      endTime: 1800,
      llm: {
        input: {
          context: 'User browsing history',
          query: 'Product recommendations',
        },
        model: 'claude-3-sonnet',
        output: { recommendations: ['Product A', 'Product B', 'Product C'] },
        provider: 'anthropic',
      },
      name: 'Generate Recommendations',
      spanId: 'span-1',
      startTime: 1200,
    },
  ],
  timestamp: 1_704_067_200_000,
  traceId: 'trace-v2.1.3',
  version: '2.1.3',
};

export const traceV2_9_0 = {
  metadata: {
    environment: 'development',
    feature_flag: 'multi-model-support',
  },
  spans: [
    {
      endTime: 2500,
      llm: {
        input: { max_tokens: 100, prompt: 'Summarize this article' },
        model: 'gpt-4-turbo',
        output: { summary: 'The article discusses...' },
        provider: 'openai',
      },
      name: 'Summarization Task',
      spanId: 'span-1',
      startTime: 1500,
    },
  ],
  timestamp: 1_704_067_200_000,
  traceId: 'trace-v2.9.0',
  version: '2.9.0',
};

export const traceNoVersion = {
  spans: [
    {
      endTime: 1500,
      name: 'Legacy Operation',
      spanId: 'span-1',
      startTime: 1000,
    },
  ],
  timestamp: 1_704_067_200_000,
  traceId: 'trace-no-version',
};

export const invalidV2Trace = {
  spans: [
    {
      someBadField: 'invalid',
    },
  ],
  timestamp: 1_704_067_200_000,
  traceId: 'trace-invalid-v2',
  version: '2',
};
