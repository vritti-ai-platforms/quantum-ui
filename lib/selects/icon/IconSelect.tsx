import { CheckIcon, type LucideIcon, icons as lucideIcons } from 'lucide-react';
import type React from 'react';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { SingleSelectTrigger } from '../../../shadcn/shadcnSingleSelect';
import { cn } from '../../../shadcn/utils';
import { SingleSelect } from '../../components/Select/components/SingleSelect/SingleSelect';
import type { AsyncSelectState, SelectOption } from '../../components/Select/types';
import { ICON_NAMES, type IconKind } from '../../icons';

// Renders a lucide glyph via the STATIC icons map (no per-icon dynamic import) -- the icon
// list is pre-filtered to names this map can resolve. The map adds bundle weight, so it's
// used only here (a heavy picker); data-driven single icons elsewhere keep DynamicIcon.
const ICON_MAP = lucideIcons as Record<string, LucideIcon>;
const toPascalCase = (kebab: string) =>
  kebab
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

function LucideGlyph({ name, className }: { name: string; className?: string }) {
  const Glyph = ICON_MAP[toPascalCase(name)];
  return Glyph ? <Glyph className={className} aria-hidden /> : null;
}

// Renders a Material Symbols glyph via the ligature name. quantum-ui does NOT bundle the icon font —
// the host app must load the Material Symbols font + the `.material-symbols-outlined` class (e.g.
// cloud-web does in its index.css). Where the font isn't present this harmlessly shows the raw name.
function MaterialGlyph({ name, className }: { name: string; className?: string }) {
  return (
    <span className={cn('material-symbols-outlined', className)} style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>
      {name}
    </span>
  );
}

// How many names to reveal per "page". The lists are large (lucide 1670, sf 7843,
// material 4207), so instead of rendering all rows we emulate an async data source:
// filter locally, hand SingleSelect one page, and grow the page as its infinite-scroll
// sentinel comes into view (the same mechanism the optionsEndpoint selects use).
const PAGE_SIZE = 50;

export interface IconSelectProps {
  // Icon family whose names are listed
  kind: IconKind;
  // Selected icon name (controlled)
  value?: string;
  // Fired with the chosen icon name
  onChange?: (name: string) => void;
  onBlur?: () => void;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  className?: string;
  id?: string;
  name?: string;
  error?: string;
}

// Searchable icon-name selector backed by a local paginated source (renders one page,
// loads more on scroll). lucide names render their real glyph; sf/material render as
// monospace text (native mobile symbols, not web-renderable).
export const IconSelect = forwardRef<HTMLButtonElement, IconSelectProps>(
  (
    {
      kind,
      value,
      onChange,
      onBlur,
      label,
      placeholder = 'Select icon',
      searchPlaceholder = 'Search icons...',
      disabled = false,
      required,
      clearable = true,
      className,
      id,
      name,
      error,
    },
    ref,
  ) => {
    const [query, setQuery] = useState('');
    const [limit, setLimit] = useState(PAGE_SIZE);

    // Local "search" -- case-insensitive substring match over the whole family.
    const filtered = useMemo(() => {
      const all = ICON_NAMES[kind] ?? [];
      const q = query.trim().toLowerCase();
      return q ? all.filter((n) => n.toLowerCase().includes(q)) : all;
    }, [kind, query]);

    // The currently revealed page; the selected value is always kept resolvable.
    const options = useMemo<SelectOption[]>(() => {
      const slice = filtered.slice(0, limit);
      const names = value && !slice.includes(value) ? [value, ...slice] : slice;
      return names.map((n) => ({ value: n, label: n }));
    }, [filtered, limit, value]);

    const hasMore = limit < filtered.length;

    // Sentinel-based infinite scroll -- SingleSelect renders <div ref={sentinelRef}> when hasMore.
    const { ref: sentinelRef, inView } = useInView();
    useEffect(() => {
      if (inView && hasMore) setLimit((l) => l + PAGE_SIZE);
    }, [inView, hasMore]);

    // Emulate the async data contract so SingleSelect renders exactly our page (no internal filtering).
    const asyncState: AsyncSelectState = {
      loading: false,
      loadingMore: false,
      hasMore,
      searchQuery: query,
      setSearchQuery: (q: string) => {
        setQuery(q);
        setLimit(PAGE_SIZE);
      },
      sentinelRef,
    };

    const isLucide = kind === 'lucide';
    const isMaterial = kind === 'material';
    // lucide + material render a real glyph in the trigger/options; sf has no web glyph (shows the name).
    const hasGlyph = isLucide || isMaterial;

    return (
      <SingleSelect
        ref={ref}
        label={label}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        searchable
        clearable={clearable}
        disabled={disabled}
        required={required}
        className={className}
        id={id}
        name={name}
        error={error}
        options={options}
        value={value}
        onChange={(v) => {
          onChange?.(v == null ? '' : String(v));
          onBlur?.();
        }}
        asyncState={asyncState}
        anchor={
          hasGlyph
            ? ({ selectedOption, open, disabled: anchorDisabled }) => (
                <SingleSelectTrigger
                  ref={ref}
                  id={id}
                  open={open}
                  aria-invalid={!!error}
                  aria-required={required}
                  disabled={anchorDisabled}
                  className={cn('w-full', className)}
                >
                  <span className="flex flex-1 items-center gap-2 overflow-hidden">
                    {selectedOption ? (
                      <>
                        {isLucide ? (
                          <LucideGlyph name={String(selectedOption.value)} className="size-4 shrink-0" />
                        ) : (
                          <MaterialGlyph name={String(selectedOption.value)} className="shrink-0" />
                        )}
                        <span className="truncate">{selectedOption.label}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">{placeholder}</span>
                    )}
                  </span>
                </SingleSelectTrigger>
              )
            : undefined
        }
        renderOption={({ option, selected, onSelect }) => {
          const iconName = String(option.value);
          function handleKeyDown(e: React.KeyboardEvent) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect();
            }
          }
          return (
            <div
              key={iconName}
              role="option"
              aria-selected={selected}
              tabIndex={0}
              onClick={onSelect}
              onKeyDown={handleKeyDown}
              className="relative flex h-8 w-full cursor-default select-none items-center gap-2 rounded-md px-2 pr-8 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground"
            >
              {isLucide ? (
                <LucideGlyph name={iconName} className="size-4 shrink-0" />
              ) : isMaterial ? (
                <MaterialGlyph name={iconName} className="shrink-0" />
              ) : null}
              <span className={cn('truncate', !hasGlyph && 'font-mono text-xs')}>{iconName}</span>
              <span className="absolute right-2 flex size-3.5 items-center justify-center">
                {selected && <CheckIcon className="size-4" />}
              </span>
            </div>
          );
        }}
      />
    );
  },
);
IconSelect.displayName = 'IconSelect';
