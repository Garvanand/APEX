import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { Brain, Cpu, ShieldAlert, Sparkles, Activity, CheckCircle2 } from "lucide-react";

export default function AgentActivityStream() {
  const { logs } = useAppContext();

  const getAgentIcon = (agent: string) => {
    if (agent.includes("State")) return <Activity className="w-4 h-4 text-warning" />;
    if (agent.includes("Deadline")) return <ShieldAlert className="w-4 h-4 text-danger" />;
    if (agent.includes("Sculptor")) return <Cpu className="w-4 h-4 text-accent" />;
    if (agent.includes("Peer")) return <Sparkles className="w-4 h-4 text-blue-400" />;
    if (agent.includes("Socratic")) return <Brain className="w-4 h-4 text-purple-400" />;
    return <Cpu className="w-4 h-4 text-secondary-text" />;
  };

  const getAgentColor = (agent: string) => {
    if (agent.includes("State")) return "text-warning border-warning";
    if (agent.includes("Deadline")) return "text-danger border-danger";
    if (agent.includes("Sculptor")) return "text-accent border-accent";
    if (agent.includes("Peer")) return "text-blue-400 border-blue-400";
    if (agent.includes("Socratic")) return "text-purple-400 border-purple-400";
    return "text-secondary-text border-white/20";
  };

  return (
    <div className="bg-secondary-surface border border-white/5 rounded-xl flex flex-col h-full overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
        <h3 className="text-sm font-semibold text-white">Explainability Trace</h3>
        <span className="flex items-center gap-2 text-[10px] uppercase font-mono text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin relative bg-[#0a0a0a]">
        {/* Background Trace Line */}
        <div className="absolute left-[39px] top-0 bottom-0 w-px bg-white/10 z-0 hidden sm:block" />

        <AnimatePresence initial={false}>
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              layout
              className="relative z-10 w-full mb-6"
            >
              {/* Chain Container */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 shadow-xl font-mono relative overflow-hidden">
                
                {/* Agent Header / Trigger (WHAT) */}
                <div className="flex items-start gap-3 mb-4 relative z-10">
                  <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${getAgentColor(log.agent).split(' ')[0]}`}>
                    {getAgentIcon(log.agent)}
                  </div>
                  <div className="flex-1 mt-0.5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{log.agent} Intervention</span>
                      <span className="text-[9px] text-white/30">{log.time}</span>
                    </div>
                    {/* TRIGGER */}
                    <div className="text-sm font-semibold text-white leading-tight">
                      {log.trigger}
                    </div>
                  </div>
                </div>

                {/* Reasoning Branch */}
                <div className="relative pl-6 ml-4 border-l border-white/10 space-y-4 py-2">
                  
                  {/* WHY Node */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-[#1a1a1a] border border-white/30" />
                    <span className="text-[9px] uppercase tracking-widest text-white/40 block mb-1">Reason (Why)</span>
                    <div className="text-xs text-white/80 bg-white/5 border border-white/5 p-2.5 rounded-md leading-relaxed">
                      {log.reason}
                    </div>
                  </div>

                  {/* ACTION Node */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-[#1a1a1a] border border-accent" />
                    <span className="text-[9px] uppercase tracking-widest text-accent/70 block mb-1">Action (What changed)</span>
                    <div className="text-xs text-accent font-medium bg-accent/5 border border-accent/10 p-2.5 rounded-md leading-relaxed shadow-[0_0_10px_rgba(0,255,255,0.05)]">
                      {log.action}
                    </div>
                  </div>

                  {/* OUTCOME Node */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-[#1a1a1a] border border-success" />
                    <span className="text-[9px] uppercase tracking-widest text-success/70 block mb-1">Outcome</span>
                    <div className="text-xs text-success bg-success/5 border border-success/10 p-2.5 rounded-md flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="leading-relaxed">{log.outcome}</span>
                    </div>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div className="text-center text-xs text-secondary-text mt-12 font-mono">
              Listening for agent interventions...
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
