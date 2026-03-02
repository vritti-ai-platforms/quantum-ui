import type React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '../../../shadcn/utils';
import { Button } from '../Button';

export interface TimePickerPanelProps {
  value?: Date;
  onValueChange?: (date: Date) => void;
  use12Hour?: boolean;
  hourStep?: number;
  minuteStep?: number;
  className?: string;
}

// Scrolls the button at the given index into view within a column container
function scrollColumnToIndex(ref: React.RefObject<HTMLDivElement | null>, index: number) {
  setTimeout(() => {
    const buttons = ref.current?.querySelectorAll('button');
    buttons?.[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, 0);
}

// Standalone scroll-column time picker UI, reusable inside DatePicker datetime mode
export const TimePickerPanel = ({
  value,
  onValueChange,
  use12Hour = true,
  hourStep = 1,
  minuteStep = 5,
  className,
}: TimePickerPanelProps) => {
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const ampmRef = useRef<HTMLDivElement>(null);

  const currentDate = value ?? new Date();

  // Generate hour options based on 12h/24h mode and step
  const hours = use12Hour
    ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter((h) => h % hourStep === 0 || h === 12)
    : Array.from({ length: 24 }, (_, i) => i).filter((h) => h % hourStep === 0);

  // Generate minute options based on step
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

  const ampmItems = ['AM', 'PM'] as const;

  function handleChange(type: 'hour' | 'minute' | 'ampm', val: number | string) {
    const base = new Date(value ?? new Date());

    if (type === 'hour') {
      const h = Number(val);
      if (use12Hour) {
        const isPM = base.getHours() >= 12;
        base.setHours(isPM ? (h % 12) + 12 : h % 12);
      } else {
        base.setHours(h);
      }
    } else if (type === 'minute') {
      base.setMinutes(Number(val));
    } else if (type === 'ampm') {
      const h = base.getHours();
      if (val === 'AM' && h >= 12) base.setHours(h - 12);
      if (val === 'PM' && h < 12) base.setHours(h + 12);
    }

    onValueChange?.(base);
  }

  // Auto-scroll selected items into view on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      for (const ref of [hoursRef, minutesRef, ampmRef]) {
        const el = ref.current?.querySelector('[data-selected]');
        el?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
      }
    }, 1);
    return () => clearTimeout(timeout);
  }, []);

  function isHourSelected(hour: number): boolean {
    if (use12Hour) {
      return currentDate.getHours() % 12 === hour % 12;
    }
    return currentDate.getHours() === hour;
  }

  function isMinuteSelected(minute: number): boolean {
    return currentDate.getMinutes() === minute;
  }

  function isAmPmSelected(period: string): boolean {
    if (period === 'AM') return currentDate.getHours() < 12;
    return currentDate.getHours() >= 12;
  }

  return (
    <div className={cn('flex divide-x divide-border', className)}>
      {/* Hours column */}
      <div
        ref={hoursRef}
        role="listbox"
        aria-label="Hours"
        tabIndex={0}
        className="relative h-72 w-16 overflow-y-auto p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            return;
          }
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
          e.preventDefault();
          const currentIdx = hours.findIndex((h) => isHourSelected(h));
          const nextIdx =
            e.key === 'ArrowDown' ? Math.min(currentIdx + 1, hours.length - 1) : Math.max(currentIdx - 1, 0);
          handleChange('hour', hours[nextIdx]);
          scrollColumnToIndex(hoursRef, nextIdx);
        }}
      >
        <div className="flex flex-col">
          {hours.map((hour) => {
            const selected = isHourSelected(hour);
            return (
              <Button
                key={hour}
                size="icon"
                role="option"
                aria-selected={selected}
                variant={selected ? 'default' : 'ghost'}
                data-selected={selected || undefined}
                className="w-full shrink-0"
                onClick={() => handleChange('hour', hour)}
              >
                {use12Hour ? hour : hour.toString().padStart(2, '0')}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Minutes column */}
      <div
        ref={minutesRef}
        role="listbox"
        aria-label="Minutes"
        tabIndex={0}
        className="relative h-72 w-16 overflow-y-auto p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            return;
          }
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
          e.preventDefault();
          const currentIdx = minutes.findIndex((m) => isMinuteSelected(m));
          const nextIdx =
            e.key === 'ArrowDown' ? Math.min(currentIdx + 1, minutes.length - 1) : Math.max(currentIdx - 1, 0);
          handleChange('minute', minutes[nextIdx]);
          scrollColumnToIndex(minutesRef, nextIdx);
        }}
      >
        <div className="flex flex-col">
          {minutes.map((minute) => {
            const selected = isMinuteSelected(minute);
            return (
              <Button
                key={minute}
                size="icon"
                role="option"
                aria-selected={selected}
                variant={selected ? 'default' : 'ghost'}
                data-selected={selected || undefined}
                className="w-full shrink-0"
                onClick={() => handleChange('minute', minute)}
              >
                {minute.toString().padStart(2, '0')}
              </Button>
            );
          })}
        </div>
      </div>

      {/* AM/PM column (12h mode only) */}
      {use12Hour && (
        <div
          ref={ampmRef}
          role="listbox"
          aria-label="AM/PM"
          tabIndex={0}
          className="relative h-72 w-16 overflow-y-auto p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              return;
            }
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
            e.preventDefault();
            const currentIdx = ampmItems.findIndex((p) => isAmPmSelected(p));
            const nextIdx =
              e.key === 'ArrowDown' ? Math.min(currentIdx + 1, ampmItems.length - 1) : Math.max(currentIdx - 1, 0);
            handleChange('ampm', ampmItems[nextIdx]);
            scrollColumnToIndex(ampmRef, nextIdx);
          }}
        >
          <div className="flex flex-col">
            {ampmItems.map((period) => {
              const selected = isAmPmSelected(period);
              return (
                <Button
                  key={period}
                  size="icon"
                  role="option"
                  aria-selected={selected}
                  variant={selected ? 'default' : 'ghost'}
                  data-selected={selected || undefined}
                  className="w-full shrink-0"
                  onClick={() => handleChange('ampm', period)}
                >
                  {period}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

TimePickerPanel.displayName = 'TimePickerPanel';
