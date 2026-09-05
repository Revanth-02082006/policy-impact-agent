import React, { useState, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CascadingGraph as CascadingGraphType, CascadingNode } from '../types/index.js';
import { Network, Info, AlertTriangle, Building2, HelpCircle, X } from 'lucide-react';

interface CascadingGraphProps {
  graph: CascadingGraphType;
}

// Custom Node Renderer for light theme decision impact nodes
const CustomNode = ({ data }: { data: CascadingNode & { onSelectNode: (node: CascadingNode) => void } }) => {
  const getNodeStyles = (type: string, severity: string) => {
    switch (type) {
      case 'decision':
        return 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-400/20';
      case 'direct_effect':
        return 'bg-indigo-50 border-indigo-400 text-indigo-900';
      case 'secondary_effect':
        return 'bg-amber-50 border-amber-400 text-amber-900';
      case 'service_impact':
        return 'bg-rose-50 border-rose-400 text-rose-900';
      case 'critical_consequence':
        return 'bg-red-100 border-red-500 text-red-950 ring-2 ring-red-400/30';
      default:
        return 'bg-slate-50 border-slate-300 text-slate-900';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="bg-red-200 text-red-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">Critical</span>;
      case 'high':
        return <span className="bg-rose-200 text-rose-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">High</span>;
      case 'moderate':
        return <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">Moderate</span>;
      default:
        return <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">Notice</span>;
    }
  };

  return (
    <div
      onClick={() => data.onSelectNode(data)}
      className={`p-3.5 rounded-xl border-2 shadow-sm min-w-[220px] max-w-[260px] cursor-pointer hover:shadow-md transition-all ${getNodeStyles(
        data.type,
        data.severity
      )}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-3 !h-3" />
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{data.department}</span>
        {getSeverityBadge(data.severity)}
      </div>
      <h5 className="font-bold text-xs leading-snug mb-1">{data.label}</h5>
      <p className="text-[11px] text-slate-600 line-clamp-2">{data.description}</p>
      {data.assumption && (
        <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center space-x-1 text-[10px] text-amber-700">
          <HelpCircle className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Includes Assumption</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-3 !h-3" />
    </div>
  );
};

export const CascadingGraphView: React.FC<CascadingGraphProps> = ({ graph }) => {
  const [selectedNode, setSelectedNode] = useState<CascadingNode | null>(null);

  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  // Format ReactFlow Nodes with positions
  const nodes: Node[] = useMemo(() => {
    return graph.nodes.map((node, index) => {
      // Calculate row & column layout positions automatically
      const row = Math.floor(index / 2);
      const col = index % 2;
      return {
        id: node.id,
        type: 'customNode',
        position: { x: col * 320 + 80, y: row * 170 + 40 },
        data: {
          ...node,
          onSelectNode: (n: CascadingNode) => setSelectedNode(n),
        },
      };
    });
  }, [graph.nodes]);

  // Format ReactFlow Edges with arrows
  const edges: Edge[] = useMemo(() => {
    return graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      style: { stroke: '#475569', strokeWidth: 2 },
      labelStyle: { fill: '#1e293b', fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, rx: 4, ry: 4 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#475569',
      },
    }));
  }, [graph.edges]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-extrabold text-slate-900">Cascading Consequence Engine</h3>
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold border border-purple-200">
              Cross-Department Flow
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Traces cause-and-effect dependency chains across urban services before implementation
          </p>
        </div>
        <div className="text-xs bg-slate-50 text-slate-700 p-2 rounded-lg border border-slate-200 font-medium max-w-md">
          <span className="font-bold text-slate-900">Chain Summary: </span>
          {graph.primaryChainSummary}
        </div>
      </div>

      {/* Interactive ReactFlow Graph Canvas */}
      <div className="h-[480px] w-full rounded-xl border border-slate-200 bg-slate-50/50 relative overflow-hidden">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls className="bg-white border border-slate-200 shadow-sm !rounded-lg" />
        </ReactFlow>

        {/* Selected Node Details Modal / Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-80 bg-white rounded-xl border border-slate-200 p-4 shadow-xl z-20 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center space-x-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>{selectedNode.department}</span>
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h4 className="font-bold text-slate-900 text-sm mb-2">{selectedNode.label}</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">{selectedNode.description}</p>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Consequence Category:</span>
                <span className="font-bold text-slate-800 capitalize">{selectedNode.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Impact Severity:</span>
                <span className="font-bold text-rose-700 capitalize">{selectedNode.severity}</span>
              </div>
              {selectedNode.assumption && (
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                  <span className="font-bold block mb-0.5 flex items-center space-x-1">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    <span>Underlying System Assumption:</span>
                  </span>
                  {selectedNode.assumption}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1">
        <span>💡 Click on any graph node to inspect detailed department implications & assumptions</span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span><span>Decision</span></span>
          <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span><span>Direct Effect</span></span>
          <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span><span>Secondary</span></span>
          <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span><span>Service Impact</span></span>
          <span className="flex items-center space-x-1"><span className="h-2.5 w-2.5 rounded-full bg-red-600"></span><span>Critical Risk</span></span>
        </div>
      </div>
    </div>
  );
};
