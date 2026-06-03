# APEX Codebase Implementation Plan

This implementation plan details the step-by-step phases required to build and deploy the **APEX (Adaptive Presence & Execution Intelligence)** ecosystem on top of the design and architecture specs created in Parts 1 to 5.

Given the multi-device and agentic complexity of the product, we propose a modular, phased implementation starting with the backend foundation.

## User Review Required

> [!IMPORTANT]
> Since APEX consists of three distinct codebases (FastAPI Backend, Tauri/Next.js Desktop App, and Flutter Mobile App), we must align on the development sequence. We recommend starting with **Phase 1: FastAPI Core Backend & WebSocket Ingestion Engine** to establish the central data/event hub before building client applications.

> [!WARNING]
> Running system-level commands for Tauri and Flutter will require local installation of Rust, Tauri dependencies, and Flutter SDK on your host system.

## Open Questions

> [!IMPORTANT]
> 1. Do you want to build the complete backend API, WebSocket orchestrator, and database schema first, or would you prefer a vertically integrated prototype (e.g., a simple FastAPI endpoint connected to a barebones Tauri UI)?
> 2. Do you have PostgreSQL, Redis, and a Groq API Key set up locally, or should we include a Docker Compose configuration to bootstrap PostgreSQL and Redis dependencies?
> 3. Should we initialize the backend code files directly in the current workspace directory `c:/Users/GARV ANAND/Downloads/iqoo/` (e.g., under a `/backend` directory)?

---

## Proposed Changes

We will organize the code structure under three main directories in the workspace:
- `/backend` (FastAPI, PostgreSQL DDL, Alembic migrations, WebSocket Gateway, Groq Prompts)
- `/desktop` (Tauri App with Rust backend, Next.js frontend)
- `/mobile` (Flutter Companion App)

### Phase 1: Core Backend & Database Foundation

#### [NEW] [docker-compose.yml](file:///c:/Users/GARV%20ANAND/Downloads/iqoo/docker-compose.yml)
- Docker configuration to run PostgreSQL with `pgvector` and a Redis cluster for pub/sub event bus handling.

#### [NEW] [requirements.txt](file:///c:/Users/GARV%20ANAND/Downloads/iqoo/backend/requirements.txt)
- Python dependency declarations: `fastapi`, `uvicorn`, `sqlalchemy`, `asyncpg`, `websockets`, `redis`, `groq`, `pydantic-settings`, etc.

#### [NEW] [schema.sql](file:///c:/Users/GARV%20ANAND/Downloads/iqoo/backend/database/schema.sql)
- Database creation scripts implementing the 32 table structures including indexing and partitioning tables for high-frequency sensor signal ingestion.

#### [NEW] [main.py](file:///c:/Users/GARV%20ANAND/Downloads/iqoo/backend/app/main.py)
- Main FastAPI application setup, middleware configurations (CORS, Rate Limiting), database connection pool setup, and server routing.

#### [NEW] [websocket_manager.py](file:///c:/Users/GARV%20ANAND/Downloads/iqoo/backend/app/core/websocket_manager.py)
- Stateful connection manager for handling bi-directional real-time communication with client devices.

#### [NEW] [auth.py](file:///c:/Users/GARV%20ANAND/Downloads/iqoo/backend/app/api/auth.py)
- Authentication endpoints (register, login, refresh, logout) utilizing JWT.

#### [NEW] [cognitive.py](file:///c:/Users/GARV%20ANAND/Downloads/iqoo/backend/app/api/cognitive.py)
- Cognitive signal ingestion endpoint (`/api/v1/cognitive/signals`) and state evaluation engine integration.

---

## Verification Plan

### Automated Tests
- Python integration tests using `pytest` and `httpx.AsyncClient` to verify auth flows and signal ingestion payloads.
- Websocket performance testing scripts in `/scratch` to simulate high-frequency streams from 10+ concurrent virtual clients.

### Manual Verification
- Deploy local containers via Docker Compose and inspect logs.
- Trigger HTTP REST endpoints using Postman or cURL.
