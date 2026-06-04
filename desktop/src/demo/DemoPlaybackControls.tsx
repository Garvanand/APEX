import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw, X } from 'lucide-react';
import { useDemoState } from './DemoStateStore';
import { useDemoController } from './DemoController';
import { DEMO_TIMELINE } from './DemoTimeline';

export function DemoPlaybackControls() {
  const { isDemoPlaying, currentSceneId, sceneProgress } = useDemoState();
  const { play, pause, stop, replay, skipTo } = useDemoController();

  if (!currentSceneId) return null;

  const currentIndex = DEMO_TIMELINE.findIndex(s => s.id === currentSceneId);
  const totalDuration = DEMO_TIMELINE.reduce((acc, s) => acc + s.durationMs, 0);
  
  // Calculate total progress
  let elapsedBefore = 0;
  for (let i = 0; i < currentIndex; i++) {
    elapsedBefore += DEMO_TIMELINE[i].durationMs;
  }
  const currentSceneDuration = DEMO_TIMELINE[currentIndex].durationMs;
  const currentElapsed = elapsedBefore + (currentSceneDuration * sceneProgress);
  const totalProgress = currentElapsed / totalDuration;

  const handleSkip = () => {
    if (currentIndex + 1 < DEMO_TIMELINE.length) {
      skipTo(DEMO_TIMELINE[currentIndex + 1].id);
    }
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-full max-w-2xl px-6"
    >
      {/* Timeline Scrubber */}
      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden flex shadow-lg backdrop-blur-sm border border-white/10">
        {DEMO_TIMELINE.map((scene, i) => {
          const widthPercent = (scene.durationMs / totalDuration) * 100;
          let fill = 0;
          if (i < currentIndex) fill = 100;
          else if (i === currentIndex) fill = sceneProgress * 100;

          return (
            <div key={scene.id} style={{ width: `${widthPercent}%` }} className="h-full bg-white/10 border-r border-black/50 last:border-r-0 relative">
              <div style={{ width: `${fill}%` }} className="absolute left-0 top-0 h-full bg-accent transition-all duration-75" />
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl">
        <button 
          onClick={replay}
          className="text-white/60 hover:text-white transition-colors p-2"
          title="Replay from Start"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button 
          onClick={isDemoPlaying ? pause : play}
          className="bg-white text-black p-3 rounded-full hover:scale-105 transition-transform"
          title={isDemoPlaying ? "Pause" : "Play"}
        >
          {isDemoPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
        </button>

        <button 
          onClick={handleSkip}
          className="text-white/60 hover:text-white transition-colors p-2"
          title="Skip Scene"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-white/20 mx-2" />

        <button 
          onClick={stop}
          className="text-danger hover:text-danger/80 transition-colors p-2 flex items-center gap-2"
          title="Exit Demo"
        >
          <X className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Exit</span>
        </button>
      </div>
    </motion.div>
  );
}
