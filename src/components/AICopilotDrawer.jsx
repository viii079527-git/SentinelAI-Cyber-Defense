import React, { useState } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  ShieldAlert, 
  CheckCircle, 
  Sparkles, 
  Play, 
  RefreshCw,
  Terminal,
  Cpu
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export default function AICopilotDrawer() {
  const { 
    aiCopilot, 
    toggleCopilotOpen, 
    activeAttack, 
    mitigateAttack, 
    sendCopilotMessage,
    threatLevel,
    riskScore
  } = useSentinel();

  const [inputMessage, setInputMessage] = useState('');

  if (!aiCopilot.isOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendCopilotMessage(inputMessage);
    setInputMessage('');
  };

  const cannedPrompts = [
    'Analyze blast radius and compromised nodes',
    'Explain the active attack payload',
    'Generate MITRE ATT&CK mitigation playbook',
    'Review attacker geolocation and ASN'
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#080d1e] border-l border-cyan-500/30 shadow-[-10px_0_35px_rgba(0,0,0,0.8)] flex flex-col backdrop-blur-xl">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#060a18]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2">
              SENTINEL // COPILOT
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                GPT-4o SEC-OPS
              </span>
            </h3>
            <p className="text-[11px] font-mono text-slate-400">Autonomous SOC Advisory & Triage Engine</p>
          </div>
        </div>
        <button
          onClick={toggleCopilotOpen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Real-time Threat Posture Card */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Live Situation Guidance
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
            threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            DEFCON: {threatLevel} ({riskScore}%)
          </span>
        </div>
        <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
          {aiCopilot.guidance}
        </p>

        {/* Quick Recommended Remediation Action */}
        {aiCopilot.recommendationAction && (
          <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-rose-950/40 to-indigo-950/40 border border-rose-500/40">
            <div className="text-[11px] font-mono text-rose-300 font-bold mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              PRIORITY PLAYBOOK MITIGATION:
            </div>
            <div className="text-xs text-white font-medium mb-2 font-mono">
              {aiCopilot.recommendationAction}
            </div>
            <button
              onClick={() => mitigateAttack(aiCopilot.recommendationAction)}
              className="w-full py-2 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Execute Autonomous Countermeasure
            </button>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-b border-slate-800/60 bg-[#060a16]">
        <div className="text-[10px] font-mono text-slate-400 mb-1.5 uppercase tracking-wider">Quick Inquiries:</div>
        <div className="flex flex-wrap gap-1.5">
          {cannedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendCopilotMessage(prompt)}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 px-2.5 py-1 rounded-md text-left transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {aiCopilot.messages.map((msg, i) => {
          const isCopilot = msg.sender === 'copilot';
          return (
            <div
              key={i}
              className={`flex flex-col ${isCopilot ? 'items-start' : 'items-end'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 text-[10px] font-mono text-slate-400">
                <span>{isCopilot ? 'SENTINEL_AI' : 'SOC_ANALYST'}</span>
                <span>•</span>
                <span>{msg.time}</span>
              </div>
              <div
                className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs font-sans leading-relaxed ${
                  isCopilot
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-cyan-600/30 border border-cyan-500/40 text-cyan-100 shadow-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-[#060a18] flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Copilot for SOC analysis or playbooks..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
        />
        <button
          type="submit"
          className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

