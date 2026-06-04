<div align="center">
  <h1>APEX</h1>
  <p><strong>Adaptive Presence & Execution Intelligence</strong></p>
  <p><i>Your phone understands you. Your workspace adapts to you. A new category of productivity.</i></p>

  <p>
    <a href="#-overview">Overview</a> •
    <a href="#-the-architecture">Architecture</a> •
    <a href="#-the-agents">Agents</a> •
    <a href="#-executive-demo-mode">Demo Mode</a> •
    <a href="#-quick-start">Quick Start</a>
  </p>
</div>

---

## ⚡ Overview

Existing productivity tools fail because they only track task metadata—not the user's cognitive state. They are passive repositories that assume constant mental capacity. 

**APEX** introduces a new paradigm: a **Cognitive Operating Layer**. Built for the iQOO AI ecosystem, APEX acts as a real-time buffer between the user and their digital environment. By using the smartphone as a biometric sensor array and the desktop as an execution canvas, APEX actively senses when a student is distracted, fatigued, or in flow, and **autonomously sculpts the digital workspace** to match their exact cognitive needs.

## 🏗️ The Architecture

APEX operates as a three-tier hybrid edge-cloud orchestration system connected via the **iQOO Office Kit** local bridge:

1. **Sensing Layer (Edge Mobile)**: A Flutter mobile companion running on iQOO hardware that tracks heart rate, HRV, blink rates, and ambient noise to calculate cognitive load.
2. **Execution Layer (Edge Desktop)**: A Tauri-based React/TypeScript desktop application with a dynamic, layout-morphing UI that reorganizes itself entirely based on the user's active context.
3. **Intelligence Layer (Cloud Gateway)**: A FastAPI Python backend powered by PostgreSQL, Redis, and Groq Cloud (`llama-3.1-8b` and `llama-3.3-70b`) to evaluate state, compute deadline risks, and generate Socratic challenges.

## 🧠 The Agent Swarm

APEX does not rely on a single monolithic AI. It employs five specialized, orchestrator-mediated autonomous agents:

* 📊 **State Agent**: Continuously interprets cognitive state (Flow, Distracted, Fatigued, Overloaded) through behavioral and biometric signals with hysteresis smoothing.
* 🛡️ **Deadline Sentinel**: Predicts execution risk *before* the student realizes it. Connects to the syllabus, calculates buffer times, and calculates real-time urgency scores.
* 🪄 **Environment Sculptor**: Actively reshapes the desktop environment. It suppresses unrelated tabs, enables DND, pins relevant PDFs, and locks the workspace into the correct mode without asking.
* 📡 **Peer Radar**: Privately synthesizes academic chatter from study group channels (Discord, WhatsApp) to surface highly relevant insights right when they are needed.
* 🤔 **Socratic Challenger**: Doesn't just give answers. Injects dynamic, contextual prompts to test understanding and defend thesis approaches when cognitive capacity is high.

## 🎬 Executive Demo Mode

APEX includes a cinematic, 78-second autonomous demonstration mode designed for pitch presentations and judging. The demo requires zero manual intervention and showcases the full power of the platform.

### How to run the demo:
1. Start the desktop application (`npm run dev`).
2. Trigger the demo using one of three methods:
   - **Keyboard Shortcut**: Press `CTRL + SHIFT + D`
   - **Command Palette**: Press `CMD/CTRL + K`, search for "Run Judging Demo Sequence", and hit Enter.
   - **Sidebar**: Click the "Run APEX Story" button at the bottom of the navigation menu.

### The Story Arc:
1. **Student Distracted**: 38 minutes before a deadline, high context-switching detected.
2. **State Agent**: Flags cognitive state as `DISTRACTED` with 81% confidence.
3. **Deadline Sentinel**: Evaluates the milestone and calculates an extreme urgency score.
4. **Environment Sculptor**: Intervenes by closing 16 tabs and forcing DND mode.
5. **Workspace Adaptation**: The layout morphs into Research Mode.
6. **Peer Radar**: Surfaces a critical missing insight from a Discord study group.
7. **Socratic Challenger**: Tests the student's understanding before they finalize the draft.
8. **Flow State**: Confidence normalizes, flow state achieved, and risk is massively reduced.

## 🛠️ Technology Stack

* **Backend**: FastAPI (Python 3.12), SQLAlchemy (ORM), asyncpg, WebSockets
* **Data & Cache**: PostgreSQL, Upstash Redis Serverless
* **Desktop Client**: React 19, TypeScript, TailwindCSS 4, Framer Motion, Vite
* **Mobile Companion**: Flutter (Dart)
* **LLM Intelligence**: Groq Cloud (`llama-3.1-8b`, `llama-3.3-70b-versatile`)

---

## 🚀 Quick Start (Local Development)

### 1. Requirements
* Node.js v20+
* Python 3.12+
* Docker (for local Postgres & Redis)
* Flutter SDK (for mobile companion)

### 2. Environment Setup
Create a `.env` file in the `/backend` directory:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/apex
JWT_SECRET_KEY=your_cryptographic_secret
GROQ_API_KEY=your_groq_api_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### 3. Start Backend Services
```bash
cd backend
docker compose up -d
python init_db.py
python main.py
```

### 4. Run Desktop Application
```bash
cd desktop
npm install
npm run dev -- --port 3000
```
Visit `http://localhost:3000` to interact with the execution layer.

### 5. Run Mobile App
```bash
cd mobile
flutter pub get
flutter run
```

---

<div align="center">
  <p><i>Engineered for the iQOO AI Developer Hackathon.</i></p>
</div>
