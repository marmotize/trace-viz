import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor, within } from '@storybook/test';
import { useTrace } from '@trace-viz/react';
import type { TraceV1, TraceV2 } from '../types';
import {
  invalidV2Trace,
  sampleTraceV1,
  sampleTraceV2,
  traceNoVersion,
  traceV2_1_3,
  traceV2_9_0,
} from './fixtures/traces';
import { HookHarness } from './helpers/HookHarness';
import {
  delayedPreparer,
  immediatePreparer,
  normalizingPreparer,
  throwingPreparer,
} from './helpers/makePreparer';
import { makeDetector } from './helpers/makeVersionDetector';
import { V1Spy, V2Spy } from './helpers/visualizerSpies';

type TraceType = TraceV1 | TraceV2;

const meta: Meta = {
  parameters: {
    layout: 'fullscreen',
  },
  title: 'useTrace Hook',
};

export default meta;
type Story = StoryObj;

export const VisualizerV1HappyPath: Story = {
  name: 'flow-happy-v1',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent(
      'true',
    );
    await expect(canvas.getByTestId('version')).toHaveTextContent('1');
    await expect(canvas.getByTestId('viz-v1')).toBeVisible();
    await expect(canvas.getByTestId('flag-isError')).toHaveTextContent('false');
  },
  render: () => (
    <HookHarness
      config={{
        defaultVisualizer: { component: V1Spy },
        preparer: immediatePreparer<TraceType>(),
        versionDetector: makeDetector(),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
        ],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          state.process({ rawTrace: sampleTraceV1 });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const VisualizerV2HappyPath: Story = {
  name: 'flow-happy-v2',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent(
      'true',
    );
    await expect(canvas.getByTestId('version')).toHaveTextContent('2');
    await expect(canvas.getByTestId('viz-v2')).toBeVisible();
    await expect(canvas.getByTestId('flag-isError')).toHaveTextContent('false');
  },
  render: () => (
    <HookHarness
      config={{
        defaultVisualizer: { component: V1Spy },
        preparer: immediatePreparer<TraceType>(),
        versionDetector: makeDetector(),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
        ],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          state.process({ rawTrace: sampleTraceV2 });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const VersionDetectionFallback: Story = {
  name: 'detect-missing-version-fallback',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent(
      'true',
    );
    await expect(canvas.getByTestId('version')).toHaveTextContent('1');
    await expect(canvas.getByTestId('viz-v1')).toBeVisible();
  },
  render: () => (
    <HookHarness
      config={{
        preparer: normalizingPreparer<TraceType>(),
        versionDetector: makeDetector('version', '1'),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
        ],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          state.process({ rawTrace: traceNoVersion });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const VersionDetectionSemver: Story = {
  name: 'detect-semver-2-1-3',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent(
      'true',
    );
    await expect(canvas.getByTestId('version')).toHaveTextContent('2.1.3');
    await expect(canvas.getByTestId('viz-v2')).toBeVisible();
  },
  render: () => (
    <HookHarness
      config={{
        preparer: normalizingPreparer<TraceType>(),
        versionDetector: makeDetector(),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
          { component: V2Spy, version: '2.1' },
        ],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          if (state.registerVisualizer) {
            state.registerVisualizer({ component: V2Spy, version: '2.1' });
          }
          state.process({ rawTrace: traceV2_1_3 });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const VersionDetectionSemverFallback: Story = {
  name: 'detect-semver-fallback-major',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent(
      'true',
    );
    await expect(canvas.getByTestId('version')).toHaveTextContent('2.9.0');
    await expect(canvas.getByTestId('viz-v2')).toBeVisible();
  },
  render: () => (
    <HookHarness
      config={{
        preparer: normalizingPreparer<TraceType>(),
        versionDetector: makeDetector(),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
        ],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          state.process({ rawTrace: traceV2_9_0 });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const RegistryDefaultVisualizer: Story = {
  name: 'registry-default-used',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent(
      'true',
    );
    await expect(canvas.getByTestId('viz-v1')).toBeVisible();
  },
  render: () => (
    <HookHarness
      config={{
        defaultVisualizer: { component: V1Spy },
        preparer: normalizingPreparer<TraceType>(),
        versionDetector: makeDetector(),
        visualizers: [],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          if (state.clearVisualizers && state.setDefaultVisualizer) {
            state.clearVisualizers();
            state.setDefaultVisualizer({ component: V1Spy });
          }
          state.process({ rawTrace: traceV2_9_0 });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const RegistryNoVisualizerError: Story = {
  name: 'registry-no-visualizer-error',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await expect(canvas.getByTestId('flag-isError')).toHaveTextContent('true');
  },
  render: () => (
    <HookHarness
      config={{
        preparer: normalizingPreparer<TraceType>(),
        versionDetector: makeDetector(),
        visualizers: [],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          if (state.clearVisualizers) {
            state.clearVisualizers();
          }
          state.process({ rawTrace: traceV2_9_0 });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const ProcessingAsyncDelay: Story = {
  name: 'concurrency-sequential',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await waitFor(
      () => {
        expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent('true');
      },
      { timeout: 3000 },
    );
    await expect(canvas.getByTestId('viz-v1')).toBeVisible();
  },
  render: () => (
    <HookHarness
      config={{
        preparer: delayedPreparer<TraceType>(150),
        versionDetector: makeDetector(),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
        ],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          state.process({ rawTrace: sampleTraceV1 });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const ProcessingPreparerDisabled: Story = {
  name: 'transform-disabled-direct-trace',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent(
      'true',
    );
    await expect(canvas.getByTestId('viz-v1')).toBeVisible();
  },
  render: () => (
    <HookHarness
      config={{
        preparer: immediatePreparer<TraceType>(),
        versionDetector: makeDetector(),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
        ],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          state.process({ rawTrace: sampleTraceV1 });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const ErrorsPreparerThrows: Story = {
  name: 'transform-error-preparer-throws',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await expect(canvas.getByTestId('flag-isError')).toHaveTextContent('true');
  },
  render: () => (
    <HookHarness
      config={{
        preparer: throwingPreparer<TraceType>('Preparer validation failed'),
        versionDetector: makeDetector(),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
        ],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          state.process({ rawTrace: sampleTraceV1 });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const ErrorsInvalidTrace: Story = {
  name: 'transform-error-invalid-v2',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    await expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent(
      'true',
    );
  },
  render: () => (
    <HookHarness
      config={{
        preparer: immediatePreparer<TraceType>(),
        versionDetector: makeDetector(),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
        ],
      }}
      onReady={(state) => {
        if (!state.trace && state.process) {
          state.process({ rawTrace: invalidV2Trace });
        }
      }}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const ConcurrencyAbandonStale: Story = {
  name: 'concurrency-abandon-stale',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    const harness = canvas.getByTestId('harness');

    harness.dispatchEvent(
      new CustomEvent('trace:process', {
        bubbles: true,
        detail: { rawTrace: sampleTraceV1 },
      }),
    );

    await new Promise((r) => setTimeout(r, 50));

    harness.dispatchEvent(
      new CustomEvent('trace:process', {
        bubbles: true,
        detail: { rawTrace: sampleTraceV2 },
      }),
    );

    await waitFor(
      () => {
        expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent('true');
      },
      { timeout: 2000 },
    );
    await expect(canvas.getByTestId('version')).toHaveTextContent('2');
    await expect(canvas.getByTestId('viz-v2')).toBeVisible();
  },
  render: () => (
    <HookHarness
      config={{
        preparer: delayedPreparer<TraceType>(800),
        versionDetector: makeDetector(),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
        ],
      }}
      onReady={() => {}}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};

export const FlowCompleteCycle: Story = {
  name: 'flow-complete-cycle',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByTestId('app-ready')).toBeInTheDocument(),
    );
    const harness = canvas.getByTestId('harness');

    harness.dispatchEvent(
      new CustomEvent('trace:process', {
        bubbles: true,
        detail: { rawTrace: sampleTraceV1 },
      }),
    );

    await waitFor(() => {
      expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent('true');
      expect(canvas.getByTestId('viz-v1')).toBeVisible();
    });

    harness.dispatchEvent(
      new CustomEvent('trace:process', {
        bubbles: true,
        detail: { rawTrace: sampleTraceV2 },
      }),
    );

    await waitFor(() => {
      expect(canvas.getByTestId('flag-isSuccess')).toHaveTextContent('true');
      expect(canvas.getByTestId('viz-v2')).toBeVisible();
    });
  },
  render: () => (
    <HookHarness
      config={{
        preparer: immediatePreparer<TraceType>(),
        versionDetector: makeDetector(),
        visualizers: [
          { component: V1Spy, version: '1' },
          { component: V2Spy, version: '2' },
        ],
      }}
      onReady={() => {}}
      useTraceHook={useTrace<TraceType>}
    />
  ),
};
