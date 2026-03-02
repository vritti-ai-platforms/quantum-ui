import { ChevronLeft, ChevronRight } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';

interface MonthPickerProps {
  value?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Scrolls the button at the given index into view within the grid
function scrollGridToIndex(ref: React.RefObject<HTMLDivElement | null>, index: number) {
  requestAnimationFrame(() => {
    const buttons = ref.current?.querySelectorAll('button');
    buttons?.[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}

// Month selection grid with year navigation
export const MonthPicker = ({ value, onSelect, minDate, maxDate, className }: MonthPickerProps) => {
  const [viewYear, setViewYear] = useState(() => value?.getFullYear() ?? new Date().getFullYear());
  const gridRef = useRef<HTMLDivElement>(null);

  const selectedMonth = value?.getMonth();
  const selectedYear = value?.getFullYear();

  // Build a date from the selected month/year and fire onSelect
  const handleSelect = (month: number) => {
    const date = new Date(value ?? new Date());
    date.setFullYear(viewYear);
    date.setMonth(month, 1);
    date.setHours(0, 0, 0, 0);
    onSelect(date);
  };

  // Check if a month falls outside the min/max range
  const isDisabled = (month: number) => {
    if (minDate) {
      if (viewYear < minDate.getFullYear()) return true;
      if (viewYear === minDate.getFullYear() && month < minDate.getMonth()) return true;
    }
    if (maxDate) {
      if (viewYear > maxDate.getFullYear()) return true;
      if (viewYear === maxDate.getFullYear() && month > maxDate.getMonth()) return true;
    }
    return false;
  };

  // Handle arrow key navigation within the 3-column grid
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      return;
    }
    const directions: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3 };
    const delta = directions[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const currentIdx = selectedYear === viewYear && selectedMonth !== undefined ? selectedMonth : 0;
    const nextIdx = Math.max(0, Math.min(currentIdx + delta, MONTHS.length - 1));
    handleSelect(nextIdx);
    scrollGridToIndex(gridRef, nextIdx);
  };

  return (
    <div className={cn('p-3', className)}>
      <div className="mb-2 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => setViewYear((y) => y - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium">{viewYear}</span>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => setViewYear((y) => y + 1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div
        ref={gridRef}
        role="listbox"
        aria-label="Months"
        tabIndex={0}
        className="grid grid-cols-3 gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-md"
        onKeyDown={handleKeyDown}
      >
        {MONTHS.map((name, index) => {
          const selected = selectedYear === viewYear && selectedMonth === index;
          const disabled = isDisabled(index);
          return (
            <Button
              key={name}
              role="option"
              aria-selected={selected}
              variant={selected ? 'default' : 'ghost'}
              data-selected={selected || undefined}
              size="sm"
              disabled={disabled}
              className="w-full"
              onClick={() => handleSelect(index)}
            >
              {name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

MonthPicker.displayName = 'MonthPicker';
