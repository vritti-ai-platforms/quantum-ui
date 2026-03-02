import type React from 'react';
import type { CalendarProps } from '../../../shadcn/shadcnCalendar';

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface DatePickerPreset {
  label: string;
  value: DateRange;
}

export type PickerType = 'year' | 'month' | 'date' | 'time' | 'datetime';

interface DatePickerBaseProps {
  label?: string;
  description?: React.ReactNode;
  error?: string;
  placeholder?: string;
  format?: string;
  onBlur?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  calendarProps?: CalendarProps;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  hourStep?: number;
  minuteStep?: number;
  clearable?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export interface DatePickerSingleProps extends DatePickerBaseProps {
  range?: false;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  presets?: never;
}

export interface DatePickerRangeProps extends DatePickerBaseProps {
  range: true;
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  presets?: DatePickerPreset[];
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;
