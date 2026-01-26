import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
    title: 'Components/Badge',
    component: Badge,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['default', 'secondary', 'destructive', 'outline'],
            description: 'The visual variant of the badge',
        },
        asChild: {
            control: { type: 'boolean' },
            description:'Render as child element instead of default span',
        },
        children: {
            control: 'text',
            description: 'Badge content',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variant
export const Default: Story = {
    args: {
        variant: 'default',
        children: 'Default Badge',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary Badge',
    },
};

export const Destructive: Story = {
    args: {
        variant: 'destructive',
        children: 'Destructive Badge',
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline Badge',
    },
};

// show all variants together
export const AllVariants: Story = {
    render: () => (
        <div className="flex gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
        </div>
    ),
};