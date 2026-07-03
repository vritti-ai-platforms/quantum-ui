import dagre from '@dagrejs/dagre';
import {
  Background,
  ConnectionLineType,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { type ComponentType, type ReactNode, useCallback, useEffect, useMemo } from 'react';

import '@xyflow/react/dist/style.css';
import './hierarchy-graph.css';

// Computes dagre layout positions for nodes arranged as a top-down tree
function getLayoutedElements<T extends Record<string, unknown>>(
  nodes: Node<T>[],
  edges: Edge[],
  nodeWidth: number,
  nodeHeight: number,
  direction: 'TB' | 'LR' = 'TB',
) {
  const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR';

  dagreGraph.setGraph({ rankdir: direction, nodesep: 40, ranksep: 80 });

  for (const node of nodes) {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  }
  for (const edge of edges) {
    dagreGraph.setEdge(edge.source, edge.target);
  }

  dagre.layout(dagreGraph);

  const layoutedNodes: Node[] = nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export interface HierarchyItem {
  id: string;
  parentId: string | null;
  [key: string]: unknown;
}

export interface HierarchyGraphProps<T extends HierarchyItem> {
  items: T[];
  nodeComponent: ComponentType<NodeProps<Node<T>>>;
  nodeWidth?: number;
  nodeHeight?: number;
  direction?: 'TB' | 'LR';
  onNodeClick?: (item: T) => void;
  toolbar?: ReactNode;
  className?: string;
  showMiniMap?: boolean;
  showControls?: boolean;
}

// Transforms flat hierarchical data into React Flow nodes and edges
function itemsToFlow<T extends HierarchyItem>(items: T[]) {
  const nodes: Node<T>[] = items.map((item) => ({
    id: item.id,
    type: 'hierarchyNode',
    data: item,
    position: { x: 0, y: 0 },
  }));

  const edges: Edge[] = items.flatMap((item) =>
    item.parentId
      ? [
          {
            id: `e-${item.parentId}-${item.id}`,
            source: item.parentId,
            target: item.id,
            type: 'smoothstep',
            animated: false,
            style: { stroke: 'var(--color-border)', strokeWidth: 2 },
          },
        ]
      : [],
  );

  return { nodes, edges };
}

// Inner component that uses useReactFlow (must be inside ReactFlowProvider)
function HierarchyGraphInner<T extends HierarchyItem>({
  items,
  nodeComponent,
  nodeWidth = 280,
  nodeHeight = 120,
  direction = 'TB',
  onNodeClick,
  toolbar,
  className,
  showMiniMap = false,
  showControls = true,
}: HierarchyGraphProps<T>) {
  const { fitView } = useReactFlow();

  const nodeTypes = useMemo(() => ({ hierarchyNode: nodeComponent as ComponentType<NodeProps> }), [nodeComponent]);

  const { nodes: rawNodes, edges: rawEdges } = useMemo(() => itemsToFlow(items), [items]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(rawNodes, rawEdges, nodeWidth, nodeHeight, direction),
    [rawNodes, rawEdges, nodeWidth, nodeHeight, direction],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Re-layout when items change
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setTimeout(() => fitView({ padding: 0.3, maxZoom: 0.85, duration: 300 }), 50);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges, fitView]);

  // Handles node click by finding the item and calling the callback
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!onNodeClick) return;
      const item = items.find((i) => i.id === node.id);
      if (item) onNodeClick(item);
    },
    [items, onNodeClick],
  );

  return (
    <div className={`h-[600px] w-full border rounded-lg bg-background ${className ?? ''}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 0.85 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        {showControls && <Controls showInteractive={false} />}
        {showMiniMap && <MiniMap />}
        <Background gap={16} size={1} />
        {toolbar && <div className="absolute top-3 right-3 z-10">{toolbar}</div>}
      </ReactFlow>
    </div>
  );
}

// Main exported component — wraps in ReactFlowProvider
export const HierarchyGraph = <T extends HierarchyItem>(props: HierarchyGraphProps<T>) => {
  return (
    <ReactFlowProvider>
      <HierarchyGraphInner {...props} />
    </ReactFlowProvider>
  );
};

HierarchyGraph.displayName = 'HierarchyGraph';
