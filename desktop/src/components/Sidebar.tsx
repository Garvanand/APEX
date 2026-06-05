import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Cpu, Sparkles, LayoutDashboard
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { HardwareAdvantageWidget } from "./HardwareAdvantageWidget";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCommandPalette: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onCommandPalette,
}: SidebarProps) {
  const { isConnected, isLoggedIn, cognitiveState, runDemoSequence } = useAppContext();
  const isFlow = cognitiveState === "Flow";

  const NAV_ITEMS: NavItem[] = [
    { id: "workspace", label: "Workspace", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "intelligence", label: "Focus Engine", icon: <Cpu className="w-4 h-4" /> },
    { id: "insights", label: "Journey", icon: <Sparkles className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  const handleKeyNav = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Map keys 1-9, 0, - to nav items
      let idx = -1;
      if (e.key >= "1" && e.key <= "9") {
        idx = parseInt(e.key) - 1;
      } else if (e.key === "0") {
        idx = 9;
      } else if (e.key === "-") {
        idx = 10;
      }
      
      if (idx >= 0 && idx < NAV_ITEMS.length && !e.metaKey && !e.ctrlKey) {
        onTabChange(NAV_ITEMS[idx].id);
      }
    },
    [onTabChange, NAV_ITEMS.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyNav);
    return () => window.removeEventListener("keydown", handleKeyNav);
  }, [handleKeyNav]);

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isFlow ? 72 : 256,
        borderColor: isFlow ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)"
      }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-secondary-surface border-r flex flex-col justify-between h-[100vh] shrink-0 select-none overflow-hidden"
    >
      <div className="flex flex-col pt-4 overflow-hidden h-full">
        
        {/* Brand Header */}
        <div className={`px-6 pb-4 border-b border-white/5 flex items-center ${isFlow ? "justify-center px-0" : "justify-between"}`}>
          <div className="flex items-center gap-2" title="APEX Cognitive OS">
            <div className="w-5 h-5 bg-accent rounded flex items-center justify-center">
              <span className="text-[10px] text-black font-black">A</span>
            </div>
            <span className="text-sm font-bold text-white tracking-wider">APEX</span>
          </div>
          
          <AnimatePresence>
            {!isFlow && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-[9px] font-mono text-secondary-text uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded whitespace-nowrap overflow-hidden"
              >
                Execution Env
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Command palette sum */}
        <button 
          onClick={onCommandPalette}
          className={`mx-4 mt-4 mb-2 flex items-center px-3 py-2 bg-black/40 hover:bg-black/60 border border-white/5 rounded-lg text-xs text-secondary-text transition-colors ${isFlow ? "justify-center" : "justify-between text-left"}`}
          title="Command Palette (⌘K)"
        >
          <span className="flex items-center gap-2">
            <span className="font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-white/55">⌘K</span>
            {!isFlow && <span className="whitespace-nowrap">Open Command Palette</span>}
          </span>
        </button>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 scrollbar-thin overflow-x-hidden">
          {NAV_ITEMS.map((item, i) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={isFlow ? item.label : undefined}
                className={`w-full flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-all ${isFlow ? "justify-center" : "justify-between"} ${
                  isActive 
                    ? "bg-white/5 text-white" 
                    : "text-secondary-text hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? "text-accent shrink-0" : "text-white/30 shrink-0"}>{item.icon}</span>
                  {!isFlow && <span className="whitespace-nowrap">{item.label}</span>}
                </div>
                {!isFlow && <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{i === 9 ? "0" : i === 10 ? "-" : i + 1}</span>}
              </button>
            );
          })}
          
          <AnimatePresence>
            {!isFlow && (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                <HardwareAdvantageWidget />
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>

      {/* Footer bar */}
      <div className={`p-4 border-t border-white/5 space-y-4 ${isFlow ? "px-2" : ""}`}>
        
        {/* Executive Demo Button */}
        <button
          onClick={() => {
            onTabChange("workspace");
            import('../demo/DemoRunner').then(m => {
              m.demoRunnerEmitter.dispatchEvent(new Event('play'));
            });
          }}
          className={`w-full relative overflow-hidden group flex items-center p-0.5 rounded-xl transition-all duration-300 ${isFlow ? 'justify-center' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent via-purple-500 to-accent bg-[length:200%_auto] animate-gradient opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className={`relative flex items-center justify-center gap-2 bg-[#0a0a0a] w-full rounded-[10px] py-2 px-3 transition-colors group-hover:bg-[#0a0a0a]/80 ${isFlow ? 'justify-center px-0' : ''}`}>
            <Sparkles className="w-4 h-4 text-white shrink-0" />
            {!isFlow && (
              <span className="text-xs font-bold text-white tracking-wide uppercase">Run APEX Story</span>
            )}
          </div>
        </button>

        <div className={`flex items-center gap-2 text-[10px] font-mono text-secondary-text ${isFlow ? "justify-center" : ""}`}>
          <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${isConnected ? "bg-success" : "bg-warning animate-pulse"}`} title={isConnected ? "Online" : "Offline"} />
          {!isFlow && <span>{isConnected ? "iQOO Office Sync Online" : "Sensor Bridge Offline"}</span>}
        </div>

        {isLoggedIn ? (
          <div className={`flex items-center gap-3 bg-black/20 border border-white/5 p-2 rounded-xl ${isFlow ? "justify-center" : ""}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
              GA
            </div>
            {!isFlow && (
              <div className="overflow-hidden">
                <span className="block text-xs font-semibold text-white truncate">Garv Anand</span>
                <span className="block text-[9px] text-secondary-text truncate">student@university.edu</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-[10px] text-center text-secondary-text py-2">
            {!isFlow && "Authenticate to connect server."}
          </div>
        )}
      </div>
    </motion.aside>
  );
}

// Small inline icon helper
function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3a6.8 6.8 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
