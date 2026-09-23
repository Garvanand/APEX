import { useState, useRef, useCallback, useEffect } from 'react';
import type { WebSocketEvent } from '../types';

// ─────────────────────────────────────────────────────────────
// Connection States
// ─────────────────────────────────────────────────────────────
export type ConnectionStatus = 'offline' | 'connecting' | 'connected' | 'degraded' | 'reconnecting';

// ─────────────────────────────────────────────────────────────
// useWebSocket — real connection lifecycle with handshake
// ─────────────────────────────────────────────────────────────

interface UseWebSocketOptions {
  url?: string;
  maxRetries?: number;
  baseDelay?: number;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

interface ConnectedDevice {
  session_id: string;
  device_id: string;
  device_type: string;
  device_name: string;
  connected_at: number;
}

interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendMessage: <T>(event: string, payload: T) => void;
  lastMessage: WebSocketEvent | null;
  // Session info
  sessionId: string | null;
  deviceId: string | null;
  // Latency
  latencyMs: number;
  lastHeartbeat: number | null;
  // Connected devices
  connectedDevices: ConnectedDevice[];
  // Phone specifically
  phoneConnected: boolean;
  phoneDevice: ConnectedDevice | null;
}

const DEFAULT_URL = 'ws://127.0.0.1:8080/ws';
const MAX_RETRIES = 10;
const BASE_DELAY_MS = 1000;
const PING_INTERVAL_MS = 3000;

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = DEFAULT_URL,
    maxRetries = MAX_RETRIES,
    baseDelay = BASE_DELAY_MS,
    onConnectionChange,
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('offline');
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState(0);
  const [lastHeartbeat, setLastHeartbeat] = useState<number | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingTimestampRef = useRef<number>(0);
  const intentionalCloseRef = useRef(false);
  const handshakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handshakeCompletedRef = useRef(false);

  const updateStatus = useCallback(
    (status: ConnectionStatus) => {
      setConnectionStatus(status);
      onConnectionChange?.(status);
    },
    [onConnectionChange],
  );

  const clearTimers = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
    if (handshakeTimeoutRef.current) {
      clearTimeout(handshakeTimeoutRef.current);
      handshakeTimeoutRef.current = null;
    }
  }, []);

  // ── Start ping/pong heartbeat ──────────────────────────
  const startPingLoop = useCallback(() => {
    if (pingTimerRef.current) clearInterval(pingTimerRef.current);
    pingTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        pingTimestampRef.current = Date.now();
        wsRef.current.send(JSON.stringify({
          event: 'PING',
          payload: { timestamp: pingTimestampRef.current }
        }));
      }
    }, PING_INTERVAL_MS);
  }, []);

  // ── Handle incoming messages ───────────────────────────
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const eventType = data.event;

      switch (eventType) {
        case 'HANDSHAKE_ACK': {
          handshakeCompletedRef.current = true;
          const payload = data.payload;
          setSessionId(payload.session_id);
          setDeviceId(payload.device_id);
          if (payload.connected_devices) {
            setConnectedDevices(payload.connected_devices);
          }
          updateStatus('connected');
          retriesRef.current = 0;
          startPingLoop();
          console.log(`[WS] Handshake complete. Session: ${payload.session_id}`);
          
          // Clear handshake timeout
          if (handshakeTimeoutRef.current) {
            clearTimeout(handshakeTimeoutRef.current);
            handshakeTimeoutRef.current = null;
          }
          break;
        }

        case 'PONG': {
          const rtt = Date.now() - (data.payload?.client_timestamp || pingTimestampRef.current);
          setLatencyMs(rtt);
          setLastHeartbeat(Date.now());
          break;
        }

        case 'DEVICE_CONNECTED': {
          const dev = data.payload;
          setConnectedDevices(prev => {
            const filtered = prev.filter(d => d.session_id !== dev.session_id);
            return [...filtered, {
              session_id: dev.session_id,
              device_id: dev.device_id,
              device_type: dev.device_type,
              device_name: dev.device_name,
              connected_at: dev.connected_at,
            }];
          });
          // Forward as a regular message too for AppContext
          setLastMessage(data as WebSocketEvent);
          break;
        }

        case 'DEVICE_DISCONNECTED': {
          const devId = data.payload?.session_id;
          setConnectedDevices(prev => prev.filter(d => d.session_id !== devId));
          setLastMessage(data as WebSocketEvent);
          break;
        }

        default:
          // Forward all other events to consumers
          setLastMessage(data as WebSocketEvent);
          break;
      }
    } catch {
      console.error('[WS] Failed to parse incoming message');
    }
  }, [updateStatus, startPingLoop]);

  // ── Create connection ──────────────────────────────────
  const createConnection = useCallback(() => {
    // Teardown any previous socket
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    handshakeCompletedRef.current = false;
    updateStatus('connecting');

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[WS] TCP connected, sending HANDSHAKE...');
        // Send handshake — do NOT report connected yet
        ws.send(JSON.stringify({
          event: 'HANDSHAKE',
          payload: {
            device_id: 'apex-desktop-tauri-node',
            device_type: 'desktop',
            device_name: 'APEX Desktop Console',
            platform: 'tauri_react',
            version: '1.0.0',
          }
        }));

        // Set socket-scoped handshake timeout
        handshakeTimeoutRef.current = setTimeout(() => {
          if (!handshakeCompletedRef.current && wsRef.current === ws && ws.readyState === WebSocket.OPEN) {
            console.warn('[WS] Handshake timeout — no HANDSHAKE_ACK received for current socket');
            ws.close(1008, 'Handshake timeout');
          }
        }, 5000);
      };

      ws.onmessage = handleMessage;

      ws.onerror = (err: Event) => {
        console.error('[WS] Connection error', err);
      };

      ws.onclose = () => {
        clearTimers();
        wsRef.current = null;

        if (!intentionalCloseRef.current) {
          if (retriesRef.current < maxRetries) {
            const delay = baseDelay * Math.pow(2, Math.min(retriesRef.current, 5));
            retriesRef.current += 1;
            updateStatus('reconnecting');
            console.log(`[WS] Reconnecting in ${delay}ms (attempt ${retriesRef.current}/${maxRetries})`);
            retryTimerRef.current = setTimeout(() => {
              createConnection();
            }, delay);
          } else {
            console.error('[WS] Max reconnection attempts reached.');
            updateStatus('offline');
          }
        } else {
          updateStatus('offline');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WS] Failed to create WebSocket:', err);
      updateStatus('offline');
    }
  }, [url, maxRetries, baseDelay, updateStatus, handleMessage, clearTimers]);

  // ── Public API ─────────────────────────────────────────
  const connect = useCallback(() => {
    intentionalCloseRef.current = false;
    retriesRef.current = 0;
    clearTimers();
    createConnection();
  }, [createConnection, clearTimers]);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    updateStatus('offline');
    setSessionId(null);
    setDeviceId(null);
    setConnectedDevices([]);
  }, [clearTimers, updateStatus]);

  const sendMessage = useCallback(<T,>(event: string, payload: T) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, payload }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [clearTimers]);

  // Derived: is a phone connected?
  const phoneDevice = connectedDevices.find(d => d.device_type === 'mobile') || null;
  const phoneConnected = phoneDevice !== null;

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected' || connectionStatus === 'degraded',
    connect,
    disconnect,
    sendMessage,
    lastMessage,
    sessionId,
    deviceId,
    latencyMs,
    lastHeartbeat,
    connectedDevices,
    phoneConnected,
    phoneDevice,
  };
}
