import jsonata from 'jsonata';
import type { RawTrace, Transformer, Version } from './types.js';

export interface JSONataTransformerConfig {
  /**
   * JSONata expression that transforms the trace into the desired structure.
   */
  expression: string;

  /**
   * Optional list of versions that this transformer supports. When omitted the
   * expression will be applied to any version.
   */
  versions?: Array<Version>;
}

export class JSONataTransformer implements Transformer {
  private expression: jsonata.Expression;
  private versions?: Set<Version>;

  constructor(private config: JSONataTransformerConfig) {
    try {
      this.expression = jsonata(config.expression);
    } catch (error) {
      throw new Error(
        `Invalid JSONata expression: ${config.expression}. ` +
          `Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    if (config.versions && config.versions.length > 0) {
      this.versions = new Set(config.versions);
    }
  }

  canTransform(fromVersion: Version): boolean {
    if (!this.versions) {
      return true;
    }

    return this.versions.has(fromVersion);
  }

  async transform(trace: RawTrace): Promise<unknown> {
    try {
      return await this.expression.evaluate(trace);
    } catch (error) {
      throw new Error(
        `JSONata transformation failed for expression "${this.config.expression}": ` +
          `${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
