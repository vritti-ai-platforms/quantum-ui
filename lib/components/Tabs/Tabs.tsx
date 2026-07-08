import * as TabsPrimitive from '@radix-ui/react-tabs';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import type React from 'react';
import { useId, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Tabs as ShadcnTabs,
  TabsContent as ShadcnTabsContent,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
} from '../../../shadcn/shadcnTabs';
import { cn } from '../../../shadcn/utils';
import { lockedTip, PermissionLockIcon, usePermissionGate } from '../PermissionGate';

export interface TabItem {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  permission?: string;
}

export interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  tabs: TabItem[];
  listClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
  mountStrategy?: 'active' | 'all';
  animated?: boolean;
  // When set, the active tab is bound to this URL path param (e.g. "versionTab").
  // The route must include that segment; switching tabs navigates to update it,
  // so the selection is deep-linkable and survives refresh.
  routeParam?: string;
}

interface TabsViewProps extends Omit<TabsProps, 'routeParam' | 'defaultValue' | 'value' | 'onValueChange'> {
  value: string;
  onValueChange: (value: string) => void;
}

// Drops tabs the role doesn't grant and disables plan/BU-locked ones with a lock + upsell tip
function useGatedTabs(tabs: TabItem[]): TabItem[] {
  const gate = usePermissionGate();
  const gated: TabItem[] = [];
  for (const tab of tabs) {
    if (!tab.permission) {
      gated.push(tab);
      continue;
    }
    const result = gate(tab.permission);
    if (!result.granted) continue;
    if (!result.locked) {
      gated.push(tab);
      continue;
    }
    gated.push({
      ...tab,
      disabled: true,
      label: (
        <span className="inline-flex items-center gap-1.5" title={lockedTip(result)}>
          <PermissionLockIcon reason={result.reason} className="size-3.5" />
          {tab.label}
        </span>
      ),
    });
  }
  return gated;
}

// First tab a user can actually open — skips locked/disabled tabs so the default selection lands on a real one
function firstSelectableValue(tabs: TabItem[]): string | undefined {
  return (tabs.find((tab) => !tab.disabled) ?? tabs[0])?.value;
}

// Tabs root — URL-path-bound when routeParam is set, otherwise internal/controlled state
export function Tabs(props: TabsProps) {
  const tabs = useGatedTabs(props.tabs);
  if (props.routeParam) return <RoutedTabs {...props} tabs={tabs} routeParam={props.routeParam} />;
  return <StatefulTabs {...props} tabs={tabs} />;
}

Tabs.displayName = 'Tabs';

// Internal-state mode — preserves the original uncontrolled/`value`-controlled behavior
function StatefulTabs({ routeParam: _routeParam, defaultValue, value, onValueChange, tabs, ...rest }: TabsProps) {
  const [activeTab, setActiveTab] = useState(value ?? defaultValue ?? firstSelectableValue(tabs));

  function handleValueChange(newValue: string) {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  }

  return <TabsView value={(value ?? activeTab) as string} onValueChange={handleValueChange} tabs={tabs} {...rest} />;
}

// URL-path mode — the active tab is read from / written to a route path param
function RoutedTabs({ routeParam, defaultValue, onValueChange, tabs, ...rest }: TabsProps & { routeParam: string }) {
  const params = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const fallback = (defaultValue as string) ?? firstSelectableValue(tabs) ?? '';
  const current = params[routeParam] ?? fallback;

  function handleValueChange(newValue: string) {
    const existing = params[routeParam];
    if (existing) {
      const segments = pathname.split('/');
      const index = segments.lastIndexOf(existing);
      if (index >= 0) {
        segments[index] = newValue;
        navigate(segments.join('/'));
      } else {
        navigate(`${pathname.replace(/\/+$/, '')}/${newValue}`);
      }
    } else {
      navigate(`${pathname.replace(/\/+$/, '')}/${newValue}`);
    }
    onValueChange?.(newValue);
  }

  return <TabsView value={current} onValueChange={handleValueChange} tabs={tabs} {...rest} />;
}

// Presentational tabs — fully controlled by value + onValueChange
function TabsView({
  value,
  onValueChange,
  tabs,
  listClassName,
  contentClassName,
  disabled,
  mountStrategy = 'active',
  animated = true,
  ...props
}: TabsViewProps) {
  const layoutId = useId();

  if (!animated) {
    return (
      <ShadcnTabs value={value} onValueChange={onValueChange} {...props}>
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

  const activeTabItem = tabs.find((t) => t.value === value);

  return (
    <ShadcnTabs value={value} onValueChange={onValueChange} {...props}>
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
              {value === tab.value && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-md bg-background shadow-sm"
                  transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.05 }}
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

export const TabsList = ShadcnTabsList;
export const TabsContent = ShadcnTabsContent;
export const TabsTrigger = ShadcnTabsTrigger;
