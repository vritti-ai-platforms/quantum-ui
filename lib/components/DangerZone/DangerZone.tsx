import { AlertTriangle } from 'lucide-react';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';

export interface DangerZoneProps {
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
  // When set, renders a warning alert below the action row
  warning?: string;
}

// Renders a destructive-bordered card with a warning heading, description, and action button
export const DangerZone = ({ title, description, buttonText, onClick, disabled, warning }: DangerZoneProps) => {
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
          <Button variant="destructive" size="sm" onClick={onClick} disabled={disabled}>
            {buttonText}
          </Button>
        </div>
        {warning && (
          <div className="mt-4">
            <Alert variant="warning" description={warning} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

DangerZone.displayName = 'DangerZone';
