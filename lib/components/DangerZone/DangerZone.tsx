import { AlertTriangle } from 'lucide-react';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { usePermission } from '../PermissionGate';

export interface DangerZoneProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  warning?: string;
  /** When true, renders the `warning` alert below the action */
  showWarning?: boolean;
  /** Permission code gating the action: hides the whole card when not granted; the button locks (disabled) when locked */
  permission?: string;
}

// Renders a destructive-bordered card with a warning heading, description, and action button
export const DangerZone = ({
  title,
  description,
  buttonText,
  onClick,
  disabled,
  isLoading,
  warning,
  showWarning,
  permission,
}: DangerZoneProps) => {
  // No provider / no code resolves to granted, so the card renders unless a role explicitly withholds delete
  const { granted } = usePermission(permission);
  if (!granted) {
    return null;
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="size-4" />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            permission={permission}
            onClick={onClick}
            disabled={disabled}
            isLoading={isLoading}
          >
            {buttonText}
          </Button>
        </div>
        {showWarning && warning && (
          <div className="mt-4">
            <Alert variant="warning" description={warning} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

DangerZone.displayName = 'DangerZone';
