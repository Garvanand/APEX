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
