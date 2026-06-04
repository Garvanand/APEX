import React, { useState } from "react";
import { 
  BarChart2, Clock, Play, Pause, TrendingUp, PieChart, ShieldCheck, 
  ChevronRight, Calendar, Heart, Brain, Activity
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

type InsightsTab = "analytics" | "replay";
type TimeRange = "Day" | "Week" | "Month";

interface MetricCard {
  title: string;
  value: string;
  delta: number;
  unit?: string;
}

interface CognitiveBar {
  state: "Flow" | "Distracted" | "Fatigued" | "Overloaded";
  percent: number;
  color: string;
}

interface DayBar {
  label: string;
  hours: number;
}

interface AgentIntervention {
  name: string;
  count: number;
}

const METRICS: Record<TimeRange, MetricCard[]> = {
  Day: [
    { title: "Total Focus Hours", value: "5.2", delta: 0.8 },
    { title: "Flow State Ratio", value: "64", delta: 4, unit: "%" },
    { title: "Deadlines Solved", value: "3", delta: 1 },
  ],
  Week: [
    { title: "Total Focus Hours", value: "31.4", delta: 3.2 },
    { title: "Flow State Ratio", value: "58", delta: -2, unit: "%" },
    { title: "Deadlines Solved", value: "12", delta: 3 },
  ],
  Month: [
    { title: "Total Focus Hours", value: "124.6", delta: 12.1 },
    { title: "Flow State Ratio", value: "61", delta: 5, unit: "%" },
    { title: "Deadlines Solved", value: "47", delta: 8 },
  ],
};

const COGNITIVE_BARS: Record<TimeRange, CognitiveBar[]> = {
  Day: [
    { state: "Flow", percent: 64, color: "bg-success" },
    { state: "Distracted", percent: 18, color: "bg-warning" },
    { state: "Fatigued", percent: 12, color: "bg-accent" },
    { state: "Overloaded", percent: 6, color: "bg-danger" },
  ],
  Week: [
    { state: "Flow", percent: 58, color: "bg-success" },
    { state: "Distracted", percent: 22, color: "bg-warning" },
    { state: "Fatigued", percent: 14, color: "bg-accent" },
    { state: "Overloaded", percent: 6, color: "bg-danger" },
  ],
  Month: [
    { state: "Flow", percent: 61, color: "bg-success" },
    { state: "Distracted", percent: 20, color: "bg-warning" },
    { state: "Fatigued", percent: 13, color: "bg-accent" },
    { state: "Overloaded", percent: 6, color: "bg-danger" },
  ],
};

const DAILY_FOCUS: Record<TimeRange, DayBar[]> = {
  Day: [
    { label: "6a", hours: 0.5 },
    { label: "9a", hours: 1.8 },
    { label: "12p", hours: 0.9 },
    { label: "3p", hours: 1.2 },
    { label: "6p", hours: 0.6 },
    { label: "9p", hours: 0.2 },
    { label: "12a", hours: 0 },
  ],
  Week: [
    { label: "Mon", hours: 5.2 },
    { label: "Tue", hours: 4.1 },
    { label: "Wed", hours: 6.0 },
    { label: "Thu", hours: 3.8 },
    { label: "Fri", hours: 5.5 },
    { label: "Sat", hours: 4.2 },
    { label: "Sun", hours: 2.6 },
  ],
  Month: [
    { label: "W1", hours: 28 },
    { label: "W2", hours: 32 },
    { label: "W3", hours: 30 },
    { label: "W4", hours: 34.6 },
    { label: "W5", hours: 0 },
  ],
};

const AGENTS: Record<TimeRange, AgentIntervention[]> = {
  Day: [
    { name: "State Agent", count: 8 },
    { name: "Deadline Sentinel", count: 5 },
    { name: "Environment Sculptor", count: 12 },
    { name: "Peer Radar", count: 6 },
    { name: "Socratic Challenger", count: 2 },
  ],
  Week: [
    { name: "State Agent", count: 42 },
    { name: "Deadline Sentinel", count: 28 },
    { name: "Environment Sculptor", count: 64 },
    { name: "Peer Radar", count: 31 },
    { name: "Socratic Challenger", count: 12 },
  ],
  Month: [
    { name: "State Agent", count: 164 },
    { name: "Deadline Sentinel", count: 112 },
    { name: "Environment Sculptor", count: 246 },
    { name: "Peer Radar", count: 128 },
    { name: "Socratic Challenger", count: 48 },
  ],
};

export default function InsightsPage() {
  const { addLog } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState<InsightsTab>("analytics");
  const [range, setRange] = useState<TimeRange>("Week");
  
  // Replay timeline states
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrubValue, setScrubValue] = useState(25);

  const replayPoints = [
    { time: "10:00", state: "Flow", hr: 72, hrv: 58, app: "VS Code" },
    { time: "10:15", state: "Flow", hr: 74, hrv: 55, app: "VS Code" },
    { time: "10:30", state: "Distracted", hr: 82, hrv: 44, app: "Discord" },
    { time: "10:45", state: "Fatigued", hr: 68, hrv: 35, app: "Chrome" },
    { time: "11:00", state: "Overloaded", hr: 95, hrv: 28, app: "VS Code" }
  ];

  const currentPointIndex = Math.min(
    replayPoints.length - 1,
    Math.floor((scrubValue / 100) * replayPoints.length)
  );
  const currentPoint = replayPoints[currentPointIndex];

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    addLog("System", isPlaying ? "Paused session playback." : "Started session playback.", "User requested playback control", isPlaying ? "Paused session playback." : "Started session playback.", "Replay state toggled");
  };

  // Analytics helper calculations
  const metrics = METRICS[range];
  const cognitiveBars = COGNITIVE_BARS[range];
  const dailyFocus = DAILY_FOCUS[range];
  const agents = AGENTS[range];

  const maxFocusHours = Math.max(...dailyFocus.map((d) => d.hours), 1);
  const maxAgentCount = Math.max(...agents.map((a) => a.count), 1);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Subtabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            Insights Engine
          </h1>
          <p className="text-xs text-secondary-text">Review performance analytics and historical session replays.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/5 border border-white/5 rounded-lg p-0.5 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab("analytics")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === "analytics" ? "bg-white text-black font-bold" : "text-secondary-text hover:text-white"
            }`}
          >
            Analytics Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab("replay")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === "replay" ? "bg-white text-black font-bold" : "text-secondary-text hover:text-white"
            }`}
          >
            Session Replay
          </button>
        </div>
      </div>

      {activeSubTab === "analytics" && (
        <div className="space-y-6">
          {/* Range Toggles & Metrics summary */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-secondary-text uppercase tracking-widest">Performance Metrics</span>
            <div className="flex bg-white/5 border border-white/5 rounded-lg p-0.5">
              {(["Day", "Week", "Month"] as TimeRange[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setRange(t)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                    range === t ? "bg-white/10 text-white" : "text-secondary-text hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {metrics.map((m) => (
              <div key={m.title} className="bg-secondary-surface border border-white/5 rounded-xl p-5 space-y-2 relative overflow-hidden">
                <span className="block text-[10px] font-bold text-secondary-text uppercase tracking-wider font-mono">{m.title}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-mono font-bold text-white">{m.value}</span>
                  {m.unit && <span className="text-xs font-mono text-secondary-text">{m.unit}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className={`w-3.5 h-3.5 ${m.delta >= 0 ? "text-success" : "text-danger"}`} />
                  <span className={`text-xs font-mono font-medium ${m.delta >= 0 ? "text-success" : "text-danger"}`}>
                    {m.delta >= 0 ? "+" : ""}{m.delta}% vs baseline
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Sparkline & Cognitive distribution split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cognitive State Bar Distribution */}
            <div className="bg-secondary-surface border border-white/5 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-accent" />
                Cognitive State Distribution
              </h3>
              <div className="space-y-4">
                {cognitiveBars.map((bar) => (
                  <div key={bar.state} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-white">{bar.state} State</span>
                      <span className="font-mono text-secondary-text">{bar.percent}%</span>
                    </div>
                    <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${bar.color}`}
                        style={{ width: `${bar.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Focus Sparklines */}
            <div className="bg-secondary-surface border border-white/5 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                {range === "Day" ? "Hourly Focus Breakdown" : range === "Week" ? "Weekly Focus Trend" : "Monthly Focus Trend"}
              </h3>
              <div className="h-40 flex items-end justify-between gap-2 pt-4">
                {dailyFocus.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-black/20 hover:bg-white/5 rounded-t-sm transition-all duration-300 relative flex justify-center items-end" style={{ height: "85%" }}>
                      <div 
                        className="bg-accent/80 group-hover:bg-accent w-full rounded-t-sm transition-all"
                        style={{ height: `${(d.hours / maxFocusHours) * 100}%` }}
                      />
                      <span className="absolute -top-6 bg-tertiary-surface border border-white/10 text-[9px] font-mono px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        {d.hours}h
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-secondary-text uppercase leading-none">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Intervention Frequencies */}
          <div className="bg-secondary-surface border border-white/5 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              Agent Intervention Frequencies
            </h3>
            <div className="space-y-3">
              {agents.map((a) => (
                <div key={a.name} className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold text-white w-32 shrink-0">{a.name}</span>
                  <div className="flex-1 bg-black/40 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-white/10 border border-white/10 h-full rounded-full transition-all"
                      style={{ width: `${(a.count / maxAgentCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-accent w-16 text-right font-semibold">{a.count} actions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "replay" && (
        <div className="bg-secondary-surface border border-white/5 rounded-xl p-6 space-y-6">
          {/* Playback HUD */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePlayToggle}
                className="p-3 bg-white hover:bg-white/95 text-black rounded-full transition-colors shrink-0"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
              </button>
              <div className="space-y-0.5">
                <span className="block text-xs font-semibold text-white">Active Timeline Replay</span>
                <span className="block text-[10px] text-secondary-text font-mono">Timestamp: {currentPoint.time}</span>
              </div>
            </div>
            
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
              currentPoint.state === 'Flow' ? 'text-success border-success/15 bg-success/5' :
              currentPoint.state === 'Distracted' ? 'text-warning border-warning/15 bg-warning/5' : 'text-danger border-danger/15 bg-danger/5'
            }`}>
              {currentPoint.state} State
            </span>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <input 
              type="range" 
              min="0"
              max="99"
              value={scrubValue}
              onChange={(e) => setScrubValue(parseInt(e.target.value))}
              className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-[9px] text-secondary-text uppercase tracking-wider font-mono">
              <span>Session Start (10:00)</span>
              <span>Session End (11:00)</span>
            </div>
          </div>

          {/* Dynamic Biometrics at Scrub point */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-2">
              <span className="block text-[10px] text-secondary-text uppercase font-mono tracking-wider">Heart Rate</span>
              <span className="block text-2xl font-mono font-semibold text-white">{currentPoint.hr} BPM</span>
            </div>
            <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-2">
              <span className="block text-[10px] text-secondary-text uppercase font-mono tracking-wider">HRV (Stability)</span>
              <span className="block text-2xl font-mono font-semibold text-white">{currentPoint.hrv} ms</span>
            </div>
            <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-2">
              <span className="block text-[10px] text-secondary-text uppercase font-mono tracking-wider">Active Workspace App</span>
              <span className="block text-2xl font-mono font-semibold text-white truncate">{currentPoint.app}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
