import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Components/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)',
      table: {
        defaultValue: { summary: '0' },
      },
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => <Progress value={33} className="w-80" />,
};

export const HalfComplete: Story = {
  render: () => <Progress value={50} className="w-80" />,
};

export const AlmostComplete: Story = {
  render: () => <Progress value={85} className="w-80" />,
};

export const Complete: Story = {
  render: () => <Progress value={100} className="w-80" />,
};

export const Empty: Story = {
  render: () => <Progress value={0} className="w-80" />,
};

export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 0;
          return prev + 1;
        });
      }, 50);

      return () => clearInterval(timer);
    }, []);

    return (
      <div className="w-80 space-y-4">
        <Progress value={progress} />
        <div className="text-center text-sm text-muted-foreground">{progress}% Complete</div>
      </div>
    );
  },
};

export const StepBased: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = React.useState(1);
    const totalSteps = 6;
    const progress = (currentStep / totalSteps) * 100;

    return (
      <div className="w-80 space-y-4">
        <Progress value={progress} />
        <div className="text-center text-sm space-y-2">
          <div className="text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-3 py-1 text-xs bg-secondary rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              disabled={currentStep === totalSteps}
              className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Small (h-1)</div>
        <Progress value={66} className="h-1" />
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Default (h-2)</div>
        <Progress value={66} className="h-2" />
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Medium (h-3)</div>
        <Progress value={66} className="h-3" />
      </div>

      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Large (h-4)</div>
        <Progress value={66} className="h-4" />
      </div>
    </div>
  ),
};

export const MultipleProgressBars: Story = {
  render: () => {
    const [progress1, setProgress1] = React.useState(25);
    const [progress2, setProgress2] = React.useState(50);
    const [progress3, setProgress3] = React.useState(75);

    React.useEffect(() => {
      const timer = setInterval(() => {
        setProgress1((prev) => (prev >= 100 ? 0 : prev + 2));
        setProgress2((prev) => (prev >= 100 ? 0 : prev + 1.5));
        setProgress3((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 100);

      return () => clearInterval(timer);
    }, []);

    return (
      <div className="w-80 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Task 1</span>
            <span className="text-muted-foreground">{Math.round(progress1)}%</span>
          </div>
          <Progress value={progress1} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Task 2</span>
            <span className="text-muted-foreground">{Math.round(progress2)}%</span>
          </div>
          <Progress value={progress2} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Task 3</span>
            <span className="text-muted-foreground">{Math.round(progress3)}%</span>
          </div>
          <Progress value={progress3} />
        </div>
      </div>
    );
  },
};

export const OnboardingFlow: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = React.useState(2);
    const totalSteps = 6;
    const progress = (currentStep / totalSteps) * 100;

    const steps = ['Verify Email', 'Verify Mobile', 'Set Password', 'Enable 2FA', 'Complete Profile', 'Done'];

    return (
      <div className="w-96 space-y-4">
        <div className="space-y-2">
          <Progress value={progress} className="h-1" />
          <div className="text-center text-sm text-muted-foreground">
            {steps[currentStep - 1]} ({currentStep}/{totalSteps})
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm bg-secondary rounded-lg disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
            disabled={currentStep === totalSteps}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
          >
            {currentStep === totalSteps ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    );
  },
};

export const AllValues: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-1.5">
        <div className="text-xs text-muted-foreground">0%</div>
        <Progress value={0} />
      </div>

      <div className="space-y-1.5">
        <div className="text-xs text-muted-foreground">25%</div>
        <Progress value={25} />
      </div>

      <div className="space-y-1.5">
        <div className="text-xs text-muted-foreground">50%</div>
        <Progress value={50} />
      </div>

      <div className="space-y-1.5">
        <div className="text-xs text-muted-foreground">75%</div>
        <Progress value={75} />
      </div>

      <div className="space-y-1.5">
        <div className="text-xs text-muted-foreground">100%</div>
        <Progress value={100} />
      </div>
    </div>
  ),
};
