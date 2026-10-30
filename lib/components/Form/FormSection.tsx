import type React from 'react';
import { cn } from '../../../shadcn/utils';
import { useAnyPermissionGranted } from '../PermissionGate';
import { sectionPermissionCodes } from './fieldPermissions';

export interface FormSectionProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

// Hides itself when every field inside is gated and none of their codes is granted (locked counts as granted)
export function FormSection({
  title,
  description,
  children,
  className,
  headerClassName,
  contentClassName,
}: FormSectionProps) {
  const granted = useAnyPermissionGranted(sectionPermissionCodes(children));
  if (!granted) return null;

  return (
    <section className={cn('space-y-3', className)}>
      <div className={cn('border-b pb-2', headerClassName)}>
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</div>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className={cn(contentClassName ?? 'grid grid-cols-2 gap-4')}>{children}</div>
    </section>
  );
}

FormSection.displayName = 'FormSection';
