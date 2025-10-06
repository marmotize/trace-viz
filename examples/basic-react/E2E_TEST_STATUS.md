# E2E Test Status

## Overview

Comprehensive end-to-end tests for trace-viz library covering all orchestration paths from the README mermaid diagrams.

## Current Status (as of latest run)

### Setup ✅

- [x] Playwright installed and configured
- [x] Test panel with controls for all scenarios
- [x] App-ready sentinel to avoid registration races
- [x] Auto-enabled 50ms delay in test mode for deterministic processing state
- [x] data-testid attributes on all UI elements

### Test Coverage

#### Flow Tests (Happy Paths)

- [ ] flow-happy-v1: V1 trace complete pipeline - **NEEDS FIX**
- [ ] flow-happy-v2: V2 trace complete pipeline - **NEEDS FIX**
- [ ] flow-flags-success: React hook flags transition - **NEEDS FIX**

#### Version Detection

- [ ] detect-missing-version-fallback - **FAILING**
- [ ] detect-jsonata-error - **NEEDS CHECK**
- [ ] detect-semver-2-1-3 - **NEEDS CHECK**
- [ ] detect-semver-fallback-major - **FAILING**
- [ ] detect-custom-expression - **NEEDS CHECK**

#### Registry Lookup

- [ ] registry-default-used - **NEEDS CHECK**
- [ ] registry-no-visualizer-error - **NEEDS CHECK**
- [ ] registry-exact-match-priority - **NEEDS CHECK**
- [ ] registry-semantic-version-match - **NEEDS CHECK**

#### Transformation/Preparation

- [ ] transform-success-v1 - **NEEDS CHECK**
- [ ] transform-success-v2 - **NEEDS CHECK**
- [ ] transform-error-invalid-v2 - **NEEDS CHECK**
- [ ] transform-disabled-direct-trace - **NEEDS CHECK**
- [ ] transform-with-delay - **NEEDS CHECK**

#### Concurrency

- [ ] concurrency-abandon-stale - **NEEDS CHECK**
- [ ] concurrency-sequential-operations - **FAILING**
- [ ] concurrency-rapid-fire - **NEEDS CHECK**

## Known Issues

### 1. Processing State Flickers

**Issue**: Even with 50ms delay, processing state may complete between renders
**Fix**: Increase delay to 100-200ms in test mode OR remove assertions on transient states

### 2. Async State Updates

**Issue**: Tests click immediately after previous action completes
**Fix**: Add explicit waits for success/error states before next action

### 3. Sequential Test Timing

**Issue**: Sequential operations test doesn't wait for first to complete
**Fix**: Add `await expect(viz-v1).toBeVisible()` between actions

## Next Steps

1. **Increase test delay**: Change auto-delay from 50ms to 150ms
2. **Add explicit waits**: Wait for status-success between operations
3. **Run full suite**: `pnpm test:e2e`
4. **Add unit tests**: Move complex logic tests to Vitest in packages/core
5. **CI Integration**: Add e2e tests to GitHub Actions

## Running Tests

```bash
# Run all tests
pnpm test:e2e

# Run with UI (recommended for debugging)
pnpm test:e2e:ui

# Run single test file
pnpm test:e2e e2e/flow.spec.ts

# Run with debug
pnpm exec playwright test e2e/flow.spec.ts --debug

# Show latest report
pnpm exec playwright show-report
```

## Test Architecture

Tests follow the architecture from README:

- **Detection Layer**: Version detection with JSONata, fallback
- **Registry Layer**: Exact match, semantic match, default fallback
- **Transform Layer**: Preparer validation, schema errors
- **Concurrency Layer**: Operation abandonment
- **Output Layer**: State flags and visualizer selection
