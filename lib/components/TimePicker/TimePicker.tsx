import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import type React from 'react';
import { forwardRef, useEffect, useId, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import { cn } from '../../../shadcn/utils';
import { Button } from '../Button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { TimePickerPanel } from './TimePickerPanel';

export interface TimePickerProps {
  label?: string;
  description?: React.ReactNode;
  error?: string;
  placeholder?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  use12Hour?: boolean;
  hourStep?: number;
  minuteStep?: number;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      label,
      description,
      error,
      placeholder = 'Select time',
      value,
      onChange,
      onBlur,
      open: controlledOpen,
      onOpenChange,
      use12Hour = true,
      hourStep = 1,
      minuteStep = 5,
      className,
      id,
      name: _name,
      disabled,
      clearable,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const resolvedId = id ?? generatedId;

    const [internalOpen, setInternalOpen] = useState(false);
    const [internalTime, setInternalTime] = useState<Date | undefined>(value);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen;

    useEffect(() => {
      if (value !== undefined) {
        setInternalTime(value);
      }
    }, [value]);

    // Fire onBlur when popover closes — marks field as touched for react-hook-form
    const handleOpenChange = (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (!nextOpen) onBlur?.();
    };

    const handleTimeSelect = (date: Date) => {
      setInternalTime(date);
      onChange?.(date);
    };

    // Clears the value and closes the popover
    const handleClear = () => {
      setInternalTime(undefined);
      onChange?.(undefined);
      handleOpenChange(false);
    };

    const displayTime = value !== undefined ? value : internalTime;
    const formatStr = use12Hour ? 'hh:mm aa' : 'HH:mm';

    return (
      <Field data-disabled={disabled}>
        {label && <FieldLabel htmlFor={resolvedId}>{label}</FieldLabel>}

        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              id={resolvedId}
              disabled={disabled}
              aria-invalid={!!error}
              className={cn('w-full justify-between font-normal', !displayTime && 'text-muted-foreground', className)}
              {...props}
            >
              {displayTime ? format(displayTime, formatStr) : placeholder}
              <Clock className="size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <TimePickerPanel
              value={displayTime}
              onValueChange={handleTimeSelect}
              use12Hour={use12Hour}
              hourStep={hourStep}
              minuteStep={minuteStep}
            />
            {clearable && displayTime && (
              <div className="border-t border-border p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

TimePicker.displayName = 'TimePicker';
