// ─────────────────────────────────────────────────────────────
// APEX Shared Type Definitions
// ─────────────────────────────────────────────────────────────

/** The four cognitive states the State Agent classifies into. */
export type CognitiveState = 'Flow' | 'Distracted' | 'Fatigued' | 'Overloaded';

/** Urgency levels for deadline items. */
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

/** Difficulty tiers for Socratic challenges. */
export type DifficultyTier = 'foundational' | 'intermediate' | 'advanced';

/** Agent operational status. */
export type AgentStatus = 'active' | 'idle' | 'paused' | 'error';

/** Focus session lifecycle states. */
export type SessionState = 'active' | 'paused' | 'completed' | 'abandoned';

// ─── Data Models ──────────────────────────────────────────────

export interface AgentLog {
  id: string;
  time: string;
  agent: string;
  trigger: string;
  reason: string;
  action: string;
  outcome: string;
}

export interface ApprovalRequest {
  id: string;
  agent: string;
  action: string;
  desc: string;
  target: string;
}

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface DeadlineItem {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  urgency: UrgencyLevel;
  risk: number;
  estimatedHours: number;
  completionPercent: number;
  subtasks: SubTask[];
}

export interface SocraticChallenge {
  id: string;
  question: string;
  anchor: string;
  difficulty: DifficultyTier;
}

export interface TelemetryData {
  heartRate: number;
  hrv: number;
  blinkRate: number;
  activeApp: string;
  ambientDb: number;
  screenInteractionDensity: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  status: AgentStatus;
  latency: number;
  description: string;
  color: string;
  bgColor: string;
  lastAction: string;
  autonomyLevel: number; // 0–100
}

export interface FocusSession {
  id: string;
  task: string;
  startTime: number;
  duration: number; // target duration in seconds
  elapsed: number;
  state: SessionState;
  breaksTaken: number;
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  apps: string[];
  dndEnabled: boolean;
  blockedSites: string[];
}

// ─── WebSocket Event Payloads ─────────────────────────────────

export interface CognitiveStatePayload {
  state: CognitiveState;
  confidence_score: number;
}

export interface RawTelemetryPayload {
  device_source: string;
  heart_rate: number;
  hrv: number;
  blink_rate_per_min: number;
  screen_interaction_density: number;
  active_application: string;
  ambient_noise_db: number;
}

export interface WebSocketEvent<T = unknown> {
  event: string;
  payload: T;
}

// ─── Command Palette ──────────────────────────────────────────

export interface PaletteCommand {
  id: string;
  label: string;
  shortcut?: string;
  icon?: string;
  action: () => void;
  category: 'navigation' | 'state' | 'focus' | 'system' | 'debug';
  keywords?: string[];
}
