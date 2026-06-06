import { useState, useCallback, useRef } from 'react';
import type { CognitiveState, TelemetryData } from '../types';
import type { AdaptiveMode } from '../context/AppContext';

export function useDemoOrchestrator(
  setCognitiveState: (state: CognitiveState) => void,
  setAdaptiveMode: (mode: AdaptiveMode) => void,
  triggerOptimization: (targetMode: AdaptiveMode) => void,
  addLog: (agent: string, problem: string, reason: string, action: string, outcome: string, impact: string, confidence: number) => void,
  sendMessage?: (event: string, payload: any) => void,
  addNetworkLog?: (log: string) => void
) {
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoTelemetry, setDemoTelemetry] = useState<TelemetryData | null>(null);
  const [showPhoneOverlay, setShowPhoneOverlay] = useState(false);
  const [lastDemoSync, setLastDemoSync] = useState<any>(null);
  
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const runDemoSequence = useCallback(() => {
    if (isDemoRunning) return;
    
    setIsDemoRunning(true);
    setShowPhoneOverlay(true);
    
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const schedule = (delayMs: number, action: () => void) => {
      const t = setTimeout(action, delayMs);
      timeoutsRef.current.push(t);
    };

    const emitSync = (payload: any) => {
      setLastDemoSync(payload);
      if (sendMessage) {
        sendMessage('DEMO_SYNC', payload);
        if (addNetworkLog) addNetworkLog(`SYNC_BROADCAST_SENT: Step ${payload.step}`);
      }
    };

    // T=0.0s: Student distracted
    setAdaptiveMode("research");
    setCognitiveState("Distracted");
    setDemoTelemetry({
      heartRate: 98, hrv: 25, blinkRate: 22, activeApp: 'Chrome (20 tabs)', ambientDb: 55, screenInteractionDensity: 0.95
    });

    emitSync({
      step: 0,
      cognitiveState: "DISTRACTED",
      failureRisk: "12%",
      activeIntervention: "Monitoring...",
      flowConfidence: "14%",
      before: {
        failureRisk: "--", estimatedCompletion: "--", contextSwitches: "--", timeSaved: "--"
      },
      after: {
        failureRisk: "12%", estimatedCompletion: "2h 45m", contextSwitches: "17", timeSaved: "0m"
      },
      causality: {
        sense: "17 context switches detected",
        reason: "Attention drift exceeding threshold",
        adapt: "Waiting for risk calculation...",
        improve: "N/A"
      }
    });

    schedule(1500, () => {
      setShowPhoneOverlay(false);
    });

    // T=2.5s: Deadline Sentinel
    schedule(2500, () => {
      if (addNetworkLog) addNetworkLog("STATE_ANALYSIS_COMPLETE: Deadline Sentinel");
      addLog("Deadline Sentinel", "Assignment due in 38 minutes", "Local CRDT matched syllabus calendar", "Calculated extreme execution risk", "Urgency score = 89", "Risk +45", 98);
      emitSync({
        step: 1,
        cognitiveState: "DISTRACTED",
        failureRisk: "89%",
        activeIntervention: "Calculating Threat Vector",
        flowConfidence: "14%",
        before: {
          failureRisk: "12%", estimatedCompletion: "2h 45m", contextSwitches: "17", timeSaved: "0m"
        },
        after: {
          failureRisk: "89%", estimatedCompletion: "2h 45m (Due 38m)", contextSwitches: "17", timeSaved: "0m"
        },
        causality: {
          sense: "Assignment due in 38 minutes",
          reason: "Failure risk increased to 89%",
          adapt: "Invoking Environment Sculptor",
          improve: "N/A"
        }
      });
    });

    // T=5.0s: Environment Sculptor
    schedule(5000, () => {
      if (addNetworkLog) addNetworkLog("INTERVENTION_EXECUTED: Environment Sculptor");
      addLog("Environment Sculptor", "High urgency + Distraction", "Desktop OS requested intervention", "Closed 20 tabs & Enabled DND", "Workspace adapted", "Flow +24", 100);
      triggerOptimization("flow");
      emitSync({
        step: 2,
        cognitiveState: "TRANSITIONING",
        failureRisk: "65%",
        activeIntervention: "Environment Sculptor (20 Tabs Suppressed)",
        flowConfidence: "45%",
        before: {
          failureRisk: "89%", estimatedCompletion: "2h 45m", contextSwitches: "17", timeSaved: "0m"
        },
        after: {
          failureRisk: "65%", estimatedCompletion: "2h 23m", contextSwitches: "0", timeSaved: "22m"
        },
        causality: {
          sense: "Workspace fragmented",
          reason: "Needs Deep Work environment",
          adapt: "Environment Sculptor suppressed distractions",
          improve: "Failure risk reduced to 65%"
        }
      });
    });

    // T=8.0s: Peer Radar surfaces insight
    schedule(8000, () => {
      if (addNetworkLog) addNetworkLog("INTERVENTION_EXECUTED: Peer Radar");
      addLog("Peer Radar", "Manual research required", "Local NLP identified syllabus match", "Surfaced key insight from chat", "Saved 15 minutes of search", "Time +15m", 95);
      emitSync({
        step: 3,
        cognitiveState: "TRANSITIONING",
        failureRisk: "42%",
        activeIntervention: "Peer Radar (Key Insight Injected)",
        flowConfidence: "68%",
        before: {
          failureRisk: "65%", estimatedCompletion: "2h 23m", contextSwitches: "0", timeSaved: "22m"
        },
        after: {
          failureRisk: "42%", estimatedCompletion: "1h 46m", contextSwitches: "0", timeSaved: "37m"
        },
        causality: {
          sense: "Manual research required",
          reason: "Local NLP found syllabus match",
          adapt: "Peer Radar surfaced key insight",
          improve: "Saved 15 minutes of search"
        }
      });
    });

    // T=11.0s: Socratic Challenger challenges thesis
    schedule(11000, () => {
      if (addNetworkLog) addNetworkLog("INTERVENTION_EXECUTED: Socratic Challenger");
      addLog("Socratic Challenger", "Passive reading detected", "Eye-tracking identified stagnation", "Injected prompt: 'Defend this approach'", "Student engaged in active recall", "Retention +30", 88);
      emitSync({
        step: 4,
        cognitiveState: "ENGAGED",
        failureRisk: "31%",
        activeIntervention: "Socratic Challenger (Active Recall)",
        flowConfidence: "82%",
        before: {
          failureRisk: "42%", estimatedCompletion: "1h 46m", contextSwitches: "0", timeSaved: "37m"
        },
        after: {
          failureRisk: "31%", estimatedCompletion: "1h 38m", contextSwitches: "0", timeSaved: "45m"
        },
        causality: {
          sense: "Passive reading detected",
          reason: "Eye-tracking identified stagnation",
          adapt: "Socratic Challenger prompted defense",
          improve: "Retention increased by 30%"
        }
      });
    });

    // T=14.0s: Flow state restored
    schedule(14000, () => {
      if (addNetworkLog) addNetworkLog("STATE_ANALYSIS_COMPLETE: Flow Verified");
      setCognitiveState("Flow");
      setDemoTelemetry({
        heartRate: 68, hrv: 65, blinkRate: 12, activeApp: 'APEX Workspace', ambientDb: 35, screenInteractionDensity: 0.15
      });
      addLog("State Agent", "Biometrics normalized", "iQOO edge model verified Heart Rate drop", "Locked state to FLOW", "Flow State Restored", "Flow +40", 95);
      emitSync({
        step: 5,
        cognitiveState: "FLOW",
        failureRisk: "12%",
        activeIntervention: "None (Optimal State)",
        flowConfidence: "98%",
        before: {
          failureRisk: "31%", estimatedCompletion: "1h 38m", contextSwitches: "0", timeSaved: "45m"
        },
        after: {
          failureRisk: "12%", estimatedCompletion: "33m", contextSwitches: "0", timeSaved: "1h 12m"
        },
        causality: {
          sense: "Biometrics normalized",
          reason: "Heart rate and HRV stabilized",
          adapt: "Locked state to FLOW",
          improve: "Student is on track to succeed"
        }
      });
    });
    
    // T=18.0s: End demo mode
    schedule(18000, () => {
      setIsDemoRunning(false);
      setDemoTelemetry(null);
    });

  }, [isDemoRunning, setCognitiveState, setAdaptiveMode, triggerOptimization, addLog, sendMessage, addNetworkLog]);

  return {
    isDemoRunning,
    demoTelemetry,
    showPhoneOverlay,
    lastDemoSync,
    runDemoSequence
  };
}
