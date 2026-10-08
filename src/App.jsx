import React, { useState } from 'react';
import { SentinelProvider, useSentinel } from './context/SentinelContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AICopilotDrawer from './components/AICopilotDrawer';
import DashboardView from './views/DashboardView';
import AttackScenariosView from './views/AttackScenariosView';
import BankingSystemsView from './views/BankingSystemsView';
import HoneypotView from './views/HoneypotView';
import ReportsView from './views/ReportsView';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const { threatLevel } = useSentinel();

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-40"></div>
      
      {/* Red Alert Glow if CRITICAL */}
      {threatLevel === 'CRITICAL' && (
        <div className="fixed inset-0 pointer-events-none bg-rose-950/15 animate-pulse z-0" />
      )}

      {/* Top SOC Bar */}
      <Header />

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex relative z-10 overflow-hidden">
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto w-full">
          {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
          {currentTab === 'scenarios' && <AttackScenariosView />}
          {currentTab === 'systems' && <BankingSystemsView />}
          {currentTab === 'honeypot' && <HoneypotView />}
          {currentTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {/* Global AI Copilot Flyout Drawer */}
      <AICopilotDrawer />
    </div>
  );
}

export default function App() {
  return (
    <SentinelProvider>
      <AppContent />
    </SentinelProvider>
  );
}
