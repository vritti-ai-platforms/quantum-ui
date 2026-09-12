import type { LucideIcon } from 'lucide-react';
import type React from 'react';
import { Fragment, useMemo, useState } from 'react';
import {
  DropdownMenuCheckboxItem as ShadcnDropdownMenuCheckboxItem,
  DropdownMenuContent as ShadcnDropdownMenuContent,
  DropdownMenuGroup as ShadcnDropdownMenuGroup,
  DropdownMenuItem as ShadcnDropdownMenuItem,
  DropdownMenuLabel as ShadcnDropdownMenuLabel,
  DropdownMenuPortal as ShadcnDropdownMenuPortal,
  DropdownMenuRadioGroup as ShadcnDropdownMenuRadioGroup,
  DropdownMenuRadioItem as ShadcnDropdownMenuRadioItem,
  DropdownMenu as ShadcnDropdownMenuRoot,
  DropdownMenuSeparator as ShadcnDropdownMenuSeparator,
  DropdownMenuShortcut as ShadcnDropdownMenuShortcut,
  DropdownMenuSub as ShadcnDropdownMenuSub,
  DropdownMenuSubContent as ShadcnDropdownMenuSubContent,
  DropdownMenuSubTrigger as ShadcnDropdownMenuSubTrigger,
  DropdownMenuTrigger as ShadcnDropdownMenuTrigger,
} from '../../../shadcn/shadcnDropdownMenu';
import type { DialogHandle } from '../../hooks/useDialog';
import { Button } from '../Button';
import { Dialog } from '../Dialog';
import {
  lockedTip,
  type PermissionGateFn,
  PermissionLockIcon,
  type PermissionLockReason,
  usePermissionGate,
} from '../PermissionGate';
import type { DialogMenuItem, DropdownMenuProps, MenuItem } from './types';

const DropdownMenuRoot = ShadcnDropdownMenuRoot;
const DropdownMenuCheckboxItem = ShadcnDropdownMenuCheckboxItem;
const DropdownMenuContent = ShadcnDropdownMenuContent;
const DropdownMenuGroup = ShadcnDropdownMenuGroup;
const DropdownMenuItem = ShadcnDropdownMenuItem;
const DropdownMenuLabel = ShadcnDropdownMenuLabel;
const DropdownMenuPortal = ShadcnDropdownMenuPortal;
const DropdownMenuRadioGroup = ShadcnDropdownMenuRadioGroup;
const DropdownMenuRadioItem = ShadcnDropdownMenuRadioItem;
const DropdownMenuSeparator = ShadcnDropdownMenuSeparator;
const DropdownMenuShortcut = ShadcnDropdownMenuShortcut;
const DropdownMenuSub = ShadcnDropdownMenuSub;
const DropdownMenuSubContent = ShadcnDropdownMenuSubContent;
const DropdownMenuSubTrigger = ShadcnDropdownMenuSubTrigger;
const DropdownMenuTrigger = ShadcnDropdownMenuTrigger;

interface LockInfo {
  reason: PermissionLockReason | null;
  tip: string;
}

type LockMap = Map<string, LockInfo>;

const resolveItems = (items: MenuItem[], gate: PermissionGateFn, locks: LockMap): MenuItem[] => {
  const resolved: MenuItem[] = [];

  for (const item of items) {
    const entry =
      item.type === 'sub' || item.type === 'group' ? { ...item, items: resolveItems(item.items, gate, locks) } : item;

    if ((entry.type === 'sub' || entry.type === 'group') && entry.items.length === 0) continue;
    if ('hidden' in entry && entry.hidden) continue;

    if (!('permission' in entry) || !entry.permission) {
      resolved.push(entry);
      continue;
    }

    const result = gate(entry.permission);
    if (!result.granted) continue;
    if (result.locked) {
      locks.set(entry.id, { reason: result.reason, tip: lockedTip(result) });
      resolved.push({ ...entry, disabled: true });
      continue;
    }
    resolved.push(entry);
  }

  return resolved.filter((item, index, list) => {
    if (item.type !== 'separator') return true;
    const previous = list[index - 1];
    const next = list.slice(index + 1).find((candidate) => candidate.type !== 'separator');
    return previous !== undefined && previous.type !== 'separator' && next !== undefined;
  });
};

const LeadingIcon: React.FC<{ icon?: LucideIcon; lock?: LockInfo }> = ({ icon: Icon, lock }) => {
  if (lock) return <PermissionLockIcon reason={lock.reason} className="mr-2 h-4 w-4" />;
  return Icon ? <Icon className="mr-2 h-4 w-4" /> : null;
};

// Renders a single menu item based on its type — supports nested submenus
const renderMenuItem = (
  item: MenuItem,
  index: number,
  locks: LockMap,
  onDialogSelect?: (id: string) => void,
): React.ReactNode => {
  const lock = item.id ? locks.get(item.id) : undefined;

  switch (item.type) {
    case 'separator':
      return <DropdownMenuSeparator key={item.id ?? `separator-${index}`} />;

    case 'label':
      return <DropdownMenuLabel key={item.id}>{item.label}</DropdownMenuLabel>;

    case 'item': {
      const trailing = lock?.tip ?? item.shortcut;
      return (
        <DropdownMenuItem
          key={item.id}
          onClick={item.onClick}
          disabled={item.disabled}
          className={item.variant === 'destructive' && !lock ? 'text-destructive focus:text-destructive' : undefined}
        >
          <LeadingIcon icon={item.icon} lock={lock} />
          <span>{item.label}</span>
          {trailing && <DropdownMenuShortcut>{trailing}</DropdownMenuShortcut>}
        </DropdownMenuItem>
      );
    }

    case 'checkbox':
      return (
        <DropdownMenuCheckboxItem
          key={item.id}
          checked={item.checked}
          onCheckedChange={item.onCheckedChange}
          disabled={item.disabled}
        >
          <LeadingIcon icon={item.icon} lock={lock} />
          {item.label}
          {lock && <DropdownMenuShortcut>{lock.tip}</DropdownMenuShortcut>}
        </DropdownMenuCheckboxItem>
      );

    case 'radio-group':
      return (
        <DropdownMenuRadioGroup key={item.id} value={item.value} onValueChange={item.onValueChange}>
          {item.items.map((radioItem) => {
            const Icon = radioItem.icon;
            return (
              <DropdownMenuRadioItem key={radioItem.value} value={radioItem.value} disabled={radioItem.disabled}>
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {radioItem.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      );

    case 'sub':
      return (
        <DropdownMenuSub key={item.id}>
          <DropdownMenuSubTrigger disabled={item.disabled}>
            <LeadingIcon icon={item.icon} lock={lock} />
            <span>{item.label}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {item.items.map((subItem, subIndex) => renderMenuItem(subItem, subIndex, locks, onDialogSelect))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );

    case 'group':
      return (
        <DropdownMenuGroup key={item.id}>
          {item.label && <DropdownMenuLabel>{item.label}</DropdownMenuLabel>}
          {item.items.map((groupItem, groupIndex) => renderMenuItem(groupItem, groupIndex, locks, onDialogSelect))}
        </DropdownMenuGroup>
      );

    case 'dialog':
      return (
        <DropdownMenuItem
          key={item.id}
          disabled={item.disabled}
          onSelect={(e) => {
            e.preventDefault();
            onDialogSelect?.(item.id);
          }}
        >
          <LeadingIcon icon={item.icon} lock={lock} />
          <span>{item.label}</span>
          {lock && <DropdownMenuShortcut>{lock.tip}</DropdownMenuShortcut>}
        </DropdownMenuItem>
      );

    case 'custom': {
      const content = typeof item.render === 'function' ? item.render() : item.render;
      if (item.asMenuItem) {
        return (
          <DropdownMenuItem key={item.id} onClick={item.onClick} disabled={item.disabled}>
            {content}
          </DropdownMenuItem>
        );
      }
      return <Fragment key={item.id}>{content}</Fragment>;
    }

    default:
      return null;
  }
};

// A flexible, data-driven dropdown menu built from a declarative items array
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  modal = false,
  contentClassName,
  align = 'end',
  side,
}) => {
  const [activeDialogId, setActiveDialogId] = useState<string | null>(null);
  const TriggerIcon = trigger.icon;
  const gate = usePermissionGate();

  const { visible, locks } = useMemo(() => {
    const resolvedLocks: LockMap = new Map();
    return { visible: resolveItems(items, gate, resolvedLocks), locks: resolvedLocks };
  }, [items, gate]);

  // Collect all dialog-type items (including nested) for rendering outside the Radix root
  const collectDialogItems = (menuItems: MenuItem[]): DialogMenuItem[] => {
    const result: DialogMenuItem[] = [];
    for (const item of menuItems) {
      if (item.type === 'dialog') result.push(item);
      if (item.type === 'sub' || item.type === 'group') result.push(...collectDialogItems(item.items));
    }
    return result;
  };

  const dialogItems = collectDialogItems(visible);

  if (visible.length === 0) return null;

  return (
    <>
      <DropdownMenuRoot modal={modal}>
        <DropdownMenuTrigger asChild>
          {trigger.children ?? (
            <Button variant={trigger.variant} className={trigger.className}>
              {TriggerIcon && <TriggerIcon className="mr-2 h-4 w-4" />}
              {trigger.label}
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className={contentClassName}
          align={align}
          side={side}
          onCloseAutoFocus={(event) => {
            if (!modal) {
              event.preventDefault();
            }
          }}
        >
          {visible.map((item, index) => renderMenuItem(item, index, locks, setActiveDialogId))}
        </DropdownMenuContent>
      </DropdownMenuRoot>
      {dialogItems.map((item) => {
        const handle: DialogHandle = {
          isOpen: activeDialogId === item.id,
          open: () => setActiveDialogId(item.id),
          close: () => setActiveDialogId(null),
          onOpenChange: (val) => {
            if (!val) setActiveDialogId(null);
          },
        };
        return (
          <Dialog
            key={item.id}
            handle={handle}
            icon={item.icon}
            title={item.dialog.title}
            description={item.dialog.description}
            badgeSlot={item.dialog.badgeSlot}
            content={item.dialog.content}
          />
        );
      })}
    </>
  );
};

DropdownMenu.displayName = 'DropdownMenu';
