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
  WebSocketEvent,
} from '../types';
import { useWebSocket, type ConnectionStatus } from '../hooks/useWebSocket';
import { useTelemetry, InterpretedMetrics } from '../hooks/useTelemetry';
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

// ─── Event Timeline Entry ───────────────────────────────
export interface TimelineEntry {
  id: string;
  time: string;
  timestamp: number;
  event: string;
  detail: string;
  source: string;
}

// ─────────────────────────────────────────────────────────────
// AppContext — global state provider
// ─────────────────────────────────────────────────────────────

const MAX_LOG_ENTRIES = 50;
const MAX_TIMELINE_ENTRIES = 100;

function normalizeCognitiveState(stateStr: string): CognitiveState {
  const s = (stateStr || '').toLowerCase();
  if (s.includes('distract')) return 'Distracted';
  if (s.includes('fatigue')) return 'Fatigued';
  if (s.includes('overload')) return 'Overloaded';
  return 'Flow';
}

export type AdaptiveMode = "flow" | "research" | "writing" | "deadline" | "recovery";

// ─── Sculptor Action Lifecycle ──────────────────────────
export type SculptorStatus = 'idle' | 'proposed' | 'executing' | 'completed';
export interface SculptorAction {
  status: SculptorStatus;
  action: string;
  trigger: string;
  timestamp: number;
}

// ─── Context Shape ──────────────────────────────────────

interface AppContextValue {
  // Cognitive state
  cognitiveState: CognitiveState;
  setCognitiveState: (state: CognitiveState) => void;
  confidence: number;
  stateSource: string; // 'mobile' | 'relay_ml' | 'demo' | 'local'
  stateUpdatedAt: number | null;

  // Workspace Mode
  adaptiveMode: AdaptiveMode;
  setAdaptiveMode: (mode: AdaptiveMode) => void;
  isOptimizing: boolean;
  triggerOptimization: (targetMode: AdaptiveMode) => void;

  // Sculptor
  sculptorAction: SculptorAction;

  // Logging
  logs: AgentLog[];
  addLog: (agent: string, problem: string, reason: string, action: string, outcome?: string, impact?: string, confidence?: number) => void;
  networkLogs: string[];
  addNetworkLog: (log: string) => void;

  // Timeline
  timeline: TimelineEntry[];

  // Connection
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  sessionId: string | null;
  latencyMs: number;
  lastHeartbeat: number | null;
  phoneConnected: boolean;
  phoneDeviceName: string | null;

  // Auth
  isLoggedIn: boolean;
  login: (token?: string) => void;
  logout: () => void;

  // Telemetry
  telemetry: TelemetryData;
  interpreted: InterpretedMetrics;
  setActiveApp: (app: string) => void;

  // Remote Control
  showDebrief: boolean;
  setShowDebrief: (show: boolean) => void;
  isApexEnabled: boolean;
  setIsApexEnabled: (enabled: boolean) => void;

  // Active Execution
  activeExecution: { agentType: string; status: string; inputData?: string; result?: any } | null;

  // Real Sensor Data from Phone
  mobileTelemetry: MobileTelemetry | null;

  // Demo
  lastDemoSync: any;
  runDemoSequence: () => void;
  showPhoneOverlay: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an <AppProvider>.');
  }
  return ctx;
}

// ─── Provider ───────────────────────────────────────────

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // ── Core state ──────────────────────────────────────────
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>('Flow');
  const [adaptiveMode, setAdaptiveMode] = useState<AdaptiveMode>('flow');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [confidence, setConfidence] = useState(0.92);
  const [stateSource, setStateSource] = useState('local');
  const [stateUpdatedAt, setStateUpdatedAt] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [networkLogs, setNetworkLogs] = useState<string[]>([]);
  const [lastDemoSync, setLastDemoSync] = useState<any>(null);

  const addNetworkLog = useCallback((log: string) => {
    setNetworkLogs(prev => [log, ...prev.slice(0, 49)]);
  }, []);

  // ── Sculptor ────────────────────────────────────────────
  const [sculptorAction, setSculptorAction] = useState<SculptorAction>({
    status: 'idle', action: '', trigger: '', timestamp: 0
  });

  // ── Real Mobile Telemetry ──────────────────────────────
  const [mobileTelemetry, setMobileTelemetry] = useState<MobileTelemetry | null>(null);

  // ── Remote Control ────────────────────────────────────
  const [showDebrief, setShowDebrief] = useState(false);
  const [isApexEnabled, setIsApexEnabled] = useState(false);
  const [showPhoneOverlay, setShowPhoneOverlay] = useState(false);

  // ── Active Execution ──────────────────────────────────
  const [activeExecution, setActiveExecution] = useState<{ agentType: string; status: string; inputData?: string; result?: any } | null>(null);

  // ── Timeline helper ───────────────────────────────────
  const addTimeline = useCallback((event: string, detail: string, source: string) => {
    const now = new Date();
    const timeStr = [
      now.getHours().toString().padStart(2, '0'),
      now.getMinutes().toString().padStart(2, '0'),
      now.getSeconds().toString().padStart(2, '0'),
    ].join(':');

    addNetworkLog(`[${timeStr}] [${source.toUpperCase()}] ${event}: ${detail}`);

    setTimeline(prev => [{
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: timeStr,
      timestamp: Date.now(),
      event,
      detail,
      source,
    }, ...prev.slice(0, MAX_TIMELINE_ENTRIES - 1)]);
  }, [addNetworkLog]);

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
    setAdaptiveMode(targetMode);
    setTimeout(() => setIsOptimizing(false), 5500);
  }, []);

  // ── Sculptor lifecycle ──────────────────────────────────
  const executeSculptorAction = useCallback((state: CognitiveState, sendMessage: <T>(event: string, payload: T) => void) => {
    let action = '';
    let trigger = `State changed to ${state}`;

    switch (state) {
      case 'Flow':
        action = 'Protecting workspace — maintaining clean environment';
        break;
      case 'Distracted':
        action = 'Focus intervention — reducing distraction surfaces';
        triggerOptimization('flow');
        break;
      case 'Fatigued':
        action = 'Recovery intervention — simplifying workspace';
        triggerOptimization('recovery');
        break;
      case 'Overloaded':
        action = 'Emergency intervention — entering recovery mode';
        triggerOptimization('recovery');
        break;
    }

    // PROPOSED
    setSculptorAction({ status: 'proposed', action, trigger, timestamp: Date.now() });
    addTimeline('SCULPTOR_PROPOSED', action, 'desktop');

    // EXECUTING (after 500ms)
    setTimeout(() => {
      setSculptorAction(prev => ({ ...prev, status: 'executing' }));
      addTimeline('SCULPTOR_EXECUTING', action, 'desktop');
    }, 500);

    // COMPLETED (after 2s) + send ACK to relay
    setTimeout(() => {
      setSculptorAction(prev => ({ ...prev, status: 'completed' }));
      addTimeline('SCULPTOR_COMPLETED', action, 'desktop');
      sendMessage('SCULPTOR_ACTION_EXECUTED', { action, state, timestamp: Date.now() });
    }, 2000);

    // Back to idle after 5s
    setTimeout(() => {
      setSculptorAction(prev => prev.status === 'completed' ? { ...prev, status: 'idle' } : prev);
    }, 5000);
  }, [triggerOptimization, addTimeline]);

  // ── Logging ─────────────────────────────────────────────
  const addLog = useCallback((
    agent: string,
    problem: string,
    reason: string,
    action: string,
    outcome: string = 'Executed',
    impact: string = 'Neutral',
    confidence: number = 90
  ) => {
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
      trigger: problem,
      reason,
      action,
      outcome,
      impact,
      confidence,
    };

    setLogs(prev => [entry, ...prev.slice(0, MAX_LOG_ENTRIES - 1)]);
  }, []);

  // ── WebSocket ───────────────────────────────────────────
  const {
    connectionStatus, isConnected, connect, disconnect, sendMessage, lastMessage,
    sessionId, latencyMs, lastHeartbeat,
    phoneConnected, phoneDevice,
  } = useWebSocket({
    url: 'ws://127.0.0.1:8080/ws',
    onConnectionChange: (status) => {
      addTimeline(`RELAY_${status.toUpperCase()}`, `Connection status: ${status}`, 'desktop');
      if (status === 'connected') {
        setIsApexEnabled(true);
        addLog('System', 'Relay Bridge Connected', 'WebSocket handshake completed', 'Session established', 'Real-time link active', 'Network +1', 100);
      } else if (status === 'offline') {
        addLog('System', 'Relay Bridge Offline', 'Connection lost', 'Session ended', 'Offline mode', 'Network -1', 100);
      }
    },
  });

  // ── Auto-connect on mount ──────────────────────────────
  useEffect(() => {
    setIsLoggedIn(true);
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Phone connection tracking ──────────────────────────
  useEffect(() => {
    if (phoneConnected && phoneDevice) {
      addTimeline('PHONE_CONNECTED', `${phoneDevice.device_name} linked`, 'relay');
      addLog('System', 'Phone Connected', `Device: ${phoneDevice.device_name}`, 'Sensor stream active', 'Cross-device link established', 'Network +1', 100);
    }
  }, [phoneConnected, phoneDevice, addTimeline, addLog]);

  // ── Process incoming WS messages ────────────────────────
  useEffect(() => {
    if (!lastMessage) return;

    const event = lastMessage as WebSocketEvent<any>;
    const eventType = event.event;

    switch (eventType) {
      case 'COGNITIVE_STATE_COMMITTED': {
        const rawState = event.payload?.state || 'FLOW';
        const targetState = normalizeCognitiveState(rawState);
        const conf = typeof event.payload?.confidence === 'number'
          ? (event.payload.confidence > 1 ? event.payload.confidence / 100 : event.payload.confidence)
          : 0.94;
        const sourceDev = event.payload?.source_device || event.payload?.device_name || 'mobile';
        const prevState = cognitiveState;

        setCognitiveState(targetState);
        setConfidence(conf);
        setStateSource(sourceDev);
        setStateUpdatedAt(Date.now());
        setIsApexEnabled(true);

        addTimeline('STATE_TRANSITION', `${prevState} → ${targetState} (${sourceDev})`, sourceDev);
        addLog(
          'State Agent',
          `Cognitive event: ${targetState}`,
          event.payload?.reason || `Triggered by ${sourceDev}`,
          `Transition: ${prevState} → ${targetState}`,
          'State committed to workspace context',
          `Confidence: ${Math.round(conf * 100)}%`,
          Math.round(conf * 100)
        );

        // Notify relay of desktop state change
        sendMessage('DESKTOP_STATE_CHANGED', {
          state: targetState,
          previousState: prevState,
          source_device: 'desktop',
          timestamp: Date.now(),
        });

        // Trigger sculptor
        executeSculptorAction(targetState, sendMessage);
        break;
      }

      case 'STATE_TRANSITION': {
        const { state, confidence: conf, source_device } = event.payload;
        const targetState = normalizeCognitiveState(state);
        const prevState = cognitiveState;
        setCognitiveState(targetState);
        setConfidence(conf ?? 0.85);
        setStateSource(source_device || 'unknown');
        setStateUpdatedAt(Date.now());
        setIsApexEnabled(true);

        addTimeline('STATE_TRANSITION', `${prevState} → ${targetState}`, source_device || 'unknown');
        addLog('State Agent', `State transition detected`, `Source: ${source_device}`, `${prevState} → ${targetState}`, 'Cognitive state updated', `Confidence: ${Math.round((conf ?? 0.85) * 100)}%`, Math.round((conf ?? 0.85) * 100));

        // Trigger sculptor
        if (targetState !== prevState) {
          executeSculptorAction(targetState, sendMessage);
        }
        break;
      }

      case 'COGNITIVE_STATE_REALTIME': {
        const payload = event.payload;
        if (payload.source_device === 'mobile' || payload.device_source === 'iqoo-mobile-client') {
          const distScore = payload.distractionScore || 0;
          let newState: CognitiveState = 'Flow';
          if (distScore > 75) newState = 'Overloaded';
          else if (distScore > 50) newState = 'Distracted';
          else if ((payload.fatigueScore || 0) > 60) newState = 'Fatigued';

          const prevState = cognitiveState;
          if (prevState !== newState) {
            setCognitiveState(newState);
            setStateSource('mobile');
            setStateUpdatedAt(Date.now());
            addTimeline('STATE_FROM_PHONE', `${prevState} → ${newState} (distraction: ${distScore})`, 'mobile');

            // Trigger sculptor
            executeSculptorAction(newState, sendMessage);
          }

          const newConf = (payload.flowConfidence || 0) / 100;
          setConfidence(prev => Math.abs(prev - newConf) > 0.05 ? newConf : prev);

          setMobileTelemetry({
            accelX: payload.accelX ?? 0,
            accelY: payload.accelY ?? 0,
            accelZ: payload.accelZ ?? 0,
            touchBurstCount: payload.touchBurstCount ?? 0,
            backgroundTransitions: payload.backgroundTransitions ?? 0,
            distractionScore: payload.distractionScore ?? 0,
            fatigueScore: payload.fatigueScore ?? 0,
          });
        }
        break;
      }

      case 'ML_INFERENCE_RESULT': {
        const { state, flowConfidence, inference_source } = event.payload;
        const prevState = cognitiveState;
        if (prevState !== state) {
          setCognitiveState(state);
          setStateSource(`relay_ml (${inference_source})`);
          setStateUpdatedAt(Date.now());
          addTimeline('ML_INFERENCE', `${prevState} → ${state} via ${inference_source}`, 'relay');
          executeSculptorAction(state, sendMessage);
        }
        if (flowConfidence) {
          setConfidence(flowConfidence / 100);
        }
        break;
      }

      case 'DEVICE_CONNECTED': {
        const dev = event.payload;
        addTimeline('DEVICE_CONNECTED', `${dev.device_name} (${dev.device_type})`, 'relay');
        if (dev.device_type === 'mobile') {
          setIsApexEnabled(true);
          addLog('System', 'Phone Paired', `${dev.device_name} connected`, 'Sensor bridge active', 'Cross-device link live', 'Network +1', 100);
        }
        break;
      }

      case 'DEVICE_DISCONNECTED': {
        const dev = event.payload;
        addTimeline('DEVICE_DISCONNECTED', `${dev.device_name} (${dev.device_type})`, 'relay');
        if (dev.device_type === 'mobile') {
          addLog('System', 'Phone Disconnected', `${dev.device_name} lost`, 'Sensor stream ended', 'Single-device mode', 'Network -1', 100);
        }
        break;
      }

      case 'TOGGLE_APEX': {
        if (typeof event.payload === 'boolean') {
          setIsApexEnabled(event.payload);
        } else {
          setIsApexEnabled(prev => !prev);
        }
        break;
      }

      case 'COMPUTE_ACTIVE': {
        setActiveExecution(event.payload);
        setIsApexEnabled(true);
        addTimeline('COMPUTE_ACTIVE', `${event.payload?.agentType} processing`, event.payload?.source || 'relay');
        break;
      }

      case 'COMPUTE_COMPLETE': {
        setActiveExecution(event.payload);
        addTimeline('COMPUTE_COMPLETE', `${event.payload?.agentType} done`, 'relay');
        setTimeout(() => setActiveExecution(null), 10000);
        break;
      }

      case 'QUICK_CAPTURE': {
        const { text } = event.payload;
        addTimeline('QUICK_CAPTURE', `"${text}"`, 'mobile');
        addLog('Environment Sculptor', 'Quick capture from phone', `Thought synced: "${text}"`, 'Saved to scratchpad', 'Phone flow unblocked', 'Flow +15', 95);
        break;
      }

      case 'HELP_REQUEST': {
        addTimeline('HELP_REQUEST', 'Student stuck — requesting Socratic support', 'mobile');
        addLog('Socratic Challenger', 'Help requested from phone', 'Student stuck on current task', 'Initiating Socratic Support', 'Retrieving context', 'Recovery +25', 100);

        setActiveExecution({
          agentType: "Socratic Challenger",
          status: "Processing",
          inputData: "Student needs help"
        });

        generateSocraticSupport("CS-4120 Compilers Parsing Algorithms").then((response) => {
          setActiveExecution({
            agentType: "Socratic Challenger",
            status: "Complete",
            inputData: "CS-4120 Compilers",
            result: { response }
          });
          addTimeline('SOCRATIC_RESPONSE', 'LLM response received', 'relay');
          setTimeout(() => setActiveExecution(null), 15000);
        });
        break;
      }

      case 'SHOW_DEBRIEF': {
        setShowDebrief(true);
        break;
      }

      case 'DEMO_SYNC': {
        setLastDemoSync(event.payload);
        break;
      }

      case 'DEMO_START': {
        runDemoSequence();
        setIsApexEnabled(true);
        break;
      }

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]);

  // ── Demo sequence (simplified — uses real events now) ──
  const runDemoSequence = useCallback(() => {
    // The demo now triggers state transitions that go through the real relay pipeline
    addTimeline('DEMO_START', 'Controlled demo sequence initiated', 'desktop');
    setShowPhoneOverlay(true);
    setTimeout(() => setShowPhoneOverlay(false), 1500);

    // Note: In production, demo controls on the PHONE should send real events through the pipeline.
    // This local fallback exists only when phone is not connected.
    if (!phoneConnected) {
      // Simulate locally if no phone
      setCognitiveState('Distracted');
      setStateSource('demo');
      setStateUpdatedAt(Date.now());
      addTimeline('STATE_TRANSITION', 'Flow → Distracted (demo)', 'demo');
      executeSculptorAction('Distracted', sendMessage);

      setTimeout(() => {
        setCognitiveState('Flow');
        setStateSource('demo');
        setStateUpdatedAt(Date.now());
        addTimeline('STATE_TRANSITION', 'Distracted → Flow (demo)', 'demo');
        executeSculptorAction('Flow', sendMessage);
      }, 10000);
    }
  }, [phoneConnected, addTimeline, executeSculptorAction, sendMessage]);

  const { telemetry, interpreted, setActiveApp } = useTelemetry(cognitiveState, {});

  // ── Auth ────────────────────────────────────────────────
  const login = useCallback((_token?: string) => {
    setIsLoggedIn(true);
    connect();
  }, [connect]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    disconnect();
  }, [disconnect]);

  // ── Memoised context value ──────────────────────────────
  const value = useMemo<AppContextValue>(
    () => ({
      cognitiveState, setCognitiveState,
      confidence, stateSource, stateUpdatedAt,
      adaptiveMode, setAdaptiveMode,
      isOptimizing, triggerOptimization,
      sculptorAction,
      logs, addLog,
      networkLogs, addNetworkLog,
      timeline,
      connectionStatus, isConnected, sessionId, latencyMs, lastHeartbeat,
      phoneConnected, phoneDeviceName: phoneDevice?.device_name ?? null,
      isLoggedIn, login, logout,
      telemetry, interpreted, setActiveApp,
      showDebrief, setShowDebrief,
      isApexEnabled, setIsApexEnabled,
      activeExecution,
      mobileTelemetry,
      lastDemoSync,
      runDemoSequence, showPhoneOverlay,
    }),
    [
      cognitiveState, confidence, stateSource, stateUpdatedAt,
      adaptiveMode, isOptimizing, triggerOptimization,
      sculptorAction,
      logs, addLog,
      networkLogs, addNetworkLog,
      timeline,
      connectionStatus, isConnected, sessionId, latencyMs, lastHeartbeat,
      phoneConnected, phoneDevice,
      isLoggedIn, login, logout,
      telemetry, interpreted, setActiveApp,
      showDebrief, isApexEnabled,
      activeExecution, mobileTelemetry,
      lastDemoSync,
      runDemoSequence, showPhoneOverlay,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
