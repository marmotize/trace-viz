import { JSONataVersionDetector } from '@trace-viz/version-detector-jsonata';

export const makeDetector = (expression = 'version', fallback = '1') =>
  new JSONataVersionDetector({ expression, fallback });
