import { describe, expect, it, vi } from 'vitest';
import { TraceOrchestrator } from '../orchestrator.js';
import type { RawTrace, VisualizerComponent } from '../types.js';
import { JSONataVersionDetector } from '../version-detector.js';
import { VisualizerRegistry } from '../visualizer-registry.js';

const mockComponent: VisualizerComponent = () => null;
const mockVisualizer: VisualizerComponent = () => null;

describe('VisualizerRegistry', () => {
  it('respects the replace flag when registering visualizers', () => {
    const registry = new VisualizerRegistry();

    registry.register({ component: mockComponent, version: '1' });

    expect(() =>
      registry.register({
        component: mockComponent,
        replace: false,
        version: '1',
      }),
    ).toThrowError(/already registered/);
  });
});

describe('TraceOrchestrator', () => {
  it('returns the latest state from process and preserves last success on failure', async () => {
    const orchestrator = new TraceOrchestrator<RawTrace>({
      preparer: {
        prepare: (trace: RawTrace) => {
          if ((trace as Record<string, unknown>).fail) {
            throw new Error('preparer failed');
          }
          return { ...trace, prepared: true };
        },
      },
      versionDetector: {
        detect: vi.fn(async () => '1'),
      },
    });
    orchestrator.registerVisualizer({
      component: mockVisualizer,
      version: '1',
    });

    const successState = await orchestrator.process({ rawTrace: { id: 1 } });
    expect(successState.status).toBe('success');
    expect(successState.trace).toEqual({ id: 1, prepared: true });
    expect(successState.visualizer).toBe(mockVisualizer);

    const errorState = await orchestrator.process({
      rawTrace: { fail: true },
    });
    expect(errorState.status).toBe('error');
    expect(errorState.error?.message).toContain('preparer failed');
    expect(errorState.trace).toEqual(successState.trace);
    expect(errorState.visualizer).toBe(successState.visualizer);

    expect(orchestrator.getRegisteredVersions()).toEqual(['1']);
    expect(orchestrator.hasVisualizer('1')).toBe(true);
    expect(orchestrator.hasVisualizer('2')).toBe(false);
    expect(orchestrator.getVisualizer('1')).toBe(mockVisualizer);

    orchestrator.setDefaultVisualizer({ component: mockVisualizer });
    expect(orchestrator.getDefaultVisualizer()).toBe(mockVisualizer);
    expect(orchestrator.hasVisualizer('2')).toBe(true);
  });
});

describe('JSONataVersionDetector', () => {
  it('invokes onError when evaluation returns nullish but fallback is used', async () => {
    const onError = vi.fn();
    const detector = new JSONataVersionDetector({
      expression: 'metadata.version',
      fallback: '1',
      onError,
    });

    const version = await detector.detect({ metadata: {} });
    expect(version).toBe('1');
    expect(onError).toHaveBeenCalledTimes(1);

    const [error, context] = onError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(context.expression).toBe('metadata.version');
    expect(context.fallback).toBe('1');
    expect(context.result).toBeUndefined();
    expect(context.trace).toEqual({ metadata: {} });
  });

  it('invokes onError when evaluation throws but fallback is configured', async () => {
    const onError = vi.fn();
    const detector = new JSONataVersionDetector({
      expression: 'error("unexpected")',
      fallback: '1',
      onError,
    });

    const version = await detector.detect({});
    expect(version).toBe('1');
    expect(onError).toHaveBeenCalledTimes(1);

    const [error, context] = onError.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBeTruthy();
    expect(context.expression).toBe('error("unexpected")');
    expect(context.fallback).toBe('1');
  });
});
