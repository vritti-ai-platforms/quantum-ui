import type { Meta, StoryObj } from '@storybook/react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Spinner } from '../Spinner';
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
            options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
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

export const Ghost: Story = {
    args: {
        variant: 'ghost',
        children: 'Ghost Badge',
    },
};

export const Link: Story = {
    args: {
        variant: 'link',
        children: 'Link Badge',
    },
};

export const WithIcon: Story = {
    render:() => (
        <div className="flex gap-2">
            <Badge variant="default"><CheckCircle/> Verified</Badge>
            <Badge variant="destructive"><AlertCircle/> Error</Badge>
            <Badge variant="secondary"><Clock/> Pending</Badge>
        </div>
    ),
};

export const WithSpinner: Story = {
    render: () => (
        <Badge variant="secondary">
            <Spinner className='size-3'/>
            Deleting...
        </Badge>
    ),
};

export const CustomColors: Story = {
       render: () => (
         <div className="flex flex-wrap gap-2">
           <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Success</Badge>
           <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Warning</Badge>
           <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Info</Badge>
         </div>
       ),
     };


// show all variants together
export const AllVariants: Story = {
    render: () => (
        <div className="flex gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="link">Link</Badge>
        </div>
    ),
};