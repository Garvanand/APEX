import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Minus, Keyboard, Shuffle, Activity, Volume2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import type { CognitiveState } from "../types";

// ─── State Configuration ──────────────────────────────────────────────────────

type EvidenceStatus = "positive" | "neutral" | "negative";

interface StateConfig {
  label: string;
  sublabel: string;
  color: string;
  textColor: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  orbColors: [string, string];
  ringColor: string;
  evidence: {
    label: string;
    value: string;
    status: EvidenceStatus;
    icon: React.ElementType;
  }[];
}

const STATE_CONFIGS: Record<CognitiveState, StateConfig> = {
  Flow: {
    label: "FLOW",
    sublabel: "Deep Cognitive Engagement",
    color: "#00D26A",
    textColor: "text-emerald-400",
    glowColor: "rgba(0,210,106,0.18)",
    borderColor: "rgba(0,210,106,0.25)",
    bgGradient: "radial-gradient(ellipse at 30% 40%, rgba(0,210,106,0.07) 0%, transparent 60%)",
    orbColors: ["#00D26A", "#00A855"],
    ringColor: "rgba(0,210,106,0.35)",
    evidence: [
      { label: "Typing Consistency", value: "Stable", status: "positive", icon: Keyboard },
      { label: "Context Switching", value: "Low", status: "positive", icon: Shuffle },
      { label: "HRV Trend", value: "Positive", status: "positive", icon: Activity },
      { label: "Noise Environment", value: "Acceptable", status: "neutral", icon: Volume2 },
    ],
  },
  Distracted: {
    label: "DISTRACTED",
    sublabel: "Attention Fragmentation Detected",
    color: "#FFB800",
    textColor: "text-amber-400",
    glowColor: "rgba(255,184,0,0.15)",
    borderColor: "rgba(255,184,0,0.25)",
    bgGradient: "radial-gradient(ellipse at 30% 40%, rgba(255,184,0,0.07) 0%, transparent 60%)",
    orbColors: ["#FFB800", "#CC9000"],
    ringColor: "rgba(255,184,0,0.35)",
    evidence: [
      { label: "Typing Consistency", value: "Erratic", status: "negative", icon: Keyboard },
      { label: "Context Switching", value: "High", status: "negative", icon: Shuffle },
      { label: "HRV Trend", value: "Neutral", status: "neutral", icon: Activity },
      { label: "Noise Environment", value: "Elevated", status: "negative", icon: Volume2 },
    ],
  },
  Fatigued: {
    label: "FATIGUED",
    sublabel: "Cognitive Resource Depletion",
    color: "#818CF8",
    textColor: "text-indigo-400",
    glowColor: "rgba(129,140,248,0.15)",
    borderColor: "rgba(129,140,248,0.25)",
    bgGradient: "radial-gradient(ellipse at 30% 40%, rgba(129,140,248,0.07) 0%, transparent 60%)",
    orbColors: ["#818CF8", "#5C6BC0"],
    ringColor: "rgba(129,140,248,0.35)",
    evidence: [
      { label: "Typing Consistency", value: "Slowing", status: "negative", icon: Keyboard },
      { label: "Context Switching", value: "Very Low", status: "neutral", icon: Shuffle },
      { label: "HRV Trend", value: "Declining", status: "negative", icon: Activity },
      { label: "Noise Environment", value: "Acceptable", status: "positive", icon: Volume2 },
    ],
  },
  Overloaded: {
    label: "OVERLOADED",
    sublabel: "Stress Threshold Exceeded",
    color: "#FF4D4F",
    textColor: "text-red-400",
    glowColor: "rgba(255,77,79,0.18)",
    borderColor: "rgba(255,77,79,0.30)",
    bgGradient: "radial-gradient(ellipse at 30% 40%, rgba(255,77,79,0.08) 0%, transparent 60%)",
    orbColors: ["#FF4D4F", "#CC2B2D"],
    ringColor: "rgba(255,77,79,0.4)",
    evidence: [
      { label: "Typing Consistency", value: "Degraded", status: "negative", icon: Keyboard },
      { label: "Context Switching", value: "Critical", status: "negative", icon: Shuffle },
      { label: "HRV Trend", value: "Suppressed", status: "negative", icon: Activity },
      { label: "Noise Environment", value: "Disruptive", status: "negative", icon: Volume2 },
    ],
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function EvidenceStatusIcon({ status }: { status: EvidenceStatus }) {
  if (status === "positive") return <TrendingUp className="w-3 h-3" />;
  if (status === "negative") return <TrendingDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
}

const EVIDENCE_STATUS_COLORS: Record<EvidenceStatus, string> = {
  positive: "text-emerald-400",
  neutral: "text-[#A5A5A5]",
  negative: "text-red-400",
};

const EVIDENCE_VALUE_COLORS: Record<EvidenceStatus, string> = {
  positive: "text-white",
  neutral: "text-[#A5A5A5]",
  negative: "text-red-300",
};

// Confidence arc SVG
function ConfidenceArc({ confidence, color }: { confidence: number; color: string }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="absolute inset-0 m-auto" style={{ top: 0, left: 0 }}>
      {/* Track */}
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Progress */}
      <motion.circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ transformOrigin: "60px 60px", transform: "rotate(-90deg)" }}
        opacity={0.85}
      />
    </svg>
  );
}

// Animated ambient orb
function StateOrb({ orbColors, glowColor }: { orbColors: [string, string]; glowColor: string }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Main orb */}
      <motion.div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20"
        style={{ background: `radial-gradient(circle, ${orbColors[0]}, ${orbColors[1]})` }}
        animate={{
          scale: [1, 1.12, 0.96, 1.08, 1],
          opacity: [0.18, 0.24, 0.16, 0.22, 0.18],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary orb */}
      <motion.div
        className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-10"
        style={{ background: `radial-gradient(circle, ${orbColors[0]}, transparent)` }}
        animate={{
          scale: [1, 0.88, 1.1, 0.94, 1],
          opacity: [0.08, 0.14, 0.06, 0.12, 0.08],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </motion.div>
  );
}

// State transition particle burst
function TransitionBurst({ color }: { color: string }) {
  const particles = Array.from({ length: 8 }, (_, i) => i);
  return (
    <AnimatePresence>
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((i) => {
          const angle = (i / particles.length) * 360;
          const rad = (angle * Math.PI) / 180;
          const tx = Math.cos(rad) * 40;
          const ty = Math.sin(rad) * 40;
          return (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: color,
                top: "50%",
                left: "50%",
                marginTop: "-2px",
                marginLeft: "-2px",
              }}
              initial={{ opacity: 0.9, x: 0, y: 0, scale: 1 }}
              animate={{ opacity: 0, x: tx, y: ty, scale: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.03 }}
            />
          );
        })}
      </div>
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CognitiveStateEngine() {
  const { cognitiveState, confidence } = useAppContext();
  const config = STATE_CONFIGS[cognitiveState];
  const confidencePercent = Math.round(confidence * 100);
  const prevStateRef = useRef<CognitiveState | null>(null);
  const stateChanged = prevStateRef.current !== null && prevStateRef.current !== cognitiveState;
  prevStateRef.current = cognitiveState;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border"
      style={{
        background: `#121212`,
        borderColor: config.borderColor,
        transition: "border-color 0.8s ease",
      }}
    >
      {/* Background gradient wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: config.bgGradient,
          transition: "background 0.9s ease",
        }}
      />

      {/* Animated ambient orbs — swap per state */}
      <AnimatePresence mode="wait">
        <StateOrb key={cognitiveState} orbColors={config.orbColors} glowColor={config.glowColor} />
      </AnimatePresence>

      {/* Particle burst on state change */}
      {stateChanged && <TransitionBurst color={config.color} />}

      <div className="relative z-10 p-6 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${config.color}18`, border: `1px solid ${config.color}30` }}
              animate={{ boxShadow: [`0 0 0px ${config.color}00`, `0 0 12px ${config.color}40`, `0 0 0px ${config.color}00`] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="w-3.5 h-3.5" style={{ color: config.color }} />
            </motion.div>
            <span className="text-xs font-semibold text-[#A5A5A5] uppercase tracking-widest">
              Cognitive State Engine
            </span>
          </div>

          {/* Live pulse indicator */}
          <div className="flex items-center gap-1.5">
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: config.color }}
              animate={{ opacity: [1, 0.3, 1], scale: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="text-[10px] font-mono text-[#A5A5A5] uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* ── Primary State Display ───────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={cognitiveState}
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center gap-6"
          >
            {/* Confidence arc + orb */}
            <div className="relative w-[120px] h-[120px] shrink-0 flex items-center justify-center">
              <ConfidenceArc confidence={confidencePercent} color={config.color} />

              {/* Inner glow pulse */}
              <motion.div
                className="absolute w-16 h-16 rounded-full"
                style={{ background: `radial-gradient(circle, ${config.glowColor}, transparent)` }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Confidence number */}
              <div className="relative z-10 text-center select-none">
                <motion.span
                  className="block text-2xl font-bold font-mono tracking-tight"
                  style={{ color: config.color }}
                  key={`conf-${cognitiveState}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  {confidencePercent}%
                </motion.span>
                <span className="block text-[9px] font-mono uppercase tracking-widest text-[#A5A5A5] mt-0.5">
                  conf.
                </span>
              </div>
            </div>

            {/* State label block */}
            <div className="flex-1 min-w-0">
              {/* State name */}
              <motion.div
                className="font-black tracking-tight leading-none"
                style={{
                  fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                  color: config.color,
                  textShadow: `0 0 32px ${config.color}60`,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontVariantNumeric: "tabular-nums",
                }}
                key={`label-${cognitiveState}`}
                initial={{ opacity: 0, x: 10, letterSpacing: "0.3em" }}
                animate={{ opacity: 1, x: 0, letterSpacing: "-0.02em" }}
                transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {config.label}
              </motion.div>

              {/* Sublabel */}
              <motion.p
                className="text-xs text-[#A5A5A5] mt-1.5 font-medium tracking-wide"
                key={`sub-${cognitiveState}`}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
              >
                {config.sublabel}
              </motion.p>

              {/* Interpretation label */}
              <motion.div
                className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  background: `${config.color}12`,
                  border: `1px solid ${config.color}28`,
                  color: config.color,
                }}
                key={`badge-${cognitiveState}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.22 }}
              >
                <span className="w-1 h-1 rounded-full" style={{ background: config.color }} />
                Current Cognitive Interpretation
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div
          className="h-px w-full transition-colors duration-700"
          style={{ background: `linear-gradient(90deg, transparent, ${config.color}30, transparent)` }}
        />

        {/* ── Evidence Grid ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`evidence-${cognitiveState}`}
            className="space-y-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#A5A5A5] mb-3">
              Supporting Evidence
            </p>

            {config.evidence.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.07, ease: "easeOut" }}
                  className="flex items-center justify-between group"
                >
                  {/* Signal row */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Icon */}
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors duration-300"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <Icon className="w-3 h-3 text-[#A5A5A5]" />
                    </div>

                    {/* Label */}
                    <span className="text-xs text-[#A5A5A5] font-medium truncate">{item.label}</span>
                  </div>

                  {/* Value + status */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Animated underline bar */}
                    <motion.div
                      className="h-px rounded-full opacity-40"
                      style={{ background: config.color }}
                      initial={{ width: 0 }}
                      animate={{ width: item.status === "positive" ? 24 : item.status === "neutral" ? 12 : 20 }}
                      transition={{ duration: 0.5, delay: 0.3 + i * 0.07 }}
                    />

                    <span className={`text-xs font-semibold font-mono ${EVIDENCE_VALUE_COLORS[item.status]}`}>
                      {item.value}
                    </span>

                    <span className={`${EVIDENCE_STATUS_COLORS[item.status]}`}>
                      <EvidenceStatusIcon status={item.status} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* ── Bottom border ring effect ────────────────────────────────── */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${config.color}50, transparent)` }}
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
