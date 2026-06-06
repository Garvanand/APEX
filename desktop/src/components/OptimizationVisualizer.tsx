import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppWindow, Bell, LayoutGrid, Activity, CheckCircle2, Shield, FileText, Target, Zap, Clock, Trash2, Webhook } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function OptimizationVisualizer() {
  const { adaptiveMode, logs, addLog } = useAppContext();
  const [phase, setPhase] = useState<"scanning" | "intervening" | "verifying" | "complete">("scanning");
  
  // Dynamic metrics
  const [closedTabs, setClosedTabs] = useState(0);
  const [suppressedNotifs, setSuppressedNotifs] = useState(0);

  // Intervention Timeline State
  const [interventions, setInterventions] = useState<{ id: string; label: string; status: 'pending' | 'executing' | 'done'; icon: any }[]>([]);

  useEffect(() => {
    // Determine the intervention payload based on target mode (which was already set in background, or we derive it)
    // Actually, AdaptiveWorkspace target mode is being transitioned TO.
    let plan = [
      { id: "i1", label: "Terminate Distractions (Close 12 Tabs)", status: "pending" as const, icon: Trash2 },
      { id: "i2", label: "Enable System DND", status: "pending" as const, icon: Shield },
    ];

    if (adaptiveMode === "deadline") {
      plan.push({ id: "i3", label: "Open Canvas Deliverable", status: "pending" as const, icon: AppWindow });
    } else if (adaptiveMode === "research") {
      plan.push({ id: "i3", label: "Load PDF References", status: "pending" as const, icon: FileText });
    } else if (adaptiveMode === "flow") {
      plan.push({ id: "i3", label: "Lock Workspace Execution", status: "pending" as const, icon: Target });
    }

    setInterventions(plan);

    const sequence = async () => {
      // 1. Scanning
      await new Promise(r => setTimeout(r, 1000));
      setPhase("intervening");
      
      // 2. Intervening (Execute sequentially)
      for (let i = 0; i < plan.length; i++) {
        setInterventions(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'executing' } : item));
        
        await new Promise(r => setTimeout(r, 800)); // Simulating API latency / OS binding
        
        // --- ACTUAL FUNCTIONALITY (Simulated OS / Real OS Opener) ---
        if (plan[i].label.includes("Close")) {
          setClosedTabs(12);
        } else if (plan[i].label.includes("DND")) {
          setSuppressedNotifs(8);
        } else if (plan[i].label.includes("Canvas")) {
          try { window.open("https://canvas.instructure.com", "_blank"); } catch (e) { console.error(e) }
        } else if (plan[i].label.includes("PDF")) {
          try { window.open("https://arxiv.org/pdf/1706.03762.pdf", "_blank"); } catch (e) { console.error(e) }
        }
        
        setInterventions(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'done' } : item));
      }

      // 3. Verifying
      setPhase("verifying");
      await new Promise(r => setTimeout(r, 800));
      
      // 4. Complete
      setPhase("complete");
    };

    sequence();
  }, [adaptiveMode]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-black/90 backdrop-blur-2xl"
    >
      <div className="absolute top-8 text-center w-full">
        <h2 className="text-xl font-bold tracking-[0.2em] uppercase text-white mb-2">Environment Sculptor</h2>
        <p className="text-xs font-mono text-accent">{phase.toUpperCase()} PROTOCOL</p>
      </div>

      <div className="relative w-full max-w-5xl h-full flex items-center justify-between px-16">
        
        {/* LEFT PANEL: BEFORE (Entropy) */}
        <div className="flex flex-col gap-4 w-64">
          <div className="text-[10px] font-mono text-secondary-text uppercase tracking-widest border-b border-white/10 pb-2 mb-2">System Entropy (Before)</div>
          
          <motion.div animate={{ opacity: phase === "scanning" ? 1 : 0.3 }} className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-danger/10 rounded-lg"><AppWindow className="w-5 h-5 text-danger" /></div>
            <div>
              <div className="text-white text-sm font-bold">16</div>
              <div className="text-[9px] text-white/50 uppercase">Open Tabs</div>
            </div>
          </motion.div>
          
          <motion.div animate={{ opacity: phase === "scanning" ? 1 : 0.3 }} className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-warning/10 rounded-lg"><Bell className="w-5 h-5 text-warning" /></div>
            <div>
              <div className="text-white text-sm font-bold">8</div>
              <div className="text-[9px] text-white/50 uppercase">Pending Alerts</div>
            </div>
          </motion.div>

          <motion.div animate={{ opacity: phase === "scanning" ? 1 : 0.3 }} className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg"><LayoutGrid className="w-5 h-5 text-blue-500" /></div>
            <div>
              <div className="text-white text-sm font-bold">4</div>
              <div className="text-[9px] text-white/50 uppercase">Scattered Windows</div>
            </div>
          </motion.div>
        </div>

        {/* CENTER PANEL: INTERVENTION TIMELINE */}
        <div className="flex-1 max-w-md mx-8 flex flex-col items-center">
          
          {/* Main Scanner Laser / Processor ring */}
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
            {phase === "scanning" && (
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-0 rounded-full border-t-2 border-l-2 border-accent/40"
              />
            )}
            {phase === "intervening" && (
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-accent/10 blur-xl"
              />
            )}
            {phase === "verifying" && (
              <motion.div className="absolute inset-0 rounded-full border-4 border-success/30" />
            )}
            
            {phase === "complete" ? (
              <CheckCircle2 className="w-16 h-16 text-success" />
            ) : (
              <Zap className={`w-12 h-12 ${phase === "intervening" ? "text-accent animate-pulse" : "text-white/20"}`} />
            )}
          </div>

          <div className="w-full space-y-3">
            <AnimatePresence mode="popLayout">
              {interventions.map((intervention) => (
                <motion.div
                  key={intervention.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`border rounded-lg p-3 flex items-center gap-3 transition-colors duration-500 ${
                    intervention.status === 'executing' ? 'bg-accent/10 border-accent/30' :
                    intervention.status === 'done' ? 'bg-success/5 border-success/20' :
                    'bg-white/5 border-white/5'
                  }`}
                >
                  {intervention.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : intervention.status === 'executing' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Clock className="w-4 h-4 text-accent" />
                    </motion.div>
                  ) : (
                    <intervention.icon className="w-4 h-4 text-white/20" />
                  )}
                  <span className={`text-xs font-mono font-semibold ${
                    intervention.status === 'done' ? 'text-success/80' :
                    intervention.status === 'executing' ? 'text-accent' :
                    'text-white/40'
                  }`}>
                    {intervention.label}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL: AFTER (Adaptation Success) */}
        <div className="flex flex-col gap-4 w-64 relative">
          <div className="text-[10px] font-mono text-success uppercase tracking-widest border-b border-success/20 pb-2 mb-2 flex items-center gap-2">
            <Target className="w-3 h-3" /> Target State (After)
          </div>

          {/* Overlay mask until complete */}
          {phase !== "complete" && phase !== "verifying" && (
             <div className="absolute inset-0 top-10 bg-black/60 backdrop-blur-[2px] z-10" />
          )}

          <motion.div layout className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(42,217,143,0.1)]">
            <div className="p-2 bg-success/10 rounded-lg"><AppWindow className="w-5 h-5 text-success" /></div>
            <div>
              <div className="text-white text-sm font-bold">4</div>
              <div className="text-[9px] text-white/50 uppercase">Essential Tabs</div>
              <div className="text-[8px] text-accent mt-0.5 font-mono">-{closedTabs} Terminated</div>
            </div>
          </motion.div>
          
          <motion.div layout className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(42,217,143,0.1)]">
            <div className="p-2 bg-success/10 rounded-lg"><Shield className="w-5 h-5 text-success" /></div>
            <div>
              <div className="text-white text-sm font-bold">DND Active</div>
              <div className="text-[9px] text-white/50 uppercase">System Silenced</div>
              <div className="text-[8px] text-accent mt-0.5 font-mono">{suppressedNotifs} Suppressed</div>
            </div>
          </motion.div>

          <motion.div layout className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(42,217,143,0.1)]">
            <div className="p-2 bg-success/10 rounded-lg"><Webhook className="w-5 h-5 text-success" /></div>
            <div>
              <div className="text-white text-sm font-bold capitalize">{adaptiveMode} Mode</div>
              <div className="text-[9px] text-white/50 uppercase">Workspace Locked</div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Progress Bar Footer */}
      <motion.div layout className="absolute bottom-12 w-full max-w-2xl px-8 flex flex-col items-center gap-3">
        <div className="flex justify-between w-full text-[9px] font-mono uppercase tracking-widest text-white/40">
          <span className={phase === "scanning" ? "text-accent" : ""}>01. Entropy Scan</span>
          <span className={phase === "intervening" ? "text-accent" : ""}>02. Execute Bindings</span>
          <span className={phase === "verifying" || phase === "complete" ? "text-success" : ""}>03. Verification</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
          <motion.div 
            className={`h-full ${phase === 'complete' ? 'bg-success' : 'bg-accent'}`}
            initial={{ width: "10%" }}
            animate={{ 
              width: phase === "scanning" ? "20%" : 
                     phase === "intervening" ? "60%" : 
                     phase === "verifying" ? "90%" : "100%" 
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

    </motion.div>
  );
}
