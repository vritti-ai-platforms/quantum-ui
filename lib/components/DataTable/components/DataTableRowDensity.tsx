import { AlignJustify } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';

type DensityType = 'compact' | 'normal' | 'comfortable';

interface DataTableRowDensityProps {
  density: DensityType;
  onDensityChange: (density: DensityType) => void;
  className?: string;
}

const densityOptions: { value: DensityType; label: string; description: string }[] = [
  { value: 'compact', label: 'Compact', description: 'Condensed view with less padding' },
  { value: 'normal', label: 'Normal', description: 'Default table density' },
  { value: 'comfortable', label: 'Comfortable', description: 'Spacious view with more padding' },
];

// Renders a row density toggle popover with compact/normal/comfortable options
export function DataTableRowDensity({ density, onDensityChange, className }: DataTableRowDensityProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setOpen(!open)}>
        <AlignJustify className="h-4 w-4" />
        <span className="sr-only">Row density</span>
      </Button>

      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Close density menu"
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border bg-background p-3 shadow-md">
            <p className="text-sm font-medium mb-3">Row Density</p>
            <div className="space-y-2">
              {densityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    density === option.value ? 'bg-accent border-primary' : 'hover:bg-accent border-transparent'
                  }`}
                  onClick={() => {
                    onDensityChange(option.value);
                    setOpen(false);
                  }}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

DataTableRowDensity.displayName = 'DataTableRowDensity';
