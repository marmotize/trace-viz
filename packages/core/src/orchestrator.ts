import type {
  OrchestratorConfig,
  OrchestratorState,
  ProcessOptions,
  RegisterVisualizerOptions,
  SetDefaultVisualizerOptions,
  StateSubscriber,
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
   * Set default visualizer
   */
  setDefaultVisualizer(options: SetDefaultVisualizerOptions): this {
    this.registry.setDefault(options);
    return this;
  }

  /**
   * Process a raw trace object
   */
  async process(options: ProcessOptions): Promise<void> {
    const {
      abortSignal,
      overrideVersion,
      rawTrace,
      visualizer: forcedVisualizer,
    } = options;
    const currentOp = ++this.operationId;

    if (abortSignal?.aborted) {
      return;
    }
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const onAbort = () => {
      // Incrementing operationId ensures in-flight work is ignored
      this.operationId++;
    };
    abortSignal?.addEventListener('abort', onAbort, { once: true });

    this.updateState({
      error: null,
      rawTrace,
      status: 'processing',
    });

    try {
      // Detect version
      const version =
        overrideVersion ?? this.config.versionDetector.detect(rawTrace);

      // Get visualizer
      const visualizer = forcedVisualizer ?? this.registry.get(version);

      // Prepare trace for visualization
      let preparedTrace: unknown = rawTrace;
      if (this.config.preparer) {
        preparedTrace = await this.config.preparer.prepare(rawTrace, {
          version,
          visualizer,
        });
      }

      if (currentOp !== this.operationId || abortSignal?.aborted) {
        return;
      }

      this.updateState({
        error: null,
        status: 'success',
        trace: preparedTrace as T,
        version,
        visualizer,
      });
    } catch (error) {
      if (currentOp !== this.operationId || abortSignal?.aborted) {
        return;
      }

      this.updateState({
        error: error instanceof Error ? error : new Error(String(error)),
        status: 'error',
        trace: null,
        visualizer: null,
      });
    } finally {
      abortSignal?.removeEventListener('abort', onAbort);
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

  private updateState(updates: Partial<OrchestratorState<T>>): void {
    this.state = { ...this.state, ...updates };
    this.subscribers.forEach((callback) => callback(this.state));
  }
}
