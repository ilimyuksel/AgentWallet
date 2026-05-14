"use client";

import ReactFlow, {
  Node,
  Edge,
  Background,
  BackgroundVariant,
  MarkerType,
  useNodesState,
  useEdgesState,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";
import { Agent } from "@/types";
import { useEffect } from "react";

interface NodeData {
  agent: Agent;
  active: boolean;
  done: boolean;
  index: number;
  total: number;
}

const typeColors: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  trigger: { bg: "#fff8f0", border: "#e8a04a", text: "#7d4e10", dot: "#d97706" },
  action:  { bg: "#f0f6ff", border: "#8ab4f8", text: "#0d419d", dot: "#0969da" },
  output:  { bg: "#f0fff4", border: "#6bcb85", text: "#145c2a", dot: "#1a7f37" },
  notify:  { bg: "#faf0ff", border: "#c49cf1", text: "#5a1f9e", dot: "#8250df" },
};

function getNodeType(index: number, total: number): keyof typeof typeColors {
  if (index === 0) return "trigger";
  if (index === total - 1 && total > 2) return "output";
  if (index === total - 1) return "output";
  return "action";
}

function AgentNode({ data }: NodeProps<NodeData>) {
  const { agent, active, done, index, total } = data;
  const type = getNodeType(index, total);
  const colors = typeColors[type];

  const typeLabel =
    type === "trigger" ? "Trigger" :
    type === "action"  ? "Action"  :
    type === "output"  ? "Output"  : "Notify";

  const typeIcon =
    type === "trigger" ? "⚡" :
    type === "action"  ? "✦"  :
    type === "output"  ? "✓"  : "🔔";

  return (
    <div
      style={{
        background: active ? colors.bg : done ? "#f0fff4" : "#ffffff",
        border: `1.5px solid ${active ? colors.border : done ? "#aceebb" : "#d0d7de"}`,
        boxShadow: active
          ? `0 0 0 3px ${colors.border}40, 0 4px 16px rgba(0,0,0,0.08)`
          : "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
      }}
      className="rounded-xl w-52 overflow-hidden transition-all duration-300"
    >
      {/* Header */}
      <div
        style={{ background: colors.bg, borderBottom: `1px solid ${colors.border}` }}
        className="px-3.5 py-2.5 flex items-center gap-2"
      >
        <span style={{ color: colors.dot }} className="text-sm">{typeIcon}</span>
        <span style={{ color: colors.text }} className="text-xs font-semibold">{typeLabel}</span>
        {active && (
          <span
            style={{ background: colors.dot }}
            className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
          />
        )}
        {done && !active && (
          <span className="ml-auto text-[#1a7f37] text-xs">✓</span>
        )}
      </div>

      {/* Body */}
      <div className="px-3.5 py-2.5 space-y-1.5">
        <div className="flex items-center gap-2 pb-1.5 border-b border-[#e9ecef]">
          <span className="text-base">{agent.icon}</span>
          <p className="text-xs font-semibold text-[#1f2328] leading-tight">{agent.name}</p>
        </div>

        <Row label="Adres" value={agent.walletAddress} mono />
        <Row label="Durum" value={done ? "Tamamlandı" : active ? "Çalışıyor" : "Bekliyor"} />
        <Row label="Ücret" value={agent.pricePerCall > 0 ? `$${agent.pricePerCall.toFixed(3)}/çağrı` : "Ücretsiz"} />
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-[#9198a1]">{label}</span>
      <span className={`text-[10px] text-[#1f2328] font-medium ${mono ? "font-mono" : ""} truncate max-w-[110px]`}>
        {value}
      </span>
    </div>
  );
}

const nodeTypes = { agentNode: AgentNode };

export function PipelineCanvas({ agents, activeIndex = -1 }: { agents: Agent[]; activeIndex?: number }) {
  const initialNodes: Node[] = agents.map((agent, i) => ({
    id: agent.id,
    type: "agentNode",
    position: { x: i * 260, y: 20 },
    data: { agent, active: false, done: false, index: i, total: agents.length },
  }));

  const initialEdges: Edge[] = agents.slice(0, -1).map((agent, i) => ({
    id: `e-${agent.id}-${agents[i + 1].id}`,
    source: agent.id,
    target: agents[i + 1].id,
    animated: false,
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#b0b7bf", width: 16, height: 16 },
    style: { stroke: "#b0b7bf", strokeWidth: 1.5 },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes((prev) =>
      prev.map((n, i) => ({
        ...n,
        data: { ...n.data, active: i === activeIndex, done: i < activeIndex },
      }))
    );
    setEdges((prev) =>
      prev.map((e, i) => ({
        ...e,
        animated: i < activeIndex,
        style: {
          stroke: i < activeIndex ? "#1a7f37" : "#b0b7bf",
          strokeWidth: i < activeIndex ? 2 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: i < activeIndex ? "#1a7f37" : "#b0b7bf",
          width: 16,
          height: 16,
        },
      }))
    );
  }, [activeIndex, setNodes, setEdges]);

  return (
    <div className="w-full h-56 rounded-xl border border-[#d0d7de] overflow-hidden bg-white shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
      >
        <Background color="#d0d7de" gap={20} variant={BackgroundVariant.Dots} size={1} />
      </ReactFlow>
    </div>
  );
}
