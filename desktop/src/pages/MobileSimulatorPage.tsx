import React, { useState, useEffect } from "react";
import { 
  Smartphone, ShieldAlert, Sparkles, Brain, Clock, 
  BookOpen, Sliders, MessageSquare, Mic, BarChart2, 
  Settings, CheckCircle2, Volume2, ShieldCheck, Moon, Play
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

type MobileScreen =
  | "Splash"
  | "Onboarding"
  | "Permissions"
  | "Home"
  | "CognitiveState"
  | "Focus"
  | "Deadline"
  | "AgentCenter"
  | "PeerRadar"
  | "VoiceCapture"
  | "Analytics"
  | "Recovery"
  | "Settings";

interface MobileSimulatorProps {
  minimal?: boolean;
}

export default function MobileSimulatorPage({ minimal = false }: MobileSimulatorProps) {
  const { cognitiveState, confidence, telemetry } = useAppContext();
  const [activeScreen, setActiveScreen] = useState<MobileScreen>("Home");
  const [phoneTime, setPhoneTime] = useState("10:00");
  const [isRecording, setIsRecording] = useState(false);
  const [focusTimer, setFocusTimer] = useState(1500); // 25 mins

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setPhoneTime(
        `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const phoneFrame = (
    <div className="w-[360px] h-[720px] bg-[#161616] rounded-[48px] p-3.5 border-4 border-[#333] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative shrink-0">
      {/* Dynamic Speaker Notch */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-30 flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-white/10 mr-12" />
        <span className="w-10 h-1 bg-white/10 rounded-full" />
      </div>

      {/* Screen area */}
      <div className="w-full h-full bg-black rounded-[36px] overflow-hidden relative flex flex-col font-sans text-white border border-white/5 select-none">
        
        {/* Status bar */}
        <div className="h-10 pt-2 px-6 flex justify-between items-center text-[10px] font-semibold text-white/80 z-20 font-mono">
          <span>{phoneTime}</span>
          <div className="flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span>iQOO Bridge</span>
          </div>
        </div>

        {/* Screen Content Router */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
          
          {/* 1. Splash Screen */}
          {activeScreen === "Splash" && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20 animate-pulse">
                <span className="text-black font-black text-2xl tracking-tighter">APEX</span>
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold tracking-tight text-white">APEX Cognitive</h2>
                <p className="text-[10px] text-secondary-text font-mono uppercase tracking-widest">Sensing Layer Active</p>
              </div>
            </div>
          )}

          {/* 2. Onboarding */}
          {activeScreen === "Onboarding" && (
            <div className="space-y-5 py-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Onboarding Calibration</h2>
                <p className="text-[10px] text-secondary-text">Identify your courses and map your LMS details.</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-secondary-text uppercase font-mono tracking-wider">Select Major</span>
                  <input type="text" placeholder="Computer Science" className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white" readOnly />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-secondary-text uppercase font-mono tracking-wider">Sync LMS Portal</span>
                  <button className="w-full bg-white text-black font-semibold text-xs py-2 rounded-lg transition-colors">Authorize Canvas</button>
                </div>
              </div>
            </div>
          )}

          {/* 3. Permissions */}
          {activeScreen === "Permissions" && (
            <div className="space-y-5 py-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Device Access Tokens</h2>
                <p className="text-[10px] text-secondary-text">Allow APEX to gather telemetry and control workspace features.</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Biometric Data (Heart Rate / HRV)", enabled: true },
                  { label: "Screen Time & Application Statistics", enabled: true },
                  { label: "LMS Syllabus Scanner Access", enabled: true },
                  { label: "Suppress OS Notifications (DND)", enabled: false }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                    <span className="text-[11px] text-white font-medium leading-tight pr-4">{item.label}</span>
                    <input type="checkbox" defaultChecked={item.enabled} className="accent-accent w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Home Screen */}
          {activeScreen === "Home" && (
            <div className="space-y-5 py-2">
              {/* State Box */}
              <div className="p-4 rounded-2xl bg-secondary-surface border border-white/5 space-y-1">
                <span className="text-[9px] font-bold text-secondary-text uppercase font-mono tracking-wider">Current State</span>
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-accent tracking-tight">{cognitiveState}</h2>
                  <span className="text-[10px] text-white/40 font-mono">HR: {Math.round(telemetry.heartRate)} BPM</span>
                </div>
              </div>

              {/* Focus module */}
              <div className="p-4 rounded-2xl bg-secondary-surface border border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-white uppercase font-mono tracking-wider">Active Directive</span>
                  <span className="text-accent font-mono font-semibold">25:00</span>
                </div>
                <p className="text-xs text-white font-medium leading-relaxed truncate">Research Methodology Report</p>
                <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                  <div className="bg-accent h-full w-[60%]" />
                </div>
              </div>

              {/* Actions log list */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-secondary-text uppercase font-mono tracking-wider">Active Agent Status</span>
                <div className="space-y-1.5 text-[11px]">
                  {[
                    { name: "State Agent", desc: "Analyzing biometrics logs" },
                    { name: "Environment Sculptor", desc: "Muted Discord & silenced alerts" }
                  ].map((agent, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 bg-white/5 border border-white/5 rounded-xl">
                      <span className="font-medium text-white">{agent.name}</span>
                      <span className="text-accent text-[9px] font-mono uppercase tracking-wider">{agent.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. CognitiveState */}
          {activeScreen === "CognitiveState" && (
            <div className="space-y-5 py-2">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Biometric Overview</h2>
                <p className="text-[10px] text-secondary-text">Live telemetry log and state history updates.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] text-secondary-text uppercase font-mono block">HRV</span>
                  <span className="text-lg font-mono font-semibold text-white">{Math.round(telemetry.hrv)} ms</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] text-secondary-text uppercase font-mono block">Blink Rate</span>
                  <span className="text-lg font-mono font-semibold text-white">{telemetry.blinkRate}/min</span>
                </div>
              </div>
            </div>
          )}

          {/* 6. Focus */}
          {activeScreen === "Focus" && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-4 text-center">
              <div className="w-48 h-48 rounded-full border border-accent/20 flex items-center justify-center relative animate-pulse">
                <div className="absolute inset-4 rounded-full border border-accent/5" />
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-mono font-bold text-white">25:00</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-secondary-text mt-1">Breathing Focus</span>
                </div>
              </div>
              <p className="text-xs text-secondary-text leading-relaxed">Notifications suppressed. Deep focus session active.</p>
            </div>
          )}

          {/* 7. Deadline */}
          {activeScreen === "Deadline" && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Academic Deadlines</h2>
                <p className="text-[10px] text-secondary-text">Syllabus milestones sorted by threat level.</p>
              </div>
              <div className="space-y-2">
                {[
                  { title: "CS-4120 Parser Project", due: "Tomorrow, 23:59", risk: 89 },
                  { title: "CS-5670 Deep Learning Lab", due: "In 4 days, 23:59", risk: 42 }
                ].map((dl, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="block text-xs font-semibold text-white">{dl.title}</span>
                      <span className="block text-[9px] text-secondary-text font-mono">Due: {dl.due}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-accent">{dl.risk}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. AgentCenter */}
          {activeScreen === "AgentCenter" && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Agent Autonomy</h2>
                <p className="text-[10px] text-secondary-text">Configure operational autonomy limits.</p>
              </div>
              <div className="space-y-3">
                {["State Agent", "Deadline Sentinel", "Environment Sculptor"].map((name, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span>{name}</span>
                      <span className="text-accent">80%</span>
                    </div>
                    <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                      <div className="bg-accent h-full w-[80%]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. PeerRadar */}
          {activeScreen === "PeerRadar" && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Peer Radar Feed</h2>
                <p className="text-[10px] text-secondary-text">Chat summaries and collaborative notifications.</p>
              </div>
              <div className="space-y-2">
                {[
                  { author: "Alex K.", msg: "Finished tokenizer tests, parser next." },
                  { author: "Sarah M.", msg: "Reminder: LMS link has updated." }
                ].map((msg, i) => (
                  <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="block text-[10px] font-bold text-accent uppercase font-mono">{msg.author}</span>
                    <p className="text-xs text-secondary-text leading-relaxed font-sans">{msg.msg}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. VoiceCapture */}
          {activeScreen === "VoiceCapture" && (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-4 text-center">
              <button 
                onClick={() => setIsRecording(!isRecording)}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? "bg-danger/25 border-danger/40 border scale-110" : "bg-white/5 border-white/10 border"
                }`}
              >
                <Mic className={`w-8 h-8 ${isRecording ? "text-danger animate-pulse" : "text-white/60"}`} />
              </button>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-white">{isRecording ? "Recording Lecture Audio..." : "Summon Voice Recorder"}</h3>
                <p className="text-[9px] text-secondary-text">Captures topics to feed notes and Socratic challenges.</p>
              </div>
            </div>
          )}

          {/* 11. Analytics */}
          {activeScreen === "Analytics" && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Focus Trend logs</h2>
                <p className="text-[10px] text-secondary-text">Focus hours distribution breakdown.</p>
              </div>
              <div className="h-32 flex items-end justify-between gap-1 pt-4 border-b border-white/10">
                {[20, 45, 60, 30, 80, 50, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-accent/80 rounded-t-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          )}

          {/* 12. Recovery */}
          {activeScreen === "Recovery" && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Emergency Triage</h2>
                <p className="text-[10px] text-secondary-text">Deploy overrides and generate extension templates.</p>
              </div>
              <div className="space-y-2">
                <button className="w-full text-left p-3 bg-danger/10 text-danger border border-danger/20 rounded-xl text-xs font-bold uppercase tracking-wider">
                  Request Deadline Extension
                </button>
                <button className="w-full text-left p-3 bg-white/5 text-white border border-white/5 rounded-xl text-xs font-medium">
                  Mute WhatsApp Channels
                </button>
              </div>
            </div>
          )}

          {/* 13. Settings */}
          {activeScreen === "Settings" && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white">Mobile Settings</h2>
                <p className="text-[10px] text-secondary-text">Adjust sensor thresholds and notification status.</p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-xl">
                  <span>Quiet Mode in Flow</span>
                  <input type="checkbox" defaultChecked className="accent-accent" />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Home indicator bar */}
        <div className="h-6 flex items-center justify-center z-20">
          <span className="w-28 h-1 bg-white/30 rounded-full" />
        </div>

      </div>
    </div>
  );

  if (minimal) {
    return (
      <div className="flex flex-col items-center gap-4 w-full h-full">
        <div className="w-full flex items-center justify-between bg-black/20 p-2.5 rounded-lg border border-white/5">
          <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider pl-1">Mobile Screen</span>
          <select 
            value={activeScreen}
            onChange={(e) => setActiveScreen(e.target.value as MobileScreen)}
            className="bg-[#1C1C1E] border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-accent/40 cursor-pointer"
          >
            {[
              { id: "Splash", label: "1. Splash Screen" },
              { id: "Onboarding", label: "2. Onboarding" },
              { id: "Permissions", label: "3. Permissions Flow" },
              { id: "Home", label: "4. Home Screen" },
              { id: "CognitiveState", label: "5. State Dashboard" },
              { id: "Focus", label: "6. Focus Session" },
              { id: "Deadline", label: "7. Deadline Center" },
              { id: "AgentCenter", label: "8. Agent Center" },
              { id: "PeerRadar", label: "9. Peer Radar" },
              { id: "VoiceCapture", label: "10. Voice Capture" },
              { id: "Analytics", label: "11. Analytics" },
              { id: "Recovery", label: "12. Recovery Mode" },
              { id: "Settings", label: "13. Settings" }
            ].map(sc => (
              <option key={sc.id} value={sc.id}>{sc.label}</option>
            ))}
          </select>
        </div>
        <div className="w-full flex justify-center scale-[0.82] origin-top -mt-4">
          {phoneFrame}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-accent" />
            iQOO Mobile Companion Simulator
          </h1>
          <p className="text-xs text-secondary-text">Interactive mobile preview showing the 13 required screen states.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Selector Pane */}
        <div className="w-full lg:w-64 bg-secondary-surface border border-white/5 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider font-mono px-1 mb-2 block">Choose Mobile Screen</span>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
            {[
              { id: "Splash", label: "1. Splash Screen" },
              { id: "Onboarding", label: "2. Onboarding" },
              { id: "Permissions", label: "3. Permissions Flow" },
              { id: "Home", label: "4. Home Screen" },
              { id: "CognitiveState", label: "5. State Dashboard" },
              { id: "Focus", label: "6. Focus Session" },
              { id: "Deadline", label: "7. Deadline Center" },
              { id: "AgentCenter", label: "8. Agent Center" },
              { id: "PeerRadar", label: "9. Peer Radar" },
              { id: "VoiceCapture", label: "10. Voice Capture" },
              { id: "Analytics", label: "11. Analytics" },
              { id: "Recovery", label: "12. Recovery Mode" },
              { id: "Settings", label: "13. Settings" }
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => setActiveScreen(sc.id as MobileScreen)}
                className={`text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors border ${
                  activeScreen === sc.id 
                    ? "bg-white/5 border-white/10 text-white" 
                    : "bg-black/10 border-white/5 text-secondary-text hover:text-white"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {phoneFrame}
      </div>
    </div>
  );
}
