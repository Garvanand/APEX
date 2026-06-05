import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Smartphone, CheckCircle, WifiHigh } from 'lucide-react';

interface DevicePairingModalProps {
  onClose: () => void;
  onPaired: (deviceInfo: any) => void;
}

export function DevicePairingModal({ onClose, onPaired }: DevicePairingModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'generating' | 'waiting' | 'paired'>('generating');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    // Generate pairing token from backend
    fetch('http://localhost:8000/api/v1/pairing/generate', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setToken(data.token);
        setStatus('waiting');
      })
      .catch(err => console.error('Failed to generate token:', err));

    // Listen for WebSocket EVENT: DEVICE_PAIRED
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'DEVICE_PAIRED') {
          setStatus('paired');
          setDeviceInfo(data.payload);
          setTimeout(() => onPaired(data.payload), 2000);
        }
      } catch (err) {}
    };

    // In a real app, we'd hook into the global WebSocket Context.
    // For standalone pairing, we'll listen globally if the emitter is window-bound,
    // or just assume we have a global hook.
    window.addEventListener('apex:ws:message', handleMessage as any);
    return () => window.removeEventListener('apex:ws:message', handleMessage as any);
  }, [onPaired]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white mb-1">iQOO Link</h2>
            <p className="text-sm text-neutral-400">Cognitive Sensor Array</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">✕</button>
        </div>

        {status === 'generating' && (
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-neutral-400">Generating secure pairing channel...</p>
          </div>
        )}

        {status === 'waiting' && token && (
          <div className="flex flex-col items-center space-y-6">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG 
                value={JSON.stringify({ token, server: 'http://192.168.x.x:8000' })} 
                size={200}
                level="Q"
                includeMargin={false}
              />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-white">Scan with APEX Mobile App</p>
              <p className="text-xs text-neutral-500 max-w-[250px]">
                Ensure your phone and laptop are on the same local network for Sub-10ms telemetry sync.
              </p>
            </div>
            
            {/* Simulation button for Demo without mobile app camera */}
            <button 
              onClick={() => {
                fetch('http://localhost:8000/api/v1/pairing/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    token,
                    device_name: "iQOO Neo 9 Pro",
                    device_id: "iqoo-99482",
                    platform: "Android",
                    version: "1.0.0"
                  })
                });
              }}
              className="text-[10px] text-neutral-700 hover:text-neutral-500 tracking-widest uppercase font-bold"
            >
              Simulate Scan
            </button>
          </div>
        )}

        {status === 'paired' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="h-64 flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">Link Established</h3>
              <p className="text-sm text-neutral-400">{deviceInfo?.device_name || 'iQOO Device'}</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-medium text-neutral-500 bg-[#111] px-3 py-1.5 rounded-full mt-4">
              <WifiHigh className="w-3 h-3 text-green-500" />
              <span>9ms Latency Sync</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
