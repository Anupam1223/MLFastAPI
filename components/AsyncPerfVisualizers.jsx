import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Globe,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Server,
  Lock,
  Unlock,
  Sparkles,
} from 'lucide-react';
import { Frame, useStepper, StepControls } from './VisualKit';

function WaiterComparisonVisualizer() {
  const [running, setRunning] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => setTick((t) => (t + 1) % 120), 60);
    return () => clearInterval(interval);
  }, [running]);

  const syncState = (index) => {
    const start = index * 38;
    const end = start + 36;
    if (tick < start) return { status: 'queued', progress: 0 };
    if (tick >= end) return { status: 'done', progress: 100 };
    return { status: 'waiting_blocked', progress: Math.round(((tick - start) / 36) * 100) };
  };

  const asyncState = (index) => {
    const start = index * 7;
    const end = start + 36;
    if (tick < start) return { status: 'queued', progress: 0 };
    if (tick >= end) return { status: 'done', progress: 100 };
    return { status: 'waiting_async', progress: Math.round(((tick - start) / 36) * 100) };
  };

  const syncDone = [0, 1, 2].filter((i) => syncState(i).status === 'done').length;
  const asyncDone = [0, 1, 2].filter((i) => asyncState(i).status === 'done').length;

  return (
    <Frame title="Three requests, one wait" hint="The top lane waits in line. The bottom lane waits together.">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-gray-400">3 I/O requests</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setRunning((v) => !v)} className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white">
            {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {running ? 'Pause' : 'Play'}
          </button>
          <button type="button" onClick={() => setTick(0)} className="rounded-lg bg-gray-800 p-1.5 text-gray-200" aria-label="Restart">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <Lane title="Blocking · one at a time" tone="rose" done={`${syncDone} / 3`}>
        {[0, 1, 2].map((i) => {
          const st = syncState(i);
          return (
            <Bar
              key={i}
              name={`Req ${i + 1}`}
              progress={st.progress}
              fill={st.status === 'done' ? 'bg-emerald-500/80' : st.status === 'waiting_blocked' ? 'bg-rose-500/80' : 'bg-gray-800'}
              label={st.status === 'queued' ? 'queued' : st.status === 'waiting_blocked' ? `server blocked · ${st.progress}%` : '200 sent'}
            />
          );
        })}
      </Lane>

      <Lane title="async def + await · together" tone="emerald" done={`${asyncDone} / 3`}>
        {[0, 1, 2].map((i) => {
          const st = asyncState(i);
          return (
            <Bar
              key={i}
              name={`Req ${i + 1}`}
              progress={st.progress}
              fill={st.status === 'done' ? 'bg-emerald-500/80' : st.status === 'waiting_async' ? 'bg-cyan-500/70' : 'bg-gray-800'}
              label={st.status === 'queued' ? 'incoming' : st.status === 'waiting_async' ? `awaiting I/O · ${st.progress}%` : '200 sent'}
            />
          );
        })}
      </Lane>

      <p className="mt-3 flex items-center gap-2 text-[12px] text-teal-100">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-teal-300" />
        The cyan bars fill at the same time. The wait is shared. The rose bars finish one after another.
      </p>
    </Frame>
  );
}

function Lane({ title, tone, done, children }) {
  const border = tone === 'rose' ? 'border-rose-400/40' : 'border-emerald-400/40';
  const badge = tone === 'rose' ? 'text-rose-200' : 'text-emerald-200';
  return (
    <div className={`mb-3 rounded-2xl border bg-gray-950/50 p-3 ${border}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className={`text-[11px] font-semibold uppercase tracking-wider ${badge}`}>{title}</p>
        <p className={`font-mono text-sm ${badge}`}>{done}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Bar({ name, progress, fill, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 font-mono text-[11px] text-gray-300">{name}</span>
      <div className="relative h-7 flex-1 overflow-hidden rounded-lg border border-gray-800 bg-black/50 p-1">
        <div className={`h-full rounded ${fill}`} style={{ width: `${progress}%` }} />
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-white">{label}</span>
      </div>
    </div>
  );
}

function RoutePauseAnimator() {
  const [phase, setPhase] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const phases = [
    { label: 'Request 1 enters GET /async-data', code: 'async def get_async_data():', loop: 'Running get_async_data for request 1', parked: false },
    { label: 'Hits await asyncio.sleep(1)', code: 'await asyncio.sleep(1)', loop: 'Parking request 1. The loop is free.', parked: true },
    { label: 'While request 1 waits, the loop serves 2 and 3', code: 'event loop is free', loop: 'Serving other requests', parked: true },
    { label: 'The second ends. The function returns JSON.', code: 'return {"message": "Data fetched asynchronously!"}', loop: 'Resumed · 200 sent', parked: false },
  ];

  useEffect(() => {
    if (!autoPlay) return undefined;
    const timer = setInterval(() => setPhase((p) => (p + 1) % phases.length), 2200);
    return () => clearInterval(timer);
  }, [autoPlay, phases.length]);

  const current = phases[phase];
  return (
    <Frame title="The route pauses. The process does not." hint="Step 1 to 4, or let it play.">
      <div className="mb-3 flex items-center gap-1.5">
        {phases.map((_, idx) => (
          <button key={idx} type="button" onClick={() => { setAutoPlay(false); setPhase(idx); }} className={`h-7 w-7 rounded-lg text-xs font-bold ${phase === idx ? 'bg-teal-500 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>
            {idx + 1}
          </button>
        ))}
        <button type="button" onClick={() => setAutoPlay((v) => !v)} className="ml-2 inline-flex items-center gap-1 rounded-lg bg-gray-800 px-2.5 py-1.5 text-xs text-gray-200">
          {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {autoPlay ? 'Auto' : 'Paused'}
        </button>
      </div>
      <div className="rounded-2xl border border-gray-800 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-emerald-300"><Zap className="h-3.5 w-3.5" /> event loop</span>
          <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-[10px] text-emerald-200">not blocked</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-black/40 p-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold text-gray-950 ${phase === 2 ? 'bg-emerald-400' : 'bg-cyan-400'}`}>
            {phase === 2 ? 'R2' : 'R1'}
          </div>
          <div>
            <p className="text-sm text-white">{current.label}</p>
            <p className="font-mono text-[11px] text-cyan-200">{current.code}</p>
          </div>
        </div>
        <div className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[11px] ${current.parked ? 'border-amber-400/50 text-amber-100' : 'border-gray-800 text-gray-500'}`}>
          <Clock className="h-4 w-4 text-amber-300" />
          {phase === 0 && 'Running up to the await.'}
          {phase === 1 && 'I need to wait 1s. Do other work.'}
          {phase === 2 && 'Timer running. The thread is not held.'}
          {phase === 3 && 'Timer done. Control returns after await.'}
        </div>
        <div className={`mt-3 rounded-xl border p-3 ${current.parked ? 'border-amber-400/50 bg-amber-500/10' : 'border-gray-800 opacity-60'}`}>
          <p className="text-[10px] uppercase tracking-wider text-amber-200">paused at await asyncio.sleep(1)</p>
          <p className="mt-2 font-mono text-[11px] text-gray-300">{current.parked ? 'get_async_data is parked · 0% CPU while it waits' : 'Nothing is waiting.'}</p>
        </div>
      </div>
      <p className="mt-3 font-mono text-[11px] text-emerald-200">{current.loop}</p>
    </Frame>
  );
}

const LOOP_FRAMES = [
  {
    note: 'A is on the event loop. B, C, and D are waiting to start.',
    who: 'A',
    tasks: [
      { id: 'A', state: 'running', progress: 35, label: 'on the event loop' },
      { id: 'B', state: 'queued', progress: 0, label: 'waiting to start' },
      { id: 'C', state: 'queued', progress: 0, label: 'waiting to start' },
      { id: 'D', state: 'queued', progress: 0, label: 'waiting to start' },
    ],
  },
  {
    note: 'A hits await and pauses. The loop is free.',
    who: '—',
    tasks: [
      { id: 'A', state: 'io', progress: 50, label: 'paused on await' },
      { id: 'B', state: 'queued', progress: 0, label: 'waiting to start' },
      { id: 'C', state: 'queued', progress: 0, label: 'waiting to start' },
      { id: 'D', state: 'queued', progress: 0, label: 'waiting to start' },
    ],
  },
  {
    note: 'The loop switches to B. A stays paused.',
    who: 'B',
    tasks: [
      { id: 'A', state: 'io', progress: 50, label: 'paused on await' },
      { id: 'B', state: 'running', progress: 30, label: 'on the event loop' },
      { id: 'C', state: 'queued', progress: 0, label: 'waiting to start' },
      { id: 'D', state: 'queued', progress: 0, label: 'waiting to start' },
    ],
  },
  {
    note: 'B hits await and pauses too. C is next.',
    who: 'C',
    tasks: [
      { id: 'A', state: 'io', progress: 50, label: 'paused on await' },
      { id: 'B', state: 'io', progress: 45, label: 'paused on await' },
      { id: 'C', state: 'running', progress: 25, label: 'on the event loop' },
      { id: 'D', state: 'queued', progress: 0, label: 'waiting to start' },
    ],
  },
  {
    note: 'A’s I/O finishes, so A is ready. C is still running.',
    who: 'C',
    tasks: [
      { id: 'A', state: 'ready', progress: 90, label: 'I/O done · ready to resume' },
      { id: 'B', state: 'io', progress: 45, label: 'paused on await' },
      { id: 'C', state: 'running', progress: 60, label: 'on the event loop' },
      { id: 'D', state: 'queued', progress: 0, label: 'waiting to start' },
    ],
  },
  {
    note: 'C pauses. The loop resumes A, the one that is ready.',
    who: 'A',
    tasks: [
      { id: 'A', state: 'running', progress: 95, label: 'resumed on the event loop' },
      { id: 'B', state: 'io', progress: 45, label: 'paused on await' },
      { id: 'C', state: 'io', progress: 70, label: 'paused on await' },
      { id: 'D', state: 'queued', progress: 0, label: 'waiting to start' },
    ],
  },
];

function EventLoopOrbitalVisualizer() {
  const stepper = useStepper(LOOP_FRAMES.length, 1800);
  const frame = LOOP_FRAMES[stepper.index];
  return (
    <Frame
      title="One loop, four connections"
      hint="Use the step buttons. Play only when you want it to move."
      footer={<StepControls stepper={stepper} total={LOOP_FRAMES.length} />}
    >
      <p className="mb-3 text-[12px] text-gray-200">{frame.note}</p>
      <div className="grid items-center gap-4 md:grid-cols-2">
        <div className="flex flex-col items-center rounded-2xl border border-gray-800 p-4">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-dashed border-cyan-400/40">
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-500/10">
              <Zap className="h-5 w-5 text-cyan-300" />
              <span className="mt-1 text-[10px] font-bold uppercase text-white">event loop</span>
              <span className="font-mono text-[10px] text-cyan-200">{frame.who}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {frame.tasks.map((task) => {
            const box = task.state === 'running' ? 'border-emerald-400/60 bg-emerald-500/10' : task.state === 'io' ? 'border-amber-400/50 bg-amber-500/10' : task.state === 'ready' ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-gray-800';
            const bar = task.state === 'running' ? 'bg-emerald-400' : task.state === 'io' ? 'bg-amber-400' : task.state === 'ready' ? 'bg-cyan-400' : 'bg-gray-700';
            return (
              <div key={task.id} className={`rounded-xl border p-3 ${box}`}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-white">{task.id}</span>
                  <span className="text-right text-[10px] uppercase text-gray-300">{task.label}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-950">
                  <div className={`h-full ${bar}`} style={{ width: `${task.progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}

const TEN = [
  { title: 'Request arrives', desc: 'Client sends GET /async-data.', zone: 'client' },
  { title: 'Handler called', desc: 'FastAPI invokes get_async_data.', zone: 'route' },
  { title: 'Runs until await', desc: 'Execution reaches await asyncio.sleep(1).', zone: 'route' },
  { title: 'Yields', desc: 'Control goes back to the event loop.', zone: 'loop' },
  { title: 'Other work', desc: 'The loop serves other requests during the wait.', zone: 'loop' },
  { title: 'I/O completes', desc: 'The 1 second sleep finishes.', zone: 'io' },
  { title: 'Reschedule', desc: 'The loop schedules the rest of the function.', zone: 'loop' },
  { title: 'Resume', desc: 'Execution continues after await.', zone: 'route' },
  { title: 'Response built', desc: 'The JSON message is prepared.', zone: 'route' },
  { title: 'Sent', desc: 'HTTP 200 goes back to the client.', zone: 'client' },
];

function TenStepStepperVisualizer() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return undefined;
    const t = setInterval(() => setStep((s) => (s + 1) % 10), 1600);
    return () => clearInterval(t);
  }, [playing]);
  const current = TEN[step];
  const box = (zone, label, body) => (
    <div className={`rounded-xl border p-3 ${current.zone === zone ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800 opacity-50'}`}>
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-[12px] text-white">{body}</p>
    </div>
  );
  return (
    <Frame title="Ten steps of /async-data" hint="Play, or jump to a number.">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] text-teal-200">{step + 1} / 10 · {current.title}</span>
        <div className="flex gap-1">
          <button type="button" onClick={() => { setPlaying(false); setStep((s) => (s + 9) % 10); }} className="rounded-lg bg-gray-800 p-1.5"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => setPlaying((v) => !v)} className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-2 py-1 text-xs text-white">
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={() => { setPlaying(false); setStep((s) => (s + 1) % 10); }} className="rounded-lg bg-gray-800 p-1.5"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {box('client', 'client', step === 0 ? 'GET /async-data' : step === 9 ? 'JSON received' : 'waiting')}
        {box('route', 'get_async_data', [1, 2, 7, 8].includes(step) ? current.title : 'idle')}
        {box('loop', 'event loop', [3, 4, 6].includes(step) ? current.title : 'watching')}
        {box('io', 'asyncio.sleep(1)', [3, 4, 5].includes(step) ? current.title : 'no timer')}
      </div>
      <p className="mt-3 text-[12px] text-gray-200">{current.desc}</p>
      <div className="mt-3 grid grid-cols-10 gap-1">
        {TEN.map((s, idx) => (
          <button key={s.title} type="button" onClick={() => { setPlaying(false); setStep(idx); }} className={`rounded-md py-1.5 font-mono text-[11px] ${step === idx ? 'bg-teal-500 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>{idx + 1}</button>
        ))}
      </div>
    </Frame>
  );
}

const RACE_NOTES = [
  'Both requests arrive. Nothing is running yet.',
  'The async route runs until await. The sync route calls time.sleep(1).',
  'Async yields, so the loop is free. time.sleep holds the loop. The server is blocked.',
  'The async route resumes after I/O. The sync route finishes the rest of its code.',
  'Both send the response. Only the async path let other work run during the wait.',
];

function AsyncVsSyncRaceVisualizer() {
  const stepper = useStepper(5, 1800);
  const step = stepper.index;
  const asyncNodes = ['Request arrives', 'Run until await', 'Yield · loop free', 'Resume after I/O', 'Send response'];
  const syncNodes = ['Request arrives', 'time.sleep(1)', 'Server blocked', 'Finish code', 'Send response'];
  return (
    <Frame
      title="Yield versus time.sleep"
      hint="Use Prev step and Next step. Play only if you want it to move."
      footer={<StepControls stepper={stepper} total={5} />}
    >
      <p className="mb-3 text-[12px] text-gray-200">{RACE_NOTES[step]}</p>
      <Track tone="emerald" kicker="await asyncio.sleep(1)" nodes={asyncNodes} step={step} hot={2} onPick={stepper.pick} />
      <div className={`my-3 flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[11px] ${step === 2 ? 'border-teal-400 text-white' : 'border-gray-800 text-gray-400'}`}>
        <Server className="h-4 w-4 text-teal-300" />
        {step === 2 ? 'Async yields. The sync call is holding the loop.' : 'Same stage on both tracks.'}
      </div>
      <Track tone="rose" kicker="time.sleep(1)" nodes={syncNodes} step={step} hot={2} onPick={stepper.pick} />
    </Frame>
  );
}

function Track({ tone, kicker, nodes, step, hot, onPick }) {
  return (
    <div className={`rounded-2xl border p-3 ${tone === 'rose' ? 'border-rose-400/40' : 'border-emerald-400/40'}`}>
      <p className={`mb-2 text-[11px] font-semibold uppercase tracking-wider ${tone === 'rose' ? 'text-rose-200' : 'text-emerald-200'}`}>{kicker}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {nodes.map((label, idx) => (
          <button key={label} type="button" onClick={() => onPick(idx)} className={`min-h-[4.2rem] rounded-xl border px-1 py-2 text-center text-[10px] ${step === idx ? (idx === hot && tone === 'rose' ? 'border-rose-400 bg-rose-500/20 text-white' : 'border-teal-400 bg-teal-500/15 text-white') : 'border-gray-800 text-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

const IO_PROFILES = {
  network: { name: 'API / database', icon: Globe, cpuStart: 4, ioWait: 90, cpuEnd: 6, cap: 'hundreds of concurrent calls', desc: 'Most of the time is waiting on the network.' },
  disk: { name: 'disk / object store', icon: HardDrive, cpuStart: 5, ioWait: 87, cpuEnd: 8, cap: 'many file reads at once', desc: 'Most of the time is waiting on storage.' },
  queue: { name: 'message queue', icon: Layers, cpuStart: 3, ioWait: 94, cpuEnd: 3, cap: 'many listeners at once', desc: 'Almost no CPU while the reply is outstanding.' },
};

function IOBoundTimelineVisualizer() {
  const [selected, setSelected] = useState('network');
  const active = IO_PROFILES[selected];
  const Icon = active.icon;
  return (
    <Frame title="Where the time goes" hint="Pick network, disk, or a queue.">
      <div className="mb-3 grid grid-cols-3 gap-2">
        {Object.entries(IO_PROFILES).map(([key, item]) => {
          const ItemIcon = item.icon;
          return (
            <button key={key} type="button" onClick={() => setSelected(key)} className={`rounded-xl border p-2 text-left text-[11px] ${selected === key ? 'border-teal-400 text-white' : 'border-gray-800 text-gray-400'}`}>
              <ItemIcon className="mb-1 h-4 w-4" />
              {item.name}
            </button>
          );
        })}
      </div>
      <div className="rounded-2xl border border-gray-800 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-cyan-200"><Icon className="h-3.5 w-3.5" /> {active.name}</span>
          <span className="font-mono text-[11px] text-emerald-300">{active.ioWait}% waiting</span>
        </div>
        <p className="mb-3 text-[12px] text-gray-300">{active.desc}</p>
        <div className="flex h-10 gap-1 overflow-hidden rounded-xl border border-gray-800 bg-black/40 p-1">
          <div style={{ width: `${active.cpuStart}%` }} className="flex items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-gray-950">CPU</div>
          <div style={{ width: `${active.ioWait}%` }} className="flex items-center justify-center rounded border border-dashed border-cyan-400 bg-cyan-500/20 font-mono text-[10px] text-cyan-100">await · loop serves others</div>
          <div style={{ width: `${active.cpuEnd}%` }} className="flex items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-gray-950">CPU</div>
        </div>
        <div className="mt-3 space-y-1.5">
          {[0, 1, 2, 3].map((r) => (
            <div key={r} className="flex items-center gap-2 font-mono text-[10px] text-gray-400">
              <span className="w-10">R{r + 1}</span>
              <div className="flex h-4 flex-1 overflow-hidden rounded border border-gray-800">
                <div className="bg-emerald-500" style={{ width: '8%', marginLeft: `${r * 4}%` }} />
                <div className="bg-cyan-500/25" style={{ width: '62%' }} />
                <div className="bg-emerald-500" style={{ width: '8%' }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-emerald-200">{active.cap}</p>
      </div>
    </Frame>
  );
}

function DefThreadpoolRouterVisualizer() {
  const [kind, setKind] = useState('def');
  const defn = kind === 'def';
  return (
    <Frame title="def leaves the loop. async def stays." hint="Switch the two route styles.">
      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => setKind('def')} className={`rounded-xl border p-3 text-left ${defn ? 'border-amber-400 bg-amber-500/10' : 'border-gray-800'}`}>
          <p className="font-mono text-[12px] text-amber-200">def get_sync_data</p>
          <p className="mt-1 text-[11px] text-gray-300">Sent to the thread pool</p>
        </button>
        <button type="button" onClick={() => setKind('async')} className={`rounded-xl border p-3 text-left ${!defn ? 'border-emerald-400 bg-emerald-500/10' : 'border-gray-800'}`}>
          <p className="font-mono text-[12px] text-emerald-200">async def get_async_data</p>
          <p className="mt-1 text-[11px] text-gray-300">Runs on the event loop</p>
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className={`rounded-2xl border p-3 ${!defn ? 'border-emerald-400' : 'border-gray-800'}`}>
          <p className="text-[11px] font-semibold text-emerald-200">event loop</p>
          <p className="mt-2 text-[12px] text-gray-200">{defn ? 'Free while the def runs on a worker.' : 'Running the coroutine directly.'}</p>
        </div>
        <div className={`rounded-2xl border p-3 ${defn ? 'border-amber-400' : 'border-gray-800 opacity-50'}`}>
          <p className="text-[11px] font-semibold text-amber-200">thread pool</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`rounded-lg border px-2 py-1.5 text-center font-mono text-[10px] ${defn && n === 1 ? 'border-amber-400 text-white' : 'border-gray-800 text-gray-500'}`}>
                thread {n}{defn && n === 1 ? ' · def' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function GilCpuVsIoVisualizer() {
  const [mode, setMode] = useState('cpu');
  const cpu = mode === 'cpu';
  return (
    <Frame title="async def does not speed up predict" hint="Switch I/O and CPU. Only I/O lets the next request in.">
      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => setMode('io')} className={`rounded-xl border p-3 text-left ${!cpu ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-800'}`}>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-200"><Unlock className="h-3.5 w-3.5" /> I/O wait</span>
        </button>
        <button type="button" onClick={() => setMode('cpu')} className={`rounded-xl border p-3 text-left ${cpu ? 'border-rose-400 bg-rose-500/10' : 'border-gray-800'}`}>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-200"><Lock className="h-3.5 w-3.5" /> model.predict</span>
        </button>
      </div>
      <div className="space-y-2 rounded-2xl border border-gray-800 p-3">
        {cpu ? (
          <>
            <div className="rounded-lg border border-rose-400 bg-rose-500/15 px-3 py-2 font-mono text-[11px] text-rose-100">Req 1 · model.predict holds the GIL · no await</div>
            <div className="rounded-lg border border-gray-800 px-3 py-2 font-mono text-[11px] text-gray-500">Req 2 waits until that computation ends</div>
          </>
        ) : (
          <>
            <div className="rounded-lg border border-cyan-400 bg-cyan-500/15 px-3 py-2 font-mono text-[11px] text-cyan-100">Req 1 hits await and releases the loop</div>
            <div className="rounded-lg border border-emerald-400 bg-emerald-500/15 px-3 py-2 font-mono text-[11px] text-emerald-100">Req 2 runs while Req 1 waits on the database</div>
          </>
        )}
      </div>
    </Frame>
  );
}

const STAGES = [
  { name: '1. Receive', tag: 'FastAPI', io: false, cpu: false, summary: 'The body arrives and Pydantic checks it.', ops: ['parse JSON', 'validate InputData'] },
  { name: '2. Preprocess', tag: 'async I/O', io: true, cpu: false, summary: 'Enrich the input. This is where await helps.', ops: ['await db.fetch_features(...)', 'await external_service.get_user_data(...)', 'await storage.read_config(...)'] },
  { name: '3. Infer', tag: 'CPU', io: false, cpu: true, summary: 'model.predict. Heavy computation.', ops: ['model.predict(processed_data)'] },
  { name: '4. Postprocess', tag: 'async I/O', io: true, cpu: false, summary: 'Log or notify after the score.', ops: ['await db.log_prediction(...)', 'await notifications.send_alert(...)', 'await workflow_service.trigger_action(...)'] },
  { name: '5. Return', tag: 'FastAPI', io: false, cpu: false, summary: 'The response goes back to the client.', ops: ['serialize OutputData', 'HTTP 200'] },
];

function MlLifecycleConveyorVisualizer() {
  const [selected, setSelected] = useState(1);
  const active = STAGES[selected];
  return (
    <Frame title="Five stages of a prediction" hint="Click a stage. Teal can await. Amber is the model.">
      <div className="mb-3 grid grid-cols-5 gap-1.5">
        {STAGES.map((st, idx) => (
          <button key={st.name} type="button" onClick={() => setSelected(idx)} className={`rounded-xl border p-2 text-left ${selected === idx ? (st.cpu ? 'border-amber-400 bg-amber-500/15' : st.io ? 'border-cyan-400 bg-cyan-500/15' : 'border-teal-400 bg-teal-500/10') : 'border-gray-800'}`}>
            <p className="text-[9px] uppercase text-gray-400">{st.tag}</p>
            <p className="mt-1 text-[11px] font-semibold text-white">{st.name}</p>
          </button>
        ))}
      </div>
      <p className="text-[12px] text-gray-200">{active.summary}</p>
      <div className="mt-3 space-y-1.5">
        {active.ops.map((op) => (
          <div key={op} className="flex items-center justify-between rounded-lg border border-gray-800 bg-black/30 px-3 py-2 font-mono text-[11px] text-cyan-100">
            <span>{op}</span>
            {active.io && <span className="text-[10px] text-emerald-300">yields</span>}
          </div>
        ))}
      </div>
    </Frame>
  );
}

const FORK_NOTES = [
  'The request enters async def predict_endpoint.',
  'Both I/O calls start together with asyncio.create_task. The loop can still serve other requests.',
  'The trap. run_model_inference is synchronous, so it sits on the loop and every other request waits.',
  'The handler returns OutputData with status 200. The loop was blocked for the whole predict.',
];

function ForkJoinTrapVisualizer() {
  const stepper = useStepper(4, 1800);
  const phase = stepper.index;
  const card = (on, className, children) => (
    <div className={`rounded-xl border p-3 ${on ? className : 'border-gray-800 opacity-60'}`}>{children}</div>
  );
  return (
    <Frame
      title="Two awaits, then a blocking predict"
      hint="Use Prev step and Next step. Step 3 is the trap."
      footer={<StepControls stepper={stepper} total={4} />}
    >
      <p className="mb-3 text-[12px] text-gray-200">{FORK_NOTES[phase]}</p>
      <div className="space-y-2">
        {card(phase === 0, 'border-teal-400 bg-teal-500/10', <p className="text-[12px] text-white">1. async def predict_endpoint · POST /predict</p>)}
        {card(phase === 1, 'border-cyan-400 bg-cyan-500/10', (
          <>
            <p className="text-[12px] text-cyan-100">2. asyncio.create_task · both I/O calls</p>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              <p className="rounded-lg border border-cyan-400/30 px-2 py-1 font-mono text-[11px] text-cyan-100">fetch_extra_data_from_db</p>
              <p className="rounded-lg border border-cyan-400/30 px-2 py-1 font-mono text-[11px] text-cyan-100">call_external_service</p>
            </div>
          </>
        ))}
        {card(phase === 2, 'border-rose-400 bg-rose-500/10', (
          <p className="flex items-start gap-2 text-[12px] text-rose-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            3. run_model_inference sits on the loop. Other requests wait.
          </p>
        ))}
        {card(phase === 3, 'border-emerald-400 bg-emerald-500/10', <p className="text-[12px] text-emerald-100">4. OutputData · 200</p>)}
      </div>
    </Frame>
  );
}

function ThreadpoolOffloadSim({ startOn }) {
  const [usePool, setUsePool] = useState(startOn);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => (v + 1) % 100), 80);
    return () => clearInterval(t);
  }, []);
  const infer = tick >= 25 && tick <= 75;
  const frozen = !usePool && infer;
  return (
    <Frame title="predict on the loop, or on a worker" hint="Switch the direct call and run_in_threadpool.">
      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => setUsePool(false)} className={`rounded-xl border p-3 text-left ${!usePool ? 'border-rose-400 bg-rose-500/10' : 'border-gray-800'}`}>
          <p className="text-[11px] font-semibold text-rose-200">model.predict(data)</p>
        </button>
        <button type="button" onClick={() => setUsePool(true)} className={`rounded-xl border p-3 text-left ${usePool ? 'border-emerald-400 bg-emerald-500/10' : 'border-gray-800'}`}>
          <p className="text-[11px] font-semibold text-emerald-200">await run_in_threadpool(...)</p>
        </button>
      </div>
      <div className={`rounded-2xl border p-3 ${frozen ? 'border-rose-400' : 'border-emerald-400/40'}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] text-white"><Zap className="h-3.5 w-3.5 text-emerald-300" /> event loop</span>
          <span className={`font-mono text-[10px] ${frozen ? 'text-rose-200' : 'text-emerald-200'}`}>{frozen ? 'frozen' : 'free'}</span>
        </div>
        <div className="relative h-8 overflow-hidden rounded-lg border border-gray-800 bg-black/40">
          <div className={`h-full ${frozen ? 'bg-rose-500' : 'bg-emerald-500/70'}`} style={{ width: `${tick}%` }} />
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-white">
            {frozen ? 'other requests are stuck' : 'other requests keep moving'}
          </span>
        </div>
      </div>
      <div className={`mt-3 rounded-2xl border p-3 ${usePool && infer ? 'border-cyan-400 bg-cyan-500/10' : 'border-gray-800'}`}>
        <p className="inline-flex items-center gap-1 text-[11px] text-cyan-200"><Cpu className="h-3.5 w-3.5" /> worker thread</p>
        <p className="mt-2 font-mono text-[11px] text-gray-200">
          {usePool && infer ? 'model.predict is running here. The loop is not.' : usePool ? 'idle until the next offload' : 'unused · predict is on the loop'}
        </p>
      </div>
    </Frame>
  );
}

const SORT_TASKS = [
  { name: 'model.predict / transform', lib: 'scikit-learn, TensorFlow, PyTorch', use: true, command: 'await run_in_threadpool(model.predict, features)', reason: 'The call is synchronous and CPU-heavy. Offload it so the loop stays free.' },
  { name: 'pandas / numpy', lib: 'groupby, matrix math', use: true, command: 'await run_in_threadpool(heavy_prep, frame)', reason: 'Heavy in-memory work blocks the loop if it runs inside async def.' },
  { name: 'HTTP and database', lib: 'httpx, asyncpg', use: false, command: 'await client.get(url)', reason: 'Await the async library. A thread adds cost and skips the event loop.' },
  { name: 'already async def', lib: 'async def fetch_features', use: false, command: 'await fetch_features()', reason: 'Await it. That is already how a coroutine runs.' },
];

function ThreadpoolSorterVisualizer() {
  const [selected, setSelected] = useState(0);
  const current = SORT_TASKS[selected];
  return (
    <Frame title="What goes on a worker" hint="Open each workload.">
      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        {SORT_TASKS.map((task, idx) => (
          <button key={task.name} type="button" onClick={() => setSelected(idx)} className={`flex items-start justify-between rounded-xl border p-3 text-left ${selected === idx ? (task.use ? 'border-emerald-400 bg-emerald-500/10' : 'border-amber-400 bg-amber-500/10') : 'border-gray-800'}`}>
            <span>
              <span className="block text-[12px] text-white">{task.name}</span>
              <span className="text-[10px] text-gray-400">{task.lib}</span>
            </span>
            {task.use ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <XCircle className="h-4 w-4 text-amber-300" />}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-800 p-3">
        <p className={`font-mono text-[11px] ${current.use ? 'text-emerald-200' : 'text-rose-200'}`}>{current.use ? 'use run_in_threadpool' : 'await it directly'}</p>
        <p className="mt-2 text-[12px] text-gray-200">{current.reason}</p>
        <p className="mt-3 rounded-lg bg-black/40 px-3 py-2 font-mono text-[11px] text-cyan-100">{current.command}</p>
      </div>
    </Frame>
  );
}

export function AsyncDefVisualizer() {
  return <WaiterComparisonVisualizer />;
}
export function RoutePauseVisualizer() {
  return <RoutePauseAnimator />;
}
export function EventLoopVisualizer() {
  return <EventLoopOrbitalVisualizer />;
}
export function TenStepVisualizer() {
  return <TenStepStepperVisualizer />;
}
export function AsyncRaceVisualizer() {
  return <AsyncVsSyncRaceVisualizer />;
}
export function IOBoundVisualizer() {
  return <IOBoundTimelineVisualizer />;
}
export function SyncThreadpoolVisualizer() {
  return <DefThreadpoolRouterVisualizer />;
}
export function GilVisualizer() {
  return <GilCpuVsIoVisualizer />;
}
export function MLLifecycleVisualizer() {
  return <MlLifecycleConveyorVisualizer />;
}
export function ParallelIOVisualizer() {
  return <ForkJoinTrapVisualizer />;
}
export function BlockingPredictVisualizer() {
  return <ThreadpoolOffloadSim startOn={false} />;
}
const POOL_NOTES = [
  'A request arrives. Both paths start the same way.',
  'The async route starts. Nothing is blocked yet.',
  'The solution awaits run_in_threadpool. The problem calls model.predict() on the loop.',
  'run_in_threadpool yields and offloads predict to a worker, so the loop stays free. The direct call holds the loop.',
  'The worker finishes and the result comes back. The blocking path is still waiting.',
  'Both send a response. The blocking response is late, because the loop could not serve anyone else.',
];

function flowPhase(step, from, to = from) {
  if (step < from) return 'wait';
  if (step > to) return 'done';
  return 'now';
}

function FlowPill({ label, sub, phase, tone }) {
  const palette = tone === 'rose'
    ? {
        now: 'border-rose-100 bg-rose-500/35 text-white ring-2 ring-rose-200',
        done: 'border-rose-300/60 bg-rose-500/15 text-rose-50',
        wait: 'border-rose-400/20 bg-black/25 text-rose-100/30',
      }
    : {
        now: 'border-emerald-100 bg-emerald-500/35 text-white ring-2 ring-emerald-200',
        done: 'border-emerald-300/60 bg-emerald-500/15 text-emerald-50',
        wait: 'border-emerald-400/20 bg-black/25 text-emerald-100/30',
      };
  return (
    <div className={`min-w-[7.5rem] max-w-[12rem] rounded-full border px-3 py-1.5 text-center ${palette[phase]}`}>
      <p className="text-[11px] font-semibold leading-tight">{label}</p>
      {sub ? <p className="mt-0.5 text-[10px] leading-tight opacity-80">{sub}</p> : null}
    </div>
  );
}

function FlowArrow({ phase, tone }) {
  const color = tone === 'rose' ? 'text-rose-200' : 'text-emerald-200';
  return <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${color} ${phase === 'wait' ? 'opacity-25' : 'opacity-90'}`} />;
}

function ThreadpoolFlowVisualizer() {
  const stepper = useStepper(POOL_NOTES.length, 1800);
  const step = stepper.index;
  const g = (from, to) => flowPhase(step, from, to);
  return (
    <Frame
      title="Offload predict, or block the loop"
      hint="Use Prev step and Next step. Green yields. Red holds the loop."
      footer={<StepControls stepper={stepper} total={POOL_NOTES.length} />}
    >
      <p className="mb-3 text-[12px] text-gray-200">{POOL_NOTES[step]}</p>
      <div className="rounded-2xl border border-emerald-400/50 bg-emerald-500/10 p-3">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-emerald-200">Using run_in_threadpool (solution)</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <FlowPill label="Request arrives" phase={g(0)} />
          <FlowArrow phase={g(1)} />
          <FlowPill label="Async route starts" phase={g(1)} />
          <FlowArrow phase={g(2)} />
          <FlowPill label="await run_in_threadpool" sub="predict_sync" phase={g(2)} />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className={`rounded-xl border p-2 ${step >= 3 ? 'border-emerald-300/50' : 'border-emerald-400/15'}`}>
            <p className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${step >= 3 ? 'text-emerald-200' : 'text-emerald-200/30'}`}>Yields control</p>
            <FlowPill label="Event loop free" sub="Handles other requests" phase={g(3, 4)} />
          </div>
          <div className={`rounded-xl border p-2 ${step >= 3 ? 'border-emerald-300/50' : 'border-emerald-400/15'}`}>
            <p className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${step >= 3 ? 'text-emerald-200' : 'text-emerald-200/30'}`}>Offloads work</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <FlowPill label="Thread pool executes" sub="predict_sync()" phase={g(3)} />
              <FlowArrow phase={g(4)} />
              <FlowPill label="Completes" phase={g(4)} />
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <FlowPill label="Result returns" phase={g(4)} />
          <FlowArrow phase={g(5)} />
          <FlowPill label="Response sent" phase={g(5)} />
        </div>
      </div>
      <div className="mt-3 rounded-2xl border border-rose-400/50 bg-rose-500/10 p-3">
        <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-rose-200">Direct blocking call (problem)</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <FlowPill tone="rose" label="Request arrives" phase={g(0)} />
          <FlowArrow tone="rose" phase={g(1)} />
          <FlowPill tone="rose" label="Async route starts" phase={g(1)} />
          <FlowArrow tone="rose" phase={g(2)} />
          <FlowPill tone="rose" label="model.predict()" sub="Blocks event loop" phase={g(2, 4)} />
          <FlowArrow tone="rose" phase={g(3)} />
          <FlowPill tone="rose" label="Event loop waits" sub="Other requests blocked" phase={g(3, 4)} />
          <FlowArrow tone="rose" phase={g(5)} />
          <FlowPill tone="rose" label="Response sent" sub="Delayed" phase={g(5)} />
        </div>
      </div>
    </Frame>
  );
}

export function ThreadpoolStepsVisualizer() {
  return <ThreadpoolFlowVisualizer />;
}
export function WhenThreadpoolVisualizer() {
  return <ThreadpoolSorterVisualizer />;
}
