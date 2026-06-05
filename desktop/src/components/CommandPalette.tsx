import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Command, Search, ChevronRight, 
  BookOpen, Brain, Target, 
  ShieldAlert, Sparkles, Activity,
  GraduationCap, Zap, Edit3
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
  shortcut?: string[];
  category: "Workspace Actions" | "Agent Tasks" | "Recovery & Diagnostics" | "System Pitch";
}

interface CommandPaletteProps {
  onNavigate: (tab: string) => void;
}

// Simple event emitter for triggering the command palette globally
export const commandPaletteEmitter = new EventTarget();

export default function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const { setCognitiveState, setAdaptiveMode, triggerOptimization, addLog, runDemoSequence } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const COMMANDS: CommandItem[] = [
    // --- Workspace Actions ---
    {
      id: "enter-flow-mode",
      title: "Enter Flow Mode",
      subtitle: "Establish deep focus environment & block distractions",
      icon: Target,
      shortcut: ["⌥", "⌘", "F"],
      category: "Workspace Actions",
      action: () => {
        setCognitiveState("Flow");
        triggerOptimization("flow");
        addLog("State Agent", "Deep Work Mode initiated", "Command palette execution", "Deep Work Mode initiated", "State enforced to Flow");
        onNavigate("workspace");
      }
    },
    {
      id: "prepare-research",
      title: "Prepare Research Workspace",
      subtitle: "Load citation library, PDFs, and notes canvas",
      icon: BookOpen,
      shortcut: ["⌥", "⌘", "R"],
      category: "Workspace Actions",
      action: () => {
        triggerOptimization("research");
        addLog("Environment Sculptor", "Loaded LL(k) Parser grammar source documents", "Research staging requested", "Loaded LL(k) Parser grammar source documents", "Academic workspace layout rendered");
        onNavigate("workspace");
      }
    },
    {
      id: "start-writing",
      title: "Start Writing Session",
      subtitle: "Activate zen composition workspace and markdown editor",
      icon: Edit3,
      shortcut: ["⌥", "⌘", "W"],
      category: "Workspace Actions",
      action: () => {
        triggerOptimization("writing");
        addLog("Environment Sculptor", "Active workspace changed to Zen Writing Mode", "User started writing session", "Active workspace changed to Zen Writing Mode", "Draft optimized for distraction-free typing");
        onNavigate("workspace");
      }
    },
    {
      id: "optimize-workspace",
      title: "Optimize Workspace",
      subtitle: "Environment Sculptor: close tabs and lock DND",
      icon: Zap,
      shortcut: ["⌥", "⌘", "O"],
      category: "Workspace Actions",
      action: () => {
        triggerOptimization("flow");
        addLog("Environment Sculptor", "Closed 14 unrelated browser tabs, locked social feeds", "Workspace optimization invoked", "Closed 14 unrelated browser tabs", "Memory freed & distractions eliminated");
        onNavigate("workspace");
      }
    },

    // --- Agent Tasks ---
    {
      id: "analyze-deadline-risk",
      title: "Analyze Deadline Risk",
      subtitle: "Deadline Sentinel: calculate risk vector & buffers",
      icon: ShieldAlert,
      shortcut: ["⌥", "⌘", "D"],
      category: "Agent Tasks",
      action: () => {
        setAdaptiveMode("deadline");
        addLog("Deadline Sentinel", "Parsing syllabus and canvas assignments", "Risk calculation requested", "Parsing syllabus and canvas assignments", "Calculated parser project urgency score: 89");
        onNavigate("workspace");
      }
    },
    {
      id: "challenge-understanding",
      title: "Challenge My Understanding",
      subtitle: "Socratic Challenger: launch concept verification check",
      icon: GraduationCap,
      shortcut: ["⌥", "⌘", "C"],
      category: "Agent Tasks",
      action: () => {
        addLog("Socratic Challenger", "Loaded conceptual challenge queue", "Verification check request", "Loaded conceptual challenge queue", "Socratic page rendered active");
        onNavigate("socratic");
      }
    },
    {
      id: "summarize-context",
      title: "Summarize Current Context",
      subtitle: "Peer Radar: synthesize discord & email feeds",
      icon: Sparkles,
      shortcut: ["⌥", "⌘", "S"],
      category: "Agent Tasks",
      action: () => {
        addLog("Peer Radar", "Aggregating 4 incoming academic study group notifications", "Context query received", "Aggregating 4 incoming academic study group notifications", "Synthesized study group thread highlights");
        onNavigate("workspace");
      }
    },

    // --- Recovery & Diagnostics ---
    {
      id: "generate-recovery",
      title: "Generate Recovery Plan",
      subtitle: "System triage for overloaded cognitive states",
      icon: Activity,
      shortcut: ["⌥", "⌘", "P"],
      category: "Recovery & Diagnostics",
      action: () => {
        setCognitiveState("Fatigued");
        setAdaptiveMode("recovery");
        addLog("Workspace Core", "Applying emergency recovery plan", "Triage protocol activated", "Applying emergency recovery plan", "Switched to calming grayscale color scheme");
        onNavigate("workspace");
      }
    },

    // --- System Pitch ---
    {
      id: "run-demo",
      title: "Run APEX Story",
      subtitle: "System: execute 60-90s judging presentation flow",
      icon: Sparkles,
      shortcut: ["⇧", "⌘", "D"],
      category: "System Pitch",
      action: () => {
        import('../demo/DemoRunner').then(m => {
          m.demoRunnerEmitter.dispatchEvent(new Event('play'));
        });
        onNavigate("workspace");
      }
    },
    {
      id: "run-stress-test",
      title: "Run Reliability Stress Test",
      subtitle: "System: execute 1000x loops of UI abuse testing",
      icon: ShieldAlert,
      shortcut: ["⇧", "⌘", "T"],
      category: "System Pitch",
      action: () => {
        import('../tests/StressTestRunner').then(m => {
          // Provide context methods required for the test
          m.stressTestRunner.run({
            setCognitiveState,
            triggerOptimization,
            disconnect: () => {}, // mock
            connect: () => {}, // mock
          });
        });
        onNavigate("workspace");
      }
    }
  ];

  const filteredCommands = query === "" 
    ? COMMANDS 
    : COMMANDS.filter(c => 
        c.title.toLowerCase().includes(query.toLowerCase()) || 
        c.category.toLowerCase().includes(query.toLowerCase()) ||
        c.subtitle?.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    commandPaletteEmitter.addEventListener("open", handleOpen);
    return () => commandPaletteEmitter.removeEventListener("open", handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && filteredCommands.length > 0) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Global triggers
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  // Global Keyboard Shortcuts (⌥⌘ + key)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Must have Cmd/Ctrl and Alt pressed
      const modifier = (e.metaKey || e.ctrlKey) && e.altKey;
      if (!modifier) return;

      const key = e.key.toLowerCase();
      if (key === 'f') {
        e.preventDefault();
        setCognitiveState("Flow");
        triggerOptimization("flow");
        addLog("State Agent", "Deep Work Mode initiated", "Global shortcut triggered", "Deep Work Mode initiated", "State enforced to Flow");
        onNavigate("workspace");
      } else if (key === 'r') {
        e.preventDefault();
        triggerOptimization("research");
        addLog("Environment Sculptor", "Loaded LL(k) Parser grammar source documents", "Global shortcut triggered", "Loaded LL(k) Parser grammar source documents", "Academic workspace layout rendered");
        onNavigate("workspace");
      } else if (key === 'w') {
        e.preventDefault();
        triggerOptimization("writing");
        addLog("Environment Sculptor", "Active workspace changed to Zen Writing Mode", "Global shortcut triggered", "Active workspace changed to Zen Writing Mode", "Draft optimized for distraction-free typing");
        onNavigate("workspace");
      } else if (key === 'd') {
        e.preventDefault();
        setAdaptiveMode("deadline");
        addLog("Deadline Sentinel", "Parsing syllabus and canvas assignments", "Global shortcut triggered", "Parsing syllabus and canvas assignments", "Calculated parser project urgency score: 89");
        onNavigate("workspace");
      } else if (key === 'p') {
        e.preventDefault();
        setCognitiveState("Fatigued");
        setAdaptiveMode("recovery");
        addLog("Workspace Core", "Applying emergency recovery plan", "Global shortcut triggered", "Applying emergency recovery plan", "Switched to calming grayscale color scheme");
        onNavigate("workspace");
      } else if (key === 'c') {
        e.preventDefault();
        addLog("Socratic Challenger", "Loaded conceptual challenge queue", "Global shortcut triggered", "Loaded conceptual challenge queue", "Socratic page rendered active");
        onNavigate("socratic");
      } else if (key === 's') {
        e.preventDefault();
        addLog("Peer Radar", "Aggregating incoming academic study group notifications", "Global shortcut triggered", "Aggregating incoming academic study group notifications", "Synthesized study group thread highlights");
        onNavigate("workspace");
      } else if (key === 'o') {
        e.preventDefault();
        triggerOptimization("flow");
        addLog("Environment Sculptor", "Closed 14 unrelated browser tabs, locked social feeds", "Global shortcut triggered", "Closed 14 unrelated browser tabs", "Memory freed & distractions eliminated");
        onNavigate("workspace");
      }
    };

    window.addEventListener("keydown", handleGlobalShortcuts);
    return () => window.removeEventListener("keydown", handleGlobalShortcuts);
  }, [setCognitiveState, triggerOptimization, addLog, setAdaptiveMode, onNavigate]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keep track of categories to render section headers properly
  let lastCategory = "";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-[12px] z-[100] flex items-start justify-center pt-[15vh]"
          onClick={() => setIsOpen(false)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="bg-[#0B0C0E]/95 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-5 py-4 border-b border-white/10 gap-3.5">
              <Search className="w-5 h-5 text-secondary-text" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-white/20 font-medium"
              />
              <div className="flex items-center gap-1.5 opacity-40">
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-white">ESC</span>
              </div>
            </div>

            {/* List Results */}
            <div className="max-h-[50vh] overflow-y-auto p-2.5 scrollbar-thin">
              {filteredCommands.length === 0 ? (
                <div className="py-12 text-center text-secondary-text/60 text-sm">
                  No matching commands found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCommands.map((cmd, idx) => {
                    const isSelected = selectedIndex === idx;
                    const Icon = cmd.icon;
                    const showHeader = cmd.category !== lastCategory;
                    if (showHeader) {
                      lastCategory = cmd.category;
                    }
                    
                    return (
                      <React.Fragment key={cmd.id}>
                        {showHeader && (
                          <div className="px-3.5 py-2 text-[10px] font-semibold text-secondary-text/50 uppercase tracking-widest bg-white/[0.01] rounded-md mb-1 mt-2 first:mt-0">
                            {cmd.category}
                          </div>
                        )}
                        <div 
                          className={`flex items-center justify-between py-3 rounded-xl cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-white/10 text-white border-l-2 border-accent pl-3.5 pr-4" 
                              : "hover:bg-white/5 text-white/90 pl-4 pr-4"
                          }`}
                          onClick={() => {
                            cmd.action();
                            setIsOpen(false);
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          <div className="flex items-center gap-3.5">
                            <Icon className={`w-4 h-4 transition-colors ${isSelected ? "text-accent" : "text-secondary-text"}`} />
                            <div className="flex flex-col">
                              <span className={`text-sm font-semibold transition-colors ${isSelected ? "text-white" : "text-white/80"}`}>
                                {cmd.title}
                              </span>
                              {cmd.subtitle && (
                                <span className={`text-[10px] mt-0.5 leading-none transition-colors ${isSelected ? "text-white/60" : "text-secondary-text/60"}`}>
                                  {cmd.subtitle}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {cmd.shortcut && (
                            <div className="flex items-center gap-1">
                              {cmd.shortcut.map(key => (
                                <span 
                                  key={key} 
                                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                                    isSelected 
                                      ? "bg-accent/20 text-accent border-accent/30" 
                                      : "bg-white/5 text-secondary-text border-white/10"
                                  }`}
                                >
                                  {key}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {isSelected && !cmd.shortcut && (
                            <ChevronRight className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-white/5 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3 text-[10px] text-secondary-text/50 font-mono">
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white/10 px-1 py-0.5 rounded text-white/80">↑</kbd>
                  <kbd className="bg-white/10 px-1 py-0.5 rounded text-white/80">↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">↵</kbd> Execute
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white/10 px-1 py-0.5 rounded text-white/80">⌥</kbd>
                  <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/80">⌘</kbd> Shortcut Modifier
                </span>
              </div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-accent/50 flex items-center gap-1.5">
                <Command className="w-3 h-3 text-accent" /> APEX COMMANDS
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
