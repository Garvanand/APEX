import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoState } from './DemoStateStore';
import { DEMO_TIMELINE } from './DemoTimeline';
import { ShieldAlert, Clock, ChevronRight } from 'lucide-react';

export function DemoRehearsalOverlay() {
  const [isRehearsalMode, setIsRehearsalMode] = useState(false);
  const { currentSceneId, isDemoPlaying } = useDemoState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsRehearsalMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isRehearsalMode || !isDemoPlaying) return null;

  const currentSceneIndex = DEMO_TIMELINE.findIndex(s => s.id === currentSceneId);
  const currentScene = DEMO_TIMELINE[currentSceneIndex];
  const nextScene = DEMO_TIMELINE[currentSceneIndex + 1];

  return (
    <div className="fixed top-0 left-0 bottom-0 w-[400px] bg-black/90 border-r border-white/10 z-[100] p-6 text-left flex flex-col pointer-events-none">
      
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2 text-warning">
          <ShieldAlert className="w-5 h-5" />
          <span className="font-bold uppercase tracking-widest text-xs">Rehearsal Mode Active</span>
        </div>
        <div className="flex items-center gap-1 text-white/50 font-mono text-xs">
          <Clock className="w-4 h-4" />
          <span>{currentScene?.durationMs ? currentScene.durationMs / 1000 : 0}s</span>
        </div>
      </div>

      {currentScene && (
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 overflow-y-auto pr-2 scrollbar-thin"
        >
          <h2 className="text-white font-bold text-xl mb-4">{currentScene.title}</h2>
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Primary Narration</span>
              <div className="space-y-3">
                {currentScene.narration.map((line, i) => (
                  <p key={i} className="text-white text-lg font-medium border-l-2 border-accent pl-4">{line}</p>
                ))}
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <span className="text-[10px] uppercase tracking-widest text-warning block mb-2">Backup Explanations</span>
              <ul className="list-disc pl-4 text-xs text-white/70 space-y-2">
                <li>If asked about ChatGPT: "APEX is active, ChatGPT is passive."</li>
                <li>If asked about Phone: "iQOO Bridge provides zero-latency biometrics."</li>
                <li>If asked about Privacy: "Local-first edge compute on NPU."</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {nextScene && (
        <div className="mt-auto pt-6 border-t border-white/10">
          <span className="text-[10px] uppercase tracking-widest text-white/40 block mb-2">Up Next</span>
          <div className="flex items-center gap-2 text-white/80">
            <ChevronRight className="w-4 h-4 text-accent" />
            <span className="font-medium">{nextScene.title}</span>
          </div>
        </div>
      )}

    </div>
  );
}
