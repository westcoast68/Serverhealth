import React, { useState } from 'react';
import { 
  ENTERPRISE_APPLICATIONS, 
  INSTALL_METHODS_COMPARISON 
} from '../../data/installData';
import { ApplicationDefinition, AppCategory } from '../../types';
import { 
  Download, 
  Search, 
  Copy, 
  Check, 
  ShieldCheck, 
  Terminal, 
  Server, 
  ExternalLink, 
  Sliders, 
  Layers, 
  Cpu, 
  FileCode2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface AppInstallHubProps {
  onLaunchLab: (labId?: string) => void;
  onAskCopilotAboutApp: (appName: string) => void;
}

export const AppInstallHub: React.FC<AppInstallHubProps> = ({
  onLaunchLab,
  onAskCopilotAboutApp
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>('nginx');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'install-script' | 'systemd' | 'docker' | 'ansible' | 'methods'>('install-script');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Systemd Hardening Builder toggles
  const [sandboxProtectSystem, setSandboxProtectSystem] = useState<boolean>(true);
  const [sandboxNoNewPrivileges, setSandboxNoNewPrivileges] = useState<boolean>(true);
  const [sandboxPrivateTmp, setSandboxPrivateTmp] = useState<boolean>(true);
  const [sandboxProtectHome, setSandboxProtectHome] = useState<boolean>(true);
  const [sandboxLimitNofile, setSandboxLimitNofile] = useState<number>(65536);

  const filteredApps = ENTERPRISE_APPLICATIONS.filter(app => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedApp = ENTERPRISE_APPLICATIONS.find(a => a.id === selectedAppId) || ENTERPRISE_APPLICATIONS[0];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generate dynamic systemd unit with hardening flags
  const generateHardenedSystemd = (app: ApplicationDefinition) => {
    const serviceUser = app.id === 'nginx' ? 'www-data' : app.id === 'postgres' ? 'postgres' : app.id === 'redis' ? 'redis' : 'app_service';
    return `[Unit]
Description=${app.name} Daemon
After=network-online.target syslog.target
Wants=network-online.target

[Service]
Type=simple
User=${serviceUser}
Group=${serviceUser}
ExecStart=/usr/local/bin/${app.id} --config /etc/${app.id}/${app.id}.conf
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5s

# Systemd Security Sandboxing Directives
${sandboxProtectSystem ? 'ProtectSystem=strict' : '# ProtectSystem=off'}
${sandboxNoNewPrivileges ? 'NoNewPrivileges=true' : '# NoNewPrivileges=false'}
${sandboxPrivateTmp ? 'PrivateTmp=true' : '# PrivateTmp=false'}
${sandboxProtectHome ? 'ProtectHome=true' : '# ProtectHome=false'}
ProtectKernelTunables=true
ProtectControlGroups=true
RestrictRealtime=true
LimitNOFILE=${sandboxLimitNofile}

[Install]
WantedBy=multi-user.target`;
  };

  return (
    <div className="space-y-3">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Download className="h-4 w-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                APPLICATION INSTALLATION & SYSTEMD HARDENING
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl font-sans leading-tight">
              Hardened multi-distribution installation scripts, production systemd sandboxing generators, Docker Compose recipes, and automation playbooks.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab(activeTab === 'methods' ? 'install-script' : 'methods')}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                activeTab === 'methods'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {activeTab === 'methods' ? '← APP CATALOG' : 'PARADIGMS COMPARED'}
            </button>
          </div>
        </div>

        {/* Section: METHODS COMPARISON */}
        {activeTab === 'methods' ? (
          <div className="mt-3 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Enterprise Installation Paradigms: Tradeoffs & Best Practices
              </h2>
              <button
                onClick={() => setActiveTab('install-script')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                ← Return to App Catalog
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {INSTALL_METHODS_COMPARISON.map((method, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded p-3 space-y-2">
                  <h3 className="text-xs font-bold text-indigo-300">{method.method}</h3>
                  <p className="text-xs text-slate-300 font-sans">{method.description}</p>

                  <div className="space-y-0.5 text-xs">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Advantages:</span>
                    {method.pros.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-start space-x-1.5 text-slate-300 font-sans">
                        <span className="text-emerald-400 font-mono font-bold">+</span>
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-0.5 text-xs pt-0.5">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Caveats:</span>
                    {method.cons.map((c, cIdx) => (
                      <div key={cIdx} className="flex items-start space-x-1.5 text-slate-400 font-sans">
                        <span className="text-amber-400 font-mono font-bold">-</span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">Best for: </span>
                    <span className="text-slate-200 font-medium">{method.bestFor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Application Catalog & Builder */
          <div className="mt-3 space-y-3">
            {/* Search & Category Pills */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter applications (Nginx, Postgres...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex flex-wrap gap-1 w-full sm:w-auto font-mono text-xs">
                {(['all', 'web-servers', 'databases', 'containers', 'monitoring', 'security'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase transition-colors ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Main 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* App List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <span>SERVICES ({filteredApps.length})</span>
                  <span>SELECT TO CONFIGURE</span>
                </div>
                <div className="space-y-1.5">
                  {filteredApps.map((app) => {
                    const isSelected = selectedAppId === app.id;
                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppId(app.id)}
                        className={`p-2.5 rounded border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-slate-900 border-indigo-500 shadow-xs'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-xs font-bold text-white">{app.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800">
                            {app.defaultPort}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 font-sans">
                          {app.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected App Inspector & Generator */}
              <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded p-3.5 space-y-3">
                {/* Header of Inspector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-2 font-mono">
                      <h2 className="text-sm sm:text-base font-bold text-white">{selectedApp.name}</h2>
                      <a
                        href={selectedApp.officialSite}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-indigo-400"
                        title="Official Documentation"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="text-[10px] text-indigo-400 font-mono">PORT: {selectedApp.defaultPort}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 font-mono">
                    <button
                      onClick={() => onAskCopilotAboutApp(selectedApp.name)}
                      className="flex items-center space-x-1 px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs border border-indigo-500/30 transition-colors cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-amber-300" />
                      <span>AI ASSIST</span>
                    </button>

                    <button
                      onClick={() => onLaunchLab('lab-install-postgres')}
                      className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Terminal className="h-3 w-3 text-emerald-400" />
                      <span>LAB</span>
                    </button>
                  </div>
                </div>

                {/* Sub-tabs: Bash script / systemd / docker / ansible */}
                <div className="flex flex-wrap gap-1 p-0.5 bg-slate-900 rounded border border-slate-800 font-mono text-xs">
                  <button
                    onClick={() => setActiveTab('install-script')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeTab === 'install-script'
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OS SCRIPTS
                  </button>
                  <button
                    onClick={() => setActiveTab('systemd')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeTab === 'systemd'
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SYSTEMD HARDENING
                  </button>
                  <button
                    onClick={() => setActiveTab('docker')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeTab === 'docker'
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    DOCKER COMPOSE
                  </button>
                  <button
                    onClick={() => setActiveTab('ansible')}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeTab === 'ansible'
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ANSIBLE PLAYBOOK
                  </button>
                </div>

                {/* Content View: Install Scripts */}
                {activeTab === 'install-script' && (
                  <div className="space-y-2.5">
                    {selectedApp.supportedDistros.map((distro, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 rounded p-2.5 space-y-2 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                            <Server className="h-3 w-3" />
                            <span>{distro.osName}</span>
                          </span>
                          <button
                            onClick={() => copyToClipboard(distro.installBash, `distro_${idx}`)}
                            className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono border border-slate-700 transition-colors"
                          >
                            {copiedKey === `distro_${idx}` ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                            <span>COPY</span>
                          </button>
                        </div>
                        <pre className="bg-slate-950 p-2 rounded text-xs text-emerald-400 overflow-x-auto whitespace-pre-wrap border border-slate-800/80">
                          {distro.installBash}
                        </pre>
                        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-0.5 gap-1">
                          <span>Config: <code className="text-slate-300">{distro.configFile}</code></span>
                          <span>Verify: <code className="text-emerald-300">{distro.verifyCommand}</code></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Content View: Systemd Hardening Builder */}
                {activeTab === 'systemd' && (
                  <div className="space-y-2.5 font-mono">
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <Sliders className="h-3 w-3 text-indigo-400" />
                          <span>Systemd Security Sandboxing Directives</span>
                        </span>
                        <span className="text-[10px] text-emerald-400">systemd-analyze security</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sandboxProtectSystem}
                            onChange={(e) => setSandboxProtectSystem(e.target.checked)}
                            className="accent-indigo-500 rounded"
                          />
                          <span className="text-[11px]">ProtectSystem=strict (Read-only /usr,/etc)</span>
                        </label>

                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sandboxNoNewPrivileges}
                            onChange={(e) => setSandboxNoNewPrivileges(e.target.checked)}
                            className="accent-indigo-500 rounded"
                          />
                          <span className="text-[11px]">NoNewPrivileges=true (Block setuid)</span>
                        </label>

                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sandboxPrivateTmp}
                            onChange={(e) => setSandboxPrivateTmp(e.target.checked)}
                            className="accent-indigo-500 rounded"
                          />
                          <span className="text-[11px]">PrivateTmp=true (Isolated /tmp)</span>
                        </label>

                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sandboxProtectHome}
                            onChange={(e) => setSandboxProtectHome(e.target.checked)}
                            className="accent-indigo-500 rounded"
                          />
                          <span className="text-[11px]">ProtectHome=true (Hide /home,/root)</span>
                        </label>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-slate-400">UNIT: /etc/systemd/system/{selectedApp.id}.service</span>
                        <button
                          onClick={() => copyToClipboard(generateHardenedSystemd(selectedApp), 'systemdUnit')}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] border border-slate-700 transition-colors"
                        >
                          {copiedKey === 'systemdUnit' ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                          <span>COPY UNIT</span>
                        </button>
                      </div>
                      <pre className="bg-slate-900 p-2.5 rounded font-mono text-xs text-blue-300 overflow-x-auto whitespace-pre-wrap border border-slate-800">
                        {generateHardenedSystemd(selectedApp)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Content View: Docker Compose */}
                {activeTab === 'docker' && (
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">docker-compose.yml</span>
                      <button
                        onClick={() => copyToClipboard(selectedApp.dockerComposeExample, 'dockerCompose')}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] border border-slate-700 transition-colors"
                      >
                        {copiedKey === 'dockerCompose' ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                        <span>COPY COMPOSE</span>
                      </button>
                    </div>
                    <pre className="bg-slate-900 p-2.5 rounded font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre-wrap border border-slate-800">
                      {selectedApp.dockerComposeExample}
                    </pre>
                  </div>
                )}

                {/* Content View: Ansible */}
                {activeTab === 'ansible' && (
                  <div className="space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300">tasks/main.yml</span>
                      <button
                        onClick={() => copyToClipboard(selectedApp.ansibleTaskExample, 'ansibleTask')}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] border border-slate-700 transition-colors"
                      >
                        {copiedKey === 'ansibleTask' ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                        <span>COPY PLAYBOOK</span>
                      </button>
                    </div>
                    <pre className="bg-slate-900 p-2.5 rounded font-mono text-xs text-purple-300 overflow-x-auto whitespace-pre-wrap border border-slate-800">
                      {selectedApp.ansibleTaskExample}
                    </pre>
                  </div>
                )}

                {/* Hardening Best Practices & Troubleshooting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1.5">
                    <h4 className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      <span>Hardening Checklist</span>
                    </h4>
                    <ul className="space-y-1 text-xs text-slate-300 font-sans">
                      {selectedApp.hardeningBestPractices.map((bp, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-emerald-400 font-mono font-bold">•</span>
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1.5">
                    <h4 className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3 text-amber-400" />
                      <span>Common Troubleshooting</span>
                    </h4>
                    <div className="space-y-1.5">
                      {selectedApp.commonTroubleshooting.map((trouble, idx) => (
                        <div key={idx} className="text-xs text-slate-300 border-b border-slate-800/80 pb-1.5 last:border-none last:pb-0">
                          <span className="font-bold text-white block">{trouble.problem}</span>
                          <span className="text-slate-400 text-[11px] block">{trouble.fix}</span>
                        </div>
                      ))}
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
