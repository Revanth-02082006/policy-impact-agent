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
import { CascadingGraph as CascadingGraphType, CascadingNode, ImpactSeverity } from '../types/index.js';
import { Network, Info, AlertTriangle, Building2, HelpCircle, X, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { getRiskClassification } from './ImpactScoresCard.js';

interface CascadingGraphProps {
  graph: CascadingGraphType;
}

// Custom Node Renderer explicitly showcasing Cause, Effect, Severity, Confidence & Polarity
const CustomNode = ({ data }: { data: CascadingNode & { onSelectNode: (node: CascadingNode) => void } }) => {
  const isPositive = data.polarity === 'positive';
  const isDecision = data.type === 'decision';

  const getNodeStyles = () => {
    if (isDecision) {
      return 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-400/30';
    }
    if (isPositive) {
      return 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300/40 shadow-xs';
    }
    switch (data.type) {
      case 'direct_effect':
        return 'bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-300';
      case 'service_impact':
        return 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-300';
      case 'critical_consequence':
        return 'bg-red-50 border-red-500 text-red-950 ring-2 ring-red-400/40 shadow-md';
      default:
        return 'bg-slate-50 border-slate-300 text-slate-900';
    }
  };

  const risk = getRiskClassification(
    data.severity === 'critical' ? 90 : data.severity === 'high' ? 75 : data.severity === 'moderate' ? 55 : 30
  );

  return (
    <div
      onClick={() => data.onSelectNode(data)}
      className={`p-3.5 rounded-2xl border-2 shadow-sm min-w-[280px] max-w-[320px] cursor-pointer hover:shadow-lg transition-all duration-200 ${getNodeStyles()}`}
    >
      <Handle type="target" position={Position.Top} className="!bg-blue-600 !w-3 !h-3" />

      {/* Node Header */}
      <div className="flex items-center justify-between gap-1.5 mb-2 border-b border-slate-200/70 pb-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 truncate max-w-[130px]">
          {data.department || 'Administration'}
        </span>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase border bg-emerald-100 text-emerald-800 border-emerald-300">
              ✓ Benefit
            </span>
          ) : (
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${risk.badgeClass}`}>
              {data.severity.replace('_', ' ')}
            </span>
          )}
          {data.confidence && (
            <span className="text-[9px] font-bold bg-white text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
              {data.confidence}%
            </span>
          )}
        </div>
      </div>

      {/* Node Title */}
      <h5 className="font-black text-xs text-slate-900 leading-snug mb-2 flex items-center gap-1">
        <span className={`h-1.5 w-1.5 rounded-full ${isPositive ? 'bg-emerald-600' : 'bg-blue-600'}`}></span>
        <span>{data.label}</span>
      </h5>

      {/* Cause & Effect Details */}
      <div className="space-y-1.5 text-[11px] bg-white/80 p-2 rounded-xl border border-slate-200/80 shadow-2xs">
        {data.cause && (
          <div>
            <span className="font-extrabold text-blue-900 uppercase text-[9px] block">Trigger / Cause:</span>
            <p className="text-slate-700 leading-tight line-clamp-2">{data.cause}</p>
          </div>
        )}
        {data.effect && (
          <div className="pt-1 border-t border-slate-100">
            <span className={`font-extrabold uppercase text-[9px] block ${isPositive ? 'text-emerald-800' : 'text-rose-900'}`}>
              {isPositive ? '✓ Downstream Public Benefit:' : '⚠ Operational Consequence:'}
            </span>
            <p className="text-slate-700 leading-tight line-clamp-2 font-medium">{data.effect}</p>
          </div>
        )}
      </div>

      {data.assumption && (
        <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center space-x-1 text-[10px] text-amber-800">
          <HelpCircle className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">Assumption noted</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-blue-600 !w-3 !h-3" />
    </div>
  );
};

export const CascadingGraphView: React.FC<CascadingGraphProps> = ({ graph }) => {
  const [selectedNode, setSelectedNode] = useState<CascadingNode | null>(null);

  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  // Format ReactFlow Nodes with responsive grid spacing
  const nodes: Node[] = useMemo(() => {
    return graph.nodes.map((node, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      return {
        id: node.id,
        type: 'customNode',
        position: { x: col * 360 + 60, y: row * 220 + 40 },
        data: {
          ...node,
          onSelectNode: (n: CascadingNode) => setSelectedNode(n),
        },
      };
    });
  }, [graph.nodes]);

  const edges: Edge[] = useMemo(() => {
    return graph.edges.map((edge) => ({
      ...edge,
      animated: true,
      style: { stroke: '#2563eb', strokeWidth: 2.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#2563eb',
        width: 18,
        height: 18,
      },
      labelStyle: { fill: '#1e40af', fontWeight: 700, fontSize: 11 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95, stroke: '#bfdbfe', rx: 4, ry: 4 },
    }));
  }, [graph.edges]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 space-y-4">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Network className="h-5 w-5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              Cascading Impact Engine (Cause → Effect Chain)
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Signature Feature
            </span>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            {graph.nodes.length} Connected Consequences Mapped
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Every decision triggers a ripple effect. This directed dependency graph models how initial administrative choices cascade into traffic, healthcare, community, and risk consequences. Click any node to inspect details.
        </p>
      </div>

      {/* Primary Chain Summary Banner */}
      <div className="bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/60 p-4 rounded-xl border border-blue-200 text-xs">
        <div className="flex items-center space-x-2 mb-1.5">
          <ArrowRight className="h-4 w-4 text-blue-700" />
          <span className="font-extrabold text-blue-950 uppercase tracking-wide">
            Primary Cascading Chain Pathway:
          </span>
        </div>
        <p className="text-slate-800 font-semibold leading-relaxed font-mono pl-6">
          {graph.primaryChainSummary}
        </p>
      </div>

      {/* Interactive Flow Canvas */}
      <div className="h-[460px] w-full rounded-xl border border-slate-200 bg-slate-50/50 relative overflow-hidden shadow-inner">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls className="!bg-white !border !border-slate-200 !shadow-sm !rounded-lg" />
        </ReactFlow>
      </div>

      {/* Selected Node Inspection Drawer */}
      {selectedNode && (
        <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs space-y-2 relative transition-all">
          <button
            onClick={() => setSelectedNode(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1 rounded-md"
            aria-label="Close details"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase">
              {selectedNode.department}
            </span>
            <span className="text-sm font-black text-slate-900">{selectedNode.label}</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">{selectedNode.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-200/80">
            <div className="bg-white/90 p-2.5 rounded-lg border border-blue-200">
              <span className="font-extrabold text-blue-900 uppercase text-[10px] block">Specific Trigger Cause:</span>
              <p className="text-slate-700 mt-0.5 font-medium">{selectedNode.cause}</p>
            </div>
            <div className="bg-white/90 p-2.5 rounded-lg border border-blue-200">
              <span className="font-extrabold text-rose-900 uppercase text-[10px] block">Resulting Consequence Effect:</span>
              <p className="text-slate-700 mt-0.5 font-medium">{selectedNode.effect}</p>
            </div>
          </div>
          {selectedNode.assumption && (
            <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
              <strong>Underlying System Assumption:</strong> {selectedNode.assumption}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CascadingGraphView;
