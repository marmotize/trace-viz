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

  detect(trace: RawTrace): Version {
    try {
      const result = this.expression.evaluate(trace);

      if (result !== null && result !== undefined) {
        if (typeof result === 'string') {
          return result;
        }
        if (typeof result === 'number') {
          return String(result);
        }
      }

      if (this.config.fallback) {
        return this.config.fallback;
      }

      throw new Error(
        `Version detection failed. Expression "${this.config.expression}" ` +
          `returned: ${JSON.stringify(result)}`,
      );
    } catch (error) {
      if (this.config.fallback) {
        return this.config.fallback;
      }
      throw error;
    }
  }
}
