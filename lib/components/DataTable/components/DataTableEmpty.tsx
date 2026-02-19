import { Inbox } from 'lucide-react';
import { cn } from '../../../../shadcn/utils';

interface DataTableEmptyProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// Renders an empty state for the data table
export function DataTableEmpty({
  icon: Icon = Inbox,
  title = 'No results',
  description = 'No data to display.',
  action,
  className,
}: DataTableEmptyProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

DataTableEmpty.displayName = 'DataTableEmpty';
