import type { Meta, StoryObj } from '@storybook/react';
import { ErrorPage, getErrorPagePreset } from './ErrorPage';

const meta: Meta<typeof ErrorPage> = {
  title: 'Components/ErrorBoundary/ErrorPage',
  component: ErrorPage,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onRetry: () => undefined,
    onGoBack: () => undefined,
    onLogin: () => undefined,
  },
};

export default meta;
type Story = StoryObj<typeof ErrorPage>;

export const Unauthorized: Story = {
  args: {
    preset: getErrorPagePreset('unauthorized'),
  },
};

export const Forbidden: Story = {
  args: {
    preset: getErrorPagePreset('forbidden'),
  },
};

export const NotFound: Story = {
  args: {
    preset: getErrorPagePreset('notFound'),
  },
};

export const ServerError: Story = {
  args: {
    preset: getErrorPagePreset('serverError'),
  },
};

export const NetworkError: Story = {
  args: {
    preset: getErrorPagePreset('networkError'),
  },
};

export const UnknownError: Story = {
  args: {
    preset: getErrorPagePreset('unknownError'),
  },
};
