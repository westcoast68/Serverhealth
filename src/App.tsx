import React, { useState } from 'react';
import { Header } from './components/Header';
import { PatchingHub } from './components/patching/PatchingHub';
import { AppInstallHub } from './components/install/AppInstallHub';
import { TerminalSimulator } from './components/terminal/TerminalSimulator';
import { KnowledgeHub } from './components/knowledge/KnowledgeHub';
import { AiCopilotDrawer } from './components/copilot/AiCopilotDrawer';
import { INITIAL_MOCK_SERVERS } from './data/patchingData';
import { MockServer } from './types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  Download,
  Info
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'patching' | 'install' | 'terminal' | 'knowledge'>('patching');
  const [servers, setServers] = useState<MockServer[]>(INITIAL_MOCK_SERVERS);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePatchServer = (serverId: string) => {
    setServers(prev => prev.map(s => {
      if (s.id === serverId) {
        return {
          ...s,
          patchStatus: 'up-to-date',
          pendingUpdatesCount: 0,
          criticalCveCount: 0,
          cves: [],
          lastPatched: new Date().toISOString().split('T')[0]
        };
      }
      return s;
    }));
    showToast(`Applied security patches to ${serverId}. Host is now compliant.`, 'success');
  };

  const handlePatchAllServers = () => {
    setServers(prev => prev.map(s => ({
      ...s,
      patchStatus: 'up-to-date',
      pendingUpdatesCount: 0,
      criticalCveCount: 0,
      cves: [],
      lastPatched: new Date().toISOString().split('T')[0]
    })));
    showToast('Executed staged canary rollout across entire fleet. All 7 hosts are compliant!', 'success');
  };

  const handleLaunchLab = (labId?: string) => {
    if (labId) {
      setSelectedLabId(labId);
    }
    setActiveTab('terminal');
    showToast('Switched to Interactive Lab Terminal.', 'info');
  };

  const handleAskCopilotAboutApp = (appName: string) => {
    setCopilotInitialPrompt(`How do I deploy, harden, and configure systemd security sandboxing for ${appName} on Linux production servers?`);
    setIsCopilotOpen(true);
  };

  const criticalCveCount = servers.reduce((acc, s) => acc + s.criticalCveCount, 0);
  const securityPendingCount = servers.reduce((acc, s) => acc + s.pendingUpdatesCount, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCopilot={() => {
          setCopilotInitialPrompt('');
          setIsCopilotOpen(true);
        }}
        criticalCveCount={criticalCveCount}
        securityPendingCount={securityPendingCount}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-2.5 sm:px-4 lg:px-6 py-3.5 space-y-4">
        {activeTab === 'patching' && (
          <PatchingHub
            servers={servers}
            onPatchServer={handlePatchServer}
            onPatchAllServers={handlePatchAllServers}
            onLaunchLab={handleLaunchLab}
          />
        )}

        {activeTab === 'install' && (
          <AppInstallHub
            onLaunchLab={handleLaunchLab}
            onAskCopilotAboutApp={handleAskCopilotAboutApp}
          />
        )}

        {activeTab === 'terminal' && (
          <TerminalSimulator
            initialLabId={selectedLabId}
            onClearInitialLab={() => setSelectedLabId(null)}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeHub />
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-bounce">
          <div className={`px-3 py-2 rounded-lg shadow-xl border text-xs font-mono flex items-center space-x-2 ${
            toastMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200' :
            toastMessage.type === 'warn' ? 'bg-amber-950/90 border-amber-500/60 text-amber-200' :
            'bg-slate-900 border-indigo-500/60 text-indigo-200'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
            {toastMessage.type === 'warn' && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
            {toastMessage.type === 'info' && <Info className="h-3.5 w-3.5 text-indigo-400" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* AI SysAdmin Drawer */}
      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialPrompt={copilotInitialPrompt}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-2.5 text-center text-[11px] text-slate-500 font-mono">
        <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <span>SYSADMIN.OPS v2.4 • Production Server Infrastructure & Deployment Control</span>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>DEB/UBUNTU</span>
            <span>•</span>
            <span>RHEL/ROCKY</span>
            <span>•</span>
            <span>SLES</span>
            <span>•</span>
            <span>WIN-SRV</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
