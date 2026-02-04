import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Base properties shared by all menu items that have an id and label
 */
export interface MenuItemBase {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label for the menu item */
  label: string;
  /** Optional Lucide icon to display before the label */
  icon?: LucideIcon;
  /** Whether the menu item is disabled */
  disabled?: boolean;
}

/**
 * Standard clickable menu item
 *
 * @example
 * ```tsx
 * const item: StandardMenuItem = {
 *   type: 'item',
 *   id: 'edit',
 *   label: 'Edit',
 *   icon: Pencil,
 *   shortcut: '⌘E',
 *   onClick: () => console.log('Edit clicked'),
 * };
 * ```
 */
export interface StandardMenuItem extends MenuItemBase {
  type: 'item';
  /** Keyboard shortcut text to display */
  shortcut?: string;
  /** Click handler */
  onClick?: () => void;
  /** Visual variant - 'destructive' renders with destructive styling */
  variant?: 'default' | 'destructive';
}

/**
 * Checkbox toggle menu item for boolean options
 *
 * @example
 * ```tsx
 * const item: CheckboxMenuItem = {
 *   type: 'checkbox',
 *   id: 'show-status',
 *   label: 'Show Status Bar',
 *   checked: true,
 *   onCheckedChange: (checked) => setShowStatus(checked),
 * };
 * ```
 */
export interface CheckboxMenuItem extends MenuItemBase {
  type: 'checkbox';
  /** Current checked state */
  checked: boolean;
  /** Callback when checked state changes */
  onCheckedChange: (checked: boolean) => void;
}

/**
 * Radio option item used inside a radio group
 */
export interface RadioMenuItem extends Omit<MenuItemBase, 'id'> {
  /** Value for this radio option (used as key and selection value) */
  value: string;
}

/**
 * Radio group for single-selection options
 *
 * @example
 * ```tsx
 * const item: RadioGroupMenuItem = {
 *   type: 'radio-group',
 *   id: 'position',
 *   value: 'top',
 *   onValueChange: (value) => setPosition(value),
 *   items: [
 *     { value: 'top', label: 'Top' },
 *     { value: 'bottom', label: 'Bottom' },
 *     { value: 'right', label: 'Right' },
 *   ],
 * };
 * ```
 */
export interface RadioGroupMenuItem {
  type: 'radio-group';
  /** Unique identifier for the radio group */
  id: string;
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onValueChange: (value: string) => void;
  /** Array of radio options */
  items: RadioMenuItem[];
}

/**
 * Submenu with nested items (supports infinite nesting)
 *
 * @example
 * ```tsx
 * const item: SubMenuItem = {
 *   type: 'sub',
 *   id: 'share',
 *   label: 'Share',
 *   icon: Share,
 *   items: [
 *     { type: 'item', id: 'email', label: 'Email' },
 *     { type: 'item', id: 'messages', label: 'Messages' },
 *   ],
 * };
 * ```
 */
export interface SubMenuItem extends MenuItemBase {
  type: 'sub';
  /** Nested menu items */
  items: MenuItem[];
}

/**
 * Visual separator line between menu items
 */
export interface SeparatorItem {
  type: 'separator';
  /** Optional unique identifier */
  id?: string;
}

/**
 * Label/header text for menu sections
 */
export interface LabelItem {
  type: 'label';
  /** Unique identifier */
  id: string;
  /** Label text to display */
  label: string;
}

/**
 * Logical group with optional label for organizing menu items
 *
 * @example
 * ```tsx
 * const item: GroupItem = {
 *   type: 'group',
 *   id: 'file-actions',
 *   label: 'File Actions',
 *   items: [
 *     { type: 'item', id: 'new', label: 'New File' },
 *     { type: 'item', id: 'open', label: 'Open File' },
 *   ],
 * };
 * ```
 */
export interface GroupItem {
  type: 'group';
  /** Unique identifier */
  id: string;
  /** Optional label for the group */
  label?: string;
  /** Items within this group */
  items: MenuItem[];
}

/**
 * Custom React node for full flexibility
 *
 * @example
 * ```tsx
 * const item: CustomMenuItem = {
 *   type: 'custom',
 *   id: 'user-profile',
 *   render: (
 *     <div className="flex items-center gap-2">
 *       <Avatar src={user.avatar} />
 *       <span>{user.name}</span>
 *     </div>
 *   ),
 *   asMenuItem: true,
 *   onClick: () => navigate('/profile'),
 * };
 * ```
 */
export interface CustomMenuItem {
  type: 'custom';
  /** Unique identifier */
  id: string;
  /** React node or render function to display */
  render: ReactNode | (() => ReactNode);
  /** Whether to wrap the content in a DropdownMenuItem (enables focus/click behavior) */
  asMenuItem?: boolean;
  /** Click handler (only used when asMenuItem is true) */
  onClick?: () => void;
  /** Whether the item is disabled (only used when asMenuItem is true) */
  disabled?: boolean;
}

/**
 * Union type of all possible menu item types
 */
export type MenuItem =
  | StandardMenuItem
  | CheckboxMenuItem
  | RadioGroupMenuItem
  | SubMenuItem
  | SeparatorItem
  | LabelItem
  | GroupItem
  | CustomMenuItem;

/**
 * Props for configuring the dropdown trigger button
 */
export interface MenuTriggerProps {
  /** Label text for the default button trigger */
  label?: string;
  /** Custom trigger element (overrides label/variant/icon) */
  children?: ReactNode;
  /** Button variant for the default trigger */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Icon to display in the default button trigger */
  icon?: LucideIcon;
  /** Additional CSS classes for the trigger */
  className?: string;
}

/**
 * Props for the DropdownMenu component
 *
 * @example
 * ```tsx
 * <DropdownMenu
 *   trigger={{ label: 'Actions', icon: MoreHorizontal }}
 *   items={[
 *     { type: 'item', id: 'edit', label: 'Edit', icon: Pencil },
 *     { type: 'separator' },
 *     { type: 'item', id: 'delete', label: 'Delete', variant: 'destructive' },
 *   ]}
 *   align="end"
 * />
 * ```
 */
export interface DropdownMenuProps {
  /** Trigger configuration */
  trigger: MenuTriggerProps;
  /** Array of menu items to render */
  items: MenuItem[];
  /** Additional CSS classes for the dropdown content */
  contentClassName?: string;
  /** Horizontal alignment of the dropdown relative to the trigger */
  align?: 'start' | 'center' | 'end';
  /** Which side of the trigger to render the dropdown */
  side?: 'top' | 'right' | 'bottom' | 'left';
}
