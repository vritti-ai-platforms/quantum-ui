import { ChevronDownIcon } from 'lucide-react';
import type React from 'react';
import { forwardRef, useEffect, useState } from 'react';
import { Button } from '../../../shadcn/shadcnButton';
import { Calendar, type CalendarProps } from '../../../shadcn/shadcnCalendar';
import { Label } from '../../../shadcn/shadcnLabel';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import { cn } from '../../../shadcn/utils';

export interface DatePickerProps {
  /**
   * Label for the date picker
   */
  label?: string;

  /**
   * Helper text to display below the field
   */
  description?: React.ReactNode;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Selected date
   */
  value?: Date;

  /**
   * Callback when date changes
   */
  onValueChange?: (date: Date | undefined) => void;

  /**
   * Whether the popover is controlled
   */
  open?: boolean;

  /**
   * Callback when popover open state changes
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Additional props for Calendar component
   */
  calendarProps?: CalendarProps;

  /**
   * Custom className for the trigger button
   */
  className?: string;

  /**
   * ID for the input element
   */
  id?: string;
}

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      label,
      description,
      error,
      placeholder = 'Select date',
      value,
      onValueChange,
      open: controlledOpen,
      onOpenChange,
      calendarProps,
      className,
      id = 'date',
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [internalDate, setInternalDate] = useState<Date | undefined>(value);

    // Use controlled or uncontrolled state
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

    // Sync internal date with value prop
    useEffect(() => {
      if (value !== undefined) {
        setInternalDate(value);
      }
    }, [value]);

    const handleDateSelect = (date: Date | undefined) => {
      setInternalDate(date);
      onValueChange?.(date);
      setOpen(false);
    };

    const displayDate = value !== undefined ? value : internalDate;

    // Simple shadcn style (matches shadcn/ui documentation example exactly)
    return (
      <div className="flex flex-col gap-3">
        {label && (
          <Label htmlFor={id} className="px-1">
            {label}
          </Label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              id={id}
              aria-invalid={!!error}
              className={cn('w-48 justify-between font-normal', !displayDate && 'text-muted-foreground', className)}
              {...props}
            >
              {displayDate ? displayDate.toLocaleDateString() : placeholder}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              {...calendarProps}
              mode="single"
              selected={displayDate ?? undefined}
              captionLayout="dropdown"
              onSelect={handleDateSelect as (date: Date | undefined) => void}
            />
          </PopoverContent>
        </Popover>
        {description && !error && <p className="text-sm text-muted-foreground px-1">{description}</p>}
        {error && <p className="text-sm text-destructive px-1">{error}</p>}
      </div>
    );
  },
);

DatePicker.displayName = 'DatePicker';
