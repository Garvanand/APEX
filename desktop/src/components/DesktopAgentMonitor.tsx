import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Activity, CheckCircle2, Server, Smartphone, Globe, BookOpen, Calendar, DollarSign, Mail, List } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PrettyAgentOutput = ({ agentType, result }: { agentType: string, result: any }) => {
  if (!result || typeof result !== 'object') {
    return <div className="text-white/60 text-xs italic">No structured data extracted.</div>;
  }

  const renderIcon = () => {
    switch (agentType.toLowerCase()) {
      case 'study': return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'schedule': return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'expense': return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'content': return <Mail className="w-4 h-4 text-orange-400" />;
      default: return <List className="w-4 h-4 text-accent" />;
    }
  };

  const extractValues = (obj: any): { key: string; value: string }[] => {
    const pairs: { key: string; value: string }[] = [];
    for (const [key, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        pairs.push({ key, value: `[${val.length} items]` });
      } else if (typeof val === 'object' && val !== null) {
        pairs.push({ key, value: '{...}' });
      } else {
        pairs.push({ key, value: String(val) });
      }
    }
    return pairs;
  };

  let iterableData = Array.isArray(result) ? result : [result];
  if (!Array.isArray(result)) {
    // If it's a wrapper object like { "events": [...] }, extract the array
    const keys = Object.keys(result);
    if (keys.length === 1 && Array.isArray(result[keys[0]])) {
      iterableData = result[keys[0]];
    } else if (result.items && Array.isArray(result.items)) {
      iterableData = result.items;
    } else if (result.flashcards && Array.isArray(result.flashcards)) {
      iterableData = result.flashcards;
    }
  }

  return (
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar mt-2">
      {iterableData.map((item, idx) => (
        <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
            {renderIcon()}
            <span className="text-xs font-semibold text-white/90 capitalize">{agentType} Entry</span>
          </div>
          <div className="space-y-1.5">
            {extractValues(item).map((pair, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-[11px]">
                <span className="text-white/40 uppercase tracking-wider font-sans">{pair.key}</span>
                <span className="text-white/90 text-right break-words font-sans max-w-[65%]">{pair.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function DesktopAgentMonitor() {
  const { activeExecution, isConnected, latencyMs } = useAppContext();

  if (!activeExecution) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      className="absolute bottom-6 right-6 w-96 bg-black/80 backdrop-blur-xl border border-accent/30 rounded-xl p-5 shadow-2xl z-50 font-mono"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest">
          <Cpu className="w-4 h-4 animate-pulse" />
          LAPTOP AGENT ENGINE
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
          <Activity className="w-3 h-3 text-accent" />
          <span className="text-[10px] text-accent font-bold">{latencyMs > 0 ? `${latencyMs}ms RTT` : 'Direct P2P'}</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Connection Architecture */}
        <div className="flex items-center justify-between px-2 text-[10px] text-white/50 mb-2">
          <div className="flex flex-col items-center">
            <Smartphone className={`w-4 h-4 ${isConnected ? 'text-green-400' : 'text-white/20'}`} />
            <span>PHONE</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-green-400/50 via-accent/50 to-accent/50 mx-2 relative">
            <motion.div 
              className="absolute top-[-2px] w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <div className="flex flex-col items-center">
            <Server className="w-4 h-4 text-accent" />
            <span className="text-accent">MUSCLE</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-purple-400/50 mx-2 relative">
            <motion.div 
              className="absolute top-[-2px] w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]"
              animate={{ left: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </div>
          <div className="flex flex-col items-center">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>LLM</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-white/40 uppercase block mb-1">Target Agent</span>
          <span className="text-sm font-bold text-white capitalize">{activeExecution.agentType} Agent</span>
        </div>

        <div>
          <span className="text-[10px] text-white/40 uppercase block mb-1">Incoming Intent</span>
          <div className="bg-white/5 border border-white/10 rounded p-2 text-xs text-white/80 max-h-16 overflow-hidden text-ellipsis">
            {activeExecution.inputData || "Receiving unstructured intent..."}
          </div>
        </div>

        <div className="relative">
          <span className="text-[10px] text-white/40 uppercase block mb-1">Status</span>
          {activeExecution.status === 'Processing' ? (
            <div className="flex items-center gap-2 text-warning text-xs font-bold">
              <Zap className="w-3 h-3 animate-pulse" />
              Routing via OpenRouter LLM...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-success text-xs font-bold">
              <CheckCircle2 className="w-3 h-3" />
              Compute Complete. Syncing to Phone.
            </div>
          )}
        </div>

        {activeExecution.result && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-2 border-t border-white/10"
          >
             <span className="text-[10px] text-white/40 uppercase block mb-1">Structured Result</span>
             <PrettyAgentOutput agentType={activeExecution.agentType} result={activeExecution.result} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
