import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cva } from 'class-variance-authority';
import { ChevronDown, GripVertical } from 'lucide-react';
import React from 'react';
import { cn } from '../../../shadcn/utils';
import { SortableItem, type SortableItemRenderProps, SortableList } from '../Sortable';

const treeVariants = cva(
  'group relative rounded-md border border-border/60 bg-background pr-1 transition-colors hover:bg-accent/40',
);

const selectedTreeVariants = cva('border-accent/40 bg-accent/60 text-accent-foreground');

interface TreeDataItem {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  selectedIcon?: React.ComponentType<{ className?: string }>;
  openIcon?: React.ComponentType<{ className?: string }>;
  children?: TreeDataItem[];
  actions?: React.ReactNode;
  onClick?: () => void;
  draggable?: boolean;
  droppable?: boolean;
  disabled?: boolean;
  className?: string;
}

type TreeRenderItemParams = {
  item: TreeDataItem;
  level: number;
  isLeaf: boolean;
  isSelected: boolean;
  isOpen?: boolean;
  hasChildren: boolean;
};

export type TreeReorderPayload = {
  parentId: string | null;
  orderedIds: string[];
};

type TreeItemDefaults = {
  draggable?: boolean;
  droppable?: boolean;
};

type TreeProps = React.HTMLAttributes<HTMLDivElement> & {
  data: TreeDataItem[] | TreeDataItem;
  isLoading?: boolean;
  loadingRowCount?: number;
  initialSelectedItemId?: string;
  onSelectChange?: (item: TreeDataItem | undefined) => void;
  onReorder?: (payload: TreeReorderPayload) => void;
  expandAll?: boolean;
  defaultNodeIcon?: React.ComponentType<{ className?: string }>;
  defaultLeafIcon?: React.ComponentType<{ className?: string }>;
  renderItem?: (params: TreeRenderItemParams) => React.ReactNode;
  itemDefaults?: TreeItemDefaults;
  defaultDraggable?: boolean;
  defaultDroppable?: boolean;
};

const TreeView = React.forwardRef<HTMLDivElement, TreeProps>(
  (
    {
      data,
      isLoading = false,
      loadingRowCount = 6,
      initialSelectedItemId,
      onSelectChange,
      onReorder,
      expandAll,
      defaultLeafIcon,
      defaultNodeIcon,
      className,
      renderItem,
      itemDefaults,
      defaultDraggable,
      defaultDroppable,
      ...props
    },
    ref,
  ) => {
    const [selectedItemId, setSelectedItemId] = React.useState<string | undefined>(initialSelectedItemId);

    const handleSelectChange = React.useCallback(
      (item: TreeDataItem | undefined) => {
        setSelectedItemId(item?.id);
        if (onSelectChange) {
          onSelectChange(item);
        }
      },
      [onSelectChange],
    );

    const expandedItemIds = React.useMemo(() => {
      if (!initialSelectedItemId) {
        return [] as string[];
      }

      const ids: string[] = [];

      function walkTreeItems(items: TreeDataItem[] | TreeDataItem, targetId: string) {
        if (Array.isArray(items)) {
          for (let i = 0; i < items.length; i += 1) {
            ids.push(items[i].id);
            if (walkTreeItems(items[i], targetId) && !expandAll) {
              return true;
            }
            if (!expandAll) ids.pop();
          }
        } else if (!expandAll && items.id === targetId) {
          return true;
        } else if (items.children) {
          return walkTreeItems(items.children, targetId);
        }
      }

      walkTreeItems(data, initialSelectedItemId);
      return ids;
    }, [data, expandAll, initialSelectedItemId]);

    const normalizedData = React.useMemo(
      () =>
        applyTreeItemDefaults(data, {
          draggable: itemDefaults?.draggable ?? defaultDraggable,
          droppable: itemDefaults?.droppable ?? defaultDroppable,
        }),
      [data, itemDefaults?.draggable, itemDefaults?.droppable, defaultDraggable, defaultDroppable],
    );

    return (
      <div className={cn('overflow-hidden relative px-1.5 pb-1.5 pt-1.5', className)}>
        {isLoading ? (
          <TreeSkeleton rowCount={loadingRowCount} />
        ) : (
          <TreeItem
            data={normalizedData}
            ref={ref}
            selectedItemId={selectedItemId}
            handleSelectChange={handleSelectChange}
            expandedItemIds={expandedItemIds}
            defaultLeafIcon={defaultLeafIcon}
            defaultNodeIcon={defaultNodeIcon}
            renderItem={renderItem}
            onReorder={onReorder}
            parentId={null}
            level={0}
            {...props}
          />
        )}
      </div>
    );
  },
);
TreeView.displayName = 'TreeView';

function applyTreeItemDefaults(
  data: TreeDataItem[] | TreeDataItem,
  defaults: TreeItemDefaults,
): TreeDataItem[] | TreeDataItem {
  if (Array.isArray(data)) {
    return data.map((item) => applyTreeItemDefaultsToItem(item, defaults));
  }

  return applyTreeItemDefaultsToItem(data, defaults);
}

function applyTreeItemDefaultsToItem(data: TreeDataItem, defaults: TreeItemDefaults): TreeDataItem {
  return {
    ...data,
    draggable: data.draggable ?? defaults.draggable,
    droppable: data.droppable ?? defaults.droppable,
    children: data.children ? data.children.map((child) => applyTreeItemDefaultsToItem(child, defaults)) : undefined,
  };
}

const TreeSkeleton = ({ rowCount }: { rowCount: number }) => {
  const rows = React.useMemo(
    () =>
      Array.from({ length: rowCount }, (_, index) => {
        const variant = index % 3;

        return {
          id: crypto.randomUUID(),
          indentClass: variant === 0 ? '' : variant === 1 ? 'ml-3' : 'ml-6',
          widthClass: variant === 0 ? 'w-2/3' : variant === 1 ? 'w-1/2' : 'w-2/5',
        };
      }),
    [rowCount],
  );

  return (
    <div aria-hidden="true" className="space-y-1.5">
      {rows.map((row) => {
        return (
          <div key={row.id} className={cn('h-10 rounded-md border border-border/60 bg-background', row.indentClass)}>
            <div className="flex h-full items-center px-3">
              <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
              <div className={cn('ml-2 h-4 rounded bg-muted animate-pulse', row.widthClass)} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

type TreeItemProps = React.HTMLAttributes<HTMLDivElement> & {
  data: TreeDataItem[] | TreeDataItem;
  selectedItemId?: string;
  handleSelectChange: (item: TreeDataItem | undefined) => void;
  expandedItemIds: string[];
  defaultNodeIcon?: React.ComponentType<{ className?: string }>;
  defaultLeafIcon?: React.ComponentType<{ className?: string }>;
  renderItem?: (params: TreeRenderItemParams) => React.ReactNode;
  onReorder?: (payload: TreeReorderPayload) => void;
  parentId: string | null;
  level?: number;
};

const TreeItem = React.forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      className,
      data,
      selectedItemId,
      handleSelectChange,
      expandedItemIds,
      defaultNodeIcon,
      defaultLeafIcon,
      renderItem,
      onReorder,
      parentId,
      level,
      ...props
    },
    ref,
  ) => {
    const items = React.useMemo(() => (Array.isArray(data) ? data : [data]), [data]);

    const handleReorder = React.useCallback(
      (nextItems: TreeDataItem[]) => {
        if (!onReorder || nextItems.length < 2) return;

        const hasDisabledInMoveSet = nextItems.some((item) => item.disabled || item.draggable === false);
        if (hasDisabledInMoveSet) return;

        onReorder({ parentId, orderedIds: nextItems.map((item) => item.id) });
      },
      [onReorder, parentId],
    );

    return (
      <div ref={ref} role="tree" className={className} {...props}>
        <SortableList items={items} onReorder={handleReorder}>
          <ul className="m-0 list-none p-0">
            {items.map((item) => (
              <li key={item.id} className="m-0 mb-1.5 p-0 last:mb-0">
                <SortableItem id={item.id}>
                  {({ dragHandleProps, isDragging }) => {
                    const sortableProps =
                      items.length < 2 || item.disabled || item.draggable === false ? undefined : dragHandleProps;

                    if (item.children) {
                      return (
                        <TreeNode
                          item={item}
                          level={level ?? 0}
                          selectedItemId={selectedItemId}
                          expandedItemIds={expandedItemIds}
                          handleSelectChange={handleSelectChange}
                          defaultNodeIcon={defaultNodeIcon}
                          defaultLeafIcon={defaultLeafIcon}
                          renderItem={renderItem}
                          onReorder={onReorder}
                          sortableProps={sortableProps}
                          isDragging={isDragging}
                        />
                      );
                    }

                    return (
                      <TreeLeaf
                        item={item}
                        level={level ?? 0}
                        selectedItemId={selectedItemId}
                        handleSelectChange={handleSelectChange}
                        defaultLeafIcon={defaultLeafIcon}
                        renderItem={renderItem}
                        sortableProps={sortableProps}
                        isDragging={isDragging}
                      />
                    );
                  }}
                </SortableItem>
              </li>
            ))}
          </ul>
        </SortableList>
      </div>
    );
  },
);
TreeItem.displayName = 'TreeItem';

const TreeNode = ({
  item,
  handleSelectChange,
  expandedItemIds,
  selectedItemId,
  defaultNodeIcon,
  defaultLeafIcon,
  renderItem,
  onReorder,
  sortableProps,
  isDragging,
  level = 0,
}: {
  item: TreeDataItem;
  handleSelectChange: (item: TreeDataItem | undefined) => void;
  expandedItemIds: string[];
  selectedItemId?: string;
  defaultNodeIcon?: React.ComponentType<{ className?: string }>;
  defaultLeafIcon?: React.ComponentType<{ className?: string }>;
  renderItem?: (params: TreeRenderItemParams) => React.ReactNode;
  onReorder?: (payload: TreeReorderPayload) => void;
  sortableProps?: SortableItemRenderProps['dragHandleProps'];
  isDragging: boolean;
  level?: number;
}) => {
  const [value, setValue] = React.useState(expandedItemIds.includes(item.id) ? [item.id] : []);
  const hasChildren = !!item.children?.length;
  const isSelected = selectedItemId === item.id;
  const isOpen = value.includes(item.id);

  return (
    <AccordionPrimitive.Root type="multiple" value={value} onValueChange={(s) => setValue(s)}>
      <AccordionPrimitive.Item value={item.id}>
        <AccordionTrigger
          sortableProps={sortableProps}
          className={cn(
            treeVariants(),
            sortableProps ? 'pl-8' : 'pl-3',
            isSelected && selectedTreeVariants(),
            isDragging && 'opacity-60',
            item.className,
          )}
          onClick={() => {
            handleSelectChange(item);
            item.onClick?.();
          }}
        >
          {renderItem ? (
            renderItem({
              item,
              level,
              isLeaf: false,
              isSelected,
              isOpen,
              hasChildren,
            })
          ) : (
            <>
              <TreeIcon item={item} isSelected={isSelected} isOpen={isOpen} default={defaultNodeIcon} />
              <span className="flex-grow text-sm truncate">{item.name}</span>
              <TreeActions isSelected={isSelected}>{item.actions}</TreeActions>
            </>
          )}
        </AccordionTrigger>
        <AccordionContent className="relative mt-1.5 ml-2.5 pl-2.5 before:absolute before:bottom-1 before:left-0 before:top-1 before:w-px before:bg-border/60">
          <TreeItem
            data={item.children ? item.children : item}
            selectedItemId={selectedItemId}
            handleSelectChange={handleSelectChange}
            expandedItemIds={expandedItemIds}
            defaultLeafIcon={defaultLeafIcon}
            defaultNodeIcon={defaultNodeIcon}
            renderItem={renderItem}
            onReorder={onReorder}
            parentId={item.id}
            level={level + 1}
          />
        </AccordionContent>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
};

const TreeLeaf = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    item: TreeDataItem;
    level: number;
    selectedItemId?: string;
    handleSelectChange: (item: TreeDataItem | undefined) => void;
    defaultLeafIcon?: React.ComponentType<{ className?: string }>;
    renderItem?: (params: TreeRenderItemParams) => React.ReactNode;
    sortableProps?: SortableItemRenderProps['dragHandleProps'];
    isDragging: boolean;
  }
>(
  (
    {
      className,
      item,
      level,
      selectedItemId,
      handleSelectChange,
      defaultLeafIcon,
      renderItem,
      sortableProps,
      isDragging,
      ...props
    },
    ref,
  ) => {
    const isSelected = selectedItemId === item.id;

    const setLeafRef = (node: HTMLDivElement | null) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div ref={setLeafRef} className="group relative" {...props}>
        <TreeDragHandle sortableProps={sortableProps} />
        <button
          type="button"
          disabled={item.disabled}
          className={cn(
            'flex h-10 w-full text-left items-center py-0 before:right-1',
            treeVariants(),
            sortableProps ? 'pl-8' : 'pl-3',
            className,
            isSelected && selectedTreeVariants(),
            isDragging && 'opacity-60',
            item.disabled && 'opacity-50 cursor-not-allowed',
            item.className,
          )}
          onClick={() => {
            if (item.disabled) return;
            handleSelectChange(item);
            item.onClick?.();
          }}
        >
          {renderItem ? (
            renderItem({
              item,
              level,
              isLeaf: true,
              isSelected,
              hasChildren: false,
            })
          ) : (
            <>
              <TreeIcon item={item} isSelected={isSelected} default={defaultLeafIcon} />
              <span className="flex-grow text-sm truncate">{item.name}</span>
              <TreeActions isSelected={isSelected && !item.disabled}>{item.actions}</TreeActions>
            </>
          )}
        </button>
      </div>
    );
  },
);
TreeLeaf.displayName = 'TreeLeaf';

const TreeDragHandle = ({ sortableProps }: { sortableProps?: SortableItemRenderProps['dragHandleProps'] }) => {
  if (!sortableProps) return null;

  return (
    <button
      type="button"
      ref={sortableProps?.ref}
      className={cn(
        'inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground transition-opacity focus-visible:outline-none',
        'absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-grab active:cursor-grabbing opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto',
      )}
      aria-label="Reorder"
      title="Reorder"
      {...sortableProps?.attributes}
      {...sortableProps?.listeners}
    >
      <GripVertical className="h-3.5 w-3.5" />
    </button>
  );
};

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    sortableProps?: SortableItemRenderProps['dragHandleProps'];
  }
>(({ className, children, sortableProps, ...props }, ref) => (
  <AccordionPrimitive.Header className="group relative">
    <TreeDragHandle sortableProps={sortableProps} />
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex h-10 flex-1 w-full items-center py-0 transition-all [&[data-state=closed]_.tree-chevron]:-rotate-90',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="tree-chevron ml-2 h-4 w-4 shrink-0 transition-transform duration-200 text-accent-foreground/50" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      className,
    )}
    {...props}
  >
    <div className="pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

const TreeIcon = ({
  item,
  isOpen,
  isSelected,
  default: defaultIcon,
}: {
  item: TreeDataItem;
  isOpen?: boolean;
  isSelected?: boolean;
  default?: React.ComponentType<{ className?: string }>;
}) => {
  let Icon: React.ComponentType<{ className?: string }> | undefined = defaultIcon;
  if (isSelected && item.selectedIcon) {
    Icon = item.selectedIcon;
  } else if (isOpen && item.openIcon) {
    Icon = item.openIcon;
  } else if (item.icon) {
    Icon = item.icon;
  }
  return Icon ? <Icon className="h-4 w-4 shrink-0 mr-2" /> : null;
};

const TreeActions = ({ children, isSelected }: { children: React.ReactNode; isSelected: boolean }) => {
  return <div className={cn(isSelected ? 'block' : 'hidden', 'absolute right-3 group-hover:block')}>{children}</div>;
};

export {
  TreeView,
  type TreeDataItem,
  type TreeRenderItemParams,
  AccordionTrigger,
  AccordionContent,
  TreeLeaf,
  TreeNode,
  TreeItem,
};
