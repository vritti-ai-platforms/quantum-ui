import { ChevronLeft, ChevronRight } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';

interface YearPickerProps {
  value?: Date;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

// Scrolls the button at the given index into view within the grid
function scrollGridToIndex(ref: React.RefObject<HTMLDivElement | null>, index: number) {
  requestAnimationFrame(() => {
    const buttons = ref.current?.querySelectorAll('button');
    buttons?.[index]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}

// Year selection grid with decade navigation
export const YearPicker = ({ value, onSelect, minDate, maxDate, className }: YearPickerProps) => {
  const currentYear = value?.getFullYear() ?? new Date().getFullYear();
  const [decadeStart, setDecadeStart] = useState(() => Math.floor(currentYear / 12) * 12);
  const gridRef = useRef<HTMLDivElement>(null);

  const years = Array.from({ length: 12 }, (_, i) => decadeStart + i);

  // Build a date from the selected year and fire onSelect
  const handleSelect = (year: number) => {
    const date = new Date(value ?? new Date());
    date.setFullYear(year);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
    onSelect(date);
  };

  // Check if a year falls outside the min/max range
  const isDisabled = (year: number) => {
    if (minDate && year < minDate.getFullYear()) return true;
    if (maxDate && year > maxDate.getFullYear()) return true;
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
    const currentIdx = years.indexOf(currentYear);
    const nextIdx = Math.max(0, Math.min(currentIdx + delta, years.length - 1));
    handleSelect(years[nextIdx]);
    scrollGridToIndex(gridRef, nextIdx);
  };

  return (
    <div className={cn('p-3', className)}>
      <div className="mb-2 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => setDecadeStart((d) => d - 12)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium">
          {decadeStart} – {decadeStart + 11}
        </span>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => setDecadeStart((d) => d + 12)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div
        ref={gridRef}
        role="listbox"
        aria-label="Years"
        tabIndex={0}
        className="grid grid-cols-3 gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-md"
        onKeyDown={handleKeyDown}
      >
        {years.map((year) => {
          const selected = currentYear === year;
          const disabled = isDisabled(year);
          return (
            <Button
              key={year}
              role="option"
              aria-selected={selected}
              variant={selected ? 'default' : 'ghost'}
              data-selected={selected || undefined}
              size="sm"
              disabled={disabled}
              className="w-full"
              onClick={() => handleSelect(year)}
            >
              {year}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

YearPicker.displayName = 'YearPicker';
