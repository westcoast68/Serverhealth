import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Terminal, 
  FileText, 
  AlertCircle, 
  Copy, 
  Check, 
  Loader2, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt = ''
}) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [contextType, setContextType] = useState<'general' | 'log-diagnostic' | 'patch-advisory' | 'deploy-script'>('general');
  const [errorLogs, setErrorLogs] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `👋 Hello! I am your **AI SysAdmin Senior Copilot** (Linux & Windows Enterprise Infrastructure).
I can assist you with:
- **Server Patching & Rollbacks** (APT, DNF, Zypper, PSWindowsUpdate, unattended-upgrades)
- **Application Deployment & Hardening** (NGINX, PostgreSQL, Redis, Docker, systemd sandboxing)
- **Log Diagnostic & Troubleshooting** (Paste error logs, kernel panics, or stuck locks)
- **Automation Scripts** (Ansible roles, Bash deployers, PowerShell DSC)

How can I assist your server operations today?`
    }
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() && !errorLogs.trim()) return;

    const userMessageContent = errorLogs
      ? `[Log Analysis Request]\nLogs:\n${errorLogs}\n\nQuestion: ${textToSend || 'Please analyze this error log, determine root cause, and provide exact fix steps.'}`
      : textToSend;

    setMessages(prev => [...prev, { role: 'user', content: userMessageContent }]);
    setIsLoading(true);
    setPrompt('');

    try {
      const res = await fetch('/api/sysadmin/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          contextType,
          errorLogs: errorLogs.trim() || undefined,
          systemState: {
            distro: 'Ubuntu 24.04 / RHEL 9',
            role: 'Enterprise Linux / Web / Database'
          }
        })
      });

      const data = await res.json();
      if (data.error) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `⚠️ **SysAdmin Advisory Error**: ${data.error}` }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.reply }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ **Connection Error**: Failed to reach SysAdmin server. ${err.message}` }
      ]);
    } finally {
      setIsLoading(false);
      setErrorLogs('');
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickPrompts = [
    'How do I safely patch a 3-node PostgreSQL replication cluster with 0 data loss?',
    'Write a hardened systemd unit for a Node.js API with ProtectSystem=strict',
    'How to resolve: "E: Could not get lock /var/lib/dpkg/lock-frontend"',
    'Explain how to configure unattended-upgrades with automatic email alerts',
    'How do I rollback an unbootable Linux kernel after a failed update?'
  ];

  const sampleLogs = [
    {
      label: 'Nginx Port Conflict',
      log: 'nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)\nnginx: [emerg] still could not bind() to 0.0.0.0:80'
    },
    {
      label: 'DPKG Stuck Lock',
      log: 'E: Could not get lock /var/lib/dpkg/lock-frontend. It is held by process 3148 (apt)\nE: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend)'
    },
    {
      label: 'PostgreSQL Permission Denied',
      log: 'FATAL: password authentication failed for user "app_user"\nDETAIL: No pg_hba.conf entry for host "10.0.4.12", user "app_user", database "production_db", no encryption'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl font-mono text-xs">
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2">
            <div className="p-1 rounded bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight">AI SYSADMIN COPILOT</h2>
                <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  GEMINI 2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-tight">Zero-Downtime Patching, Service Deployments & Triage</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 flex items-center space-x-1 text-xs">
          <button
            onClick={() => setContextType('general')}
            className={`px-2 py-0.5 rounded transition-colors ${
              contextType === 'general' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            ASK ADVISOR
          </button>
          <button
            onClick={() => setContextType('log-diagnostic')}
            className={`px-2 py-0.5 rounded transition-colors ${
              contextType === 'log-diagnostic' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            LOG DIAGNOSTIC
          </button>
          <button
            onClick={() => setContextType('deploy-script')}
            className={`px-2 py-0.5 rounded transition-colors ${
              contextType === 'deploy-script' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            SCRIPT GENERATOR
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded border ${
                msg.role === 'user'
                  ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-100 ml-4'
                  : 'bg-slate-900/60 border-slate-800 text-slate-200 mr-2 space-y-1.5'
              }`}
            >
              <div className="flex items-center justify-between mb-1 text-[10px] font-bold text-slate-400">
                <span className="flex items-center space-x-1">
                  {msg.role === 'user' ? (
                    <span className="text-indigo-300 font-mono">SYSADMIN (YOU)</span>
                  ) : (
                    <span className="text-emerald-400 font-mono flex items-center space-x-1">
                      <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                      <span>SENIOR SYSADMIN COPILOT</span>
                    </span>
                  )}
                </span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(msg.content, idx)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white"
                    title="Copy response"
                  >
                    {copiedIndex === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                )}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs">
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-slate-400 flex items-center space-x-2 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              <span>Analyzing infrastructure requirements and generating safe commands...</span>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 space-y-2">
          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Suggested Questions:</span>
              <div className="flex flex-wrap gap-1">
                {quickPrompts.map((qp, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => handleSend(qp)}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 transition-colors text-left truncate max-w-full cursor-pointer font-sans"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Log input if in diagnostic mode */}
          {contextType === 'log-diagnostic' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-slate-300">SERVER ERROR LOG:</span>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-500">Samples:</span>
                  {sampleLogs.map((s, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => setErrorLogs(s.log)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 underline mr-1"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={errorLogs}
                onChange={(e) => setErrorLogs(e.target.value)}
                placeholder="Paste raw journalctl, dmesg, apt, nginx error logs here..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Main Input Text */}
          <div className="flex items-center space-x-1.5">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={
                contextType === 'log-diagnostic'
                  ? 'Ask about the log or press Send...'
                  : 'Ask about patching, installing services, or troubleshooting...'
              }
              className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || (!prompt.trim() && !errorLogs.trim())}
              className={`p-2 rounded text-white transition-colors ${
                isLoading || (!prompt.trim() && !errorLogs.trim())
                  ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-xs cursor-pointer'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
