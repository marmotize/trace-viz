import { describe, expect, it, vi } from 'vitest';
import { TraceOrchestrator } from '../orchestrator.js';
import type { RawTrace, VisualizerComponent } from '../types.js';

const mockVisualizer: VisualizerComponent = () => null;
const mockVisualizer2: VisualizerComponent = () => null;

describe('TraceOrchestrator', () => {
  describe('basic processing', () => {
    it('processes trace successfully and returns success state', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        preparer: {
          prepare: (trace: RawTrace) => ({ ...trace, prepared: true }),
        },
        versionDetector: {
          detect: vi.fn(async () => '1'),
        },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      const state = await orchestrator.process({ rawTrace: { id: 1 } });

      expect(state.status).toBe('success');
      expect(state.trace).toEqual({ id: 1, prepared: true });
      expect(state.visualizer).toBe(mockVisualizer);
      expect(state.version).toBe('1');
      expect(state.error).toBeNull();
    });

    it('processes trace without preparer', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        versionDetector: {
          detect: vi.fn(async () => '1'),
        },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      const state = await orchestrator.process({ rawTrace: { id: 1 } });

      expect(state.status).toBe('success');
      expect(state.trace).toEqual({ id: 1 });
    });

    it('uses overrideVersion when provided', async () => {
      const detectMock = vi.fn(async () => '1');
      const orchestrator = new TraceOrchestrator<RawTrace>({
        versionDetector: { detect: detectMock },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '2',
      });

      const state = await orchestrator.process({
        overrideVersion: '2',
        rawTrace: {},
      });

      expect(state.version).toBe('2');
      expect(detectMock).not.toHaveBeenCalled();
    });

    it('uses forced visualizer when provided', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      const state = await orchestrator.process({
        rawTrace: {},
        visualizer: mockVisualizer2,
      });

      expect(state.visualizer).toBe(mockVisualizer2);
    });
  });

  describe('error handling', () => {
    it('preserves last success state on error', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        preparer: {
          prepare: (trace: RawTrace) => {
            if ((trace as Record<string, unknown>).fail) {
              throw new Error('preparer failed');
            }
            return { ...trace, prepared: true };
          },
        },
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      const successState = await orchestrator.process({ rawTrace: { id: 1 } });
      const errorState = await orchestrator.process({
        rawTrace: { fail: true },
      });

      expect(errorState.status).toBe('error');
      expect(errorState.error?.message).toContain('preparer failed');
      expect(errorState.trace).toEqual(successState.trace);
      expect(errorState.visualizer).toBe(successState.visualizer);
    });

    it('handles version detector errors', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        versionDetector: {
          detect: vi.fn(async () => {
            throw new Error('detection failed');
          }),
        },
      });

      const state = await orchestrator.process({ rawTrace: {} });

      expect(state.status).toBe('error');
      expect(state.error?.message).toContain('detection failed');
    });

    it('handles preparer errors and calls onError callback', async () => {
      const onError = vi.fn();
      const orchestrator = new TraceOrchestrator<RawTrace>({
        preparer: {
          onError,
          prepare: () => {
            throw new Error('prepare error');
          },
        },
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      const state = await orchestrator.process({ rawTrace: {} });

      expect(state.status).toBe('error');
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    });

    it('normalizes non-Error objects thrown by preparer', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        preparer: {
          prepare: () => {
            throw 'string error';
          },
        },
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      const state = await orchestrator.process({ rawTrace: {} });

      expect(state.status).toBe('error');
      expect(state.error).toBeInstanceOf(Error);
    });

    it('falls back to default visualizer when detected version has no registered visualizer', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        versionDetector: { detect: vi.fn(async () => 'unknown') },
      });
      orchestrator.setDefaultVisualizer({ component: mockVisualizer });

      const state = await orchestrator.process({ rawTrace: {} });

      expect(state.status).toBe('success');
      expect(state.visualizer).toBe(mockVisualizer);
    });

    it('errors when no visualizer found and no default set', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        versionDetector: { detect: vi.fn(async () => 'unknown') },
      });

      const state = await orchestrator.process({ rawTrace: {} });

      expect(state.status).toBe('error');
      expect(state.error?.message).toContain('No visualizer registered');
    });
  });

  describe('concurrency', () => {
    it('returns the latest state when multiple process calls are in flight', async () => {
      let resolveFirst: () => void;
      let resolveSecond: () => void;

      const firstPromise = new Promise<string>((resolve) => {
        resolveFirst = () => resolve('1');
      });
      const secondPromise = new Promise<string>((resolve) => {
        resolveSecond = () => resolve('2');
      });

      let callCount = 0;
      const orchestrator = new TraceOrchestrator<RawTrace>({
        versionDetector: {
          detect: vi.fn(async () => {
            callCount++;
            return callCount === 1 ? firstPromise : secondPromise;
          }),
        },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer2,
        version: '2',
      });

      const firstCall = orchestrator.process({ rawTrace: { id: 1 } });
      const secondCall = orchestrator.process({ rawTrace: { id: 2 } });

      resolveSecond!();
      await secondCall;

      resolveFirst!();
      await firstCall;

      const finalState = orchestrator.getState();
      expect(finalState.visualizer).toBe(mockVisualizer2);
      expect(finalState.version).toBe('2');
    });
  });

  describe('preparer with async', () => {
    it('handles async preparer returning Promise', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        preparer: {
          prepare: async (trace: RawTrace) => {
            await new Promise((resolve) => setTimeout(resolve, 1));
            return { ...trace, async: true };
          },
        },
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      const state = await orchestrator.process({ rawTrace: { id: 1 } });

      expect(state.trace).toEqual({ async: true, id: 1 });
    });

    it('uses returned trace from preparer (not mutated input)', async () => {
      const inputTrace = { id: 1 };
      const orchestrator = new TraceOrchestrator<RawTrace>({
        preparer: {
          prepare: () => ({ id: 2 }),
        },
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      const state = await orchestrator.process({ rawTrace: inputTrace });

      expect(state.trace).toEqual({ id: 2 });
      expect(inputTrace).toEqual({ id: 1 });
    });
  });

  describe('registry methods', () => {
    it('getRegisteredVersions returns all registered versions', () => {
      const orchestrator = new TraceOrchestrator({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer2,
        version: '2',
      });

      expect(orchestrator.getRegisteredVersions()).toEqual(['1', '2']);
    });

    it('hasVisualizer checks for version availability', () => {
      const orchestrator = new TraceOrchestrator({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      expect(orchestrator.hasVisualizer('1')).toBe(true);
      expect(orchestrator.hasVisualizer('2')).toBe(false);
    });

    it('hasVisualizer returns true for any version after setting default', () => {
      const orchestrator = new TraceOrchestrator({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.setDefaultVisualizer({ component: mockVisualizer });

      expect(orchestrator.hasVisualizer('any-version')).toBe(true);
    });

    it('getVisualizer resolves visualizer for version', () => {
      const orchestrator = new TraceOrchestrator({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      expect(orchestrator.getVisualizer('1')).toBe(mockVisualizer);
    });

    it('getDefaultVisualizer returns the default visualizer', () => {
      const orchestrator = new TraceOrchestrator({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.setDefaultVisualizer({ component: mockVisualizer });

      expect(orchestrator.getDefaultVisualizer()).toBe(mockVisualizer);
    });

    it('registerVisualizers registers multiple at once', () => {
      const orchestrator = new TraceOrchestrator({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizers({
        '1': mockVisualizer,
        '2': mockVisualizer2,
      });

      expect(orchestrator.hasVisualizer('1')).toBe(true);
      expect(orchestrator.hasVisualizer('2')).toBe(true);
    });

    it('registerVisualizerBatch registers array of visualizers', () => {
      const orchestrator = new TraceOrchestrator({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizerBatch([
        { component: mockVisualizer, version: '1' },
        { component: mockVisualizer2, version: '2' },
      ]);

      expect(orchestrator.hasVisualizer('1')).toBe(true);
      expect(orchestrator.hasVisualizer('2')).toBe(true);
    });

    it('clearVisualizers removes all registered visualizers', () => {
      const orchestrator = new TraceOrchestrator({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });
      orchestrator.clearVisualizers();

      expect(orchestrator.getRegisteredVersions()).toEqual([]);
    });
  });

  describe('state management', () => {
    it('getState returns current state snapshot', () => {
      const orchestrator = new TraceOrchestrator({
        versionDetector: { detect: vi.fn(async () => '1') },
      });

      const state = orchestrator.getState();

      expect(state.status).toBe('idle');
      expect(state.trace).toBeNull();
    });

    it('subscribe notifies on state changes', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      const subscriber = vi.fn();
      orchestrator.subscribe(subscriber);

      expect(subscriber).toHaveBeenCalledTimes(1);

      await orchestrator.process({ rawTrace: {} });

      expect(subscriber).toHaveBeenCalledTimes(3);
    });

    it('subscribe returns unsubscribe function', () => {
      const orchestrator = new TraceOrchestrator({
        versionDetector: { detect: vi.fn(async () => '1') },
      });

      const subscriber = vi.fn();
      const unsubscribe = orchestrator.subscribe(subscriber);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('reset returns to idle state', async () => {
      const orchestrator = new TraceOrchestrator<RawTrace>({
        versionDetector: { detect: vi.fn(async () => '1') },
      });
      orchestrator.registerVisualizer({
        component: mockVisualizer,
        version: '1',
      });

      await orchestrator.process({ rawTrace: {} });
      orchestrator.reset();

      const state = orchestrator.getState();
      expect(state.status).toBe('idle');
      expect(state.trace).toBeNull();
      expect(state.visualizer).toBeNull();
    });
  });
});
