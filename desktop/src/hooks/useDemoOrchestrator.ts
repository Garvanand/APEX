import { useState, useCallback, useRef } from 'react';
import type { CognitiveState, TelemetryData } from '../types';
import type { AdaptiveMode } from '../context/AppContext';

export function useDemoOrchestrator(
  setCognitiveState: (state: CognitiveState) => void,
  setAdaptiveMode: (mode: AdaptiveMode) => void,
  triggerOptimization: (targetMode: AdaptiveMode) => void,
  addLog: (agent: string, trigger: string, reason: string, action: string, outcome: string) => void
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

    // T=2.0s: State Agent detects issue
    schedule(2000, () => {
      addLog(
        "State Agent", 
        "Distraction spike detected", 
        "12 context switches in 4 minutes", 
        "Flagged cognitive state",
        "State updated to DISTRACTED"
      );
    });

    // T=3.5s: Deadline approaching & Deadline Sentinel calculates risk
    schedule(3500, () => {
      addLog(
        "Deadline Sentinel", 
        "Deadline approaching", 
        "Assignment due in 38 minutes", 
        "Calculated extreme risk",
        "Urgency score = 89"
      );
    });

    // T=5.0s: Environment Sculptor intervenes
    schedule(5000, () => {
      addLog(
        "Environment Sculptor", 
        "Intervention required", 
        "High urgency + Distraction", 
        "Closed 20 tabs & Enabled DND",
        "Resources loaded"
      );
    });

    // T=6.5s: Workspace adapts
    schedule(6500, () => {
      addLog(
        "Workspace Core", 
        "Environment Sculptor triggered optimization", 
        "Enforcing Deep Work environment", 
        "Morphed layout",
        "Workspace transition complete"
      );
      triggerOptimization("flow");
    });

    // T=8.0s: Peer Radar surfaces insight
    schedule(8000, () => {
      addLog(
        "Peer Radar", 
        "Relevant group chat message", 
        "Found context matching current syllabus", 
        "Surfaced key insight",
        "Saved 15 minutes of search"
      );
    });

    // T=10.0s: Socratic Challenger challenges thesis
    schedule(10000, () => {
      addLog(
        "Socratic Challenger", 
        "Thesis formulation", 
        "Testing understanding", 
        "Injected prompt: 'Defend this approach'",
        "Student engaged"
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
        "Focus sustained", 
        "Locked state",
        "Flow State Restored"
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
