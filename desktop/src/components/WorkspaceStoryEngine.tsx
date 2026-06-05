import React from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { useDemoState } from "../demo/DemoStateStore";

export default function WorkspaceStoryEngine() {
  const { cognitiveState, adaptiveMode } = useAppContext();
  const { isDemoPlaying } = useDemoState();

  const getStory = () => {
    switch (cognitiveState) {
      case "Flow":
        return {
          sense: "Biometrics Stable",
          reason: "Sustained focus pattern",
          adapt: "Maintain zero interruptions",
          improve: "Productivity protected"
        };
      case "Distracted":
        return {
          sense: "iQOO: 14 context switches",
          reason: "Deadline Risk: High",
          adapt: "Sculptor: Close unpinned tabs",
          improve: "Flow Confidence +21%"
        };
      case "Fatigued":
        return {
          sense: "iQOO: Decreased blink rate",
          reason: "Cognitive Depletion",
          adapt: "Suggest 5-min offline break",
          improve: "Prevent burnout"
        };
      case "Overloaded":
        return {
          sense: "iQOO: Erratic interaction",
          reason: "Critical Overload",
          adapt: "Activate triage mode",
          improve: "Reduce threat"
        };
      default:
        return {
          sense: "Initializing Sensors",
          reason: "Calibrating baseline",
          adapt: "Optimize workspace",
          improve: "Ready"
        };
    }
  };

  const story = getStory();

  return (
    <div className={`flex flex-col md:flex-row items-center gap-4 bg-secondary-surface border rounded-xl p-4 shrink-0 shadow-lg ${
      isDemoPlaying ? 'border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-white/5'
    }`}>
      
      {/* SENSE */}
      <div className="flex flex-col">
        <span className="text-[9px] font-mono uppercase tracking-widest text-danger/80 mb-1">Sense</span>
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-danger" />
          <span className={`text-xs font-bold ${isDemoPlaying ? 'text-white' : 'text-white/80'}`}>{story.sense}</span>
        </div>
      </div>

      <ArrowRight className="w-4 h-4 text-white/20 hidden md:block" />

      {/* REASON */}
      <div className="flex flex-col">
        <span className="text-[9px] font-mono uppercase tracking-widest text-warning/80 mb-1">Reason</span>
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-warning" />
          <span className={`text-xs font-bold ${isDemoPlaying ? 'text-white' : 'text-white/80'}`}>{story.reason}</span>
        </div>
      </div>

      <ArrowRight className="w-4 h-4 text-white/20 hidden md:block" />

      {/* ADAPT */}
      <div className="flex flex-col">
        <span className="text-[9px] font-mono uppercase tracking-widest text-accent/80 mb-1">Adapt</span>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span className={`text-xs font-bold ${isDemoPlaying ? 'text-white' : 'text-white/80'}`}>{story.adapt}</span>
        </div>
      </div>

      <ArrowRight className="w-4 h-4 text-white/20 hidden md:block" />

      {/* IMPROVE */}
      <div className="flex flex-col">
        <span className="text-[9px] font-mono uppercase tracking-widest text-success/80 mb-1">Improve</span>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          <span className={`text-xs font-bold ${isDemoPlaying ? 'text-white' : 'text-white/80'}`}>{story.improve}</span>
        </div>
      </div>

    </div>
  );
}
