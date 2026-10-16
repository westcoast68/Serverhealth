import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Coffee, 
  Zap, 
  CheckCircle, 
  X, 
  ChevronUp, 
  ChevronDown,
  Maximize2,
  Minimize2
} from 'lucide-react';

export type FocusMode = 'focus' | 'shortBreak' | 'longBreak';

interface FocusTimerProps {
  onSessionComplete?: (minutes: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({ onSessionComplete, isOpen, onClose }) => {
  const [mode, setMode] = useState<FocusMode>('focus');
  const [focusDuration, setFocusDuration] = useState<number>(25); // minutes
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(5);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(15);

  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(0);

  const totalTimeForMode = mode === 'focus' ? focusDuration * 60 : mode === 'shortBreak' ? shortBreakDuration * 60 : longBreakDuration * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalTimeForMode - secondsLeft) / totalTimeForMode) * 100));

  // Audio Chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.6);
      });
    } catch (err) {
      console.warn('Web Audio playback error', err);
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft <= 0) {
      setIsActive(false);
      playChime();

      if (mode === 'focus') {
        const nextSessions = completedSessions + 1;
        setCompletedSessions(nextSessions);
        setTotalFocusMinutes(prev => prev + focusDuration);
        if (onSessionComplete) {
          onSessionComplete(focusDuration);
        }
        // Auto transition to short or long break
        if (nextSessions % 4 === 0) {
          setMode('longBreak');
          setSecondsLeft(longBreakDuration * 60);
        } else {
          setMode('shortBreak');
          setSecondsLeft(shortBreakDuration * 60);
        }
      } else {
        // Back to focus
        setMode('focus');
        setSecondsLeft(focusDuration * 60);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, mode, focusDuration, shortBreakDuration, longBreakDuration, completedSessions, soundEnabled, onSessionComplete]);

  // Mode change handler
  const handleSwitchMode = (newMode: FocusMode) => {
    setIsActive(false);
    setMode(newMode);
    if (newMode === 'focus') setSecondsLeft(focusDuration * 60);
    else if (newMode === 'shortBreak') setSecondsLeft(shortBreakDuration * 60);
    else setSecondsLeft(longBreakDuration * 60);
  };

  const handleReset = () => {
    setIsActive(false);
    if (mode === 'focus') setSecondsLeft(focusDuration * 60);
    else if (mode === 'shortBreak') setSecondsLeft(shortBreakDuration * 60);
    else setSecondsLeft(longBreakDuration * 60);
  };

  const handleSetFocusDuration = (mins: number) => {
    setFocusDuration(mins);
    if (mode === 'focus') {
      setIsActive(false);
      setSecondsLeft(mins * 60);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-display">Deep Focus Study Engine</h2>
              <p className="text-[11px] text-slate-400 font-mono">Pomodoro Active Recall Interval System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                soundEnabled ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' : 'text-slate-500 bg-slate-800 hover:bg-slate-700'
              }`}
              title={soundEnabled ? 'Sound alert enabled' : 'Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => handleSwitchMode('focus')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'focus'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Focus</span>
          </button>
          <button
            onClick={() => handleSwitchMode('shortBreak')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'shortBreak'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Short Break</span>
          </button>
          <button
            onClick={() => handleSwitchMode('longBreak')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'longBreak'
                ? 'bg-purple-500 text-slate-950 font-bold shadow-md shadow-purple-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Long Break</span>
          </button>
        </div>

        {/* Circular Display & Countdown */}
        <div className="relative flex flex-col items-center justify-center py-4">
          {/* Progress Ring */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="5"
                className="text-slate-800/80 fill-none"
              />
              {/* Progress dynamic circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={276.46}
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                className={`transition-all duration-500 fill-none ${
                  mode === 'focus' ? 'text-amber-500' : mode === 'shortBreak' ? 'text-cyan-400' : 'text-purple-400'
                }`}
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-slate-100 tracking-tight">
                {formatTime(secondsLeft)}
              </span>
              <span className={`text-[11px] font-semibold uppercase mt-1 tracking-wider ${
                mode === 'focus' ? 'text-amber-400' : mode === 'shortBreak' ? 'text-cyan-400' : 'text-purple-400'
              }`}>
                {mode === 'focus' ? 'High-Retention Sprint' : mode === 'shortBreak' ? 'Rest & Hydrate' : 'Extended Recovery'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-8 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 flex items-center gap-2 shadow-xl ${
              isActive
                ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-amber-500/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
            }`}
          >
            {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            <span>{isActive ? 'Pause Focus' : 'Start Focus'}</span>
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              setSecondsLeft(0);
            }}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-all active:scale-95"
            title="Skip to next stage"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Duration Buttons */}
        {mode === 'focus' && (
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Focus Interval Duration:</span>
              <span className="font-mono text-amber-400">{focusDuration} min</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[15, 25, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => handleSetFocusDuration(mins)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                    focusDuration === mins
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Focus Stats Footer */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Sessions Done</div>
              <div className="font-mono font-bold text-slate-200">{completedSessions} intervals</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Total Deep Work</div>
              <div className="font-mono font-bold text-slate-200">{totalFocusMinutes} min</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
