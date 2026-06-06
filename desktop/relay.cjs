const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const os = require('os');
const OpenAI = require('openai');

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: "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",
});

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
