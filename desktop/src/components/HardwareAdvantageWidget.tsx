import React from 'react';
import { Cpu, Smartphone, Zap, Waves } from 'lucide-react';

export function HardwareAdvantageWidget() {
  return (
    <div className="mt-8 px-4">
      <div className="mb-3 text-xs font-mono uppercase tracking-widest text-secondary-text">
        Hardware Advantage
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5">
          <Smartphone className="w-4 h-4 text-accent" />
          <div>
            <div className="text-[10px] font-bold text-white/80 uppercase">iQOO Sensor Bridge</div>
            <div className="text-[9px] text-white/40">12ms Latency Office Kit Sync</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5">
          <Zap className="w-4 h-4 text-warning" />
          <div>
            <div className="text-[10px] font-bold text-white/80 uppercase">120Hz Touch Sampling</div>
            <div className="text-[9px] text-white/40">Micro-interaction tracking</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5">
          <Waves className="w-4 h-4 text-success" />
          <div>
            <div className="text-[10px] font-bold text-white/80 uppercase">Ambient Sensors</div>
            <div className="text-[9px] text-white/40">Noise & lighting correlation</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5">
          <Cpu className="w-4 h-4 text-blue-400" />
          <div>
            <div className="text-[10px] font-bold text-white/80 uppercase">Edge NPU Processing</div>
            <div className="text-[9px] text-white/40">Zero-latency state inference</div>
          </div>
        </div>
      </div>
    </div>
  );
}
