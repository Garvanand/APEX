import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Activity, Cpu, ShieldAlert, Sparkles, LayoutDashboard, MessageSquare } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { CognitiveState } from "../types";

// ─── Trace Data Generation ────────────────────────────────────────────────────

interface TraceNode {
  id: string;
  agent: string;
  agentId: string;
  action: string;
  metric?: string;
  icon: React.ElementType;
  color: string;
}

const AGENT_META = {
  state: { name: "State Agent", icon: Activity, color: "#00D26A" },
  deadline: { name: "Deadline Sentinel", icon: ShieldAlert, color: "#FF4D4F" },
  sculptor: { name: "Environment Sculptor", icon: LayoutDashboard, color: "#FFB800" },
  radar: { name: "Peer Radar", icon: MessageSquare, color: "#007AFF" },
  socratic: { name: "Socratic Challenger", icon: Sparkles, color: "#FFFFFF" },
  system: { name: "Workspace Core", icon: Cpu, color: "#A5A5A5" },
};

function generateTraceChain(state: CognitiveState): TraceNode[] {
  const chain: TraceNode[] = [];
  const uid = () => Math.random().toString(36).substring(2, 7);

  if (state === "Flow") {
    chain.push({
      id: uid(), agentId: "state", agent: AGENT_META.state.name, icon: AGENT_META.state.icon, color: AGENT_META.state.color,
      action: "HRV and Interaction Density stabilized.", metric: "Conf: 94%"
    });
    chain.push({
      id: uid(), agentId: "sculptor", agent: AGENT_META.sculptor.name, icon: AGENT_META.sculptor.icon, color: AGENT_META.sculptor.color,
      action: "Suppressing all background polling.", metric: "0 Interruptions"
    });
    chain.push({
      id: uid(), agentId: "system", agent: "Workspace Core", icon: AGENT_META.system.icon, color: AGENT_META.system.color,
      action: "Deep Focus mode engaged."
    });
  } else if (state === "Distracted") {
    chain.push({
      id: uid(), agentId: "state", agent: AGENT_META.state.name, icon: AGENT_META.state.icon, color: AGENT_META.state.color,
      action: "Frequent context switching detected.", metric: "7 switches / min"
    });
    chain.push({
      id: uid(), agentId: "deadline", agent: AGENT_META.deadline.name, icon: AGENT_META.deadline.icon, color: AGENT_META.deadline.color,
      action: "Task drift calculated. Risk elevated.", metric: "Urgency: High"
    });
    chain.push({
      id: uid(), agentId: "sculptor", agent: AGENT_META.sculptor.name, icon: AGENT_META.sculptor.icon, color: AGENT_META.sculptor.color,
      action: "Minimizing idle tabs and dimming secondary monitors."
    });
  } else if (state === "Fatigued") {
    chain.push({
      id: uid(), agentId: "state", agent: AGENT_META.state.name, icon: AGENT_META.state.icon, color: AGENT_META.state.color,
      action: "Cognitive resource depletion signature.", metric: "Typing rhythm: 40%"
    });
    chain.push({
      id: uid(), agentId: "socratic", agent: AGENT_META.socratic.name, icon: AGENT_META.socratic.icon, color: AGENT_META.socratic.color,
      action: "Pausing active recall challenges."
    });
    chain.push({
      id: uid(), agentId: "sculptor", agent: AGENT_META.sculptor.name, icon: AGENT_META.sculptor.icon, color: AGENT_META.sculptor.color,
      action: "Suggesting 5-minute offline break protocol."
    });
  } else if (state === "Overloaded") {
    chain.push({
      id: uid(), agentId: "state", agent: AGENT_META.state.name, icon: AGENT_META.state.icon, color: AGENT_META.state.color,
      action: "Stress metrics exceed 95th percentile threshold.", metric: "HR: Elevated"
    });
    chain.push({
      id: uid(), agentId: "radar", agent: AGENT_META.radar.name, icon: AGENT_META.radar.icon, color: AGENT_META.radar.color,
      action: "Broadcasting 'Do Not Disturb' to peer network."
    });
    chain.push({
      id: uid(), agentId: "sculptor", agent: AGENT_META.sculptor.name, icon: AGENT_META.sculptor.icon, color: AGENT_META.sculptor.color,
      action: "Blocking all non-essential applications."
    });
    chain.push({
      id: uid(), agentId: "deadline", agent: AGENT_META.deadline.name, icon: AGENT_META.deadline.icon, color: AGENT_META.deadline.color,
      action: "Executing emergency triage. Requesting extensions."
    });
  }

  return chain;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AgentCollaborationGraph() {
  const { cognitiveState } = useAppContext();
  const [traceSequence, setTraceSequence] = useState<TraceNode[]>([]);
  const [visibleNodes, setVisibleNodes] = useState<number>(0);

  // When cognitive state changes, generate a new trace and animate it in sequentially.
  useEffect(() => {
    const newTrace = generateTraceChain(cognitiveState);
    setTraceSequence(newTrace);
    setVisibleNodes(0);

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    newTrace.forEach((_, index) => {
      // Stagger node appearance by 800ms to simulate reasoning flow
      const t = setTimeout(() => {
        setVisibleNodes((v) => v + 1);
      }, 600 + index * 900);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [cognitiveState]);

  return (
    <div className="bg-[#121212] border border-white/5 rounded-xl p-6 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6 relative z-10">
        <Network className="w-4 h-4 text-[#A5A5A5]" />
        <h3 className="text-sm font-semibold text-white">Live Intelligence Trace</h3>
        <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
          Agent Routing
        </span>
      </div>

      <div className="relative pl-4 py-2">
        <AnimatePresence>
          {traceSequence.slice(0, visibleNodes).map((node, index) => {
            const Icon = node.icon;
            const isLast = index === traceSequence.length - 1;

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative flex gap-5 group"
              >
                {/* Visual Connector / Spine */}
                <div className="flex flex-col items-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center relative z-10"
                    style={{ background: `${node.color}15`, border: `1px solid ${node.color}30` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: node.color }} />
                  </motion.div>
                  
                  {/* The downward edge/line */}
                  {!isLast && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="w-px flex-1 mt-2 mb-2"
                      style={{
                        background: `linear-gradient(to bottom, ${node.color}50, transparent)`,
                        minHeight: "36px"
                      }}
                    />
                  )}
                </div>

                {/* Node Content */}
                <div className={`flex-1 ${isLast ? "" : "pb-8"}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-white tracking-wide">{node.agent}</span>
                    {node.metric && (
                      <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[#A5A5A5]">
                        {node.metric}
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-black/40 border border-white/5 rounded-lg p-3 inline-block min-w-[240px]">
                    <p className="text-xs text-[#A5A5A5] leading-relaxed">
                      {node.action}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading indicator while reasoning is still completing */}
        <AnimatePresence>
          {visibleNodes > 0 && visibleNodes < traceSequence.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-4 bottom-0 flex flex-col items-center translate-y-6"
            >
              <div className="w-8 flex justify-center">
                <motion.div 
                  className="w-1.5 h-1.5 rounded-full bg-[#A5A5A5]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
