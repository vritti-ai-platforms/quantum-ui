'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import type * as React from 'react';

// Collapsible root wrapper with data-slot attribute
function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

// Collapsible trigger wrapper with data-slot attribute
function CollapsibleTrigger({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />;
}

// Collapsible content wrapper with data-slot attribute
function CollapsibleContent({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return <CollapsiblePrimitive.Content data-slot="collapsible-content" {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
