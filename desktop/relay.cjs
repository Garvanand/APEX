const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const os = require('os');

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
    // Hardcoded to the active Wi-Fi adapter IP found via ipconfig
    res.json({ ip: '172.30.214.101' });
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
const OPENROUTER_API_KEY = "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";

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

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8080",
                "X-Title": "APEX AgentOS"
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash-pro",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: inputData }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
             throw new Error(data.error?.message || "LLM request failed");
        }

        const rawContent = data.choices[0].message.content;
        let structuredResult;
        try {
            structuredResult = JSON.parse(rawContent);
        } catch(e) {
            // Strip markdown formatting if any and try again
            const stripped = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
            structuredResult = JSON.parse(stripped);
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
            
            // Broadcast to everyone else
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === 1) {
                    client.send(message.toString());
                }
            });
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
