import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface DemoStateOverride {
  tabsOpen?: number;
  notifications?: number;
  deadlineMins?: number;
  stateConfidence?: number;
  urgencyScore?: number;
  completionProbability?: number;
  risk?: string;
  dndEnabled?: boolean;
  workspaceOptimized?: boolean;
  showPeerRadar?: boolean;
  activeTask?: string;
  showSocraticChallenge?: boolean;
  finalRisk?: number;
  finalProgress?: number;
  showFinalScreen?: boolean;
  showCompetitorComparison?: boolean;
  showBridgeAnimation?: boolean;
  bridgeMessage?: string;
}

interface DemoStateContextValue {
  isDemoPlaying: boolean;
  setIsDemoPlaying: (val: boolean) => void;
  currentSceneId: number | null;
  setCurrentSceneId: (val: number | null) => void;
  sceneProgress: number; // 0 to 1
  setSceneProgress: (val: number) => void;
  override: DemoStateOverride;
  setOverride: (overrides: Partial<DemoStateOverride>) => void;
  clearOverride: () => void;
  narrationText: string | null;
  setNarrationText: (text: string | null) => void;
}

const DemoStateContext = createContext<DemoStateContextValue | null>(null);

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [currentSceneId, setCurrentSceneId] = useState<number | null>(null);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [override, setOverrideState] = useState<DemoStateOverride>({});
  const [narrationText, setNarrationText] = useState<string | null>(null);

  const setOverride = useCallback((overrides: Partial<DemoStateOverride>) => {
    setOverrideState(prev => ({ ...prev, ...overrides }));
  }, []);

  const clearOverride = useCallback(() => {
    setOverrideState({});
  }, []);

  return (
    <DemoStateContext.Provider
      value={{
        isDemoPlaying, setIsDemoPlaying,
        currentSceneId, setCurrentSceneId,
        sceneProgress, setSceneProgress,
        override, setOverride, clearOverride,
        narrationText, setNarrationText
      }}
    >
      {children}
    </DemoStateContext.Provider>
  );
}

export function useDemoState() {
  const context = useContext(DemoStateContext);
  if (!context) {
    throw new Error('useDemoState must be used within a DemoStateProvider');
  }
  return context;
}
