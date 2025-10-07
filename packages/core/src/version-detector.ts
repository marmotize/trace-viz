import jsonata from 'jsonata';
import type { RawTrace, Version, VersionDetector } from './types.js';

export interface JSONataVersionDetectorConfig {
  /**
   * JSONATA expression to extract version from trace
   *
   * Examples:
   * - Simple: 'version'
   * - Nested: 'metadata.schemaVersion'
   * - Array: 'spans[0].version'
   * - Conditional: 'version ? version : "1.0"'
   * - Complex: 'metadata.version ? metadata.version : spans[0].schemaVersion'
   */
  expression: string;

  /**
   * Fallback version if expression returns null/undefined
   */
  fallback?: Version;

  /**
   * Optional callback invoked whenever version detection fails but a fallback is used.
   * Useful for surfacing otherwise-silent errors when a fallback is configured.
   */
  onError?: (error: Error, context: JSONataVersionDetectorErrorContext) => void;
}

export interface JSONataVersionDetectorErrorContext {
  expression: string;
  fallback?: Version;
  result?: unknown;
  trace: RawTrace;
}

export class JSONataVersionDetector implements VersionDetector {
  private expression: jsonata.Expression;

  constructor(private config: JSONataVersionDetectorConfig) {
    try {
      this.expression = jsonata(config.expression);
    } catch (error) {
      throw new Error(
        `Invalid JSONATA expression: ${config.expression}. ` +
          `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async detect(trace: RawTrace): Promise<Version> {
    try {
      const result = await this.expression.evaluate(trace);

      if (result !== null && result !== undefined) {
        if (typeof result === 'string') {
          return result;
        }
        if (typeof result === 'number') {
          return String(result);
        }
      }

      if (this.config.fallback) {
        this.notifyFailure(
          new Error(
            `Version detection returned null or undefined for expression "${this.config.expression}".`,
          ),
          trace,
          result,
        );
        return this.config.fallback;
      }

      throw new Error(
        `Version detection failed. Expression "${this.config.expression}" ` +
          `returned: ${JSON.stringify(result)}`,
      );
    } catch (error) {
      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      if (this.config.fallback) {
        this.notifyFailure(normalizedError, trace);
        return this.config.fallback;
      }
      throw normalizedError;
    }
  }

  private notifyFailure(error: Error, trace: RawTrace, result?: unknown): void {
    if (!this.config.onError) {
      return;
    }

    this.config.onError(error, {
      expression: this.config.expression,
      fallback: this.config.fallback,
      result,
      trace,
    });
  }
}
