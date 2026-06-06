import { useState, useRef, useCallback, useEffect } from 'react';
import type { WebSocketEvent } from '../types';
import { mockEngine } from '../mocks/MockDataEngine';

// ─────────────────────────────────────────────────────────────
// useWebSocket — connection lifecycle with auto-reconnect
// ─────────────────────────────────────────────────────────────

interface UseWebSocketOptions {
  /** Base WebSocket URL without query params. */
  url?: string;
  /** Maximum reconnection attempts before giving up. */
  maxRetries?: number;
  /** Base delay (ms) for exponential backoff. */
  baseDelay?: number;
  /** Called whenever the connection status changes. */
  onConnectionChange?: (connected: boolean) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: <T>(event: string, payload: T) => void;
  lastMessage: WebSocketEvent | null;
  isLocalMode: boolean;
}

const DEFAULT_URL = 'ws://127.0.0.1:8000/api/v1/cognitive/stream';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = DEFAULT_URL,
    maxRetries = MAX_RETRIES,
    baseDelay = BASE_DELAY_MS,
    onConnectionChange,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketEvent | null>(null);
  const [isLocalMode, setIsLocalMode] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef<string>('');
  const intentionalCloseRef = useRef(false);
  const isUsingMockRef = useRef(false);

  // Sync connection status with optional callback
  const updateConnectionStatus = useCallback(
    (connected: boolean) => {
      setIsConnected(connected);
      onConnectionChange?.(connected);
    },
    [onConnectionChange],
  );

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const createConnection = useCallback(
    (token: string) => {
      // Teardown any previous socket
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        wsRef.current.close();
        wsRef.current = null;
      }

      try {
        if (import.meta.env.VITE_APEX_DEMO_MODE === "true" || isUsingMockRef.current) {
          throw new Error("Forcing Mock Engine Fallback");
        }
        
        const ws = new WebSocket(`${url}?token=${token}`);

        ws.onopen = () => {
          retriesRef.current = 0;
          updateConnectionStatus(true);
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const parsed = JSON.parse(event.data) as WebSocketEvent;
            setLastMessage(parsed);
          } catch {
            console.error('[useWebSocket] Failed to parse incoming message');
          }
        };

        ws.onerror = (err: Event) => {
          console.error('[useWebSocket] Connection error', err);
        };

        ws.onclose = () => {
          updateConnectionStatus(false);
          wsRef.current = null;

          // Auto-reconnect unless the close was intentional
          if (!intentionalCloseRef.current && retriesRef.current < maxRetries) {
            const delay = baseDelay * Math.pow(2, retriesRef.current);
            retriesRef.current += 1;
            retryTimerRef.current = setTimeout(() => {
              createConnection(tokenRef.current);
            }, delay);
          } else if (!intentionalCloseRef.current && retriesRef.current >= maxRetries) {
            // FALLBACK TO MOCK ENGINE
            console.warn("[useWebSocket] Max retries reached. Falling back to MockDataEngine LOCAL MODE.");
            isUsingMockRef.current = true;
            setIsLocalMode(true);
            createConnection(tokenRef.current);
          }
        };

        wsRef.current = ws;
      } catch (err) {
        console.warn('[useWebSocket] Switching to MockDataEngine', err);
        isUsingMockRef.current = true;
        setIsLocalMode(true);
        
        const mockListener = (event: MessageEvent) => {
          try {
            const parsed = JSON.parse(event.data) as WebSocketEvent;
            setLastMessage(parsed);
          } catch {
            console.error("Mock parse failed");
          }
        };
        
        mockEngine.subscribe(mockListener);
        mockEngine.start();
        updateConnectionStatus(true); // Faked as connected
        
        // We hijack the onclose cleanup reference to also stop the mock
        wsRef.current = {
          readyState: WebSocket.OPEN,
          send: (data: string) => { console.log("[Mock WS Send]", data); },
          close: () => {
            mockEngine.unsubscribe(mockListener);
            mockEngine.stop();
          }
        } as unknown as WebSocket;
      }
    },
    [url, maxRetries, baseDelay, updateConnectionStatus],
  );

  const connect = useCallback(
    (token: string) => {
      intentionalCloseRef.current = false;
      retriesRef.current = 0;
      tokenRef.current = token;
      clearRetryTimer();
      createConnection(token);
    },
    [createConnection, clearRetryTimer],
  );

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    clearRetryTimer();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    updateConnectionStatus(false);
  }, [clearRetryTimer, updateConnectionStatus]);

  const sendMessage = useCallback(<T,>(event: string, payload: T) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, payload }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      clearRetryTimer();
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close();
      }
    };
  }, [clearRetryTimer]);

  return { isConnected, connect, disconnect, sendMessage, lastMessage, isLocalMode };
}
