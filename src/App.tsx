import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { AdaptiveDashboard } from './components/dashboard/AdaptiveDashboard';
import { AdaptiveQuizEngine } from './components/quiz/AdaptiveQuizEngine';
import { SpacedFlashcardDeck } from './components/flashcards/SpacedFlashcardDeck';
import { MockExamSimulator } from './components/mock/MockExamSimulator';
import { ArchitectCopilot } from './components/architect/ArchitectCopilot';
import { BudgetArchitectureModal } from './components/budget/BudgetArchitectureModal';
import { INITIAL_USER_PROGRESS } from './data/awsData';
import { UserProgressState, AwsService } from './types';
import { loadUserState, saveUserState } from './utils/adaptiveEngine';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [userState, setUserState] = useState<UserProgressState>(() => {
    return loadUserState() || INITIAL_USER_PROGRESS;
  });

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [quizServiceFilter, setQuizServiceFilter] = useState<AwsService | null>(null);
  const [flashcardServiceFilter, setFlashcardServiceFilter] = useState<AwsService | null>(null);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateState = (newState: UserProgressState) => {
    setUserState(newState);
    saveUserState(newState);
  };

  const handleResetProgress = () => {
    setUserState(INITIAL_USER_PROGRESS);
    saveUserState(INITIAL_USER_PROGRESS);
    showToast('Reset mastery profile to baseline diagnostic state.', 'info');
  };

  const handleExportProgress = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aws_mastery_profile_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported student mastery profile to JSON.', 'success');
  };

  const handleNavigateToQuiz = (serviceFilter?: AwsService) => {
    setQuizServiceFilter(serviceFilter || null);
    setActiveTab('quiz');
    if (serviceFilter) {
      showToast(`Filtered quiz to target ${serviceFilter} gaps.`, 'info');
    }
  };

  const handleNavigateToFlashcards = (serviceFilter?: AwsService) => {
    setFlashcardServiceFilter(serviceFilter || null);
    setActiveTab('flashcards');
    if (serviceFilter) {
      showToast(`Loaded flashcards for ${serviceFilter}.`, 'info');
    }
  };

  const handleNavigateToCopilot = (initialTopic?: string) => {
    setCopilotInitialPrompt(initialTopic || '');
    setActiveTab('copilot');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userState={userState}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onResetProgress={handleResetProgress}
        onExportProgress={handleExportProgress}
      />

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <AdaptiveDashboard
            userState={userState}
            onNavigateToQuiz={handleNavigateToQuiz}
            onNavigateToFlashcards={handleNavigateToFlashcards}
            onNavigateToExam={() => setActiveTab('exam')}
            onNavigateToCopilot={handleNavigateToCopilot}
          />
        )}

        {activeTab === 'quiz' && (
          <AdaptiveQuizEngine
            userState={userState}
            onUpdateState={handleUpdateState}
            initialServiceFilter={quizServiceFilter}
          />
        )}

        {activeTab === 'flashcards' && (
          <SpacedFlashcardDeck
            userState={userState}
            onUpdateState={handleUpdateState}
            initialServiceFilter={flashcardServiceFilter}
          />
        )}

        {activeTab === 'exam' && (
          <MockExamSimulator
            userState={userState}
            onUpdateState={handleUpdateState}
          />
        )}

        {activeTab === 'copilot' && (
          <ArchitectCopilot
            userState={userState}
            initialTopic={copilotInitialPrompt}
            onNavigateToQuiz={handleNavigateToQuiz}
          />
        )}
      </main>

      {/* Budget & Architecture Tooling Guide Modal */}
      <BudgetArchitectureModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2.5 ${
            toastMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200' :
            toastMessage.type === 'warn' ? 'bg-amber-950/90 border-amber-500/60 text-amber-200' :
            'bg-slate-900/90 border-slate-700 text-slate-200'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toastMessage.type === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {toastMessage.type === 'info' && <Info className="w-4 h-4 text-amber-400" />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AWS Core Fundamentals Adaptive Mastery Engine • 14 Services Across 6 Core Domains</span>
          <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
            <span>COMPUTE</span>
            <span>•</span>
            <span>STORAGE</span>
            <span>•</span>
            <span>NETWORKING</span>
            <span>•</span>
            <span>DATABASE</span>
            <span>•</span>
            <span>SECURITY</span>
            <span>•</span>
            <span>MONITORING</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
