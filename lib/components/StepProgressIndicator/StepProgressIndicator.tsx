import { Check } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { cn } from '../../../shadcn/utils';
import { Progress } from '../Progress';
import { Typography } from '../Typography';

export interface StepDef {
  label: string;
  icon: ReactNode;
}

export interface StepProgressIndicatorProps {
  steps: StepDef[];
  currentStep: number;
  progress?: number;
  // Makes steps navigable: called with the 1-based step clicked
  onStepClick?: (step: number) => void;
  // Which steps can be clicked when `onStepClick` is set; every step by default
  isStepClickable?: (step: number) => boolean;
  // The 1-based step being shown, marked apart from the current one; defaults to the current step
  selectedStep?: number;
}

// Reusable multi-step indicator with icon circles, connector lines, and per-step progress bars; optionally navigable
export const StepProgressIndicator = ({
  steps,
  currentStep,
  progress = 0,
  onStepClick,
  isStepClickable,
  selectedStep = currentStep,
}: StepProgressIndicatorProps) => (
  <div className="flex w-full items-start justify-between">
    {steps.map((step, index) => {
      const num = index + 1;
      const isCompleted = num < currentStep;
      const isActive = num === currentStep;
      const isClickable = !!onStepClick && (isStepClickable?.(num) ?? true);
      const isSelected = !!onStepClick && num === selectedStep;
      const content = (
        <>
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
              isCompleted || isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-secondary text-muted-foreground',
              isSelected && 'ring-2 ring-primary/40 ring-offset-2 ring-offset-background',
            )}
          >
            {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
          </div>
          <Typography
            variant="body2"
            className={cn(
              'whitespace-nowrap text-[10px] transition-all',
              isCompleted || isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
              isSelected && 'underline underline-offset-4',
            )}
          >
            {step.label}
          </Typography>
          <Progress value={isCompleted ? 100 : isActive ? progress : 0} className="h-1 w-16" />
        </>
      );

      return (
        <Fragment key={step.label}>
          {isClickable ? (
            <button
              type="button"
              onClick={() => onStepClick?.(num)}
              aria-current={isSelected ? 'step' : undefined}
              className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {content}
            </button>
          ) : (
            <div className={cn('flex flex-col items-center gap-1.5', onStepClick && 'cursor-not-allowed opacity-70')}>
              {content}
            </div>
          )}

          {index < steps.length - 1 && (
            <div className="mx-2 mt-4 h-0.5 flex-1">
              <div className={cn('h-full rounded-full transition-all', isCompleted ? 'bg-primary' : 'bg-border')} />
            </div>
          )}
        </Fragment>
      );
    })}
  </div>
);
