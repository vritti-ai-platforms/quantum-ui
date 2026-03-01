import { cn } from '../../../shadcn/utils';

export interface EmptyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: React.ReactNode;
  iconColor?: 'muted' | 'primary' | 'success' | 'destructive' | 'warning';
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

const iconColorMap = {
  muted: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  destructive: 'bg-destructive/15 text-destructive',
  warning: 'bg-warning/15 text-warning',
} as const;

// Renders a centered empty state with optional icon, title, description, and action
export function Empty({
  icon,
  iconColor = 'muted',
  title,
  description,
  action,
  className,
  ...props
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 text-center p-10',
        className,
      )}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            'size-16 rounded-full flex items-center justify-center [&>svg]:size-8',
            iconColorMap[iconColor],
          )}
        >
          {icon}
        </div>
      )}
      {title && <p className="text-foreground font-semibold text-base">{title}</p>}
      {description && (
        <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

Empty.displayName = 'Empty';
