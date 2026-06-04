# APEX Development Tasks - Phase 1

- `[x]` Create `/backend` folder structure
- `[x]` Create environment configuration files (`.env` and `config.py`)
- `[x]` Create Python requirements (`requirements.txt`)
- `[x]` Design and write database schema (`schema.sql`)
- `[x]` Build database connection manager using `SQLAlchemy` + `asyncpg` (`database.py`)
- `[x]` Build Upstash Redis HTTP REST client integration (`redis_client.py`)
- `[x]` Implement JWT Authentication endpoints (`auth.py`)
- `[x]` Implement stateful WebSocket manager (`websocket_manager.py`)
- `[x]` Implement cognitive signals REST and WebSocket ingestion routes (`cognitive.py`)
- `[x]` Implement Groq API service for cognitive state classification (`groq_service.py`)
- `[x]` Assemble FastAPI app entry point (`main.py`)
- `[x]` Verify endpoints and signal streaming via automated/manual testing

# APEX Development Tasks - Phase 2

- `[x]` Scaffold Tauri desktop app with React + TypeScript
- `[x]` Create premium Vanilla CSS design system token sheet in `App.css`
- `[x]` Build responsive layout structure with sidebar navigation
- `[x]` Implement real-time WebSocket subscriber connection and parsing loop
- `[x]` Build Socratic challenge evaluation UI container
- `[x]` Build sensor simulation panel to toggle state and signal parameters
- `[x]` Verify that the frontend codebase compiles successfully under production environments

# APEX Development Tasks - Phase 3

- `[x]` Scaffold Flutter mobile structure and core layout Dart files
- `[x]` Implement companion API service (`api_service.dart`)
- `[x]` Implement bi-directional WebSocket telemetry stream (`websocket_service.dart`)
- `[x]` Create mobile companion UI states (Dashboard, Focus Mode breathing timer)
- `[x]` Design agent center controls and emergency recovery views
- `[x]` Verify structural soundness of the Flutter codebase

# APEX Development Tasks - Phase 4

- `[x]` Implement AgentOrchestrator priority-conflict mediation loops (`orchestrator.py`)
- `[x]` Implement Deadline Sentinel risk estimation equations (`calculate_deadline_risk`)
- `[x]` Implement Socratic Challenger llama-3.3-70b-versatile prompt routing to generate questions
- `[x]` Implement Socratic Challenger evaluation prompting to grade responses
- `[x]` Expose orchestration, status logs, approvals, and Socratic endpoints (`agents.py`)
- `[x]` Verify agent integrations and LLM loops in `test_backend.py`

# APEX Development Tasks - Configuration & Docs

- `[x]` Create `.gitignore` rules for root, backend, desktop, and mobile
- `[x]` Create production-level README.md documentation

# APEX Development Tasks - Phase 5 (Mobile Screens)

- `[x]` Splash Screen (Screen 1)
- `[x]` Onboarding Page (Screen 2) - 5-step interactive profile
- `[x]` Permissions Flow (Screen 3) - toggle controls and warning states
- `[x]` Cognitive Dashboard (Screen 4) - pulsing rings, manual override
- `[x]` Deadline Dashboard (Screen 5) - timeline/list views, collapsible subtasks
- `[x]` Agent Control Center (Screen 6) - diagnostics, autonomy sliders
- `[x]` Focus Session (Screen 7) - breathing animations, emergency exit
- `[x]` Voice Capture (Screen 8) - transcript highlighting, soundwave animation
- `[x]` Peer Radar (Screen 9) - dismissal, relevance badges
- `[x]` Session Analytics (Screen 10) - custom painters for donut/spline charts
- `[x]` Recovery Mode (Screen 11) - triage checklist, de-escalation actions
- `[x]` Settings Page (Screen 12) - integration toggles, cache management
- `[x]` Profile Page (Screen 13) - baseline parameter analytics, account actions
- `[x]` Main navigation with IndexedStack routing

# APEX Development Tasks - Phase 6 (Desktop Refactoring)

- `[/]` Create shared TypeScript types and interfaces (`types/index.ts`)
- `[/]` Create custom hooks (useWebSocket, useTelemetry, useFocusTimer, useCommandPalette)
- `[/]` Create AppContext provider for global state
- `[/]` Create extended CSS system (command-palette, focus-session, analytics, settings)
- `[ ]` Decompose App.tsx into page components:
  - `[ ]` Sidebar component with navigation
  - `[ ]` Dashboard page (cognitive state + telemetry + logs)
  - `[ ]` Agent Center page (agent grid + mediation config + detail panels)
  - `[ ]` Sculptor Approvals page (pending queue + action history)
  - `[ ]` Deadline War Room page (risk map + timeline + detail view)
  - `[ ]` Socratic Challenger page (challenge queue + evaluation + history)
  - `[ ]` Focus Session page (full-screen timer + breathing + break prompts)
  - `[ ]` Analytics/Insights page (charts + trends + export)
  - `[ ]` Settings page (preferences + integrations + danger zone)
- `[ ]` Create Command Palette component (Ctrl+K)
- `[ ]` Rewire App.tsx as thin shell with routing
- `[ ]` Verify desktop build compiles successfully
