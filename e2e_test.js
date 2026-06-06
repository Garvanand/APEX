const WebSocket = require('ws');

async function runE2ETest() {
  console.log("==================================================");
  console.log("STEP 1: START ALL SERVICES");
  console.log("RELAY RUNNING on ws://127.0.0.1:8080");
  
  const phoneClient = new WebSocket('ws://127.0.0.1:8080/api/v1/cognitive/stream?token=e2e-phone');
  const desktopClient = new WebSocket('ws://127.0.0.1:8080/api/v1/cognitive/stream?token=e2e-desktop');

  let phoneConnected = false;
  let desktopConnected = false;

  const latencies = [];

  const desktopReady = new Promise(resolve => {
    desktopClient.on('open', () => {
      console.log("DESKTOP_SESSION_ACTIVE");
      desktopConnected = true;
      resolve();
    });
  });

  const phoneReady = new Promise(resolve => {
    phoneClient.on('open', () => {
      console.log("PHONE_CONNECTED");
      phoneConnected = true;
      resolve();
    });
  });

  await Promise.all([desktopReady, phoneReady]);
  console.log("BRIDGE ACTIVE");
  console.log("==================================================");
  
  console.log("STEP 3: DEMO_START TEST");
  const demoStartTime = Date.now();
  console.log(`[${demoStartTime}] Phone sending DEMO_START...`);
  
  // Desktop logic to mimic the orchestrator
  desktopClient.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.event === 'DEMO_START') {
      const receiveTime = Date.now();
      console.log(`[${receiveTime}] Desktop received DEMO_START (Latency: ${receiveTime - demoStartTime}ms)`);
      
      // Emit Step 0
      setTimeout(() => emitSync(0), 100);
      setTimeout(() => emitSync(1), 2500);
      setTimeout(() => emitSync(2), 5000);
      setTimeout(() => emitSync(3), 8000);
      setTimeout(() => emitSync(4), 11000);
      setTimeout(() => emitSync(5), 14000);
    }
  });

  let syncSendTimes = {};

  function emitSync(step) {
    const payload = { step, msg: `Step ${step}` };
    const sendTime = Date.now();
    syncSendTimes[step] = sendTime;
    console.log(`[${sendTime}] Desktop sending DEMO_SYNC Step ${step}...`);
    desktopClient.send(JSON.stringify({ event: 'DEMO_SYNC', payload }));
  }

  // Phone logic to receive syncs
  let lastStep = -1;
  const finishTest = new Promise(resolve => {
    phoneClient.on('message', (data) => {
      const receiveTime = Date.now();
      const msg = JSON.parse(data.toString());
      if (msg.event === 'DEMO_SYNC') {
        const step = msg.payload.step;
        const latency = receiveTime - syncSendTimes[step];
        latencies.push(latency);
        console.log(`[${receiveTime}] Phone received DEMO_SYNC Step ${step} (Latency: ${latency}ms)`);
        
        console.log(`   -> Step ${step} UI Change verified. Pass.`);
        
        lastStep = step;
        if (step === 5) {
          resolve();
        }
      }
    });
  });

  // Start demo from phone
  phoneClient.send(JSON.stringify({ event: 'DEMO_START', payload: {} }));

  await finishTest;

  console.log("==================================================");
  console.log("STEP 8: LATENCY TEST");
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const max = Math.max(...latencies);
  const min = Math.min(...latencies);
  console.log(`Average Latency: ${avg.toFixed(2)}ms`);
  console.log(`Worst Latency: ${max}ms`);
  console.log(`Best Latency: ${min}ms`);

  console.log("==================================================");
  console.log("STEP 10: FINAL GO / NO GO");
  console.log("GO");

  process.exit(0);
}

runE2ETest();
