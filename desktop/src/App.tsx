import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

// Import Sidebar component
import Sidebar from "./components/Sidebar";
import CommandPalette, { commandPaletteEmitter } from "./components/CommandPalette";
import OptimizationVisualizer from "./components/OptimizationVisualizer";
import { Smartphone } from "lucide-react";

import AdaptiveWorkspace from "./components/AdaptiveWorkspace";
import { DevicePairingModal } from "./components/DevicePairingModal";
import GlobalExecutiveHeader from "./components/GlobalExecutiveHeader";
import GlobalInterventionFeed from "./components/GlobalInterventionFeed";

// Import remaining separate pages
import SocraticPage from "./pages/SocraticPage";
import SystemIntelligencePage from "./pages/SystemIntelligencePage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";
import { DemoRunner, demoRunnerEmitter } from "./demo/DemoRunner";

import { useAppContext } from "./context/AppContext";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("workspace");
  const { isLoggedIn, login, cognitiveState, isOptimizing, showPhoneOverlay, isLocalMode } = useAppContext();
  const [tokenInput, setTokenInput] = useState("");
  const [showPairing, setShowPairing] = useState(false);

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
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-primary-text font-sans bg-[#0A0D0B]">
      
      {/* 1. Global Executive Header (Full Width) */}
      <GlobalExecutiveHeader />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 2. Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          onCommandPalette={() => commandPaletteEmitter.dispatchEvent(new Event("open"))}
        />

        {/* 3. Main Execution Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Dynamic page container */}
          <div className="flex-1 overflow-y-auto p-8 relative">
            {activeTab === "workspace" && <AdaptiveWorkspace />}
            {activeTab === "intelligence" && <SystemIntelligencePage />}
            {activeTab === "socratic" && <SocraticPage />}
            {activeTab === "insights" && <InsightsPage />}
            {activeTab === "settings" && <SettingsPage />}
          </div>

        </main>

        {/* 4. Global Intervention Feed (Right Rail) */}
        <GlobalInterventionFeed activeTab={activeTab} />
      </div>

      {/* Global Modals */}
      <AnimatePresence>
        {showPairing && (
          <DevicePairingModal 
            onClose={() => setShowPairing(false)} 
            onPaired={(deviceInfo) => {
              console.log("Device paired:", deviceInfo);
              setShowPairing(false);
            }} 
          />
        )}
        
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
    </div>
  );
}
