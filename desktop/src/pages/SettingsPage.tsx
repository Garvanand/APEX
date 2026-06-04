import React, { useState, useCallback } from "react";
import { 
  Settings, Link2, Keyboard, ShieldAlert, 
  Trash2, Sliders, CheckCircle2, Moon, Bell, Volume2, RefreshCw, Activity, Eye, Sparkles 
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

type SettingsCategory =
  | "General"
  | "Integrations"
  | "Keyboard Shortcuts"
  | "Privacy"
  | "Diagnostics"
  | "Danger Zone";

const CATEGORIES: SettingsCategory[] = [
  "General",
  "Integrations",
  "Keyboard Shortcuts",
  "Privacy",
  "Diagnostics",
  "Danger Zone",
];

interface ShortcutRow {
  action: string;
  keys: string;
}

const SHORTCUTS: ShortcutRow[] = [
  { action: "Open Command Palette", keys: "⌘ K" },
  { action: "Toggle Focus Mode", keys: "⌘ Shift F" },
  { action: "Quick Task Switch", keys: "⌥ Tab" },
  { action: "Dismiss Active Dialog", keys: "Esc" },
  { action: "Open Analytics", keys: "⌘ Shift A" },
  { action: "Reset Timer", keys: "⌘ R" },
  { action: "Toggle Sidebar", keys: "⌘ B" },
];

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-black/20 border border-white/5 rounded-xl transition-colors">
      <div className="space-y-0.5">
        <span className="block text-xs font-semibold text-white">{label}</span>
        {description && (
          <span className="block text-[11px] text-secondary-text leading-relaxed">{description}</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { addLog } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("General");

  // ---- Settings states ----
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  const [googleCal, setGoogleCal] = useState(false);
  const [canvasLms, setCanvasLms] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);
  const [discord, setDiscord] = useState(true);

  const [dataCollection, setDataCollection] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggle = useCallback((name: string, setter: React.Dispatch<React.SetStateAction<boolean>>, current: boolean) => {
    setter(!current);
    addLog("Settings", `${name} set to ${!current ? "ENABLED" : "DISABLED"}`, "User updated preference", `${name} set to ${!current ? "ENABLED" : "DISABLED"}`, "Configuration saved");
  }, [addLog]);

  return (
    <div className="space-y-6">
      
      <div className="pb-4 border-b border-white/5">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-accent" />
          Settings
        </h1>
        <p className="text-xs text-secondary-text">Configure workspace triggers, authentication keys, and device synchronization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left category nav */}
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
                  isActive 
                    ? "bg-white/5 text-white" 
                    : cat === "Danger Zone" 
                      ? "text-danger/60 hover:bg-danger/5 hover:text-danger"
                      : "text-secondary-text hover:text-white hover:bg-white/[0.02]"
                }`}
              >
                {cat === "General" && <Settings className="w-3.5 h-3.5" />}
                {cat === "Integrations" && <Link2 className="w-3.5 h-3.5" />}
                {cat === "Keyboard Shortcuts" && <Keyboard className="w-3.5 h-3.5" />}
                {cat === "Privacy" && <Sliders className="w-3.5 h-3.5" />}
                {cat === "Diagnostics" && <Activity className="w-3.5 h-3.5" />}
                {cat === "Danger Zone" && <ShieldAlert className="w-3.5 h-3.5" />}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right content pane */}
        <div className="md:col-span-3 space-y-4">
          
          {activeCategory === "General" && (
            <div className="space-y-4">
              <SettingRow label="Dark Theme Mode" description="Enforce black backgrounds (#0A0A0A) across all screen devices.">
                <input 
                  type="checkbox" 
                  checked={darkMode}
                  onChange={() => handleToggle("Dark Theme", setDarkMode, darkMode)}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </SettingRow>

              <SettingRow label="Push Notifications" description="Relay warning notifications when fatigue limits or distraction switches are detected.">
                <input 
                  type="checkbox" 
                  checked={notifications}
                  onChange={() => handleToggle("Push Notifications", setNotifications, notifications)}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </SettingRow>

              <SettingRow label="Ambient Audio Chimes" description="Play low-frequency audio alerts when shifting between Flow and Overloaded states.">
                <input 
                  type="checkbox" 
                  checked={soundEffects}
                  onChange={() => handleToggle("Audio Chimes", setSoundEffects, soundEffects)}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </SettingRow>

              <SettingRow label="iQOO Bridge Auto-Sync" description="Maintain continuous background sync between phone biometrics and desktop execution.">
                <input 
                  type="checkbox" 
                  checked={autoSync}
                  onChange={() => handleToggle("Bridge Auto-Sync", setAutoSync, autoSync)}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </SettingRow>
            </div>
          )}

          {activeCategory === "Integrations" && (
            <div className="space-y-4">
              <SettingRow label="Google Calendar integration" description="Import academic milestones and class schedules.">
                <input 
                  type="checkbox" 
                  checked={googleCal}
                  onChange={() => handleToggle("Google Calendar Sync", setGoogleCal, googleCal)}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </SettingRow>

              <SettingRow label="Canvas LMS API Connection" description="Scan course syllabi, assignments, and due dates automatically.">
                <input 
                  type="checkbox" 
                  checked={canvasLms}
                  onChange={() => handleToggle("Canvas LMS Sync", setCanvasLms, canvasLms)}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </SettingRow>

              <SettingRow label="WhatsApp Client API Hook" description="Allows Peer Radar to summarize chats and suppress messages in Flow.">
                <input 
                  type="checkbox" 
                  checked={whatsapp}
                  onChange={() => handleToggle("WhatsApp API Hook", setWhatsapp, whatsapp)}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </SettingRow>

              <SettingRow label="Discord Status Integration" description="Auto-set Discord presence based on determined cognitive state.">
                <input 
                  type="checkbox" 
                  checked={discord}
                  onChange={() => handleToggle("Discord presence updates", setDiscord, discord)}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </SettingRow>
            </div>
          )}

          {activeCategory === "Keyboard Shortcuts" && (
            <div className="bg-secondary-surface border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold text-secondary-text uppercase tracking-wider font-mono">
                    <th className="p-4">Action Directive</th>
                    <th className="p-4 text-right">Hotkey Command</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-white divide-y divide-white/[0.03]">
                  {SHORTCUTS.map((s) => (
                    <tr key={s.action} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 font-medium">{s.action}</td>
                      <td className="p-4 text-right">
                        <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-[10px] text-accent">
                          {s.keys}
                        </kbd>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeCategory === "Privacy" && (
            <div className="space-y-4">
              <SettingRow label="Anonymized Telemetry Logs" description="Share aggregate biometrics history to tune classifier models.">
                <input 
                  type="checkbox" 
                  checked={dataCollection}
                  onChange={() => handleToggle("Anonymized Telemetry logs", setDataCollection, dataCollection)}
                  className="accent-accent w-4 h-4 cursor-pointer"
                />
              </SettingRow>

              <SettingRow label="Flush Local Workspace Database" description="Remove all cached sessions, cognitive logs, and local graph indices.">
                <button
                  onClick={() => {
                    addLog("Settings", "Cleared local cache index.", "User requested cache clear", "Cleared local cache index.", "Storage freed");
                    alert("Cache cleared successfully.");
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Clear Cache
                </button>
              </SettingRow>
            </div>
          )}

          {activeCategory === "Diagnostics" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-accent" />
                  Raw Sensor Telemetry
                </h4>
                <p className="text-[11px] text-secondary-text mt-1 leading-relaxed">
                  Real-time raw biometric inputs from connected sensors. Use this for debugging and calibration.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary-surface border border-white/5 rounded-xl p-4 flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-secondary-text uppercase tracking-wider">Heart Rate</span>
                      <Activity className="w-4 h-4 text-danger" />
                    </div>
                    <div>
                      <span className="text-2xl font-mono font-semibold text-white">{Math.round(useAppContext().telemetry.heartRate)}</span>
                      <span className="text-xs text-secondary-text ml-1">BPM</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-danger h-full rounded-full" style={{ width: `${(useAppContext().telemetry.heartRate / 120) * 100}%` }} />
                    </div>
                  </div>
                  <div className="bg-secondary-surface border border-white/5 rounded-xl p-4 flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-secondary-text uppercase tracking-wider">HRV (Stability)</span>
                      <Sparkles className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <span className="text-2xl font-mono font-semibold text-white">{Math.round(useAppContext().telemetry.hrv)}</span>
                      <span className="text-xs text-secondary-text ml-1">ms</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-success h-full rounded-full" style={{ width: `${(useAppContext().telemetry.hrv / 80) * 100}%` }} />
                    </div>
                  </div>
                  <div className="bg-secondary-surface border border-white/5 rounded-xl p-4 flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-secondary-text uppercase tracking-wider">Blink Rate</span>
                      <Eye className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <span className="text-2xl font-mono font-semibold text-white">{useAppContext().telemetry.blinkRate}</span>
                      <span className="text-xs text-secondary-text ml-1">/min</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-accent h-full rounded-full" style={{ width: `${(useAppContext().telemetry.blinkRate / 24) * 100}%` }} />
                    </div>
                  </div>
                  <div className="bg-secondary-surface border border-white/5 rounded-xl p-4 flex flex-col justify-between h-28">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-secondary-text uppercase tracking-wider">Ambient Noise</span>
                      <Volume2 className="w-4 h-4 text-secondary-text" />
                    </div>
                    <div>
                      <span className="text-2xl font-mono font-semibold text-white">{Math.round(useAppContext().telemetry.ambientDb)}</span>
                      <span className="text-xs text-secondary-text ml-1">dB</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="bg-white/20 h-full rounded-full" style={{ width: `${(useAppContext().telemetry.ambientDb / 80) * 100}%` }} />
                    </div>
                  </div>
                </div>
            </div>
          )}

          {activeCategory === "Danger Zone" && (
            <div className="bg-danger/5 border border-danger/25 rounded-xl p-5 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-danger uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Irreversible Actions
                </h4>
                <p className="text-[11px] text-danger/80 mt-1 leading-relaxed">
                  Modifying these options will result in complete data deletion or account removal. Use caution.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-danger/10">
                <div className="flex items-center justify-between gap-4 pt-4 first:pt-0">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold text-white">Reset Application Data</span>
                    <span className="block text-[11px] text-secondary-text">Restore all agent parameters to default settings.</span>
                  </div>
                  <button 
                    onClick={() => {
                      addLog("Settings", "Defaults restored.", "User requested factory reset", "Defaults restored.", "All settings reset");
                      alert("All settings restored to defaults.");
                    }}
                    className="px-4 py-2 bg-danger text-black text-xs font-semibold rounded-lg hover:bg-danger/85 transition-colors"
                  >
                    Reset defaults
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold text-white">Delete Profile Account</span>
                    <span className="block text-[11px] text-secondary-text">Erase all biometric histories, sync accounts, and preferences.</span>
                  </div>
                  
                  {!showDeleteConfirm ? (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-lg text-xs font-semibold hover:bg-danger/20 transition-colors"
                    >
                      Delete Profile
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          addLog("Settings", "Account deleted.", "User requested account deletion", "Account deleted.", "All data wiped");
                          alert("Profile deleted successfully.");
                          setShowDeleteConfirm(false);
                        }}
                        className="px-3 py-1.5 bg-danger text-black font-semibold text-xs rounded hover:bg-danger/85 transition-colors"
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 bg-white/5 text-white text-xs font-semibold rounded border border-white/5 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
