import * as React from 'react';
import { Button as ShadcnButton, buttonVariants } from '../../../shadcn/shadcnButton';
import { Spinner } from '../Spinner';
import { cn } from '../../../shadcn/utils';

export interface ButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  /** Shows loading spinner and disables button */
  isLoading?: boolean;
  /** Text to display while loading (defaults to children) */
  loadingText?: string;
}

/**
 * Button component with built-in loading state support.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Button>Click me</Button>
 *
 * // Loading state
 * <Button isLoading>Submit</Button>
 *
 * // Loading with custom text
 * <Button isLoading loadingText="Submitting...">Submit</Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, isLoading = false, loadingText, disabled, className, ...props }, ref) => {
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
          children
        )}
      </ShadcnButton>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
