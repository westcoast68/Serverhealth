import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Lightbulb, 
  CheckCircle2, 
  Layers, 
  RefreshCw, 
  HelpCircle,
  BookOpen,
  ArrowRight,
  Shield,
  Server,
  Database,
  Network
} from 'lucide-react';
import Markdown from 'react-markdown';
import { UserProgressState, AwsService, ServiceMasteryStats } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

interface Props {
  userState: UserProgressState;
  initialTopic?: string;
  onNavigateToQuiz: (service?: AwsService) => void;
}

export const ArchitectCopilot: React.FC<Props> = ({ userState, initialTopic, onNavigateToQuiz }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello! I am your **AWS Principal Solutions Architect & Certification Coach**.
Ask me any AWS tradeoff question, architecture decision, tricky concept, or exam gotcha across our 6 core domains:
* **Compute:** EC2, Lambda, ECS
* **Storage:** S3, EBS, EFS
* **Networking:** VPC, Route 53, CloudFront
* **Database:** RDS, DynamoDB
* **Security & Identity:** IAM, KMS
* **Management & Monitoring:** CloudWatch, CloudTrail

What would you like to clarify?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState<string>(initialTopic || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const quickPrompts = [
    'When should I choose Amazon EFS over EBS and S3?',
    'Explain public vs private subnet routing with NAT Gateways',
    'What is the exact difference between CloudWatch and CloudTrail?',
    'When to use DynamoDB DAX vs ElastiCache Redis?',
    'IAM Policy evaluation logic: Explicit Deny vs Allow',
    'EC2 Spot vs On-Demand vs Savings Plans cost tradeoffs'
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/aws/architecture-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          currentContext: {
            weakestServices: (Object.values(userState.services) as ServiceMasteryStats[]).filter(s => s.masteryScore < 50).map(s => s.service)
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reach AWS Architect AI');
      }

      const data = await response.json();
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'No explanation generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ **Error connecting to AI Architect:** ${err.message || 'Please check your connection and retry.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Info */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-display">AWS Solutions Architect Copilot</h2>
            <p className="text-xs text-slate-400">Powered by Gemini 3.7 Flash — Deep architectural comparisons & exam anchors</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Active 6 Core Domains
          </span>
        </div>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-400 block px-1">Common Exam Dilemmas & Tradeoffs:</span>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 min-h-[460px] max-h-[600px] overflow-y-auto shadow-2xl">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm space-y-2 ${
              msg.sender === 'user' 
                ? 'bg-amber-500 text-slate-950 font-medium' 
                : 'bg-slate-950/80 text-slate-200 border border-slate-800/80 shadow-md'
            }`}>
              <div className="flex items-center justify-between gap-3 text-[10px] opacity-70 pb-1 border-b border-white/10">
                <span className="font-bold">{msg.sender === 'user' ? 'You' : 'AWS Cloud Architect'}</span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="leading-relaxed prose prose-invert prose-xs max-w-none">
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              <span>Architect AI is synthesizing trade-offs & exam rules...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 shadow-xl"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask any AWS architectural tradeoff, limit, or exam gotcha..."
          className="flex-1 px-4 py-2.5 bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 transition-all font-bold"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
