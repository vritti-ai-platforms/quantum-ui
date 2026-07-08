import type { LucideIcon } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { useDialog } from '../../../hooks/useDialog';
import { Button } from '../../Button';
import { Dialog } from '../../Dialog';
import { DropdownMenu } from '../../DropdownMenu';
import { lockedTip, usePermissionGate } from '../../PermissionGate';

export interface RowAction {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  hidden?: boolean;
  permission?: string;
  dialog?: {
    title: string;
    description: string;
    className?: string;
    badgeSlot?: React.ReactNode;
    content: (close: () => void) => React.ReactNode;
  };
}

export interface RowActionsProps {
  actions: RowAction[];
  disabledAll?: boolean;
}

type ResolvedAction = RowAction & { lockTip?: string };

// Renders a single action as a direct icon button or dialog trigger
const DirectAction: React.FC<{ action: ResolvedAction; disabledAll?: boolean }> = ({ action, disabledAll }) => {
  const Icon = action.icon;
  const destructiveClass = action.variant === 'destructive' ? 'text-destructive hover:text-destructive' : '';
  const dialog = useDialog();

  if (action.dialog) {
    return (
      <Dialog
        handle={dialog}
        icon={action.icon}
        iconVariant={action.variant === 'destructive' ? 'destructive' : 'default'}
        title={action.dialog.title}
        description={action.dialog.description}
        badgeSlot={action.dialog.badgeSlot}
        className={action.dialog.className}
        anchor={(open) => (
          <Button
            variant="ghost"
            size="icon"
            className={`size-7 ${destructiveClass}`}
            disabled={disabledAll || action.disabled}
            disabledTip={action.lockTip}
            onClick={open}
            aria-label={action.label}
          >
            <Icon className="size-4" />
          </Button>
        )}
        content={action.dialog.content}
      />
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`size-7 ${destructiveClass}`}
      disabled={disabledAll || action.disabled}
      disabledTip={action.lockTip}
      onClick={action.onClick}
      aria-label={action.label}
    >
      <Icon className="size-4" />
    </Button>
  );
};

// Converts actions to DropdownMenu items format
function toDropdownItems(actions: ResolvedAction[], disabledAll?: boolean) {
  return actions.map((action) => {
    if (action.dialog) {
      return {
        type: 'dialog' as const,
        id: action.id,
        label: action.label,
        icon: action.icon,
        variant: action.variant,
        disabled: disabledAll || action.disabled,
        dialog: action.dialog,
      };
    }
    return {
      type: 'item' as const,
      id: action.id,
      label: action.label,
      icon: action.icon,
      variant: action.variant,
      disabled: disabledAll || action.disabled,
      onClick: action.onClick,
    };
  });
}

// Auto-layout row actions: 0→null, 1→button, 2→side-by-side, 3+→primary + ⋮ dropdown
export const RowActions: React.FC<RowActionsProps> = ({ actions, disabledAll }) => {
  const gate = usePermissionGate();

  // Resolve permissions before the visibility filter so the 1/2/3+ layout counts only what the role grants
  const resolved: ResolvedAction[] = actions.map((action) => {
    if (!action.permission) return action;
    const result = gate(action.permission);
    if (!result.granted) return { ...action, hidden: true };
    if (result.locked) return { ...action, disabled: true, lockTip: lockedTip(result) };
    return action;
  });

  const visible = resolved.filter((a) => !a.hidden);

  if (visible.length === 0) return null;

  if (visible.length === 1) {
    return <DirectAction action={visible[0]} disabledAll={disabledAll} />;
  }

  if (visible.length === 2) {
    return (
      <div className="flex items-center gap-1">
        <DirectAction action={visible[0]} disabledAll={disabledAll} />
        <DirectAction action={visible[1]} disabledAll={disabledAll} />
      </div>
    );
  }

  const [primary, ...overflow] = visible;
  return (
    <div className="flex items-center gap-1">
      <DirectAction action={primary} disabledAll={disabledAll} />
      <DropdownMenu
        trigger={{
          children: (
            <Button variant="ghost" size="icon" className="size-7" disabled={disabledAll}>
              <MoreVertical className="size-4" />
            </Button>
          ),
        }}
        align="end"
        items={toDropdownItems(overflow, disabledAll)}
      />
    </div>
  );
};
