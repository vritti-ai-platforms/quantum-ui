import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';
import { cn } from '../utils';

// Tabs root component wrapping Radix Tabs primitive
function Tabs({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-2', className)} {...props} />;
}

// Container for tab trigger buttons
function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
        className,
      )}
      {...props}
    />
  );
}

// Individual tab trigger button
function TabsTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // layout
        'inline-flex items-center justify-center gap-1.5',
        // sizing & spacing
        'rounded-md border border-transparent px-3 py-1',
        // typography
        'text-sm font-medium whitespace-nowrap',
        // colors
        'text-muted-foreground dark:text-muted-foreground',
        // active state
        'data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        // transitions
        'transition-all',
        // focus
        'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        // disabled
        'disabled:pointer-events-none disabled:opacity-50',
        // svg children
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
        className,
      )}
      {...props}
    />
  );
}

// Tab panel content shown when its trigger is active
function TabsContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
