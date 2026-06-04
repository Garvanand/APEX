import { useState, useEffect, useCallback } from 'react';
import type { CognitiveState, TelemetryData } from '../types';

// ─────────────────────────────────────────────────────────────
// useTelemetry — state-aware biometric simulation
// ─────────────────────────────────────────────────────────────

/** Parameter boundaries per cognitive state. */
interface StateBounds {
  heartRate: [number, number];
  hrv: [number, number];
  blinkRate: [number, number];
  ambientDb: [number, number];
  heartRateJitter: number;
  hrvJitter: number;
  ambientDbJitter: number;
}

const STATE_BOUNDS: Record<CognitiveState, StateBounds> = {
  Flow: {
    heartRate: [65, 80],
    hrv: [50, 70],
    blinkRate: [10, 16],
    ambientDb: [30, 42],
    heartRateJitter: 2,
    hrvJitter: 3,
    ambientDbJitter: 1,
  },
  Distracted: {
    heartRate: [70, 85],
    hrv: [40, 60],
    blinkRate: [15, 22],
    ambientDb: [35, 50],
    heartRateJitter: 3,
    hrvJitter: 4,
    ambientDbJitter: 2,
  },
  Fatigued: {
    heartRate: [60, 70],
    hrv: [30, 45],
    blinkRate: [8, 14],
    ambientDb: [28, 38],
    heartRateJitter: 1,
    hrvJitter: 2,
    ambientDbJitter: 1,
  },
  Overloaded: {
    heartRate: [85, 105],
    hrv: [20, 38],
    blinkRate: [12, 18],
    ambientDb: [40, 58],
    heartRateJitter: 5,
    hrvJitter: 2,
    ambientDbJitter: 3,
  },
};

const INITIAL_TELEMETRY: TelemetryData = {
  heartRate: 72,
  hrv: 55,
  blinkRate: 12,
  activeApp: 'VS Code',
  ambientDb: 36,
  screenInteractionDensity: 0.5,
};

const UPDATE_INTERVAL_MS = 3000;

/** Clamp a value between min and max. */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Apply bounded random walk to a value. */
function jitter(current: number, amount: number, min: number, max: number): number {
  return clamp(current + (Math.random() - 0.5) * amount, min, max);
}

/** Step a discrete integer metric by ±1. */
function stepInt(current: number, min: number, max: number): number {
  return clamp(current + (Math.random() > 0.5 ? 1 : -1), min, max);
}

export interface UseTelemetryOptions {
  /** Override the simulation interval in ms. Default 3000. */
  intervalMs?: number;
  /** Initial active application label. */
  initialApp?: string;
  /** Demo mode manual override */
  demoOverride?: TelemetryData | null;
}

export interface InterpretedMetrics {
  attentionStability: "Optimal" | "Stable" | "Erratic" | "Critically Low";
  focusTrend: "Positive" | "Stable" | "Declining";
  contextSwitching: "Minimal" | "Acceptable" | "High" | "Frantic";
  cognitiveLoad: "Low" | "Optimal" | "High" | "Overloaded";
}

export interface UseTelemetryReturn {
  telemetry: TelemetryData;
  interpreted: InterpretedMetrics;
  setActiveApp: (app: string) => void;
}

export function useTelemetry(
  cognitiveState: CognitiveState,
  options: UseTelemetryOptions = {},
): UseTelemetryReturn {
  const { intervalMs = UPDATE_INTERVAL_MS, initialApp, demoOverride } = options;

  const [telemetry, setTelemetry] = useState<TelemetryData>(() => ({
    ...INITIAL_TELEMETRY,
    activeApp: initialApp ?? INITIAL_TELEMETRY.activeApp,
  }));

  const setActiveApp = useCallback((app: string) => {
    setTelemetry(prev => ({ ...prev, activeApp: app }));
  }, []);

  useEffect(() => {
    const bounds = STATE_BOUNDS[cognitiveState];

    const timer = setInterval(() => {
      setTelemetry(prev => ({
        heartRate: jitter(prev.heartRate, bounds.heartRateJitter, ...bounds.heartRate),
        hrv: jitter(prev.hrv, bounds.hrvJitter, ...bounds.hrv),
        blinkRate: stepInt(prev.blinkRate, ...bounds.blinkRate),
        activeApp: prev.activeApp,
        ambientDb: jitter(prev.ambientDb, bounds.ambientDbJitter, ...bounds.ambientDb),
        screenInteractionDensity: Math.random(),
      }));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [cognitiveState, intervalMs]);

  const getInterpretedMetrics = (data: TelemetryData): InterpretedMetrics => {
    return {
      attentionStability: data.hrv > 60 ? "Optimal" : data.hrv > 45 ? "Stable" : data.hrv > 30 ? "Erratic" : "Critically Low",
      focusTrend: cognitiveState === "Flow" ? "Positive" : cognitiveState === "Distracted" ? "Declining" : "Stable",
      contextSwitching: data.screenInteractionDensity < 0.3 ? "Minimal" : data.screenInteractionDensity < 0.6 ? "Acceptable" : data.screenInteractionDensity < 0.85 ? "High" : "Frantic",
      cognitiveLoad: data.heartRate > 95 ? "Overloaded" : data.heartRate > 80 ? "High" : data.heartRate > 65 ? "Optimal" : "Low",
    };
  };

  const finalTelemetry = demoOverride || telemetry;

  return { telemetry: finalTelemetry, interpreted: getInterpretedMetrics(finalTelemetry), setActiveApp };
}
