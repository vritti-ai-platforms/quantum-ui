import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size of the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Change the default rendered element for the one passed as a child',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    isLoading: {
      control: 'boolean',
      description: 'Whether the button is in a loading state',
    },
    loadingText: {
      control: 'text',
      description: 'Text to display while loading',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic stories
export const Default: Story = {
  args: {
    variant: 'default',
    children: 'Default Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete Account',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

// Size variants
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const DefaultSize: Story = {
  args: {
    size: 'default',
    children: 'Default Size',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    variant: 'outline',
    children: (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    'aria-label': 'Close',
  },
};

// State variants
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const FullWidth: Story = {
  args: {
    className: 'w-full',
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// With icons
export const WithIcon: Story = {
  args: {
    variant: 'default',
    children: (
      <>
        <svg aria-hidden="true" className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </>
    ),
  },
};

// Interactive examples
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="default">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

// Loading state stories
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Submit',
  },
};

export const LoadingWithText: Story = {
  args: {
    isLoading: true,
    loadingText: 'Submitting...',
    children: 'Submit',
  },
};

export const LoadingVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default" isLoading>
        Default
      </Button>
      <Button variant="secondary" isLoading>
        Secondary
      </Button>
      <Button variant="destructive" isLoading>
        Destructive
      </Button>
      <Button variant="outline" isLoading>
        Outline
      </Button>
      <Button variant="ghost" isLoading>
        Ghost
      </Button>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const LoadingSizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="sm" isLoading>
        Small
      </Button>
      <Button size="default" isLoading>
        Default
      </Button>
      <Button size="lg" isLoading>
        Large
      </Button>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const LoadingExample: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="default" isLoading>
        Loading...
      </Button>
      <Button variant="outline" isLoading loadingText="Processing...">
        Submit
      </Button>
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};
