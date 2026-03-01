import type { Table } from '@tanstack/react-table';
import { AlignJustify, Check } from 'lucide-react';
import { cn } from '../../../../shadcn/utils';
import { Button } from '../../Button';
import { DropdownMenu } from '../../DropdownMenu';
import type { DataTableMeta, DensityType } from '../types';

interface DataTableRowDensityProps {
  table: Table<unknown>;
  className?: string;
}

const densityOptions: { value: DensityType; label: string; description: string }[] = [
  { value: 'compact', label: 'Compact', description: 'Condensed view with less padding' },
  { value: 'normal', label: 'Normal', description: 'Default table density' },
  { value: 'comfortable', label: 'Comfortable', description: 'Spacious view with more padding' },
];

// Renders a row density toggle dropdown with compact/normal/comfortable options
export function DataTableRowDensity({ table, className }: DataTableRowDensityProps) {
  const meta = table.options.meta as DataTableMeta;
  const density = meta.density;
  const setDensity = meta.setDensity;

  return (
    <DropdownMenu
      trigger={{
        children: (
          <Button variant="outline" size="sm" className={cn('h-8 w-8 p-0', className)}>
            <AlignJustify className="h-4 w-4" />
            <span className="sr-only">Row density</span>
          </Button>
        ),
      }}
      contentClassName="w-56"
      align="end"
      items={densityOptions.map((option) => ({
        type: 'custom' as const,
        id: option.value,
        asMenuItem: true,
        onClick: () => setDensity(option.value),
        render: (
          <div className="flex items-start gap-2 py-0.5">
            <Check className={cn('h-4 w-4 mt-0.5 shrink-0', density === option.value ? 'opacity-100' : 'opacity-0')} />
            <div>
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
          </div>
        ),
      }))}
    />
  );
}

DataTableRowDensity.displayName = 'DataTableRowDensity';
