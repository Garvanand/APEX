import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

// Import Sidebar component
import Sidebar from "./components/Sidebar";
import CommandPalette, { commandPaletteEmitter } from "./components/CommandPalette";
import OptimizationVisualizer from "./components/OptimizationVisualizer";
import { Smartphone } from "lucide-react";

import AdaptiveWorkspace from "./components/AdaptiveWorkspace";

// Import remaining separate pages
import SocraticPage from "./pages/SocraticPage";
import SystemIntelligencePage from "./pages/SystemIntelligencePage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";
import { DemoRunner, demoRunnerEmitter } from "./demo/DemoRunner";

import { useAppContext } from "./context/AppContext";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("workspace");
  const { isLoggedIn, login, cognitiveState, isOptimizing, showPhoneOverlay } = useAppContext();
  const [tokenInput, setTokenInput] = useState("");

  React.useEffect(() => {
    const handleForceWorkspace = () => setActiveTab("workspace");
    demoRunnerEmitter.addEventListener("force_workspace", handleForceWorkspace);
    return () => demoRunnerEmitter.removeEventListener("force_workspace", handleForceWorkspace);
  }, []);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    login(tokenInput || undefined);
  };

  // Determine background based on cognitive state
  const bgMap = {
    Flow: "#0A0D0B", // Slightly brighter, emerald undertone
    Distracted: "#0F0E0A", // Subtle amber/yellow undertone
    Fatigued: "#0A0B12", // Cooler palette
    Overloaded: "#120A0A", // Emergency red undertone
  };

  return (
    <motion.div 
      className="flex h-screen w-screen overflow-hidden text-primary-text font-sans"
      animate={{ backgroundColor: bgMap[cognitiveState] }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCommandPalette={() => commandPaletteEmitter.dispatchEvent(new Event("open"))}
      />

      {/* Main Execution Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Workspace status bar */}
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4 text-xs font-semibold text-secondary-text">
            <span>Workspace: CS-4120 Compilers</span>
          </div>
          
          {/* Auth indicator */}
          {!isLoggedIn ? (
            <form onSubmit={handleConnect} className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="JWT Access Token..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="bg-secondary-surface border border-white/5 px-2.5 py-1.5 rounded-lg text-[10px] text-white focus:outline-none focus:border-accent/40 w-44 font-mono transition-colors"
              />
              <button 
                type="submit" 
                className="px-3 py-1.5 bg-white text-black font-semibold text-[10px] rounded-lg hover:bg-white/90 transition-colors"
              >
                Connect Server
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-[10px] text-secondary-text uppercase font-mono tracking-wider">Tauri Client Connected</span>
            </div>
          )}
        </header>

        {/* Dynamic page container */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "workspace" && <AdaptiveWorkspace />}
          {activeTab === "intelligence" && <SystemIntelligencePage />}
          {activeTab === "socratic" && <SocraticPage />}
          {activeTab === "insights" && <InsightsPage />}
          {activeTab === "settings" && <SettingsPage />}
        </div>

      </main>

      {/* Global Modals */}
      <AnimatePresence>
        {isOptimizing && <OptimizationVisualizer />}
        
        {showPhoneOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div 
                className="w-16 h-32 border-2 border-white/20 rounded-2xl flex items-center justify-center relative overflow-hidden"
                animate={{ boxShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 40px rgba(255,255,255,0.2)", "0px 0px 0px rgba(255,255,255,0)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Smartphone className="w-8 h-8 text-white/50" />
                <motion.div 
                  className="absolute bottom-0 w-full bg-accent/20"
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1.5, ease: "linear" }}
                />
              </motion.div>
              <div className="text-center">
                <div className="text-xs font-mono text-secondary-text uppercase tracking-widest mb-2">iQOO Bridge</div>
                <div className="text-xl font-bold text-white">Transmitting Biometrics...</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <CommandPalette onNavigate={setActiveTab} />
      <DemoRunner />
    </motion.div>
  );
}
