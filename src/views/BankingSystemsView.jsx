import React, { useState } from 'react';
import { 
  Landmark, 
  Server, 
  Database, 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Radio, 
  Activity, 
  ArrowRight,
  Terminal,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export default function BankingSystemsView() {
  const { 
    bankingSystems, 
    isolateSystem, 
    restoreSystem, 
    activeAttack,
    mitigateAttack
  } = useSentinel();

  const [selectedSystemId, setSelectedSystemId] = useState('api_gateway');
  const selectedSystem = bankingSystems[selectedSystemId] || bankingSystems.api_gateway;

  const systemOrder = ['api_gateway', 'auth_service', 'transaction_service', 'database'];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-[#080d1e]">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4" />
            <span>Infrastructure Telemetry & Microservices Health</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-white">
            Core Banking Infrastructure Topology
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Real-time status monitoring, side-channel anomaly detection, and autonomous network isolation for critical core banking tiers.
          </p>
        </div>

        {activeAttack && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-rose-400 animate-pulse font-bold">
              ATTACK PRESSURE DETECTED ON {activeAttack.target.toUpperCase()}
            </span>
            <button
              onClick={() => mitigateAttack('Infrastructure Topology Operator Mitigation')}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all"
            >
              Mitigate
            </button>
          </div>
        )}
      </div>

      {/* Visual Service Mesh / Topology Pipeline Flow */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#070b18] overflow-x-auto">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-3">
          Banking Dataflow & Service Mesh Topology
        </div>
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {systemOrder.map((key, idx) => {
            const sys = bankingSystems[key];
            const isTarget = activeAttack?.target === key;
            const isSelected = selectedSystemId === key;
            return (
              <React.Fragment key={key}>
                <div
                  onClick={() => setSelectedSystemId(key)}
                  className={`flex-1 cursor-pointer p-3.5 rounded-xl border transition-all ${
                    isTarget
                      ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse'
                      : sys.isolated
                        ? 'bg-slate-900/40 border-slate-700 opacity-60'
                        : isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">NODE 0{idx + 1}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isTarget
                        ? 'bg-rose-600 text-white'
                        : sys.isolated
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {sys.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-white truncate">{sys.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">CPU: {sys.cpu}% | {sys.latency}ms</div>
                </div>

                {idx < systemOrder.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-1 text-slate-600">
                    <ArrowRight className={`w-4 h-4 ${isTarget ? 'text-rose-400 animate-pulse' : 'text-slate-600'}`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detailed System Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(bankingSystems).map((sys) => {
          const isTarget = activeAttack?.target === sys.id;
          const isSelected = selectedSystemId === sys.id;
          return (
            <div
              key={sys.id}
              onClick={() => setSelectedSystemId(sys.id)}
              className={`cursor-pointer rounded-xl p-4 border transition-all ${
                isSelected ? 'border-cyan-500 bg-[#0a1129]' : 'border-slate-800 bg-[#090e21]'
              } hover:border-cyan-500/50`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-mono text-sm font-bold text-white">{sys.name}</h3>
                  <p className="text-[10px] font-mono text-slate-400">{sys.subname}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  isTarget
                    ? 'bg-rose-600 text-white animate-pulse'
                    : sys.isolated
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {sys.status}
                </span>
              </div>

              {/* Metrics */}
              <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/80 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[11px]">CPU Load:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${sys.cpu > 70 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                        style={{ width: `${Math.min(100, sys.cpu)}%` }}
                      />
                    </div>
                    <span className={sys.cpu > 70 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                      {sys.cpu}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Throughput (RPS):</span>
                  <span className="text-slate-200">{sys.rps.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Round-trip Latency:</span>
                  <span className={sys.latency > 100 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                    {sys.latency}ms
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Error Rate:</span>
                  <span className={sys.errorRate > 1 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                    {sys.errorRate}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400 text-[11px]">Active Connections:</span>
                  <span className="text-slate-200">{sys.connections}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Deep Dive: Processes, Security Controls & Forensic Dump */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Node Process List (2 cols) */}
        <div className="lg:col-span-2 border border-slate-800 rounded-xl bg-[#070b18] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Telemetry Inspector
              </span>
              <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
                {selectedSystem.name} Process Table
              </h3>
            </div>
            
            {/* Isolation Action Button */}
            <div>
              {selectedSystem.isolated ? (
                <button
                  onClick={() => restoreSystem(selectedSystem.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Restore Node
                </button>
              ) : (
                <button
                  onClick={() => isolateSystem(selectedSystem.id)}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-700/80 hover:bg-rose-600 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Isolate Node (Quarantine)
                </button>
              )}
            </div>
          </div>

          {/* Running Process Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                  <th className="py-2">PID</th>
                  <th className="py-2">Executable / Daemon</th>
                  <th className="py-2">CPU %</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {selectedSystem.processes.map((proc) => {
                  const isHostile = proc.status === 'ROGUE_EXEC' || proc.status === 'HOSTILE' || proc.status === 'EXHAUSTED';
                  return (
                    <tr
                      key={proc.pid}
                      className={isHostile ? 'bg-rose-950/40 text-rose-200' : 'text-slate-300'}
                    >
                      <td className="py-2.5 font-bold">{proc.pid}</td>
                      <td className="py-2.5 flex items-center gap-2">
                        {isHostile && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                        <span className={isHostile ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                          {proc.name}
                        </span>
                      </td>
                      <td className="py-2.5">{proc.cpu}%</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isHostile ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {proc.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono text-[11px]">
                        {isHostile ? (
                          <span className="text-rose-400 font-bold">UNVERIFIED HASH</span>
                        ) : (
                          <span className="text-emerald-400">SHA256 SIGNED</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Node Security Envelope & Configuration (1 col) */}
        <div className="border border-slate-800 rounded-xl bg-[#070b18] p-5 space-y-4 font-mono text-xs">
          <div className="text-cyan-400 uppercase tracking-wider text-xs font-bold border-b border-slate-800 pb-2">
            Security Envelope & Controls
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Service Role:</div>
              <div className="text-white font-bold mt-0.5">{selectedSystem.role}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px]">mTLS Authentication:</div>
              <div className="text-emerald-400 font-bold mt-0.5">ENFORCED (SPIFFE / SPIRE)</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Anomalies Detected:</div>
              <div className={`font-bold mt-0.5 ${selectedSystem.anomalies > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                {selectedSystem.anomalies} flags logged
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Auto-Failover State:</div>
              <div className="text-slate-200 mt-0.5">Hot-Standby Replica Ready (us-east-2)</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

