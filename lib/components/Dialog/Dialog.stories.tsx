import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controlled open state',
    },
    title: {
      control: 'text',
      description: 'Dialog heading',
    },
    description: {
      control: 'text',
      description: 'Dialog subtext below the title',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the dialog content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic dialog with a trigger button
export const Default: Story = {
  render: () => (
    <Dialog trigger={<Button>Open Dialog</Button>} title="Dialog Title">
      <p className="text-sm text-muted-foreground">This is the dialog body. You can put any content here.</p>
    </Dialog>
  ),
};

// Dialog with title and description
export const WithDescription: Story = {
  render: () => (
    <Dialog
      trigger={<Button>Open Dialog</Button>}
      title="Edit Profile"
      description="Make changes to your profile here. Click save when you're done."
    >
      <p className="text-sm text-muted-foreground">Profile form content would go here.</p>
    </Dialog>
  ),
};

// Dialog with footer action buttons
export const WithFooter: Story = {
  render: () => (
    <Dialog
      trigger={<Button>Open Dialog</Button>}
      title="Save Changes"
      description="Your changes will be saved to your account."
      footer={
        <>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save Changes</Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">Review your changes before saving.</p>
    </Dialog>
  ),
};

// Destructive confirmation dialog
export const ConfirmationDialog: Story = {
  render: () => (
    <Dialog
      trigger={<Button variant="destructive">Delete Account</Button>}
      title="Are you absolutely sure?"
      description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
      footer={
        <>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete Account</Button>
        </>
      }
    />
  ),
};

// Dialog with form content inside
export const FormDialog: Story = {
  render: () => (
    <Dialog
      trigger={<Button>Edit Profile</Button>}
      title="Edit Profile"
      description="Update your personal information."
      footer={
        <>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save Changes</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="dialog-name" className="text-sm font-medium">
            Name
          </label>
          <input
            id="dialog-name"
            type="text"
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="dialog-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="dialog-email"
            type="email"
            placeholder="john@example.com"
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
          />
        </div>
      </div>
    </Dialog>
  ),
  parameters: {
    layout: 'centered',
  },
};

// Low-level composable API
export const LowLevelAPI: Story = {
  render: () => (
    <DialogRoot>
      <DialogTrigger asChild>
        <Button variant="outline">Open with Low-level API</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Low-level API</DialogTitle>
          <DialogDescription>
            This dialog is built using the composable low-level primitives: DialogRoot, DialogTrigger, DialogContent,
            DialogHeader, DialogTitle, DialogDescription, DialogFooter.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Use the low-level API when you need full control over the dialog structure.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  ),
};

// Controls-driven story for argTypes exploration
export const AllProps: Story = {
  args: {
    title: 'Dialog Title',
    description: 'This is the dialog description providing more context.',
    trigger: <Button>Open Dialog</Button>,
    children: <p className="text-sm text-muted-foreground">Dialog body content.</p>,
    footer: (
      <>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button>Confirm</Button>
      </>
    ),
  },
};
