import * as React from 'react';
import { buttonVariants, Button as ShadcnButton } from '../../../shadcn/shadcnButton';
import { cn } from '../../../shadcn/utils';
import { Spinner } from '../Spinner';

export interface ButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  isLoading?: boolean;
  loadingText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

// Button with built-in loading state and adornment support
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading = false, loadingText, startAdornment, endAdornment, disabled, className, ...props }, ref) => {
    return (
      <ShadcnButton
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(isLoading && 'cursor-wait', className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            {loadingText ?? children}
          </>
        ) : (
          <>
            {startAdornment}
            {children}
            {endAdornment}
          </>
        )}
      </ShadcnButton>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
