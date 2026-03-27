import type { Meta, StoryObj } from '@storybook/react';
import { useDialog } from '../../hooks/useDialog';
import { Button } from '../Button/Button';
import { Dialog } from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
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
  render: () => {
    const dialog = useDialog();
    return (
      <Dialog handle={dialog} trigger={<Button>Open Dialog</Button>} title="Dialog Title">
        <p className="text-sm text-muted-foreground">This is the dialog body. You can put any content here.</p>
      </Dialog>
    );
  },
};

// Dialog with title and description
export const WithDescription: Story = {
  render: () => {
    const dialog = useDialog();
    return (
      <Dialog
        handle={dialog}
        trigger={<Button>Open Dialog</Button>}
        title="Edit Profile"
        description="Make changes to your profile here. Click save when you're done."
      >
        <p className="text-sm text-muted-foreground">Profile form content would go here.</p>
      </Dialog>
    );
  },
};

// Dialog with footer action buttons
export const WithFooter: Story = {
  render: () => {
    const dialog = useDialog();
    return (
      <Dialog
        handle={dialog}
        trigger={<Button>Open Dialog</Button>}
        title="Save Changes"
        description="Your changes will be saved to your account."
        content={(close) => (
          <>
            <p className="text-sm text-muted-foreground">Review your changes before saving.</p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button onClick={close}>Save Changes</Button>
            </div>
          </>
        )}
      />
    );
  },
};

// Destructive confirmation dialog
export const ConfirmationDialog: Story = {
  render: () => {
    const dialog = useDialog();
    return (
      <Dialog
        handle={dialog}
        trigger={<Button variant="destructive">Delete Account</Button>}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
        content={(close) => (
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={close}>
              Delete Account
            </Button>
          </div>
        )}
      />
    );
  },
};

// Dialog with form content inside
export const FormDialog: Story = {
  render: () => {
    const dialog = useDialog();
    return (
      <Dialog
        handle={dialog}
        trigger={<Button>Edit Profile</Button>}
        title="Edit Profile"
        description="Update your personal information."
        content={(close) => (
          <>
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
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button onClick={close}>Save Changes</Button>
            </div>
          </>
        )}
      />
    );
  },
};

// Using the anchor pattern (render prop for trigger)
export const AnchorPattern: Story = {
  render: () => {
    const dialog = useDialog();
    return (
      <Dialog
        handle={dialog}
        anchor={(open) => (
          <Button variant="outline" onClick={open}>
            Open with Anchor Pattern
          </Button>
        )}
        title="Anchor Pattern"
        description="This dialog uses the anchor render prop instead of a trigger element."
        content={(close) => (
          <>
            <p className="text-sm text-muted-foreground">
              The anchor pattern gives you control over when and how the dialog opens.
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={close}>
                Close
              </Button>
              <Button onClick={close}>Confirm</Button>
            </div>
          </>
        )}
      />
    );
  },
};

// Controls-driven story for argTypes exploration
export const AllProps: Story = {
  render: () => {
    const dialog = useDialog();
    return (
      <Dialog
        handle={dialog}
        title="Dialog Title"
        description="This is the dialog description providing more context."
        trigger={<Button>Open Dialog</Button>}
        footer={
          <>
            <Button variant="outline">Cancel</Button>
            <Button>Confirm</Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Dialog body content.</p>
      </Dialog>
    );
  },
};
