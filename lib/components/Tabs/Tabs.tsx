import * as TabsPrimitive from '@radix-ui/react-tabs';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import type React from 'react';
import { useId, useState } from 'react';
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
  animated?: boolean;
}

// Tabs root — renders list and content panels from the tabs array
export function Tabs({
  tabs,
  listClassName,
  contentClassName,
  disabled,
  mountStrategy = 'active',
  animated = true,
  defaultValue,
  value,
  onValueChange,
  ...props
}: TabsProps) {
  const layoutId = useId();
  const [activeTab, setActiveTab] = useState(value ?? defaultValue ?? tabs[0]?.value);

  function handleValueChange(newValue: string) {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  }

  const controlledValue = value ?? activeTab;

  if (!animated) {
    return (
      <ShadcnTabs value={controlledValue} onValueChange={handleValueChange} {...props}>
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

  const activeTabItem = tabs.find((t) => t.value === controlledValue);

  return (
    <ShadcnTabs value={controlledValue} onValueChange={handleValueChange} {...props}>
      <LayoutGroup id={layoutId}>
        <ShadcnTabsList className={listClassName}>
          {tabs.map((tab) => (
            <TabsPrimitive.Trigger
              key={tab.value}
              value={tab.value}
              disabled={disabled || tab.disabled}
              className={cn(
                'relative inline-flex items-center justify-center gap-1.5',
                'rounded-md px-3 py-1',
                'text-sm font-medium whitespace-nowrap',
                'text-muted-foreground',
                'data-[state=active]:text-foreground',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                'disabled:pointer-events-none disabled:opacity-50',
                "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                tab.className,
              )}
            >
              {controlledValue === tab.value && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-md bg-background shadow-sm"
                  transition={{
                    type: 'spring',
                    visualDuration: 0.3,
                    bounce: 0.05,
                  }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </TabsPrimitive.Trigger>
          ))}
        </ShadcnTabsList>
      </LayoutGroup>
      <AnimatePresence mode="wait" initial={false}>
        {activeTabItem && (
          <motion.div
            key={activeTabItem.value}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn('flex-1 outline-none', contentClassName, activeTabItem.contentClassName)}
          >
            {activeTabItem.content}
          </motion.div>
        )}
      </AnimatePresence>
    </ShadcnTabs>
  );
}

Tabs.displayName = 'Tabs';

export const TabsList = ShadcnTabsList;
export const TabsContent = ShadcnTabsContent;
export const TabsTrigger = ShadcnTabsTrigger;
