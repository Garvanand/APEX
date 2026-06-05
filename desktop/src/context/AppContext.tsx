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

  // WebSocket
  isConnected: boolean;
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
  
  // ── Engine Interpreted Metrics ─────────────────────────
  const [engineInterpreted, setEngineInterpreted] = useState<InterpretedMetrics | null>(null);

  // ── Initial Mount Auth Persistence ───────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('apex_auth_token');
    if (savedToken) {
      setIsLoggedIn(true);
      addLog('System', 'Session Disconnected', 'Token validated locally', 'Restored user session', 'Connecting to APEX server', 'Network +1', 100);
      // Connection handled via the useWebSocket internal mechanisms or manual trigger
    }
  }, [addLog]);

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

  // ── Demo Orchestrator ───────────────────────────────────
  const { isDemoRunning, demoTelemetry, showPhoneOverlay, runDemoSequence } = useDemoOrchestrator(
    setCognitiveState,
    setAdaptiveMode,
    triggerOptimization,
    addLog
  );

  // ── Telemetry ───────────────────────────────────────────
  const { telemetry, interpreted, setActiveApp } = useTelemetry(cognitiveState, { demoOverride: demoTelemetry });

  // ── WebSocket ───────────────────────────────────────────
  const { isConnected, connect, disconnect, lastMessage, sendMessage, isLocalMode } = useWebSocket({
    url: 'ws://localhost:8000/api/v1/cognitive/stream',
    onConnectionChange: (connected) => {
      addLog('System', 
        connected ? 'Offline' : 'Online',
        connected ? 'Socket Ready' : 'Socket Closed',
        connected ? 'Established connection' : 'Closed connection',
        connected ? 'Ready for telemetry' : 'Offline mode engaged',
        'Latency -10ms',
        100
      );
    },
  });


  // ── Process incoming WS messages ────────────────────────
  useEffect(() => {
    if (!lastMessage) return;

    const event = lastMessage as WebSocketEvent<CognitiveStatePayload>;
    if (event.event === 'COGNITIVE_STATE_DETERMINED' && event.payload) {
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
    }
  }, [lastMessage, addLog]);

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
      addLog('System', 'No active session', 'Valid credentials supplied', 'Authenticated user session', 'Connecting to APEX server', 'Network +1', 100);
    },
    [connect, addLog],
  );

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem('apex_auth_token');
    disconnect();
    addLog('System', 'Session active', 'Manual user logout', 'Cleared credentials', 'WebSocket disconnected', 'Network 0', 100);
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
      isLoggedIn,
      login,
      logout,
      isLocalMode,
      telemetry,
      interpreted: engineInterpreted || interpreted,
      setActiveApp,
      isConnected,
      runDemoSequence,
      showPhoneOverlay,
    }),
    [
      cognitiveState,
      confidence,
      adaptiveMode,
      isOptimizing,
      triggerOptimization,
      logs,
      addLog,
      isLoggedIn,
      login,
      logout,
      telemetry,
      interpreted,
      setActiveApp,
      isConnected,
      runDemoSequence,
      showPhoneOverlay,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
