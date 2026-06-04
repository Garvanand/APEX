import { useState } from "react";
import "./ApprovalsPage.css";

interface ApprovalRequest {
  id: string;
  agent: string;
  action: string;
  desc: string;
  target: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
}

interface ActionHistoryItem {
  id: string;
  agent: string;
  action: string;
  result: "approved" | "rejected" | "auto";
  timestamp: string;
}

interface ApprovalsPageProps {
  approvals: ApprovalRequest[];
  onApprove: (id: string, agent: string, desc: string) => void;
  onReject: (id: string, agent: string, desc: string) => void;
  onLog: (agent: string, msg: string) => void;
}

const MOCK_HISTORY: ActionHistoryItem[] = [
  { id: "h1", agent: "Environment Sculptor", action: "Blocked twitter.com", result: "approved", timestamp: "12:45:20" },
  { id: "h2", agent: "Environment Sculptor", action: "Enabled DND mode", result: "auto", timestamp: "12:42:15" },
  { id: "h3", agent: "Peer Radar", action: "Muted Discord #general", result: "approved", timestamp: "12:38:30" },
  { id: "h4", agent: "Environment Sculptor", action: "Closed Spotify", result: "rejected", timestamp: "12:35:10" },
  { id: "h5", agent: "Peer Radar", action: "Deferred WhatsApp group", result: "auto", timestamp: "12:30:00" },
];

const BLOCKED_APPS = [
  { name: "Discord", blocked: true },
  { name: "Twitter/X", blocked: true },
  { name: "Instagram", blocked: false },
  { name: "Reddit", blocked: false },
  { name: "YouTube", blocked: false },
  { name: "TikTok", blocked: true },
];

export default function ApprovalsPage({
  approvals,
  onApprove,
  onReject,
  onLog,
}: ApprovalsPageProps) {
  const [history] = useState<ActionHistoryItem[]>(MOCK_HISTORY);
  const [blockedApps, setBlockedApps] = useState(BLOCKED_APPS);
  const [dndEnabled, setDndEnabled] = useState(true);
  const [autoBlock, setAutoBlock] = useState(true);

  const toggleAppBlock = (index: number) => {
    setBlockedApps((prev) =>
      prev.map((app, i) =>
        i === index ? { ...app, blocked: !app.blocked } : app
      )
    );
    const app = blockedApps[index];
    onLog(
      "Environment Sculptor",
      `${app.blocked ? "Unblocked" : "Blocked"} ${app.name}`
    );
  };

  return (
    <div className="approvals-page">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="ap-page-title">Environment Sculptor</h1>
          <p className="ap-page-subtitle">
            Workspace interventions and application management
          </p>
        </div>
        <div className="header-controls">
          <div className="control-toggle">
            <span className="toggle-label">DND</span>
            <button
              className={`toggle-switch ${dndEnabled ? "active" : ""}`}
              onClick={() => {
                setDndEnabled(!dndEnabled);
                onLog("Environment Sculptor", `DND ${dndEnabled ? "disabled" : "enabled"}`);
              }}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
          <div className="control-toggle">
            <span className="toggle-label">Auto-Block</span>
            <button
              className={`toggle-switch ${autoBlock ? "active" : ""}`}
              onClick={() => {
                setAutoBlock(!autoBlock);
                onLog("Environment Sculptor", `Auto-block ${autoBlock ? "disabled" : "enabled"}`);
              }}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </div>
      </div>

      {/* Three Panel Layout */}
      <div className="ap-panels">
        {/* Panel 1: App Blockers */}
        <div className="ap-panel ap-panel-blockers">
          <div className="ap-panel-header">
            <span className="ap-panel-title">Application Rules</span>
            <span className="ap-panel-count">{blockedApps.filter(a => a.blocked).length} blocked</span>
          </div>
          <div className="app-block-list">
            {blockedApps.map((app, i) => (
              <div className="app-block-item" key={app.name}>
                <span className="app-name">{app.name}</span>
                <button
                  className={`block-toggle ${app.blocked ? "blocked" : ""}`}
                  onClick={() => toggleAppBlock(i)}
                >
                  {app.blocked ? "Blocked" : "Allowed"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Pending Approvals */}
        <div className="ap-panel ap-panel-queue">
          <div className="ap-panel-header">
            <span className="ap-panel-title">Pending Approvals</span>
            {approvals.length > 0 && (
              <span className="ap-badge">{approvals.length}</span>
            )}
          </div>
          {approvals.length > 0 ? (
            <div className="ap-queue-list">
              {approvals.map((req) => (
                <div className={`ap-queue-item severity-${req.severity || "medium"}`} key={req.id}>
                  <div className="ap-queue-info">
                    <span className="ap-queue-agent">{req.agent}</span>
                    <p className="ap-queue-desc">{req.desc}</p>
                    <span className="ap-queue-target">Target: {req.target}</span>
                  </div>
                  <div className="ap-queue-actions">
                    <button
                      className="ap-btn ap-btn-approve"
                      onClick={() => onApprove(req.id, req.agent, req.desc)}
                    >
                      ✓
                    </button>
                    <button
                      className="ap-btn ap-btn-reject"
                      onClick={() => onReject(req.id, req.agent, req.desc)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ap-empty">
              <span className="ap-empty-icon">◈</span>
              <p>All clear. No pending interventions.</p>
            </div>
          )}
        </div>

        {/* Panel 3: Action History */}
        <div className="ap-panel ap-panel-history">
          <div className="ap-panel-header">
            <span className="ap-panel-title">Action History</span>
          </div>
          <div className="ap-history-list">
            {history.map((item) => (
              <div className="ap-history-item" key={item.id}>
                <div className="ap-history-info">
                  <span className="ap-history-action">{item.action}</span>
                  <span className="ap-history-agent">{item.agent}</span>
                </div>
                <div className="ap-history-meta">
                  <span className={`ap-history-result result-${item.result}`}>
                    {item.result}
                  </span>
                  <span className="ap-history-time">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
