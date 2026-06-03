# APEX: Adaptive Presence & Execution Intelligence

APEX is a production-grade cognitive operating layer designed to optimize student focus, manage deadlines, and suppress digital distractions dynamically. Built for the flagship **iQOO AI ecosystem**, it functions as a real-time buffer between the user and their digital environment.

By combining biometric sensors on the phone (Sensing Layer), a horizontally scalable cloud backend (Intelligence Layer), and a desktop native workspace (Execution Layer), APEX tracks the user's running cognitive state to sculpt their environment and challenge their understanding.

---

## 🏗️ System Architecture

APEX operates as a three-tier hybrid edge-cloud orchestration system connected via the **iQOO Office Kit** local bridge:

```mermaid
graph TD
    subgraph Sensing Layer (Edge Mobile)
        A[iQOO Mobile Companion: Flutter] -->|Sensors: HR/HRV/Blink telemetry| WS[FastAPI WebSocket Stream]
    end
    subgraph Execution Layer (Edge Desktop)
        B[Tauri Desktop Client: React/TS] <-->|Bidirectional stream| WS
        B -->|Focus & Workspace Locks| OS[Windows Workspace environment]
    end
    subgraph Intelligence Layer (Cloud Gateway)
        WS <-->|Telemetry Pub/Sub| Redis[(Upstash Redis Cache)]
        WS -->|Store Telemetry| DB[(PostgreSQL Aurora)]
        WS <-->|Async state evaluation| Groq[Groq Cloud LLM: llama-3.1-8b]
    end
```

---

## 🛠️ Technology Stack

* **Backend Engine**: FastAPI (Python 3.12+), SQLAlchemy (ORM), `asyncpg` (Async PostgreSQL driver), WebSockets.
* **Database & Cache**: PostgreSQL (with `pgvector` extension for semantic node graph RAG queries), Redis / Upstash (for low-latency REST pub/sub queuing).
* **Desktop Client**: Tauri (Rust native layer + React, Vite, TypeScript, Vanilla CSS).
* **Mobile Companion**: Flutter (Dart, Provider state management, `web_socket_channel`).
* **Cognitive AI**: Groq Cloud API (`llama-3.1-8b-instant` for low-latency classifier, `llama-3.3-70b-versatile` for complex Socratic evaluation and Sentinel risk models).

---

## 📂 Project Structure

```text
iqoo/
├── docker-compose.yml         # Local Postgres (ankane/pgvector) & Redis compose config
├── backend/                   # FastAPI Server Codebase
│   ├── main.py                # Server entry point, startup migrations, CORS
│   ├── requirements.txt       # Python dependency declarations
│   ├── .env                   # Local credentials configuration secrets
│   ├── database/
│   │   └── schema.sql         # PostgreSQL DDL creating all 32 relational tables
│   ├── app/
│   │   ├── api/               # routers: auth.py, cognitive.py, agents.py, deps.py
│   │   ├── core/              # DB pooling, security, configs, redis REST clients, WS managers
│   │   ├── database/          # models.py (SQLAlchemy ORM mappings)
│   │   ├── schemas/           # schemas.py (Pydantic schema constraints)
│   │   └── services/          # groq_service.py, orchestrator.py (mediation logic)
│   ├── init_db.py             # Script checking extensions and creating tables
│   └── test_backend.py        # Offline & live integration test script
├── desktop/                   # Tauri Desktop Client Codebase
│   ├── src/
│   │   ├── App.tsx            # Adaptive workspace dashboard UI views
│   │   └── App.css            # Glassmorphic CSS style definitions
│   └── package.json           # Vite and react build specifications
└── mobile/                    # Flutter Mobile Companion Codebase
    ├── lib/
    │   ├── main.dart          # Router and ChangeNotifierProvider setup
    │   ├── models/            # Dart models for signal telemetry
    │   ├── services/          # REST api_service and websocket_service
    │   └── pages/             # home_page, focus_page (breathing animation), agent_page, emergency_page
    └── pubspec.yaml           # Flutter pub dependencies configuration
```

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have the following installed on your host system:
* **Docker Engine** (or Docker Desktop)
* **Python 3.12+** (with pip)
* **Node.js v20+** (with npm)

### 2. Configure Environment Secrets
Create a `.env` file under `/backend` (a default `.env` is already configured for local testing):
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/apex
JWT_SECRET_KEY=your_cryptographic_secret_here
GROQ_API_KEY=your_groq_cloud_api_key
UPSTASH_REDIS_REST_URL=your_upstash_rest_endpoint_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token
```

### 3. Bootstrap Containers & Tables
Spin up the local database containers and run the schema setup migration:
```bash
# Start PostgreSQL & Redis
docker compose up -d

# Create all 32 schema tables
cd backend
python init_db.py
```

### 4. Run the Backend Server
Start the FastAPI server listening on `http://localhost:8000`:
```bash
python main.py
```

### 5. Launch Verification Test Pipeline
Verify that security, Upstash Redis endpoints, Groq classifiers, and Socratic challenge grading models run successfully:
```bash
python test_backend.py
```

### 6. Run Clients
* **Desktop App**:
  ```bash
  cd desktop
  npm install
  npm run dev
  ```
* **Mobile Companion**:
  ```bash
  cd mobile
  flutter pub get
  flutter run
  ```

---

## 📋 API Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/v1/auth/register` | `POST` | Public | Create student account |
| `/api/v1/auth/login` | `POST` | Public | Verify user & issue JWT Access/Refresh tokens |
| `/api/v1/cognitive/signals` | `POST` | Bearer | Ingest biometric telemetry and classify state |
| `/api/v1/cognitive/stream` | `WS` | Query | Stateful WebSocket loop streaming raw metrics |
| `/api/v1/agents/status` | `GET` | Bearer | Query operational state of the 5 cognitive agents |
| `/api/v1/agents/socratic/challenge`| `POST` | Bearer | Invoke Groq to generate a Socratic question |
| `/api/v1/agents/socratic/respond` | `POST` | Bearer | Submit a response and receive grades/feedback |
| `/api/v1/agents/deadlines/risk-assessment`| `GET` | Bearer | Sigmoid capacity evaluation for upcoming milestones |

---

## 🧠 Core Agent System & Conflict Resolution

When multiple edge agents propose conflicting actions, the **Orchestrator** resolves them using priority rankings:

1. **Deadline Sentinel (Priority 10)**: Triggers screen lockouts if estimated work > focus capacity left. Overrides Flow states only if time-to-deadline is less than 4 hours.
2. **State Agent (Priority 8)**: Suppresses low-priority interruptions (like WhatsApp notifications or Socratic questions) when the user is determined to be in `Flow`.
3. **Socratic Challenger (Priority 6)**: Injects conceptual text reviews. Only executes when the user is in a `Distracted` state.
4. **Environment Sculptor (Priority 5)**: Applies grayscale screens and closes non-academic browser tabs when distraction levels persist.
