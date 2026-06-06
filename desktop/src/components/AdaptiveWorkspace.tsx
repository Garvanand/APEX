import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Eye, Volume2, CheckCircle2, AlertTriangle, 
  Play, ShieldAlert, Zap, Brain, Sparkles, RotateCcw,
  BookOpen, Edit3, Target, Plus, ExternalLink, Link2, Cpu
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { fetchWithRetry } from "../utils/api";
import CognitiveStateEngine from "../components/CognitiveStateEngine";
import AgentActivityStream from "../components/AgentActivityStream";
import AgentCollaborationGraph from "../components/AgentCollaborationGraph";
import MobileSimulatorPage from "../pages/MobileSimulatorPage";
import { useDemoState } from "../demo/DemoStateStore";
import WorkspaceStoryEngine from "./WorkspaceStoryEngine";
import DesktopAgentMonitor from "./DesktopAgentMonitor";

export default function AdaptiveWorkspace() {
  const { cognitiveState, confidence, logs, addLog, telemetry, interpreted, adaptiveMode, setAdaptiveMode, triggerOptimization, isApexEnabled, lastDemoSync } = useAppContext();
  const { override } = useDemoState();
  
  // Right panel states
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<"agents" | "mobile">("agents");

  // Local IP for QR Code
  const [localIp, setLocalIp] = useState<string>("192.168.31.2");

  useEffect(() => {
    fetch("http://localhost:8080/api/v1/network/info")
      .then(res => res.json())
      .then(data => {
        if (data.ip) setLocalIp(data.ip);
      })
      .catch(e => console.error("Failed to fetch local IP", e));
  }, []);

  // Agents status state embedded contextually
  const [agents, setAgents] = useState([
    {
      id: "state",
      name: "State Agent",
      status: "active",
      latency: 48,
      description: "Classifies real-time cognitive workload by analyzing biometric telemetry and interaction dynamics.",
      color: "#00D26A",
      lastAction: "Determined Flow State with 92% confidence",
      autonomyLevel: 90,
    },
    {
      id: "deadline",
      name: "Deadline Sentinel",
      status: "active",
      latency: 110,
      description: "Monitors Canvas LMS, calendars, and syllabus schedules to calculate dynamic risk vectors.",
      color: "#FF4D4F",
      lastAction: "Re-calculated threat index for compilers",
      autonomyLevel: 75,
    },
    {
      id: "sculptor",
      name: "Environment Sculptor",
      status: "active",
      latency: 85,
      description: "Controls the desktop workspace, arranging windows, auto-closing tabs, and managing deep focus blocks.",
      color: "#FFB800",
      lastAction: "Suppressed system notifications",
      autonomyLevel: 80,
    },
    {
      id: "radar",
      name: "Peer Radar",
      status: "active",
      latency: 220,
      description: "Monitors collaborative platforms to surface peer notifications when contextually relevant.",
      color: "#007AFF",
      lastAction: "Muted non-essential project channels",
      autonomyLevel: 60,
    },
    {
      id: "socratic",
      name: "Socratic Challenger",
      status: "idle",
      latency: 310,
      description: "Analyzes reading material and active workspace content to prompt active recall challenges.",
      color: "#FFFFFF",
      lastAction: "Hibernated during deep work session",
      autonomyLevel: 50,
    },
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState("state");
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  const handleAutonomyChange = (id: string, val: number) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, autonomyLevel: val } : a));
    addLog("System", "User manual override", "Direct slider input", `Set ${agents.find(a => a.id === id)?.name} autonomy level to ${val}%`, "Autonomy updated", "System +0", 100);
  };

  const toggleStatus = (id: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === id) {
        const newStatus = a.status === "active" ? "paused" : "active";
        addLog(a.name, "User manual override", "Direct switch toggle", `Changed status to: ${newStatus.toUpperCase()}`, "Status updated", "System +0", 100);
        return { ...a, status: newStatus as any };
      }
      return a;
    }));
  };

  // Shared state for the Active Focus
  const [activeTask, setActiveTask] = useState("Research and draft compiler parsing algorithm");
  const [taskDuration, setTaskDuration] = useState(2400); // 40 mins
  const [timerRunning, setTimerRunning] = useState(true);

  // Shared state for Research Mode
  const [sources, setSources] = useState([
    { id: "s-1", title: "LL(k) Grammar Analysis for Parser Construction", author: "A. V. Aho et al.", score: 98, cited: true },
    { id: "s-2", title: "Error Recovery Schemes in Dynamic Recursive Languages", desc: "Panic-mode recovery discards input tokens...", score: 85, cited: false }
  ]);
  const [activeSourceId, setActiveSourceId] = useState("s-1");

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full w-full gap-6 overflow-hidden select-none">
      
      {/* ── Left Side: Main Execution Canvas ── */}
      <motion.div 
        layout
        className={`relative flex-1 flex flex-col min-w-0 transition-all duration-700 ${adaptiveMode === "recovery" ? "filter grayscale opacity-90" : ""}`}
      >
        {/* APEX DISABLED CHAOS OVERLAY */}
        <AnimatePresence>
          {!isApexEnabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-full max-w-2xl bg-white text-black p-8 rounded-lg shadow-2xl rotate-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex flex-col items-center justify-center text-white font-bold text-xs shrink-0">
                    <span className="text-xl">99+</span>
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold">Standard OS Environment</h2>
                    <p className="text-sm text-gray-600">No Intelligence Layer Active</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded text-left border border-gray-300">
                    <span className="font-bold">Discord:</span> "Hey did you finish the parsing algorithm?"
                  </div>
                  <div className="p-4 bg-gray-100 rounded text-left border border-gray-300">
                    <span className="font-bold">Outlook:</span> "Your AWS bill for this month is..."
                  </div>
                  <div className="p-4 bg-gray-100 rounded text-left border border-gray-300">
                    <span className="font-bold">System:</span> "Updates are ready to install."
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl border border-dashed border-gray-400">
                  <p className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-widest">
                    Scan to Bridge iQOO Office Kit
                  </p>
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <QRCodeSVG value={`http://${localIp}:8080`} size={180} fgColor="#000000" bgColor="#FFFFFF" />
                  </div>
                  <p className="mt-4 text-xs font-mono text-gray-500">
                    IP: {localIp}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Level Emergency Recovery Banner */}
        <AnimatePresence mode="wait">
          {adaptiveMode === "recovery" && (
            <motion.div
              layoutId="recovery-banner"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`rounded-xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border shrink-0 ${
                cognitiveState === "Overloaded" ? "bg-danger/10 border-danger/20" : "bg-warning/10 border-warning/20"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-3 h-3 rounded-full animate-pulse ${cognitiveState === "Overloaded" ? "bg-danger" : "bg-warning"}`} />
                <div className="text-sm font-medium text-white">
                  <span className={`font-semibold ${cognitiveState === "Overloaded" ? "text-danger" : "text-warning"}`}>
                    {cognitiveState === "Overloaded" ? "CRITICAL OVERLOAD:" : "FATIGUE DETECTION:"}
                  </span> 
                  {" "}
                  {cognitiveState === "Overloaded" 
                    ? "Stress metrics exceed 95th percentile. Executive functions degraded. Activating emergency triage."
                    : "Cumulative focus logs suggest a 5-minute offline screen disconnect. Cognitive resources depleted."}
                </div>
              </div>
              {cognitiveState === "Overloaded" && (
                <button
                  onClick={() => { setAdaptiveMode("flow"); }}
                  className="px-4 py-2 bg-danger hover:bg-danger/80 text-black text-xs font-bold rounded-lg transition-colors"
                >
                  Deactivate Triage
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace Story Engine */}
        <AnimatePresence>
          {adaptiveMode !== "flow" && (
            <motion.div className="mb-6 z-20 relative" layoutId="story-engine">
              <WorkspaceStoryEngine />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Focus Block (Only for non-flow modes) */}
        <AnimatePresence>
          {adaptiveMode !== "flow" && (
            <motion.div 
              layoutId="active-focus-block"
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="bg-secondary-surface border border-white/5 rounded-xl flex-shrink-0 z-20 mb-6 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  cognitiveState === 'Flow' ? 'bg-success' :
                  cognitiveState === 'Distracted' ? 'bg-warning' :
                  cognitiveState === 'Fatigued' ? 'bg-accent' : 'bg-danger'
                }`} />
                {lastDemoSync?.step === 3 || lastDemoSync?.step === 4 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 bg-black/60 rounded border border-white/10 px-4 py-2 flex flex-col justify-center"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Cpu className="w-4 h-4 text-accent animate-pulse" />
                      <span className="text-xs font-bold font-mono tracking-widest text-accent uppercase">
                        {lastDemoSync.step === 3 ? "Peer Radar Active" : "Socratic Challenger Active"}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-white/80 animate-pulse">
                      {lastDemoSync.step === 3 
                        ? "Analyzing 42 discussion messages... Building concept graph..." 
                        : "Processing reading material... Generating validation questions..."}
                    </span>
                  </motion.div>
                ) : (
                  <input
                    type="text"
                    className="bg-transparent border-none text-white focus:outline-none text-sm font-medium w-full md:w-96 truncate"
                    value={activeTask}
                    onChange={(e) => setActiveTask(e.target.value)}
                  />
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-[10px] text-secondary-text font-mono bg-black/40 px-2 py-1 rounded">
                  Mode: {adaptiveMode.toUpperCase()}
                </div>
                <span className="text-sm font-mono tracking-tight text-white mr-2">
                  {formatTime(taskDuration)}
                </span>
                
                {/* Collapsed control toggle */}
                {!rightPanelOpen && (
                  <button
                    onClick={() => setRightPanelOpen(true)}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-bold text-accent transition-colors flex items-center gap-1.5"
                    title="Show controls"
                  >
                    <Cpu className="w-3 h-3 text-accent" /> Control Center
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DesktopAgentMonitor />

        {/* Main Dynamic Canvas Content */}
        <motion.div layout className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="popLayout">
            
            {/* 1. FLOW MODE (Zen Mission Canvas) */}
            {adaptiveMode === "flow" && (
              <motion.div
                key="flow"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-black rounded-2xl border border-white/5"
              >
                {/* Secondary Timer & Panel Toggles Top Right */}
                <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
                  <div className="text-[10px] text-secondary-text font-mono bg-white/5 px-2 py-1 rounded border border-white/5 backdrop-blur-md">
                    T-MINUS
                  </div>
                  <span className="text-xl font-mono tracking-tight text-white/80">
                    {formatTime(taskDuration)}
                  </span>
                  <button 
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-secondary-text transition-colors border border-white/5"
                  >
                    <Play className={`w-3 h-3 ${timerRunning ? "rotate-90 text-accent" : ""}`} />
                  </button>
                  <button 
                    onClick={() => {
                      fetchWithRetry("http://localhost:8000/api/v1/cognitive/simulate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ state: "DISTRACTED" })
                      }).catch(console.error);
                    }}
                    className="px-2 py-1 rounded bg-warning/10 hover:bg-warning/20 text-warning text-[10px] font-bold uppercase transition-colors border border-warning/20"
                    title="Simulate FLOW -> DISTRACTED State Transition"
                  >
                    Simulate Distraction
                  </button>
                  {!rightPanelOpen && (
                    <button 
                      onClick={() => setRightPanelOpen(true)}
                      className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-accent transition-colors border border-white/5"
                      title="Open Control Panel"
                    >
                      <Cpu className="w-3.5 h-3.5 text-accent" />
                    </button>
                  )}
                </div>

                {/* Radial Ambient Gradient */}
                <motion.div 
                  className={`absolute inset-0 z-0 opacity-20 blur-[120px] transition-colors duration-1000 ${
                    cognitiveState === 'Flow' ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent' :
                    cognitiveState === 'Distracted' ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-warning via-transparent to-transparent' :
                    cognitiveState === 'Fatigued' ? 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent' : 
                    'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-danger via-transparent to-transparent'
                  }`}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.15, 0.25, 0.15]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Central Mission Block */}
                <motion.div 
                  className="z-10 flex flex-col items-center text-center max-w-4xl w-full px-6"
                  animate={{
                    scale: [1, 1.01, 1]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="mb-8 flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-secondary-text uppercase tracking-widest flex items-center gap-2 shadow-xl backdrop-blur-md">
                      <ShieldAlert className="w-3 h-3 text-accent" />
                      Deep Work Active
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-secondary-text uppercase tracking-widest flex items-center gap-2 shadow-xl backdrop-blur-md">
                      <CheckCircle2 className="w-3 h-3 text-success" />
                      {override.tabsOpen !== undefined ? 20 - override.tabsOpen : 14} Tabs Suppressed
                    </div>
                  </div>

                  <input
                    type="text"
                    className="w-full bg-transparent border-none text-center text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight focus:outline-none placeholder-white/20 mb-6 drop-shadow-2xl leading-tight"
                    value={override.activeTask ?? activeTask}
                    onChange={(e) => setActiveTask(e.target.value)}
                    placeholder="Define your mission..."
                  />

                  <div className="text-lg md:text-xl text-secondary-text font-medium mb-12 flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">Current Milestone</span>
                    <span className="text-white/90">Drafting parsing lookahead logic</span>
                  </div>

                  {/* Loaded Resources */}
                  <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md shadow-lg">
                      <BookOpen className="w-4 h-4 text-accent" />
                      <span className="text-xs font-semibold text-white">LL(k) Documentation.pdf</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md shadow-lg">
                      <Link2 className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-white">Canvas Assignment</span>
                    </button>
                  </div>
                </motion.div>

                {/* Bottom Intelligence Dock */}
                <div className="absolute bottom-8 w-full max-w-5xl px-8 z-10 flex flex-col items-center">
                  {/* Agent Whisper */}
                  <div className="text-center mb-6">
                    <AnimatePresence mode="wait">
                      {logs.length > 0 && (
                        <motion.div
                          key={logs[0].id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="inline-flex items-center gap-2 text-[11px] text-secondary-text font-mono bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-lg"
                        >
                          <Sparkles className="w-3 h-3 text-accent" />
                          <span className="text-white/50">{logs[0].agent}:</span>
                          <span className="text-white">{logs[0].action}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {/* Subtle Interpreted Intelligence Cards */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col justify-between h-20 shadow-lg">
                      <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Attention</span>
                      <div className="flex justify-between items-end mt-1">
                        <span className={`text-xs font-bold ${interpreted.attentionStability === "Optimal" ? "text-accent" : interpreted.attentionStability === "Stable" ? "text-success" : interpreted.attentionStability === "Erratic" ? "text-warning" : "text-danger"}`}>{interpreted.attentionStability}</span>
                        <Eye className={`w-3.5 h-3.5 ${interpreted.attentionStability === "Optimal" ? "text-accent" : interpreted.attentionStability === "Stable" ? "text-success" : interpreted.attentionStability === "Erratic" ? "text-warning" : "text-danger"}`} />
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col justify-between h-20 shadow-lg">
                      <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Focus Trend</span>
                      <div className="flex justify-between items-end mt-1">
                        <span className={`text-xs font-bold ${interpreted.focusTrend === "Positive" ? "text-accent" : interpreted.focusTrend === "Stable" ? "text-white" : "text-warning"}`}>{interpreted.focusTrend}</span>
                        <Activity className={`w-3.5 h-3.5 ${interpreted.focusTrend === "Positive" ? "text-accent" : "text-white/60"}`} />
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col justify-between h-20 shadow-lg">
                      <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Context Switching</span>
                      <div className="flex justify-between items-end mt-1">
                        <span className={`text-xs font-bold ${interpreted.contextSwitching === "Minimal" ? "text-accent" : interpreted.contextSwitching === "Acceptable" ? "text-success" : interpreted.contextSwitching === "High" ? "text-warning" : "text-danger"}`}>{interpreted.contextSwitching}</span>
                        <RotateCcw className={`w-3.5 h-3.5 ${interpreted.contextSwitching === "Minimal" ? "text-accent" : "text-success"}`} />
                      </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex flex-col justify-between h-20 shadow-lg">
                      <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Cognitive Load</span>
                      <div className="flex justify-between items-end mt-1">
                        <span className={`text-xs font-bold ${interpreted.cognitiveLoad === "Optimal" ? "text-accent" : interpreted.cognitiveLoad === "Low" ? "text-success" : "text-danger"}`}>{interpreted.cognitiveLoad}</span>
                        <Brain className={`w-3.5 h-3.5 ${interpreted.cognitiveLoad === "Optimal" ? "text-accent" : "text-success"}`} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. RESEARCH MODE */}
            {adaptiveMode === "research" && (
              <motion.div
                key="research"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
              >
                {/* Left: Sources */}
                <motion.div layout className="bg-secondary-surface border border-white/5 rounded-xl p-5 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-wider font-mono">Sources</span>
                    <button className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold border border-white/5 transition-colors flex items-center gap-1">
                      <Plus className="w-3 h-3 text-accent" /> Import Paper
                    </button>
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-thin">
                    {sources.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => setActiveSourceId(s.id)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${s.id === activeSourceId ? "bg-white/5 border-white/10" : "bg-black/20 border-white/5"}`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="block text-xs font-semibold text-white leading-tight">{s.title}</span>
                            <span className="block text-[10px] text-secondary-text font-mono">{s.author}</span>
                          </div>
                          <span className="text-[10px] font-mono text-accent font-semibold">{s.score}% Credibility</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.03]">
                          <button className={`text-[10px] font-bold uppercase transition-colors ${s.cited ? "text-accent" : "text-white/40"}`}>
                            {s.cited ? "★ Cited Reference" : "☆ Add Citation"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Center: Notes */}
                <motion.div layout className="bg-secondary-surface border border-white/5 rounded-xl p-5 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-wider font-mono">Notes</span>
                    <span className="text-[10px] font-mono text-accent bg-accent/5 border border-accent/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <Edit3 className="w-3 h-3 text-accent" /> Editing
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                    <div className="flex-1 flex flex-col">
                      <textarea 
                        className="w-full flex-1 bg-black/40 border border-white/5 rounded-lg p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-accent/40 resize-none font-mono leading-relaxed"
                        placeholder="Compose structured compilation arguments. Cite sources to cross-reference..."
                        defaultValue={`# Topic: Compiler Parsing Schemes\n\n- Need to resolve recursive token overlaps under panic recovery rules.\n- Cross reference: "${sources.find(s => s.id === activeSourceId)?.title}".`}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Right: Insights */}
                <motion.div layout className="bg-secondary-surface border border-white/5 rounded-xl p-5 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-wider font-mono">Insights</span>
                    <span className="text-[10px] font-mono text-accent bg-accent/5 border border-accent/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-accent animate-pulse" /> Live Analysis
                    </span>
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-thin">
                    <div className="p-3 bg-black/20 border border-white/5 rounded-lg">
                      <span className="block text-[10px] font-mono text-accent uppercase mb-1 tracking-widest">Key Concept</span>
                      <p className="text-xs text-white/80 leading-relaxed">Panic-mode recovery is mentioned in Source 2, directly addressing your recursive token overlaps note.</p>
                    </div>
                    <div className="p-3 bg-black/20 border border-white/5 rounded-lg">
                      <span className="block text-[10px] font-mono text-success uppercase mb-1 tracking-widest">Connection</span>
                      <p className="text-xs text-white/80 leading-relaxed">A. V. Aho's LL(k) paper provides the theoretical basis for predictive lookahead.</p>
                    </div>
                    {override.showPeerRadar && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <span className="block text-[10px] font-mono text-blue-400 uppercase mb-1 tracking-widest flex items-center gap-1"><Sparkles className="w-3 h-3"/> Peer Radar Insight</span>
                        <p className="text-xs text-white/90 leading-relaxed">Study group Discord discussed token discard limits for CS-4120. They recommend a panic-mode depth of 3.</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 3. WRITING MODE */}
            {adaptiveMode === "writing" && (
              <motion.div
                key="writing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
              >
                {/* Cross-Page Awareness Context Transfer UI */}
                <div className="col-span-full mb-2 flex items-center justify-between bg-accent/10 border border-accent/20 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-white/90">Research Context Imported: 2 Sources, 1 Live Outline</span>
                  </div>
                </div>

                {/* Left: Outline */}
                <motion.div layout className="bg-secondary-surface border border-white/5 rounded-xl p-5 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-wider font-mono">Outline</span>
                  </div>
                  <div className="space-y-2 overflow-y-auto flex-1 pr-2 scrollbar-thin">
                    <div className="p-2 border border-white/10 bg-white/5 rounded text-xs text-white font-medium">1. Introduction</div>
                    <div className="p-2 border border-transparent hover:border-white/5 rounded text-xs text-white/60 font-medium pl-6">1.1 Core Principles</div>
                    <div className="p-2 border border-transparent hover:border-white/5 rounded text-xs text-white/60 font-medium pl-6">1.2 History of LL(k)</div>
                    <div className="p-2 border border-transparent hover:border-white/5 rounded text-xs text-white/60 font-medium">2. Predictive Lookahead</div>
                    <div className="p-2 border border-transparent hover:border-white/5 rounded text-xs text-white/60 font-medium">3. Error Recovery</div>
                  </div>
                </motion.div>

                {/* Center: Document */}
                <motion.div layout className="bg-secondary-surface border border-white/5 rounded-xl p-8 flex flex-col shadow-2xl h-full overflow-hidden">
                  <div className="flex items-center justify-between mb-8 shrink-0">
                    <span className="text-[10px] font-mono text-secondary-text uppercase tracking-widest">Document</span>
                    <span className="text-xs text-accent font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> 1,204 words
                    </span>
                  </div>
                  <input 
                    type="text"
                    defaultValue="Compiler Optimization Techniques"
                    className="bg-transparent border-none text-2xl font-bold text-white mb-6 focus:outline-none placeholder-white/20 shrink-0"
                  />
                  <textarea 
                    className="w-full flex-1 bg-transparent border-none text-sm text-secondary-text leading-relaxed focus:outline-none resize-none placeholder-white/10"
                    defaultValue="The core principle of LL(k) grammar parsing relies on predictive lookahead...\n\nWhen standard predictive lookahead encounters a syntax violation, standard panic-mode recovery discards input tokens until a synchronizing token is found."
                  />
                </motion.div>

                {/* Right: Socratic Challenger */}
                <motion.div layout className="bg-secondary-surface border border-white/5 rounded-xl p-5 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-wider font-mono">Socratic Challenger</span>
                    <Brain className="w-4 h-4 text-accent" />
                  </div>
                  <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin">
                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                      <p className="text-xs text-white leading-relaxed mb-3">You mentioned that "panic-mode recovery discards input tokens". What happens if the synchronizing token itself is discarded or missing?</p>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-black/40 hover:bg-black/60 border border-white/10 py-1.5 rounded text-[10px] text-white font-mono uppercase transition-colors">Respond</button>
                        <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-1.5 rounded text-[10px] text-white font-mono uppercase transition-colors">Dismiss</button>
                      </div>
                    </div>
                    {override.showSocraticChallenge && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-danger/10 border border-danger/20 rounded-xl mt-4 shadow-2xl">
                        <p className="text-xs text-white font-bold mb-1">Challenge Injected:</p>
                        <p className="text-xs text-white/90 leading-relaxed mb-3">"If your recursive descent parser encounters a syntax mismatch, how can recovery occur without excessive memory consumption?"</p>
                        <div className="flex gap-2">
                          <button className="flex-1 bg-danger/20 hover:bg-danger/30 border border-danger/20 py-1.5 rounded text-[10px] text-white font-bold uppercase transition-colors">Defend Approach</button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* 4. DEADLINE MODE */}
            {adaptiveMode === "deadline" && (
              <motion.div
                key="deadline"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"
              >
                {/* Left: Deliverables */}
                <motion.div layout className="bg-secondary-surface border border-white/5 rounded-xl p-5 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-wider font-mono">Deliverables</span>
                    <Target className="w-4 h-4 text-white/50" />
                  </div>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-2 scrollbar-thin">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full border border-white/50" />
                        <span className="text-xs text-white">Parser Engine Draft</span>
                      </div>
                      <span className="text-[10px] text-white/50">Today</span>
                    </div>
                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full border border-white/50" />
                        <span className="text-xs text-white">Test Suite Verification</span>
                      </div>
                      <span className="text-[10px] text-white/50">Tomorrow</span>
                    </div>
                  </div>
                </motion.div>

                {/* Center: Execution Plan */}
                <motion.div layout className="bg-secondary-surface border border-white/5 rounded-xl p-5 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-wider font-mono">Execution Plan</span>
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <div className="relative pl-6 space-y-6 overflow-y-auto flex-1 pr-2 scrollbar-thin border-l border-white/10 ml-2 mt-2">
                    <div className="relative">
                      <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-accent ring-4 ring-black/50" />
                      <h4 className="text-xs font-bold text-white mb-1">Block 1: Deep Work</h4>
                      <p className="text-[10px] text-secondary-text mb-2">90 minutes • Draft Lookahead Logic</p>
                      <button className="px-3 py-1 bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase rounded-md hover:bg-accent/20 transition-colors">Start Block</button>
                    </div>
                    <div className="relative">
                      <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-white/20 ring-4 ring-black/50" />
                      <h4 className="text-xs font-bold text-white/60 mb-1">Block 2: Review</h4>
                      <p className="text-[10px] text-secondary-text/60">45 minutes • Compile and debug</p>
                    </div>
                  </div>
                </motion.div>

                {/* Right: Risk Analysis */}
                <motion.div layout className="bg-secondary-surface border border-white/5 rounded-xl p-5 flex flex-col h-full overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                    <span className="text-xs font-bold text-secondary-text uppercase tracking-wider font-mono">Risk Analysis</span>
                    <ShieldAlert className="w-4 h-4 text-danger" />
                  </div>
                  <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin">
                    <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-mono text-danger font-bold tracking-wider">{override.risk ?? "Critical Risk"}</span>
                        <span className="text-xs font-bold text-danger">{override.finalRisk ?? override.urgencyScore ?? 89}%</span>
                      </div>
                      <div className="text-sm text-white font-bold mb-1">CS-4120 Parsing Alg</div>
                      <div className="text-[10px] text-danger/80">Due in {override.deadlineMins ?? 14} {override.deadlineMins ? "minutes" : "hours"}. {override.finalProgress ?? override.completionProbability ?? 35}% completed. Buffer margin depleted.</div>
                    </div>
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-mono text-warning font-bold tracking-wider">Warning</span>
                      </div>
                      <div className="text-xs text-white/90">Cognitive fatigue detected. Proceeding without break increases error risk by 40%.</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
