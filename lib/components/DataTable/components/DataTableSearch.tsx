import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';

interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Expandable search — collapsed icon button, expanded search bar
export function DataTableSearch({ value, onChange, placeholder = 'Search...', className }: DataTableSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when expanding
  useEffect(() => {
    if (isExpanded) inputRef.current?.focus();
  }, [isExpanded]);

  // Collapse handler — clears value and collapses
  const handleCollapse = () => {
    onChange('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <Button variant="outline" size="sm" className={cn('h-8 w-8 p-0', className)} onClick={() => setIsExpanded(true)}>
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    );
  }

  return (
    <div
      className={cn('flex items-center border border-input rounded-lg bg-background overflow-hidden h-9', className)}
    >
      <div className="flex items-center px-3 py-2 flex-1">
        <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCollapse();
          }}
          placeholder={placeholder}
          className="bg-transparent text-sm outline-none w-full min-w-[200px] placeholder:text-muted-foreground text-foreground"
        />
      </div>
      <button
        type="button"
        onClick={handleCollapse}
        className="px-2 hover:bg-accent transition-colors h-full"
        aria-label="Close search"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
}

DataTableSearch.displayName = 'DataTableSearch';
