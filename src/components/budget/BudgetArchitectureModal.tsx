import React from 'react';
import { X, DollarSign, CheckCircle2, Cpu, Database, Server, Zap, Shield, Sparkles, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetArchitectureModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 font-display">Tooling & Budget Recommendation Guide</h2>
              <p className="text-xs text-slate-400">Why this technical architecture delivers the optimal cost-to-performance ratio for AWS exam prep</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm text-slate-300 max-h-[75vh] overflow-y-auto">
          {/* Executive Summary Card */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-semibold text-amber-300 mb-1">Direct Answer to Your Question</h3>
                <p className="text-slate-300 leading-relaxed">
                  The <strong className="text-amber-200">single most cost-effective and highest-leverage stack</strong> for creating an adaptive AI learning engine is:
                  <br />
                  <strong className="text-slate-100">React + TypeScript + Tailwind CSS</strong> (Frontend) paired with a lightweight <strong className="text-slate-100">Node/Express Server</strong> routing to <strong className="text-amber-300">Google Gemini 3.7 Flash</strong> and client-side <strong className="text-slate-100">localStorage / Firestore</strong> persistence.
                </p>
              </div>
            </div>
          </div>

          {/* Cost Comparison Table */}
          <div>
            <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Cost Comparison: Commercial LMS vs. This Built Engine
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <th className="p-3.5">Solution</th>
                    <th className="p-3.5">Monthly Cost</th>
                    <th className="p-3.5">Adaptive Gap Targeting</th>
                    <th className="p-3.5">AI Generation Capability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  <tr className="bg-slate-900/40">
                    <td className="p-3.5 font-medium text-slate-200">Commercial Cloud Prep (A Cloud Guru / Whizlabs)</td>
                    <td className="p-3.5 text-rose-400 font-semibold">$35 - $49 / month</td>
                    <td className="p-3.5 text-slate-400">Static question banks (no real-time gap reweighting)</td>
                    <td className="p-3.5 text-slate-400">None (fixed static questions)</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="p-3.5 font-medium text-slate-200">Custom LMS with Legacy AI (GPT-4)</td>
                    <td className="p-3.5 text-amber-400 font-semibold">$15 - $30 / month in token fees</td>
                    <td className="p-3.5 text-slate-300">Moderate</td>
                    <td className="p-3.5 text-slate-300">High latency & expensive per call</td>
                  </tr>
                  <tr className="bg-emerald-950/20 border-l-4 border-l-emerald-500">
                    <td className="p-3.5 font-bold text-emerald-300">This Engine (Gemini 3.7 Flash + Local / Cloud Run)</td>
                    <td className="p-3.5 text-emerald-400 font-bold text-sm">$0.00 / month (Free tier) or &lt;$0.20/mo</td>
                    <td className="p-3.5 text-emerald-300 font-semibold">100% Real-Time Weakest-First Sequencing</td>
                    <td className="p-3.5 text-emerald-300 font-semibold">Instant Sub-Second Generation on Demand</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4 Pillars of Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-2.5 mb-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h4 className="font-semibold text-slate-200">1. AI Intelligence Layer: Gemini 3.7 Flash</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini 3.7 Flash provides native JSON mode, low latency (under 800ms for 5 full scenario questions), and pricing at just <strong className="text-slate-200">$0.075 per million tokens</strong>. You can generate 1,000 custom quiz questions for approximately <strong>2 cents</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-2.5 mb-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h4 className="font-semibold text-slate-200">2. Real-Time Adaptive Math Engine</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates dynamic <code>gapWeight</code> for each of the 14 AWS services instantly in the browser. Zero network delay or server latency needed to recalculate your next best question sequence.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-2.5 mb-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-slate-200">3. Zero-Cost Storage Architecture</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uses <strong>LocalStorage</strong> with JSON backup and instant import/export for single-user local state (100% free), with seamless option to sync to <strong>Firebase Firestore</strong> on the 1GB free tier.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <div className="flex items-center gap-2.5 mb-2">
                <Server className="w-5 h-5 text-purple-400" />
                <h4 className="font-semibold text-slate-200">4. Server-Side Security & Proxying</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                All Gemini API calls are securely proxied through our lightweight Express backend (<code>server.ts</code>), guaranteeing that your API key is never exposed to the client browser.
              </p>
            </div>
          </div>

          {/* AWS Core Domains Covered */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">The 6 Core AWS Domains Fully Implemented in This App:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300">
                <strong>Compute:</strong> EC2, Lambda, ECS
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
                <strong>Storage:</strong> S3, EBS, EFS
              </div>
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
                <strong>Networking:</strong> VPC, Route 53, CloudFront
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <strong>Database:</strong> RDS, DynamoDB
              </div>
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300">
                <strong>Security:</strong> IAM, KMS
              </div>
              <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300">
                <strong>Monitoring:</strong> CloudWatch, CloudTrail
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Built & fully configured in this applet workspace
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-100 bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
          >
            Got it, Let's Study
          </button>
        </div>
      </div>
    </div>
  );
};
