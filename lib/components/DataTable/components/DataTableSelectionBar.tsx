import pluralize from 'pluralize-esm';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';

interface DataTableSelectionBarProps {
  count: number;
  onClear: () => void;
  itemLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

// Renders a selection info bar showing selected row count with clear action
export function DataTableSelectionBar({ count, onClear, itemLabel = 'row', children, className }: DataTableSelectionBarProps) {
  if (count === 0) return null;

  return (
    <div className={cn('flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg', className)}>
      <span className="text-sm font-medium text-primary mr-2">
        {count} {pluralize(itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1), count)} selected
      </span>
      {children}
      <div className="ml-auto">
        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/15" onClick={onClear}>
          Clear selection
        </Button>
      </div>
    </div>
  );
}

DataTableSelectionBar.displayName = 'DataTableSelectionBar';
