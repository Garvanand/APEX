import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, GraduationCap, CheckCircle2, ChevronRight, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface Challenge {
  id: string;
  question: string;
  anchor: string;
  difficulty: "foundational" | "intermediate" | "advanced";
  score?: number;
  feedback?: string;
}

export default function SocraticPage() {
  const { addLog } = useAppContext();
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "ch-501",
      question: "If your recursive descent parser encounters a syntax mismatch, how does it reconcile without throwing a stack overflow or consuming excessive memory?",
      anchor: "Compiler Parsing Trees",
      difficulty: "advanced",
    },
    {
      id: "ch-502",
      question: "Contrast LL(1) and LR(1) grammar rules. Why is backtracking not supported in a standard recursive descent compiler structure?",
      anchor: "Grammar Rules",
      difficulty: "intermediate",
    },
    {
      id: "ch-503",
      question: "Explain the visual differences in animation spring physics between Flow and Overloaded states in the APEX visual language.",
      anchor: "APEX Motion Design",
      difficulty: "foundational",
    },
  ]);

  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);

  const activeChallenge = challenges[activeChallengeIndex];

  const handleSubmit = () => {
    if (answer.trim() === "") return;
    setIsEvaluating(true);
    setFeedback(null);
    setScore(null);

    // Mock API evaluation (simulating Groq LLM processing)
    setTimeout(() => {
      setIsEvaluating(false);
      const computedScore = 0.92;
      const computedFeedback = "Excellent analysis. Explaining panic-mode error recovery by skipping to a synchronizing token addresses parser stability. Your point on transforming tail recursion into iteration directly addresses how to avoid stack overflows under recursive grammars. Complies fully with compiler safety standards.";

      setScore(computedScore);
      setFeedback(computedFeedback);

      setChallenges(prev =>
        prev.map((ch, idx) =>
          idx === activeChallengeIndex
            ? { ...ch, score: computedScore, feedback: computedFeedback }
            : ch
        )
      );

      addLog("Socratic Challenger", `Response evaluated for challenge ${activeChallenge.id}. Score: ${computedScore * 100}%`, "User submitted answer", `Response evaluated for challenge ${activeChallenge.id}. Score: ${computedScore * 100}%`, "Challenge scored");
    }, 2000);
  };

  const handleNext = () => {
    setFeedback(null);
    setScore(null);
    setAnswer("");
    setActiveChallengeIndex(prev => (prev + 1) % challenges.length);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-accent" />
            Socratic Challenger
          </h1>
          <p className="text-xs text-secondary-text">Interactive conceptual checkpoints triggered autonomously when distractions are flagged.</p>
        </div>
        <span className="text-xs font-mono text-white/40">Challenge {activeChallengeIndex + 1} of {challenges.length}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Question and Answer */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Challenge Box */}
          <div className="bg-secondary-surface border border-white/5 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/30">ID: {activeChallenge.id}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                activeChallenge.difficulty === 'advanced' ? 'text-danger bg-danger/5 border border-danger/10' :
                activeChallenge.difficulty === 'intermediate' ? 'text-warning bg-warning/5 border border-warning/10' :
                'text-success bg-success/5 border border-success/10'
              }`}>
                {activeChallenge.difficulty}
              </span>
            </div>
            <div className="text-sm font-semibold text-white leading-relaxed">
              {activeChallenge.question}
            </div>
          </div>

          {/* Answer input */}
          <div className="space-y-3">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isEvaluating || feedback !== null}
              className="w-full bg-secondary-surface border border-white/5 rounded-xl p-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-accent/40 h-40 resize-none transition-colors"
              placeholder="Formulate your explanation from first principles..."
            />
            <div className="flex justify-between items-center text-[10px] text-secondary-text font-mono">
              <span>Topic Anchor: {activeChallenge.anchor}</span>
              <span>{answer.length} characters</span>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end">
            <AnimatePresence mode="wait">
              {feedback === null && !isEvaluating ? (
                <button
                  onClick={handleSubmit}
                  disabled={answer.trim() === ""}
                  className="px-6 py-2.5 bg-white hover:bg-white/95 disabled:opacity-40 text-black text-xs font-semibold rounded-lg transition-colors"
                >
                  Submit Explanation
                </button>
              ) : isEvaluating ? (
                <button
                  disabled
                  className="px-6 py-2.5 bg-white/5 border border-white/5 text-white/60 text-xs font-semibold rounded-lg flex items-center gap-2"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  Evaluating Response...
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-accent hover:bg-accent/80 text-black text-xs font-semibold rounded-lg transition-colors"
                >
                  Next Checkpoint
                </button>
              )}
            </AnimatePresence>
          </div>

          {/* Feedback Display */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-secondary-surface border border-white/5 rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                    Cognitive Feedback Analysis
                  </span>
                  {score !== null && (
                    <span className="text-xs font-mono font-bold text-success">
                      {Math.round(score * 100)}% Match
                    </span>
                  )}
                </div>
                <p className="text-xs text-secondary-text leading-relaxed font-sans">{feedback}</p>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                  <div className="space-y-1">
                    <span className="block text-[9px] uppercase font-bold text-white/35 font-mono tracking-wider">Concept Alignment</span>
                    <span className="block text-[11px] text-white">Parser stability & Tail recursion removal</span>
                  </div>
                  <button 
                    onClick={handleNext}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white text-[10px] font-semibold rounded border border-white/5 transition-colors"
                  >
                    Confirm & Proceed
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Side: References panel */}
        <div className="space-y-6">
          
          {/* Surfaced Concepts */}
          <div className="bg-secondary-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              Surfaced Concept Nodes
            </h3>
            <div className="space-y-4">
              {[
                { title: "Syntax Error Recovery Schemes", desc: "Panic-mode recovery discards input tokens until a synchronizing token (like semicolon or brace) is found. Phrase-level recovery replaces a prefix of the remaining input." },
                { title: "Parser Call Stack Optimization", desc: "Tail recursion optimization in parser methods avoids stack frame allocation by transforming recursion into iteration under LL(1) parse loops." }
              ].map((c, i) => (
                <div key={i} className="p-3.5 bg-black/20 border border-white/5 rounded-lg space-y-1">
                  <span className="block text-xs font-medium text-white">{c.title}</span>
                  <p className="block text-[11px] text-secondary-text leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Session checklist history */}
          <div className="bg-secondary-surface border border-white/5 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-accent" />
              Checkpoint History
            </h3>
            <div className="space-y-2">
              {challenges.map((ch, idx) => (
                <div 
                  key={ch.id}
                  onClick={() => setActiveChallengeIndex(idx)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    activeChallengeIndex === idx 
                      ? "bg-white/5 border-white/10" 
                      : "bg-black/20 border-white/5 hover:bg-black/35"
                  }`}
                >
                  <span className="text-[11px] text-secondary-text truncate pr-2 leading-none">{ch.question}</span>
                  <span className="text-[10px] font-mono text-accent shrink-0 font-semibold">
                    {ch.score ? `${Math.round(ch.score * 100)}%` : "--"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
