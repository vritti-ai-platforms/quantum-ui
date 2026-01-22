import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button';
import { Toaster } from './Sonner';
import { toast } from './toast';

const meta: Meta<typeof Toaster> = {
  title: 'Components/Sonner',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const AllToastTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-8">
      <Toaster position="top-center" />
      <p className="text-sm text-muted-foreground">
        Click each button to see the toast with its corresponding color border.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast.success('Operation completed successfully!')}>
          Success (green)
        </Button>
        <Button variant="outline" onClick={() => toast.error('Something went wrong!')}>
          Error (red)
        </Button>
        <Button variant="outline" onClick={() => toast.warning('Please review before continuing')}>
          Warning (amber)
        </Button>
        <Button variant="outline" onClick={() => toast.info('Here is some helpful information')}>
          Info (cyan)
        </Button>
        <Button variant="outline" onClick={() => toast.loading('Processing your request...')}>
          Loading (primary)
        </Button>
        <Button variant="outline" onClick={() => toast('This is a default message')}>
          Default (no border)
        </Button>
      </div>
    </div>
  ),
};

export const LoadingToSuccess: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <Toaster position="top-center" />
      <Button
        onClick={() => {
          const id = toast.loading('Processing...');
          setTimeout(() => {
            toast.success('Done!', { id });
          }, 2000);
        }}
      >
        Loading → Success (2s)
      </Button>
    </div>
  ),
};

export const LoadingToError: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-8">
      <Toaster position="top-center" />
      <Button
        onClick={() => {
          const id = toast.loading('Processing...');
          setTimeout(() => {
            toast.error('Failed!', { id });
          }, 2000);
        }}
      >
        Loading → Error (2s)
      </Button>
    </div>
  ),
};
