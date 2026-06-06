import React, { useEffect } from 'react';
import { useDemoController } from './DemoController';
import { DemoOverlay } from './DemoOverlay';
import { DemoPlaybackControls } from './DemoPlaybackControls';
import { DemoRehearsalOverlay } from './DemoRehearsalOverlay';
import { BridgeOverlay } from '../components/BridgeOverlay';

export const demoRunnerEmitter = new EventTarget();

export function DemoRunner() {
  const { play } = useDemoController();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        demoRunnerEmitter.dispatchEvent(new Event('force_workspace'));
        play();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handlePlayEvent = () => {
      demoRunnerEmitter.dispatchEvent(new Event('force_workspace'));
      play();
    };
    demoRunnerEmitter.addEventListener('play', handlePlayEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      demoRunnerEmitter.removeEventListener('play', handlePlayEvent);
    };
  }, [play]);

  return (
    <>
      <DemoOverlay />
      <BridgeOverlay />
      <DemoRehearsalOverlay />
      <DemoPlaybackControls />
    </>
  );
}
