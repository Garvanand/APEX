import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppWindow, Bell, LayoutGrid, Activity, CheckCircle2, Shield, FileText, Target } from "lucide-react";

export default function OptimizationVisualizer() {
  const [phase, setPhase] = useState<"chaos" | "sweep" | "zen">("chaos");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("sweep"), 1000);
    const t2 = setTimeout(() => setPhase("zen"), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const chaosCards = [
    { id: "c1", icon: AppWindow, text: "20 Tabs Open", color: "text-danger" },
    { id: "c2", icon: Bell, text: "8 Unread Notifications", color: "text-warning" },
    { id: "c3", icon: LayoutGrid, text: "4 Unrelated Windows", color: "text-secondary-text" },
    { id: "c4", icon: Activity, text: "Context Switching: HIGH", color: "text-danger" },
  ];

  const zenCards = [
    { id: "z1", icon: AppWindow, text: "4 Tabs Open", color: "text-success" },
    { id: "z2", icon: Shield, text: "DND: Enabled", color: "text-accent" },
    { id: "z3", icon: FileText, text: "Resources: Loaded", color: "text-success" },
    { id: "z4", icon: Target, text: "Focus: Locked", color: "text-accent" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]/90 backdrop-blur-xl"
    >
      <div className="relative w-full max-w-4xl h-96 flex items-center justify-center">
        
        {/* Phase 1: Chaos */}
        <AnimatePresence>
          {phase === "chaos" && (
            <motion.div
              key="chaos-container"
              exit={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {chaosCards.map((card, i) => {
                const Icon = card.icon;
                const randomX = (Math.random() - 0.5) * 300;
                const randomY = (Math.random() - 0.5) * 200;
                const randomRot = (Math.random() - 0.5) * 40;
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.8, x: randomX * 2, y: randomY * 2 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      x: randomX, 
                      y: randomY, 
                      rotate: randomRot,
                      transition: { type: "spring", stiffness: 100, damping: 12, delay: i * 0.1 }
                    }}
                    className="absolute bg-[#121212] border border-white/10 rounded-xl p-4 shadow-2xl flex flex-col items-center gap-3 w-48"
                  >
                    <Icon className={`w-8 h-8 ${card.color} animate-pulse`} />
                    <span className="text-xs font-bold text-white text-center uppercase tracking-wider">{card.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2: Sweep (Environment Sculptor Laser) */}
        <AnimatePresence>
          {(phase === "sweep" || phase === "zen") && (
            <motion.div
              key="sweep-laser"
              initial={{ x: "-150%", opacity: 0 }}
              animate={{ x: "150%", opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            >
              <div className="w-1 h-full bg-accent shadow-[0_0_60px_20px_rgba(42,217,143,0.5)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 3: Zen */}
        <AnimatePresence>
          {phase === "zen" && (
            <motion.div
              key="zen-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, staggerChildren: 0.1 }}
              className="absolute inset-0 flex flex-wrap items-center justify-center gap-6"
            >
              {zenCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 150, delay: i * 0.1 }}
                    className="bg-[#0D1511] border border-accent/20 rounded-xl p-6 shadow-[0_0_30px_rgba(42,217,143,0.1)] flex items-center gap-4 w-64"
                  >
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wider">{card.text}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
      
      {/* Footer Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-12 flex flex-col items-center gap-2"
      >
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-accent font-bold">
          {phase === "chaos" ? "Analyzing Digital Entropy..." : phase === "sweep" ? "Environment Sculptor Active" : "Optimization Complete"}
        </span>
        <div className="h-1 w-48 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: phase === "zen" ? "100%" : phase === "sweep" ? "60%" : "20%" }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
