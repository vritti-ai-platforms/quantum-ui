import type * as TabsPrimitive from '@radix-ui/react-tabs';
import type React from 'react';
import {
  Tabs as ShadcnTabs,
  TabsContent as ShadcnTabsContent,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
} from '../../../shadcn/shadcnTabs';
import { cn } from '../../../shadcn/utils';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}

export interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  tabs: TabItem[];
  listClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  mountStrategy?: 'active' | 'all';
}

// Tabs root — renders list and content panels from the tabs array
export function Tabs({ tabs, listClassName, contentClassName, disabled, mountStrategy = 'active', ...props }: TabsProps) {
  return (
    <ShadcnTabs {...props}>
      <ShadcnTabsList className={listClassName}>
        {tabs.map((tab) => (
          <ShadcnTabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={disabled || tab.disabled}
            className={tab.className}
          >
            {tab.label}
          </ShadcnTabsTrigger>
        ))}
      </ShadcnTabsList>
      {tabs.map((tab) => (
        <ShadcnTabsContent
          key={tab.value}
          value={tab.value}
          forceMount={mountStrategy === 'all' ? true : undefined}
          className={cn(contentClassName, tab.contentClassName)}
        >
          {tab.content}
        </ShadcnTabsContent>
      ))}
    </ShadcnTabs>
  );
}

Tabs.displayName = 'Tabs';