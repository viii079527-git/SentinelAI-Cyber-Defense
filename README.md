# SentinelAI — Real-Time Cyber Defense Command Center

SentinelAI is an interactive cyber defense platform built for live simulation, detection, automated response, and adversary analysis across critical banking infrastructure.

##  Live Demo URL
- **Local:** `http://localhost:5173/`
- **Network:** Available on LAN port 5173

---

##  Core Capabilities

### 1. Executive SOC Dashboard
- **DEFCON Threat Level**: Real-time threat classification (`LOW`, `ELEVATED`, `HIGH`, `CRITICAL`).
- **Dynamic Risk Score (0-100)**: Real-time gauge reflecting enterprise vulnerability and attack pressure.
- **Active Incidents**: Live tracker of ongoing hostile events.
- **Live Telemetry Sparklines**: Continuous curves for Ingress RPS, Cluster CPU, Round-trip Latency, and HTTP 5xx Error rates.
- **Live Threat Feed**: Realtime streaming SOC logs with severity badges, source IP, and target subsystems.
- **Attack Timeline**: Chronological incident flow.

### 2. Attack Scenario Matrix
Interactive attack launcher with 4 enterprise vectors:
- **DDoS**: Layer 7 volumetric flood & TCP SYN storm targeting `api_gateway`.
- **Brute Force**: Distributed credential spraying targeting `auth_service`.
- **SQL Injection**: Boolean & UNION-based SQLi against `database`.
- **Banking Trojan / Malware**: Reverse shell and lateral movement inside `transaction_service`.
- **Multi-Stage Attack Lifecycle**: Emulation of Reconnaissance &rarr; Delivery &rarr; Exploitation &rarr; Lateral Impact.
- **Dynamic Updates**: Spikes Risk Score to 90+, escalates DEFCON to 1, degrades target node, streams honeypot traces, and triggers AI playbooks.

### 3. Banking Infrastructure Topology
- 4 Core Microservice Tiers:
  - `api_gateway`: Envoy Ingress & Coraza WAF
  - `auth_service`: Keycloak IAM & Redis Session Cluster
  - `transaction_service`: SWIFT / ACH Settlement Engine
  - `database`: PostgreSQL 16 HA Cluster
- Real-time CPU, RPS, latency, error rate, and active connections per node.
- Live Process Explorer: inspect active processes, detect unverified rogue binaries (`nc -e`, `sqlmap`, `syn_flood`).
- Node Isolation / Quarantine controls: 1-click containment to blackhole hostile traffic.

### 4. Honeypot Deception Grid & Terminal
- High-interaction deception honeypots (`decoy-swift-gateway-01`, `ssh-bastion-trap`, `shadow-db-replica`).
- Interactive Hacker Terminal Replay with live streaming commands and tarpit traps.
- Analyst terminal input: type commands like `help`, `whoami`, `nmap`, `cat /etc/passwd`, `ls /opt/banking`.
- Adversary Dossier: geolocated IP, Tor exit status, ASN, and MITRE ATT&CK techniques (T1498, T1110, T1190, T1059).

### 5. Compliance & Incident Reports
- Key Executive KPIs:
  - **MTTD (Mean Time to Detect)**: 1.2s (Real-time AI detection)
  - **MTTR (Mean Time to Respond)**: 4.6s (Autonomous playbook execution)
  - **Containment Success Rate**: 99.4%
- Filterable Incident Ledger (All, Active, Critical, Mitigated).
- **1-Click Export**:
  - Download full audit as structured JSON
  - Download full incident log as CSV spreadsheet

### 6. AI Copilot (GPT-4o SEC-OPS)
- Live situation assessment and contextual guidance.
- 1-Click Autonomous Defense Countermeasures.
- Interactive conversational chat with suggested quick inquiry prompts.
- Optional Autonomous Self-Healing mode (auto-mitigates attacks after detection).

---

## 🛠️ Tech Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Audio Feedback:** Synthesized Web Audio API (tactical SOC blips, alerts, sirens)
- **State Engine:** Centralized reactive simulation store
