import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Zap, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Bot, 
  Clock, 
  Radio, 
  Activity,
  Flame,
  KeyRound,
  Database,
  Bug,
  CheckCircle2
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export default function Header() {
  const {
    threatLevel,
    riskScore,
    activeIncidents,
    activeAttack,
    launchAttack,
    mitigateAttack,
    resetDemo,
    audioMuted,
    toggleAudio,
    aiCopilot,
    toggleAutonomousDefense,
    toggleCopilotOpen
  } = useSentinel();

  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().split(' ')[4] + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getThreatColor = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/80 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.35)]';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/80 border-orange-500/80 shadow-[0_0_15px_rgba(249,115,22,0.3)]';
      case 'ELEVATED':
        return 'text-amber-400 bg-amber-950/80 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
      default:
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score >= 80) return 'text-rose-400 stroke-rose-500 bg-rose-500/10 border-rose-500/40';
    if (score >= 50) return 'text-amber-400 stroke-amber-500 bg-amber-500/10 border-amber-500/40';
    return 'text-emerald-400 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/40';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#070c1b]/95 backdrop-blur-md px-4 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1920px] mx-auto">
        
        {/* Brand & Mission Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.35)]">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeAttack ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${activeAttack ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-widest text-lg text-white font-mono flex items-center gap-1.5">
                SENTINEL<span className="text-cyan-400">AI</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SOC-OS v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              Real-Time Banking Cyber Defense Command Center
            </p>
          </div>
        </div>

        {/* Global SOC Indicators: Threat Level & Risk Score & Incidents */}
        <div className="flex items-center space-x-3">
          {/* Threat Level */}
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-2 transition-all duration-300 ${getThreatColor(threatLevel)}`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${threatLevel === 'CRITICAL' ? 'bg-rose-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${threatLevel === 'CRITICAL' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
              </span>
              <span>DEFCON {threatLevel === 'CRITICAL' ? '1' : threatLevel === 'HIGH' ? '2' : threatLevel === 'ELEVATED' ? '3' : '4'}: {threatLevel}</span>
            </div>
          </div>

          {/* Animated Risk Score Meter */}
          <div className={`flex items-center space-x-2.5 px-3 py-1 rounded-lg border transition-all duration-300 ${getRiskScoreColor(riskScore)}`}>
            <div className="text-right">
              <div className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Risk Score</div>
              <div className="text-sm font-extrabold font-mono leading-none">
                {riskScore}<span className="text-[10px] text-slate-400 font-normal">/100</span>
              </div>
            </div>
            {/* Visual Mini Progress Bar */}
            <div className="w-14 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
              <div 
                className={`h-full transition-all duration-500 ${riskScore >= 80 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : riskScore >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, Math.max(10, riskScore))}%` }}
              />
            </div>
          </div>

          {/* Active Incidents Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 font-mono text-xs">
            <AlertTriangle className={`w-3.5 h-3.5 ${activeIncidents.filter(i => i.status === 'ACTIVE').length > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="text-slate-400">Incidents:</span>
            <span className={`font-bold ${activeIncidents.filter(i => i.status === 'ACTIVE').length > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {activeIncidents.filter(i => i.status === 'ACTIVE').length} Active
            </span>
          </div>
        </div>

        {/* Global Attack Launcher Quick Buttons */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-cyan-500/30 gap-1 shadow-inner">
          <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 flex items-center gap-1 border-r border-slate-800">
            <Zap className="w-3 h-3 text-cyan-400" />
            ATTACK:
          </span>
          
          <button
            onClick={() => launchAttack('ddos')}
            className={`px-2.5 py-1 text-xs font-mono font-semibold rounded flex items-center gap-1.5 transition-all ${
              activeAttack?.id === 'ddos' 
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.8)] ring-1 ring-white' 
                : 'text-rose-400 hover:bg-rose-950/60 hover:text-rose-300'
            }`}
            title="Launch Volumetric Layer 7 DDoS Simulation"
          >
            <Flame className="w-3.5 h-3.5" />
            DDoS
          </button>

          <button
            onClick={() => launchAttack('brute_force')}
            className={`px-2.5 py-1 text-xs font-mono font-semibold rounded flex items-center gap-1.5 transition-all ${
              activeAttack?.id === 'brute_force' 
                ? 'bg-orange-600 text-white shadow-[0_0_12px_rgba(234,88,12,0.8)] ring-1 ring-white' 
                : 'text-orange-400 hover:bg-orange-950/60 hover:text-orange-300'
            }`}
            title="Launch Credential Spraying / Brute Force"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Brute Force
          </button>

          <button
            onClick={() => launchAttack('sql_injection')}
            className={`px-2.5 py-1 text-xs font-mono font-semibold rounded flex items-center gap-1.5 transition-all ${
              activeAttack?.id === 'sql_injection' 
                ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.8)] ring-1 ring-white' 
                : 'text-purple-400 hover:bg-purple-950/60 hover:text-purple-300'
            }`}
            title="Launch SQL Injection & Data Exfiltration"
          >
            <Database className="w-3.5 h-3.5" />
            SQLi
          </button>

          <button
            onClick={() => launchAttack('malware')}
            className={`px-2.5 py-1 text-xs font-mono font-semibold rounded flex items-center gap-1.5 transition-all ${
              activeAttack?.id === 'malware' 
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.8)] ring-1 ring-white' 
                : 'text-red-400 hover:bg-red-950/60 hover:text-red-300'
            }`}
            title="Launch Banking Trojan & C2 Lateral Movement"
          >
            <Bug className="w-3.5 h-3.5" />
            Malware
          </button>
        </div>

        {/* Global Controls: Mitigate / Reset / Auto-Defense / Audio / Copilot */}
        <div className="flex items-center space-x-2">
          {/* Mitigation button when attack is active */}
          {activeAttack && (
            <button
              onClick={() => mitigateAttack('Manual SOC Operator Containment Protocol')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              title="Execute immediate countermeasure"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mitigate Threat
            </button>
          )}

          {/* Autonomous Defense Switch */}
          <button
            onClick={toggleAutonomousDefense}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all ${
              aiCopilot.autonomousDefense
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-300'
            }`}
            title="AI Autonomous Self-Healing SOC Defense"
          >
            <Activity className={`w-3.5 h-3.5 ${aiCopilot.autonomousDefense ? 'text-cyan-400 animate-spin' : ''}`} />
            <span className="hidden xl:inline">Auto-Defense:</span>
            <span>{aiCopilot.autonomousDefense ? 'ON' : 'OFF'}</span>
          </button>

          {/* Demo Reset button */}
          <button
            onClick={resetDemo}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-1.5 transition-all"
            title="Demo Reset: Clear all attacks and return to clean baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* AI Copilot Toggle */}
          <button
            onClick={toggleCopilotOpen}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border transition-all ${
              aiCopilot.isOpen 
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]'
                : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60'
            }`}
            title="Open SentinelAI Copilot Advisor"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Copilot</span>
            {activeAttack && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            )}
          </button>

          {/* Audio Sound Toggle */}
          <button
            onClick={toggleAudio}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800"
            title={audioMuted ? 'Unmute SOC Audio' : 'Mute SOC Audio'}
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Live UTC Clock */}
          <div className="hidden 2xl:flex items-center space-x-1.5 px-2.5 py-1 text-slate-400 font-mono text-xs border border-slate-800 rounded-lg bg-slate-950/50">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{utcTime}</span>
          </div>
        </div>

      </div>
    </header>
  );
}

