import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';

interface DataTableSelectionBarProps {
  count: number;
  onClear: () => void;
  children?: React.ReactNode;
  className?: string;
}

// Renders a selection info bar showing selected row count with clear action
export function DataTableSelectionBar({ count, onClear, children, className }: DataTableSelectionBarProps) {
  if (count === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg', className)}>
      <span className="text-sm font-medium text-primary">
        {count} row{count !== 1 ? 's' : ''} selected
      </span>
      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/15" onClick={onClear}>
        Clear selection
      </Button>
      {children}
    </div>
  );
}

DataTableSelectionBar.displayName = 'DataTableSelectionBar';
