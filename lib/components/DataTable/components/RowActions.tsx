import type { LucideIcon } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { useDialog } from '../../../hooks/useDialog';
import { Button } from '../../Button';
import { Dialog } from '../../Dialog';
import { DropdownMenu } from '../../DropdownMenu';

export interface RowAction {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
  hidden?: boolean;
  dialog?: {
    title: string;
    description: string;
    content: (close: () => void) => React.ReactNode;
  };
}

export interface RowActionsProps {
  actions: RowAction[];
}

// Renders a single action as a direct icon button or dialog trigger
const DirectAction: React.FC<{ action: RowAction }> = ({ action }) => {
  const Icon = action.icon;
  const destructiveClass = action.variant === 'destructive' ? 'text-destructive hover:text-destructive' : '';
  const dialog = useDialog();

  if (action.dialog) {
    return (
      <Dialog
        handle={dialog}
        title={action.dialog.title}
        description={action.dialog.description}
        anchor={(open) => (
          <Button
            variant="ghost"
            size="icon"
            className={`size-7 ${destructiveClass}`}
            disabled={action.disabled}
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
      disabled={action.disabled}
      onClick={action.onClick}
      aria-label={action.label}
    >
      <Icon className="size-4" />
    </Button>
  );
};

// Converts actions to DropdownMenu items format
function toDropdownItems(actions: RowAction[]) {
  return actions.map((action) => {
    if (action.dialog) {
      return {
        type: 'dialog' as const,
        id: action.id,
        label: action.label,
        icon: action.icon,
        variant: action.variant,
        disabled: action.disabled,
        dialog: action.dialog,
      };
    }
    return {
      type: 'item' as const,
      id: action.id,
      label: action.label,
      icon: action.icon,
      variant: action.variant,
      disabled: action.disabled,
      onClick: action.onClick,
    };
  });
}

// Auto-layout row actions: 0→null, 1→button, 2→side-by-side, 3+→primary + ⋮ dropdown
export const RowActions: React.FC<RowActionsProps> = ({ actions }) => {
  const visible = actions.filter((a) => !a.hidden);

  if (visible.length === 0) return null;

  if (visible.length === 1) {
    return <DirectAction action={visible[0]} />;
  }

  if (visible.length === 2) {
    return (
      <div className="flex items-center gap-1">
        <DirectAction action={visible[0]} />
        <DirectAction action={visible[1]} />
      </div>
    );
  }

  const [primary, ...overflow] = visible;
  return (
    <div className="flex items-center gap-1">
      <DirectAction action={primary} />
      <DropdownMenu
        trigger={{
          children: (
            <Button variant="ghost" size="icon" className="size-7">
              <MoreVertical className="size-4" />
            </Button>
          ),
        }}
        align="end"
        items={toDropdownItems(overflow)}
      />
    </div>
  );
};
