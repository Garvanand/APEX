import { useState, useEffect, useRef } from "react";
import "./App.css";

// -----------------------------------------------------
// APEX Desktop UI Client
// -----------------------------------------------------

interface AgentLog {
  id: string;
  time: string;
  agent: string;
  msg: string;
}

interface ApprovalRequest {
  id: string;
  agent: string;
  action: string;
  desc: string;
  target: string;
}

interface DeadlineItem {
  id: string;
  title: string;
  dueDate: string;
  urgency: "low" | "medium" | "high";
  risk: number;
}

function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [cognitiveState, setCognitiveState] = useState<string>("Flow");
  const [confidence, setConfidence] = useState<number>(0.92);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);
  const [jwtToken, setJwtToken] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // Real-time Telemetry Data
  const [heartRate, setHeartRate] = useState<number>(72);
  const [hrv, setHrv] = useState<number>(55);
  const [blinkRate, setBlinkRate] = useState<number>(12);
  const [activeApp, setActiveApp] = useState<string>("VS Code");
  const [ambientDb, setAmbientDb] = useState<number>(36);

  // Active Tasks
  const [activeTask, setActiveTask] = useState<string>("Build parser for compilers project");
  const [taskDuration, setTaskDuration] = useState<number>(2400); // 40 minutes in seconds

  // Agent State log
  const [logs, setLogs] = useState<AgentLog[]>([
    { id: "1", time: "13:00:05", agent: "State Agent", msg: "Stable blink rate detected. User flow calibration active." },
    { id: "2", time: "13:02:14", agent: "Deadline Sentinel", msg: "Urgency calculated: Compilers Project 2 is at critical risk." },
    { id: "3", time: "13:05:42", agent: "Environment Sculptor", msg: "Applied flow workspace template: closed Slack & silenced alerts." }
  ]);

  // Sculptor Approvals Queue
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([
    { id: "app-101", agent: "Environment Sculptor", action: "BLOCK_APP", desc: "Discord is drawing high focus switching. Block application?", target: "discord.exe" },
    { id: "app-102", agent: "Peer Radar", action: "MUTED_REPLY", desc: "Mute whatsapp thread 'Project group' notifications until 15:00?", target: "WhatsApp" }
  ]);

  // Socratic Challenger active challenge
  const [socraticAnswer, setSocraticAnswer] = useState<string>("");
  const [socraticFeedback, setSocraticFeedback] = useState<string>("");
  const [isEvaluatingChallenge, setIsEvaluatingChallenge] = useState<boolean>(false);
  const [activeChallenge, setActiveChallenge] = useState({
    id: "ch-501",
    question: "If your parser encounters a syntax mismatch, how does it reconcile without throwing a stack overflow?",
    anchor: "Compiler Parsing Trees"
  });

  // Deadlines
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([
    { id: "dl-1", title: "Compiler Construction Project 2", dueDate: "Tomorrow, 23:59", urgency: "high", risk: 0.89 },
    { id: "dl-2", title: "Machine Learning Lab 3", dueDate: "June 10, 23:59", urgency: "medium", risk: 0.42 },
    { id: "dl-3", title: "Database Systems Midterm Review", dueDate: "June 15, 14:00", urgency: "low", risk: 0.15 }
  ]);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);

  // 1. Telemetry Simulation Loop (Updates sensors every 3 seconds to emulate local iQOO signals)
  useEffect(() => {
    const timer = setInterval(() => {
      // Modify values based on active cognitive state to make simulation realistic
      if (cognitiveState === "Flow") {
        setHeartRate(prev => Math.max(65, Math.min(80, prev + (Math.random() - 0.5) * 2)));
        setHrv(prev => Math.max(50, Math.min(70, prev + (Math.random() - 0.5) * 3)));
        setBlinkRate(prev => Math.max(10, Math.min(16, prev + (Math.random() > 0.5 ? 1 : -1))));
        setAmbientDb(prev => Math.max(30, Math.min(42, prev + (Math.random() - 0.5) * 1)));
      } else if (cognitiveState === "Distracted") {
        setHeartRate(prev => Math.max(70, Math.min(85, prev + (Math.random() - 0.5) * 3)));
        setHrv(prev => Math.max(40, Math.min(60, prev + (Math.random() - 0.5) * 4)));
        setBlinkRate(prev => Math.max(15, Math.min(22, prev + (Math.random() > 0.5 ? 1 : -1))));
      } else if (cognitiveState === "Fatigued") {
        setHeartRate(prev => Math.max(60, Math.min(70, prev + (Math.random() - 0.5) * 1)));
        setHrv(prev => Math.max(30, Math.min(45, prev + (Math.random() - 0.5) * 2)));
        setBlinkRate(prev => Math.max(8, Math.min(14, prev + (Math.random() > 0.5 ? 1 : -1))));
      } else if (cognitiveState === "Overloaded") {
        setHeartRate(prev => Math.max(85, Math.min(105, prev + (Math.random() - 0.5) * 5)));
        setHrv(prev => Math.max(20, Math.min(38, prev + (Math.random() - 0.5) * 2)));
        setBlinkRate(prev => Math.max(12, Math.min(18, prev + (Math.random() > 0.5 ? 1 : -1))));
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [cognitiveState]);

  // 2. Focus timer countdown
  useEffect(() => {
    const countdown = setInterval(() => {
      setTaskDuration(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // 3. WebSocket stream handler
  const connectWebSocket = (tokenStr: string) => {
    if (wsRef.current) wsRef.current.close();

    const wsUrl = `ws://localhost:8000/api/v1/cognitive/stream?token=${tokenStr}`;
    loggerLog("System", `Connecting to WebSocket at localhost:8000...`);
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsWebSocketConnected(true);
        loggerLog("System", "WebSocket Connection successfully established.");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "COGNITIVE_STATE_DETERMINED") {
            const payload = data.payload;
            setCognitiveState(payload.state);
            setConfidence(payload.confidence_score);
            loggerLog("State Agent", `Cognitive state updated via Server: ${payload.state} (${Math.round(payload.confidence_score * 100)}% conf)`);
          }
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      };

      ws.onclose = () => {
        setIsWebSocketConnected(false);
        loggerLog("System", "WebSocket connection closed by host.");
      };

      wsRef.current = ws;
    } catch (e) {
      console.error("Websocket connection failed", e);
    }
  };

  // Telemetry broadcast over WebSocket
  useEffect(() => {
    if (isWebSocketConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        event: "COGNITIVE_STATE_RAW",
        payload: {
          device_source: "desktop-tauri-client",
          heart_rate: heartRate,
          hrv: hrv,
          blink_rate_per_min: blinkRate,
          screen_interaction_density: Math.random(),
          active_application: activeApp,
          ambient_noise_db: ambientDb
        }
      };
      wsRef.current.send(JSON.stringify(payload));
    }
  }, [heartRate, hrv, blinkRate, activeApp, ambientDb, isWebSocketConnected]);

  const handleLoginMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (jwtToken.trim() !== "") {
      setIsLoggedIn(true);
      connectWebSocket(jwtToken);
    } else {
      // Mock login token generator
      const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummyUserToken";
      setJwtToken(mockToken);
      setIsLoggedIn(true);
      connectWebSocket(mockToken);
    }
  };

  const loggerLog = (agent: string, msg: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs(prev => [
      { id: Date.now().toString(), time: timeStr, agent, msg },
      ...prev.slice(0, 15)
    ]);
  };

  const handleApprove = (id: string, agent: string, desc: string) => {
    setApprovals(prev => prev.filter(x => x.id !== id));
    loggerLog(agent, `User APPROVED action: ${desc}`);
  };

  const handleReject = (id: string, agent: string, desc: string) => {
    setApprovals(prev => prev.filter(x => x.id !== id));
    loggerLog(agent, `User REJECTED action: ${desc}`);
  };

  const handleEvaluateChallenge = async () => {
    if (socraticAnswer.trim() === "") return;
    setIsEvaluatingChallenge(true);
    setSocraticFeedback("");

    // Simulate calling the Groq-backed evaluation engine (latency check)
    setTimeout(() => {
      setIsEvaluatingChallenge(false);
      setSocraticFeedback("Excellent analysis. Your focus on tracking recursion limit and verifying state transition base cases addresses the stack depth concern directly. Score: 0.92");
      loggerLog("Socratic Challenger", "Socratic response evaluated. Score: 0.92 (High compliance).");
      
      // Load next query to prevent unused variable warning
      setActiveChallenge({
        id: "ch-502",
        question: "Explain the visual differences in animation spring physics between Flow and Overloaded states.",
        anchor: "APEX Motion Design Guidelines"
      });
    }, 2000);
  };

  const addMockDeadline = () => {
    const newDl: DeadlineItem = {
      id: `dl-${Date.now()}`,
      title: "Algorithms Exam Prep Session",
      dueDate: "In 3 days, 10:00",
      urgency: "medium",
      risk: 0.28
    };
    setDeadlines(prev => [...prev, newDl]);
    loggerLog("Deadline Sentinel", "Discovered new academic session event. Added to timeline.");
  };

  const handleManualStateChange = (state: string) => {
    setCognitiveState(state);
    if (state === "Flow") {
      setConfidence(0.96);
      loggerLog("State Agent", "Manual override: Set to Flow State.");
    } else if (state === "Distracted") {
      setConfidence(0.88);
      loggerLog("State Agent", "Manual override: Set to Distracted State.");
    } else if (state === "Fatigued") {
      setConfidence(0.85);
      loggerLog("State Agent", "Manual override: Set to Fatigued State.");
    } else if (state === "Overloaded") {
      setConfidence(0.90);
      loggerLog("State Agent", "Manual override: Set to Overloaded State.");
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVGs for Agents
  const renderAgentIcon = (name: string, fill: string) => {
    if (name === "State Agent") {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    } else if (name === "Deadline Sentinel") {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="3" />
        </svg>
      );
    } else if (name === "Environment Sculptor") {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      );
    } else if (name === "Peer Radar") {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2v20M2 12h20" />
        </svg>
      );
    } else {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M9 9h6M9 13h4" />
        </svg>
      );
    }
  };

  return (
    <div className="app-container">
      {/* Titlebar */}
      <header className="titlebar">
        <div className="titlebar-brand">
          <span className="logo-apex">APEX</span>
          <span className="logo-tag">Execution Env</span>
        </div>
        <div className="titlebar-sync">
          <span className={`sync-dot ${isWebSocketConnected ? "" : "offline"}`}></span>
          <span>{isWebSocketConnected ? "iQOO Office Kit Synced" : "Offline Simulator"}</span>
        </div>
      </header>

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="nav-links">
            <button 
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <span>📊 Workspace Dashboard</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "agents" ? "active" : ""}`}
              onClick={() => setActiveTab("agents")}
            >
              <span>🧠 Agent Center</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "workspace" ? "active" : ""}`}
              onClick={() => setActiveTab("workspace")}
            >
              <span>🛡️ Sculptor Approvals</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "deadlines" ? "active" : ""}`}
              onClick={() => setActiveTab("deadlines")}
            >
              <span>⏰ Deadline War Room</span>
            </button>
            <button 
              className={`nav-item ${activeTab === "socratic" ? "active" : ""}`}
              onClick={() => setActiveTab("socratic")}
            >
              <span>🎓 Socratic Challenger</span>
            </button>
          </div>

          <div className="sidebar-footer">
            {isLoggedIn ? (
              <div className="user-badge">
                <div className="user-avatar">GA</div>
                <div>
                  <p style={{ fontWeight: 600 }}>Garv Anand</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>student@university.edu</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLoginMock}>
                <input 
                  type="text" 
                  placeholder="Paste JWT Access Token..." 
                  className="input-field" 
                  style={{ fontSize: "0.8rem", marginBottom: "6px" }}
                  value={jwtToken}
                  onChange={(e) => setJwtToken(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ width: "100%", fontSize: "0.8rem" }}>
                  Connect Server
                </button>
              </form>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="content-area">
          {activeTab === "dashboard" && (
            <div className={`dashboard-grid ${cognitiveState === "Flow" ? "flow-layout" : ""}`}>
              {/* Left Panel: Primary workspace */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Active Focus Card */}
                <div className="card">
                  <div className="card-header">
                    <span>🎯 Active Focus Block</span>
                    <span style={{ fontFamily: "JetBrains Mono", color: "var(--focus-ring)" }}>
                      {formatTime(taskDuration)}
                    </span>
                  </div>
                  <div className="form-row">
                    <input 
                      type="text" 
                      className="input-field" 
                      value={activeTask}
                      onChange={(e) => setActiveTask(e.target.value)}
                      placeholder="What are you focusing on?"
                    />
                    <button className="btn btn-primary" onClick={() => setTaskDuration(2400)}>Reset Timer</button>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    State-driven actions: Application triggers and ambient notification suppression rules are calibrated against this task description.
                  </p>
                </div>

                {/* Cognitive State Visualization */}
                <div className="card state-panel">
                  <div className="card-header">
                    <span>🧠 Cognitive State Evaluation</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Confidence: {Math.round(confidence * 100)}%
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                    <div className={`state-badge-large state-${cognitiveState}`}>
                      {cognitiveState} STATE
                    </div>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", flex: 1 }}>
                      {cognitiveState === "Flow" && "Deep, focused block active. Interface elements minimized, sound notifications blocked."}
                      {cognitiveState === "Distracted" && "Context switching pattern detected. Focus reminders activated."}
                      {cognitiveState === "Fatigued" && "Exhaustion signs identified. Suggested action: Take a 5-minute movement break."}
                      {cognitiveState === "Overloaded" && "High stress metrics detected. Greyscale filters primed. emergency triage active."}
                    </p>
                  </div>

                  {/* Telemetry Sensor stats */}
                  <div className="telemetry-grid">
                    <div className="telemetry-item">
                      <p className="telemetry-label">Heart Rate</p>
                      <p className="telemetry-value">{Math.round(heartRate)} BPM</p>
                    </div>
                    <div className="telemetry-item">
                      <p className="telemetry-label">HRV</p>
                      <p className="telemetry-value">{Math.round(hrv)} ms</p>
                    </div>
                    <div className="telemetry-item">
                      <p className="telemetry-label">Eye Blink Rate</p>
                      <p className="telemetry-value">{blinkRate}/min</p>
                    </div>
                    <div className="telemetry-item">
                      <p className="telemetry-label">Active App</p>
                      <input 
                        type="text" 
                        value={activeApp}
                        onChange={(e) => {
                          setActiveApp(e.target.value);
                          loggerLog("State Agent", `Foreground application changed to: ${e.target.value}`);
                        }}
                        className="input-field" 
                        style={{ border: "none", background: "transparent", textAlign: "center", fontWeight: "bold", fontSize: "1rem", color: "#FFFFFF", padding: 0 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Console Logs */}
                <div className="card">
                  <div className="card-header">👁️ Agent Orchestrator Logs</div>
                  <div className="log-list">
                    {logs.map(log => (
                      <div className="log-item" key={log.id}>
                        <span className="log-time">[{log.time}]</span>
                        <span className="log-msg"><strong style={{ color: "var(--focus-ring)" }}>{log.agent}:</strong> {log.msg}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Panel: Simulation & Approvals (Only visible when not in Flow for maximum decluttering) */}
              {cognitiveState !== "Flow" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  
                  {/* Simulation overrides */}
                  <div className="card simulation-panel">
                    <div className="card-header">🛠️ Workspace Simulator</div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Manually simulate telemetry states to observe interface adaptations.
                    </p>
                    <div className="btn-group">
                      <button className="btn" onClick={() => handleManualStateChange("Flow")}>Flow</button>
                      <button className="btn" onClick={() => handleManualStateChange("Distracted")}>Distracted</button>
                      <button className="btn" onClick={() => handleManualStateChange("Fatigued")}>Fatigued</button>
                      <button className="btn" onClick={() => handleManualStateChange("Overloaded")}>Overloaded</button>
                    </div>
                  </div>

                  {/* Pending Approvals */}
                  <div className="card">
                    <div className="card-header">🚨 Sculptor Interventions</div>
                    {approvals.length > 0 ? (
                      <div className="approval-list">
                        {approvals.map(req => (
                          <div className="approval-item" key={req.id}>
                            <p className="approval-desc">
                              <strong style={{ color: "var(--color-distracted)" }}>{req.agent}</strong>: {req.desc}
                            </p>
                            <div className="approval-actions">
                              <button 
                                className="btn btn-primary"
                                style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                                onClick={() => handleApprove(req.id, req.agent, req.desc)}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn"
                                style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                                onClick={() => handleReject(req.id, req.agent, req.desc)}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
                        No pending agent block approvals. Workspace is protected.
                      </p>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === "agents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="card-header" style={{ fontSize: "1.5rem" }}>🧠 Dynamic Agent Center</div>
              <div className="agent-grid">
                <div className="agent-card">
                  <div className="agent-avatar-mini" style={{ backgroundColor: "rgba(0, 210, 106, 0.15)" }}>
                    {renderAgentIcon("State Agent", "var(--color-flow)")}
                  </div>
                  <div className="agent-info">
                    <p className="agent-name">State Agent</p>
                    <p className="agent-status">Classifying. Latency: 140ms</p>
                  </div>
                </div>
                <div className="agent-card">
                  <div className="agent-avatar-mini" style={{ backgroundColor: "rgba(255, 77, 79, 0.15)" }}>
                    {renderAgentIcon("Deadline Sentinel", "var(--color-overloaded)")}
                  </div>
                  <div className="agent-info">
                    <p className="agent-name">Deadline Sentinel</p>
                    <p className="agent-status">Monitoring 3 courses. Risk: Low</p>
                  </div>
                </div>
                <div className="agent-card">
                  <div className="agent-avatar-mini" style={{ backgroundColor: "rgba(255, 184, 0, 0.15)" }}>
                    {renderAgentIcon("Environment Sculptor", "var(--color-distracted)")}
                  </div>
                  <div className="agent-info">
                    <p className="agent-name">Environment Sculptor</p>
                    <p className="agent-status">Workspace DND enabled</p>
                  </div>
                </div>
                <div className="agent-card">
                  <div className="agent-avatar-mini" style={{ backgroundColor: "rgba(0, 122, 255, 0.15)" }}>
                    {renderAgentIcon("Peer Radar", "var(--color-fatigued)")}
                  </div>
                  <div className="agent-info">
                    <p className="agent-name">Peer Radar</p>
                    <p className="agent-status">Scanning chats. WhatsApp: Muted</p>
                  </div>
                </div>
                <div className="agent-card">
                  <div className="agent-avatar-mini" style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}>
                    {renderAgentIcon("Socratic Challenger", "#FFFFFF")}
                  </div>
                  <div className="agent-info">
                    <p className="agent-name">Socratic Challenger</p>
                    <p className="agent-status">Inactive. Flow active</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">Mediation Protocol Configuration</div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                  Define conflict resolution overrides when agents propose intersecting interface adjustments.
                </p>
                <div className="telemetry-grid">
                  <div className="telemetry-item" style={{ textAlign: "left" }}>
                    <p className="telemetry-label" style={{ marginBottom: "6px" }}>Flow State overrides</p>
                    <label style={{ fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center" }}>
                      <input type="checkbox" defaultChecked /> Mute Peer Radar
                    </label>
                    <label style={{ fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
                      <input type="checkbox" defaultChecked /> Block Leisure Web
                    </label>
                  </div>
                  <div className="telemetry-item" style={{ textAlign: "left" }}>
                    <p className="telemetry-label" style={{ marginBottom: "6px" }}>Overload Triage</p>
                    <label style={{ fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center" }}>
                      <input type="checkbox" defaultChecked /> Trigger Screen Greyscale
                    </label>
                    <label style={{ fontSize: "0.85rem", display: "flex", gap: "8px", alignItems: "center", marginTop: "6px" }}>
                      <input type="checkbox" defaultChecked /> Surface Deadline Sentinel Triage
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "workspace" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="card-header" style={{ fontSize: "1.5rem" }}>🛡️ Environment Sculptor Approvals</div>
              <div className="card">
                <div className="card-header">Pending Application Block Approvals</div>
                {approvals.length > 0 ? (
                  <div className="approval-list">
                    {approvals.map(req => (
                      <div className="approval-item" key={req.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <p style={{ fontWeight: 600 }}>{req.desc}</p>
                          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Target process: {req.target}</p>
                        </div>
                        <div className="approval-actions">
                          <button className="btn btn-primary" onClick={() => handleApprove(req.id, req.agent, req.desc)}>Approve</button>
                          <button className="btn" onClick={() => handleReject(req.id, req.agent, req.desc)}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: "center", color: "var(--text-muted)" }}>All processes authorized. No blocks waiting approval.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "deadlines" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="card-header" style={{ fontSize: "1.5rem" }}>⏰ Deadline War Room</div>
              <div className="card">
                <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Academic Deliverables (Risk Map)</span>
                  <button className="btn btn-primary" style={{ fontSize: "0.8rem", padding: "4px 10px" }} onClick={addMockDeadline}>
                    + Add Session
                  </button>
                </div>
                <div className="deadline-list">
                  {deadlines.map(item => (
                    <div className="deadline-item" key={item.id}>
                      <div className="deadline-title-group">
                        <span className="deadline-title">{item.title}</span>
                        <span className="deadline-time">Due: {item.dueDate}</span>
                      </div>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          Risk: {Math.round(item.risk * 100)}%
                        </span>
                        <span className={`urgency-badge urgency-${item.urgency}`}>
                          {item.urgency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "socratic" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="card-header" style={{ fontSize: "1.5rem" }}>🎓 Socratic Challenger</div>
              <div className="card challenge-box">
                <div className="card-header" style={{ padding: 0 }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase" }}>
                    Topic Anchor: {activeChallenge.anchor}
                  </span>
                </div>
                <p className="challenge-question">{activeChallenge.question}</p>
                
                <textarea 
                  className="input-text" 
                  placeholder="Draft your explanation/proof here..."
                  value={socraticAnswer}
                  onChange={(e) => setSocraticAnswer(e.target.value)}
                />

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleEvaluateChallenge}
                    disabled={isEvaluatingChallenge}
                  >
                    {isEvaluatingChallenge ? "Evaluating response via Groq API..." : "Submit Answer"}
                  </button>
                </div>

                {socraticFeedback && (
                  <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.95rem", lineHeight: "1.4" }}>
                    <p style={{ fontWeight: 600, color: "var(--color-flow)", marginBottom: "4px" }}>Evaluation Result</p>
                    <p style={{ color: "var(--text-secondary)" }}>{socraticFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
