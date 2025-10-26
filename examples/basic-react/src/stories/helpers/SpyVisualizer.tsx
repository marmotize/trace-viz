import type { FC } from 'react';

export function spy<T>(id: string, Base: FC<{ trace: T }>) {
  const SpyComponent: FC<{ trace: T }> = (props) => (
    <div data-testid={`viz-${id}`}>
      <Base {...props} />
    </div>
  );
  return SpyComponent;
}
