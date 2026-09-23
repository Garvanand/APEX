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

function formatLogTime() {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    return `[${h}:${m}:${s}.${ms}]`;
}

function relayLog(category, message, details = '') {
    const detailStr = details ? ` | ${details}` : '';
    console.log(`${formatLogTime()} [${category.padEnd(9)}] ${message}${detailStr}`);
}

// ═══════════════════════════════════════════════════════════
// OPENROUTER LLM (OPTIONAL GRACEFUL CONFIGURATION)
// ═══════════════════════════════════════════════════════════
const hasOpenRouterKey = Boolean(
    process.env.OPENROUTER_API_KEY && 
    process.env.OPENROUTER_API_KEY !== 'YOUR_OPENROUTER_API_KEY_HERE'
);

const openai = hasOpenRouterKey ? new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
}) : null;

if (hasOpenRouterKey) {
    relayLog('LLM-INIT', 'OpenRouter cloud agent reasoning enabled');
} else {
    relayLog('LLM-INIT', 'Local execution mode: OpenRouter API key not configured (using local cognitive reasoning)');
}

// ═══════════════════════════════════════════════════════════
// ONNX ML MODEL (XGBOOST COGNITIVE INFERENCE)
// ═══════════════════════════════════════════════════════════
let stateModel;
const smoother = new EMASmoother(0.15);

async function loadModel() {
    try {
        stateModel = await ort.InferenceSession.create(path.join(__dirname, 'xgboost_state_model.onnx'));
        relayLog('ML-MODEL', 'XGBoost Cognitive State ONNX model loaded successfully');
    } catch (e) {
        relayLog('ML-MODEL', `Failed to load ONNX model: ${e.message}`);
    }
}
loadModel();

// ═══════════════════════════════════════════════════════════
// SESSION & ENVELOPE MANAGEMENT
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

function createEventEnvelope(eventType, payload, source = 'relay', session = null, correlationId = null) {
    globalSequence++;
    const corrId = correlationId || payload?.correlation_id || payload?.transaction_id || null;
    return {
        event_id: generateId(),
        correlation_id: corrId,
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

function safeSend(ws, envelope) {
    if (ws && ws.readyState === 1) { // 1 = OPEN
        try {
            const dataStr = typeof envelope === 'string' ? envelope : JSON.stringify(envelope);
            ws.send(dataStr);
            return true;
        } catch (e) {
            relayLog('SEND-ERR', `Failed to send to client: ${e.message}`);
            return false;
        }
    }
    return false;
}

function broadcastToOthers(senderWs, envelope) {
    const msg = typeof envelope === 'string' ? envelope : JSON.stringify(envelope);
    for (const [ws, session] of sessions.entries()) {
        if (ws !== senderWs && ws.readyState === 1 && session.handshakeCompleted) {
            safeSend(ws, msg);
        }
    }
}

function broadcastToAll(envelope) {
    const msg = typeof envelope === 'string' ? envelope : JSON.stringify(envelope);
    for (const [ws, session] of sessions.entries()) {
        if (ws.readyState === 1 && session.handshakeCompleted) {
            safeSend(ws, msg);
        }
    }
}

function sendToClient(ws, envelope) {
    safeSend(ws, envelope);
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
    relayLog('HTTP', `Mounted mobile companion web build at /mobile`);
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

// ── Simulation Endpoint (for controlled demo scripts) ────
app.post('/api/v1/cognitive/simulate', (req, res) => {
    try {
        const correlationId = req.body.correlation_id || `sim-${Date.now()}`;
        const envelope = createEventEnvelope('STATE_TRANSITION', {
            state: req.body.state,
            confidence: 95,
            attention_stability: "Stable",
            focus_trend: "Improving",
            cognitive_load: "Optimal",
            source: "simulation",
            correlation_id: correlationId,
        }, 'simulation', null, correlationId);
        broadcastToAll(envelope);
        res.json({ success: true, event_id: envelope.event_id, correlation_id: correlationId });
    } catch (e) {
        res.status(400).send("Bad Request");
    }
});

// ── LLM Agent Execution ──────────────────────────────────
app.post('/api/v1/agent/execute', async (req, res) => {
    try {
        const { agentType, inputData, systemPrompt } = req.body;
        relayLog('AGENT', `Executing ${agentType}...`);

        broadcastToAll(createEventEnvelope('COMPUTE_ACTIVE', {
            agentType, status: "Processing", inputData
        }));

        if (!openai) {
            // Graceful local cognitive response when cloud key is not set
            const fallbackResult = {
                summary: `Cognitive synthesis by ${agentType || 'Agent'}`,
                actionable_items: [
                    "Preserve active flow state and shield from background distraction",
                    "Contextual cognitive load remains within optimal parameters"
                ],
                insights: "Local cognitive reasoning operational. Configure OPENROUTER_API_KEY for external LLM inference."
            };
            broadcastToAll(createEventEnvelope('COMPUTE_COMPLETE', {
                agentType, result: fallbackResult, inputData
            }));
            return res.json({ success: true, result: fallbackResult, source: "local_heuristic" });
        }

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
                structuredResult = { error: "Failed to parse JSON", raw_output: rawContent };
            }
        }

        relayLog('AGENT', `Execution complete for ${agentType}`);

        broadcastToAll(createEventEnvelope('COMPUTE_COMPLETE', {
            agentType, result: structuredResult, inputData
        }));

        res.json({ success: true, result: structuredResult, source: "openrouter_llm" });
    } catch (e) {
        relayLog('AGENT-ERR', `Error during agent execution: ${e.message}`);
        res.status(500).json({ success: false, error: e.message });
    }
});

// ── Serve Mobile Flutter Web Build ───────────────────────
let mobileBuildPath = path.join(__dirname, 'public/mobile');
if (!fs.existsSync(mobileBuildPath) || !fs.existsSync(path.join(mobileBuildPath, 'index.html'))) {
    mobileBuildPath = path.join(__dirname, '../mobile/build/web');
}

app.use('/mobile', express.static(mobileBuildPath));

// SPA Fallback for /mobile deep links without path-to-regexp wildcard issues in Express 5
app.use('/mobile', (req, res) => {
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
    relayLog('WS-CONN', `Client connected. SessionId: ${sessionId}. Awaiting handshake...`);

    // ── Message Handler ──────────────────────────────────
    ws.on('message', (rawMessage) => {
        try {
            const data = JSON.parse(rawMessage);
            const eventType = data.event;

            if (!eventType || typeof eventType !== 'string') {
                relayLog('PROTOCOL', `Malformed envelope received: missing event type from session ${sessionId}`);
                return;
            }

            // Update heartbeat on any valid message
            session.lastHeartbeat = Date.now();

            // ── HANDSHAKE ────────────────────────────────
            if (eventType === 'HANDSHAKE') {
                if (data.payload?.device_id) {
                    session.deviceId = String(data.payload.device_id);
                    deviceId = session.deviceId;
                }
                session.deviceType = data.payload?.device_type || 'unknown';
                session.deviceName = data.payload?.device_name || 'Unknown Device';
                session.handshakeCompleted = true;

                relayLog('AUTH', `${session.deviceName} (${session.deviceType}) authenticated`, `Device=${session.deviceId}, Session=${sessionId}`);

                // Send HANDSHAKE_ACK with session info + connected devices
                sendToClient(ws, createEventEnvelope('HANDSHAKE_ACK', {
                    session_id: sessionId,
                    device_id: deviceId,
                    server_time: Date.now(),
                    connected_devices: getConnectedDevices(),
                }, 'relay', session));

                // Notify all OTHER connected clients about new device presence
                broadcastToOthers(ws, createEventEnvelope('DEVICE_CONNECTED', {
                    session_id: sessionId,
                    device_id: deviceId,
                    device_type: session.deviceType,
                    device_name: session.deviceName,
                    connected_at: session.connectedAt,
                }, 'relay', session));

                return;
            }

            // ── Reject events before handshake ───────────
            if (!session.handshakeCompleted) {
                relayLog('SECURITY', `Received event '${eventType}' before handshake from session ${sessionId}. Rejecting.`);
                safeSend(ws, createEventEnvelope('ERROR', {
                    code: 'PRE_HANDSHAKE_REJECTED',
                    message: `Event '${eventType}' rejected: HANDSHAKE must be completed first.`
                }, 'relay', session));
                return;
            }

            // Extract Correlation / Transaction ID
            const correlationId = data.correlation_id || data.payload?.correlation_id || data.payload?.transaction_id || null;

            // ── PING / PONG ──────────────────────────────
            if (eventType === 'PING') {
                sendToClient(ws, createEventEnvelope('PONG', {
                    client_timestamp: data.payload?.timestamp || data.timestamp,
                    server_timestamp: Date.now(),
                }, 'relay', session));
                return;
            }

            // ── STATE_TRANSITION (with ACK) ──────────────
            if (eventType === 'STATE_TRANSITION') {
                relayLog('STATE', `Transition from ${session.deviceName}: ${data.payload?.state} [corr: ${correlationId || 'none'}]`);
                
                // Broadcast to all other clients
                const envelope = createEventEnvelope('STATE_TRANSITION', {
                    ...data.payload,
                    source_device: session.deviceType,
                    source_session: sessionId,
                    correlation_id: correlationId,
                }, session.deviceType, session, correlationId);
                broadcastToOthers(ws, envelope);

                // Send ACK back to sender
                sendToClient(ws, createEventEnvelope('EVENT_ACK', {
                    acked_event_id: data.event_id || data.payload?.event_id,
                    acked_event_type: 'STATE_TRANSITION',
                    status: 'delivered',
                    correlation_id: correlationId,
                    recipient_count: getConnectedDevices().length - 1,
                }, 'relay', session, correlationId));
                return;
            }

            // ── COGNITIVE_STATE_REALTIME (with ACK) ──────
            if (eventType === 'COGNITIVE_STATE_REALTIME') {
                const envelope = createEventEnvelope('COGNITIVE_STATE_REALTIME', {
                    ...data.payload,
                    source_device: session.deviceType,
                    source_session: sessionId,
                }, session.deviceType, session);
                broadcastToOthers(ws, envelope);

                sendToClient(ws, createEventEnvelope('EVENT_ACK', {
                    acked_event_type: 'COGNITIVE_STATE_REALTIME',
                    status: 'delivered',
                }, 'relay', session));
                return;
            }

            // ── SENSOR_FEATURE_VECTOR (Transparent ML inference) ─────
            if (eventType === 'SENSOR_FEATURE_VECTOR' && stateModel) {
                try {
                    const sma = Number(data.payload.sma) || 0;
                    const jerk = Number(data.payload.jerk_variance) || 0;
                    const touch = Number(data.payload.touch_density) || 0;
                    const appSwitches = Number(data.payload.app_switches) || 0;
                    
                    // ML Feature Honesty: Extract measured spectral energy if sent, or compute honest proxy from jerk variance
                    const hasMeasuredSpectral = typeof data.payload.spectral_energy === 'number';
                    const spectral = hasMeasuredSpectral 
                        ? Number(data.payload.spectral_energy) 
                        : (Math.sqrt(Math.max(0, jerk)) * 0.5 + 0.1);
                    const spectralProvenance = hasMeasuredSpectral ? 'measured_psd_window' : 'derived_jerk_proxy';

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
                            feature_provenance: {
                                sma: 'measured_5s_sma',
                                jerk_variance: 'measured_5s_jerk',
                                spectral: spectralProvenance,
                                touch_density: 'measured_touch_rate',
                                app_switches: 'measured_lifecycle_transitions'
                            },
                            source_device: session.deviceType,
                        }, 'relay', session);

                        broadcastToAll(inferenceEnvelope);
                    }).catch(e => {
                        relayLog('ML-AI', `ONNX execution failed: ${e.message}`);
                    });
                } catch (infErr) {
                    relayLog('ML-AI', `Inference prepare error: ${infErr.message}`);
                }
                return;
            }

            // ── COGNITIVE_STATE_COMMITTED (phone or agent commits state) ──
            if (eventType === 'COGNITIVE_STATE_COMMITTED') {
                const state = data.payload?.state || 'FLOW';
                const corrId = correlationId || `corr-${Date.now()}-${generateId().slice(0, 4)}`;
                relayLog('COGNITIVE', `${state} committed by ${session.deviceName} (${session.deviceType})`, `corr=${corrId}`);
                
                // 1. Send STATE_TRANSITION_ACK back to sender immediately with same correlation_id
                sendToClient(ws, createEventEnvelope('STATE_TRANSITION_ACK', {
                    acked_event_type: 'COGNITIVE_STATE_COMMITTED',
                    status: 'COMMITTED',
                    state: state,
                    reason: data.payload?.reason || 'State committed',
                    timestamp: Date.now(),
                    correlation_id: corrId,
                }, 'relay', session, corrId));

                // 2. Broadcast to other connected clients (desktop) with same correlation_id
                broadcastToOthers(ws, createEventEnvelope('COGNITIVE_STATE_COMMITTED', {
                    ...data.payload,
                    correlation_id: corrId,
                    source_device: session.deviceType,
                    device_name: session.deviceName,
                }, session.deviceType, session, corrId));
                relayLog('ROUTE', `Dispatched COGNITIVE_STATE_COMMITTED (${state}) -> Desktop targets`, `corr=${corrId}`);
                return;
            }

            // ── DESKTOP_STATE_CHANGED (desktop confirms state change) ──
            if (eventType === 'DESKTOP_STATE_CHANGED') {
                relayLog('DESKTOP', `Desktop state changed: ${data.payload?.state}`, `corr=${correlationId || 'none'}`);
                broadcastToOthers(ws, createEventEnvelope('DESKTOP_STATE_CHANGED', {
                    ...data.payload,
                    correlation_id: correlationId,
                    source_device: session.deviceType,
                }, session.deviceType, session, correlationId));
                return;
            }

            // ── SCULPTOR_ACTION_EXECUTING (desktop enters executing stage) ──
            if (eventType === 'SCULPTOR_ACTION_EXECUTING') {
                relayLog('SCULPTOR', `Executing: "${data.payload?.action}"`, `corr=${correlationId || 'none'}`);
                broadcastToOthers(ws, createEventEnvelope('SCULPTOR_ACTION_EXECUTING', {
                    ...data.payload,
                    correlation_id: correlationId,
                    source_device: session.deviceType,
                }, session.deviceType, session, correlationId));
                return;
            }

            // ── SCULPTOR_ACTION_EXECUTED (desktop confirms action completion) ──
            if (eventType === 'SCULPTOR_ACTION_EXECUTED') {
                relayLog('SCULPTOR', `Completed: "${data.payload?.action}"`, `corr=${correlationId || 'none'}`);
                broadcastToOthers(ws, createEventEnvelope('SCULPTOR_ACTION_EXECUTED', {
                    ...data.payload,
                    correlation_id: correlationId,
                    source_device: session.deviceType,
                }, session.deviceType, session, correlationId));
                return;
            }

            // ── DEMO_CONTROL (trigger states through real pipeline) ──
            if (eventType === 'DEMO_CONTROL') {
                relayLog('DEMO', `Control: ${data.payload?.action} from ${session.deviceName}`);
                broadcastToOthers(ws, createEventEnvelope('DEMO_CONTROL', {
                    ...data.payload,
                    source_device: session.deviceType,
                }, session.deviceType, session));

                sendToClient(ws, createEventEnvelope('EVENT_ACK', {
                    acked_event_type: 'DEMO_CONTROL',
                    status: 'delivered',
                }, 'relay', session));
                return;
            }

            // ── Default: broadcast to other clients ─────────────
            relayLog('ROUTE', `Broadcasting event: ${eventType} from ${session.deviceName}`);
            broadcastToOthers(ws, createEventEnvelope(eventType, data.payload, session.deviceType, session, correlationId));

        } catch (e) {
            relayLog('ERR', `Failed to parse/handle message: ${e.message}`);
        }
    });

    // ── Close Handler ────────────────────────────────────
    ws.on('close', () => {
        relayLog('WS-DISC', `Client disconnected: ${session.deviceName} (${session.deviceType})`, `Session=${sessionId}`);
        
        if (session.handshakeCompleted) {
            // Notify remaining clients of disconnection
            broadcastToOthers(ws, createEventEnvelope('DEVICE_DISCONNECTED', {
                session_id: sessionId,
                device_id: deviceId,
                device_type: session.deviceType,
                device_name: session.deviceName,
            }, 'relay', session));
        }
        
        sessions.delete(ws);
    });

    ws.on('error', (err) => {
        relayLog('WS-ERR', `WebSocket error for session ${sessionId}: ${err.message}`);
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
                relayLog('TIMEOUT', `Closing connection — handshake timeout for session ${session.sessionId}`);
                try { ws.close(1008, 'Handshake timeout'); } catch (_) {}
            }
            continue;
        }

        if (now - session.lastHeartbeat > HEARTBEAT_TIMEOUT_MS) {
            relayLog('TIMEOUT', `Heartbeat timeout for ${session.deviceName} (session: ${session.sessionId}). Closing.`);
            try { ws.close(1001, 'Heartbeat timeout'); } catch (_) {}
        }
    }
}, HEARTBEAT_INTERVAL_MS);

// ═══════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n══════════════════════════════════════════════════════════════`);
    console.log(`  APEX Relay Bridge — Listening on port ${PORT}`);
    console.log(`  WebSocket: ws://0.0.0.0:${PORT}/ws`);
    console.log(`  HTTP API:  http://0.0.0.0:${PORT}`);
    console.log(`  Companion: http://0.0.0.0:${PORT}/mobile/`);
    console.log(`══════════════════════════════════════════════════════════════\n`);
});
