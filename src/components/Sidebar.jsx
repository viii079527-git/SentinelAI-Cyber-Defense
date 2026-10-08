import React from 'react';
import { 
  LayoutDashboard, 
  Crosshair, 
  Landmark, 
  Terminal, 
  FileSpreadsheet, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Database,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const { activeAttack, bankingSystems, honeypotState, activeIncidents } = useSentinel();

  const systemsUnderAttack = Object.values(bankingSystems).filter(
    s => s.status === 'UNDER ATTACK' || s.status === 'CRITICAL' || s.status === 'COMPROMISED'
  ).length;

  const tabs = [
    {
      id: 'dashboard',
      label: 'SOC Dashboard',
      icon: LayoutDashboard,
      badge: activeIncidents.filter(i => i.status === 'ACTIVE').length > 0 
        ? `${activeIncidents.filter(i => i.status === 'ACTIVE').length} ALERT` 
        : 'LIVE',
      badgeColor: activeIncidents.filter(i => i.status === 'ACTIVE').length > 0 
        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' 
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'scenarios',
      label: 'Attack Scenarios',
      icon: Crosshair,
      badge: activeAttack ? activeAttack.name.split(' ')[0] : '4 Vectors',
      badgeColor: activeAttack 
        ? 'bg-rose-600/30 text-rose-300 border-rose-500/40 animate-pulse' 
        : 'bg-slate-800 text-slate-400 border-slate-700'
    },
    {
      id: 'systems',
      label: 'Banking Systems',
      icon: Landmark,
      badge: systemsUnderAttack > 0 ? `${systemsUnderAttack} DEGRADED` : '4 ONLINE',
      badgeColor: systemsUnderAttack > 0 
        ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' 
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      id: 'honeypot',
      label: 'Honeypot Terminal',
      icon: Terminal,
      badge: honeypotState.trappedConnections > 0 ? `${honeypotState.trappedConnections} TRAPPED` : 'IDLE',
      badgeColor: honeypotState.trappedConnections > 0 
        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse' 
        : 'bg-slate-800 text-slate-400 border-slate-700'
    },
    {
      id: 'reports',
      label: 'Incident Reports',
      icon: FileSpreadsheet,
      badge: 'EXPORT',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800/80 bg-[#060a16] flex flex-col justify-between p-3.5">
      {/* Top Nav Items */}
      <div className="space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Navigation Plane
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium font-mono transition-all group ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{tab.label}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-semibold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Subsystem Matrix Status */}
        <div className="border border-slate-800/80 rounded-xl p-3 bg-slate-950/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-cyan-400" />
              Subsystem Grid
            </span>
            <span className="text-[9px] font-mono text-cyan-400">SYNCED</span>
          </div>
          <div className="space-y-1.5">
            {Object.values(bankingSystems).map((sys) => {
              const isBad = sys.status === 'CRITICAL' || sys.status === 'UNDER ATTACK' || sys.status === 'COMPROMISED';
              return (
                <div key={sys.id} className="flex items-center justify-between text-xs font-mono py-1 border-b border-slate-900 last:border-none">
                  <span className="text-slate-400 truncate max-w-[120px]">{sys.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    isBad 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : sys.isolated 
                        ? 'bg-slate-800 text-slate-400' 
                        : 'text-emerald-400'
                  }`}>
                    {sys.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Node Metadata */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
          <span>PIPELINE ENGINE</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            WEBSOCKET 0.0ms
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-600">
          <span>FASTAPI CLUSTER</span>
          <span>CLUSTER-PRIMARY-US-EAST</span>
        </div>
      </div>
    </aside>
  );
}

