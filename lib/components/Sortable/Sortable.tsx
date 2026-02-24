import type { DraggableAttributes } from '@dnd-kit/core';
import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import {
  arrayMove,
  horizontalListSortingStrategy,
  rectSortingStrategy,
  SortableContext,
  type SortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import * as React from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { cn } from '../../../shadcn/utils';

// ─── Internal context for drag handle props ───

interface SortableItemContextValue {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  setActivatorNodeRef: (element: HTMLElement | null) => void;
}

const SortableItemContext = createContext<SortableItemContextValue | null>(null);

// Consumes drag handle context from nearest SortableItem
function useSortableItemContext() {
  const context = useContext(SortableItemContext);
  if (!context) {
    throw new Error('SortableDragHandle must be used within a SortableItem');
  }
  return context;
}

// ─── Strategy mapping ───

const STRATEGY_MAP: Record<string, SortingStrategy> = {
  vertical: verticalListSortingStrategy,
  horizontal: horizontalListSortingStrategy,
  grid: rectSortingStrategy,
};

// ─── SortableList ───

interface SortableListProps<T extends { id: string | number }> {
  items: T[];
  onReorder: (items: T[]) => void;
  strategy?: 'vertical' | 'horizontal' | 'grid';
  activationDistance?: number;
  children: React.ReactNode;
  className?: string;
}

// Container wrapping DndContext + SortableContext with built-in reorder handling
export function SortableList<T extends { id: string | number }>({
  items,
  onReorder,
  strategy = 'vertical',
  activationDistance = 5,
  children,
  className,
}: SortableListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: activationDistance } }));
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const resolvedStrategy = STRATEGY_MAP[strategy];

  // Reorders items array and calls onReorder with the new order
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={resolvedStrategy}>
        <div className={className}>{children}</div>
      </SortableContext>
    </DndContext>
  );
}

SortableList.displayName = 'SortableList';

// ─── SortableItem ───

export interface SortableItemRenderProps {
  isDragging: boolean;
  dragHandleProps: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
    ref: (element: HTMLElement | null) => void;
  };
}

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode | ((props: SortableItemRenderProps) => React.ReactNode);
  className?: string;
}

// Wraps useSortable, applies transform/transition, provides context for SortableDragHandle
export const SortableItem = React.forwardRef<HTMLDivElement, SortableItemProps>(({ id, children, className }, ref) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contextValue = useMemo<SortableItemContextValue>(
    () => ({ attributes, listeners, setActivatorNodeRef }),
    [attributes, listeners, setActivatorNodeRef],
  );

  // Merge refs: internal setNodeRef + forwarded ref
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [setNodeRef, ref],
  );

  const renderProps: SortableItemRenderProps = {
    isDragging,
    dragHandleProps: { attributes, listeners, ref: setActivatorNodeRef },
  };

  const isRenderProp = typeof children === 'function';

  return (
    <SortableItemContext.Provider value={contextValue}>
      <div ref={mergedRef} style={style} className={cn(!isRenderProp && isDragging && 'opacity-50', className)}>
        {isRenderProp ? children(renderProps) : children}
      </div>
    </SortableItemContext.Provider>
  );
});

SortableItem.displayName = 'SortableItem';

// ─── SortableDragHandle ───

interface SortableDragHandleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

// Consumes drag handle context from nearest SortableItem
export const SortableDragHandle = React.forwardRef<HTMLButtonElement, SortableDragHandleProps>(
  ({ children, className, ...props }, ref) => {
    const { attributes, listeners, setActivatorNodeRef } = useSortableItemContext();

    // Merge refs: internal setActivatorNodeRef + forwarded ref
    const mergedRef = useCallback(
      (node: HTMLButtonElement | null) => {
        setActivatorNodeRef(node as HTMLElement | null);
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      [setActivatorNodeRef, ref],
    );

    return (
      <button
        type="button"
        ref={mergedRef}
        className={cn(
          'cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0',
          className,
        )}
        {...attributes}
        {...listeners}
        {...props}
      >
        {children ?? <GripVertical className="h-3.5 w-3.5" />}
      </button>
    );
  },
);

SortableDragHandle.displayName = 'SortableDragHandle';
