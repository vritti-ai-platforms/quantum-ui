import { withThemeByClassName } from '@storybook/addon-themes';
import type { Decorator, Preview } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '../lib/context';
import '../src/index.css';

// Add ThemeProvider decorator to wrap all stories with React context
const withThemeProvider: Decorator = (Story) => (
  <ThemeProvider defaultTheme="light">
    <Story />
  </ThemeProvider>
);

// Components built on TanStack Query (DataTable's import, export and state push) need a client in every story
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
const withQueryClient: Decorator = (Story) => (
  <QueryClientProvider client={queryClient}>
    <Story />
  </QueryClientProvider>
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
  withQueryClient,
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
