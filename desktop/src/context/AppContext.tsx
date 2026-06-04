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
  addLog: (agent: string, trigger: string, reason: string, action: string, outcome: string) => void;

  // Auth
  isLoggedIn: boolean;
  login: (token?: string) => void;
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
    // Let the visualizer run for 3 seconds before switching modes and lifting the overlay
    setTimeout(() => {
      setAdaptiveMode(targetMode);
      setIsOptimizing(false);
    }, 3000);
  }, []);

  // ── Logging ─────────────────────────────────────────────
  const addLog = useCallback((agent: string, trigger: string, reason: string, action: string, outcome: string) => {
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
      trigger,
      action,
      reason,
      outcome,
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
  const { isConnected, connect, disconnect, lastMessage, sendMessage } = useWebSocket({
    onConnectionChange: (connected) => {
      addLog('System', 
        connected ? 'WebSocket connection established' : 'WebSocket connection closed',
        connected ? 'Network link active' : 'Network link severed',
        'Updated socket status',
        connected ? 'Ready for telemetry' : 'Offline mode engaged'
      );
    },
  });


  // ── Process incoming WS messages ────────────────────────
  useEffect(() => {
    if (!lastMessage) return;

    const event = lastMessage as WebSocketEvent<CognitiveStatePayload>;
    if (event.event === 'COGNITIVE_STATE_DETERMINED' && event.payload) {
      const { state, confidence_score } = event.payload;
      setCognitiveState(state);
      setConfidence(confidence_score);
      addLog(
        'State Agent',
        `Received new state from server: ${state}`,
        `Confidence at ${Math.round(confidence_score * 100)}%`,
        'Re-evaluated bounds',
        'System logic bound to new state'
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
      connect(resolvedToken);
      addLog('System', 'User auth flow triggered', 'Valid JWT token detected', 'Authenticated user session', 'Connecting to APEX server…');
    },
    [connect, addLog],
  );

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    disconnect();
    addLog('System', 'User explicitly closed session', 'Manual logout', 'Cleared credentials', 'WebSocket disconnected.');
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
      telemetry,
      interpreted,
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
