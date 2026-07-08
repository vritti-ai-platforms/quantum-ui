import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface MenuItemBase {
  id: string;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface StandardMenuItem extends MenuItemBase {
  type: 'item';
  shortcut?: string;
  onClick?: () => void;
  variant?: 'default' | 'destructive';
}

export interface CheckboxMenuItem extends MenuItemBase {
  type: 'checkbox';
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export interface RadioMenuItem extends Omit<MenuItemBase, 'id'> {
  value: string;
}

export interface RadioGroupMenuItem {
  type: 'radio-group';
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  items: RadioMenuItem[];
}

export interface SubMenuItem extends MenuItemBase {
  type: 'sub';
  items: MenuItem[];
}

export interface SeparatorItem {
  type: 'separator';
  id?: string;
}

export interface LabelItem {
  type: 'label';
  id: string;
  label: string;
}

export interface GroupItem {
  type: 'group';
  id: string;
  label?: string;
  items: MenuItem[];
}

export interface CustomMenuItem {
  type: 'custom';
  id: string;
  render: ReactNode | (() => ReactNode);
  asMenuItem?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export interface DialogMenuItem extends MenuItemBase {
  type: 'dialog';
  icon: LucideIcon;
  dialog: {
    title: string;
    description: string;
    badgeSlot?: ReactNode;
    content?: (close: () => void) => ReactNode;
  };
}

export type MenuItem =
  | StandardMenuItem
  | CheckboxMenuItem
  | RadioGroupMenuItem
  | SubMenuItem
  | SeparatorItem
  | LabelItem
  | GroupItem
  | CustomMenuItem
  | DialogMenuItem;

export interface MenuTriggerProps {
  label?: string;
  children?: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon?: LucideIcon;
  className?: string;
}

export interface DropdownMenuProps {
  trigger: MenuTriggerProps;
  items: MenuItem[];
  modal?: boolean;
  contentClassName?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}
