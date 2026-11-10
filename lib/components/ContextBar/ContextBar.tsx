import type React from 'react';
import { cn } from '../../../shadcn/utils';
import { bindFilters } from '../DataTable/components/bindFilters';
import type { ContextStateInstance } from './useContextState';

interface ContextBarProps {
  state: ContextStateInstance;
  className?: string;
  children: React.ReactNode;
}

// A view's context bar outside a DataTable: named context filters bound to its saved context, loading until it loads
export const ContextBar: React.FC<ContextBarProps> = ({ state, className, children }) => (
  <div className={cn('flex flex-wrap items-center gap-2', className)}>
    {bindFilters(children, {
      conditions: state.context,
      onChange: state.setContext,
      keepControlled: true,
      required: state.required,
      loading: !state.isLoaded,
      onFieldSettling: state.markFieldSettling,
    })}
  </div>
);
