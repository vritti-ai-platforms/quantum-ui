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
  // 1-based index of the currently active step
  currentStep: number;
  // 0-100 within-step progress for the active step (defaults to 0)
  progress?: number;
}

// Reusable multi-step indicator with icon circles, connector lines, and per-step progress bars
export const StepProgressIndicator = ({ steps, currentStep, progress = 0 }: StepProgressIndicatorProps) => (
  <div className="flex w-full items-start justify-between">
    {steps.map((step, index) => {
      const num = index + 1;
      const isCompleted = num < currentStep;
      const isActive = num === currentStep;

      return (
        <Fragment key={step.label}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                isCompleted || isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-secondary text-muted-foreground',
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
            </div>
            <Typography
              variant="body2"
              className={cn(
                'whitespace-nowrap text-[10px] transition-all',
                isCompleted || isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </Typography>
            <Progress value={isCompleted ? 100 : isActive ? progress : 0} className="h-1 w-16" />
          </div>

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
