import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ChevronRight, ChevronLeft, Terminal, CheckCircle2, Shield, Radio, Smartphone, Cpu } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function GlobalInterventionFeed({ activeTab }: { activeTab: string }) {
  const { adaptiveMode, networkLogs, lastDemoSync, timeline, sculptorAction, phoneConnected, phoneDeviceName, latencyMs } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [feedMode, setFeedMode] = useState<"timeline" | "network" | "outcome">("timeline");

  const isHidden = activeTab === "writing";
  const isMinimal = activeTab === "workspace" && adaptiveMode === "flow";
  const isCollapsible = activeTab === "research" || activeTab === "insights";

  if (isHidden) return null;

  const currentStep = lastDemoSync?.step ?? -1;
  const beforeMetrics = lastDemoSync?.before ?? { failureRisk: "89%", estimatedCompletion: "11:58 PM", contextSwitches: "17", timeSaved: "0m" };
  const afterMetrics = lastDemoSync?.after ?? { failureRisk: "--", estimatedCompletion: "--", contextSwitches: "--", timeSaved: "--" };

  // Environment Sculptor lifecycle stages
  const sculptorStages = [
    { id: 'proposed', label: 'PROPOSED' },
    { id: 'approved', label: 'APPROVED' },
    { id: 'executing', label: 'EXECUTING' },
    { id: 'completed', label: 'EXECUTED' },
    { id: 'acknowledged', label: 'ACKNOWLEDGED' },
  ];

  const getSculptorStepIndex = () => {
    switch (sculptorAction.status) {
      case 'proposed': return 0;
      case 'executing': return 2;
      case 'completed': return 4;
      default: return -1;
    }
  };

  const sculptorStepIdx = getSculptorStepIndex();

  const getSourceBadgeColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'mobile':
      case 'phone':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'relay':
        return 'text-accent bg-accent/10 border-accent/20';
      case 'desktop':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isCollapsed ? 48 : (isMinimal ? 340 : 380),
        opacity: 1
      }}
      className="h-full bg-secondary-surface border-l border-white/5 flex flex-col shrink-0 overflow-hidden relative"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/40">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold font-mono uppercase tracking-widest text-secondary-text">
                Ecosystem Mission Control
              </span>
            </motion.div>
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
            {/* 1. Environment Sculptor Lifecycle Panel */}
            <div className="p-4 border-b border-white/5 bg-black/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-accent" />
                  <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Environment Sculptor</span>
                </div>
                <span data-testid="sculptor-status" className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                  sculptorAction.status === 'executing' ? 'bg-warning/20 text-warning animate-pulse' :
                  sculptorAction.status === 'completed' ? 'bg-success/20 text-success' :
                  sculptorAction.status === 'proposed' ? 'bg-accent/20 text-accent' :
                  'bg-white/5 text-white/40'
                }`}>
                  {sculptorAction.status.toUpperCase()}
                </span>
              </div>

              {/* Lifecycle Progress Bar */}
              <div className="grid grid-cols-5 gap-1 mb-2">
                {sculptorStages.map((stage, idx) => {
                  const isActive = sculptorStepIdx >= idx;
                  const isCurrent = sculptorStepIdx === idx || (idx === 1 && sculptorStepIdx >= 0) || (idx === 3 && sculptorStepIdx >= 2);
                  return (
                    <div key={stage.id} className="flex flex-col items-center">
                      <div className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                        isActive ? 'bg-accent' : 'bg-white/10'
                      }`} />
                      <span className={`text-[7px] font-mono mt-1 ${
                        isActive ? 'text-accent font-bold' : 'text-white/30'
                      }`}>
                        {stage.label.slice(0, 4)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {sculptorAction.action && (
                <div className="text-[10px] font-mono text-white/80 bg-white/5 p-2 rounded border border-white/5 truncate">
                  {sculptorAction.action}
                </div>
              )}
            </div>

            {/* 2. Navigation Tabs */}
            <div className="flex items-center border-b border-white/5 bg-black/20 text-[10px] font-mono">
              <button
                onClick={() => setFeedMode("timeline")}
                className={`flex-1 py-2 text-center uppercase tracking-wider font-bold transition-colors ${
                  feedMode === "timeline" ? "text-accent border-b-2 border-accent bg-accent/5" : "text-white/40 hover:text-white/70"
                }`}
              >
                Event Timeline
              </button>
              <button
                onClick={() => setFeedMode("network")}
                className={`flex-1 py-2 text-center uppercase tracking-wider font-bold transition-colors ${
                  feedMode === "network" ? "text-accent border-b-2 border-accent bg-accent/5" : "text-white/40 hover:text-white/70"
                }`}
              >
                Network ({networkLogs.length})
              </button>
              <button
                onClick={() => setFeedMode("outcome")}
                className={`flex-1 py-2 text-center uppercase tracking-wider font-bold transition-colors ${
                  feedMode === "outcome" ? "text-accent border-b-2 border-accent bg-accent/5" : "text-white/40 hover:text-white/70"
                }`}
              >
                Outcomes
              </button>
            </div>

            {/* Tab: Real Event Timeline */}
            {feedMode === "timeline" && (
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Cross-Device Pipeline</span>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/40">
                    <Radio className="w-3 h-3 text-accent animate-pulse" />
                    <span>Real-time</span>
                  </div>
                </div>

                <div className="relative pl-3 space-y-3">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/10" />
                  {timeline.length === 0 ? (
                    <div className="text-xs font-mono text-white/30 italic py-4">Awaiting cross-device events...</div>
                  ) : (
                    timeline.slice(0, 15).map((entry, idx) => (
                      <div key={`${entry.id}-${idx}`} className="relative flex items-start gap-3">
                        <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-secondary-surface ring-2 ring-white/20 mt-1 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[9px] font-mono text-white/40">{entry.time}</span>
                            <span className={`text-[8px] font-mono font-bold uppercase px-1 rounded border ${getSourceBadgeColor(entry.source)}`}>
                              {entry.source}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono font-semibold text-white/90 truncate">
                            {entry.event}
                          </div>
                          {entry.detail && (
                            <div className="text-[9px] font-mono text-white/50 truncate">
                              {entry.detail}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab: Network Verification */}
            {feedMode === "network" && (
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-3 h-3 text-white/40" />
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Network Verification</span>
                </div>
                <div className="flex-1 bg-black/60 rounded p-3 overflow-y-auto font-mono text-[9px] text-green-400/80 leading-relaxed break-all">
                  {networkLogs.length === 0 ? "Awaiting WebSocket traffic..." : null}
                  {networkLogs.map((log: string, i: number) => (
                    <div key={i} className="mb-1">{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Outcome Board */}
            {feedMode === "outcome" && (
              <div className="p-4 flex-1">
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
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
