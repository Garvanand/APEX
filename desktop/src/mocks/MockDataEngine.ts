import { WebSocketEvent } from '../types';

type MessageListener = (event: MessageEvent) => void;

class MockDataEngine {
  private listeners: Set<MessageListener> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;
  private isRunning: boolean = false;

  private states = ["Flow", "Distracted", "Fatigued", "Overloaded"];
  private tickCount = 0;

  public subscribe(listener: MessageListener) {
    this.listeners.add(listener);
  }

  public unsubscribe(listener: MessageListener) {
    this.listeners.delete(listener);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => this.tick(), 5000); // Send mock event every 5s
  }

  public stop() {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = false;
  }

  public emit(event: WebSocketEvent) {
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(event)
    });
    this.listeners.forEach(l => l(messageEvent));
  }

  private tick() {
    this.tickCount++;

    // Randomly emit a STATE_TRANSITION or an AGENT_LOG
    if (this.tickCount % 4 === 0) {
      // Change cognitive state
      const newState = this.states[Math.floor(Math.random() * this.states.length)];
      this.emit({
        event: "STATE_TRANSITION",
        payload: {
          state: newState,
          confidence: Math.floor(Math.random() * 30 + 70),
          attention_stability: "Fluctuating",
          focus_trend: "Declining",
          cognitive_load: "High"
        }
      });
    } else if (this.tickCount % 3 === 0) {
      this.emit({
        event: "AGENT_ACTION",
        payload: {
          agent: "Peer Radar",
          action: "Suppressed 3 incoming Discord messages.",
          desc: "Flow preserved. No context switch required.",
          target: "System DND"
        }
      });
    } else if (this.tickCount % 5 === 0) {
      this.emit({
        event: "AGENT_ACTION",
        payload: {
          agent: "Deadline Sentinel",
          action: "Detected CS-4120 Compiler assignment due in 4 hours.",
          desc: "Urgency raised to 85%. Buffer margin depleted.",
          target: "Workspace Core"
        }
      });
    } else if (this.tickCount % 7 === 0) {
      this.emit({
        event: "AGENT_ACTION",
        payload: {
          agent: "Environment Sculptor",
          action: "Closed 4 background tabs and enabled DND.",
          desc: "Flow confidence increased by 21%.",
          target: "Workspace Layer"
        }
      });
    }
  }

  // Force a specific event for stress testing
  public forceEmit(event: WebSocketEvent) {
    this.emit(event);
  }
}

export const mockEngine = new MockDataEngine();
