import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Target, Clock, ShieldAlert, Zap, Activity } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useDemoState } from "../demo/DemoStateStore";

export default function GlobalExecutiveHeader() {
  const { cognitiveState, isConnected, isLocalMode, adaptiveMode } = useAppContext();
  const { isDemoPlaying, override } = useDemoState();

  const isFlow = cognitiveState === "Flow";
  const isOverload = cognitiveState === "Overloaded" || cognitiveState === "Fatigued";

  return (
    <header className={`h-14 w-full flex items-center justify-between px-6 z-[100] shrink-0 border-b transition-colors duration-500 ${isDemoPlaying ? 'bg-black border-white/20' : 'bg-black/40 border-white/5 backdrop-blur-md'}`}>
      
      {/* 1. Left: Brand & Cognitive State */}
      <div className="flex items-center gap-6">
        {/* State Badge with Animation based on state */}
        <motion.div 
          animate={{
            boxShadow: isFlow ? "0px 0px 15px rgba(0, 210, 106, 0.2)" : isOverload ? "0px 0px 20px rgba(255, 77, 79, 0.3)" : "0px 0px 0px rgba(0,0,0,0)",
            borderColor: isFlow ? "rgba(0, 210, 106, 0.4)" : isOverload ? "rgba(255, 77, 79, 0.5)" : "rgba(255, 255, 255, 0.1)"
          }}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border bg-black/50"
        >
          <span className={`w-2 h-2 rounded-full ${
            isFlow ? 'bg-success' : 
            cognitiveState === 'Distracted' ? 'bg-warning animate-pulse' : 
            'bg-danger animate-pulse'
          }`} />
          <span className="text-[11px] font-bold tracking-widest uppercase text-white font-mono">
            {cognitiveState}
          </span>
        </motion.div>

        {/* Global Objective */}
        <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-6">
          <Target className="w-3.5 h-3.5 text-secondary-text" />
          <span className="text-xs font-semibold text-white/90 truncate max-w-[200px]">
            {override.activeTask || "CS-4120 Compilers Protocol"}
          </span>
          <span className="text-[10px] font-mono text-secondary-text bg-white/5 px-2 py-0.5 rounded ml-2">
            {adaptiveMode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 2. Center: Demo / Local Execution Indicators */}
      <div className="flex items-center gap-4">
        <AnimatePresence>
          {isDemoPlaying && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 px-3 py-1 rounded bg-accent/10 border border-accent/20"
            >
              <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Demo Active</span>
            </motion.div>
          )}
          {isLocalMode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-3 py-1 rounded bg-danger/10 border border-danger/20"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-danger" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-danger">Local Engine</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Right: Deadline Risk & Devices */}
      <div className="flex items-center gap-6">
        {/* Deadline Status */}
        <div className="flex items-center gap-2">
          <Clock className={`w-3.5 h-3.5 ${override.finalRisk ? 'text-danger' : 'text-secondary-text'}`} />
          <div className="flex flex-col">
            <span className={`text-[10px] font-mono leading-none ${override.finalRisk ? 'text-danger' : 'text-secondary-text'}`}>
              RISK {override.finalRisk || override.urgencyScore || 45}%
            </span>
          </div>
        </div>

        {/* Device Status */}
        <div className="flex items-center gap-2 border-l border-white/10 pl-6">
          <Smartphone className={`w-3.5 h-3.5 ${isConnected ? 'text-success' : 'text-white/30'}`} />
          <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">
            {isConnected ? "Sensor Bridge" : "Sensors Offline"}
          </span>
        </div>
      </div>

    </header>
  );
}
