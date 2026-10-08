import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Server, 
  Database, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Radio, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Flame,
  KeyRound,
  Bug,
  Terminal,
  Crosshair,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useSentinel, ATTACK_PRESETS } from '../context/SentinelContext';

export default function DashboardView({ onNavigate }) {
  const {
    threatLevel,
    riskScore,
    activeIncidents,
    threatFeed,
    bankingSystems,
    telemetryHistory,
    activeAttack,
    launchAttack,
    mitigateAttack,
    toggleCopilotOpen,
    aiCopilot
  } = useSentinel();

  // Helper for sparkline SVG
  const renderSparkline = (data, color = '#06b6d4', minVal, maxVal) => {
    if (!data || data.length === 0) return null;
    const min = minVal !== undefined ? minVal : Math.min(...data);
    const max = maxVal !== undefined ? maxVal : Math.max(...data);
    const range = max - min || 1;
    const width = 120;
    const height = 36;
    
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Fill under line */}
        <polygon
          fill={color}
          fillOpacity="0.12"
          points={`0,${height} ${points} ${width},${height}`}
        />
      </svg>
    );
  };

  const currentCpu = telemetryHistory.cpu[telemetryHistory.cpu.length - 1] || 22;
  const currentRps = telemetryHistory.rps[telemetryHistory.rps.length - 1] || 1420;
  const currentLatency = telemetryHistory.latency[telemetryHistory.latency.length - 1] || 24;
  const currentErrors = telemetryHistory.errorRate[telemetryHistory.errorRate.length - 1] || 0.02;

  return (
    <div className="space-y-6">
      {/* Top Banner if Active Attack */}
      {activeAttack && (
        <div className="relative overflow-hidden rounded-xl border border-rose-500/60 bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/70 p-4 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-rose-600/30 border border-rose-500 text-rose-400 animate-pulse">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                    HOSTILE ATTACK IN PROGRESS
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white">
                    {activeAttack.severity}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white font-mono">{activeAttack.name}</h2>
                <p className="text-xs text-slate-300 font-sans">{activeAttack.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <button
                onClick={() => onNavigate('scenarios')}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
              >
                Inspect Scenario
              </button>
              <button
                onClick={() => mitigateAttack('Immediate SOC Operator Countermeasure')}
                className="flex-1 md:flex-initial px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all animate-pulse"
              >
                <ShieldCheck className="w-4 h-4" />
                Mitigate Attack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary SOC Metrics Grid (CPU, RPS, Latency, Errors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Ingress Requests / Sec */}
        <div className="soc-panel rounded-xl p-4 border border-slate-800 bg-[#090e1f]/80 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Ingress Throughput
            </span>
            <span className={activeAttack?.id === 'ddos' ? 'text-rose-400 font-bold flex items-center' : 'text-emerald-400 flex items-center'}>
              {activeAttack?.id === 'ddos' ? <ArrowUpRight className="w-3.5 h-3.5" /> : null}
              {activeAttack?.id === 'ddos' ? '+8,400%' : 'NORMAL'}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-2xl font-mono font-extrabold text-white">
              {currentRps.toLocaleString()} <span className="text-xs text-slate-400 font-normal">req/s</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">Live Traffic Curve</span>
            {renderSparkline(telemetryHistory.rps, activeAttack?.id === 'ddos' ? '#f43f5e' : '#06b6d4')}
          </div>
        </div>

        {/* Metric 2: Cluster CPU Load */}
        <div className="soc-panel rounded-xl p-4 border border-slate-800 bg-[#090e1f]/80 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Node CPU Utilization
            </span>
            <span className={currentCpu > 70 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
              {currentCpu > 70 ? 'SPIKE DETECTED' : 'STABLE'}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className={`text-2xl font-mono font-extrabold ${currentCpu > 70 ? 'text-rose-400' : 'text-white'}`}>
              {currentCpu}% <span className="text-xs text-slate-400 font-normal">avg load</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">Core Telemetry</span>
            {renderSparkline(telemetryHistory.cpu, currentCpu > 70 ? '#f43f5e' : '#818cf8')}
          </div>
        </div>

        {/* Metric 3: Round-Trip Latency */}
        <div className="soc-panel rounded-xl p-4 border border-slate-800 bg-[#090e1f]/80 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              End-to-End Latency
            </span>
            <span className={currentLatency > 100 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {currentLatency > 100 ? `${currentLatency}ms HIGH` : 'P99 < 35ms'}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className={`text-2xl font-mono font-extrabold ${currentLatency > 100 ? 'text-rose-400' : 'text-white'}`}>
              {currentLatency} <span className="text-xs text-slate-400 font-normal">ms</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">Latency Trend</span>
            {renderSparkline(telemetryHistory.latency, currentLatency > 100 ? '#f43f5e' : '#f59e0b')}
          </div>
        </div>

        {/* Metric 4: API Error Rate */}
        <div className="soc-panel rounded-xl p-4 border border-slate-800 bg-[#090e1f]/80 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Error / HTTP 5xx Rate
            </span>
            <span className={currentErrors > 2 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {currentErrors > 2 ? 'DEGRADED' : 'SLA 99.99%'}
            </span>
          </div>
          <div className="flex items-baseline justify-between mb-2">
            <div className={`text-2xl font-mono font-extrabold ${currentErrors > 2 ? 'text-rose-400' : 'text-white'}`}>
              {currentErrors}%
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">5xx Error Variance</span>
            {renderSparkline(telemetryHistory.errorRate, currentErrors > 2 ? '#f43f5e' : '#10b981')}
          </div>
        </div>
      </div>

      {/* Middle Row: Banking Systems Health Cards + AI Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Banking Core Systems Health (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Banking Infrastructure Topologies
            </h3>
            <button
              onClick={() => onNavigate('systems')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              System Details &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(bankingSystems).map((sys) => {
              const isBad = sys.status === 'UNDER ATTACK' || sys.status === 'CRITICAL' || sys.status === 'COMPROMISED';
              return (
                <div
                  key={sys.id}
                  className={`rounded-xl p-4 border transition-all ${
                    isBad
                      ? 'bg-rose-950/40 border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.2)]'
                      : sys.isolated
                        ? 'bg-slate-900/50 border-slate-700/50 opacity-70'
                        : 'bg-[#090e1f]/70 border-slate-800/90 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs font-mono font-bold text-white">{sys.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{sys.role}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      isBad
                        ? 'bg-rose-600 text-white animate-pulse'
                        : sys.isolated
                          ? 'bg-slate-800 text-slate-300'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {sys.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-lg bg-slate-950/70 border border-slate-800/60 text-center font-mono">
                    <div>
                      <div className="text-[10px] text-slate-400">CPU</div>
                      <div className={`text-xs font-bold ${sys.cpu > 70 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {sys.cpu}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">RPS</div>
                      <div className="text-xs font-bold text-slate-200">
                        {sys.rps > 999 ? `${(sys.rps / 1000).toFixed(1)}k` : sys.rps}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">LATENCY</div>
                      <div className={`text-xs font-bold ${sys.latency > 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                        {sys.latency}ms
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Copilot & Real-Time Defense Playbook (1 col) */}
        <div className="soc-panel rounded-xl p-4 border border-indigo-500/30 bg-[#0a0f26]/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                AI Copilot Advisory
              </span>
              <button
                onClick={toggleCopilotOpen}
                className="text-[11px] font-mono text-indigo-300 hover:text-white bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/40"
              >
                Full Chat &rarr;
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 mb-3">
              <div className="text-[10px] font-mono text-cyan-400 mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                ACTIVE SOC GUIDANCE
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {aiCopilot.guidance}
              </p>
            </div>

            {aiCopilot.recommendationAction && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 mb-3">
                <div className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider mb-1">
                  RECOMMENDED COUNTERMEASURE:
                </div>
                <div className="text-xs font-mono text-white mb-2">
                  {aiCopilot.recommendationAction}
                </div>
                <button
                  onClick={() => mitigateAttack(aiCopilot.recommendationAction)}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Execute Autonomous Response
                </button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Model: GPT-4o SOC Fine-Tuned</span>
            <span className="text-cyan-400">Zero-Shot Active</span>
          </div>
        </div>

      </div>

      {/* Bottom Row: Live Threat Feed & Attack Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Threat Feed (2 cols) */}
        <div className="lg:col-span-2 border border-slate-800 rounded-xl bg-[#070b17] p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                Live Threat Intelligence Feed
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Realtime Stream
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {threatFeed.length} Events Logged
            </span>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {threatFeed.map((item) => {
              const isCrit = item.severity === 'CRITICAL';
              const isHigh = item.severity === 'HIGH';
              const isWarn = item.severity === 'WARNING';
              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all ${
                    isCrit
                      ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                      : isHigh
                        ? 'bg-orange-950/30 border-orange-500/40 text-orange-200'
                        : isWarn
                          ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 text-[11px]">{item.timestamp}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        isCrit ? 'bg-rose-600 text-white' : isHigh ? 'bg-orange-600 text-white' : isWarn ? 'bg-amber-500 text-black' : 'bg-slate-800 text-cyan-400'
                      }`}>
                        {item.severity}
                      </span>
                      <span className="font-bold text-white">{item.event}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Src: {item.sourceIp}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Target: <span className="text-cyan-400">{item.targetService}</span> | {item.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attack Timeline & Active Incidents (1 col) */}
        <div className="border border-slate-800 rounded-xl bg-[#070b17] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Attack Timeline
              </h3>
              <span className="text-[10px] font-mono text-slate-400">INCIDENT LEDGER</span>
            </div>

            {activeIncidents.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 font-mono text-xs">
                No active security incidents.
                <div className="mt-2 text-slate-400">
                  Launch an attack scenario using the buttons above to test response pipelines.
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {activeIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className={`p-3 rounded-lg border font-mono text-xs ${
                      inc.status === 'ACTIVE'
                        ? 'bg-rose-950/40 border-rose-500/50'
                        : 'bg-emerald-950/20 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{inc.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.status === 'ACTIVE' ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                    <div className="text-slate-200 font-semibold mb-1">{inc.title}</div>
                    <div className="text-[10px] text-slate-400">
                      <div>Triggered: {inc.time}</div>
                      <div>Target: {inc.target.toUpperCase()}</div>
                      <div>MITRE: {inc.mitre}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
            >
              Generate Full Incident Forensics Report &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

