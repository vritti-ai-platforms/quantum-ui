import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../Card/Card';
import { ThemeToggle } from './ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the toggle button',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const InCardHeader: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Toggle between light and dark themes</CardDescription>
        </div>
        <ThemeToggle />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          The theme toggle automatically saves your preference and respects your system settings.
        </p>
      </CardContent>
    </Card>
  ),
};

export const SizeComparison: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <div className="text-center">
        <ThemeToggle size="sm" />
        <p className="text-xs mt-2 text-muted-foreground">Small</p>
      </div>
      <div className="text-center">
        <ThemeToggle size="md" />
        <p className="text-xs mt-2 text-muted-foreground">Medium</p>
      </div>
      <div className="text-center">
        <ThemeToggle size="lg" />
        <p className="text-xs mt-2 text-muted-foreground">Large</p>
      </div>
    </div>
  ),
};
