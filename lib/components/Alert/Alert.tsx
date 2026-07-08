import type { VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import {
  type alertVariants,
  Alert as ShadcnAlert,
  AlertAction as ShadcnAlertAction,
  AlertDescription as ShadcnAlertDescription,
  AlertTitle as ShadcnAlertTitle,
} from '../../../shadcn/shadcnAlert';
import { cn } from '../../../shadcn/utils';

export interface AlertProps extends Omit<React.ComponentProps<'div'>, 'title'>, VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  hideIcon?: boolean;
}

const variantIcons = {
  default: Info,
  destructive: AlertCircle,
  warning: TriangleAlert,
  success: CheckCircle2,
  info: Info,
} as const;

export function Alert({
  variant = 'default',
  title,
  description,
  action,
  icon,
  hideIcon = false,
  children,
  className,
  ...props
}: AlertProps) {
  const IconComponent = variant ? variantIcons[variant] : variantIcons.default;

  return (
    <ShadcnAlert variant={variant} className={cn(className)} {...props}>
      {!hideIcon && (icon ?? <IconComponent className="h-4 w-4" />)}
      {title && <ShadcnAlertTitle>{title}</ShadcnAlertTitle>}
      {description && <ShadcnAlertDescription>{description}</ShadcnAlertDescription>}
      {action && <ShadcnAlertAction>{action}</ShadcnAlertAction>}
      {children}
    </ShadcnAlert>
  );
}
