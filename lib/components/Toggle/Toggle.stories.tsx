import type { Meta, StoryObj } from '@storybook/react';
import { Bold, Italic, Underline } from 'lucide-react';
import { Toggle } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'Components/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'Visual variant of the toggle',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
      description: 'Size of the toggle',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the toggle is disabled',
    },
    defaultPressed: {
      control: 'boolean',
      description: 'Whether the toggle is pressed by default',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    'aria-label': 'Toggle bold',
    children: <Bold className="size-4" />,
  },
};

export const Pressed: Story = {
  args: {
    'aria-label': 'Toggle bold',
    defaultPressed: true,
    children: <Bold className="size-4" />,
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    'aria-label': 'Toggle italic',
    children: <Italic className="size-4" />,
  },
};

export const OutlinePressed: Story = {
  args: {
    variant: 'outline',
    'aria-label': 'Toggle italic',
    defaultPressed: true,
    children: <Italic className="size-4" />,
  },
};

export const WithText: Story = {
  args: {
    'aria-label': 'Toggle italic',
    children: (
      <>
        <Italic className="size-4" />
        Italic
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    'aria-label': 'Toggle bold',
    children: <Bold className="size-4" />,
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    'aria-label': 'Toggle bold',
    children: <Bold className="size-4" />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    'aria-label': 'Toggle bold',
    children: <Bold className="size-4" />,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-20 text-sm text-muted-foreground">Default:</span>
        <Toggle aria-label="Toggle bold">
          <Bold className="size-4" />
        </Toggle>
        <Toggle aria-label="Toggle bold" defaultPressed>
          <Bold className="size-4" />
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-sm text-muted-foreground">Outline:</span>
        <Toggle variant="outline" aria-label="Toggle italic">
          <Italic className="size-4" />
        </Toggle>
        <Toggle variant="outline" aria-label="Toggle italic" defaultPressed>
          <Italic className="size-4" />
        </Toggle>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <div className="flex flex-col items-center gap-2">
        <Toggle size="sm" aria-label="Toggle bold">
          <Bold className="size-4" />
        </Toggle>
        <span className="text-xs text-muted-foreground">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Toggle size="default" aria-label="Toggle bold">
          <Bold className="size-4" />
        </Toggle>
        <span className="text-xs text-muted-foreground">Default</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Toggle size="lg" aria-label="Toggle bold">
          <Bold className="size-4" />
        </Toggle>
        <span className="text-xs text-muted-foreground">Large</span>
      </div>
    </div>
  ),
};

export const ToggleGroup: Story = {
  render: () => (
    <div className="flex items-center gap-1 rounded-md border p-1">
      <Toggle size="sm" aria-label="Toggle bold" defaultPressed>
        <Bold className="size-4" />
      </Toggle>
      <Toggle size="sm" aria-label="Toggle italic">
        <Italic className="size-4" />
      </Toggle>
      <Toggle size="sm" aria-label="Toggle underline">
        <Underline className="size-4" />
      </Toggle>
    </div>
  ),
};
