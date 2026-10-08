import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  ShieldAlert, 
  Crosshair, 
  MapPin, 
  Wifi, 
  Send, 
  Trash2, 
  Copy, 
  Radio, 
  CheckCircle2, 
  Bug, 
  Key, 
  Eye, 
  Lock
} from 'lucide-react';
import { useSentinel } from '../context/SentinelContext';

export default function HoneypotView() {
  const { 
    honeypotLogs, 
    honeypotState, 
    activeAttack, 
    launchAttack, 
    mitigateAttack 
  } = useSentinel();

  const [cliInput, setCliInput] = useState('');
  const [localCliLogs, setLocalCliLogs] = useState([]);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [honeypotLogs, localCliLogs]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim();
    setCliInput('');

    let reply = '';
    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      reply = 'Available Honeypot Deception commands: nmap, whoami, uname -a, cat /etc/passwd, ls /opt/banking, ps aux, exit';
    } else if (lower === 'whoami') {
      reply = 'root (simulated environment decoy UID=0 GID=0)';
    } else if (lower.includes('uname')) {
      reply = 'Linux decoy-swift-node 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux [DECEPTION_TRAP]';
    } else if (lower.includes('passwd')) {
      reply = 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:HoneyAdmin:/home/admin:/bin/bash\nswift_operator:x:1001:1001:HoneyTokenUser:/opt/swift:/bin/sh';
    } else if (lower.includes('ls')) {
      reply = 'total 32\ndrwxr-xr-x 2 root root 4096 Oct 07 20:55 certificates\n-rw-r--r-- 1 root root  820 Oct 07 20:56 swift_messages.xml.canary\n-rw-r--r-- 1 root root 1204 Oct 07 20:57 database_credentials.env.trap';
    } else if (lower.includes('nmap')) {
      reply = 'Starting Nmap 7.94 ( https://nmap.org )\nPORT     STATE SERVICE\n22/tcp   open  ssh (OpenSSH 8.2p1 Canary)\n443/tcp  open  https (Swift Web Ingress Trap)\n5432/tcp open  postgresql (PostgreSQL 14.2 Replica)';
    } else {
      reply = `bash: ${cmd}: command executed inside sandbox container. Honeytoken canary triggered.`;
    }

    setLocalCliLogs(prev => [
      ...prev,
      { type: 'cmd', text: `root@honey-trap-01:~# ${cmd}` },
      { type: 'output', text: reply }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-[#080d1e]">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs uppercase tracking-wider mb-1">
            <TerminalIcon className="w-4 h-4" />
            <span>Adversary Deception & Side-Channel Honeypot</span>
          </div>
          <h2 className="text-xl font-mono font-bold text-white">
            Honeypot Forensic Deception Grid
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Adversary interactions are redirected to high-interaction shadow canary nodes to capture zero-day tactics, commands, and network fingerprints in real time.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border ${
            honeypotState.trappedConnections > 0
              ? 'bg-purple-950/60 border-purple-500/80 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            STATUS: {honeypotState.status} ({honeypotState.trappedConnections} Trapped)
          </span>
        </div>
      </div>

      {/* Adversary Profile & Decoy Node Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Adversary Profile */}
        <div className="border border-purple-500/30 rounded-xl bg-[#090d22] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Adversary Profile
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
              FINGERPRINTED
            </span>
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Target IP:</span>
              <span className="text-rose-400 font-bold">{honeypotState.activeAttackerIp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Geolocation:</span>
              <span className="text-slate-200">{honeypotState.attackerCountry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">MITRE Tech:</span>
              <span className="text-cyan-400 font-bold">{honeypotState.mitreTechnique}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Honeytokens:</span>
              <span className="text-purple-400 font-bold">{honeypotState.deceptionTokensTriggered} Triggered</span>
            </div>
          </div>
        </div>

        {/* Decoy 1: SWIFT Gateway Trap */}
        <div className="border border-slate-800 rounded-xl bg-[#090e21] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-white">decoy-swift-gateway-01</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
              LISTENING
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mb-3">
            Emulates SWIFT Alliance Web Gateway on port 443 with fake ISO 20022 messaging endpoints.
          </p>
          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            Tarpit delay: 2,500ms / request
          </div>
        </div>

        {/* Decoy 2: Canary Database Replica */}
        <div className="border border-slate-800 rounded-xl bg-[#090e21] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-bold text-white">shadow-db-replica</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
              CANARY ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans mb-3">
            Seeded with 5,000 synthetic customer records with embedded honeytoken phone numbers and emails.
          </p>
          <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
            Exfil Canary Alert: Arming auto-pcap
          </div>
        </div>
      </div>

      {/* Attacker Interactive Terminal Window */}
      <div className="rounded-xl border border-slate-800 bg-[#04060d] overflow-hidden shadow-2xl">
        {/* Terminal Titlebar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0f21] border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="ml-2 font-mono text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
              root@honeypot-sandbox-node-01: ~ (Forensic Session Replay)
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
            <span className="text-purple-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>
              REPLAY STREAMING
            </span>
            <button
              onClick={() => setLocalCliLogs([])}
              className="hover:text-white flex items-center gap-1"
              title="Clear terminal output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 font-mono text-xs min-h-[380px] max-h-[460px] overflow-y-auto space-y-2 bg-[#04060d] text-slate-300">
          {/* Default Simulation Logs */}
          {honeypotLogs.map((log, idx) => {
            if (log.type === 'alert') {
              return (
                <div key={idx} className="p-2 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 font-bold">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'cmd') {
              return (
                <div key={idx} className="text-cyan-300 font-semibold">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'honeypot') {
              return (
                <div key={idx} className="text-purple-400">
                  {log.text}
                </div>
              );
            }
            return (
              <div key={idx} className="text-slate-400">
                {log.text}
              </div>
            );
          })}

          {/* Local User Executed Command Logs */}
          {localCliLogs.map((item, idx) => (
            <div key={`local-${idx}`}>
              {item.type === 'cmd' ? (
                <div className="text-emerald-400 font-semibold">{item.text}</div>
              ) : (
                <pre className="text-slate-300 whitespace-pre-wrap">{item.text}</pre>
              )}
            </div>
          ))}

          <div ref={terminalEndRef} />
        </div>

        {/* Interactive Command Input Form */}
        <form onSubmit={handleCommandSubmit} className="flex items-center px-4 py-2.5 bg-[#090d20] border-t border-slate-800">
          <span className="text-emerald-400 font-mono text-xs mr-2 select-none">
            analyst@sentinel:~$
          </span>
          <input
            type="text"
            value={cliInput}
            onChange={(e) => setCliInput(e.target.value)}
            placeholder="Type sandbox command (e.g. 'help', 'nmap', 'ls', 'whoami', 'cat /etc/passwd')..."
            className="flex-1 bg-transparent border-none text-white text-xs font-mono focus:outline-none placeholder-slate-600"
          />
          <button
            type="submit"
            className="text-xs font-mono text-cyan-400 hover:text-white px-2 py-1 rounded bg-cyan-950/60 border border-cyan-800/60"
          >
            Run
          </button>
        </form>
      </div>
    </div>
  );
}

