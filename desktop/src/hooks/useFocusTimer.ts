import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { FocusSession } from '../types';

// ─────────────────────────────────────────────────────────────
// useFocusTimer — focus session lifecycle management
// ─────────────────────────────────────────────────────────────

export interface UseFocusTimerReturn {
  session: FocusSession | null;
  timeRemaining: number;
  progress: number; // 0–1
  formatTime: (seconds: number) => string;
  start: (task: string, durationSeconds: number) => void;
  pause: () => void;
  resume: () => void;
  abandon: () => void;
}

function generateId(): string {
  return `fs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function useFocusTimer(): UseFocusTimerReturn {
  const [session, setSession] = useState<FocusSession | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Tick logic ────────────────────────────────────────────
  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      setSession(prev => {
        if (!prev || prev.state !== 'active') return prev;

        const nextElapsed = prev.elapsed + 1;

        // Auto-complete when duration reached
        if (nextElapsed >= prev.duration) {
          return { ...prev, elapsed: prev.duration, state: 'completed' };
        }

        return { ...prev, elapsed: nextElapsed };
      });
    }, 1000);
  }, [clearTick]);

  // Stop interval when session completes/abandons
  useEffect(() => {
    if (session && (session.state === 'completed' || session.state === 'abandoned')) {
      clearTick();
    }
  }, [session?.state, clearTick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTick();
  }, [clearTick]);

  // ── Actions ───────────────────────────────────────────────

  const start = useCallback(
    (task: string, durationSeconds: number) => {
      clearTick();
      const newSession: FocusSession = {
        id: generateId(),
        task,
        startTime: Date.now(),
        duration: durationSeconds,
        elapsed: 0,
        state: 'active',
        breaksTaken: 0,
      };
      setSession(newSession);
      // Start ticking after session is set
      // We need to use setTimeout(0) so state is committed first
      setTimeout(() => {
        // Re-use startTick which sets up the interval
      }, 0);
      startTick();
    },
    [clearTick, startTick],
  );

  const pause = useCallback(() => {
    clearTick();
    setSession(prev => {
      if (!prev || prev.state !== 'active') return prev;
      return { ...prev, state: 'paused', breaksTaken: prev.breaksTaken + 1 };
    });
  }, [clearTick]);

  const resume = useCallback(() => {
    setSession(prev => {
      if (!prev || prev.state !== 'paused') return prev;
      return { ...prev, state: 'active' };
    });
    startTick();
  }, [startTick]);

  const abandon = useCallback(() => {
    clearTick();
    setSession(prev => {
      if (!prev) return prev;
      return { ...prev, state: 'abandoned' };
    });
  }, [clearTick]);

  // ── Derived state ─────────────────────────────────────────

  const timeRemaining = useMemo(() => {
    if (!session) return 0;
    return Math.max(0, session.duration - session.elapsed);
  }, [session]);

  const progress = useMemo(() => {
    if (!session || session.duration === 0) return 0;
    return Math.min(1, session.elapsed / session.duration);
  }, [session]);

  const formatTime = useCallback((seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    session,
    timeRemaining,
    progress,
    formatTime,
    start,
    pause,
    resume,
    abandon,
  };
}
