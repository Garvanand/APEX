import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Zap, Server, Activity } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useDemoState } from '../demo/DemoStateStore';

export function BridgeOverlay() {
  const { cognitiveState } = useAppContext();
  const { override } = useDemoState();

  const isDistracted = cognitiveState === 'Distracted';
  const color = isDistracted ? 'text-warning' : 'text-success';
  const bgColor = isDistracted ? 'bg-warning' : 'bg-success';
  const borderColor = isDistracted ? 'border-warning/30' : 'border-success/30';

  if (!override.showBridgeAnimation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[160] flex flex-col items-center justify-center pointer-events-none bg-black/80 backdrop-blur-md"
      >
        <div className="absolute top-16 text-center">
          <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-white/50 mb-2">Cognitive Pipeline</h2>
          <p className="text-2xl font-bold tracking-widest text-white uppercase">{override.bridgeMessage || "Processing Biometrics"}</p>
        </div>

        <div className="flex items-center gap-4 md:gap-12 relative w-full max-w-4xl px-8 justify-center mt-12">
          
          {/* PHONE LAYER */}
          <div className="flex flex-col items-center gap-4 z-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className={`w-20 h-20 rounded-2xl border ${borderColor} bg-black/60 flex items-center justify-center relative overflow-hidden`}
            >
              <Smartphone className={`w-8 h-8 ${color}`} />
              <motion.div 
                className={`absolute inset-0 ${bgColor}/10`}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            </motion.div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-secondary-text">Sense</span>
              <p className="text-sm font-bold text-white">iQOO Device</p>
            </div>
          </div>

          {/* SIGNAL BEAM */}
          <div className="flex-1 max-w-[200px] h-[2px] bg-white/10 relative flex items-center z-0">
            <motion.div 
              className={`absolute h-[2px] ${bgColor} shadow-[0_0_20px_var(--tw-shadow-color)] shadow-${color}`}
              initial={{ width: 0, left: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "linear" }}
            />
            <div className="absolute inset-0 flex justify-center -top-6">
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">Office Kit Bridge</span>
            </div>
          </div>

          {/* ENGINE LAYER */}
          <div className="flex flex-col items-center gap-4 z-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className={`w-20 h-20 rounded-2xl border ${borderColor} bg-black/60 flex items-center justify-center relative overflow-hidden`}
            >
              <Server className={`w-8 h-8 ${color}`} />
              <motion.div 
                className={`absolute inset-0 ${bgColor}/10`}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.6 }}
              />
            </motion.div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-secondary-text">Reason</span>
              <p className="text-sm font-bold text-white">State Agent</p>
            </div>
          </div>

          {/* SIGNAL BEAM 2 */}
          <div className="flex-1 max-w-[200px] h-[2px] bg-white/10 relative flex items-center z-0">
            <motion.div 
              className={`absolute h-[2px] ${bgColor} shadow-[0_0_20px_var(--tw-shadow-color)] shadow-${color}`}
              initial={{ width: 0, left: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, ease: "linear", delay: 0.8 }}
            />
          </div>

          {/* DESKTOP LAYER */}
          <div className="flex flex-col items-center gap-4 z-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.4 }}
              className={`w-20 h-20 rounded-2xl border ${borderColor} bg-black/60 flex items-center justify-center relative overflow-hidden`}
            >
              <Zap className={`w-8 h-8 ${color}`} />
              <motion.div 
                className={`absolute inset-0 ${bgColor}/10`}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1, delay: 1.4 }}
              />
            </motion.div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-secondary-text">Adapt</span>
              <p className="text-sm font-bold text-white">Environment Sculptor</p>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
