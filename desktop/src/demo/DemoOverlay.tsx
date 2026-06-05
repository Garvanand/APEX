import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoState } from './DemoStateStore';
import { DEMO_TIMELINE } from './DemoTimeline';

export function DemoOverlay() {
  const { currentSceneId, narrationText, override } = useDemoState();

  const currentScene = DEMO_TIMELINE.find(s => s.id === currentSceneId);

  return (
    <AnimatePresence>
      {currentSceneId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex flex-col justify-between"
        >
          {/* Top Title Banner */}
          <div className="w-full flex justify-center pt-8">
            <AnimatePresence mode="wait">
              {currentScene && (
                <motion.div
                  key={currentScene.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl px-8 py-4 pointer-events-auto"
                >
                  <h2 className="text-xl font-bold text-white tracking-widest uppercase font-mono">
                    {currentScene.title}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Narration */}
          <div className="w-full flex justify-center pb-32">
            <AnimatePresence mode="wait">
              {narrationText && (
                <motion.div
                  key={narrationText}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-3xl text-center bg-black/60 backdrop-blur-md border border-white/5 px-8 py-5 rounded-xl shadow-2xl"
                >
                  <p className="text-2xl md:text-3xl font-medium text-white/90 leading-relaxed tracking-wide">
                    "{narrationText}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Competitor Comparison Screen */}
          <AnimatePresence>
            {override.showCompetitorComparison && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center pointer-events-auto"
              >
                <div className="w-full max-w-5xl px-8 flex flex-col md:flex-row gap-8 items-center justify-center">
                  
                  {/* Without APEX */}
                  <motion.div 
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex-1 w-full bg-secondary-surface/50 border border-danger/20 rounded-2xl p-10 flex flex-col items-center text-center shadow-2xl"
                  >
                    <h3 className="text-sm font-mono uppercase tracking-widest text-danger mb-8">Without APEX</h3>
                    <div className="space-y-6 w-full">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-white/60">Tabs Open</span>
                        <span className="text-2xl font-bold text-white">20</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-white/60">Notifications</span>
                        <span className="text-2xl font-bold text-white">12</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-white/60">Execution Risk</span>
                        <span className="text-2xl font-bold text-danger">89%</span>
                      </div>
                      <div className="pt-4">
                        <span className="inline-block px-4 py-2 bg-danger/10 text-danger rounded-full text-sm font-bold uppercase tracking-widest">State: Distracted</span>
                      </div>
                    </div>
                  </motion.div>

                  <div className="text-white/20 text-4xl font-light">vs</div>

                  {/* With APEX */}
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.8 }}
                    className="flex-1 w-full bg-secondary-surface border border-success/30 rounded-2xl p-10 flex flex-col items-center text-center shadow-[0_0_50px_rgba(34,197,94,0.1)] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-[100px]" />
                    <h3 className="text-sm font-mono uppercase tracking-widest text-success mb-8">With APEX</h3>
                    <div className="space-y-6 w-full relative z-10">
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-white/60">Tabs Open</span>
                        <span className="text-2xl font-bold text-white">4</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-white/60">Notifications</span>
                        <span className="text-2xl font-bold text-white">0</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <span className="text-white/60">Execution Risk</span>
                        <span className="text-2xl font-bold text-success">32%</span>
                      </div>
                      <div className="pt-4">
                        <span className="inline-block px-4 py-2 bg-success/10 text-success rounded-full text-sm font-bold uppercase tracking-widest">State: Flow</span>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Final Executive Screen & Outcome Card */}
          <AnimatePresence>
            {override.showFinalScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 z-50 bg-[#0A0D0B] flex flex-col items-center justify-center pointer-events-auto overflow-y-auto py-12"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="w-full max-w-5xl px-8 flex flex-col md:flex-row gap-12 items-center"
                >
                  
                  {/* Left: Narrative Summary */}
                  <div className="flex-1 space-y-8">
                    <div className="space-y-2">
                      <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter">APEX</h1>
                      <p className="text-xl md:text-2xl text-accent font-medium tracking-wide">The First Cognitive Operating System.</p>
                    </div>
                    
                    <div className="space-y-4 pt-4 text-xl md:text-2xl text-white/80 font-medium leading-relaxed">
                      <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-accent"></span> Detected distraction.</p>
                      <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-accent"></span> Adapted workspace.</p>
                      <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-accent"></span> Restored flow.</p>
                      <p className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-accent"></span> Completed objective.</p>
                    </div>
                  </div>

                  {/* Right: Executive Outcome Card (Mission Debrief) */}
                  <div className="flex-1 w-full bg-secondary-surface border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <h3 className="text-xs font-mono uppercase tracking-widest text-secondary-text mb-8 border-b border-white/5 pb-4">Mission Debrief</h3>
                    
                    <div className="space-y-8">
                      {/* State Transition */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">Starting State</span>
                          <span className="text-xl font-bold text-warning">Distracted</span>
                        </div>
                        <div className="w-12 border-t border-dashed border-white/20 relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t border-r border-white/40 rotate-45" />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider mb-1">Ending State</span>
                          <span className="text-xl font-bold text-success">Flow State</span>
                        </div>
                      </div>

                      {/* Impact Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Flow Increase</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-white/40 line-through text-sm">61%</span>
                            <span className="text-2xl font-bold text-success">92%</span>
                          </div>
                        </div>
                        
                        <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Risk Reduction</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-white/40 line-through text-sm">89%</span>
                            <span className="text-2xl font-bold text-success">32%</span>
                          </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Assignment</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-white/40 line-through text-sm">28%</span>
                            <span className="text-2xl font-bold text-white">86%</span>
                          </div>
                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">Time Saved</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-accent">+17 min</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Summary text */}
                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs text-white/60">Interventions Performed: 4</span>
                        <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-1 rounded">Outcome: Success</span>
                      </div>
                    </div>
                  </div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
