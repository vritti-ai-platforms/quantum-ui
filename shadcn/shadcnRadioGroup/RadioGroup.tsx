import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import type * as React from 'react';

import { cn } from '../utils';

// Base RadioGroup root wrapper
function ShadcnRadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn('flex flex-col gap-3', className)}
      {...props}
    />
  );
}

// Individual radio item with indicator dot
function ShadcnRadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        'aspect-square size-4 shrink-0 rounded-full border-2 border-input shadow-xs outline-none cursor-pointer transition-colors',
        'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring',
        'data-[state=checked]:border-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="size-2 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { ShadcnRadioGroup, ShadcnRadioGroupItem };
