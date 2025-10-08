import type {
  OrchestratorConfig,
  OrchestratorState,
  ProcessOptions,
  RegisterVisualizerOptions,
  SetDefaultVisualizerOptions,
  StateSubscriber,
  Version,
  VisualizerComponent,
} from './types.js';
import { VisualizerRegistry } from './visualizer-registry.js';

export class TraceOrchestrator<T = unknown> {
  private subscribers = new Set<StateSubscriber<T>>();
  private state: OrchestratorState<T>;
  private registry: VisualizerRegistry;
  private operationId = 0;

  constructor(private config: OrchestratorConfig<T>) {
    this.state = {
      error: null,
      rawTrace: null,
      status: 'idle',
      trace: null,
      version: null,
      visualizer: null,
    };
    this.registry = new VisualizerRegistry();
  }

  /**
   * Subscribe to state changes
   * Returns unsubscribe function
   */
  subscribe(callback: StateSubscriber<T>): () => void {
    this.subscribers.add(callback);
    callback(this.state); // Immediate notification
    return () => this.subscribers.delete(callback);
  }

  /**
   * Get current state snapshot
   */
  getState(): OrchestratorState<T> {
    return { ...this.state };
  }

  /**
   * Register visualizer for a version
   */
  registerVisualizer(options: RegisterVisualizerOptions): this {
    this.registry.register(options);
    return this;
  }

  /**
   * Register multiple visualizers
   */
  registerVisualizers(mapping: Record<string, VisualizerComponent>): this {
    this.registry.registerMany(mapping);
    return this;
  }

  /**
   * Register a batch of visualizers with explicit options per entry.
   */
  registerVisualizerBatch(entries: Array<RegisterVisualizerOptions>): this {
    entries.forEach((entry) => this.registry.register(entry));
    return this;
  }

  /**
   * Set default visualizer
   */
  setDefaultVisualizer(options: SetDefaultVisualizerOptions): this {
    this.registry.setDefault(options);
    return this;
  }

  /**
   * Clear all registered visualizers
   */
  clearVisualizers(): this {
    this.registry = new VisualizerRegistry();
    return this;
  }

  /**
   * List the versions that have visualizers explicitly registered.
   */
  getRegisteredVersions(): Array<Version> {
    return this.registry.getRegisteredVersions();
  }

  /**
   * Check if a visualizer is available (including defaults/semantic matches).
   */
  hasVisualizer(version: Version): boolean {
    return this.registry.has(version);
  }

  /**
   * Resolve a visualizer for a given version using the registry's matching rules.
   */
  getVisualizer(version: Version): VisualizerComponent {
    return this.registry.get(version);
  }

  /**
   * Get the current default visualizer if configured.
   */
  getDefaultVisualizer(): VisualizerComponent | undefined {
    return this.registry.getDefaultVisualizer();
  }

  /**
   * Process a raw trace object
   */
  async process(options: ProcessOptions): Promise<OrchestratorState<T>> {
    const { overrideVersion, rawTrace, visualizer: forcedVisualizer } = options;
    const currentOp = ++this.operationId;

    this.updateState({
      error: null,
      rawTrace,
      status: 'processing',
    });

    try {
      // Detect version
      const version =
        overrideVersion ?? (await this.config.versionDetector.detect(rawTrace));

      // Get visualizer
      const visualizer = forcedVisualizer ?? this.registry.get(version);

      // Prepare trace for visualization
      let preparedTrace: unknown = rawTrace;
      if (this.config.preparer) {
        try {
          preparedTrace = await this.config.preparer.prepare(rawTrace, {
            version,
            visualizer,
          });
        } catch (preparerError) {
          const normalizedError =
            preparerError instanceof Error
              ? preparerError
              : new Error(String(preparerError));

          this.config.preparer.onError?.(normalizedError, {
            trace: rawTrace,
            version,
            visualizer,
          });
          throw normalizedError;
        }
      }

      if (currentOp !== this.operationId) {
        return this.getState();
      }

      this.updateState({
        error: null,
        status: 'success',
        trace: preparedTrace as T,
        version,
        visualizer,
      });
      return this.getState();
    } catch (error) {
      if (currentOp !== this.operationId) {
        return this.getState();
      }

      const normalizedError =
        error instanceof Error ? error : new Error(String(error));
      this.updateState({
        error: normalizedError,
        status: 'error',
      });
      return this.getState();
    }
  }

  /**
   * Reset to idle state
   */
  reset(): void {
    this.updateState({
      error: null,
      rawTrace: null,
      status: 'idle',
      trace: null,
      version: null,
      visualizer: null,
    });
  }

  private updateState(
    updates: Partial<OrchestratorState<T>>,
  ): OrchestratorState<T> {
    this.state = { ...this.state, ...updates };
    this.subscribers.forEach((callback) => callback(this.state));
    return this.state;
  }
}
