import { Inbox } from 'lucide-react';
import { Empty } from '../../Empty';

interface DataTableEmptyProps {
  icon?: React.ElementType;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

// Renders an empty state for the data table using the Empty component
export function DataTableEmpty({
  icon: Icon = Inbox,
  title = 'No results',
  description = 'No data to display.',
  action,
  className,
}: DataTableEmptyProps) {
  return (
    <Empty
      icon={<Icon />}
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}

DataTableEmpty.displayName = 'DataTableEmpty';
