import type {
  RegisterVisualizerOptions,
  SetDefaultVisualizerOptions,
  Version,
  VisualizerComponent,
} from './types.js';

export class VisualizerRegistry {
  private visualizers = new Map<Version, VisualizerComponent>();
  private defaultVisualizer?: VisualizerComponent;

  /**
   * Register a visualizer for a specific version
   */
  register(options: RegisterVisualizerOptions): this {
    const { component, replace = true, version } = options;

    const hasExactMatch = this.visualizers.has(version);
    if (hasExactMatch && replace === false) {
      throw new Error(
        `Visualizer for version "${version}" already registered. Pass "replace: true" to overwrite.`,
      );
    }

    this.visualizers.set(version, component);
    return this;
  }

  /**
   * Register multiple visualizers at once
   */
  registerMany(mapping: Record<Version, VisualizerComponent>): this {
    Object.entries(mapping).forEach(([version, component]) => {
      this.register({ component, version });
    });
    return this;
  }

  /**
   * Set default visualizer fallback
   */
  setDefault(options: SetDefaultVisualizerOptions): this {
    const { component } = options;
    this.defaultVisualizer = component;
    return this;
  }

  /**
   * Get visualizer for a version with semantic version matching
   */
  get(version: Version): VisualizerComponent {
    // Exact match
    const exact = this.visualizers.get(version);
    if (exact) {
      return exact;
    }

    // Try semantic version partial match (major.minor)
    const semverMatch = this.trySemanticMatch(version);
    if (semverMatch) {
      return semverMatch;
    }

    // Fallback to default
    if (this.defaultVisualizer) {
      return this.defaultVisualizer;
    }

    throw new Error(
      `No visualizer registered for version "${version}" and no default visualizer set. ` +
        `Available versions: ${Array.from(this.visualizers.keys()).join(', ')}`,
    );
  }

  /**
   * Check if a visualizer exists for a version
   */
  has(version: Version): boolean {
    return (
      this.visualizers.has(version) ||
      this.trySemanticMatch(version) !== null ||
      this.defaultVisualizer !== undefined
    );
  }

  /**
   * Get all registered versions
   */
  getVersions(): Array<Version> {
    return this.getRegisteredVersions();
  }

  /**
   * Get all registered versions (exact keys only)
   */
  getRegisteredVersions(): Array<Version> {
    return Array.from(this.visualizers.keys());
  }

  /**
   * Get the configured default visualizer, if any.
   */
  getDefaultVisualizer(): VisualizerComponent | undefined {
    return this.defaultVisualizer;
  }

  private trySemanticMatch(version: Version): VisualizerComponent | null {
    const parts = version.split('.');
    if (parts.length < 2) {
      return null;
    }

    // Try major.minor match
    const majorMinor = `${parts[0]}.${parts[1]}`;
    const match = this.visualizers.get(majorMinor);
    if (match) {
      return match;
    }

    // Try major-only match
    const major = parts[0];
    return this.visualizers.get(major) ?? null;
  }
}
