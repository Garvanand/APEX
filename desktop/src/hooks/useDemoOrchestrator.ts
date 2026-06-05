import { useState, useCallback, useRef } from 'react';
import type { CognitiveState, TelemetryData } from '../types';
import type { AdaptiveMode } from '../context/AppContext';

export function useDemoOrchestrator(
  setCognitiveState: (state: CognitiveState) => void,
  setAdaptiveMode: (mode: AdaptiveMode) => void,
  triggerOptimization: (targetMode: AdaptiveMode) => void,
  addLog: (agent: string, problem: string, reason: string, action: string, outcome: string, impact: string, confidence: number) => void
) {
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoTelemetry, setDemoTelemetry] = useState<TelemetryData | null>(null);
  const [showPhoneOverlay, setShowPhoneOverlay] = useState(false);
  
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const runDemoSequence = useCallback(() => {
    if (isDemoRunning) return;
    
    setIsDemoRunning(true);
    setShowPhoneOverlay(true);
    
    // Clear any previous timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const schedule = (delayMs: number, action: () => void) => {
      const t = setTimeout(action, delayMs);
      timeoutsRef.current.push(t);
    };

    // T=0.0s: Student distracted, 20 tabs open
    setAdaptiveMode("research");
    setCognitiveState("Distracted");
    setDemoTelemetry({
      heartRate: 98,
      hrv: 25,
      blinkRate: 22,
      activeApp: 'Chrome (20 tabs)',
      ambientDb: 55,
      screenInteractionDensity: 0.95
    });

    schedule(1500, () => {
      setShowPhoneOverlay(false);
    });

    // T=2.0s: State Agent detects issue via iQOO
    schedule(2000, () => {
      addLog(
        "State Agent", 
        "iQOO Phone Detected Attention Drift", 
        "12 context switches via 120Hz touch sampling", 
        "Office Kit Bridge Synced State", 
        "State updated",
        "Risk +14",
        92
      );
    });

    // T=3.5s: Deadline Sentinel calculates risk
    schedule(3500, () => {
      addLog(
        "Deadline Sentinel", 
        "Assignment due in 38 minutes", 
        "Local CRDT matched syllabus calendar",
        "Calculated extreme execution risk", 
        "Urgency score = 89",
        "Risk +45",
        98
      );
    });

    // T=5.0s: Environment Sculptor intervenes
    schedule(5000, () => {
      addLog(
        "Environment Sculptor", 
        "High urgency + Distraction", 
        "Desktop OS requested intervention",
        "Closed 20 tabs & Enabled DND", 
        "Workspace adapted",
        "Flow +24",
        100
      );
    });

    // T=6.5s: Workspace adapts
    schedule(6500, () => {
      addLog(
        "Workspace Core", 
        "Layout fragmented", 
        "Environment Sculptor locked UI",
        "Enforcing Deep Work environment", 
        "Workspace transition complete",
        "Focus +12",
        100
      );
      triggerOptimization("flow");
    });

    // T=8.0s: Peer Radar surfaces insight
    schedule(8000, () => {
      addLog(
        "Peer Radar", 
        "Manual research required", 
        "Local NLP identified syllabus match",
        "Surfaced key insight from chat", 
        "Saved 15 minutes of search",
        "Time +15m",
        95
      );
    });

    // T=10.0s: Socratic Challenger challenges thesis
    schedule(10000, () => {
      addLog(
        "Socratic Challenger", 
        "Passive reading detected", 
        "Eye-tracking identified stagnation",
        "Injected prompt: 'Defend this approach'", 
        "Student engaged in active recall",
        "Retention +30",
        88
      );
    });

    // T=12.0s: Flow state restored
    schedule(12000, () => {
      setCognitiveState("Flow");
      setDemoTelemetry({
        heartRate: 68,
        hrv: 65,
        blinkRate: 12,
        activeApp: 'APEX Workspace',
        ambientDb: 35,
        screenInteractionDensity: 0.15
      });
      addLog(
        "State Agent", 
        "Biometrics normalized", 
        "iQOO edge model verified Heart Rate drop",
        "Locked state to FLOW", 
        "Flow State Restored",
        "Flow +40",
        95
      );
    });
    
    // T=13.0s: End demo mode
    schedule(13000, () => {
      setIsDemoRunning(false);
      setDemoTelemetry(null);
    });

  }, [isDemoRunning, setCognitiveState, setAdaptiveMode, triggerOptimization, addLog]);

  return {
    isDemoRunning,
    demoTelemetry,
    showPhoneOverlay,
    runDemoSequence
  };
}
