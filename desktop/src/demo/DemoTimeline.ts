export interface DemoScene {
  id: number;
  title: string;
  durationMs: number;
  narration: string[];
  onEnter: (appContext: any, demoContext: any) => void;
  onUpdate?: (progress: number, appContext: any, demoContext: any) => void;
}

export const DEMO_TIMELINE: DemoScene[] = [
  {
    id: 1,
    title: "Student 38 Minutes Before a Deadline",
    durationMs: 6000,
    narration: [
      "Students don't fail because they lack information.",
      "They fail because their tools are blind to context."
    ],
    onEnter: (ctx, demo) => {
      ctx.setAdaptiveMode("research");
      ctx.setCognitiveState("Distracted");
      demo.setOverride({ tabsOpen: 20, notifications: 12, deadlineMins: 38 });
    }
  },
  {
    id: 2,
    title: "State Agent Detects Cognitive State",
    durationMs: 8000,
    narration: [
      "APEX continuously interprets cognitive state through behavioral signals."
    ],
    onEnter: (ctx, demo) => {
      ctx.addLog("State Agent", "Distraction spike detected", "12 context switches in 4 minutes", "Flagged cognitive state", "State updated to DISTRACTED");
      demo.setOverride({ stateConfidence: 81 });
    }
  },
  {
    id: 3,
    title: "Deadline Sentinel Activates",
    durationMs: 8000,
    narration: [
      "Deadline Sentinel predicts execution risk before the student realizes it."
    ],
    onEnter: (ctx, demo) => {
      ctx.setAdaptiveMode("deadline");
      ctx.addLog("Deadline Sentinel", "Deadline approaching", "Assignment due in 38 minutes", "Calculated extreme risk", "Urgency score = 89");
      demo.setOverride({ urgencyScore: 89, completionProbability: 42, risk: "HIGH" });
    }
  },
  {
    id: 4,
    title: "Environment Sculptor Intervention",
    durationMs: 12000,
    narration: [
      "APEX does not recommend focus.",
      "It actively reshapes the environment."
    ],
    onEnter: (ctx) => {
      ctx.addLog("Environment Sculptor", "Intervention required", "High urgency + Distraction", "Closed 20 tabs & Enabled DND", "Resources loaded");
    },
    onUpdate: (p, ctx, demo) => {
      const tabs = Math.max(4, Math.floor(20 - (p * 16)));
      demo.setOverride({ tabsOpen: tabs, dndEnabled: true, workspaceOptimized: p > 0.8 });
    }
  },
  {
    id: 5,
    title: "Research Workspace Activated",
    durationMs: 8000,
    narration: [
      "Peer Radar surfaces useful academic context without breaking focus."
    ],
    onEnter: (ctx, demo) => {
      ctx.setAdaptiveMode("research");
      ctx.addLog("Peer Radar", "Relevant group chat message", "Found context matching current syllabus", "Surfaced key insight", "Saved 15 minutes of search");
      demo.setOverride({ showPeerRadar: true });
    }
  },
  {
    id: 6,
    title: "Writing Workspace Activated",
    durationMs: 8000,
    narration: [
      "APEX prepares the exact workspace needed for execution."
    ],
    onEnter: (ctx, demo) => {
      ctx.setAdaptiveMode("writing");
      demo.setOverride({ activeTask: "Compiler Construction Report" });
    }
  },
  {
    id: 7,
    title: "Socratic Challenger Engaged",
    durationMs: 10000,
    narration: [
      "APEX does not simply help students finish work.",
      "It helps them think better."
    ],
    onEnter: (ctx, demo) => {
      ctx.addLog("Socratic Challenger", "Thesis formulation", "Testing understanding", "Injected prompt: 'Defend this approach'", "Student engaged");
      demo.setOverride({ showSocraticChallenge: true });
    }
  },
  {
    id: 8,
    title: "Flow State Achieved",
    durationMs: 8000,
    narration: [
      "APEX continuously adapts until deep focus is restored."
    ],
    onEnter: (ctx, demo) => {
      ctx.setCognitiveState("Flow");
      ctx.setAdaptiveMode("flow");
      ctx.addLog("State Agent", "Biometrics normalized", "Focus sustained", "Locked state", "Flow State Restored");
    },
    onUpdate: (p, ctx, demo) => {
      const conf = Math.floor(61 + (p * 31));
      demo.setOverride({ stateConfidence: conf });
    }
  },
  {
    id: 9,
    title: "The Competitor Comparison",
    durationMs: 8000,
    narration: [
      "Let's look at the difference."
    ],
    onEnter: (ctx, demo) => {
      demo.setOverride({ showCompetitorComparison: true });
    }
  },
  {
    id: 10,
    title: "Outcome",
    durationMs: 10000,
    narration: [
      "APEX transforms devices into a cognitive operating system."
    ],
    onEnter: (ctx, demo) => {
    },
    onUpdate: (p, ctx, demo) => {
      const risk = Math.floor(89 - (p * 57));
      const prog = Math.floor(28 + (p * 58));
      demo.setOverride({ finalRisk: risk, finalProgress: prog });
    }
  },
  {
    id: 11,
    title: "Final Screen",
    durationMs: 8000,
    narration: [],
    onEnter: (ctx, demo) => {
      demo.setOverride({ showFinalScreen: true, showCompetitorComparison: false });
    }
  }
];
