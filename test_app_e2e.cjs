/**
 * APEX TRUE APPLICATION-LEVEL END-TO-END VALIDATOR
 * 
 * Verifies the real distributed pipeline:
 * REAL MOBILE TEST CLIENT
 *         ↓
 * REAL APEX RELAY (:8080)
 *         ↓
 * REAL RUNNING DESKTOP APPLICATION (Vite/React at http://localhost:1420 via Playwright)
 *         ↓
 * REAL AppContext
 *         ↓
 * REAL AdaptiveWorkspace
 *         ↓
 * REAL Sculptor lifecycle
 *         ↓
 * REAL Relay
 *         ↓
 * REAL Mobile Test Client
 * 
 * RULE: The test NEVER fakes Desktop AppContext or Sculptor behavior.
 * The test FAILS if the real desktop application is absent.
 */

const WebSocket = require('./desktop/node_modules/ws');
const { chromium } = require('./desktop/node_modules/playwright');
const http = require('http');
const fs = require('fs');

const RELAY_WS_URL = 'ws://127.0.0.1:8080/ws';
const DESKTOP_HTTP_URL = 'http://localhost:1420/';

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

function getBrowserExecutablePath() {
    const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    ];
    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return undefined;
}

function checkHttpServer(url) {
    return new Promise((resolve) => {
        const req = http.get(url, (res) => {
            resolve(res.statusCode >= 200 && res.statusCode < 400);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(2500, () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function runE2EValidation() {
    console.log('===============================================================');
    console.log('APEX TRUE APPLICATION-LEVEL E2E LIVE PIPELINE VALIDATOR');
    console.log('Model: Real Mobile Client -> Relay (:8080) -> Real Desktop App -> Sculptor -> Mobile');
    console.log('===============================================================\n');

    // ── Phase 1: Environment Readiness Check ─────────────────────
    console.log('[Phase 1] Verifying Relay and Desktop Services...');
    const relayAlive = await checkHttpServer('http://127.0.0.1:8080/api/v1/network/info');
    if (!relayAlive) {
        console.error('  [FAIL] Apex Relay is not reachable on http://127.0.0.1:8080');
        process.exit(1);
    }
    assert(relayAlive, 'Relay protocol endpoint online (:8080)');

    const desktopAlive = await checkHttpServer(DESKTOP_HTTP_URL);
    if (!desktopAlive) {
        console.error('  [FAIL] Real Desktop application dev server is not reachable on ' + DESKTOP_HTTP_URL);
        process.exit(1);
    }
    assert(desktopAlive, `Desktop application web surface online (${DESKTOP_HTTP_URL})`);

    // ── Phase 2: Launch Real Desktop Application via Playwright ──
    console.log('\n[Phase 2] Launching Real Desktop UI via Headless Automation...');
    const execPath = getBrowserExecutablePath();
    const browser = await chromium.launch({
        executablePath: execPath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', msg => console.log('  [DESKTOP CONSOLE]', msg.type(), msg.text()));
    page.on('pageerror', err => console.error('  [DESKTOP ERROR]', err.message));

    await page.goto(DESKTOP_HTTP_URL, { waitUntil: 'domcontentloaded' });

    // Wait for Desktop React application to mount and connect to Relay
    await page.waitForSelector('[data-testid="header-cognitive-state"]', { timeout: 10000 });
    const initialHeaderState = await page.textContent('[data-testid="header-cognitive-state"]');
    console.log(`  Real Desktop UI mounted. Initial Cognitive State in DOM: "${initialHeaderState?.trim()}"`);

    // ── Phase 3: Connect Real Mobile Test Client ──────────────────
    console.log('\n[Phase 3] Connecting Real Mobile Test Client to Relay (:8080)...');
    const mobileWs = new WebSocket(RELAY_WS_URL);
    const mobileEvents = [];
    let mobileHandshakeAck = null;

    mobileWs.on('message', (raw) => {
        try {
            const data = JSON.parse(raw.toString());
            mobileEvents.push({ ...data, _recvTime: Date.now() });
        } catch (e) {}
    });

    const mobileHandshakePromise = new Promise((resolve) => {
        const handler = (raw) => {
            try {
                const data = JSON.parse(raw.toString());
                if (data.event === 'HANDSHAKE_ACK') {
                    mobileHandshakeAck = data;
                    mobileWs.removeListener('message', handler);
                    resolve(data);
                }
            } catch (e) {}
        };
        mobileWs.on('message', handler);
    });

    const persistentMobileId = 'apex-mobile-e2e-node-' + Date.now();
    mobileWs.on('open', () => {
        mobileWs.send(JSON.stringify({
            event: 'HANDSHAKE',
            payload: {
                device_id: persistentMobileId,
                device_type: 'mobile',
                device_name: 'APEX Mobile E2E Validator',
                platform: 'e2e_automation',
                version: '1.0.0',
            }
        }));
    });

    await Promise.race([mobileHandshakePromise, sleep(4000)]);
    assert(mobileHandshakeAck !== null, 'Mobile test client received HANDSHAKE_ACK from relay');
    assert(mobileHandshakeAck?.payload?.session_id !== undefined, `Mobile session established: ${mobileHandshakeAck?.payload?.session_id}`);

    // Wait up to 5s for Desktop presence to be acknowledged by relay
    console.log('  Verifying Real Desktop registration on Relay presence table...');
    let desktopRegistered = false;
    let registeredDevices = mobileHandshakeAck?.payload?.connected_devices || [];

    for (let i = 0; i < 10; i++) {
        if (registeredDevices.some(d => d.device_type === 'desktop')) {
            desktopRegistered = true;
            break;
        }
        await sleep(500);
        // Request presence or check recent DEVICE_CONNECTED events
        const devEvent = mobileEvents.find(e => e.event === 'DEVICE_CONNECTED' && e.payload?.device_type === 'desktop');
        if (devEvent) {
            desktopRegistered = true;
            break;
        }
    }

    assert(desktopRegistered, 'Real desktop application connected and registered on Relay');
    if (!desktopRegistered) {
        console.error('  [FATAL] Desktop application is not registered on relay. Aborting test.');
        await browser.close();
        mobileWs.close();
        process.exit(1);
    }

    // ── Phase 4: Trigger DISTRACTED from Mobile Test Client ────────
    console.log('\n[Phase 4] Emitting COGNITIVE_STATE_COMMITTED (DISTRACTED) from Mobile...');
    const correlationId1 = 'corr-e2e-distract-' + Date.now();
    const t0 = Date.now();

    mobileWs.send(JSON.stringify({
        event: 'COGNITIVE_STATE_COMMITTED',
        payload: {
            state: 'DISTRACTED',
            confidence: 89,
            reason: 'Rapid context switching and elevated jerk variance',
            device_source: persistentMobileId,
            source: 'mobile',
            correlation_id: correlationId1,
            timestamp: t0,
        }
    }));

    // Step A: Relay ACK
    console.log('  Waiting for STATE_TRANSITION_ACK from Relay...');
    let relayAck = null;
    for (let i = 0; i < 20; i++) {
        relayAck = mobileEvents.find(e => e.event === 'STATE_TRANSITION_ACK' && (e.payload?.correlation_id === correlationId1 || e.correlation_id === correlationId1));
        if (relayAck) break;
        await sleep(50);
    }
    const relayAckLatency = relayAck ? (relayAck._recvTime - t0) : null;
    assert(relayAck !== null, `Mobile state trigger delivered & ACK received by Relay (+${relayAckLatency}ms)`);
    assert(
        (relayAck?.payload?.correlation_id === correlationId1 || relayAck?.correlation_id === correlationId1),
        `Correlation ID preserved on Relay ACK: ${correlationId1}`
    );

    // Step B: Observe REAL Desktop UI changing to DISTRACTED via Playwright DOM
    console.log('  Observing Real Desktop DOM reaction in Playwright...');
    let desktopDomChanged = false;
    try {
        await page.waitForFunction(
            () => {
                const el = document.querySelector('[data-testid="header-cognitive-state"]');
                return el && el.textContent && el.textContent.toUpperCase().includes('DISTRACTED');
            },
            { timeout: 5000 }
        );
        desktopDomChanged = true;
    } catch (e) {
        desktopDomChanged = false;
    }
    assert(desktopDomChanged, 'Desktop UI state changed to DISTRACTED in real DOM');

    // Step C: Observe Distraction Mitigation Banner in Real Desktop DOM
    console.log('  Observing Distraction Mitigation Banner in Real Desktop DOM...');
    let bannerVisible = false;
    try {
        await page.waitForSelector('[data-testid="distraction-mitigation-banner"]', { timeout: 4000 });
        bannerVisible = true;
    } catch (e) {
        bannerVisible = false;
    }
    assert(bannerVisible, 'Distraction mitigation banner rendered on active workspace');

    // Step D: Observe Sculptor lifecycle on wire and DOM
    console.log('  Observing Sculptor Lifecycle events from real application...');
    let desktopStateChangedEvent = null;
    let sculptorExecutingEvent = null;
    let sculptorExecutedEvent = null;

    for (let i = 0; i < 30; i++) {
        if (!desktopStateChangedEvent) {
            desktopStateChangedEvent = mobileEvents.find(e => e.event === 'DESKTOP_STATE_CHANGED' && (e.payload?.correlation_id === correlationId1 || e.correlation_id === correlationId1));
        }
        if (!sculptorExecutingEvent) {
            sculptorExecutingEvent = mobileEvents.find(e => e.event === 'SCULPTOR_ACTION_EXECUTING' && (e.payload?.correlation_id === correlationId1 || e.correlation_id === correlationId1));
        }
        if (!sculptorExecutedEvent) {
            sculptorExecutedEvent = mobileEvents.find(e => e.event === 'SCULPTOR_ACTION_EXECUTED' && (e.payload?.correlation_id === correlationId1 || e.correlation_id === correlationId1));
        }
        if (desktopStateChangedEvent && sculptorExecutingEvent && sculptorExecutedEvent) break;
        await sleep(50);
    }

    const tDesktop = desktopStateChangedEvent ? (desktopStateChangedEvent._recvTime - t0) : null;
    const tExecuting = sculptorExecutingEvent ? (sculptorExecutingEvent._recvTime - t0) : null;
    const tCompleted = sculptorExecutedEvent ? (sculptorExecutedEvent._recvTime - t0) : null;

    assert(desktopStateChangedEvent !== null, `Desktop emitted DESKTOP_STATE_CHANGED (+${tDesktop}ms)`);
    assert(sculptorExecutingEvent !== null, `Sculptor executing event received (+${tExecuting}ms)`);
    assert(sculptorExecutedEvent !== null, `Sculptor completed event received (+${tCompleted}ms)`);
    assert(
        (sculptorExecutedEvent?.payload?.correlation_id === correlationId1 || sculptorExecutedEvent?.correlation_id === correlationId1),
        `Correlation ID preserved on SCULPTOR_ACTION_EXECUTED: ${correlationId1}`
    );
    assert(tCompleted !== null, `Execution confirmation received by mobile (Full transaction RTT: ${tCompleted}ms)`);

    // ── Phase 5: Trigger Recovery to FLOW via Real Desktop UI ──────
    console.log('\n[Phase 5] Triggering Recovery to FLOW via Desktop "Dismiss Intervention" Button...');
    const tRecoveryStart = Date.now();
    await page.waitForSelector('[data-testid="dismiss-mitigation-btn"]', { timeout: 5000 });
    
    const stateBefore = await page.textContent('[data-testid="header-cognitive-state"]');
    console.log(`  State in DOM before dismiss: "${stateBefore?.trim()}"`);

    await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="dismiss-mitigation-btn"]');
        if (btn) btn.click();
    });
    assert(true, 'Clicked "Dismiss Intervention" button on real Desktop UI');

    // Verify Desktop DOM returns to FLOW
    let desktopRecovered = false;
    try {
        await page.waitForFunction(
            () => {
                const el = document.querySelector('[data-testid="header-cognitive-state"]');
                return el && el.textContent && el.textContent.toUpperCase().includes('FLOW');
            },
            { timeout: 6000 }
        );
        desktopRecovered = true;
    } catch (e) {
        desktopRecovered = false;
    }
    const stateAfter = await page.textContent('[data-testid="header-cognitive-state"]');
    console.log(`  State in DOM after dismiss: "${stateAfter?.trim()}"`);
    assert(desktopRecovered, 'Recovery to FLOW completed in real Desktop DOM');

    // Verify mitigation banner is detached / hidden
    let bannerGone = false;
    try {
        await page.waitForFunction(
            () => {
                const banner = document.querySelector('[data-testid="distraction-mitigation-banner"]');
                return !banner || banner.style.opacity === '0' || banner.style.display === 'none';
            },
            { timeout: 6000 }
        );
        bannerGone = true;
    } catch (e) {
        bannerGone = false;
    }
    assert(bannerGone, 'Mitigation banner successfully dismissed and deactivated');

    // Verify Mobile receives the resulting desktop-originated event
    let recoveryEvent = null;
    for (let i = 0; i < 30; i++) {
        recoveryEvent = mobileEvents.find(e => e.event === 'DESKTOP_STATE_CHANGED' && e.payload?.state === 'Flow' && e._recvTime >= tRecoveryStart);
        if (recoveryEvent) break;
        await sleep(50);
    }
    assert(recoveryEvent !== null, 'Mobile received desktop-originated recovery event (Bidirectional communication verified)');

    // ── Phase 6: Multi-Run Latency & Performance Benchmarks ────────
    console.log('\n[Phase 6] Running Multi-Transaction Latency Benchmarks (3 Cycles)...');
    const netLatencies = [];
    const txLatencies = [];
    const sculptorDurations = [];

    for (let cycle = 1; cycle <= 3; cycle++) {
        // Measure PING RTT
        const pingTime = Date.now();
        mobileWs.send(JSON.stringify({ event: 'PING', payload: { timestamp: pingTime } }));
        let pongRecvTime = null;
        for (let i = 0; i < 20; i++) {
            const pong = mobileEvents.find(e => e.event === 'PONG' && e._recvTime >= pingTime);
            if (pong) {
                pongRecvTime = pong._recvTime;
                break;
            }
            await sleep(50);
        }
        if (pongRecvTime) {
            netLatencies.push(pongRecvTime - pingTime);
        }

        // Measure Full Transaction
        const cycleCorrId = `corr-bench-${cycle}-${Date.now()}`;
        const cycleT0 = Date.now();
        const targetState = (cycle % 2 === 1) ? 'DISTRACTED' : 'FLOW';

        mobileWs.send(JSON.stringify({
            event: 'COGNITIVE_STATE_COMMITTED',
            payload: {
                state: targetState,
                confidence: 91,
                reason: `Benchmark cycle ${cycle}`,
                device_source: persistentMobileId,
                source: 'mobile',
                correlation_id: cycleCorrId,
                timestamp: cycleT0,
            }
        }));

        let cycleConfirm = null;
        let cycleExecuting = null;

        for (let i = 0; i < 50; i++) {
            if (!cycleExecuting) {
                const ex = mobileEvents.find(e => e.event === 'SCULPTOR_ACTION_EXECUTING' && (e.payload?.correlation_id === cycleCorrId || e.correlation_id === cycleCorrId));
                if (ex) cycleExecuting = ex._recvTime;
            }
            if (!cycleConfirm) {
                const cf = mobileEvents.find(e => e.event === 'SCULPTOR_ACTION_EXECUTED' && (e.payload?.correlation_id === cycleCorrId || e.correlation_id === cycleCorrId));
                if (cf) cycleConfirm = cf._recvTime;
            }
            if (cycleConfirm) break;
            await sleep(50);
        }

        if (cycleConfirm) {
            txLatencies.push(cycleConfirm - cycleT0);
            if (cycleExecuting) {
                sculptorDurations.push(cycleConfirm - cycleExecuting);
            }
        }
        await sleep(400);
    }

    const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const min = arr => arr.length ? Math.min(...arr) : 0;
    const max = arr => arr.length ? Math.max(...arr) : 0;

    console.log('\n  BENCHMARK RESULTS:');
    console.log(`  Network PING RTT:       min=${min(netLatencies)}ms, max=${max(netLatencies)}ms, avg=${avg(netLatencies)}ms`);
    console.log(`  Full Transaction RTT:   min=${min(txLatencies)}ms, max=${max(txLatencies)}ms, avg=${avg(txLatencies)}ms`);
    console.log(`  Sculptor Execution:     min=${min(sculptorDurations)}ms, max=${max(sculptorDurations)}ms, avg=${avg(sculptorDurations)}ms`);

    // Clean up
    await browser.close();
    mobileWs.close();

    console.log('\n===============================================================');
    console.log(`TRUE APPLICATION E2E VALIDATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('===============================================================');

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runE2EValidation().catch(err => {
    console.error('Fatal E2E Validation Error:', err);
    process.exit(1);
});
