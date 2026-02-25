import { AlignJustify } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/shadcnPopover';
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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('h-8 w-8 p-0', className)}>
          <AlignJustify className="h-4 w-4" />
          <span className="sr-only">Row density</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <p className="text-sm font-medium mb-3">Row Density</p>
        <div className="space-y-2">
          {densityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                'w-full text-left p-3 rounded-md border transition-colors',
                density === option.value ? 'bg-accent border-primary' : 'hover:bg-accent border-transparent',
              )}
              onClick={() => onDensityChange(option.value)}
            >
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

DataTableRowDensity.displayName = 'DataTableRowDensity';
