import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Shield, Zap, Clock, TrendingUp } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function MissionDebriefModal() {
  const { showDebrief, setShowDebrief } = useAppContext();

  if (!showDebrief) return null;

  return (
    <AnimatePresence>
      {showDebrief && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-2xl bg-secondary-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10 bg-black/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Mission Debrief</h2>
                  <p className="text-xs text-white/50 font-mono mt-1">SESSION SUMMARY • iQOO 13 INTELLIGENCE</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDebrief(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-bold text-white/70 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-3 gap-6">
                
                {/* Metric 1 */}
                <div className="p-6 bg-black/40 border border-white/5 rounded-xl flex flex-col items-center justify-center text-center">
                  <TrendingUp className="w-8 h-8 text-accent mb-4" />
                  <span className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">Flow State</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono text-white/30 line-through">61%</span>
                    <span className="text-4xl font-bold text-white">92%</span>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-6 bg-black/40 border border-white/5 rounded-xl flex flex-col items-center justify-center text-center">
                  <Shield className="w-8 h-8 text-success mb-4" />
                  <span className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">Burnout Risk</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono text-white/30 line-through">89%</span>
                    <span className="text-4xl font-bold text-white">32%</span>
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-6 bg-black/40 border border-white/5 rounded-xl flex flex-col items-center justify-center text-center">
                  <Clock className="w-8 h-8 text-warning mb-4" />
                  <span className="text-sm font-bold text-white/50 uppercase tracking-widest mb-2">Time Saved</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">17<span className="text-xl">m</span></span>
                  </div>
                </div>

              </div>

              <div className="mt-8 p-6 bg-accent/10 border border-accent/20 rounded-xl flex items-start gap-4">
                <Zap className="w-6 h-6 text-accent shrink-0 mt-1" />
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Intelligence Driven by iQOO</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    By leveraging real-time sensor data from your iQOO device, APEX was able to proactively sculpt your Office Kit environment 14 times before cognitive fatigue could set in. The phone is the true hero of this session.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
