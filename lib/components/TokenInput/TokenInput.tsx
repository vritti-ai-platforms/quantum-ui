import { Lock, X } from 'lucide-react';
import React from 'react';
import { cn } from '../../../shadcn/utils';
import { withDisabledTip } from '../../utils/disabledTip';
import { Field, FieldDescription, FieldError, FieldLabel } from '../Field';
import { lockedTip, PermissionLockIcon, usePermission } from '../PermissionGate';

export interface TokenInputProps {
  name?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  deletableValues?: string[];
  /** Permission code gating this field: hidden when not granted, disabled with a lock + upsell tip when locked */
  permission?: string;
}

export const TokenInput = React.forwardRef<HTMLInputElement, TokenInputProps>(
  (
    {
      name,
      value,
      onChange,
      onBlur,
      label,
      description,
      placeholder = 'value',
      error,
      disabled: disabledProp,
      deletableValues,
      permission,
    },
    ref,
  ) => {
    const gate = usePermission(permission);
    const { granted, locked, reason } = gate;
    // enable = role ∧ plan ∧ BU: granted but locked renders disabled with the upsell as its tooltip
    const disabled = disabledProp || locked;
    const tokens = value ?? [];
    const [draft, setDraft] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);
    const initialValuesRef = React.useRef<string[]>(value ?? []);

    const assignRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    const isRemovable = React.useCallback(
      (token: string) => {
        if (disabled) return false;
        if (deletableValues === undefined) return true;
        if (deletableValues.includes(token)) return true;
        return !initialValuesRef.current.includes(token);
      },
      [disabled, deletableValues],
    );

    const commit = () => {
      const next = draft.trim();
      setDraft('');
      if (disabled || !next || tokens.includes(next)) return;
      onChange?.([...tokens, next]);
    };

    const remove = (token: string) => {
      if (disabled || !isRemovable(token)) return;
      onChange?.(tokens.filter((t) => t !== token));
      inputRef.current?.focus();
    };

    const removeLastRemovable = () => {
      for (let i = tokens.length - 1; i >= 0; i--) {
        if (isRemovable(tokens[i])) {
          remove(tokens[i]);
          return;
        }
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        event.stopPropagation();
        commit();
        return;
      }
      if (event.key === 'Backspace' && draft.length === 0 && tokens.length > 0) {
        event.preventDefault();
        removeLastRemovable();
      }
    };

    // render = role: the role doesn't grant this field, so it doesn't exist for this user
    if (!granted) {
      return null;
    }

    return (
      <Field data-disabled={disabled}>
        {label && (
          <FieldLabel className={cn(locked && 'items-center gap-1.5')}>
            {locked && <PermissionLockIcon reason={reason} className="size-3.5" />}
            {label}
          </FieldLabel>
        )}

        {/* A div, not a button: the tokens carry their own remove buttons and a button cannot contain
            one. The click only forwards focus to the input, which is itself a tab stop — so this adds
            a mouse target for the padding rather than any behaviour of its own. */}
        {withDisabledTip(
          // biome-ignore lint/a11y/useKeyWithClickEvents: the nested input is the keyboard path
          // biome-ignore lint/a11y/noStaticElementInteractions: click-to-focus surface, not a control
          <div
            aria-disabled={disabled}
            onClick={disabled ? undefined : () => inputRef.current?.focus()}
            aria-invalid={!!error}
            className={cn(
              'flex min-h-11 flex-wrap items-center gap-2 rounded-md border bg-background px-2.5 py-2 text-left',
              'focus-within:ring-2 focus-within:ring-ring',
              error && 'border-destructive',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {tokens.map((token) => {
              const removable = isRemovable(token);
              return (
                <span
                  key={token}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border py-1 text-sm',
                    removable ? 'bg-card pl-3 pr-1.5' : 'bg-muted px-3 text-muted-foreground',
                  )}
                >
                  {!removable && <Lock className="size-3" aria-hidden="true" />}
                  {token}
                  {removable ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(token);
                      }}
                      aria-label={`Remove ${token}`}
                      className="flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  ) : (
                    <span title="In use — cannot be removed" className="sr-only">
                      In use — cannot be removed
                    </span>
                  )}
                </span>
              );
            })}
            <span className="flex items-center gap-1 rounded-full border border-dashed px-3 py-1 text-sm text-muted-foreground focus-within:border-ring focus-within:text-foreground">
              +
              <input
                ref={assignRef}
                name={name}
                value={draft}
                disabled={disabled}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  commit();
                  onBlur?.();
                }}
                placeholder={placeholder}
                className="w-24 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
              />
            </span>
          </div>,
          locked ? lockedTip(gate) : undefined,
          disabled,
          'block w-full',
        )}

        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    );
  },
);

TokenInput.displayName = 'TokenInput';
