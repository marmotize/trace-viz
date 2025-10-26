import type { TracePreparer } from '@trace-viz/react';

export const immediatePreparer = <T>(): TracePreparer<T> => ({
  prepare: (raw) => raw as unknown as T,
});

export const delayedPreparer = <T>(ms: number): TracePreparer<T> => ({
  prepare: async (raw) => {
    await new Promise((resolve) => setTimeout(resolve, ms));
    return raw as unknown as T;
  },
});

export const throwingPreparer = <T>(
  message = 'preparer failed',
): TracePreparer<T> => ({
  prepare: async () => {
    throw new Error(message);
  },
});

export const normalizingPreparer = <T>(): TracePreparer<T> => ({
  prepare: (raw) => {
    const version = String((raw as { version?: string })?.version ?? '1');
    const normalizedVersion = version.startsWith('2') ? '2' : '1';
    return { ...raw, version: normalizedVersion } as unknown as T;
  },
});
