import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  HardDrive,
  CheckCircle2,
  XCircle,
  Layers,
  Server,
  Send,
  FileText,
  Bell,
  BarChart3,
  RefreshCw,
  GitBranch,
  ShieldAlert,
} from 'lucide-react';

function Shell({ children }) {
  return <div className="flex h-full min-h-0 flex-col gap-3 overflow-auto px-3 pb-3 pt-10">{children}</div>;
}

function playButton(playing, onToggle, onReset) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={onToggle} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500">
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {playing ? 'Pause' : 'Play'}
      </button>
      <button type="button" onClick={onReset} className="rounded-lg bg-gray-800 p-1.5 text-gray-200 hover:bg-gray-700">
        <RotateCcw className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function PostOfficeVisualizer() {
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setTick((prev) => (prev >= 99 ? 0 : prev + 1)), 70);
    return () => clearInterval(id);
  }, [playing]);

  const inlinePhase = tick < 30 ? 'predicting' : tick < 75 ? 'blocking_log' : 'receipt_sent';
  const clientHasReceipt = tick >= 30;
  const bgRunning = tick >= 30 && tick < 75;

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-800 bg-gray-900/90 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-200">Receipt first. Paperwork after.</span>
        {playButton(playing, () => setPlaying((v) => !v), () => { setPlaying(false); setTick(0); })}
      </div>
      <input
        type="range"
        min="0"
        max="99"
        value={tick}
        onChange={(e) => { setPlaying(false); setTick(Number(e.target.value)); }}
        className="w-full accent-teal-400"
      />

      <div className="space-y-3 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full border border-rose-500/30 bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase text-rose-200">Log before the response</span>
            <p className="mt-1.5 text-sm font-semibold text-white">The client stays at the counter while the log is written.</p>
          </div>
          <div className="text-right font-mono">
            <p className="text-[11px] text-gray-400">Client wait</p>
            <p className="text-base font-bold text-rose-300">750 ms</p>
          </div>
        </div>
        <div className="flex h-11 items-center gap-1 overflow-hidden rounded-xl border border-gray-800 bg-gray-950 p-1">
          <div className="flex h-full items-center justify-center rounded-lg bg-teal-500/80 text-[11px] font-bold text-gray-950" style={{ width: `${Math.min(tick, 30)}%` }}>
            {tick >= 10 ? '1. Predict' : ''}
          </div>
          {tick > 30 && (
            <div className="flex h-full items-center justify-center rounded-lg bg-rose-500/80 text-[11px] font-bold text-white" style={{ width: `${Math.min(tick - 30, 45)}%` }}>
              {tick >= 48 ? '2. Stuck on the file log' : ''}
            </div>
          )}
          {inlinePhase === 'receipt_sent' && (
            <span className="ml-auto mr-1 rounded bg-emerald-400 px-2 py-1 font-mono text-[11px] font-bold text-gray-950">Receipt, late</span>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold uppercase text-emerald-200">BackgroundTasks</span>
            <p className="mt-1.5 text-sm font-semibold text-white">The receipt leaves. The log is written after the client is gone.</p>
          </div>
          <div className="text-right font-mono">
            <p className="text-[11px] text-gray-400">Client wait</p>
            <p className="text-base font-bold text-emerald-300">300 ms</p>
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between font-mono text-[11px] text-gray-300">
            <span>Client lane</span>
            <span className="text-emerald-300">{clientHasReceipt ? 'HTTP 200 already delivered' : 'Waiting for the prediction'}</span>
          </div>
          <div className="flex h-9 items-center gap-2 rounded-xl border border-gray-800 bg-gray-950 p-1">
            <div className="flex h-full items-center justify-center rounded-lg bg-emerald-400 text-[11px] font-bold text-gray-950" style={{ width: `${Math.min(tick, 30)}%` }}>
              {tick >= 10 ? '1. Predict' : ''}
            </div>
            {clientHasReceipt && <span className="rounded border border-emerald-400 bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-200">200 sent</span>}
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between font-mono text-[11px] text-gray-400">
            <span>Background lane</span>
            <span className="text-cyan-300">
              {tick < 30 ? 'add_task has it queued' : bgRunning ? 'Writing the log' : 'Log saved'}
            </span>
          </div>
          <div className="flex h-8 items-center rounded-xl border border-gray-800 bg-gray-950 p-1">
            <div className="h-full w-[30%] border-r border-dashed border-gray-700" />
            {tick > 30 && (
              <div className="ml-1 flex h-full items-center justify-center rounded-lg bg-cyan-500/70 text-[10px] font-semibold text-white" style={{ width: `${Math.min(tick - 30, 45)}%` }}>
                {tick >= 48 ? 'Internal report' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

const LIFE = [
  { title: '1. Dependency injection', code: 'background_tasks: BackgroundTasks', desc: 'FastAPI injects a BackgroundTasks instance into the path operation.' },
  { title: '2. add_task()', code: 'background_tasks.add_task(log_fn, arg1, arg2)', desc: 'The function and its arguments are queued. They do not run yet.' },
  { title: '3. Send the response', code: 'return prediction_result', desc: 'The HTTP response leaves. The queued function is still waiting.' },
  { title: '4. Then the task runs', code: 'log_fn(arg1, arg2)', desc: 'After the response is out, an async function runs on the loop. A plain def runs in the thread pool.' },
];

export function BackgroundLifecycleVisualizer() {
  const [step, setStep] = useState(0);
  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-800 bg-gray-900/90 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-300">The response is not awaited on the task</span>
        <div className="flex gap-1.5">
          {LIFE.map((item, idx) => (
            <button key={item.title} type="button" onClick={() => setStep(idx)} className={`h-7 w-7 rounded-lg font-mono text-xs font-bold ${step === idx ? 'bg-teal-400 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>{idx + 1}</button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {LIFE.map((item, idx) => (
          <button key={item.title} type="button" onClick={() => setStep(idx)} className={`rounded-xl border p-4 text-left transition ${step === idx ? (idx === 2 ? 'border-emerald-300 bg-emerald-950/50' : 'border-cyan-300 bg-cyan-950/40') : 'border-gray-800 bg-gray-950/50 opacity-60'}`}>
            <p className="text-xs font-bold text-white">{item.title}</p>
            <code className="mt-2 block rounded-lg border border-gray-800 bg-gray-900 px-2.5 py-1.5 font-mono text-[11px] text-amber-200">{item.code}</code>
            <p className="mt-2 text-xs leading-relaxed text-gray-300">{item.desc}</p>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-950 p-4">
        <GitBranch className="h-5 w-5 shrink-0 text-teal-300" />
        <p className="text-[11px] text-gray-300">
          An <span className="font-mono text-cyan-300">async def</span> task runs on the event loop. A plain <span className="font-mono text-amber-200">def</span> task runs in the thread pool.
        </p>
      </div>
    </Shell>
  );
}

const SEND_STEPS = [
  'The endpoint is computing the prediction from the two lengths.',
  'The prediction is ready. add_task has queued the log. The client does not have it yet.',
  'The response is on its way. prediction_log.json has not been touched.',
  'The client already has the JSON. log_prediction_details writes the line now.',
];

export function PredictLogVisualizer() {
  const [sepalLength, setSepalLength] = useState(5.1);
  const [petalLength, setPetalLength] = useState(1.4);
  const [step, setStep] = useState(0);
  const [history, setHistory] = useState([
    '{"input": {"sepal_length": 4.9, "petal_length": 1.5}, "output": {"prediction": 5.12}, "timestamp": 1759517400.1}',
  ]);

  const predictionVal = Number(((sepalLength + petalLength) * 0.8).toFixed(2));
  const pendingLine = JSON.stringify({
    input: { sepal_length: Number(sepalLength.toFixed(1)), petal_length: Number(petalLength.toFixed(1)) },
    output: { prediction: predictionVal },
    timestamp: 1791055128.3,
  });
  const sent = step >= 3;
  const writing = step === 3;
  const logged = step === 4;

  const send = () => {
    if (step === 4) setHistory((prev) => [pendingLine, ...prev.slice(0, 2)]);
    setStep(1);
  };

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-800 bg-gray-900/90 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">POST /predict_log_later</span>
        <button type="button" onClick={send} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-400 px-3.5 py-1.5 text-xs font-bold text-gray-950 hover:bg-emerald-300">
          <Send className="h-3.5 w-3.5" />
          Send prediction request
        </button>
      </div>
      {step > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setStep((n) => Math.max(1, n - 1))} disabled={step <= 1} className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-100 disabled:opacity-30">Prev step</button>
          <span className="font-mono text-[11px] text-teal-200">{step} / 4</span>
          <button type="button" onClick={() => setStep((n) => Math.min(4, n + 1))} disabled={step >= 4} className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30">Next step</button>
          {[1, 2, 3, 4].map((n) => (
            <button key={n} type="button" onClick={() => setStep(n)} className={`h-7 w-7 rounded-lg font-mono text-xs font-bold ${step === n ? 'bg-teal-400 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>{n}</button>
          ))}
        </div>
      )}
      {step > 0 && <p className="text-[12px] text-gray-200">{SEND_STEPS[step - 1]}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="font-mono text-[11px] uppercase text-teal-200">FeaturesInput</p>
          <label className="block text-xs text-gray-400">
            <span className="mb-1 flex justify-between">sepal_length <span className="font-mono text-white">{sepalLength.toFixed(1)}</span></span>
            <input type="range" min="4" max="7.5" step="0.1" value={sepalLength} onChange={(e) => setSepalLength(parseFloat(e.target.value))} className="w-full accent-teal-400" />
          </label>
          <label className="block text-xs text-gray-400">
            <span className="mb-1 flex justify-between">petal_length <span className="font-mono text-white">{petalLength.toFixed(1)}</span></span>
            <input type="range" min="1" max="6.5" step="0.1" value={petalLength} onChange={(e) => setPetalLength(parseFloat(e.target.value))} className="w-full accent-teal-400" />
          </label>
        </div>
        <div className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 ${sent ? 'border-emerald-300 bg-emerald-950/40' : 'border-gray-800 bg-gray-900/60'}`}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase text-emerald-200">Client response</p>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-right font-mono text-[10px] text-emerald-200">
              {step === 0 && 'Ready'}
              {step === 1 && 'Computing'}
              {step === 2 && 'Queued, not sent'}
              {step >= 3 && 'Sent before the file write'}
            </span>
          </div>
          <p className="rounded-xl border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-emerald-200">{step >= 2 ? `{"prediction": ${predictionVal}}` : '…'}</p>
          <p className="text-[11px] text-gray-400">
            {step >= 3 ? 'The client already has 200. The file write comes after.' : step === 2 ? 'add_task is queued. return has not happened.' : 'Send a request, then step through it.'}
          </p>
        </div>
      </div>
      <div className={`rounded-2xl border p-4 ${writing ? 'border-amber-300 bg-amber-950/20' : 'border-gray-800 bg-gray-900/60'}`}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] font-bold text-white"><FileText className="h-4 w-4 text-amber-300" /> prediction_log.json</p>
          <span className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold ${writing ? 'bg-amber-400 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>
            {logged ? 'Line written after the response' : writing ? 'About to write. The client already left.' : 'Idle until after the response'}
          </span>
        </div>
        <div className="max-h-36 space-y-1.5 overflow-auto rounded-xl border border-gray-800 bg-gray-950 p-3 font-mono text-[10px]">
          {logged && <p className="rounded border border-emerald-500/30 bg-emerald-500/15 p-1.5 text-emerald-200">{pendingLine}</p>}
          {history.map((line) => (
            <p key={line} className="rounded p-1.5 text-gray-400">{line}</p>
          ))}
        </div>
      </div>
    </Shell>
  );
}

const USES = [
  { title: 'Detailed logging', icon: FileText, target: 'prediction_log.json', payload: 'input features, prediction, timestamp', benefit: 'The file write stays off the client’s wait.' },
  { title: 'Notifications', icon: Bell, target: 'Slack / email', payload: 'high-risk prediction detected', benefit: 'A slow webhook does not hold the prediction response.' },
  { title: 'Monitoring', icon: BarChart3, target: 'dashboard', payload: 'latency, input distribution, model stats', benefit: 'The metric push happens after the 200.' },
  { title: 'Cache updates', icon: RefreshCw, target: 'related cache key', payload: 'invalidate or refresh an entry', benefit: 'The current caller does not wait on the cache.' },
  { title: 'Queue a workflow', icon: Layers, target: 'RabbitMQ / Kafka', payload: 'start a downstream batch from this prediction', benefit: 'Heavier work leaves this process.' },
];

export function BackgroundUsesVisualizer() {
  const [selected, setSelected] = useState(0);
  const current = USES[selected];
  const Icon = current.icon;
  return (
    <Shell>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {USES.map((item, idx) => {
          const ItemIcon = item.icon;
          return (
            <button key={item.title} type="button" onClick={() => setSelected(idx)} className={`rounded-xl border p-3 text-left ${selected === idx ? 'border-teal-300 bg-teal-500/20 text-white' : 'border-gray-800 bg-gray-900/70 text-gray-400'}`}>
              <ItemIcon className={`mb-1.5 h-4 w-4 ${selected === idx ? 'text-teal-200' : 'text-gray-500'}`} />
              <p className="text-[11px] font-bold leading-tight">{item.title}</p>
            </button>
          );
        })}
      </div>
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px]">
          <span className="rounded bg-emerald-500/20 px-2 py-1 font-bold text-emerald-200">1. HTTP 200 to the client</span>
          <span className="text-gray-500">→</span>
          <span className="rounded bg-cyan-500/20 px-2 py-1 font-bold text-cyan-200">2. This task fires</span>
        </div>
        <div className="mt-3 rounded-2xl border border-teal-500/30 bg-gray-950 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-400/40 bg-teal-500/15 text-teal-200"><Icon className="h-5 w-5" /></div>
            <div>
              <p className="text-sm font-bold text-white">{current.title}</p>
              <p className="font-mono text-[11px] text-cyan-200">{current.target}</p>
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-gray-800 bg-black/30 p-3 font-mono text-xs text-gray-200">{current.payload}</p>
          <p className="mt-3 flex items-start gap-2 text-xs text-emerald-200"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{current.benefit}</p>
        </div>
      </div>
    </Shell>
  );
}

const LIMITS = {
  crash: {
    title: 'No guaranteed execution',
    badge: 'Same process',
    problem: 'The task lives in this FastAPI process. A crash or restart before it finishes drops the task.',
    left: 'In-process task disappears with the process',
    right: 'Celery or Redis Queue still has the job',
    practice: 'Use Celery or RQ when the work must finish.',
  },
  error: {
    title: 'Errors stay inside the task',
    badge: 'try...except',
    problem: 'The client already has the response. An exception in the task does not become their HTTP error.',
    left: 'Client holds 200',
    right: 'try / except logs the failure inside the task',
    practice: 'Catch and log inside the background function.',
  },
  resources: {
    title: 'The CPU is still shared',
    badge: 'Same machine',
    problem: 'A heavy background job, such as retraining, uses the same CPU and memory as the next prediction.',
    left: 'Heavy task fills the CPU. The next /predict waits.',
    right: 'A separate worker keeps the API process free.',
    practice: 'Keep these tasks light. Move retraining off this process.',
  },
};

export function BackgroundLimitsVisualizer() {
  const [active, setActive] = useState('crash');
  const current = LIMITS[active];
  return (
    <Shell>
      <div className="grid grid-cols-3 gap-2">
        {[
          ['crash', '1. No guarantee'],
          ['error', '2. Silent to the client'],
          ['resources', '3. Shared CPU'],
        ].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActive(key)} className={`rounded-xl border p-3 text-left text-xs font-bold ${active === key ? 'border-rose-300 bg-rose-500/20 text-white' : 'border-gray-800 bg-gray-900/70 text-gray-400'}`}>
            <ShieldAlert className={`mb-1 h-4 w-4 ${active === key ? 'text-rose-300' : 'text-gray-500'}`} />
            {label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-white">{current.title}</p>
          <span className="rounded-full border border-rose-400/40 bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] text-rose-200">{current.badge}</span>
        </div>
        <p className="text-xs leading-relaxed text-gray-300">{current.problem}</p>
        <div className="mt-3 space-y-2">
          <p className="flex items-start gap-2 rounded-xl border border-rose-400/40 bg-rose-950/40 p-3 font-mono text-[11px] text-rose-100"><XCircle className="mt-0.5 h-4 w-4 shrink-0" />{current.left}</p>
          <p className="flex items-start gap-2 rounded-xl border border-emerald-400/40 bg-emerald-950/40 p-3 font-mono text-[11px] text-emerald-100"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{current.right}</p>
        </div>
        <p className="mt-3 rounded-xl border border-gray-800 bg-gray-950 p-3 text-xs text-gray-300">{current.practice}</p>
      </div>
    </Shell>
  );
}

export function SyncAsyncWorkerVisualizer() {
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setTick((prev) => (prev >= 99 ? 0 : prev + 1)), 75);
    return () => clearInterval(id);
  }, [playing]);

  const cell = (on, label, extra = '') => (
    <div className={`whitespace-pre-line rounded-lg border p-2 text-center font-mono text-[10px] leading-tight ${on ? extra || 'border-sky-300 bg-sky-500/30 text-white' : 'border-gray-800 bg-gray-950 text-gray-500'}`}>{label}</div>
  );

  return (
    <Shell>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-800 bg-gray-900/90 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-200">One worker. Two requests.</span>
        {playButton(playing, () => setPlaying((v) => !v), () => { setPlaying(false); setTick(0); })}
      </div>
      <input type="range" min="0" max="99" value={tick} onChange={(e) => { setPlaying(false); setTick(Number(e.target.value)); }} className="w-full accent-teal-400" />

      <div className="space-y-3 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-200">Synchronous worker</p>
          <span className="font-mono text-[11px] text-amber-300">{tick >= 92 ? 'Both done at the end of the clock' : 'One wait at a time'}</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {cell(tick >= 5, 'Req 1\nneeds DB')}
          {cell(tick >= 18, 'Waiting DB', tick >= 18 && tick < 40 ? 'border-rose-300 bg-rose-500/40 text-white' : tick >= 40 ? 'border-rose-500/30 bg-rose-950/40 text-rose-200' : '')}
          {cell(tick >= 40, 'Process 1', tick >= 40 ? 'border-emerald-300 bg-emerald-500/30 text-white' : '')}
          {cell(tick >= 52, 'Req 2\nneeds API')}
          {cell(tick >= 64, 'Waiting API', tick >= 64 && tick < 85 ? 'border-rose-300 bg-rose-500/40 text-white' : tick >= 85 ? 'border-rose-500/30 bg-rose-950/40 text-rose-200' : '')}
          {cell(tick >= 85, 'Process 2', tick >= 85 ? 'border-emerald-300 bg-emerald-500/30 text-white' : '')}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">Asynchronous worker</p>
          <span className="font-mono text-[11px] text-emerald-300">{tick >= 52 ? 'Both finished while sync is still in the second wait' : 'The two waits overlap'}</span>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {cell(tick >= 5, 'Req 1\nneeds DB')}
          <div className={`col-span-2 rounded-lg border p-2 text-center font-mono text-[10px] ${tick >= 12 && tick < 38 ? 'border-amber-300 bg-amber-500/30 text-amber-50' : tick >= 38 ? 'border-amber-500/30 bg-amber-950/30 text-amber-200' : 'border-gray-800 bg-gray-950 text-gray-500'}`}>await DB · loop is free</div>
          {cell(tick >= 38, 'Process 1', tick >= 38 ? 'border-emerald-300 bg-emerald-500/40 text-white' : '')}
          <div className="col-span-2" />
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {cell(tick >= 8, 'Req 2\nneeds API')}
          <div className={`col-span-2 rounded-lg border p-2 text-center font-mono text-[10px] ${tick >= 15 && tick < 42 ? 'border-amber-300 bg-amber-500/30 text-amber-50' : tick >= 42 ? 'border-amber-500/30 bg-amber-950/30 text-amber-200' : 'border-gray-800 bg-gray-950 text-gray-500'}`}>await API · same time</div>
          {cell(tick >= 44, 'Process 2', tick >= 44 ? 'border-emerald-300 bg-emerald-500/40 text-white' : '')}
          <div className="col-span-2 flex items-center justify-center font-mono text-[10px] text-gray-400">{tick >= 50 ? 'worker can take request 3' : ''}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/90 p-3 text-[11px]">
        <span className="text-gray-400">Libraries</span>
        <span className="rounded border border-cyan-500/30 bg-cyan-500/15 px-2 py-0.5 font-mono text-cyan-200">httpx</span>
        <span className="rounded border border-teal-500/30 bg-teal-500/15 px-2 py-0.5 font-mono text-teal-200">asyncpg / databases</span>
        <span className="rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-emerald-200">aiofiles</span>
      </div>
    </Shell>
  );
}

export function FourBenefitsVisualizer() {
  const [users, setUsers] = useState(25);
  const syncLatency = Math.round(180 + users * 95);
  const asyncLatency = Math.round(180 + users * 12);
  const syncThroughput = Math.min(10, users);
  const asyncThroughput = Math.min(85, Math.round(users * 1.6));
  return (
    <Shell>
      <div className="rounded-xl border border-gray-800 bg-gray-900/90 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-200">Concurrent requests</span>
          <span className="font-mono text-sm font-bold text-cyan-300">{users}</span>
        </div>
        <input type="range" min="1" max="50" value={users} onChange={(e) => setUsers(Number(e.target.value))} className="w-full accent-teal-400" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-[11px] font-bold uppercase text-cyan-300">1. Concurrency</p>
          <p className="mt-1 text-[11px] text-gray-400">Waits stay in flight together.</p>
          <p className="mt-3 border-t border-gray-800 pt-2 font-mono text-lg font-bold text-cyan-300">{users} in flight</p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-[11px] font-bold uppercase text-emerald-300">2. Throughput</p>
          <p className="mt-1 text-[11px] text-gray-400">More finished work in the same second.</p>
          <p className="mt-3 border-t border-gray-800 pt-2 font-mono text-sm text-gray-300">Sync {syncThroughput}/s <span className="ml-2 text-lg font-bold text-emerald-300">Async {asyncThroughput}/s</span></p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-[11px] font-bold uppercase text-amber-300">3. Latency under load</p>
          <p className="mt-1 text-[11px] text-gray-400">Requests are not lined up behind a blocked wait.</p>
          <p className="mt-3 border-t border-gray-800 pt-2 font-mono text-sm"><span className="text-rose-300">Sync {syncLatency} ms</span> <span className="ml-2 text-lg font-bold text-amber-200">Async {asyncLatency} ms</span></p>
        </div>
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
          <p className="text-[11px] font-bold uppercase text-teal-200">4. CPU use</p>
          <p className="mt-1 text-[11px] text-gray-400">The CPU works on ready requests during a wait.</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/40">
            <div className="h-full rounded-full bg-teal-400" style={{ width: `${Math.min(100, 20 + users)}%` }} />
          </div>
        </div>
      </div>
      <p className="rounded-xl border border-teal-500/30 bg-teal-950/30 p-3 text-xs text-teal-100">
        await the surrounding I/O. run_in_threadpool still carries the CPU inference.
      </p>
    </Shell>
  );
}

export function ModelLoadVisualizer() {
  const [strategy, setStrategy] = useState('startup');
  const startup = strategy === 'startup';
  return (
    <Shell>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setStrategy('startup')} className={`rounded-xl border p-3 text-left ${startup ? 'border-emerald-300 bg-emerald-500/20 text-white' : 'border-gray-800 text-gray-400'}`}>
          <p className="text-[11px] font-bold uppercase text-emerald-200">Startup load</p>
          <p className="mt-1 text-[11px]">Pay during boot. First request is short.</p>
        </button>
        <button type="button" onClick={() => setStrategy('on_demand')} className={`rounded-xl border p-3 text-left ${!startup ? 'border-amber-300 bg-amber-500/20 text-white' : 'border-gray-800 text-gray-400'}`}>
          <p className="text-[11px] font-bold uppercase text-amber-200">On demand</p>
          <p className="mt-1 text-[11px]">Boot is short. Request 1 pays for the load.</p>
        </button>
      </div>
      <div className="space-y-3 rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <Meter label="Server startup" value={startup ? '3,200 ms · model enters RAM' : '120 ms · RAM still empty'} width={startup ? '75%' : '8%'} color={startup ? 'bg-amber-400' : 'bg-emerald-400'} />
        <Meter label="Request 1" value={startup ? '45 ms · model is already resident' : '3,245 ms · this user waits on the load'} width={startup ? '10%' : '100%'} color={startup ? 'bg-emerald-400' : 'bg-rose-400'} />
        <Meter label="Requests 2, 3, 4" value="45 ms · warm" width="10%" color="bg-emerald-400" />
        <p className="flex items-start gap-2 rounded-xl border border-gray-800 bg-gray-950 p-3 text-[11px] text-gray-300">
          <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          The process needs enough RAM for the model, or the machine starts swapping.
        </p>
      </div>
    </Shell>
  );
}

function Meter({ label, value, width, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 font-mono text-[11px]">
        <span className="text-gray-300">{label}</span>
        <span className="text-right text-gray-200">{value}</span>
      </div>
      <div className="h-6 rounded-lg border border-gray-800 bg-gray-950 p-1">
        <div className={`h-full rounded ${color}`} style={{ width }} />
      </div>
    </div>
  );
}

export function BatchHardwareVisualizer() {
  const [batching, setBatching] = useState(true);
  const [gpu, setGpu] = useState(true);
  const single = gpu ? 25 : 90;
  const total = batching ? Math.round(single * 1.4) : single * 4;
  return (
    <Shell>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-3">
          <p className="mb-1.5 font-mono text-[10px] uppercase text-gray-400">Execution</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button type="button" onClick={() => setBatching(false)} className={`rounded-lg py-1.5 text-xs font-bold ${!batching ? 'bg-amber-400 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>One by one</button>
            <button type="button" onClick={() => setBatching(true)} className={`rounded-lg py-1.5 text-xs font-bold ${batching ? 'bg-emerald-400 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>Batch of 4</button>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-3">
          <p className="mb-1.5 font-mono text-[10px] uppercase text-gray-400">Hardware</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button type="button" onClick={() => setGpu(false)} className={`rounded-lg py-1.5 text-xs font-bold ${!gpu ? 'bg-teal-500 text-white' : 'bg-gray-800 text-gray-400'}`}>CPU</button>
            <button type="button" onClick={() => setGpu(true)} className={`rounded-lg py-1.5 text-xs font-bold ${gpu ? 'bg-cyan-300 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>GPU / TPU</button>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[11px] font-bold uppercase text-cyan-200">{batching ? 'Four samples, one forward pass' : 'Four separate predict calls'}</p>
          <p className="font-mono text-lg font-bold text-emerald-300">{total} ms</p>
        </div>
        {batching ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-950/30 p-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-300 bg-emerald-500/20 font-mono text-[11px] font-bold text-emerald-100">#{n}</div>
            ))}
            <span className="font-mono text-[11px] text-emerald-200">one matrix pass · {total} ms</span>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center gap-2 font-mono text-[11px]">
                <span className="w-14 text-gray-400">#{n}</span>
                <div className="h-6 flex-1 rounded-lg border border-gray-800 bg-gray-950 p-1">
                  <div className="flex h-full items-center justify-center rounded bg-amber-400/80 text-[10px] font-bold text-gray-950" style={{ width: '22%', marginLeft: `${(n - 1) * 22}%` }}>{single} ms</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

export function ScalingPayloadVisualizer() {
  const [workers, setWorkers] = useState(4);
  const [compact, setCompact] = useState(true);
  const transfer = compact ? 18 : 115;
  return (
    <Shell>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-900/90 p-3">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-semibold text-teal-200">Uvicorn workers</span>
            <span className="font-mono font-bold text-white">{workers}</span>
          </div>
          <input type="range" min="1" max="4" value={workers} onChange={(e) => setWorkers(Number(e.target.value))} className="w-full accent-teal-400" />
          <p className="mt-1 font-mono text-[10px] text-gray-400">Each worker has its own loop and thread pool</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/90 p-3">
          <p className="mb-1.5 text-xs font-semibold text-cyan-200">Payload</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button type="button" onClick={() => setCompact(false)} className={`rounded-lg py-1.5 text-[11px] font-bold ${!compact ? 'bg-rose-500 text-white' : 'bg-gray-800 text-gray-400'}`}>Large base64</button>
            <button type="button" onClick={() => setCompact(true)} className={`rounded-lg py-1.5 text-[11px] font-bold ${compact ? 'bg-emerald-400 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>Compact JSON</button>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase text-white">Gunicorn · {workers} Uvicorn {workers === 1 ? 'worker' : 'workers'}</p>
          <span className="font-mono text-[11px] text-emerald-300">~{workers * 45} req/s</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((n) => {
            const on = n <= workers;
            return (
              <div key={n} className={`rounded-xl border p-3 ${on ? 'border-teal-400/50 bg-teal-950/40 text-white' : 'border-gray-800 text-gray-600 opacity-50'}`}>
                <div className="flex items-center justify-between font-mono text-[11px] font-bold">
                  <span className="inline-flex items-center gap-1"><Server className="h-3.5 w-3.5" /> Worker {n}</span>
                  <span className={on ? 'text-emerald-300' : ''}>{on ? 'online' : 'offline'}</span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-gray-300">1 event loop + thread pool</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 flex items-center justify-between rounded-xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px]">
          <span className="text-gray-300">Network + JSON</span>
          <span className={compact ? 'font-bold text-emerald-300' : 'font-bold text-rose-300'}>{transfer} ms</span>
        </p>
      </div>
    </Shell>
  );
}

const BANDS = [
  { id: 'network', name: 'Network', base: 60, color: 'bg-gray-400', tip: 'Transit time. Smaller payloads and a closer region shrink this.' },
  { id: 'ser_in', name: 'Serialization in and validation', base: 15, color: 'bg-sky-300', tip: 'Pydantic reads the JSON and checks the schema.' },
  { id: 'preprocess', name: 'Preprocessing', base: 40, color: 'bg-blue-500', tip: 'Await the feature fetch. A heavy transform can use run_in_threadpool.' },
  { id: 'inference', name: 'Model inference', base: 150, color: 'bg-rose-400', tip: 'The tall band. Offload it, batch it, or move it to a GPU. The time is still real.' },
  { id: 'postprocess', name: 'Postprocessing', base: 20, color: 'bg-cyan-400', tip: 'Formatting and logging. A log that the client does not need can be a background task.' },
  { id: 'ser_out', name: 'Serialization out', base: 15, color: 'bg-teal-200', tip: 'The response model becomes JSON bytes.' },
];

export function LatencyStackVisualizer() {
  const [selected, setSelected] = useState('inference');
  const [optimizeIO, setOptimizeIO] = useState(false);
  const [optimizeModel, setOptimizeModel] = useState(false);
  const [deferPost, setDeferPost] = useState(false);

  const layers = BANDS.map((band) => {
    let ms = band.base;
    if (optimizeIO && (band.id === 'network' || band.id === 'preprocess')) ms = band.id === 'network' ? 35 : 18;
    if (optimizeModel && band.id === 'inference') ms = 65;
    if (deferPost && band.id === 'postprocess') ms = 4;
    return { ...band, ms };
  });
  const total = layers.reduce((sum, band) => sum + band.ms, 0);
  const active = layers.find((band) => band.id === selected);

  return (
    <Shell>
      <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/90 px-4 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-200">Click a band</span>
        <span className="font-mono text-sm font-bold text-emerald-300">{total} ms</span>
      </div>
      <div className="grid items-stretch gap-4 md:grid-cols-12">
        <div className="flex h-64 items-end gap-3 rounded-xl border border-gray-800 bg-gray-950 p-4 md:col-span-7">
          <div className="flex h-full flex-col justify-between border-r border-gray-800 pr-2 font-mono text-[11px] text-gray-400">
            <span>300</span><span>200</span><span>100</span><span>0</span>
          </div>
          <div className="flex h-full flex-1 flex-col items-center justify-end">
            <div className="flex w-36 flex-col overflow-hidden rounded-lg border border-gray-700" style={{ height: `${(total / 300) * 100}%` }}>
              {layers.map((band) => (
                <button key={band.id} type="button" onClick={() => setSelected(band.id)} className={`${band.color} ${selected === band.id ? 'ring-2 ring-white' : ''}`} style={{ height: `${(band.ms / total) * 100}%` }} />
              ))}
            </div>
            <span className="mt-2 font-mono text-[11px] text-gray-300">One request</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:col-span-5">
          {layers.map((band) => (
            <button key={band.id} type="button" onClick={() => setSelected(band.id)} className={`flex items-center justify-between rounded-lg border px-2 py-1.5 text-left text-[11px] ${selected === band.id ? 'border-white/40 bg-gray-800 text-white' : 'border-gray-800 text-gray-400'}`}>
              <span className="flex items-center gap-2"><span className={`h-3 w-3 rounded-sm ${band.color}`} />{band.name}</span>
              <span className="font-mono">{band.ms}</span>
            </button>
          ))}
          <div className="space-y-1.5 rounded-xl border border-gray-800 bg-gray-950 p-3 text-xs text-gray-300">
            <label className="flex items-center gap-2"><input type="checkbox" checked={optimizeIO} onChange={(e) => setOptimizeIO(e.target.checked)} className="accent-teal-400" /> Async I/O and a smaller payload</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={optimizeModel} onChange={(e) => setOptimizeModel(e.target.checked)} className="accent-rose-400" /> Batch or GPU on inference</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={deferPost} onChange={(e) => setDeferPost(e.target.checked)} className="accent-emerald-400" /> Log after the response</label>
          </div>
        </div>
      </div>
      <p className="rounded-xl border border-gray-800 bg-gray-950 p-3 text-xs text-gray-300">
        <span className="font-semibold text-white">{active.name} · {active.ms} ms. </span>
        {active.tip}
      </p>
    </Shell>
  );
}
