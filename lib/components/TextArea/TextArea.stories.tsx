import type { Meta, StoryObj } from '@storybook/react';
import { TextArea } from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label for the field',
    },
    description: {
      control: 'text',
      description: 'Helper text to display below the field',
    },
    error: {
      control: 'text',
      description: 'Error message to display below the field',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
    },
    rows: {
      control: { type: 'number', min: 2, max: 20 },
      description: 'Number of visible text lines',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic stories
export const Default: Story = {
  render: () => <TextArea label="Message" placeholder="Enter your message" />,
};

export const WithValue: Story = {
  render: () => (
    <TextArea
      label="Bio"
      placeholder="Tell us about yourself"
      defaultValue="I am a software developer passionate about building great user experiences."
    />
  ),
};

export const WithDescription: Story = {
  render: () => (
    <TextArea
      label="Feedback"
      placeholder="Share your thoughts"
      description="Your feedback helps us improve our product"
    />
  ),
};

// State variants
export const ErrorState: Story = {
  render: () => (
    <TextArea
      label="Comment"
      placeholder="Enter your comment"
      defaultValue="Too short"
      error="Comment must be at least 10 characters long"
    />
  ),
};

export const SuccessState: Story = {
  render: () => (
    <TextArea
      label="Review"
      placeholder="Write your review"
      defaultValue="This product exceeded my expectations! The quality is outstanding and the customer service was excellent."
      className="border-green-500 focus-visible:ring-green-200"
      description="✓ Review submitted successfully"
    />
  ),
};

export const WarningState: Story = {
  render: () => (
    <TextArea
      label="Description"
      placeholder="Enter description"
      defaultValue="This is a brief description."
      className="border-yellow-500 focus-visible:ring-yellow-200"
      description="Consider adding more details (minimum 50 characters recommended)"
    />
  ),
};

// Size variants
export const Small: Story = {
  render: () => <TextArea label="Small Note" placeholder="Enter a brief note" rows={3} className="text-sm" />,
};

export const Medium: Story = {
  render: () => <TextArea label="Medium Text" placeholder="Enter your text" rows={5} />,
};

export const Large: Story = {
  render: () => <TextArea label="Large Content" placeholder="Enter detailed content" rows={10} />,
};

// State examples
export const Disabled: Story = {
  render: () => (
    <TextArea
      label="Disabled Field"
      placeholder="This field is disabled"
      defaultValue="Cannot edit this content"
      disabled={true}
      description="This field is currently disabled"
    />
  ),
};

export const ReadOnly: Story = {
  render: () => (
    <TextArea label="Read Only Field" defaultValue="This content is read-only and cannot be modified" readOnly={true} />
  ),
};

// Form examples
export const ContactForm: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          placeholder="Your name"
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          placeholder="your.email@example.com"
          className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
        />
      </div>
      <TextArea
        label="Message"
        placeholder="How can we help you?"
        rows={5}
        description="Please provide as much detail as possible"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const FeedbackForm: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <TextArea label="What did you like?" placeholder="Tell us what you enjoyed" rows={4} />
      <TextArea label="What could be improved?" placeholder="Share your suggestions" rows={4} />
      <TextArea
        label="Additional comments"
        placeholder="Any other feedback?"
        rows={4}
        description="Optional: Share any other thoughts"
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <TextArea label="Small (3 rows)" placeholder="Enter text" rows={3} />
      <TextArea label="Medium (5 rows)" placeholder="Enter text" rows={5} />
      <TextArea label="Large (10 rows)" placeholder="Enter text" rows={10} />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="w-96 space-y-4">
      <TextArea label="Normal State" placeholder="Normal textarea" rows={4} />
      <TextArea
        label="Success State"
        placeholder="Success textarea"
        defaultValue="Valid input with sufficient content"
        className="border-green-500 focus-visible:ring-green-200"
        description="✓ This input is valid"
        rows={4}
      />
      <TextArea
        label="Warning State"
        placeholder="Warning textarea"
        defaultValue="Short text"
        className="border-yellow-500 focus-visible:ring-yellow-200"
        description="Consider adding more detail"
        rows={4}
      />
      <TextArea
        label="Error State"
        placeholder="Error textarea"
        defaultValue="Bad"
        error="Input must be at least 10 characters"
        rows={4}
      />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
};

// Character counter example
export const WithCharacterCounter: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    const maxLength = 200;
    const remaining = maxLength - value.length;
    const isNearLimit = remaining <= 20;
    const isOverLimit = remaining < 0;

    return (
      <div className="w-96">
        <TextArea
          label="Product Description"
          placeholder="Describe your product"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          className={isOverLimit ? 'border-red-500 focus-visible:ring-red-200' : ''}
          description={
            <div className="flex justify-between items-center">
              <span>Maximum {maxLength} characters</span>
              <span className={isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-600' : ''}>
                {remaining} remaining
              </span>
            </div>
          }
          error={isOverLimit ? 'Character limit exceeded' : undefined}
        />
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
};

// With validation
export const WithValidation: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    const [touched, setTouched] = React.useState(false);

    const minLength = 20;
    const isValid = value.length >= minLength;
    const showError = touched && !isValid && value.length > 0;
    const showSuccess = touched && isValid;

    return (
      <div className="w-96">
        <TextArea
          label="Review"
          placeholder="Write your review"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (!touched) setTouched(true);
          }}
          rows={6}
          className={showSuccess ? 'border-green-500 focus-visible:ring-green-200' : ''}
          error={showError ? `Please write at least ${minLength} characters (${value.length}/${minLength})` : undefined}
          description={
            showError
              ? undefined
              : showSuccess
                ? '✓ Review meets minimum length'
                : `Minimum ${minLength} characters required`
          }
        />
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
};

// Markdown example
export const MarkdownEditor: Story = {
  render: () => {
    const [content, setContent] = React.useState('# My Heading\n\nThis is some **bold** text and this is *italic*.');

    return (
      <div className="w-96 space-y-4">
        <TextArea
          label="Markdown Content"
          placeholder="Write in Markdown..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          description="Supports Markdown formatting"
        />
        <div className="p-3 border rounded-lg bg-muted/50">
          <p className="text-xs font-medium mb-2">Preview:</p>
          <div className="text-sm prose prose-sm max-w-none dark:prose-invert">{content}</div>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'centered',
  },
};

import React from 'react';
