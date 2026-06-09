const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const os = require('os');
const OpenAI = require('openai');
const ort = require('onnxruntime-node');
const EMASmoother = require('./ema_smoother.cjs');

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY_HERE",
});

let stateModel;
const smoother = new EMASmoother(0.15);

// Load ONNX model asynchronously
async function loadModel() {
    try {
        stateModel = await ort.InferenceSession.create(path.join(__dirname, 'xgboost_state_model.onnx'));
        console.log("[Relay-AI] XGBoost Cognitive State Model loaded successfully.");
    } catch (e) {
        console.error("[Relay-AI] Failed to load ONNX model:", e);
    }
}
loadModel();

const app = express();

// Enable CORS for API routes if needed
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Parse JSON bodies
app.use(express.json());

// Get local IP Endpoint
app.get('/api/v1/network/info', (req, res) => {
    const nets = os.networkInterfaces();
    let localIp = '127.0.0.1';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or string 'IPv4'
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
            if (net.family === familyV4Value && !net.internal) {
                if (net.address.startsWith('192.') || net.address.startsWith('172.') || net.address.startsWith('10.')) {
                    localIp = net.address;
                }
            }
        }
    }
    res.json({ ip: localIp });
});

// Simulation Endpoint
app.post('/api/v1/cognitive/simulate', (req, res) => {
    try {
        const payload = {
            event: "STATE_TRANSITION",
            payload: {
                state: req.body.state,
                confidence: 95,
                attention_stability: "Stable",
                focus_trend: "Improving",
                cognitive_load: "Optimal"
            }
        };

        wss.clients.forEach(client => {
            if (client.readyState === 1) client.send(JSON.stringify(payload));
        });

        res.json({ success: true });
    } catch (e) {
        res.status(400).send("Bad Request");
    }
});

// OPENROUTER LLM MUSCLE ENDPOINT
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/api/v1/agent/execute', async (req, res) => {
    try {
        const { agentType, inputData, systemPrompt } = req.body;
        
        console.log(`[Relay-Muscle] Executing ${agentType} via OpenRouter...`);

        // Notify Desktop UI that compute is happening
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    event: "COMPUTE_ACTIVE",
                    payload: { agentType, status: "Processing", inputData }
                }));
            }
        });

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
        } catch(e) {
            try {
                // Strip markdown formatting if any
                let stripped = rawContent.replace(/```json/ig, '').replace(/```/g, '').trim();
                
                // Extract only the JSON portion if there is conversational filler
                const firstBrace = stripped.indexOf('{');
                const lastBrace = stripped.lastIndexOf('}');
                const firstBracket = stripped.indexOf('[');
                const lastBracket = stripped.lastIndexOf(']');
                
                let start = -1;
                let end = -1;
                
                if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
                    start = firstBrace;
                    end = lastBrace;
                } else if (firstBracket !== -1) {
                    start = firstBracket;
                    end = lastBracket;
                }
                
                if (start !== -1 && end !== -1 && end >= start) {
                    stripped = stripped.substring(start, end + 1);
                }
                
                structuredResult = JSON.parse(stripped);
            } catch (fallbackErr) {
                console.error(`[Relay-Muscle] Failed to parse JSON. Raw content:`, rawContent);
                // Return a structured error object that still looks like JSON to the UI
                structuredResult = { error: "Failed to parse JSON", raw_output: rawContent };
            }
        }

        console.log(`[Relay-Muscle] Execution complete for ${agentType}.`);

        // Notify Desktop UI that compute finished
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    event: "COMPUTE_COMPLETE",
                    payload: { agentType, result: structuredResult, inputData }
                }));
            }
        });

        res.json({ success: true, result: structuredResult });
    } catch (e) {
        console.error("[Relay-Muscle] Error:", e.message);
        res.status(500).json({ success: false, error: e.message });
    }
});

// Serve the Mobile Flutter App statically
const mobileBuildPath = path.join(__dirname, '../mobile/build/web');
app.use('/mobile', express.static(mobileBuildPath));

// Redirect root to mobile app
app.get('/', (req, res) => {
    res.redirect('/mobile/');
});

// For React Router/Flutter deep links, redirect to index.html
app.get(/^\/mobile(\/.*)?$/, (req, res) => {
    res.sendFile(path.join(mobileBuildPath, 'index.html'));
});

// Create HTTP server from Express app
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    console.log(`[Relay] New Client Connected! URL: ${req.url}`);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`[Relay] Received Event: ${data.event}`);
            
            // Handle incoming feature vector for ML inference
            if (data.event === "SENSOR_FEATURE_VECTOR" && stateModel) {
                try {
                    // Create float32 tensor: shape [1, 5] (sma, jerk, spectral, touch, app_switches)
                    // We mock spectral and app_switches if not available from mobile directly
                    const sma = data.payload.sma || 0;
                    const jerk = data.payload.jerk_variance || 0;
                    const touch = data.payload.touch_density || 0;
                    const appSwitches = data.payload.app_switches || 0;
                    const spectral = 1.0; // Mocked fallback
                    
                    const tensorData = Float32Array.from([sma, jerk, spectral, touch, appSwitches]);
                    const tensor = new ort.Tensor('float32', tensorData, [1, 5]);
                    
                    const feeds = { float_input: tensor };
                    stateModel.run(feeds).then(results => {
                        const probabilities = results.probabilities.data;
                        const smoothed = smoother.update(probabilities);
                        
                        // State Mapping: 0=Flow, 1=Distracted, 2=Fatigued, 3=Overloaded
                        let cognitiveState = "Flow";
                        let distractionScore = 0;
                        let fatigueScore = 0;
                        let flowConfidence = Math.round(smoothed.probabilities[0] * 100);

                        if (smoothed.stateIndex === 1 || smoothed.probabilities[1] > 0.7) {
                            cognitiveState = "Distracted";
                            distractionScore = Math.round(smoothed.probabilities[1] * 100);
                        } else if (smoothed.stateIndex === 2 || smoothed.probabilities[2] > 0.7) {
                            cognitiveState = "Fatigued";
                            fatigueScore = Math.round(smoothed.probabilities[2] * 100);
                        } else if (smoothed.stateIndex === 3 || smoothed.probabilities[3] > 0.7) {
                            cognitiveState = "Overloaded";
                            distractionScore = 100;
                            fatigueScore = 100;
                        }

                        const broadcastPayload = JSON.stringify({
                            event: "COGNITIVE_STATE_REALTIME",
                            payload: {
                                distractionScore: distractionScore,
                                flowConfidence: flowConfidence,
                                fatigueScore: fatigueScore,
                                state: cognitiveState,
                                device_source: "iqoo-mobile-client"
                            }
                        });

                        wss.clients.forEach(client => {
                            if (client.readyState === 1) client.send(broadcastPayload);
                        });
                    });
                } catch (infErr) {
                    console.error("[Relay-AI] Inference Error:", infErr);
                }
            } else {
                // Broadcast all other events
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === 1) {
                        client.send(message.toString());
                    }
                });
            }
        } catch (e) {
            console.error('[Relay] Failed to parse/broadcast message', e);
        }
    });

    ws.on('close', () => console.log("[Relay] Client Disconnected"));
});

// Bind to 8080. If port 8080 is accessible, Node will host BOTH HTTP and WS here!
server.listen(8080, '0.0.0.0', () => {
    console.log("Bi-Directional Relay & Web Server listening on port 8080...");
});
