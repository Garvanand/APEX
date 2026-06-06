import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronRight, ChevronLeft, Terminal, CheckCircle2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function GlobalInterventionFeed({ activeTab }: { activeTab: string }) {
  const { adaptiveMode, networkLogs, lastDemoSync } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isHidden = activeTab === "writing";
  const isMinimal = activeTab === "workspace" && adaptiveMode === "flow";
  const isCollapsible = activeTab === "research" || activeTab === "insights";

  if (isHidden) return null;

  const currentStep = lastDemoSync?.step ?? -1;
  const beforeMetrics = lastDemoSync?.before ?? { failureRisk: "89%", estimatedCompletion: "11:58 PM", contextSwitches: "17", timeSaved: "0m" };
  const afterMetrics = lastDemoSync?.after ?? { failureRisk: "--", estimatedCompletion: "--", contextSwitches: "--", timeSaved: "--" };

  const timelineSteps = [
    { id: 0, label: "Distraction Detected" },
    { id: 1, label: "Deadline Risk Calculated" },
    { id: 2, label: "Environment Adapted" },
    { id: 3, label: "Critical Insight Surfaced" },
    { id: 4, label: "Understanding Validated" },
    { id: 5, label: "Flow Restored" }
  ];

  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isCollapsed ? 48 : (isMinimal ? 340 : 380),
        opacity: 1
      }}
      className="h-full bg-secondary-surface border-l border-white/5 flex flex-col shrink-0 overflow-hidden relative"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="text-xs font-bold font-mono uppercase tracking-widest text-secondary-text flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5" />
              Ecosystem Mission Control
            </motion.span>
          )}
        </AnimatePresence>
        
        {isCollapsible && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded hover:bg-white/5 transition-colors"
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4 text-secondary-text" /> : <ChevronRight className="w-4 h-4 text-secondary-text" />}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin relative flex flex-col">
        {!isCollapsed && (
          <>
            {/* 1. Developer Console (Verification) */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-3 h-3 text-white/40" />
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Network Verification</span>
              </div>
              <div className="bg-black/60 rounded p-2 h-24 overflow-y-auto font-mono text-[9px] text-green-400/80 leading-relaxed break-all">
                {networkLogs.length === 0 ? "Awaiting Office Kit events..." : null}
                {networkLogs.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))}
              </div>
            </div>

            {/* 2. Outcome Board */}
            <div className="p-4 border-b border-white/5 bg-black/20">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest block mb-4">Outcome Board</span>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Before */}
                <div className="space-y-3 p-3 bg-danger/5 border border-danger/20 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-danger/80 text-center block tracking-widest">Before Intervention</span>
                  <div>
                    <span className="text-[9px] text-white/50 block">Failure Risk</span>
                    <span className="text-xs font-bold text-white font-mono">{beforeMetrics.failureRisk}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/50 block">Context Switches</span>
                    <span className="text-xs font-bold text-white font-mono">{beforeMetrics.contextSwitches}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/50 block">Est. Completion</span>
                    <span className="text-[10px] font-bold text-white font-mono">{beforeMetrics.estimatedCompletion}</span>
                  </div>
                </div>

                {/* After */}
                <div className="space-y-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-success/80 text-center block tracking-widest">After Intervention</span>
                  <div>
                    <span className="text-[9px] text-white/50 block">Failure Risk</span>
                    <span className="text-xs font-bold text-success font-mono">{afterMetrics.failureRisk}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/50 block">Time Saved</span>
                    <span className="text-xs font-bold text-success font-mono">{afterMetrics.timeSaved}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/50 block">Est. Completion</span>
                    <span className="text-[10px] font-bold text-success font-mono">{afterMetrics.estimatedCompletion}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Mission Timeline */}
            <div className="p-4 flex-1">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest block mb-4">Execution Timeline</span>
              <div className="relative pl-2">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10" />
                {timelineSteps.map((step) => {
                  const isCompleted = currentStep > step.id;
                  const isActive = currentStep === step.id;
                  const isFuture = currentStep < step.id;

                  return (
                    <div key={step.id} className={`relative flex items-center gap-4 mb-4 last:mb-0 ${isFuture ? 'opacity-30' : 'opacity-100'}`}>
                      <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center bg-secondary-surface ring-4 ring-secondary-surface
                        ${isCompleted ? 'text-success' : isActive ? 'text-accent' : 'text-white/20'}`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-accent animate-pulse' : 'bg-white/20'}`} />}
                      </div>
                      <span className={`text-xs font-bold font-mono tracking-tight ${isCompleted ? 'text-white/60' : isActive ? 'text-accent' : 'text-white/40'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
