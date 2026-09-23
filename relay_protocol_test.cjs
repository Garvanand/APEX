/**
 * APEX RELAY PROTOCOL SPECIFICATION TEST
 * 
 * Verifies core Relay WebSocket protocol rules:
 * 1. Handshake authentication (rejects invalid / missing handshake)
 * 2. Session ID generation (distinct from Device ID)
 * 3. Connected devices presence broadcast
 * 4. PING / PONG heartbeat RTT
 * 5. Rejection of events sent before handshake
 * 6. Structured envelope validation
 * 7. Reconnection: Persistent Device ID preserved while Session ID rotates
 */

const WebSocket = require('./desktop/node_modules/ws');

const RELAY_WS_URL = 'ws://127.0.0.1:8080/ws';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failed++;
    }
}

async function runProtocolTests() {
    console.log('===============================================================');
    console.log('APEX RELAY PROTOCOL UNIT & INTEGRATION TEST');
    console.log('Target: ' + RELAY_WS_URL);
    console.log('===============================================================\n');

    // ── Test 1: Reject pre-handshake events ────────────────────────
    console.log('[Test 1] Pre-handshake event rejection...');
    const unauthWs = new WebSocket(RELAY_WS_URL);
    let rejectedMsg = null;
    let socketClosed = false;

    await new Promise((resolve) => {
        unauthWs.on('open', () => {
            // Attempt to send an event before HANDSHAKE
            unauthWs.send(JSON.stringify({
                event: 'COGNITIVE_STATE_COMMITTED',
                payload: { state: 'DISTRACTED' }
            }));
        });
        unauthWs.on('message', (data) => {
            try {
                rejectedMsg = JSON.parse(data.toString());
            } catch (e) {}
        });
        unauthWs.on('close', () => {
            socketClosed = true;
            resolve();
        });
        setTimeout(resolve, 1500);
    });

    assert(
        rejectedMsg?.event === 'ERROR' || socketClosed,
        'Relay rejected or dropped pre-handshake event'
    );

    // ── Test 2: Valid Handshake & Session ID ──────────────────────
    console.log('\n[Test 2] Valid Handshake, Session ID, and Presence...');
    const testDeviceId = 'apex-test-node-' + Date.now();
    const wsClient = new WebSocket(RELAY_WS_URL);
    let handshakeAck = null;

    const handshakeAckPromise = new Promise((resolve) => {
        wsClient.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.event === 'HANDSHAKE_ACK') {
                    handshakeAck = msg;
                    resolve(msg);
                }
            } catch (e) {}
        });
    });

    wsClient.on('open', () => {
        wsClient.send(JSON.stringify({
            event: 'HANDSHAKE',
            payload: {
                device_id: testDeviceId,
                device_type: 'mobile',
                device_name: 'Protocol Test Client',
                platform: 'test_node',
                version: '1.0.0',
            }
        }));
    });

    await Promise.race([handshakeAckPromise, sleep(2500)]);

    assert(handshakeAck !== null, 'Received HANDSHAKE_ACK from relay');
    assert(
        handshakeAck?.payload?.device_id === testDeviceId,
        `Device ID matched: ${handshakeAck?.payload?.device_id}`
    );
    const firstSessionId = handshakeAck?.payload?.session_id;
    assert(
        typeof firstSessionId === 'string' && firstSessionId.length > 0,
        `Valid session ID generated: ${firstSessionId}`
    );
    assert(
        firstSessionId !== testDeviceId,
        'Session ID is distinct from Device ID'
    );
    assert(
        Array.isArray(handshakeAck?.payload?.connected_devices),
        `Connected devices list included (${handshakeAck?.payload?.connected_devices?.length} devices)`
    );

    // ── Test 3: PING / PONG Heartbeat ─────────────────────────────
    console.log('\n[Test 3] PING / PONG Heartbeat RTT...');
    const pingSentTime = Date.now();
    let pongReceived = null;

    const pongPromise = new Promise((resolve) => {
        const handler = (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.event === 'PONG') {
                    pongReceived = msg;
                    wsClient.removeListener('message', handler);
                    resolve(msg);
                }
            } catch (e) {}
        };
        wsClient.on('message', handler);
    });

    wsClient.send(JSON.stringify({
        event: 'PING',
        payload: { timestamp: pingSentTime }
    }));

    await Promise.race([pongPromise, sleep(2000)]);
    const pingRtt = Date.now() - pingSentTime;

    assert(pongReceived !== null, `Received PONG response in ${pingRtt}ms`);
    assert(pingRtt < 200, `PING/PONG latency is sub-200ms (${pingRtt}ms)`);

    // ── Test 4: Structured Envelope Validation & Correlation ──────
    console.log('\n[Test 4] Event envelope validation & correlation_id preservation...');
    const testCorrId = 'corr-unit-test-' + Date.now();
    let stateAck = null;

    const stateAckPromise = new Promise((resolve) => {
        const handler = (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.event === 'STATE_TRANSITION_ACK') {
                    stateAck = msg;
                    wsClient.removeListener('message', handler);
                    resolve(msg);
                }
            } catch (e) {}
        };
        wsClient.on('message', handler);
    });

    wsClient.send(JSON.stringify({
        event: 'COGNITIVE_STATE_COMMITTED',
        payload: {
            state: 'FLOW',
            confidence: 96,
            reason: 'Unit protocol test equilibrium',
            correlation_id: testCorrId,
            timestamp: Date.now(),
        }
    }));

    await Promise.race([stateAckPromise, sleep(2000)]);

    assert(stateAck !== null, 'Received STATE_TRANSITION_ACK for state commit');
    assert(
        stateAck?.payload?.correlation_id === testCorrId || stateAck?.correlation_id === testCorrId,
        `Correlation ID preserved on ACK: ${testCorrId}`
    );

    // Close first client
    wsClient.close();
    await sleep(200);

    // ── Test 5: Reconnection Identity Preservation ────────────────
    console.log('\n[Test 5] Reconnection: Persistent Device ID preserved, Session ID rotated...');
    const reconnectClient = new WebSocket(RELAY_WS_URL);
    let reconnectAck = null;

    const reconnectAckPromise = new Promise((resolve) => {
        reconnectClient.on('message', (data) => {
            try {
                const msg = JSON.parse(data.toString());
                if (msg.event === 'HANDSHAKE_ACK') {
                    reconnectAck = msg;
                    resolve(msg);
                }
            } catch (e) {}
        });
    });

    reconnectClient.on('open', () => {
        reconnectClient.send(JSON.stringify({
            event: 'HANDSHAKE',
            payload: {
                device_id: testDeviceId, // SAME persistent device ID
                device_type: 'mobile',
                device_name: 'Protocol Test Client Reconnect',
                platform: 'test_node',
                version: '1.0.0',
            }
        }));
    });

    await Promise.race([reconnectAckPromise, sleep(2500)]);
    const secondSessionId = reconnectAck?.payload?.session_id;

    assert(
        reconnectAck?.payload?.device_id === testDeviceId,
        `Persistent device ID preserved across reconnection: ${testDeviceId}`
    );
    assert(
        secondSessionId !== firstSessionId,
        `Session ID rotated upon reconnect: ${firstSessionId} -> ${secondSessionId}`
    );

    reconnectClient.close();

    console.log('\n===============================================================');
    console.log(`RELAY PROTOCOL TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runProtocolTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
