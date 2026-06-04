import { useEffect, useRef, useCallback } from 'react';
import { useDemoState } from './DemoStateStore';
import { DEMO_TIMELINE } from './DemoTimeline';
import { useAppContext } from '../context/AppContext';

export function useDemoController() {
  const { 
    isDemoPlaying, setIsDemoPlaying, 
    currentSceneId, setCurrentSceneId, 
    setSceneProgress, clearOverride,
    setOverride, setNarrationText
  } = useDemoState();
  const appContext = useAppContext();
  
  const startTimeRef = useRef<number | null>(null);
  const pauseTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  const getCurrentSceneIndex = useCallback(() => {
    if (!currentSceneId) return -1;
    return DEMO_TIMELINE.findIndex(s => s.id === currentSceneId);
  }, [currentSceneId]);

  const enterScene = useCallback((sceneIndex: number) => {
    if (sceneIndex < 0 || sceneIndex >= DEMO_TIMELINE.length) return;
    const scene = DEMO_TIMELINE[sceneIndex];
    setCurrentSceneId(scene.id);
    setSceneProgress(0);
    if (scene.narration.length > 0) {
      setNarrationText(scene.narration[0]);
    } else {
      setNarrationText(null);
    }
    
    // Call enter hook
    const demoCtx = { setOverride };
    scene.onEnter(appContext, demoCtx);
    
    // Start timing
    startTimeRef.current = performance.now();
  }, [appContext, setCurrentSceneId, setSceneProgress, setOverride, setNarrationText]);

  const tick = useCallback((time: number) => {
    if (!isDemoPlaying || !startTimeRef.current) return;
    
    const idx = getCurrentSceneIndex();
    if (idx === -1) return;
    
    const scene = DEMO_TIMELINE[idx];
    const elapsed = time - startTimeRef.current;
    let progress = elapsed / scene.durationMs;
    
    if (progress >= 1) {
      progress = 1;
      // move to next scene
      if (idx + 1 < DEMO_TIMELINE.length) {
        enterScene(idx + 1);
        requestRef.current = requestAnimationFrame(tick);
        return;
      } else {
        // End of demo
        setIsDemoPlaying(false);
        setCurrentSceneId(null);
        clearOverride();
        setNarrationText(null);
        return;
      }
    }
    
    setSceneProgress(progress);
    
    // Update narration timing
    if (scene.narration.length > 1) {
      const step = 1 / scene.narration.length;
      const narrationIdx = Math.floor(progress / step);
      const text = scene.narration[Math.min(narrationIdx, scene.narration.length - 1)];
      setNarrationText(text);
    }
    
    if (scene.onUpdate) {
      const demoCtx = { setOverride };
      scene.onUpdate(progress, appContext, demoCtx);
    }
    
    requestRef.current = requestAnimationFrame(tick);
  }, [isDemoPlaying, getCurrentSceneIndex, enterScene, setSceneProgress, setNarrationText, setOverride, appContext, setIsDemoPlaying, clearOverride, setCurrentSceneId]);

  useEffect(() => {
    if (isDemoPlaying) {
      if (pauseTimeRef.current && startTimeRef.current) {
        // Resume
        const pausedDuration = performance.now() - pauseTimeRef.current;
        startTimeRef.current += pausedDuration;
      } else if (!startTimeRef.current) {
        // Start from beginning
        clearOverride();
        enterScene(0);
      }
      requestRef.current = requestAnimationFrame(tick);
    } else {
      if (startTimeRef.current) {
        pauseTimeRef.current = performance.now();
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isDemoPlaying, tick, enterScene, clearOverride]);

  const play = useCallback(() => setIsDemoPlaying(true), [setIsDemoPlaying]);
  const pause = useCallback(() => setIsDemoPlaying(false), [setIsDemoPlaying]);
  
  const stop = useCallback(() => {
    setIsDemoPlaying(false);
    setCurrentSceneId(null);
    startTimeRef.current = null;
    pauseTimeRef.current = null;
    clearOverride();
    setNarrationText(null);
  }, [setIsDemoPlaying, setCurrentSceneId, clearOverride, setNarrationText]);

  const replay = useCallback(() => {
    stop();
    // small timeout to allow state clear to flush before restarting
    setTimeout(() => {
      play();
    }, 50);
  }, [stop, play]);
  
  const skipTo = useCallback((sceneId: number) => {
    const idx = DEMO_TIMELINE.findIndex(s => s.id === sceneId);
    if (idx !== -1) {
      enterScene(idx);
    }
  }, [enterScene]);

  return { play, pause, stop, replay, skipTo };
}
