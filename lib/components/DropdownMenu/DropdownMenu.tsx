import type React from 'react';
import { Fragment } from 'react';
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
import { Button } from '../Button';
import type { DropdownMenuProps, MenuItem } from './types';

// Export all primitive parts with proper aliases
export const DropdownMenuRoot = ShadcnDropdownMenuRoot;
export const DropdownMenuCheckboxItem = ShadcnDropdownMenuCheckboxItem;
export const DropdownMenuContent = ShadcnDropdownMenuContent;
export const DropdownMenuGroup = ShadcnDropdownMenuGroup;
export const DropdownMenuItem = ShadcnDropdownMenuItem;
export const DropdownMenuLabel = ShadcnDropdownMenuLabel;
export const DropdownMenuPortal = ShadcnDropdownMenuPortal;
export const DropdownMenuRadioGroup = ShadcnDropdownMenuRadioGroup;
export const DropdownMenuRadioItem = ShadcnDropdownMenuRadioItem;
export const DropdownMenuSeparator = ShadcnDropdownMenuSeparator;
export const DropdownMenuShortcut = ShadcnDropdownMenuShortcut;
export const DropdownMenuSub = ShadcnDropdownMenuSub;
export const DropdownMenuSubContent = ShadcnDropdownMenuSubContent;
export const DropdownMenuSubTrigger = ShadcnDropdownMenuSubTrigger;
export const DropdownMenuTrigger = ShadcnDropdownMenuTrigger;

/**
 * Helper function to recursively render menu items based on their type
 * Supports all menu item types including nested submenus
 */
const renderMenuItem = (item: MenuItem, index: number): React.ReactNode => {
  switch (item.type) {
    case 'separator':
      return <DropdownMenuSeparator key={item.id ?? `separator-${index}`} />;

    case 'label':
      return <DropdownMenuLabel key={item.id}>{item.label}</DropdownMenuLabel>;

    case 'item': {
      const Icon = item.icon;
      return (
        <DropdownMenuItem
          key={item.id}
          onClick={item.onClick}
          disabled={item.disabled}
          className={item.variant === 'destructive' ? 'text-destructive focus:text-destructive' : undefined}
        >
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          <span>{item.label}</span>
          {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
        </DropdownMenuItem>
      );
    }

    case 'checkbox': {
      const Icon = item.icon;
      return (
        <DropdownMenuCheckboxItem
          key={item.id}
          checked={item.checked}
          onCheckedChange={item.onCheckedChange}
          disabled={item.disabled}
        >
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {item.label}
        </DropdownMenuCheckboxItem>
      );
    }

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

    case 'sub': {
      const Icon = item.icon;
      return (
        <DropdownMenuSub key={item.id}>
          <DropdownMenuSubTrigger disabled={item.disabled}>
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            <span>{item.label}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {item.items.map((subItem, subIndex) => renderMenuItem(subItem, subIndex))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }

    case 'group':
      return (
        <DropdownMenuGroup key={item.id}>
          {item.label && <DropdownMenuLabel>{item.label}</DropdownMenuLabel>}
          {item.items.map((groupItem, groupIndex) => renderMenuItem(groupItem, groupIndex))}
        </DropdownMenuGroup>
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

/**
 * DropdownMenu - A flexible, data-driven dropdown menu component
 *
 * This component provides a declarative API for building dropdown menus without
 * manually composing primitive components. It supports all dropdown menu features
 * including items, checkboxes, radio groups, submenus, separators, labels, and groups.
 *
 * @example
 * ```tsx
 * import { DropdownMenu } from '@vritti/quantum-ui/DropdownMenu';
 * import { Settings, User, LogOut } from 'lucide-react';
 *
 * function UserMenu() {
 *   const [showStatus, setShowStatus] = useState(true);
 *
 *   return (
 *     <DropdownMenu
 *       trigger={{ label: 'Menu', variant: 'outline' }}
 *       items={[
 *         { type: 'label', id: 'account-label', label: 'My Account' },
 *         { type: 'item', id: 'profile', label: 'Profile', icon: User, shortcut: '⌘P' },
 *         { type: 'item', id: 'settings', label: 'Settings', icon: Settings },
 *         { type: 'separator' },
 *         {
 *           type: 'checkbox',
 *           id: 'status',
 *           label: 'Show Status',
 *           checked: showStatus,
 *           onCheckedChange: setShowStatus,
 *         },
 *         { type: 'separator' },
 *         {
 *           type: 'item',
 *           id: 'logout',
 *           label: 'Log out',
 *           icon: LogOut,
 *           variant: 'destructive',
 *         },
 *       ]}
 *       align="end"
 *     />
 *   );
 * }
 * ```
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  contentClassName,
  align = 'end',
  side,
}) => {
  const TriggerIcon = trigger.icon;

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        {trigger.children ?? (
          <Button variant={trigger.variant} className={trigger.className}>
            {TriggerIcon && <TriggerIcon className="mr-2 h-4 w-4" />}
            {trigger.label}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className={contentClassName} align={align} side={side}>
        {items.map((item, index) => renderMenuItem(item, index))}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};

DropdownMenu.displayName = 'DropdownMenu';
