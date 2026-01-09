import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Components/Typography',
  component: Typography,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'body1',
        'body2',
        'caption',
        'overline',
        'subtitle1',
        'subtitle2',
        'button',
        'code',
        'blockquote',
      ],
      description: 'The semantic variant of the typography',
    },
    intent: {
      control: { type: 'select' },
      options: ['default', 'primary', 'secondary', 'muted', 'success', 'warning', 'error'],
      description: 'The color intent of the text',
    },
    align: {
      control: { type: 'select' },
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default Typography
export const Default: Story = {
  args: {
    children: 'This is default typography text.',
    variant: 'body1',
  },
};

// Heading Variants
export const Headings: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="h1">H1: The quick brown fox</Typography>
      <Typography variant="h2">H2: The quick brown fox</Typography>
      <Typography variant="h3">H3: The quick brown fox</Typography>
      <Typography variant="h4">H4: The quick brown fox</Typography>
      <Typography variant="h5">H5: The quick brown fox</Typography>
      <Typography variant="h6">H6: The quick brown fox</Typography>
    </div>
  ),
};

// Body Text Variants
export const BodyText: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="body1">
        Body 1: This is the primary body text with excellent readability and proper line spacing. It's perfect for main
        content areas and paragraphs.
      </Typography>
      <Typography variant="body2">
        Body 2: This is smaller body text, ideal for secondary content or captions. It maintains readability while
        taking up less space.
      </Typography>
      <Typography variant="caption">
        Caption: This is caption text used for small details, timestamps, or metadata.
      </Typography>
      <Typography variant="overline">OVERLINE: THIS IS OVERLINE TEXT FOR CATEGORIES OR SECTIONS</Typography>
    </div>
  ),
};

// Subtitle Variants
export const Subtitles: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="subtitle1">Subtitle 1: This is a larger subtitle</Typography>
      <Typography variant="subtitle2">Subtitle 2: This is a smaller subtitle</Typography>
    </div>
  ),
};

// Special Variants
export const SpecialVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography variant="button">BUTTON TEXT</Typography>
      <Typography variant="code">const message = "Hello, world!";</Typography>
      <Typography variant="blockquote">"The only way to do great work is to love what you do." - Steve Jobs</Typography>
    </div>
  ),
};

// Intent Colors
export const IntentColors: Story = {
  render: () => (
    <div className="space-y-4">
      <Typography intent="default">Default: This is the default text color</Typography>
      <Typography intent="primary">Primary: This is primary colored text</Typography>
      <Typography intent="secondary">Secondary: This is secondary colored text</Typography>
      <Typography intent="muted">Muted: This is muted/subdued text</Typography>
      <Typography intent="success">Success: This indicates successful operations</Typography>
      <Typography intent="warning">Warning: This indicates caution or warnings</Typography>
      <Typography intent="error">Error: This indicates errors or destructive actions</Typography>
    </div>
  ),
};

// Text Alignment
export const TextAlignment: Story = {
  render: () => (
    <div className="space-y-4 w-full">
      <Typography align="left">Left aligned: This text is aligned to the left</Typography>
      <Typography align="center">Center aligned: This text is centered</Typography>
      <Typography align="right">Right aligned: This text is aligned to the right</Typography>
      <Typography align="justify">
        Justified: This text is justified, which means it's aligned to both the left and right margins. The spacing
        between words is adjusted to achieve this alignment. This creates clean, even edges on both sides.
      </Typography>
    </div>
  ),
};

// Typography Hierarchy Demo (inspired by shadcn typography-demo)
export const TypographyDemo: Story = {
  render: () => (
    <div className="max-w-4xl space-y-6">
      <Typography variant="h1">Taxing Laughter: The Joke Tax Chronicles</Typography>

      <Typography variant="body1" intent="muted" className="text-xl">
        Once upon a time, in a far-off land, there was a very lazy king who spent all day lounging on his throne. One
        day, his advisors came to him with a problem: the kingdom was running out of money.
      </Typography>

      <Typography variant="h2">The King's Plan</Typography>

      <Typography variant="body1">
        The king thought long and hard, and finally came up with{' '}
        <span className="text-primary font-medium underline underline-offset-4">a brilliant plan</span>: he would tax
        the jokes in the kingdom.
      </Typography>

      <Typography variant="blockquote">
        "After all," he said, "everyone enjoys a good joke, so it's only fair that they should pay for the privilege."
      </Typography>

      <Typography variant="h3">The Joke Tax</Typography>

      <Typography variant="body1">
        The king's subjects were not amused. They grumbled and complained, but the king was firm:
      </Typography>

      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>1st level of puns: 5 gold coins</li>
        <li>2nd level of jokes: 10 gold coins</li>
        <li>3rd level of one-liners: 20 gold coins</li>
      </ul>

      <Typography variant="body1">
        As a result, people stopped telling jokes, and the kingdom fell into a gloom. But there was one person who
        refused to let the king's foolishness get him down: a court jester named Jokester.
      </Typography>

      <Typography variant="h3">The People's Rebellion</Typography>

      <Typography variant="body1">
        The people of the kingdom, feeling uplifted by the laughter, started to tell jokes and puns again, and soon the
        entire kingdom was in on the joke.
      </Typography>

      <Typography variant="body1">
        The moral of the story is: never underestimate the power of a good laugh and always be careful of bad ideas.
      </Typography>
    </div>
  ),
};

// Typography in Real Content
export const RealContentExample: Story = {
  render: () => (
    <article className="max-w-2xl space-y-4">
      <Typography variant="h1">Getting Started with Quantum UI</Typography>

      <Typography variant="subtitle1" intent="muted">
        A comprehensive guide to using our component library
      </Typography>

      <Typography variant="body1">
        Quantum UI is a modern component library built with shadcn/ui and Tailwind CSS. It provides a set of accessible,
        customizable components that follow design best practices.
      </Typography>

      <Typography variant="h2">Installation</Typography>

      <Typography variant="body1">To get started, install the package using your preferred package manager:</Typography>

      <Typography variant="code">npm install @vritti/quantum-ui</Typography>

      <Typography variant="h3">Basic Usage</Typography>

      <Typography variant="body1">
        Import the components you need and start building amazing interfaces. Each component is fully typed and includes
        comprehensive documentation.
      </Typography>

      <Typography variant="caption" intent="muted">
        Last updated: September 2025
      </Typography>
    </article>
  ),
};
