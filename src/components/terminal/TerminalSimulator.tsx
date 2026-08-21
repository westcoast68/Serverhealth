import React, { useState, useRef, useEffect } from 'react';
import { LAB_SCENARIOS } from '../../data/labScenarios';
import { LabScenario } from '../../types';
import { 
  Terminal as TerminalIcon, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Info,
  ChevronRight,
  Maximize2,
  Minimize2,
  Trash2
} from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'success';
  content: string;
}

interface TerminalSimulatorProps {
  initialLabId?: string | null;
  onClearInitialLab?: () => void;
}

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  initialLabId,
  onClearInitialLab
}) => {
  const [activeLabId, setActiveLabId] = useState<string | null>(initialLabId || 'lab-patch-nginx-zerodowntime');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [labCompleted, setLabCompleted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [inputVal, setInputVal] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Virtual Server State
  const [virtualServices, setVirtualServices] = useState<Record<string, 'active' | 'inactive' | 'failed'>>({
    nginx: 'active',
    ssh: 'active',
    postgresql: 'inactive'
  });
  const [heldPackages, setHeldPackages] = useState<string[]>([]);
  const [dpkgLocked, setDpkgLocked] = useState<boolean>(true);

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: '1',
      type: 'system',
      content: '╔═════════════════════════════════════════════════════════════════════════════╗\n║  SYSADMIN ENTERPRISE TERMINAL LAB SIMULATOR v2.4 (Ubuntu 24.04 LTS / x86_64)║\n║  Type "help" for a list of simulated commands.                              ║\n╚═════════════════════════════════════════════════════════════════════════════╝'
    }
  ]);

  const activeLab = LAB_SCENARIOS.find(l => l.id === activeLabId) || null;
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialLabId) {
      setActiveLabId(initialLabId);
      setCurrentStepIndex(0);
      setLabCompleted(false);
      setShowHint(false);
      if (onClearInitialLab) onClearInitialLab();
    }
  }, [initialLabId]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleSelectLab = (lab: LabScenario) => {
    setActiveLabId(lab.id);
    setCurrentStepIndex(0);
    setLabCompleted(false);
    setShowHint(false);
    setVirtualServices({ ...lab.initialServices });
    setDpkgLocked(lab.id === 'lab-broken-dpkg-lock');

    setLines([
      {
        id: Date.now().toString(),
        type: 'system',
        content: `[LAB LOADED] >>> ${lab.title} <<<\nObjective: ${lab.targetObjective}\nType commands in the prompt below or type "help".`
      }
    ]);
  };

  const handleResetLab = () => {
    if (!activeLab) return;
    handleSelectLab(activeLab);
  };

  const processCommand = (cmdStr: string) => {
    const rawCmd = cmdStr.trim();
    if (!rawCmd) return;

    // Add to input history
    setCommandHistory(prev => [rawCmd, ...prev]);
    setHistoryIndex(-1);

    // Append user input line
    const userLineId = Date.now().toString();
    const newLines: TerminalLine[] = [
      ...lines,
      { id: userLineId, type: 'input', content: `admin@prod-srv-01:~$ ${rawCmd}` }
    ];

    const lower = rawCmd.toLowerCase();

    // Check Lab Verification if a lab is active and not completed
    if (activeLab && !labCompleted) {
      const step = activeLab.steps[currentStepIndex];
      const regex = typeof step.expectedCommandRegex === 'string' 
        ? new RegExp(step.expectedCommandRegex, 'i') 
        : step.expectedCommandRegex;

      if (regex.test(rawCmd)) {
        // Step verified!
        const nextStepIndex = currentStepIndex + 1;
        if (nextStepIndex >= activeLab.steps.length) {
          setLabCompleted(true);
          newLines.push({
            id: `${userLineId}_success`,
            type: 'success',
            content: `[STEP ${currentStepIndex + 1} COMPLETED]: ${step.explanation}\n\n🏆 CONGRATULATIONS! LAB FINISHED: ${activeLab.congratulationMessage}`
          });
        } else {
          setCurrentStepIndex(nextStepIndex);
          setShowHint(false);
          newLines.push({
            id: `${userLineId}_step_ok`,
            type: 'success',
            content: `[STEP ${currentStepIndex + 1} COMPLETED]: ${step.explanation}\n→ NEXT: ${activeLab.steps[nextStepIndex].instruction}`
          });
        }
      }
    }

    // Execute standard command simulation
    let outputText = '';
    let outputType: 'output' | 'error' | 'success' = 'output';

    if (lower === 'clear') {
      setLines([]);
      return;
    } else if (lower === 'help') {
      outputText = `Simulated SysAdmin Command Interpreter:
  • apt [update|upgrade|install|list|autoremove]
  • apt-mark [hold|unhold|showhold]
  • dpkg [--configure -a]
  • systemctl [status|start|stop|restart|reload|enable|--failed] <service>
  • journalctl [-b -p err | -u <service>]
  • ss [-tulpn | -s], netstat
  • df [-h], free [-m], uptime, uname [-r|-a], top, ps [aux]
  • fuser, lsof, kill [-9 <pid>]
  • nginx -t, psql [-c <query>], curl, whoami, id, cat /etc/os-release`;
    } else if (lower === 'whoami') {
      outputText = 'admin (uid=1000 gid=1000 groups=1000(admin),27(sudo),999(docker))';
    } else if (lower === 'uptime') {
      outputText = ' 22:45:00 up 142 days, 6:12,  2 users,  load average: 0.14, 0.08, 0.05';
    } else if (lower.startsWith('uname')) {
      outputText = 'Linux prod-srv-01 5.15.0-105-generic #115-Ubuntu SMP Mon Apr 15 17:33:04 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux';
    } else if (lower === 'cat /etc/os-release') {
      outputText = `NAME="Ubuntu"
VERSION="22.04.4 LTS (Jammy Jellyfish)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 22.04.4 LTS"
VERSION_ID="22.04"
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"`;
    } else if (lower.includes('df -h')) {
      outputText = `Filesystem      Size  Used Avail Use% Mounted on
udev            7.8G     0  7.8G   0% /dev
tmpfs           1.6G  1.8M  1.6G   1% /run
/dev/sda1        98G   24G   70G  26% /
/dev/sda15      105M  6.1M   99M   6% /boot/efi
/dev/sdb1       492G  140G  327G  30% /var/lib/data`;
    } else if (lower.includes('free')) {
      outputText = `               total        used        free      shared  buff/cache   available
Mem:           15984        4120        7240         128        4624       11420
Swap:           4096           0        4096`;
    } else if (lower.startsWith('apt update') || lower.startsWith('sudo apt update')) {
      if (dpkgLocked && activeLabId === 'lab-broken-dpkg-lock') {
        outputType = 'error';
        outputText = `E: Could not get lock /var/lib/dpkg/lock-frontend. It is held by process 3148 (apt)
E: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), is another process using it?`;
      } else {
        outputText = `Hit:1 http://us-east-1.ec2.archive.ubuntu.com/ubuntu jammy InRelease
Get:2 http://security.ubuntu.com/ubuntu jammy-security InRelease [110 kB]
Get:3 http://security.ubuntu.com/ubuntu jammy-security/main amd64 Packages [1,420 kB]
Fetched 1,530 kB in 1s (1,240 kB/s)
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
14 packages can be upgraded. Run 'apt list --upgradable' to see them.`;
      }
    } else if (lower.includes('apt list --upgradable')) {
      outputText = `Listing... Done
nginx/jammy-updates,jammy-security 1.18.0-6ubuntu14.5 amd64 [upgradable from: 1.18.0-6ubuntu14.4]
openssh-server/jammy-updates,jammy-security 1:8.9p1-3ubuntu0.10 amd64 [upgradable from: 1:8.9p1-3ubuntu0.7]
linux-image-generic/jammy-updates 5.15.0.107.104 amd64 [upgradable from: 5.15.0.105.102]`;
    } else if (lower.includes('apt install') || lower.includes('apt-get install')) {
      if (dpkgLocked && activeLabId === 'lab-broken-dpkg-lock') {
        outputType = 'error';
        outputText = `E: Could not get lock /var/lib/dpkg/lock-frontend. It is held by process 3148 (apt)`;
      } else {
        if (lower.includes('nginx')) {
          outputText = `Reading package lists... Done
Building dependency tree... Done
Calculating upgrade... Done
The following packages will be upgraded:
  nginx nginx-common nginx-core
1 upgraded, 0 newly installed, 0 to remove.
Setting up nginx-core (1.18.0-6ubuntu14.5) ...
Setting up nginx (1.18.0-6ubuntu14.5) ...
Processing triggers for man-db (2.10.2-1) ...`;
        } else if (lower.includes('postgresql')) {
          setVirtualServices(prev => ({ ...prev, postgresql: 'active' }));
          outputText = `Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  postgresql-16 postgresql-client-16 postgresql-contrib-16
0 upgraded, 3 newly installed, 0 to remove.
Setting up postgresql-16 (16.4-1.pgdg22.04+1) ...
Creating new PostgreSQL cluster 16/main ...
Verifying cluster socket: /var/run/postgresql/.s.PGSQL.5432`;
        } else if (lower.includes('-f')) {
          outputText = `Reading package lists... Done
Building dependency tree... Done
Correcting dependencies... Done
0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.`;
        } else {
          outputText = `Reading package lists... Done
Building dependency tree... Done
Package installation complete.`;
        }
      }
    } else if (lower.includes('nginx -t')) {
      outputText = `nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful`;
    } else if (lower.startsWith('systemctl') || lower.startsWith('sudo systemctl')) {
      if (lower.includes('reload nginx')) {
        outputText = `[OK] Reloaded NGINX HTTP and reverse proxy server.`;
      } else if (lower.includes('status nginx')) {
        outputText = `● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2026-08-20 22:40:11 UTC; 5min ago
    Process: 4120 ExecReload=/usr/sbin/nginx -g daemon on; master_process on; -s reload (code=exited, status=0/SUCCESS)
   Main PID: 1204 (nginx)
      Tasks: 3 (limit: 18984)
     Memory: 28.4M
        CPU: 142ms
     CGroup: /system.slice/nginx.service
             ├─1204 "nginx: master process /usr/sbin/nginx -g daemon on; master_process on;"
             ├─4121 "nginx: worker process"
             └─4122 "nginx: worker process"`;
      } else if (lower.includes('status postgresql') || lower.includes('enable --now postgresql') || lower.includes('start postgresql')) {
        setVirtualServices(prev => ({ ...prev, postgresql: 'active' }));
        outputText = `● postgresql.service - PostgreSQL RDBMS
     Loaded: loaded (/lib/systemd/system/postgresql.service; enabled; vendor preset: enabled)
     Active: active (running) since Thu 2026-08-20 22:42:00 UTC
   Main PID: 5410 (postgres)
      Tasks: 8 (limit: 18984)
     Memory: 45.2M
     CGroup: /system.slice/postgresql.service
             ├─5410 /usr/lib/postgresql/16/bin/postgres -D /var/lib/postgresql/16/main
             ├─5412 "postgres: checkpointer"
             ├─5413 "postgres: background writer"
             └─5414 "postgres: walwriter"`;
      } else if (lower.includes('--failed')) {
        outputText = `0 loaded units listed. Pass --all to see loaded but inactive units, too.
UNIT LOAD ACTIVE SUB DESCRIPTION
0 loaded units listed.`;
      } else {
        outputText = `Operation completed successfully.`;
      }
    } else if (lower.includes('ss -tulpn') || lower.includes('netstat')) {
      outputText = `Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process
tcp    LISTEN  0       511            0.0.0.0:80          0.0.0.0:*      users:(("nginx",pid=1204,fd=6))
tcp    LISTEN  0       128            0.0.0.0:22          0.0.0.0:*      users:(("sshd",pid=844,fd=3))
tcp    LISTEN  0       244          127.0.0.1:5432        0.0.0.0:*      users:(("postgres",pid=5410,fd=7))
tcp    LISTEN  0       511            0.0.0.0:443         0.0.0.0:*      users:(("nginx",pid=1204,fd=7))`;
    } else if (lower.includes('fuser') || lower.includes('lsof') || (lower.includes('ps') && lower.includes('dpkg'))) {
      outputText = `/var/lib/dpkg/lock-frontend: 3148 (admin)  /usr/bin/dpkg --status-fd 21`;
    } else if (lower.includes('kill') && lower.includes('3148')) {
      setDpkgLocked(false);
      outputText = `[1]+  Killed                  /usr/bin/dpkg --status-fd 21`;
    } else if (lower.includes('rm') && lower.includes('lock')) {
      setDpkgLocked(false);
      outputText = `removed '/var/lib/dpkg/lock-frontend'`;
    } else if (lower.includes('dpkg --configure -a')) {
      outputText = `Setting up libssl3:amd64 (3.0.2-0ubuntu1.15) ...
Setting up openssh-client (1:8.9p1-3ubuntu0.10) ...
Processing triggers for libc-bin (2.35-0ubuntu3.8) ...`;
    } else if (lower.includes('apt-mark hold')) {
      setHeldPackages(['linux-image-generic', 'linux-headers-generic']);
      outputText = `linux-image-generic set on hold.
linux-headers-generic set on hold.`;
    } else if (lower.includes('apt-mark showhold')) {
      outputText = heldPackages.length > 0 ? heldPackages.join('\n') : 'linux-image-generic\nlinux-headers-generic';
    } else if (lower.includes('psql') && (lower.includes('select version') || lower.includes('--version'))) {
      outputText = `PostgreSQL 16.4 (Ubuntu 16.4-1.pgdg22.04+1) on x86_64-pc-linux-gnu, compiled by gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0, 64-bit`;
    } else {
      outputText = `bash: ${rawCmd.split(' ')[0]}: command executed (simulated sandbox). Type "help" for verified commands.`;
    }

    if (outputText) {
      newLines.push({
        id: `${userLineId}_out`,
        type: outputType,
        content: outputText
      });
    }

    setLines(newLines);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandHistory.length) {
          setHistoryIndex(nextIndex);
          setInputVal(commandHistory[nextIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div className={`space-y-3 ${isFullscreen ? 'fixed inset-0 z-50 p-3 bg-slate-950/95 overflow-y-auto' : ''}`}>
      {/* Lab Header & Scenario Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 sm:p-3.5 shadow-sm font-mono">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TerminalIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  LINUX SYSADMIN VIRTUAL LAB
                </h1>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SANDBOX
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-tight mt-0.5">
                Safe sandbox to practice live zero-downtime upgrades, package holds, broken lock repairs, and systemd sandboxing.
              </p>
            </div>
          </div>

          {/* Action controls */}
          <div className="flex items-center space-x-1.5 text-xs">
            <button
              onClick={handleResetLab}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              title="Reset current lab state"
            >
              <RotateCcw className="h-3 w-3" />
              <span>RESET</span>
            </button>

            <button
              onClick={() => setLines([])}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
              title="Clear terminal text"
            >
              <Trash2 className="h-3 w-3" />
              <span>CLEAR</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Terminal'}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Lab Scenario Picker */}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {LAB_SCENARIOS.map((lab) => (
            <button
              key={lab.id}
              onClick={() => handleSelectLab(lab)}
              className={`px-2.5 py-1.5 rounded text-xs transition-colors text-left border ${
                activeLabId === lab.id
                  ? 'bg-slate-950 border-indigo-500 text-white shadow-xs'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-slate-200">{lab.title}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${
                  lab.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-300' :
                  lab.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'
                }`}>
                  {lab.difficulty}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 font-sans">{lab.targetObjective}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Lab Objective & Current Step Banner */}
      {activeLab && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 shadow-xs space-y-2 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  MISSION: {activeLab.title}
                </span>
                <span className="text-[11px] text-slate-400">({activeLab.timeEstimate})</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-sans">{activeLab.scenarioBriefing}</p>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                STEP {Math.min(currentStepIndex + 1, activeLab.steps.length)} / {activeLab.steps.length}
              </span>
            </div>
          </div>

          {/* Current Step Instruction */}
          {!labCompleted ? (
            <div className="p-2.5 rounded bg-indigo-950/20 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center space-x-1">
                  <Play className="h-3 w-3 text-indigo-400 fill-indigo-400" />
                  <span>Current Task:</span>
                </span>
                <p className="text-xs text-indigo-200 font-medium font-sans">
                  {activeLab.steps[currentStepIndex]?.instruction}
                </p>
                {showHint && (
                  <p className="text-xs text-amber-300 font-mono pt-0.5">
                    💡 Hint: {activeLab.steps[currentStepIndex]?.hint}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-amber-300 text-xs border border-slate-800 transition-colors cursor-pointer"
                >
                  {showHint ? 'HIDE HINT' : 'SHOW HINT'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-white block">CHALLENGE COMPLETED SUCCESSFULLY</span>
                  <span className="text-xs text-emerald-300 font-sans">{activeLab.congratulationMessage}</span>
                </div>
              </div>
              <button
                onClick={handleResetLab}
                className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                REPLAY
              </button>
            </div>
          )}
        </div>
      )}

      {/* Terminal Display Window */}
      <div 
        onClick={focusInput}
        className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs shadow-md min-h-[380px] max-h-[560px] overflow-y-auto flex flex-col justify-between cursor-text"
      >
        {/* Terminal Text Lines */}
        <div className="space-y-1">
          {lines.map((line) => {
            if (line.type === 'input') {
              return (
                <div key={line.id} className="text-slate-100 font-bold">
                  {line.content}
                </div>
              );
            } else if (line.type === 'error') {
              return (
                <div key={line.id} className="text-rose-400 whitespace-pre-wrap">
                  {line.content}
                </div>
              );
            } else if (line.type === 'success') {
              return (
                <div key={line.id} className="text-emerald-400 font-semibold whitespace-pre-wrap bg-emerald-950/20 p-2 rounded border border-emerald-800/40 my-1">
                  {line.content}
                </div>
              );
            } else if (line.type === 'system') {
              return (
                <div key={line.id} className="text-indigo-400 whitespace-pre-wrap">
                  {line.content}
                </div>
              );
            } else {
              return (
                <div key={line.id} className="text-slate-300 whitespace-pre-wrap">
                  {line.content}
                </div>
              );
            }
          })}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Input Prompt */}
        <div className="flex items-center space-x-1.5 pt-2 border-t border-slate-800/80 mt-3">
          <span className="text-emerald-400 font-bold select-none shrink-0">
            admin@prod-srv-01:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-slate-100 focus:outline-none font-mono text-xs placeholder-slate-600"
            placeholder="Type a command (e.g. apt update, systemctl status nginx, nginx -t)..."
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};
