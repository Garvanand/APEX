import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Target, Clock, ShieldAlert, Activity, Wifi, WifiOff, Signal } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useDemoState } from "../demo/DemoStateStore";

const CONNECTION_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  offline: { label: 'Relay Offline', color: 'text-danger', icon: <WifiOff className="w-3.5 h-3.5 text-danger" /> },
  connecting: { label: 'Connecting...', color: 'text-warning animate-pulse', icon: <Wifi className="w-3.5 h-3.5 text-warning animate-pulse" /> },
  connected: { label: 'Connected', color: 'text-success', icon: <Signal className="w-3.5 h-3.5 text-success" /> },
  degraded: { label: 'Degraded', color: 'text-warning', icon: <Signal className="w-3.5 h-3.5 text-warning" /> },
  reconnecting: { label: 'Reconnecting...', color: 'text-warning animate-pulse', icon: <Wifi className="w-3.5 h-3.5 text-warning animate-pulse" /> },
};

export default function GlobalExecutiveHeader() {
  const { cognitiveState, confidence, connectionStatus, isConnected, latencyMs, adaptiveMode, phoneConnected, phoneDeviceName, stateSource, stateUpdatedAt } = useAppContext();
  const { isDemoPlaying, override } = useDemoState();

  const isFlow = cognitiveState === "Flow";
  const isOverload = cognitiveState === "Overloaded" || cognitiveState === "Fatigued";
  const connInfo = CONNECTION_LABELS[connectionStatus] || CONNECTION_LABELS.offline;

  const formattedUpdated = stateUpdatedAt 
    ? new Date(stateUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

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
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border bg-black/60"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${
            isFlow ? 'bg-success' : 
            cognitiveState === 'Distracted' ? 'bg-warning animate-pulse' : 
            'bg-danger animate-pulse'
          }`} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span data-testid="header-cognitive-state" className="text-[11px] font-bold tracking-widest uppercase text-white font-mono">
                {cognitiveState}
              </span>
              <span className="text-[10px] font-mono text-accent font-semibold">
                {Math.round(confidence > 1 ? confidence : confidence * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-mono text-white/40">
              <span>{stateSource === 'mobile' ? (phoneDeviceName || 'Mobile Edge') : stateSource === 'relay_ml' ? 'Relay ONNX' : stateSource === 'demo' ? 'Controlled Demo' : 'Local Sensor'}</span>
              {formattedUpdated && <span>• {formattedUpdated}</span>}
            </div>
          </div>
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

      {/* 2. Center: Connection + Demo Indicators */}
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
        </AnimatePresence>
      </div>

      {/* 3. Right: Network + Devices */}
      <div className="flex items-center gap-4">
        {/* Relay Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
          {connInfo.icon}
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${connInfo.color}`}>
              {connInfo.label}
            </span>
            {isConnected && (
              <span className="text-[8px] font-mono text-white/30">
                {latencyMs}ms RTT
              </span>
            )}
          </div>
        </div>

        {/* Phone Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg transition-all duration-300 ${
          phoneConnected 
            ? 'bg-success/10 border-success/30' 
            : 'bg-white/5 border-white/10'
        }`}>
          <Smartphone className={`w-3.5 h-3.5 ${phoneConnected ? 'text-success' : 'text-white/30'}`} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${phoneConnected ? 'bg-success' : 'bg-white/30'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${phoneConnected ? 'text-success' : 'text-white/40'}`}>
                {phoneConnected ? 'PHONE CONNECTED' : 'PHONE OFFLINE'}
              </span>
            </div>
            {phoneConnected && (
              <span className="text-[8px] font-mono text-white/40">
                {phoneDeviceName || 'Mobile Companion'}
              </span>
            )}
          </div>
        </div>

        {/* Deadline Risk */}
        <div className="flex items-center gap-2">
          <Clock className={`w-3.5 h-3.5 ${override.finalRisk ? 'text-danger' : 'text-secondary-text'}`} />
          <span className={`text-[10px] font-mono leading-none ${override.finalRisk ? 'text-danger' : 'text-secondary-text'}`}>
            RISK {override.finalRisk || override.urgencyScore || 45}%
          </span>
        </div>
      </div>

    </header>
  );
}
