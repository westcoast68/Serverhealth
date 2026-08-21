import React, { useState, useEffect } from 'react';
import { 
  ADMIN_CHECKLISTS, 
  CHEAT_SHEET_ENTRIES, 
  SYSADMIN_COMMANDMENTS 
} from '../../data/knowledgeData';
import { AdminChecklistItem } from '../../types';
import { 
  BookOpen, 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  Search, 
  FileText, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  AlertCircle, 
  Flame,
  DownloadCloud,
  CheckCircle2
} from 'lucide-react';

export const KnowledgeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checklists' | 'cheatsheet' | 'runbook' | 'commandments'>('checklists');
  const [checklists, setChecklists] = useState<AdminChecklistItem[]>(() => {
    const saved = localStorage.getItem('sysadmin_checklist_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return ADMIN_CHECKLISTS;
      }
    }
    return ADMIN_CHECKLISTS;
  });

  const [selectedChecklistCategory, setSelectedChecklistCategory] = useState<string>('all');
  const [cheatSheetSearch, setCheatSheetSearch] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('sysadmin_checklist_v1', JSON.stringify(checklists));
  }, [checklists]);

  const toggleChecklistItem = (id: string) => {
    setChecklists(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const completedCount = checklists.filter(c => c.completed).length;
  const progressPercent = Math.round((completedCount / checklists.length) * 100);

  const filteredChecklists = checklists.filter(item => {
    if (selectedChecklistCategory === 'all') return true;
    return item.category === selectedChecklistCategory;
  });

  const filteredCheatSheets = CHEAT_SHEET_ENTRIES.filter(entry => {
    const q = cheatSheetSearch.toLowerCase();
    return entry.title.toLowerCase().includes(q) ||
           entry.command.toLowerCase().includes(q) ||
           entry.category.toLowerCase().includes(q) ||
           entry.description.toLowerCase().includes(q);
  });

  const exportReport = () => {
    const lines = [
      '# Enterprise SysAdmin Production Readiness Audit Report',
      `Date Generated: ${new Date().toUTCString()}`,
      `Compliance Score: ${completedCount}/${checklists.length} (${progressPercent}% Complete)\n`,
      '## Checklist Verification Status:'
    ];

    checklists.forEach(item => {
      lines.push(`- [${item.completed ? 'X' : ' '}] **${item.title}** (${item.category}) [${item.impactLevel}]`);
      lines.push(`  Description: ${item.description}`);
      if (item.commandExample) {
        lines.push(`  Audit Command: \`${item.commandExample}\``);
      }
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sysadmin-readiness-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm font-mono">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <BookOpen className="h-4 w-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                SYSADMIN RUNBOOKS, TRIAGE & AUDIT CHECKLISTS
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans leading-tight">
              Production readiness checklists, Brendan Gregg Linux performance triage cheat sheets, zero-day incident runbooks, and golden operational commandments.
            </p>
          </div>

          {/* Sub-nav Buttons */}
          <div className="flex flex-wrap gap-1 p-0.5 bg-slate-950 rounded border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('checklists')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'checklists'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AUDIT CHECKLISTS ({progressPercent}%)
            </button>
            <button
              onClick={() => setActiveTab('cheatsheet')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'cheatsheet'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              PERF TRIAGE
            </button>
            <button
              onClick={() => setActiveTab('runbook')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'runbook'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ZERO-DAY RUNBOOK
            </button>
            <button
              onClick={() => setActiveTab('commandments')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'commandments'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              COMMANDMENTS
            </button>
          </div>
        </div>

        {/* Tab 1: READINESS CHECKLISTS */}
        {activeTab === 'checklists' && (
          <div className="mt-3 space-y-3 font-mono">
            {/* Progress Bar & Export */}
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 flex-1 max-w-xl">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-white">READINESS COMPLIANCE</span>
                  <span className="text-indigo-400">{completedCount} / {checklists.length} Verified ({progressPercent}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={exportReport}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  <DownloadCloud className="h-3 w-3" />
                  <span>EXPORT AUDIT (.MD)</span>
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 text-xs">
              {['all', 'Patching & Maintenance', 'Service Installation & Hardening', 'Monitoring & Logs', 'Disaster Recovery'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedChecklistCategory(cat)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    selectedChecklistCategory === cat
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat === 'all' ? 'ALL CATEGORIES' : cat.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Checklist Items */}
            <div className="space-y-1.5">
              {filteredChecklists.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`p-2.5 rounded border cursor-pointer transition-colors ${
                    item.completed
                      ? 'bg-indigo-950/15 border-indigo-900/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <div className="mt-0.5 text-indigo-400 shrink-0">
                        {item.completed ? (
                          <CheckSquare className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-600" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold font-mono ${item.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                            {item.title}
                          </span>
                          <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                            item.impactLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-300' :
                            item.impactLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {item.impactLevel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans">{item.description}</p>
                        {item.commandExample && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.commandExample!, item.id);
                            }}
                            className="pt-1 font-mono text-[11px] text-indigo-300 flex items-center space-x-1 hover:text-indigo-200"
                          >
                            <Terminal className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
                            <code className="bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">{item.commandExample}</code>
                            {copiedKey === item.id ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5 text-slate-500" />}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0 hidden sm:block">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: TRIAGE CHEAT SHEET */}
        {activeTab === 'cheatsheet' && (
          <div className="mt-3 space-y-3 font-mono">
            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter commands (ss, vmstat, dmesg...)"
                value={cheatSheetSearch}
                onChange={(e) => setCheatSheetSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredCheatSheets.map((entry, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{entry.title}</span>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                      {entry.category}
                    </span>
                  </div>

                  <div className="relative group">
                    <pre className="bg-slate-900 p-2 rounded font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap border border-slate-800">
                      {entry.command}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(entry.command, `cheat_${idx}`)}
                      className="absolute top-1.5 right-1.5 p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedKey === `cheat_${idx}` ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-sans">{entry.description}</p>
                  {entry.flags && (
                    <p className="text-[10px] text-slate-400 font-mono pt-0.5 border-t border-slate-900">
                      Flags: {entry.flags}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: ZERO-DAY INCIDENT RUNBOOK */}
        {activeTab === 'runbook' && (
          <div className="mt-3 space-y-3 font-mono">
            <div className="p-2.5 rounded bg-red-950/20 border border-red-900/40 flex items-center space-x-2.5">
              <Flame className="h-4 w-4 text-red-400 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-white">EMERGENCY ZERO-DAY / CRITICAL CVE RUNBOOK</h3>
                <p className="text-xs text-slate-300 font-sans">
                  Standard operating procedure for remediating actively exploited zero-days (e.g. OpenSSH RegreSSHion, Log4j, Heartbleed).
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Step 0: Containment & Network Segmentation</span>
                <p className="text-xs text-slate-300 font-sans">
                  If the vulnerability is unauthenticated RCE on a public daemon (e.g. OpenSSH or Web server), restrict firewall CIDR access to trusted bastion IPs immediately before patching:
                </p>
                <pre className="bg-slate-900 p-2 rounded font-mono text-xs text-emerald-400 border border-slate-800">
                  sudo ufw delete allow 22/tcp && sudo ufw allow from 198.51.100.0/24 to any port 22 proto tcp
                </pre>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 1: Fleet Inventory Sweep</span>
                <p className="text-xs text-slate-300 font-sans">
                  Execute an automated Ansible query or ssh loop across all inventory hosts to identify vulnerable package versions:
                </p>
                <pre className="bg-slate-900 p-2 rounded font-mono text-xs text-emerald-400 border border-slate-800">
                  ansible all -m shell -a "dpkg -l openssh-server | grep -E '8.9p1'" --become
                </pre>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Step 2: Snapshot & Rapid Single-Package Patching</span>
                <p className="text-xs text-slate-300 font-sans">
                  Trigger storage snapshots on hypervisor / cloud provider, then apply the specific security errata package:
                </p>
                <pre className="bg-slate-900 p-2 rounded font-mono text-xs text-emerald-400 border border-slate-800">
                  sudo apt update && sudo apt install --only-upgrade openssh-server -y
                </pre>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 3: Verification & Connection Testing</span>
                <p className="text-xs text-slate-300 font-sans">
                  Test SSH authentication from an external test terminal WITHOUT terminating your active root SSH session:
                </p>
                <pre className="bg-slate-900 p-2 rounded font-mono text-xs text-emerald-400 border border-slate-800">
                  ssh -v testuser@prod-srv-01 -p 22
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: SYSADMIN COMMANDMENTS */}
        {activeTab === 'commandments' && (
          <div className="mt-3 space-y-2 font-mono">
            {SYSADMIN_COMMANDMENTS.map((item, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded p-3 space-y-1">
                <h3 className="text-xs font-bold text-indigo-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{item.rule}</span>
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
