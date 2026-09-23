const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const OpenAI = require('openai');
const ort = require('onnxruntime-node');
const EMASmoother = require('./ema_smoother.cjs');

// ═══════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════
const PORT = 8080;
const HEARTBEAT_INTERVAL_MS = 5000;
const HEARTBEAT_TIMEOUT_MS = 15000;

// ═══════════════════════════════════════════════════════════
// OPENROUTER LLM
// ═══════════════════════════════════════════════════════════
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY_HERE",
});

// ═══════════════════════════════════════════════════════════
// ONNX ML MODEL
// ═══════════════════════════════════════════════════════════
let stateModel;
const smoother = new EMASmoother(0.15);

async function loadModel() {
    try {
        stateModel = await ort.InferenceSession.create(path.join(__dirname, 'xgboost_state_model.onnx'));
        console.log("[Relay-AI] XGBoost Cognitive State Model loaded successfully.");
    } catch (e) {
        console.error("[Relay-AI] Failed to load ONNX model:", e.message);
    }
}
loadModel();

// ═══════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════
/** @type {Map<WebSocket, ClientSession>} */
const sessions = new Map();
let globalSequence = 0;

/**
 * @typedef {Object} ClientSession
 * @property {string} sessionId
 * @property {string} deviceId
 * @property {string} deviceType - 'mobile' | 'desktop' | 'unknown'
 * @property {string} deviceName
 * @property {number} connectedAt
 * @property {number} lastHeartbeat
 * @property {number} lastSequence
 * @property {boolean} handshakeCompleted
 */

function generateId() {
    return crypto.randomBytes(8).toString('hex');
}

function createEventEnvelope(eventType, payload, source = 'relay', session = null) {
    globalSequence++;
    return {
        event_id: generateId(),
        session_id: session ? session.sessionId : null,
        device_id: session ? session.deviceId : null,
        device_type: session ? session.deviceType : null,
        timestamp: Date.now(),
        source: source,
        sequence: globalSequence,
        event: eventType,
        payload: payload
    };
}

function getConnectedDevices() {
    const devices = [];
    for (const [ws, session] of sessions.entries()) {
        if (session.handshakeCompleted && ws.readyState === 1) {
            devices.push({
                session_id: session.sessionId,
                device_id: session.deviceId,
                device_type: session.deviceType,
                device_name: session.deviceName,
                connected_at: session.connectedAt,
                last_heartbeat: session.lastHeartbeat,
            });
        }
    }
    return devices;
}

function broadcastToOthers(senderWs, envelope) {
    const msg = JSON.stringify(envelope);
    for (const [ws, session] of sessions.entries()) {
        if (ws !== senderWs && ws.readyState === 1 && session.handshakeCompleted) {
            ws.send(msg);
        }
    }
}

function broadcastToAll(envelope) {
    const msg = JSON.stringify(envelope);
    for (const [ws, session] of sessions.entries()) {
        if (ws.readyState === 1 && session.handshakeCompleted) {
            ws.send(msg);
        }
    }
}

function sendToClient(ws, envelope) {
    if (ws.readyState === 1) {
        ws.send(JSON.stringify(envelope));
    }
}

// ═══════════════════════════════════════════════════════════
// EXPRESS APP
// ═══════════════════════════════════════════════════════════
const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());

// ── Static Web Serving ───────────────────────────────────
const mobilePublicDir = path.join(__dirname, 'public', 'mobile');
if (fs.existsSync(mobilePublicDir)) {
    app.use('/mobile', express.static(mobilePublicDir));
    console.log(`[Relay] Mounted mobile web companion at /mobile`);
}

// ── Network Info ─────────────────────────────────────────
app.get('/api/v1/network/info', (req, res) => {
    const nets = os.networkInterfaces();
    let localIp = '127.0.0.1';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
            if (net.family === familyV4Value && !net.internal) {
                if (net.address.startsWith('192.') || net.address.startsWith('172.') || net.address.startsWith('10.')) {
                    localIp = net.address;
                }
            }
        }
    }
    res.json({ ip: localIp, port: PORT });
});

// ── Connected Devices ────────────────────────────────────
app.get('/api/v1/devices', (req, res) => {
    res.json({ devices: getConnectedDevices() });
});

// ── Simulation Endpoint (for backend/test scripts) ───────
app.post('/api/v1/cognitive/simulate', (req, res) => {
    try {
        const envelope = createEventEnvelope('STATE_TRANSITION', {
            state: req.body.state,
            confidence: 95,
            attention_stability: "Stable",
            focus_trend: "Improving",
            cognitive_load: "Optimal",
            source: "simulation"
        });
        broadcastToAll(envelope);
        res.json({ success: true, event_id: envelope.event_id });
    } catch (e) {
        res.status(400).send("Bad Request");
    }
});

// ── LLM Agent Execution ──────────────────────────────────
app.post('/api/v1/agent/execute', async (req, res) => {
    try {
        const { agentType, inputData, systemPrompt } = req.body;
        console.log(`[Relay-Muscle] Executing ${agentType} via OpenRouter...`);

        broadcastToAll(createEventEnvelope('COMPUTE_ACTIVE', {
            agentType, status: "Processing", inputData
        }));

        const enforcedPrompt = `${systemPrompt}\n\nIMPORTANT: You MUST respond ONLY with a valid, raw JSON object. Do NOT include markdown blocks (like \`\`\`json), do NOT include backticks, and do NOT include any conversational text like "Here is the JSON". Your entire output must be purely valid JSON that can be parsed by JSON.parse().`;

        const response = await openai.chat.completions.create({
            model: "minimax/minimax-m3",
            messages: [
                { role: "system", content: enforcedPrompt },
                { role: "user", content: inputData }
            ],
            response_format: { type: "json_object" }
        });

        const rawContent = response.choices[0].message.content;
        let structuredResult;
        try {
            structuredResult = JSON.parse(rawContent);
        } catch (e) {
            try {
                let stripped = rawContent.replace(/```json/ig, '').replace(/```/g, '').trim();
                const firstBrace = stripped.indexOf('{');
                const lastBrace = stripped.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace > firstBrace) {
                    stripped = stripped.substring(firstBrace, lastBrace + 1);
                }
                structuredResult = JSON.parse(stripped);
            } catch (fallbackErr) {
                console.error(`[Relay-Muscle] Failed to parse JSON. Raw:`, rawContent);
                structuredResult = { error: "Failed to parse JSON", raw_output: rawContent };
            }
        }

        console.log(`[Relay-Muscle] Execution complete for ${agentType}.`);

        broadcastToAll(createEventEnvelope('COMPUTE_COMPLETE', {
            agentType, result: structuredResult, inputData
        }));

        res.json({ success: true, result: structuredResult });
    } catch (e) {
        console.error("[Relay-Muscle] Error:", e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── Serve Mobile Flutter Web Build ───────────────────────
let mobileBuildPath = path.join(__dirname, 'public/mobile');
if (!fs.existsSync(mobileBuildPath) || !fs.existsSync(path.join(mobileBuildPath, 'index.html'))) {
    mobileBuildPath = path.join(__dirname, '../mobile/build/web');
}
console.log(`[Relay] Serving mobile Flutter app from: ${mobileBuildPath}`);
app.use('/mobile', express.static(mobileBuildPath));

app.get('/', (req, res) => {
    res.redirect('/mobile/');
});

app.get(/^\/mobile(\/.*)?$/, (req, res) => {
    const indexPath = path.join(mobileBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Mobile app build index.html not found');
    }
});

// ═══════════════════════════════════════════════════════════
// WEBSOCKET SERVER
// ═══════════════════════════════════════════════════════════
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    const sessionId = generateId();
    let deviceId = generateId();
    
    /** @type {ClientSession} */
    const session = {
        sessionId,
        deviceId,
        deviceType: 'unknown',
        deviceName: 'Unknown Device',
        connectedAt: Date.now(),
        lastHeartbeat: Date.now(),
        lastSequence: 0,
        handshakeCompleted: false,
    };
    
    sessions.set(ws, session);
    console.log(`[Relay] New connection. SessionId: ${sessionId}. Awaiting handshake...`);

    // ── Message Handler ──────────────────────────────────
    ws.on('message', (rawMessage) => {
        try {
            const data = JSON.parse(rawMessage);
            const eventType = data.event;

            // Update heartbeat on any message
            session.lastHeartbeat = Date.now();

            // ── HANDSHAKE ────────────────────────────────
            if (eventType === 'HANDSHAKE') {
                if (data.payload?.device_id) {
                    session.deviceId = data.payload.device_id;
                    deviceId = data.payload.device_id;
                }
                session.deviceType = data.payload?.device_type || 'unknown';
                session.deviceName = data.payload?.device_name || 'Unknown Device';
                session.handshakeCompleted = true;

                console.log(`[Relay] Handshake complete: ${session.deviceName} (${session.deviceType}) — Session: ${sessionId}`);

                // Send HANDSHAKE_ACK with session info + connected devices
                sendToClient(ws, createEventEnvelope('HANDSHAKE_ACK', {
                    session_id: sessionId,
                    device_id: deviceId,
                    server_time: Date.now(),
                    connected_devices: getConnectedDevices(),
                }));

                // Notify all OTHER connected clients about new device
                broadcastToOthers(ws, createEventEnvelope('DEVICE_CONNECTED', {
                    session_id: sessionId,
                    device_id: deviceId,
                    device_type: session.deviceType,
                    device_name: session.deviceName,
                    connected_at: session.connectedAt,
                }));

                return;
            }

            // ── Reject events before handshake ───────────
            if (!session.handshakeCompleted) {
                console.warn(`[Relay] Received event '${eventType}' before handshake from session ${sessionId}. Ignoring.`);
                return;
            }

            // ── PING / PONG ──────────────────────────────
            if (eventType === 'PING') {
                sendToClient(ws, createEventEnvelope('PONG', {
                    client_timestamp: data.payload?.timestamp || data.timestamp,
                    server_timestamp: Date.now(),
                }));
                return;
            }

            // ── STATE_TRANSITION (with ACK) ──────────────
            if (eventType === 'STATE_TRANSITION') {
                console.log(`[Relay] State transition from ${session.deviceName}: ${data.payload?.state}`);
                
                // Broadcast to all other clients
                const envelope = createEventEnvelope('STATE_TRANSITION', {
                    ...data.payload,
                    source_device: session.deviceType,
                    source_session: sessionId,
                }, session.deviceType);
                broadcastToOthers(ws, envelope);

                // Send ACK back to sender
                sendToClient(ws, createEventEnvelope('EVENT_ACK', {
                    acked_event_id: data.event_id || data.payload?.event_id,
                    acked_event_type: 'STATE_TRANSITION',
                    status: 'delivered',
                    recipient_count: getConnectedDevices().length - 1,
                }));
                return;
            }

            // ── COGNITIVE_STATE_REALTIME (with ACK) ──────
            if (eventType === 'COGNITIVE_STATE_REALTIME') {
                // Broadcast to others (e.g. desktop receives mobile sensor data)
                const envelope = createEventEnvelope('COGNITIVE_STATE_REALTIME', {
                    ...data.payload,
                    source_device: session.deviceType,
                    source_session: sessionId,
                }, session.deviceType);
                broadcastToOthers(ws, envelope);

                // Send ACK
                sendToClient(ws, createEventEnvelope('EVENT_ACK', {
                    acked_event_type: 'COGNITIVE_STATE_REALTIME',
                    status: 'delivered',
                }));
                return;
            }

            // ── SENSOR_FEATURE_VECTOR (ML inference) ─────
            if (eventType === 'SENSOR_FEATURE_VECTOR' && stateModel) {
                try {
                    const sma = data.payload.sma || 0;
                    const jerk = data.payload.jerk_variance || 0;
                    const touch = data.payload.touch_density || 0;
                    const appSwitches = data.payload.app_switches || 0;
                    const spectral = 1.0; // Derived feature

                    const tensorData = Float32Array.from([sma, jerk, spectral, touch, appSwitches]);
                    const tensor = new ort.Tensor('float32', tensorData, [1, 5]);
                    const feeds = { float_input: tensor };

                    stateModel.run(feeds).then(results => {
                        const probabilities = results.probabilities.data;
                        const smoothed = smoother.update(probabilities);

                        const stateNames = ["Flow", "Distracted", "Fatigued", "Overloaded"];
                        const cognitiveState = stateNames[smoothed.stateIndex] || "Flow";

                        let distractionScore = 0, fatigueScore = 0;
                        let flowConfidence = Math.round(smoothed.probabilities[0] * 100);

                        if (smoothed.stateIndex === 1 || smoothed.probabilities[1] > 0.7) {
                            distractionScore = Math.round(smoothed.probabilities[1] * 100);
                        } else if (smoothed.stateIndex === 2 || smoothed.probabilities[2] > 0.7) {
                            fatigueScore = Math.round(smoothed.probabilities[2] * 100);
                        } else if (smoothed.stateIndex === 3 || smoothed.probabilities[3] > 0.7) {
                            distractionScore = 100;
                            fatigueScore = 100;
                        }

                        const inferenceEnvelope = createEventEnvelope('ML_INFERENCE_RESULT', {
                            state: cognitiveState,
                            distractionScore,
                            flowConfidence,
                            fatigueScore,
                            probabilities: Array.from(smoothed.probabilities),
                            inference_source: 'onnx_xgboost',
                            source_device: session.deviceType,
                        }, 'relay');

                        // Broadcast ML result to ALL clients (including sender)
                        broadcastToAll(inferenceEnvelope);
                    });
                } catch (infErr) {
                    console.error("[Relay-AI] Inference Error:", infErr);
                }
                return;
            }

            // ── DEMO_CONTROL (trigger states through real pipeline) ──
            if (eventType === 'DEMO_CONTROL') {
                console.log(`[Relay] Demo control: ${data.payload?.action} from ${session.deviceName}`);
                // Forward demo control to all other clients
                broadcastToOthers(ws, createEventEnvelope('DEMO_CONTROL', {
                    ...data.payload,
                    source_device: session.deviceType,
                }, session.deviceType));

                // ACK
                sendToClient(ws, createEventEnvelope('EVENT_ACK', {
                    acked_event_type: 'DEMO_CONTROL',
                    status: 'delivered',
                }));
                return;
            }

            // ── COGNITIVE_STATE_COMMITTED (phone or agent commits state) ──
            if (eventType === 'COGNITIVE_STATE_COMMITTED') {
                const state = data.payload?.state || 'FLOW';
                console.log(`[Relay] State committed: ${state} from ${session.deviceName} (${session.deviceType})`);
                
                // 1. Send STATE_TRANSITION_ACK back to sender immediately
                sendToClient(ws, createEventEnvelope('STATE_TRANSITION_ACK', {
                    acked_event_type: 'COGNITIVE_STATE_COMMITTED',
                    status: 'COMMITTED',
                    state: state,
                    reason: data.payload?.reason || 'State committed',
                    timestamp: Date.now(),
                }, 'relay', session));

                // 2. Broadcast to other connected clients (desktop)
                broadcastToOthers(ws, createEventEnvelope('COGNITIVE_STATE_COMMITTED', {
                    ...data.payload,
                    source_device: session.deviceType,
                    device_name: session.deviceName,
                }, session.deviceType));
                return;
            }

            // ── DESKTOP_STATE_CHANGED (desktop confirms state change) ──
            if (eventType === 'DESKTOP_STATE_CHANGED') {
                console.log(`[Relay] Desktop state changed: ${data.payload?.state}`);
                broadcastToOthers(ws, createEventEnvelope('DESKTOP_STATE_CHANGED', {
                    ...data.payload,
                    source_device: session.deviceType,
                }, session.deviceType));
                return;
            }

            // ── SCULPTOR_ACTION_EXECUTED (desktop confirms action) ──
            if (eventType === 'SCULPTOR_ACTION_EXECUTED') {
                console.log(`[Relay] Sculptor action executed: ${data.payload?.action}`);
                broadcastToOthers(ws, createEventEnvelope('SCULPTOR_ACTION_EXECUTED', {
                    ...data.payload,
                    source_device: session.deviceType,
                }, session.deviceType));
                return;
            }

            // ── Default: broadcast to others ─────────────
            console.log(`[Relay] Broadcasting event: ${eventType} from ${session.deviceName}`);
            broadcastToOthers(ws, createEventEnvelope(eventType, data.payload, session.deviceType));

        } catch (e) {
            console.error('[Relay] Failed to parse/handle message:', e.message);
        }
    });

    // ── Close Handler ────────────────────────────────────
    ws.on('close', () => {
        console.log(`[Relay] Client disconnected: ${session.deviceName} (${session.deviceType}) — Session: ${sessionId}`);
        
        if (session.handshakeCompleted) {
            // Notify remaining clients
            broadcastToOthers(ws, createEventEnvelope('DEVICE_DISCONNECTED', {
                session_id: sessionId,
                device_id: deviceId,
                device_type: session.deviceType,
                device_name: session.deviceName,
            }));
        }
        
        sessions.delete(ws);
    });

    ws.on('error', (err) => {
        console.error(`[Relay] WebSocket error for session ${sessionId}:`, err.message);
    });
});

// ═══════════════════════════════════════════════════════════
// HEARTBEAT MONITOR
// ═══════════════════════════════════════════════════════════
setInterval(() => {
    const now = Date.now();
    for (const [ws, session] of sessions.entries()) {
        if (!session.handshakeCompleted) {
            // Give 10 seconds for handshake
            if (now - session.connectedAt > 10000) {
                console.warn(`[Relay] Closing connection — handshake timeout for session ${session.sessionId}`);
                ws.close(1008, 'Handshake timeout');
            }
            continue;
        }

        if (now - session.lastHeartbeat > HEARTBEAT_TIMEOUT_MS) {
            console.warn(`[Relay] Heartbeat timeout for ${session.deviceName} (session: ${session.sessionId}). Closing.`);
            ws.close(1001, 'Heartbeat timeout');
        }
    }
}, HEARTBEAT_INTERVAL_MS);

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n══════════════════════════════════════════════`);
    console.log(`  APEX Relay Bridge — Listening on port ${PORT}`);
    console.log(`  WebSocket: ws://0.0.0.0:${PORT}`);
    console.log(`  HTTP API:  http://0.0.0.0:${PORT}`);
    console.log(`══════════════════════════════════════════════\n`);
});
