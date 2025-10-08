import { describe, expect, it } from 'vitest';
import type { VisualizerComponent } from '../types.js';
import { VisualizerRegistry } from '../visualizer-registry.js';

const mockComponent: VisualizerComponent = () => null;
const mockComponent2: VisualizerComponent = () => null;

describe('VisualizerRegistry', () => {
  describe('register', () => {
    it('registers a visualizer for a specific version', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.0.0' });

      expect(registry.has('1.0.0')).toBe(true);
      expect(registry.get('1.0.0')).toBe(mockComponent);
    });

    it('replaces visualizer when replace is true (default)', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.0.0' });
      registry.register({
        component: mockComponent2,
        replace: true,
        version: '1.0.0',
      });

      expect(registry.get('1.0.0')).toBe(mockComponent2);
    });

    it('throws when replace is false and visualizer exists', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.0.0' });

      expect(() =>
        registry.register({
          component: mockComponent2,
          replace: false,
          version: '1.0.0',
        }),
      ).toThrow(/already registered/);
    });

    it('allows registering when replace is false and visualizer does not exist', () => {
      const registry = new VisualizerRegistry();
      expect(() =>
        registry.register({
          component: mockComponent,
          replace: false,
          version: '1.0.0',
        }),
      ).not.toThrow();
    });

    it('returns this for chaining', () => {
      const registry = new VisualizerRegistry();
      const result = registry.register({
        component: mockComponent,
        version: '1.0.0',
      });

      expect(result).toBe(registry);
    });
  });

  describe('registerMany', () => {
    it('registers multiple visualizers at once', () => {
      const registry = new VisualizerRegistry();
      registry.registerMany({
        '1.0.0': mockComponent,
        '2.0.0': mockComponent2,
      });

      expect(registry.has('1.0.0')).toBe(true);
      expect(registry.has('2.0.0')).toBe(true);
    });

    it('returns this for chaining', () => {
      const registry = new VisualizerRegistry();
      const result = registry.registerMany({ '1.0.0': mockComponent });

      expect(result).toBe(registry);
    });
  });

  describe('setDefault', () => {
    it('sets a default visualizer', () => {
      const registry = new VisualizerRegistry();
      registry.setDefault({ component: mockComponent });

      expect(registry.getDefaultVisualizer()).toBe(mockComponent);
    });

    it('replaces previous default visualizer', () => {
      const registry = new VisualizerRegistry();
      registry.setDefault({ component: mockComponent });
      registry.setDefault({ component: mockComponent2 });

      expect(registry.getDefaultVisualizer()).toBe(mockComponent2);
    });

    it('returns this for chaining', () => {
      const registry = new VisualizerRegistry();
      const result = registry.setDefault({ component: mockComponent });

      expect(result).toBe(registry);
    });
  });

  describe('get', () => {
    it('returns exact match when available', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.2.3' });

      expect(registry.get('1.2.3')).toBe(mockComponent);
    });

    it('returns semantic major.minor match', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.2' });

      expect(registry.get('1.2.3')).toBe(mockComponent);
    });

    it('returns semantic major-only match', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1' });

      expect(registry.get('1.2.3')).toBe(mockComponent);
    });

    it('prefers exact match over semantic match', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1' });
      registry.register({ component: mockComponent2, version: '1.2.3' });

      expect(registry.get('1.2.3')).toBe(mockComponent2);
    });

    it('falls back to default visualizer when no match found', () => {
      const registry = new VisualizerRegistry();
      registry.setDefault({ component: mockComponent });

      expect(registry.get('unknown-version')).toBe(mockComponent);
    });

    it('throws when no match and no default visualizer', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.0.0' });

      expect(() => registry.get('2.0.0')).toThrow(
        /No visualizer registered for version/,
      );
      expect(() => registry.get('2.0.0')).toThrow(/Available versions: 1.0.0/);
    });
  });

  describe('has', () => {
    it('returns true for exact match', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.2.3' });

      expect(registry.has('1.2.3')).toBe(true);
    });

    it('returns true for semantic match', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.2' });

      expect(registry.has('1.2.3')).toBe(true);
    });

    it('returns true when default visualizer is set', () => {
      const registry = new VisualizerRegistry();
      registry.setDefault({ component: mockComponent });

      expect(registry.has('any-version')).toBe(true);
    });

    it('returns false when no match and no default', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.0.0' });

      expect(registry.has('2.0.0')).toBe(false);
    });
  });

  describe('getVersions', () => {
    it('returns all registered version keys', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.0.0' });
      registry.register({ component: mockComponent2, version: '2.0.0' });

      const versions = registry.getVersions();
      expect(versions).toEqual(['1.0.0', '2.0.0']);
    });

    it('returns empty array when no versions registered', () => {
      const registry = new VisualizerRegistry();

      expect(registry.getVersions()).toEqual([]);
    });

    it('returns a new array (not mutable view)', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.0.0' });

      const versions1 = registry.getVersions();
      versions1.push('2.0.0');

      const versions2 = registry.getVersions();
      expect(versions2).toEqual(['1.0.0']);
    });
  });

  describe('getRegisteredVersions', () => {
    it('returns all registered version keys', () => {
      const registry = new VisualizerRegistry();
      registry.register({ component: mockComponent, version: '1.0.0' });
      registry.register({ component: mockComponent2, version: '2.0.0' });

      const versions = registry.getRegisteredVersions();
      expect(versions).toEqual(['1.0.0', '2.0.0']);
    });
  });

  describe('getDefaultVisualizer', () => {
    it('returns undefined when no default set', () => {
      const registry = new VisualizerRegistry();

      expect(registry.getDefaultVisualizer()).toBeUndefined();
    });

    it('returns the default visualizer when set', () => {
      const registry = new VisualizerRegistry();
      registry.setDefault({ component: mockComponent });

      expect(registry.getDefaultVisualizer()).toBe(mockComponent);
    });
  });
});
