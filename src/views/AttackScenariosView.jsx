import React, { useState } from 'react';
import { 
  Crosshair, 
  Flame, 
  KeyRound, 
  Database, 
  Bug, 
  Play, 
  Square, 
  AlertOctagon, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Server, 
  Terminal,
  Zap,
  Sliders
} from 'lucide-react';
import { useSentinel, ATTACK_PRESETS } from '../context/SentinelContext';

export default function AttackScenariosView() {
  const { 
    activeAttack, 
    launchAttack, 
    mitigateAttack, 
    resetDemo, 
    threatLevel, 
    riskScore,
    bankingSystems
  } = useSentinel();

  const [intensity, setIntensity] = useState('MAXIMUM');
  const [selectedPreset, setSelectedPreset] = useState('ddos');

  const attackList = Object.values(ATTACK_PRESETS);
  const currentScenario = ATTACK_PRESETS[selectedPreset];

  const stages = [
    { name: '1. Reconnaissance', desc: 'Port scanning & banner discovery' },
    { name: '2. Delivery', desc: 'Payload transmission via HTTP/TCP' },
    { name: '3. Exploitation', desc: 'Vulnerability trigger & service bypass' },
    { name: '4. Impact / Exfil', desc: 'Resource depletion & lateral pivot' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-[#080d1e]">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Crosshair className="w-4 h-4" />
            <span>Adversary Emulation & Incident Orchestrator</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-white">
            Attack Scenario Control Matrix
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Safely inject simulated multi-stage cyber attacks against virtualized banking infrastructure to evaluate detection pipelines and AI defenses.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={resetDemo}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700 transition-colors"
          >
            Reset Simulator
          </button>
          {activeAttack && (
            <button
              onClick={() => mitigateAttack('Scenarios Console Operator Immediate Abort')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              Neutralize Active Attack
            </button>
          )}
        </div>
      </div>

      {/* Scenario Selection Grid (4 Vectors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {attackList.map((preset) => {
          const isSelected = selectedPreset === preset.id;
          const isCurrentActive = activeAttack?.id === preset.id;
          
          let Icon = Flame;
          let iconColor = 'text-rose-400';
          if (preset.id === 'brute_force') {
            Icon = KeyRound;
            iconColor = 'text-orange-400';
          } else if (preset.id === 'sql_injection') {
            Icon = Database;
            iconColor = 'text-purple-400';
          } else if (preset.id === 'malware') {
            Icon = Bug;
            iconColor = 'text-red-400';
          }

          return (
            <div
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={`cursor-pointer rounded-xl p-4 border transition-all ${
                isCurrentActive
                  ? 'bg-rose-950/50 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] ring-1 ring-rose-500'
                  : isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-[#090e21] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isCurrentActive ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-600 text-white font-bold animate-pulse">
                    LIVE ATTACK
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {preset.severity}
                  </span>
                )}
              </div>

              <h3 className="font-mono text-sm font-bold text-white mb-1">{preset.name}</h3>
              <p className="text-[11px] font-sans text-slate-400 line-clamp-2 mb-3">
                {preset.description}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Target:</span>
                <span className="text-cyan-400 font-bold">{preset.target}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Scenario Deep-Dive & Execution Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenario Details & Execution Controls (2 cols) */}
        <div className="lg:col-span-2 border border-slate-800 rounded-xl bg-[#070b19] p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Active Scenario Configuration
              </span>
              <h3 className="text-lg font-mono font-bold text-white">{currentScenario.name}</h3>
              <span className="text-xs font-mono text-slate-400">{currentScenario.mitre}</span>
            </div>

            {/* Launch / Stop Button */}
            <div>
              {activeAttack?.id === currentScenario.id ? (
                <button
                  onClick={() => mitigateAttack('Scenarios Manual Termination')}
                  className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" />
                  Abort Active Attack
                </button>
              ) : (
                <button
                  onClick={() => launchAttack(currentScenario.id)}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(225,29,72,0.5)] transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Launch Attack Scenario
                </button>
              )}
            </div>
          </div>

          {/* Attack Stages Progression Visualizer */}
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              Multi-Stage Attack Lifecycle
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              {stages.map((stg, i) => {
                const isActive = activeAttack?.id === currentScenario.id;
                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border font-mono text-xs transition-all ${
                      isActive
                        ? 'bg-rose-950/40 border-rose-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className={`font-bold ${isActive ? 'text-rose-400' : 'text-slate-300'}`}>
                      {stg.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{stg.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Attacker Commands Emulation Box */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Scripted Payload Sequence
              </span>
              <span className="text-[10px] text-slate-500">SIMULATED EXECUTION</span>
            </div>
            <div className="bg-black/80 rounded-lg p-3 border border-slate-800 font-mono text-xs space-y-2">
              {currentScenario.commands.map((cmd, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 select-none">root@adversary:~#</span>
                  <span className="text-slate-200">{cmd}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Impact Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Target System Impact</div>
              <div className="text-xs font-mono text-white mt-1">{currentScenario.impactDesc}</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Vector Classification</div>
              <div className="text-xs font-mono text-cyan-400 mt-1">{currentScenario.vector}</div>
            </div>
          </div>
        </div>

        {/* Live Attack Telemetry & AI Defense Summary (1 col) */}
        <div className="border border-slate-800 rounded-xl bg-[#070b19] p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-wider mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>AI Defensive Readiness</span>
            </div>
            <h4 className="text-sm font-mono font-bold text-white mb-2">
              Target Node: {currentScenario.target.toUpperCase()}
            </h4>

            {/* Target Node Current Status */}
            {(() => {
              const targetNode = bankingSystems[currentScenario.target];
              if (!targetNode) return null;
              return (
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 mb-4 font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Node Status:</span>
                    <span className={targetNode.status === 'HEALTHY' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {targetNode.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Live CPU:</span>
                    <span className="text-white">{targetNode.cpu}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">RPS:</span>
                    <span className="text-white">{targetNode.rps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Latency:</span>
                    <span className="text-white">{targetNode.latency}ms</span>
                  </div>
                </div>
              );
            })()}

            {/* Copilot Recommendation */}
            <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/40">
              <div className="text-[10px] font-mono text-indigo-300 font-bold mb-1">
                PRE-CONFIGURED PLAYBOOK:
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {currentScenario.copilotAdvice}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">
              Test Harness Validation
            </div>
            <div className="text-xs font-mono text-slate-300">
              Simulated without real network sockets or destructive code execution.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

