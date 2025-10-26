import type { Preview } from '@storybook/react';

const preview: Preview = {
  decorators: [
    (Story) => {
      window.history.pushState({}, 'Test', '/?test=1');
      return <Story />;
    },
  ] as Preview['decorators'],
  parameters: {
    controls: {
      expanded: false,
    },
  },
};

export default preview;
