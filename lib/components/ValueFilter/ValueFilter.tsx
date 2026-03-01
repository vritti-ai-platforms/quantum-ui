import { ChevronDownIcon, X } from 'lucide-react';
import { useCallback, useEffect, useId, useState } from 'react';
import { Input } from '../../../shadcn/shadcnInput';
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/shadcnPopover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../shadcn/shadcnSelect';
import { cn } from '../../../shadcn/utils';
import type { FilterCondition, FilterOperator, NumberOperator, StringOperator } from '../../types/table-filter';
import { Button } from '../Button';

export interface ValueFilterProps {
  label: string;
  fieldKey: string;
  fieldType: 'string' | 'number';
  value?: FilterCondition;
  onChange: (value: FilterCondition | undefined) => void;
  className?: string;
}

interface OperatorOption {
  value: FilterOperator;
  label: string;
}

const STRING_OPERATORS: OperatorOption[] = [
  { value: 'contains', label: 'contains' },
  { value: 'notContains', label: "doesn't contain" },
  { value: 'equals', label: 'equals' },
  { value: 'notEquals', label: 'not equals' },
];

const NUMBER_OPERATORS: OperatorOption[] = [
  { value: 'equals', label: '=' },
  { value: 'notEquals', label: '\u2260' },
  { value: 'gt', label: '>' },
  { value: 'gte', label: '\u2265' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '\u2264' },
];

const DEFAULT_STRING_OPERATOR: StringOperator = 'contains';
const DEFAULT_NUMBER_OPERATOR: NumberOperator = 'equals';

// Resolves the display label for an operator given the field type
function getOperatorLabel(operator: FilterOperator, fieldType: 'string' | 'number'): string {
  const options = fieldType === 'string' ? STRING_OPERATORS : NUMBER_OPERATORS;
  return options.find((o) => o.value === operator)?.label ?? operator;
}

// Compact filter chip with operator/value popover for building filter conditions
export const ValueFilter: React.FC<ValueFilterProps> = ({ label, fieldKey, fieldType, value, onChange, className }) => {
  const popoverId = useId();
  const [open, setOpen] = useState(false);
  const [draftOperator, setDraftOperator] = useState<FilterOperator>(
    value?.operator ?? (fieldType === 'string' ? DEFAULT_STRING_OPERATOR : DEFAULT_NUMBER_OPERATOR),
  );
  const [draftValue, setDraftValue] = useState<string>(value?.value !== undefined ? String(value.value) : '');

  // Sync draft state when the external value changes while popover is closed
  useEffect(() => {
    if (!open) {
      setDraftOperator(
        value?.operator ?? (fieldType === 'string' ? DEFAULT_STRING_OPERATOR : DEFAULT_NUMBER_OPERATOR),
      );
      setDraftValue(value?.value !== undefined ? String(value.value) : '');
    }
  }, [value, fieldType, open]);

  const operators = fieldType === 'string' ? STRING_OPERATORS : NUMBER_OPERATORS;

  // Commits the draft filter condition to the parent
  const handleApply = useCallback(() => {
    if (draftValue.trim() === '') return;

    const parsedValue = fieldType === 'number' ? Number(draftValue) : draftValue;
    if (fieldType === 'number' && Number.isNaN(parsedValue)) return;

    onChange({ field: fieldKey, operator: draftOperator, value: parsedValue });
    setOpen(false);
  }, [draftValue, draftOperator, fieldKey, fieldType, onChange]);

  // Clears the filter condition
  const handleClear = useCallback(() => {
    onChange(undefined);
    setDraftOperator(fieldType === 'string' ? DEFAULT_STRING_OPERATOR : DEFAULT_NUMBER_OPERATOR);
    setDraftValue('');
    setOpen(false);
  }, [onChange, fieldType]);

  // Clears inline from the chip without opening the popover
  const handleInlineClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleClear();
    },
    [handleClear],
  );

  const hasValue = value !== undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-controls={popoverId}
          aria-expanded={open}
          className={cn(
            'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            hasValue
              ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
              : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
            className,
          )}
        >
          <span className="truncate">
            {hasValue
              ? `${label}: ${getOperatorLabel(value.operator, fieldType)} \u00B7 ${value.value}`
              : label}
          </span>
          {hasValue ? (
            <X className="size-3.5 shrink-0 opacity-70 hover:opacity-100" onClick={handleInlineClear} />
          ) : (
            <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent id={popoverId} className="w-[280px] p-0" align="start">
        <div className="px-4 pt-4 pb-2">
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="space-y-3 px-4 pb-4">
          <Select value={draftOperator} onValueChange={(v) => setDraftOperator(v as FilterOperator)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {operators.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type={fieldType === 'number' ? 'number' : 'text'}
            placeholder={`Enter ${label.toLowerCase()}...`}
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApply();
              }
            }}
          />

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button size="sm" onClick={handleApply} disabled={draftValue.trim() === ''}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

ValueFilter.displayName = 'ValueFilter';
