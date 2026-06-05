import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Sparkles, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft, ShieldAlert } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function GlobalInterventionFeed({ activeTab }: { activeTab: string }) {
  const { logs, adaptiveMode } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isHidden = activeTab === "writing";
  const isMinimal = activeTab === "workspace" && adaptiveMode === "flow";
  const isCollapsible = activeTab === "research" || activeTab === "insights";

  if (isHidden) return null;

  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isCollapsed ? 48 : (isMinimal ? 300 : 340),
        opacity: 1
      }}
      className="h-full bg-secondary-surface border-l border-white/5 flex flex-col shrink-0 overflow-hidden relative"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="text-xs font-bold font-mono uppercase tracking-widest text-secondary-text flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5" />
              Cognitive Journey
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

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin relative">
        {/* Continuous Timeline Line */}
        {!isCollapsed && logs.length > 0 && (
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-white/5" />
        )}

        <AnimatePresence>
          {logs.map((log, index) => {
            const isFirst = index === 0;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                className="relative mb-6 last:mb-0"
              >
                {!isCollapsed ? (
                  <div className={`pl-8 relative ${isFirst ? 'opacity-100' : 'opacity-60'}`}>
                    {/* Timeline Dot */}
                    <div className={`absolute left-[-17px] top-1.5 w-2 h-2 rounded-full ring-4 ring-secondary-surface ${
                      isFirst ? 'bg-accent' : 'bg-white/20'
                    }`} />
                    
                    {/* Timestamp & Agent */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-secondary-text">{log.time}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">{log.agent}</span>
                    </div>

                    {/* Timeline Card */}
                    <div className={`p-3 rounded-lg border ${
                      isFirst ? "bg-black/40 border-white/10 shadow-lg" : "bg-black/20 border-white/5"
                    }`}>
                      {/* SENSE */}
                      {log.problem && (
                        <div className="mb-2">
                          <span className="text-[9px] uppercase font-bold text-danger/80 tracking-widest block mb-0.5">Sense</span>
                          <span className="text-xs text-white/90 leading-snug">{log.problem}</span>
                        </div>
                      )}

                      {/* REASON */}
                      {log.reason && (
                        <div className="mb-2">
                          <span className="text-[9px] uppercase font-bold text-warning/80 tracking-widest block mb-0.5">Reason</span>
                          <span className="text-xs text-white/90 leading-snug">{log.reason}</span>
                        </div>
                      )}
                      
                      {/* ADAPT */}
                      <div className="mb-2">
                        <span className="text-[9px] uppercase font-bold text-accent/80 tracking-widest block mb-0.5">Adapt</span>
                        <span className="text-xs text-white/90 leading-snug">{log.action}</span>
                      </div>

                      {/* IMPROVE */}
                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-success tracking-widest block mb-0.5">Improve</span>
                          <span className="text-[10px] text-white/80 font-mono">{log.outcome}</span>
                        </div>
                        {log.impact && (
                          <span className="text-[10px] font-bold px-2 py-1 bg-success/10 text-success rounded border border-success/20">
                            {log.impact}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Collapsed Icon View */
                  <div className="flex justify-center mb-4" title={`${log.agent}: ${log.action}`}>
                    <div className="w-2 h-2 rounded-full bg-white/20" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
