import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type {
  CognitiveState,
  AgentLog,
  TelemetryData,
  CognitiveStatePayload,
  WebSocketEvent,
} from '../types';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTelemetry, InterpretedMetrics } from '../hooks/useTelemetry';
import { useDemoOrchestrator } from '../hooks/useDemoOrchestrator';
import { generateSocraticSupport } from '../lib/openrouter';

export interface MobileTelemetry {
  accelX: number;
  accelY: number;
  accelZ: number;
  touchBurstCount: number;
  backgroundTransitions: number;
  distractionScore: number;
  fatigueScore: number;
}

// ─────────────────────────────────────────────────────────────
// AppContext — global state provider
// ─────────────────────────────────────────────────────────────

const MAX_LOG_ENTRIES = 50;

export type AdaptiveMode = "flow" | "research" | "writing" | "deadline" | "recovery";

// ─── Context Shape ──────────────────────────────────────────

interface AppContextValue {
  // Cognitive state
  cognitiveState: CognitiveState;
  setCognitiveState: (state: CognitiveState) => void;
  confidence: number;
  setConfidence: (confidence: number) => void;

  // Workspace Mode
  adaptiveMode: AdaptiveMode;
  setAdaptiveMode: (mode: AdaptiveMode) => void;
  isOptimizing: boolean;
  triggerOptimization: (targetMode: AdaptiveMode) => void;

  // Logging
  logs: AgentLog[];
  addLog: (agent: string, problem: string, reason: string, action: string, outcome: string, impact: string, confidence: number) => void;
  networkLogs: string[];
  addNetworkLog: (log: string) => void;

  // Auth
  isLoggedIn: boolean;
  login: (token?: string) => void;
  isLocalMode: boolean;
  logout: () => void;
  runDemoSequence: () => void;
  showPhoneOverlay: boolean;

  // Telemetry
  telemetry: TelemetryData;
  interpreted: InterpretedMetrics;
  setActiveApp: (app: string) => void;

  // Remote Control
  showDebrief: boolean;
  setShowDebrief: (show: boolean) => void;
  isApexEnabled: boolean;
  setIsApexEnabled: (enabled: boolean) => void;

  // WebSocket
  isConnected: boolean;

  // Active Execution
  activeExecution: { agentType: string; status: string; inputData?: string; result?: any } | null;

  // Demo Sync State
  lastDemoSync: any | null;

  // Real Sensor Data
  mobileTelemetry: MobileTelemetry | null;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Hook ───────────────────────────────────────────────────

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error(
      'useAppContext must be used within an <AppProvider>. ' +
        'Wrap your component tree with <AppProvider> in main.tsx.',
    );
  }
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // ── Core state ──────────────────────────────────────────
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>('Flow');
  const [adaptiveMode, setAdaptiveMode] = useState<AdaptiveMode>('flow');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [confidence, setConfidence] = useState(0.92);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [networkLogs, setNetworkLogs] = useState<string[]>([]);
  
  // ── Engine Interpreted Metrics ─────────────────────────
  const [engineInterpreted, setEngineInterpreted] = useState<InterpretedMetrics | null>(null);

  // ── Real Mobile Telemetry ──────────────────────────────
  const [mobileTelemetry, setMobileTelemetry] = useState<MobileTelemetry | null>(null);

  // ── Remote Control ───────────────────────────────────────
  const [showDebrief, setShowDebrief] = useState(false);
  const [isApexEnabled, setIsApexEnabled] = useState(false);

  // ── Active Execution ─────────────────────────────────────
  const [activeExecution, setActiveExecution] = useState<{ agentType: string; status: string; inputData?: string; result?: any } | null>(null);

  // ── Adaptive Enforcement ────────────────────────────────
  useEffect(() => {
    if (cognitiveState === "Overloaded" || cognitiveState === "Fatigued") {
      setAdaptiveMode("recovery");
    } else if (adaptiveMode === "recovery" && (cognitiveState === "Flow" || cognitiveState === "Distracted")) {
      setAdaptiveMode("flow");
    }
  }, [cognitiveState, adaptiveMode]);

  const triggerOptimization = useCallback((targetMode: AdaptiveMode) => {
    setIsOptimizing(true);
    setAdaptiveMode(targetMode); // Switch the mode immediately so the Visualizer can read it to decide which interventions to plan
    
    // Let the visualizer sequence run for 5.5 seconds before lifting the overlay
    setTimeout(() => {
      setIsOptimizing(false);
    }, 5500);
  }, []);

  // ── Logging ─────────────────────────────────────────────
  const addLog = useCallback((agent: string, problem: string, reason: string, action: string, outcome: string, impact: string, confidence: number) => {
    const now = new Date();
    const timeStr = [
      now.getHours().toString().padStart(2, '0'),
      now.getMinutes().toString().padStart(2, '0'),
      now.getSeconds().toString().padStart(2, '0'),
    ].join(':');

    const entry: AgentLog = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: timeStr,
      agent,
      problem,
      reason,
      action,
      outcome,
      impact,
      confidence,
    };

    setLogs(prev => [entry, ...prev.slice(0, MAX_LOG_ENTRIES - 1)]);
  }, []);

  const addNetworkLog = useCallback((log: string) => {
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    setNetworkLogs(prev => [`[${time}] ${log}`, ...prev].slice(0, 20));
  }, []);

  // ── WebSocket ───────────────────────────────────────────
  const { isConnected, connect, disconnect, lastMessage, sendMessage, isLocalMode } = useWebSocket({
    url: 'ws://127.0.0.1:8080/api/v1/cognitive/stream',
    onConnectionChange: (connected) => {
      addLog('System', 
        connected ? 'Office Kit Session Active' : 'Office Kit Session Offline',
        connected ? 'iQOO Device Connected' : 'iQOO Device Disconnected',
        connected ? 'Workspace Linked' : 'Workspace Unlinked',
        connected ? 'Sensor Stream Active' : 'Offline mode engaged',
        'Latency -10ms',
        100
      );
    },
  });

  // ── Demo Orchestrator ───────────────────────────────────
  const { isDemoRunning, demoTelemetry, showPhoneOverlay, lastDemoSync, runDemoSequence } = useDemoOrchestrator(
    setCognitiveState,
    setAdaptiveMode,
    triggerOptimization,
    addLog,
    sendMessage,
    addNetworkLog
  );

  const { telemetry, interpreted, setActiveApp } = useTelemetry(cognitiveState, { demoOverride: demoTelemetry });

  // ── Initial Mount Auth Persistence ───────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('apex_auth_token') || 'local-demo-token';
    setIsLoggedIn(true);
    addLog('System', 'Connecting Office Kit', 'Establishing Authority', 'iQOO Sync Initiated', 'Waiting for sensor stream', 'Network +1', 100);
    connect(savedToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // ── Process incoming WS messages ────────────────────────
  useEffect(() => {
    if (!lastMessage) return;

    const event = lastMessage as WebSocketEvent<CognitiveStatePayload>;
    if (event.event === 'COGNITIVE_STATE_DETERMINED' && event.payload) {
      const { agent, action, desc, target } = event.payload as any;
      if (agent) addLog(agent, action, desc, target, 'N/A', 'N/A', 1.0);
      if (isConnected) {
        sendMessage('AGENT_ACTION', event.payload);
      }
      const { state, confidence_score, confidence } = event.payload;
      setCognitiveState(state);
      const conf = confidence ?? confidence_score ?? 0.85;
      setConfidence(conf);
      addLog(
        'State Agent',
        `Uncertain state bounds`,
        `New state from server: ${state}`,
        `Re-evaluated bounds`,
        'System logic bound to new state',
        `Flow +${Math.round(conf * 10)}`,
        Math.round(conf * 100)
      );
    } else if (event.event === 'STATE_TRANSITION' && event.payload) {
      const { state, confidence, attention_stability, focus_trend, cognitive_load } = event.payload;
      setCognitiveState(state);
      setConfidence(confidence ?? 0.85);

      if (attention_stability && focus_trend && cognitive_load) {
        setEngineInterpreted({
          attentionStability: attention_stability as any,
          focusTrend: focus_trend as any,
          contextSwitching: "Acceptable", // Mapping
          cognitiveLoad: cognitive_load as any,
        });
      }
      
      addLog(
        'State Agent',
        `Cognitive fatigue pattern detected`,
        `Computed Engine Weights`,
        `Transitioned state to: ${state}`,
        'Visual indicators updated',
        `Risk -20`,
        90
      );
    } else if (event.event === 'DEMO_START') {
      runDemoSequence();
    } else if (event.event === 'SHOW_DEBRIEF') {
      setShowDebrief(true);
    } else if (event.event === 'TOGGLE_APEX') {
      setIsApexEnabled(prev => !prev);
    } else if (event.event === 'COMPUTE_ACTIVE') {
      setActiveExecution(event.payload as any);
      setIsApexEnabled(true); // Automatically unlock if phone sends a task
    } else if (event.event === 'COMPUTE_COMPLETE') {
      setActiveExecution(event.payload as any);
      setTimeout(() => setActiveExecution(null), 10000); // Clear after 10 seconds
    } else if (event.event === 'QUICK_CAPTURE' && event.payload) {
      const { text } = event.payload as any;
      addLog(
        'Environment Sculptor',
        'Quick capture received from phone',
        `Thought synced: "${text}"`,
        'Saved to persistent scratchpad',
        'Phone flow unblocked',
        'Flow +15',
        95
      );
    } else if (event.event === 'HELP_REQUEST') {
      addLog(
        'Socratic Challenger',
        'Help requested from lockdown screen',
        'Student stuck on current task',
        'Initiating Socratic Support Mode',
        'Retrieving context for "CS-4120 Compilers"',
        'Recovery +25',
        100
      );
      
      // Trigger LLM to fetch actual socratic advice
      setActiveExecution({
        agentType: "Socratic Challenger",
        status: "Processing",
        inputData: "I'm stuck on CS-4120 Compilers Parsing Algorithms"
      });
      
      generateSocraticSupport("CS-4120 Compilers Parsing Algorithms").then((response) => {
        setActiveExecution({
          agentType: "Socratic Challenger",
          status: "Complete",
          inputData: "I'm stuck on CS-4120 Compilers Parsing Algorithms",
          result: { response }
        });
        
        // Hide it after 15 seconds
        setTimeout(() => {
          setActiveExecution(null);
        }, 15000);
      });
      
    } else if (event.event === 'COGNITIVE_STATE_REALTIME' && event.payload) {
      const payload = event.payload as any;
      if (payload.device_source === 'iqoo-mobile-client') {
        const distScore = payload.distractionScore || 0;
        let newState: CognitiveState = 'Flow';
        if (distScore > 75) {
          newState = 'Overloaded';
        } else if (distScore > 50) {
          newState = 'Distracted';
        } else if (payload.fatigueScore > 60) {
          newState = 'Fatigued';
        }
        
        // Only update if it actually changed to avoid massive re-renders
        setCognitiveState(prev => prev !== newState ? newState : prev);
        
        const newConf = (payload.flowConfidence || 0) / 100;
        setConfidence(prev => Math.abs(prev - newConf) > 0.05 ? newConf : prev);

        setMobileTelemetry({
           accelX: payload.accelX,
           accelY: payload.accelY,
           accelZ: payload.accelZ,
           touchBurstCount: payload.touchBurstCount,
           backgroundTransitions: payload.backgroundTransitions,
           distractionScore: payload.distractionScore,
           fatigueScore: payload.fatigueScore
        });
      }
    }
  }, [lastMessage, addLog, runDemoSequence, isConnected, sendMessage]);

  // ── Broadcast telemetry to server ───────────────────────
  useEffect(() => {
    if (!isConnected) return;

    sendMessage('COGNITIVE_STATE_RAW', {
      device_source: 'desktop-tauri-client',
      heart_rate: telemetry.heartRate,
      hrv: telemetry.hrv,
      blink_rate_per_min: telemetry.blinkRate,
      screen_interaction_density: telemetry.screenInteractionDensity,
      active_application: telemetry.activeApp,
      ambient_noise_db: telemetry.ambientDb,
    });
  }, [telemetry, isConnected, sendMessage]);

  // ── Auth ────────────────────────────────────────────────
  const login = useCallback(
    (token?: string) => {
      const resolvedToken =
        token?.trim() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummyUserToken';
      setIsLoggedIn(true);
      localStorage.setItem('apex_auth_token', resolvedToken);
      connect(resolvedToken);
      addLog('System', 'No active session', 'Valid credentials supplied', 'Authenticated user session', 'Connecting Office Kit', 'Network +1', 100);
    },
    [connect, addLog],
  );

  // ── Broadcast Context to Phone ───────────────────────────
  useEffect(() => {
    if (isConnected) {
      sendMessage('DESKTOP_SYNC', {
        workspace: engineInterpreted?.focusTrend === "Declining" ? "Social Media" : "CS-4120 Compilers"
      });
    }
  }, [isConnected, engineInterpreted, sendMessage]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem('apex_auth_token');
    disconnect();
    addLog('System', 'Session active', 'Manual user logout', 'Cleared credentials', 'Office Kit session ended', 'Network 0', 100);
  }, [disconnect, addLog]);

  // ── Memoised context value ──────────────────────────────
  const value = useMemo<AppContextValue>(
    () => ({
      cognitiveState,
      setCognitiveState,
      confidence,
      setConfidence,
      adaptiveMode,
      setAdaptiveMode,
      isOptimizing,
      triggerOptimization,
      logs,
      addLog,
      networkLogs,
      addNetworkLog,
      isLoggedIn,
      login,
      logout,
      isLocalMode,
      telemetry,
      interpreted: engineInterpreted ?? interpreted,
      setActiveApp,
      showDebrief,
      setShowDebrief,
      isApexEnabled,
      setIsApexEnabled,
      isConnected,
      activeExecution,
      lastDemoSync,
      mobileTelemetry,
      runDemoSequence,
      showPhoneOverlay,
    }),
    [
      cognitiveState,
      confidence,
      adaptiveMode,
      isOptimizing,
      logs,
      networkLogs,
      isLoggedIn,
      login,
      isLocalMode,
      logout,
      runDemoSequence,
      showPhoneOverlay,
      telemetry,
      engineInterpreted,
      interpreted,
      setActiveApp,
      showDebrief,
      isApexEnabled,
      isConnected,
      activeExecution,
      lastDemoSync,
      mobileTelemetry,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
