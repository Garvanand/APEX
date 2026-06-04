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

          {/* Final Screen Overlay */}
          <AnimatePresence>
            {override.showFinalScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col items-center justify-center pointer-events-auto"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="text-center space-y-12 max-w-4xl px-6"
                >
                  <div className="space-y-4">
                    <h1 className="text-7xl font-bold text-white tracking-tighter">APEX</h1>
                    <p className="text-2xl text-accent font-medium tracking-wide">Adaptive Presence & Execution Intelligence</p>
                  </div>
                  
                  <div className="space-y-2 text-xl text-secondary-text font-medium">
                    <p>Your phone understands you.</p>
                    <p>Your workspace adapts to you.</p>
                  </div>
                  
                  <div className="pt-8 space-y-6">
                    <p className="text-sm font-mono uppercase tracking-widest text-white/40">Not another productivity app.</p>
                    <p className="text-lg font-bold text-white tracking-widest uppercase">A new category.</p>
                  </div>

                  <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                      <span className="block text-success font-bold text-sm uppercase tracking-wider">Flow State</span>
                      <span className="block text-white font-mono mt-1">Restored</span>
                    </div>
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                      <span className="block text-success font-bold text-sm uppercase tracking-wider">Deadline Risk</span>
                      <span className="block text-white font-mono mt-1">Reduced</span>
                    </div>
                    <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                      <span className="block text-success font-bold text-sm uppercase tracking-wider">Environment</span>
                      <span className="block text-white font-mono mt-1">Optimized</span>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                      <span className="block text-white/60 font-bold text-sm uppercase tracking-wider">Session</span>
                      <span className="block text-white font-mono mt-1">Completed</span>
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
