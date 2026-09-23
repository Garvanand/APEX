/**
 * APEX END-TO-END SYSTEM PIPELINE VERIFICATION SUITE
 * 
 * Verifies the authoritative distributed cognitive pipeline:
 * PHONE -> RELAY -> DESKTOP -> SCULPTOR -> ACK -> PHONE
 * 
 * Tests:
 * 1. Relay Handshake & Session Registry (HANDSHAKE -> HANDSHAKE_ACK)
 * 2. Cross-Device Presence (DEVICE_CONNECTED / DEVICE_DISCONNECTED)
 * 3. Real RTT Measurement (PING -> PONG)
 * 4. Deterministic State Transition & Acknowledgement Loop
 * 5. Environment Sculptor Execution Lifecycle
 * 6. Disconnection & Reconnection Resilience
 */

const WebSocket = require('./desktop/node_modules/ws');

const RELAY_WS_URL = 'ws://127.0.0.1:8080/ws';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let testPassed = 0;
let testFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        testPassed++;
    } else {
        console.error(`  [FAIL] ${message}`);
        testFailed++;
        throw new Error(`Assertion failed: ${message}`);
    }
}

async function runE2ETest() {
    console.log(`\n════════════════════════════════════════════════════════════════`);
    console.log(`  APEX END-TO-END PRODUCTION PIPELINE VERIFICATION`);
    console.log(`  Target Relay: ${RELAY_WS_URL}`);
    console.log(`════════════════════════════════════════════════════════════════\n`);

    // ─────────────────────────────────────────────────────────────
    // TEST 1: CONNECT WEBSOCKET CLIENTS
    // ─────────────────────────────────────────────────────────────
    console.log(`[TEST 1] Establishing raw WebSocket TCP connections...`);
    const phoneWs = new WebSocket(RELAY_WS_URL);
    const desktopWs = new WebSocket(RELAY_WS_URL);

    await Promise.all([
        new Promise((resolve, reject) => {
            phoneWs.on('open', resolve);
            phoneWs.on('error', reject);
        }),
        new Promise((resolve, reject) => {
            desktopWs.on('open', resolve);
            desktopWs.on('error', reject);
        }),
    ]);
    assert(phoneWs.readyState === WebSocket.OPEN, "Phone WebSocket connection opened");
    assert(desktopWs.readyState === WebSocket.OPEN, "Desktop WebSocket connection opened");

    // Message queues for deterministic event handling
    const phoneMessages = [];
    const desktopMessages = [];

    phoneWs.on('message', (raw) => {
        try {
            phoneMessages.push(JSON.parse(raw.toString()));
        } catch (e) {}
    });

    desktopWs.on('message', (raw) => {
        try {
            desktopMessages.push(JSON.parse(raw.toString()));
        } catch (e) {}
    });

    function waitForMessage(queue, eventType, timeoutMs = 5000) {
        const start = Date.now();
        return new Promise((resolve, reject) => {
            const check = () => {
                const idx = queue.findIndex(m => m.event === eventType);
                if (idx !== -1) {
                    const [msg] = queue.splice(idx, 1);
                    return resolve(msg);
                }
                if (Date.now() - start > timeoutMs) {
                    return reject(new Error(`Timeout waiting for event: ${eventType}`));
                }
                setTimeout(check, 20);
            };
            check();
        });
    }

    // ─────────────────────────────────────────────────────────────
    // TEST 2: HANDSHAKE & SESSION REGISTRY
    // ─────────────────────────────────────────────────────────────
    console.log(`\n[TEST 2] Performing mutual HANDSHAKE with Relay...`);
    
    // Desktop handshakes first
    desktopWs.send(JSON.stringify({
        event: 'HANDSHAKE',
        payload: {
            device_id: 'desktop-tauri-node',
            device_type: 'desktop',
            device_name: 'Tauri Desktop Studio',
        }
    }));

    const desktopHandshakeAck = await waitForMessage(desktopMessages, 'HANDSHAKE_ACK');
    assert(desktopHandshakeAck.payload.session_id != null, `Desktop received session_id: ${desktopHandshakeAck.payload.session_id}`);
    assert(desktopHandshakeAck.payload.device_id === 'desktop-tauri-node', `Desktop device_id verified`);

    // Phone handshakes second
    phoneWs.send(JSON.stringify({
        event: 'HANDSHAKE',
        payload: {
            device_id: 'phone-iqoo-node',
            device_type: 'mobile',
            device_name: 'iQOO Mobile Companion',
        }
    }));

    const phoneHandshakeAck = await waitForMessage(phoneMessages, 'HANDSHAKE_ACK');
    assert(phoneHandshakeAck.payload.session_id != null, `Phone received session_id: ${phoneHandshakeAck.payload.session_id}`);
    assert(phoneHandshakeAck.payload.device_id === 'phone-iqoo-node', `Phone device_id verified`);

    // Verify desktop received DEVICE_CONNECTED broadcast for phone
    const desktopDeviceConn = await waitForMessage(desktopMessages, 'DEVICE_CONNECTED');
    assert(desktopDeviceConn.payload.device_id === 'phone-iqoo-node', `Desktop notified of Phone pairing (${desktopDeviceConn.payload.device_name})`);

    // ─────────────────────────────────────────────────────────────
    // TEST 3: REAL RTT LATENCY MEASUREMENT (PING / PONG)
    // ─────────────────────────────────────────────────────────────
    console.log(`\n[TEST 3] Measuring real RTT round-trip latency via PING/PONG...`);
    const pingStart = Date.now();
    phoneWs.send(JSON.stringify({
        event: 'PING',
        payload: { timestamp: pingStart }
    }));

    const pongMsg = await waitForMessage(phoneMessages, 'PONG');
    const clientTs = pongMsg.payload.client_timestamp || pongMsg.payload.timestamp || pingStart;
    const rtt = Date.now() - clientTs;
    assert(typeof rtt === 'number' && !isNaN(rtt) && rtt >= 0, `Real RTT measured: ${rtt} ms`);
    assert(rtt < 100, `Latency is sub-100ms (${rtt} ms)`);

    // ─────────────────────────────────────────────────────────────
    // TEST 4: DISTRIBUTED EVENT PIPELINE EXECUTION
    // ─────────────────────────────────────────────────────────────
    console.log(`\n[TEST 4] Triggering cognitive state transition from Phone...`);
    console.log(`  Pipeline Stage 1: Phone transmits COGNITIVE_STATE_COMMITTED`);
    
    const eventTime = Date.now();
    phoneWs.send(JSON.stringify({
        event: 'COGNITIVE_STATE_COMMITTED',
        payload: {
            state: 'DISTRACTED',
            confidence: 94,
            reason: 'Excessive rapid context switches and high jerk variance',
            source: 'mobile_edge',
            timestamp: eventTime,
        }
    }));

    // Step A: Phone must receive STATE_TRANSITION_ACK from Relay
    const relayStateAck = await waitForMessage(phoneMessages, 'STATE_TRANSITION_ACK');
    assert(relayStateAck.payload.status === 'COMMITTED', `Relay sent STATE_TRANSITION_ACK (Status: COMMITTED)`);
    assert(relayStateAck.payload.state === 'DISTRACTED', `Relay confirmed target state is DISTRACTED`);
    console.log(`  Pipeline Stage 2: Relay acknowledged receipt & routed event to Desktop`);

    // Step B: Desktop must receive COGNITIVE_STATE_COMMITTED
    const desktopStateEvent = await waitForMessage(desktopMessages, 'COGNITIVE_STATE_COMMITTED');
    assert(desktopStateEvent.payload.state === 'DISTRACTED', `Desktop received COGNITIVE_STATE_COMMITTED for DISTRACTED`);
    assert(desktopStateEvent.payload.source_device === 'mobile', `Source verified as mobile device`);
    console.log(`  Pipeline Stage 3: Desktop committed state and triggered Environment Sculptor`);

    // Step C: Desktop sends DESKTOP_STATE_CHANGED and executes Environment Sculptor
    desktopWs.send(JSON.stringify({
        event: 'DESKTOP_STATE_CHANGED',
        payload: {
            state: 'Distracted',
            previousState: 'Flow',
            source_device: 'desktop',
            timestamp: Date.now(),
        }
    }));

    // Step D: Phone receives DESKTOP_STATE_CHANGED
    const phoneDesktopChanged = await waitForMessage(phoneMessages, 'DESKTOP_STATE_CHANGED');
    assert(phoneDesktopChanged.payload.state === 'Distracted', `Phone received DESKTOP_STATE_CHANGED notification`);

    // Step E: Desktop completes Sculptor action and sends SCULPTOR_ACTION_EXECUTED
    const sculptorActionText = 'Focus intervention — reducing distraction surfaces';
    desktopWs.send(JSON.stringify({
        event: 'SCULPTOR_ACTION_EXECUTED',
        payload: {
            action: sculptorActionText,
            state: 'Distracted',
            timestamp: Date.now(),
        }
    }));
    console.log(`  Pipeline Stage 4: Desktop Environment Sculptor action executed`);

    // Step F: Phone receives SCULPTOR_ACTION_EXECUTED (The full round-trip ACK!)
    const phoneSculptorAck = await waitForMessage(phoneMessages, 'SCULPTOR_ACTION_EXECUTED');
    assert(phoneSculptorAck.payload.action === sculptorActionText, `Phone received SCULPTOR_ACTION_EXECUTED ACK from Desktop`);
    console.log(`  Pipeline Stage 5: Complete round-trip ACK received by Phone!`);

    // ─────────────────────────────────────────────────────────────
    // TEST 5: CLEAN DISCONNECT & PRESENCE PROPAGATION
    // ─────────────────────────────────────────────────────────────
    console.log(`\n[TEST 5] Testing disconnect lifecycle and presence update...`);
    phoneWs.close();

    const disconnectMsg = await waitForMessage(desktopMessages, 'DEVICE_DISCONNECTED');
    assert(disconnectMsg.payload.device_id === 'phone-iqoo-node', `Desktop received DEVICE_DISCONNECTED for Phone`);

    // ─────────────────────────────────────────────────────────────
    // TEST 6: RECONNECTION
    // ─────────────────────────────────────────────────────────────
    console.log(`\n[TEST 6] Testing Phone reconnection...`);
    const reconnectedPhoneWs = new WebSocket(RELAY_WS_URL);
    await new Promise(resolve => reconnectedPhoneWs.on('open', resolve));

    const reconnectedMessages = [];
    reconnectedPhoneWs.on('message', raw => reconnectedMessages.push(JSON.parse(raw.toString())));

    reconnectedPhoneWs.send(JSON.stringify({
        event: 'HANDSHAKE',
        payload: {
            device_id: 'phone-iqoo-node',
            device_type: 'mobile',
            device_name: 'iQOO Mobile Companion (Reconnected)',
        }
    }));

    const reAck = await waitForMessage(reconnectedMessages, 'HANDSHAKE_ACK');
    assert(reAck.payload.session_id != null, `Reconnected Phone received new session_id: ${reAck.payload.session_id}`);

    // Cleanup
    reconnectedPhoneWs.close();
    desktopWs.close();

    console.log(`\n════════════════════════════════════════════════════════════════`);
    console.log(`  END-TO-END PIPELINE VERIFICATION COMPLETE`);
    console.log(`  Total Passed: ${testPassed}`);
    console.log(`  Total Failed: ${testFailed}`);
    console.log(`════════════════════════════════════════════════════════════════\n`);

    if (testFailed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runE2ETest().catch((err) => {
    console.error(`\n[FATAL ERROR] Test suite aborted:`, err.message);
    process.exit(1);
});
