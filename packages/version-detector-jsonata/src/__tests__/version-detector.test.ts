import { describe, expect, it, vi } from 'vitest';
import { JSONataVersionDetector } from '../index.js';

describe('JSONataVersionDetector', () => {
  describe('happy path', () => {
    it('detects version from simple property', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'version',
      });

      const version = await detector.detect({ version: '1.0.0' });

      expect(version).toBe('1.0.0');
    });

    it('detects version from nested property', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'metadata.schemaVersion',
      });

      const version = await detector.detect({
        metadata: { schemaVersion: '2.0.0' },
      });

      expect(version).toBe('2.0.0');
    });

    it('detects version from array', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'spans[0].version',
      });

      const version = await detector.detect({
        spans: [{ version: '3.0.0' }],
      });

      expect(version).toBe('3.0.0');
    });

    it('coerces number to string', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'version',
      });

      const version = await detector.detect({ version: 2 });

      expect(version).toBe('2');
    });

    it('does not call onError on success', async () => {
      const onError = vi.fn();
      const detector = new JSONataVersionDetector({
        expression: 'version',
        onError,
      });

      await detector.detect({ version: '1.0.0' });

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('fallback behavior', () => {
    it('uses fallback when result is undefined', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'metadata.version',
        fallback: '1.0.0',
      });

      const version = await detector.detect({ metadata: {} });

      expect(version).toBe('1.0.0');
    });

    it('uses fallback when result is null', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'version',
        fallback: '1.0.0',
      });

      const version = await detector.detect({ version: null });

      expect(version).toBe('1.0.0');
    });

    it('uses fallback when result is non-string/non-number', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'version',
        fallback: '1.0.0',
      });

      const version = await detector.detect({ version: { complex: 'object' } });

      expect(version).toBe('1.0.0');
    });

    it('throws when no fallback and result is nullish', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'metadata.version',
      });

      await expect(() => detector.detect({ metadata: {} })).rejects.toThrow(
        /Version detection failed/,
      );
    });

    it('throws when no fallback and result is invalid type', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'version',
      });

      await expect(() => detector.detect({ version: {} })).rejects.toThrow(
        /Version detection failed/,
      );
    });
  });

  describe('error handling', () => {
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
      expect(error.message).toContain('returned null or undefined');
      expect(context.expression).toBe('metadata.version');
      expect(context.fallback).toBe('1');
      expect(context.result).toBeUndefined();
      expect(context.trace).toEqual({ metadata: {} });
    });

    it('invokes onError when evaluation throws but fallback is configured', async () => {
      const onError = vi.fn();
      const detector = new JSONataVersionDetector({
        expression: '$error("test error")',
        fallback: '1',
        onError,
      });

      const version = await detector.detect({});

      expect(version).toBe('1');
      expect(onError).toHaveBeenCalledTimes(1);

      const [error, context] = onError.mock.calls[0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBeTruthy();
      expect(context.expression).toBe('$error("test error")');
      expect(context.fallback).toBe('1');
    });

    it('throws when evaluation fails and no fallback', async () => {
      const detector = new JSONataVersionDetector({
        expression: '$error("test error")',
      });

      await expect(() => detector.detect({})).rejects.toThrow();
    });

    it('does not invoke onError when fallback is not configured', async () => {
      const onError = vi.fn();
      const detector = new JSONataVersionDetector({
        expression: 'missingProperty',
        onError,
      });

      await expect(() => detector.detect({})).rejects.toThrow();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('expression validation', () => {
    it('throws on invalid expression syntax', () => {
      expect(() => {
        new JSONataVersionDetector({
          expression: 'invalid[[syntax',
        });
      }).toThrow(/Invalid JSONATA expression/);
    });

    it('includes original expression in error message', () => {
      expect(() => {
        new JSONataVersionDetector({
          expression: 'bad[[expression',
        });
      }).toThrow(/bad\[\[expression/);
    });
  });

  describe('edge cases', () => {
    it('handles missing nested properties', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'a.b.c.d.e',
        fallback: 'default',
      });

      const version = await detector.detect({});

      expect(version).toBe('default');
    });

    it('handles empty trace object', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'version',
        fallback: 'default',
      });

      const version = await detector.detect({});

      expect(version).toBe('default');
    });

    it('handles complex JSONata expressions', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'version ? version : spans[0].schemaVersion',
      });

      const version = await detector.detect({
        spans: [{ schemaVersion: '2.0.0' }],
      });

      expect(version).toBe('2.0.0');
    });

    it('handles conditional expressions with fallback', async () => {
      const detector = new JSONataVersionDetector({
        expression: 'metadata.version ? metadata.version : "inline-fallback"',
      });

      const version = await detector.detect({ metadata: {} });

      expect(version).toBe('inline-fallback');
    });
  });
});
