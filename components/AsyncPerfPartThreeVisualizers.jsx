import React, { useState } from 'react';
import { Server, Cpu, Clock } from 'lucide-react';

function Shell({ children }) {
  return <div className="flex h-full min-h-0 flex-col gap-3 overflow-auto px-3 pb-3 pt-10">{children}</div>;
}

function Steps({ step, total, notes, onPick }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onPick(step - 1)} disabled={step === 0} className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-100 disabled:opacity-30">Prev step</button>
        <span className="font-mono text-[11px] text-teal-200">{step + 1} / {total}</span>
        <button type="button" onClick={() => onPick(step + 1)} disabled={step === total - 1} className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30">Next step</button>
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} type="button" onClick={() => onPick(i)} className={`h-7 w-7 rounded-lg font-mono text-xs font-bold ${step === i ? 'bg-teal-400 text-gray-950' : 'bg-gray-800 text-gray-400'}`}>{i + 1}</button>
        ))}
      </div>
      <p className="text-[12px] leading-relaxed text-gray-200">{notes[step]}</p>
    </div>
  );
}

function Lane({ label, state, tone }) {
  const box = tone === 'rose'
    ? 'border-rose-300 bg-rose-500/15 text-rose-50'
    : tone === 'amber'
      ? 'border-amber-300 bg-amber-500/15 text-amber-50'
      : tone === 'emerald'
        ? 'border-emerald-300 bg-emerald-500/15 text-emerald-50'
        : 'border-teal-300 bg-teal-500/15 text-teal-50';
  return (
    <div className={`rounded-xl border px-3 py-3 ${box}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="mt-1 text-sm font-semibold">{state}</p>
    </div>
  );
}

const SYNC_NOTES = [
  'Request A arrives. Request B is already in line.',
  'fetch_external_data calls time.sleep(0.5). This worker cannot touch B.',
  'run_model_prediction calls time.sleep(1). B is still in line.',
  'A’s response leaves after 1.5s. Only now can B start.',
];

export function SyncEndpointVisualizer() {
  const [step, setStep] = useState(0);
  const worker = ['idle', 'stuck in the fetch', 'stuck in predict', 'free for B'][step];
  const workerTone = step === 0 || step === 3 ? 'emerald' : 'rose';
  return (
    <Shell>
      <Steps step={step} total={4} notes={SYNC_NOTES} onPick={(n) => setStep(Math.min(3, Math.max(0, n)))} />
      <div className={`rounded-2xl border p-4 ${workerTone === 'rose' ? 'border-rose-400/50 bg-rose-950/30' : 'border-emerald-400/40 bg-emerald-950/20'}`}>
        <Server className={`mb-2 h-5 w-5 ${workerTone === 'rose' ? 'text-rose-200' : 'text-emerald-200'}`} />
        <p className="text-[11px] uppercase tracking-wider text-gray-400">One worker</p>
        <p className="text-sm font-semibold text-white">{worker}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/40">
          <div className={`h-full ${workerTone === 'rose' ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ width: ['8%', '35%', '85%', '100%'][step] }} />
        </div>
        <p className="mt-1 font-mono text-[10px] text-gray-400">{['0s', 'sleep 0.5', 'sleep 0.5 + sleep 1', '1.5s gone'][step]}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Lane label="Request A" tone={step === 3 ? 'emerald' : step === 0 ? 'teal' : 'rose'} state={['arrived', 'fetch_external_data', 'run_model_prediction', 'response sent'][step]} />
        <Lane label="Request B" tone={step === 3 ? 'teal' : 'amber'} state={step === 3 ? 'can start' : 'waiting'} />
      </div>
    </Shell>
  );
}

const IO_NOTES = [
  'await fetch_external_data_async. The sleep yields. Request B starts its own fetch.',
  'run_model_prediction() is called with no await and no thread pool. The loop stops. B freezes.',
];

export function AsyncIoTrapVisualizer() {
  const [step, setStep] = useState(0);
  const held = step === 1;
  return (
    <Shell>
      <Steps step={step} total={2} notes={IO_NOTES} onPick={(n) => setStep(Math.min(1, Math.max(0, n)))} />
      <div className={`rounded-2xl border p-4 ${held ? 'border-rose-400/50 bg-rose-950/30' : 'border-emerald-400/40 bg-emerald-950/20'}`}>
        <p className="text-[11px] uppercase tracking-wider text-gray-400">Event loop</p>
        <p className="text-sm font-semibold text-white">{held ? 'Held by time.sleep(1)' : 'Free during await asyncio.sleep(0.5)'}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Lane label="Request A" tone={held ? 'rose' : 'amber'} state={held ? 'run_model_prediction on the loop' : 'await fetch'} />
        <Lane label="Request B" tone={held ? 'rose' : 'teal'} state={held ? 'frozen' : 'also awaiting its fetch'} />
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-gray-800 px-3 py-2 text-[11px] text-gray-300">
        {held ? <Cpu className="h-4 w-4 text-rose-300" /> : <Clock className="h-4 w-4 text-amber-300" />}
        {held ? 'predict is still a blocking call' : 'only the fetch was awaited'}
      </div>
    </Shell>
  );
}

const POOL_NOTES = [
  'await fetch_external_data_async. The loop is free, so B keeps moving.',
  'await run_in_threadpool(run_model_prediction, 5.0). Predict runs on a worker thread. The loop stays free.',
  'The thread returns 10.0. The route resumes and builds PredictionResponse.',
];

export function ThreadpoolPredictVisualizer() {
  const [step, setStep] = useState(0);
  return (
    <Shell>
      <Steps step={step} total={3} notes={POOL_NOTES} onPick={(n) => setStep(Math.min(2, Math.max(0, n)))} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Lane label="Event loop" tone="emerald" state={step === 2 ? 'building the response' : 'free'} />
        <Lane label="Worker thread" tone={step === 1 ? 'amber' : step === 2 ? 'emerald' : 'teal'} state={['idle', 'time.sleep(1) · predict', 'returned 10.0'][step]} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Lane label="Request A" tone={step === 2 ? 'emerald' : 'teal'} state={['awaiting fetch', 'predict is off the loop', 'response ready'][step]} />
        <Lane label="Request B" tone="teal" state="still moving" />
      </div>
    </Shell>
  );
}

const CONSOLE = [
  { tag: 'route', text: 'Received prediction request with background task.' },
  { tag: 'fetch', text: 'Fetching external data async for item 123...' },
  { tag: 'pool', text: 'Starting model prediction (in thread pool)...' },
  { tag: 'route', text: 'Sending response (background task pending).' },
  { tag: 'bg', text: '--- Background Task Started ---' },
  { tag: 'bg', text: '--- Background Task Finished ---' },
];

const BG_NOTES = [
  'The route starts. Nothing is blocked yet.',
  'The fetch is awaited. The loop can serve someone else.',
  'Predict is on a worker thread. The loop is still free.',
  'The client receives the response. The log has not started.',
  'The background task starts. This print comes after “Sending response”.',
  'The background task finishes. The client already left at step 4.',
];

export function CombinedPipelineVisualizer() {
  const [step, setStep] = useState(0);
  const clientHasIt = step >= 3;
  return (
    <Shell>
      <Steps step={step} total={6} notes={BG_NOTES} onPick={(n) => setStep(Math.min(5, Math.max(0, n)))} />
      <div className={`rounded-2xl border p-3 ${clientHasIt ? 'border-emerald-300 bg-emerald-950/30' : 'border-gray-800'}`}>
        <p className="text-[10px] uppercase tracking-wider text-emerald-200">Client</p>
        <p className="mt-1 font-mono text-sm text-white">{clientHasIt ? '{ item_id: 123, prediction: 10.0 }' : '…'}</p>
      </div>
      <div className="rounded-2xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px]">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-500">Server console</p>
        <div className="space-y-1">
          {CONSOLE.map((line, i) => (
            <p key={line.text} className={i < step ? 'text-gray-500' : i === step ? (line.tag === 'bg' ? 'text-amber-200' : 'text-teal-100') : 'text-gray-700'}>
              {i <= step ? line.text : ''}
            </p>
          ))}
        </div>
      </div>
    </Shell>
  );
}
