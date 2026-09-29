import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

export function useStepper(length, ms = 1300) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const id = window.setInterval(() => {
      setIndex((current) => (current >= length - 1 ? current : current + 1));
    }, ms);
    return () => window.clearInterval(id);
  }, [playing, length, ms]);

  useEffect(() => {
    if (playing && index >= length - 1) setPlaying(false);
  }, [playing, index, length]);

  const toggle = () => {
    if (!playing && index >= length - 1) {
      setIndex(0);
      setPlaying(true);
      return;
    }
    setPlaying((value) => !value);
  };

  const reset = () => {
    setPlaying(false);
    setIndex(0);
  };

  const pick = (next) => {
    setPlaying(false);
    setIndex(Math.min(length - 1, Math.max(0, next)));
  };

  const back = () => pick(index - 1);
  const forward = () => pick(index + 1);

  return { index, setIndex, playing, toggle, reset, pick, back, forward };
}

export function Frame({ title, hint, children, footer }) {
  return (
    <div className="flex flex-col w-full h-full min-h-0 px-3 pb-3 pt-9">
      <div className="shrink-0 mb-3 pr-24">
        <h3 className="text-sm md:text-base font-semibold text-white">{title}</h3>
        {hint && <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{hint}</p>}
      </div>
      <div className="flex-1 min-h-0 overflow-auto custom-scroll pr-1">{children}</div>
      {footer && <div className="shrink-0 pt-3">{footer}</div>}
    </div>
  );
}

export function Transport({ playing, onToggle, onReset }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        {playing ? 'Pause' : 'Play'}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset
      </button>
    </div>
  );
}

export function StepDots({ count, index, onPick }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Step ${i + 1}`}
          onClick={() => onPick(i)}
          className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-teal-400' : 'w-1.5 bg-gray-600 hover:bg-gray-400'}`}
        />
      ))}
    </div>
  );
}

export function StepControls({ stepper, total, showPlay = true }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={stepper.back}
        disabled={stepper.index === 0}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Prev step
      </button>
      <span className="text-[11px] font-mono text-teal-200 px-1">
        {stepper.index + 1} / {total}
      </span>
      <button
        type="button"
        onClick={stepper.forward}
        disabled={stepper.index === total - 1}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next step
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
      <StepDots count={total} index={stepper.index} onPick={stepper.pick} />
      {showPlay && <Transport playing={stepper.playing} onToggle={stepper.toggle} onReset={stepper.reset} />}
    </div>
  );
}

export const tabClass = (on) =>
  `px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
    on
      ? 'bg-teal-500/15 text-teal-200 border-teal-400/50'
      : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:bg-gray-700'
  }`;

export function Lesson({ title, children }) {
  return (
    <div className="rounded-xl border border-teal-500/30 bg-teal-950/50 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">{title}</p>
      <div className="text-xs text-gray-100 mt-1 leading-relaxed">{children}</div>
    </div>
  );
}

const LINE_TONE = {
  cmd: 'text-gray-100',
  out: 'text-gray-300',
  ok: 'text-emerald-300',
  err: 'text-rose-300',
  warn: 'text-amber-200',
  info: 'text-cyan-200',
  dim: 'text-gray-500',
};

export function Terminal({ title = 'Terminal', lines, prompt = '$', className = '' }) {
  return (
    <div className={`rounded-xl border border-gray-700 bg-black/80 overflow-hidden ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 border-b border-gray-700">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 text-[10px] text-gray-400 font-mono truncate">{title}</span>
      </div>
      <div className="p-3 font-mono text-[11px] leading-relaxed space-y-0.5 min-h-[3.5rem]">
        {lines.map((line, i) => (
          <p
            key={i}
            className={`whitespace-pre-wrap break-all ${LINE_TONE[line.kind || 'out']} ${
              line.highlight ? 'bg-teal-500/15 rounded px-1 -mx-1' : ''
            }`}
          >
            {line.kind === 'cmd' && <span className="text-teal-400">{line.prompt ?? prompt} </span>}
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export function CodeLines({ lines, active = [], title, onLineClick, marks = {} }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden">
      {title && (
        <div className="px-3 py-1.5 text-[10px] font-mono text-gray-400 border-b border-gray-800 bg-gray-900/80">{title}</div>
      )}
      <div className="py-2 font-mono text-[11px] leading-relaxed overflow-x-auto">
        {lines.map((line, i) => {
          const on = active.includes(i);
          const comment = line.trim().startsWith('#');
          return (
            <div
              key={i}
              onClick={onLineClick ? () => onLineClick(i) : undefined}
              className={`flex gap-3 px-3 transition-colors ${on ? 'bg-teal-500/20' : ''} ${
                onLineClick ? 'cursor-pointer hover:bg-gray-800/70' : ''
              }`}
            >
              <span className="w-5 shrink-0 text-right text-gray-600 select-none">{i + 1}</span>
              <span className={`whitespace-pre ${on ? 'text-teal-50' : comment ? 'text-gray-500' : 'text-gray-300'}`}>
                {line || ' '}
              </span>
              {marks[i] && (
                <span className="ml-auto shrink-0 self-center text-[9px] font-sans font-bold px-1.5 rounded-full bg-teal-500/20 text-teal-200">
                  {marks[i]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Caption({ text }) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={text}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
        className="text-xs text-gray-300 leading-relaxed min-h-[2.5rem]"
      >
        {text}
      </motion.p>
    </AnimatePresence>
  );
}
