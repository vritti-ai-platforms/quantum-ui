import type React from 'react';
import { cn } from '../../../shadcn/utils';

export interface NumberRulesProps {
  integer?: boolean;
  positive?: boolean;
  nonZero?: boolean;
}

// The rules a number field keeps, as chips with the sentence each stands for: whole numbers, above zero, and not zero
// where above zero does not already rule it out
function numberRules({ integer, positive, nonZero }: NumberRulesProps): { text: string; title: string }[] {
  return [
    integer && { text: 'Int', title: 'Whole numbers only' },
    positive && { text: '> 0', title: 'Greater than zero' },
    !positive && nonZero && { text: '≠ 0', title: 'Must not be zero' },
  ].filter((rule): rule is { text: string; title: string } => !!rule);
}

// A number field's label with its rules right-aligned on the same line; the label alone when it has none
export const NumberFieldLabelRow: React.FC<NumberRulesProps & { children: React.ReactNode }> = ({
  children,
  ...rules
}) => {
  if (numberRules(rules).length === 0) return <>{children}</>;
  return (
    <div className="flex items-center justify-between gap-2">
      {children}
      <NumberRuleChips {...rules} />
    </div>
  );
};

// A number field's rules as chips, for a field with no label row to carry them
export const NumberRuleChips: React.FC<NumberRulesProps> = (rules) => {
  const chips = numberRules(rules);
  if (chips.length === 0) return null;
  return (
    <span className="flex shrink-0 gap-1">
      {chips.map((chip) => (
        <span
          key={chip.text}
          title={chip.title}
          className="cursor-help rounded-sm border border-border px-1.5 text-2xs leading-4 font-medium text-muted-foreground"
        >
          <span className="sr-only">{chip.title}</span>
          <span aria-hidden>{chip.text}</span>
        </span>
      ))}
    </span>
  );
};

// A number field's bounds in words, each amount already formatted: "of 4" for a maximum, "min 2" for a minimum, "2 to 4"
// for both; undefined without either
export function boundWords(min: string | undefined, max: string | undefined): string | undefined {
  if (min !== undefined && max !== undefined) return `${min} to ${max}`;
  if (max !== undefined) return `of ${max}`;
  if (min !== undefined) return `min ${min}`;
  return undefined;
}

// Whether a value falls outside its bounds; never while it is empty
export function isOutOfBounds(value: number | null | undefined, min?: number, max?: number): boolean {
  if (value == null || !Number.isFinite(value)) return false;
  return (max !== undefined && value > max) || (min !== undefined && value < min);
}

// The bound placed right after the text an input shows: an invisible copy of that text (the value, else the
// placeholder) takes its width, so the bound follows the value as it is typed. Pass the input's left padding and font
// classes (size, tabular-nums) so the copy lines up with it
export const BoundAfterValue: React.FC<{ text: string; bound: string; outOfBounds?: boolean; className?: string }> = ({
  text,
  bound,
  outOfBounds,
  className,
}) => (
  <div
    aria-hidden
    className={cn(
      'pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center overflow-hidden whitespace-pre',
      className,
    )}
  >
    <span className="invisible">{text}</span>
    <span className={cn('ml-1.5 text-xs text-muted-foreground tabular-nums', outOfBounds && 'text-destructive')}>
      {bound}
    </span>
  </div>
);
