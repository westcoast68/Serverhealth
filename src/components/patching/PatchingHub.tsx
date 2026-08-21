import React, { useState } from 'react';
import { 
  PATCH_COMMAND_GUIDES, 
  PATCH_LIFECYCLE_STAGES 
} from '../../data/patchingData';
import { MockServer } from '../../types';
import { 
  ShieldAlert, 
  Copy, 
  Check, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  Terminal, 
  CheckCircle2, 
  Play, 
  Layers, 
  Calculator,
  ChevronRight,
  Info,
  Server,
  Zap,
  RotateCcw
} from 'lucide-react';

interface PatchingHubProps {
  servers: MockServer[];
  onPatchServer: (serverId: string) => void;
  onPatchAllServers: () => void;
  onLaunchLab: (labId?: string) => void;
}

export const PatchingHub: React.FC<PatchingHubProps> = ({
  servers,
  onPatchServer,
  onPatchAllServers,
  onLaunchLab
}) => {
  const [activeSection, setActiveSection] = useState<'matrix' | 'lifecycle' | 'fleet' | 'calculator'>('fleet');
  const [selectedOsId, setSelectedOsId] = useState<string>('ubuntu-debian');
  const [selectedStageNumber, setSelectedStageNumber] = useState<number>(1);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(servers[0]?.id || null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Maintenance Calculator State
  const [calcNodes, setCalcNodes] = useState<number>(6);
  const [calcDrainMinutes, setCalcDrainMinutes] = useState<number>(5);
  const [calcRebootMinutes, setCalcRebootMinutes] = useState<number>(4);
  const [calcCanaryHours, setCalcCanaryHours] = useState<number>(2);
  const [calcQuorumType, setCalcQuorumType] = useState<'odd-cluster' | 'active-passive' | 'stateless'>('odd-cluster');

  const selectedGuide = PATCH_COMMAND_GUIDES.find(g => g.id === selectedOsId) || PATCH_COMMAND_GUIDES[0];
  const selectedStage = PATCH_LIFECYCLE_STAGES.find(s => s.stageNumber === selectedStageNumber) || PATCH_LIFECYCLE_STAGES[0];
  const selectedServer = servers.find(s => s.id === selectedServerId);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Maintenance calculation logic
  const totalDowntimePerNode = calcDrainMinutes + calcRebootMinutes + 3; // +3 min post-check
  const totalRollingTimeMinutes = (calcNodes * totalDowntimePerNode) + (calcCanaryHours * 60);
  const formattedRollingHours = (totalRollingTimeMinutes / 60).toFixed(1);

  return (
    <div className="space-y-3">
      {/* Top Banner with Sub-Nav */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                FLEET PATCHING & REMEDIATION ENGINE
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans leading-tight">
              Enterprise patch lifecycle, zero-downtime rolling canary workflows, and cross-distribution package management.
            </p>
          </div>

          {/* Sub-nav Buttons */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-950 rounded border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveSection('fleet')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeSection === 'fleet'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              FLEET ({servers.filter(s => s.patchStatus !== 'up-to-date').length} PENDING)
            </button>
            <button
              onClick={() => setActiveSection('matrix')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeSection === 'matrix'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              OS MATRIX
            </button>
            <button
              onClick={() => setActiveSection('lifecycle')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeSection === 'lifecycle'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5-STAGE LIFECYCLE
            </button>
            <button
              onClick={() => setActiveSection('calculator')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeSection === 'calculator'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MAINTENANCE PLANNER
            </button>
          </div>
        </div>

        {/* Section 1: FLEET COMPLIANCE SIMULATOR */}
        {activeSection === 'fleet' && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-950/80 p-2.5 rounded border border-slate-800 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <div>
                  <span className="text-slate-400">TELEMETRY: </span>
                  <span className="text-slate-200">
                    {servers.filter(s => s.patchStatus === 'critical-cve').length} Critical CVEs • {' '}
                    {servers.filter(s => s.patchStatus === 'security-pending').length} Updates Pending • {' '}
                    {servers.filter(s => s.patchStatus === 'reboot-required').length} Reboot Required
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={onPatchAllServers}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  <Zap className="h-3 w-3" />
                  <span>EXECUTE STAGED ROLLOUT</span>
                </button>
              </div>
            </div>

            {/* Server Grid & Server Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Servers List */}
              <div className="lg:col-span-2 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <span>MANAGED HOSTS ({servers.length})</span>
                  <span>CLICK TO INSPECT ERRATA</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {servers.map((server) => {
                    const isSelected = selectedServerId === server.id;
                    return (
                      <div
                        key={server.id}
                        onClick={() => setSelectedServerId(server.id)}
                        className={`p-2.5 rounded border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-slate-900 border-indigo-500 shadow-xs'
                            : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-1.5">
                            <Server className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-xs font-mono font-bold text-white truncate max-w-[150px]" title={server.hostname}>
                              {server.hostname.split('.')[0]}
                            </span>
                          </div>
                          {server.patchStatus === 'critical-cve' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                              CRITICAL CVE
                            </span>
                          )}
                          {server.patchStatus === 'security-pending' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              PENDING ({server.pendingUpdatesCount})
                            </span>
                          )}
                          {server.patchStatus === 'reboot-required' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              REBOOT REQ
                            </span>
                          )}
                          {server.patchStatus === 'up-to-date' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              COMPLIANT
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                          {server.role}
                        </p>

                        <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>{server.os}</span>
                          <span className="text-slate-300">{server.ip}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Server Details Inspector */}
              <div className="bg-slate-950 border border-slate-800 rounded p-3 flex flex-col justify-between space-y-3">
                {selectedServer ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div>
                        <h3 className="text-xs font-mono font-bold text-white">{selectedServer.hostname}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">{selectedServer.ip} • {selectedServer.os}</p>
                      </div>
                      <button
                        onClick={() => onLaunchLab('lab-patch-nginx-zerodowntime')}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-mono border border-slate-700 transition-colors cursor-pointer"
                        title="Practice remediation in terminal"
                      >
                        <Terminal className="h-3 w-3 text-emerald-400" />
                        <span>LAB</span>
                      </button>
                    </div>

                    <div className="space-y-1 text-xs font-mono">
                      <div className="flex justify-between py-0.5 border-b border-slate-900">
                        <span className="text-slate-400">Kernel:</span>
                        <span className="text-slate-200">{selectedServer.kernelVersion}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-900">
                        <span className="text-slate-400">Uptime:</span>
                        <span className="text-slate-200">{selectedServer.uptime}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-900">
                        <span className="text-slate-400">Window:</span>
                        <span className="text-slate-200">{selectedServer.maintenanceWindow}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-900">
                        <span className="text-slate-400">Patched:</span>
                        <span className="text-slate-200">{selectedServer.lastPatched}</span>
                      </div>
                    </div>

                    {/* CVE Alerts on Host */}
                    {selectedServer.cves.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <h4 className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>Detected CVEs ({selectedServer.cves.length})</span>
                        </h4>
                        {selectedServer.cves.map((cve) => (
                          <div key={cve.cveId} className="p-2 rounded bg-red-950/20 border border-red-900/40 space-y-0.5 font-mono">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-red-400">{cve.cveId}</span>
                              <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-red-500/20 text-red-300">
                                CVSS {cve.cvssScore}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-300 font-sans leading-tight">{cve.description}</p>
                            <p className="text-[10px] text-emerald-400">Pkg: {cve.packageName} → {cve.fixVersion}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/40 text-center text-xs font-mono text-emerald-400 flex items-center justify-center space-x-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>All security errata applied. Host is compliant.</span>
                      </div>
                    )}

                    <div className="pt-1">
                      <button
                        onClick={() => onPatchServer(selectedServer.id)}
                        disabled={selectedServer.patchStatus === 'up-to-date'}
                        className={`w-full py-1.5 px-2.5 rounded text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-colors ${
                          selectedServer.patchStatus === 'up-to-date'
                            ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-xs'
                        }`}
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>
                          {selectedServer.patchStatus === 'up-to-date' ? 'HOST UP TO DATE' : 'APPLY SECURITY PATCH'}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-6 text-xs font-mono">
                    Select a host on the left to inspect vulnerability details.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: CROSS-OS COMMAND MATRIX */}
        {activeSection === 'matrix' && (
          <div className="mt-3 space-y-3">
            {/* OS Selector Tabs */}
            <div className="flex flex-wrap gap-1 border-b border-slate-800 pb-2 font-mono text-xs">
              {PATCH_COMMAND_GUIDES.map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedOsId(guide.id)}
                  className={`px-3 py-1 rounded font-semibold transition-colors flex items-center space-x-1.5 ${
                    selectedOsId === guide.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{guide.osName}</span>
                </button>
              ))}
            </div>

            {/* Matrix Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Check Updates */}
              <div className="bg-slate-950 border border-slate-800 rounded p-2.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Info className="h-3 w-3 text-indigo-400" />
                    <span>1. Check & Index Upgrades</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedGuide.checkUpdatesCmd, 'checkUpdatesCmd')}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Copy command"
                  >
                    {copiedKey === 'checkUpdatesCmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap border border-slate-800/80 font-mono">
                  {selectedGuide.checkUpdatesCmd}
                </pre>
              </div>

              {/* Security Only Updates */}
              <div className="bg-slate-950 border border-slate-800 rounded p-2.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                    <ShieldAlert className="h-3 w-3 text-amber-400" />
                    <span>2. Security-Only Patching (Minimal Blast Radius)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedGuide.securityOnlyCmd, 'securityOnlyCmd')}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Copy command"
                  >
                    {copiedKey === 'securityOnlyCmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-xs text-amber-300 overflow-x-auto whitespace-pre-wrap border border-slate-800/80 font-mono">
                  {selectedGuide.securityOnlyCmd}
                </pre>
              </div>

              {/* Single Package Upgrade */}
              <div className="bg-slate-950 border border-slate-800 rounded p-2.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Layers className="h-3 w-3 text-blue-400" />
                    <span>3. Single Critical Package Upgrade</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedGuide.singlePackageCmd, 'singlePackageCmd')}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Copy command"
                  >
                    {copiedKey === 'singlePackageCmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-xs text-blue-300 overflow-x-auto whitespace-pre-wrap border border-slate-800/80 font-mono">
                  {selectedGuide.singlePackageCmd}
                </pre>
              </div>

              {/* Version Lock / Pinning */}
              <div className="bg-slate-950 border border-slate-800 rounded p-2.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <RotateCcw className="h-3 w-3 text-purple-400" />
                    <span>4. Version Pinning & Package Hold</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedGuide.holdPackageCmd, 'holdPackageCmd')}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Copy command"
                  >
                    {copiedKey === 'holdPackageCmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-xs text-purple-300 overflow-x-auto whitespace-pre-wrap border border-slate-800/80 font-mono">
                  {selectedGuide.holdPackageCmd}
                </pre>
              </div>

              {/* Transaction History & Rollback */}
              <div className="bg-slate-950 border border-slate-800 rounded p-2.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 flex items-center space-x-1.5">
                    <RotateCcw className="h-3 w-3 text-rose-400" />
                    <span>5. History & Emergency Rollback</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedGuide.historyAndRollbackCmd, 'historyAndRollbackCmd')}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Copy command"
                  >
                    {copiedKey === 'historyAndRollbackCmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-xs text-rose-300 overflow-x-auto whitespace-pre-wrap border border-slate-800/80 font-mono">
                  {selectedGuide.historyAndRollbackCmd}
                </pre>
              </div>

              {/* Reboot Required Detection */}
              <div className="bg-slate-950 border border-slate-800 rounded p-2.5 space-y-1.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Clock className="h-3 w-3 text-teal-400" />
                    <span>6. Reboot Required & Needrestart Check</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedGuide.rebootCheckCmd, 'rebootCheckCmd')}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                    title="Copy command"
                  >
                    {copiedKey === 'rebootCheckCmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <pre className="bg-slate-900 p-2 rounded text-xs text-teal-300 overflow-x-auto whitespace-pre-wrap border border-slate-800/80 font-mono">
                  {selectedGuide.rebootCheckCmd}
                </pre>
              </div>
            </div>

            {/* Pro Tips & Caveats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              <div className="bg-slate-950/80 p-3 rounded border border-indigo-900/40">
                <h4 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Pro Tips ({selectedGuide.osName.split(' ')[0]})</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 font-sans">
                  {selectedGuide.proTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-indigo-400 font-mono font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/80 p-3 rounded border border-amber-900/40">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span>Dangerous Pitfalls to Avoid</span>
                </h4>
                <ul className="space-y-1 text-xs text-slate-300 font-sans">
                  {selectedGuide.caveats.map((cav, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-amber-400 font-mono font-bold">•</span>
                      <span>{cav}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: 5-STAGE LIFECYCLE ROADMAP */}
        {activeSection === 'lifecycle' && (
          <div className="mt-3 space-y-3">
            {/* Stepper Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 font-mono">
              {PATCH_LIFECYCLE_STAGES.map((stage) => (
                <button
                  key={stage.stageNumber}
                  onClick={() => setSelectedStageNumber(stage.stageNumber)}
                  className={`p-2 rounded text-left border transition-colors ${
                    selectedStageNumber === stage.stageNumber
                      ? 'bg-slate-900 border-indigo-500 shadow-xs'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-indigo-400">
                    <span>STAGE {stage.stageNumber}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 truncate">
                    {stage.title}
                  </div>
                </button>
              ))}
            </div>

            {/* Stage Detail Card */}
            <div className="bg-slate-950 border border-slate-800 rounded p-3.5 space-y-3">
              <div className="border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
                    STAGE {selectedStage.stageNumber} / 5
                  </span>
                  <h2 className="text-sm sm:text-base font-bold text-white font-mono">{selectedStage.title}</h2>
                </div>
                <p className="text-xs text-indigo-300/90 font-mono mt-0.5">
                  {selectedStage.tagline}
                </p>
                <p className="text-xs text-slate-300 mt-1 font-sans">
                  {selectedStage.description}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Key Actions */}
                <div className="space-y-2">
                  <h3 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Core Operational Tasks
                  </h3>
                  <div className="space-y-1.5">
                    {selectedStage.keyActions.map((action, idx) => (
                      <div key={idx} className="p-2 rounded bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200 flex items-start space-x-2">
                        <span className="h-4 w-4 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-sans leading-tight">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Commands & Risk Mitigations */}
                <div className="space-y-2.5">
                  <div>
                    <h3 className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <Terminal className="h-3 w-3 text-emerald-400" />
                      <span>Stage Verification Commands</span>
                    </h3>
                    <div className="space-y-1.5 font-mono">
                      {selectedStage.verificationCommands.map((cmd, idx) => (
                        <div key={idx} className="relative group">
                          <pre className="bg-slate-900 p-2 rounded text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap border border-slate-800">
                            {cmd}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(cmd, `stageCmd_${idx}`)}
                            className="absolute top-1.5 right-1.5 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Copy command"
                          >
                            {copiedKey === `stageCmd_${idx}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-amber-950/20 border border-amber-900/40">
                    <h4 className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3 text-amber-400" />
                      <span>Risk Controls & Safeguards</span>
                    </h4>
                    <ul className="space-y-0.5 text-xs text-slate-300 font-sans">
                      {selectedStage.riskMitigations.map((risk, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-amber-400 font-mono font-bold">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: MAINTENANCE DOWNTIME CALCULATOR */}
        {activeSection === 'calculator' && (
          <div className="mt-3 space-y-3 font-mono">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Input Parameters */}
              <div className="bg-slate-950 border border-slate-800 rounded p-3 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Calculator className="h-3.5 w-3.5 text-indigo-400" />
                  <span>WINDOW PARAMETERS</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-0.5 text-[11px]">
                      Cluster Node Count ({calcNodes})
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={calcNodes}
                      onChange={(e) => setCalcNodes(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-0.5 text-[11px]">
                      Traffic Drain Time (Min/Node)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={calcDrainMinutes}
                      onChange={(e) => setCalcDrainMinutes(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-0.5 text-[11px]">
                      Reboot Warmup (Min/Node)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={calcRebootMinutes}
                      onChange={(e) => setCalcRebootMinutes(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-0.5 text-[11px]">
                      Canary Ring 1 Soak (Hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={calcCanaryHours}
                      onChange={(e) => setCalcCanaryHours(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-0.5 text-[11px]">
                      Architecture
                    </label>
                    <select
                      value={calcQuorumType}
                      onChange={(e) => setCalcQuorumType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white text-xs"
                    >
                      <option value="odd-cluster">Odd Quorum Cluster (Raft/Etcd/PG)</option>
                      <option value="active-passive">Active-Passive Primary/Standby</option>
                      <option value="stateless">Stateless NGINX/LB Pool</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Output Results & Timeline */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded p-3 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="text-xs font-bold text-white">MAINTENANCE SCHEDULE & SLA IMPACT</h3>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                    Est. Duration: {formattedRollingHours} Hours
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Single Node Outage</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      ~{totalDowntimePerNode} Mins
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">User-Facing Downtime</span>
                    <span className="text-base font-bold text-indigo-400 font-mono">
                      0s (Rolling)
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Quorum Health</span>
                    <span className="text-base font-bold text-emerald-400">
                      ≥ {(calcNodes > 1 ? Math.floor(calcNodes / 2) + 1 : 1)} Nodes
                    </span>
                  </div>
                </div>

                {/* Staged Rollout Timeline Visualizer */}
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Waves (Rings)
                  </h4>
                  <div className="space-y-1.5">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        <span className="font-semibold text-white">Wave 1: Pilot Canary (1 Node)</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">Drain → Patch → Reboot → {calcCanaryHours}h Soak</span>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                        <span className="font-semibold text-white">Wave 2: Secondary Replicas ({Math.max(1, Math.floor((calcNodes - 1) / 2))} Nodes)</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">Sequential Rolling Drain</span>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span className="font-semibold text-white">Wave 3: Master / Leader</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">Failover traffic → Patch old leader</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
