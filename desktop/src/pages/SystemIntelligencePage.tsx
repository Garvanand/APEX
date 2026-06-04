import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, BrainCircuit, Activity, ChevronDown, ChevronUp, Sliders, Settings2, Cpu 
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useDemoState } from "../demo/DemoStateStore";

export default function SystemIntelligencePage() {
  const { logs, addLog, confidence } = useAppContext();
  const { override } = useDemoState();
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const displayConfidence = override.stateConfidence ? override.stateConfidence / 100 : confidence;

  // Mocked state for agents from previous implementation, now hidden under "Advanced"
  const [agents, setAgents] = useState([
    { id: "state", name: "State Agent", status: "active", autonomyLevel: 90, lastAction: "Determined Flow State" },
    { id: "deadline", name: "Deadline Sentinel", status: "active", autonomyLevel: 75, lastAction: "Re-calculated threat index" },
    { id: "sculptor", name: "Environment Sculptor", status: "active", autonomyLevel: 80, lastAction: "Suppressed system notifications" },
    { id: "radar", name: "Peer Radar", status: "active", autonomyLevel: 60, lastAction: "Muted non-essential channels" },
    { id: "socratic", name: "Socratic Challenger", status: "idle", autonomyLevel: 50, lastAction: "Hibernated" },
  ]);

  const handleAutonomyChange = (id: string, val: number) => {
    setAgents(prev => prev.map(a => (a.id === id ? { ...a, autonomyLevel: val } : a)));
    addLog("System", "Autonomy level adjustment", "User adjustment", `Set ${agents.find(a => a.id === id)?.name} autonomy level to ${val}%`, "Autonomy updated");
  };

  const toggleStatus = (id: string) => {
    setAgents(prev =>
      prev.map(a => {
        if (a.id === id) {
          const newStatus = a.status === "active" ? "paused" : "active";
          addLog("System", "Agent status toggled", "User override", `Agent operational status toggled to: ${newStatus.toUpperCase()}`, "Status changed");
          return { ...a, status: newStatus as any };
        }
        return a;
      })
    );
  };

  // Extract recent decisions and adaptations from logs
  const recentDecisions = logs.filter(l => l.agent !== "System" && !l.action.includes("Workspace")).slice(0, 5);
  const recentAdaptations = logs.filter(l => l.action.toLowerCase().includes("workspace") || l.action.toLowerCase().includes("state")).slice(0, 5);

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">System Intelligence</h1>
        <p className="text-sm text-secondary-text">An overview of how APEX is silently optimizing your cognitive load.</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-secondary-surface border border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-success/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 text-secondary-text mb-4">
            <ShieldCheck className="w-5 h-5 text-success" />
            <span className="text-xs font-semibold uppercase tracking-wider">System Confidence</span>
          </div>
          <div>
            <div className="text-5xl font-bold text-white tracking-tighter">{Math.round(displayConfidence * 100)}%</div>
            <div className="text-xs text-success font-medium mt-2">Optimal alignment with intent</div>
          </div>
        </div>

        <div className="bg-secondary-surface border border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 text-secondary-text mb-4">
            <Activity className="w-5 h-5 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider">Interventions Today</span>
          </div>
          <div>
            <div className="text-5xl font-bold text-white tracking-tighter">18</div>
            <div className="text-xs text-secondary-text mt-2">Distractions seamlessly averted</div>
          </div>
        </div>

        <div className="bg-secondary-surface border border-white/5 rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-2 text-secondary-text mb-4">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Cognitive Load Saved</span>
          </div>
          <div>
            <div className="text-5xl font-bold text-white tracking-tighter">~42m</div>
            <div className="text-xs text-secondary-text mt-2">Estimated context-switching time saved</div>
          </div>
        </div>
      </div>

      {/* Outcome Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Decisions */}
        <div className="bg-secondary-surface border border-white/5 rounded-2xl p-6 shadow-lg">
          <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" /> Recent Decisions
          </h2>
          <div className="space-y-4">
            {recentDecisions.length > 0 ? recentDecisions.map(log => (
              <div key={log.id} className="flex gap-4 items-start p-4 bg-white/[0.02] border border-white/5 rounded-xl transition-colors hover:bg-white/[0.04]">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-white mb-1 leading-snug">{log.action}</div>
                  <div className="text-[11px] text-secondary-text leading-relaxed">Reason: {log.reason}</div>
                  <div className="text-[10px] text-accent font-mono mt-2">{log.time}</div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-secondary-text/50 py-8 text-center border border-dashed border-white/10 rounded-xl">No recent decisions.</div>
            )}
          </div>
        </div>

        {/* Recent Adaptations */}
        <div className="bg-secondary-surface border border-white/5 rounded-2xl p-6 shadow-lg">
          <h2 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" /> Environment Adaptations
          </h2>
          <div className="space-y-4">
            {recentAdaptations.length > 0 ? recentAdaptations.map(log => (
              <div key={log.id} className="flex gap-4 items-start p-4 bg-white/[0.02] border border-white/5 rounded-xl transition-colors hover:bg-white/[0.04]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-white mb-1 leading-snug">{log.outcome}</div>
                  <div className="text-[11px] text-secondary-text leading-relaxed">Trigger: {log.trigger}</div>
                  <div className="text-[10px] text-blue-400 font-mono mt-2">{log.time}</div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-secondary-text/50 py-8 text-center border border-dashed border-white/10 rounded-xl">No recent adaptations.</div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced: Agent Configuration */}
      <div className="mt-12 border-t border-white/5 pt-8">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-3 text-secondary-text hover:text-white transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="text-xs uppercase tracking-widest font-mono">Advanced: Agent Configuration</span>
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 overflow-hidden"
            >
              <div className="bg-[#0B0C0E] border border-white/5 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map(agent => (
                  <div key={agent.id} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 shadow-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-white/40" />
                        <span className="text-sm font-bold text-white">{agent.name}</span>
                      </div>
                      <span className={`text-[10px] uppercase font-mono px-2 py-1 rounded ${agent.status === 'active' ? 'bg-success/10 text-success' : 'bg-white/10 text-secondary-text'}`}>
                        {agent.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] text-secondary-text uppercase tracking-wider">
                        <span>Autonomy Level</span>
                        <span className="font-mono text-white">{agent.autonomyLevel}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={agent.autonomyLevel}
                        onChange={(e) => handleAutonomyChange(agent.id, parseInt(e.target.value))}
                        className="w-full h-1 bg-black/40 rounded appearance-none cursor-pointer accent-accent"
                      />
                    </div>

                    <button
                      onClick={() => toggleStatus(agent.id)}
                      className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
                    >
                      {agent.status === "active" ? "Pause Operation" : "Resume Operation"}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
