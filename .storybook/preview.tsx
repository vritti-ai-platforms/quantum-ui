import { withThemeByClassName } from '@storybook/addon-themes';
import type { Decorator, Preview } from '@storybook/react-vite';
import { ThemeProvider } from '../lib/context';
import '../src/index.css';

// Add ThemeProvider decorator to wrap all stories with React context
const withThemeProvider: Decorator = (Story) => (
  <ThemeProvider defaultTheme="light">
    <Story />
  </ThemeProvider>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
  },
};

export const decorators = [
  withThemeProvider, // Provides React context
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
];

export default preview;
