import React, { useState } from 'react';
import { ChefHat, Server, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines } from './VisualKit';

/* ------------------------------------------------------------------ */
/* 1. Synchronous vs asynchronous — the chef                           */
/* ------------------------------------------------------------------ */

const CHEF_LABELS = {
  start: { kitchen: 'Start boiling water', server: 'Request 1: send the database query' },
  heat: { kitchen: 'Water heating on the stove', server: 'Database working on request 1' },
  cook: { kitchen: 'Cook the pasta', server: 'Request 1: build and send the response' },
  chop: { kitchen: 'Chop vegetables', server: 'Request 2: handle it' },
  toss: { kitchen: 'Toss the salad', server: 'Request 2: send the response' },
  idle: { kitchen: 'Stand and wait for the water', server: 'Idle — waiting on the database' },
};

const CHEF_TONE = {
  start: 'bg-amber-400/85',
  cook: 'bg-amber-400/85',
  chop: 'bg-emerald-400/80',
  toss: 'bg-emerald-400/80',
  idle: 'bg-gray-600/70',
  heat: 'bg-teal-500/60',
};

const CHEF_PLANS = {
  sync: {
    chef: [['start', 0, 1], ['idle', 1, 7], ['cook', 7, 9], ['chop', 9, 13], ['toss', 13, 14]],
    stove: [['heat', 1, 7]],
    done: [['first', 9], ['second', 14]],
  },
  async: {
    chef: [['start', 0, 1], ['chop', 1, 5], ['toss', 5, 6], ['idle', 6, 7], ['cook', 7, 9]],
    stove: [['heat', 1, 7]],
    done: [['second', 6], ['first', 9]],
  },
};

const CHEF_TIMES = [0, 1, 5, 6, 7, 9, 13, 14];
const CHEF_SCALE = 14;

const CHEF_INSIGHT = {
  kitchen: {
    0: 'Two orders arrive: pasta and a salad. Both chefs get the same orders, the same stove, and the same amount of work.',
    1: 'The water is on. It needs 6 minutes and no hands. The synchronous chef stands and waits. The asynchronous chef switches to the salad.',
    5: 'The asynchronous chef has chopped the vegetables while the water heated. The synchronous chef has done nothing since minute 1.',
    6: 'The salad is out at minute 6 from the asynchronous chef, who now has nothing to do until the water boils.',
    7: 'The water boils. Both chefs return to the pasta. The asynchronous chef resumes exactly where it left off.',
    9: 'The asynchronous chef is completely done at minute 9. The synchronous chef is only now starting the salad.',
    13: 'The synchronous chef is still finishing the salad.',
    14: 'The synchronous chef finishes at minute 14. Same work, same stove. The asynchronous chef simply never stood idle while something else was cooking.',
  },
  server: {
    0: 'Two requests arrive. Request 1 needs data from a database; request 2 needs only a little work.',
    1: 'Request 1’s query has been sent. The database needs 6 time units. A synchronous server waits with it. An asynchronous server switches to request 2.',
    5: 'The asynchronous server has handled request 2 while the database was busy. The synchronous server has been idle since t = 1.',
    6: 'Request 2 is answered at t = 6 by the asynchronous server. Nothing else is ready, so it waits for the database.',
    7: 'The database replies. Both servers continue request 1 from where it paused.',
    9: 'The asynchronous server has answered both requests by t = 9. The synchronous server has not even started request 2.',
    13: 'The synchronous server is still busy with request 2.',
    14: 'The synchronous server answers request 2 at t = 14 — it could not process it while it waited on the database.',
  },
};

function chefStatus(plan, t, terms) {
  const seg = plan.chef.find(([, s, e]) => s <= t && t < e);
  if (!seg) return terms === 'kitchen' ? 'All orders are out.' : 'Both requests answered.';
  return CHEF_LABELS[seg[0]][terms];
}

function ChefLane({ name, plan, t, terms }) {
  const pct = (v) => `${(v / CHEF_SCALE) * 100}%`;
  const handsBusy = plan.chef.filter(([k]) => k !== 'idle').reduce((sum, [, s, e]) => sum + (e - s), 0);
  const finish = Math.max(...plan.done.map(([, at]) => at));
  const orderName = (id) =>
    terms === 'kitchen' ? (id === 'first' ? 'pasta' : 'salad') : id === 'first' ? 'request 1' : 'request 2';

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950/60 p-3 space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white flex items-center gap-1.5">
          {terms === 'kitchen' ? <ChefHat className="w-4 h-4 text-amber-300" /> : <Server className="w-4 h-4 text-cyan-300" />}
          {name}
        </p>
        <p className="text-[10px] text-gray-400">
          done at {finish} · {terms === 'kitchen' ? 'hands' : 'worker'} busy {Math.round((handsBusy / finish) * 100)}%
        </p>
      </div>
      {[
        [terms === 'kitchen' ? 'Chef’s hands' : 'Server worker', plan.chef],
        [terms === 'kitchen' ? 'Stove' : 'Database', plan.stove],
      ].map(([label, segs]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-[10px] text-gray-400">{label}</span>
          <div className="relative flex-1 h-5 rounded bg-gray-900">
            {segs.map(([key, s, e]) => (
              <div
                key={`${key}-${s}`}
                title={CHEF_LABELS[key][terms]}
                className={`absolute inset-y-0.5 rounded-sm ${CHEF_TONE[key]} ${s <= t && t < e ? 'ring-2 ring-white' : ''}`}
                style={{ left: pct(s), width: pct(e - s) }}
              />
            ))}
            <div className="absolute -inset-y-1 w-0.5 bg-white/80 transition-all" style={{ left: pct(t) }} />
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <span className="w-24 shrink-0 text-[10px] text-gray-400">Served</span>
        <div className="relative flex-1 h-4">
          {plan.done.map(([id, at]) => (
            <span
              key={id}
              className={`absolute -translate-x-1/2 text-[9px] font-semibold whitespace-nowrap ${
                t >= at ? 'text-emerald-300' : 'text-gray-600'
              }`}
              style={{ left: pct(at) }}
            >
              ✓ {orderName(id)}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-gray-200">
        <span className="text-gray-500">Now: </span>
        {chefStatus(plan, t, terms)}
      </p>
    </div>
  );
}

export function ChefVisualizer() {
  const [terms, setTerms] = useState('kitchen');
  const stepper = useStepper(CHEF_TIMES.length, 1500);
  const t = CHEF_TIMES[stepper.index];

  return (
    <Frame
      title="One cook, two ways of working"
      hint="Step through time. The white line is “now”. Then flip to server terms — it is the same story."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(terms === 'kitchen')} onClick={() => setTerms('kitchen')}>
              Kitchen
            </button>
            <button type="button" className={tabClass(terms === 'server')} onClick={() => setTerms('server')}>
              Same thing, server terms
            </button>
          </div>
          <StepControls stepper={stepper} total={CHEF_TIMES.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Lesson title={terms === 'kitchen' ? `Minute ${t}` : `t = ${t}`}>{CHEF_INSIGHT[terms][t]}</Lesson>
        <ChefLane name={terms === 'kitchen' ? 'Synchronous chef' : 'Synchronous server'} plan={CHEF_PLANS.sync} t={t} terms={terms} />
        <ChefLane name={terms === 'kitchen' ? 'Asynchronous chef' : 'Asynchronous server'} plan={CHEF_PLANS.async} t={t} terms={terms} />
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400">
          <span className="inline-flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-amber-400/85" />{terms === 'kitchen' ? 'pasta work' : 'request 1 work'}</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-emerald-400/80" />{terms === 'kitchen' ? 'salad work' : 'request 2 work'}</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-teal-500/60" />{terms === 'kitchen' ? 'water heating (no hands needed)' : 'database working (no CPU needed)'}</span>
          <span className="inline-flex items-center gap-1"><span className="w-3 h-2 rounded-sm bg-gray-600/70" />idle</span>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Why waiting hurts a server                                        */
/* ------------------------------------------------------------------ */

const WAIT_SOURCES = {
  database: 'fetching user data from a database',
  service: 'calling another microservice',
  storage: 'loading model features from storage',
};

const WORK_MS = 20;

export function WaitingServerVisualizer() {
  const [count, setCount] = useState(4);
  const [wait, setWait] = useState(300);
  const [source, setSource] = useState('database');

  const sync = Array.from({ length: count }, (_, i) => {
    const start = i * (wait + WORK_MS);
    return { queue: [0, start], wait: [start, start + wait], work: [start + wait, start + wait + WORK_MS], done: start + wait + WORK_MS };
  });
  const asyncRows = Array.from({ length: count }, (_, i) => ({
    queue: [0, 0],
    wait: [0, wait],
    work: [wait + i * WORK_MS, wait + (i + 1) * WORK_MS],
    done: wait + (i + 1) * WORK_MS,
  }));
  const scale = sync[count - 1].done;
  const pct = (v) => `${(v / scale) * 100}%`;
  const avg = (rows) => Math.round(rows.reduce((sum, row) => sum + row.done, 0) / rows.length);
  const busy = (rows) => Math.round(((count * WORK_MS) / rows[rows.length - 1].done) * 100);

  const lanes = (title, rows, tone) => (
    <div className="rounded-xl border border-gray-700 bg-gray-950/60 p-3 space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-white">{title}</span>
        <span className="text-gray-400">last reply {rows[rows.length - 1].done} ms · average {avg(rows)} ms</span>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-[10px] font-mono text-gray-400">req {i + 1}</span>
          <div className="relative flex-1 h-3 rounded bg-gray-900">
            <div className="absolute inset-y-0 rounded-sm bg-gray-700/80" style={{ left: pct(row.queue[0]), width: pct(row.queue[1] - row.queue[0]) }} />
            <div className="absolute inset-y-0 rounded-sm bg-teal-500/60" style={{ left: pct(row.wait[0]), width: pct(row.wait[1] - row.wait[0]) }} />
            <div className={`absolute inset-y-0 rounded-sm ${tone}`} style={{ left: pct(row.work[0]), width: `max(3px, ${pct(row.work[1] - row.work[0])})` }} />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Frame
      title="What waiting costs a server under load"
      hint="Drag the sliders. Grey is a request stuck in line, teal is waiting on I/O, amber is real CPU work (20 ms each)."
    >
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3 rounded-xl border border-gray-700 p-3">
          <label className="text-[11px] text-gray-300">
            Requests arriving at once: <strong className="text-white">{count}</strong>
            <input type="range" min={1} max={8} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full accent-teal-500" />
          </label>
          <label className="text-[11px] text-gray-300">
            I/O wait per request: <strong className="text-white">{wait} ms</strong>
            <input type="range" min={100} max={600} step={50} value={wait} onChange={(e) => setWait(Number(e.target.value))} className="w-full accent-teal-500" />
          </label>
          <div className="sm:col-span-2 flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] text-gray-500">each request is</span>
            {Object.entries(WAIT_SOURCES).map(([id, label]) => (
              <button key={id} type="button" className={tabClass(source === id)} onClick={() => setSource(id)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <Lesson title="What the picture says">
          Each request spends {wait} ms {WAIT_SOURCES[source]} and only {WORK_MS} ms computing. The synchronous server cannot
          touch request 2 until request 1 is completely finished, so the waits add up: the last client waits{' '}
          <strong className="text-white">{sync[count - 1].done} ms</strong>. The asynchronous server starts every request’s
          I/O straight away and overlaps the waits: the last client waits{' '}
          <strong className="text-white">{asyncRows[count - 1].done} ms</strong>. Same CPU, same work — far more
          concurrency.
        </Lesson>

        {lanes('Synchronous — one thing at a time', sync, 'bg-amber-400')}
        {lanes('Asynchronous — switch while waiting', asyncRows, 'bg-amber-400')}

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-2">
            <p className="text-sm font-bold text-white">{busy(sync)}%</p>
            <p className="text-[10px] text-gray-400">CPU doing useful work — synchronous</p>
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-900/50 p-2">
            <p className="text-sm font-bold text-white">{busy(asyncRows)}%</p>
            <p className="text-[10px] text-gray-400">CPU doing useful work — asynchronous</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Coroutines with async def                                         */
/* ------------------------------------------------------------------ */

const CORO_CODE = {
  async: [
    'import asyncio',
    '',
    'async def get_data_from_network():',
    '    # Code to fetch data...',
    '    print("Fetching data...")',
    '    # Simulate waiting for a network response',
    '    await asyncio.sleep(1)  # This is where the magic happens',
    '    print("Data received!")',
    '    return {"data": "some result"}',
  ],
  sync: [
    'import time',
    '',
    'def get_data_from_network():',
    '    # Code to fetch data...',
    '    print("Fetching data...")',
    '    # Simulate waiting for a network response',
    '    time.sleep(1)  # blocks: nothing else can run',
    '    print("Data received!")',
    '    return {"data": "some result"}',
  ],
};

const CORO_STEPS = {
  async: [
    { active: [2], caller: '# nothing called yet', console: [], vars: [], lesson: 'async def defines a coroutine function. Defining it runs nothing yet.' },
    {
      active: [],
      caller: 'coro = get_data_from_network()',
      console: [],
      vars: [['coro', '<coroutine object get_data_from_network at 0x10b2f1a40>']],
      lesson: 'You called it — and nothing printed. Calling an async def function does not run its body. It returns a coroutine object: the work, packaged up but not started. Like an order ticket that has not been cooked yet.',
    },
    {
      active: [4],
      caller: 'result = await coro',
      console: ['Fetching data...'],
      vars: [['coro', '<coroutine object … running>']],
      lesson: 'Awaiting the coroutine (or passing it to asyncio.run) is what actually runs it. Now the body starts at its first line.',
    },
    {
      active: [6],
      caller: 'result = await coro',
      console: ['Fetching data...'],
      vars: [['coro', '<coroutine object … suspended>']],
      pause: 'paused',
      lesson: 'await asyncio.sleep(1) suspends this coroutine for one second. It is paused, not blocking: during that second the event loop is free to run other tasks.',
    },
    {
      active: [7],
      caller: 'result = await coro',
      console: ['Fetching data...', 'Data received!'],
      vars: [['coro', '<coroutine object … running>']],
      lesson: 'The wait is over. The coroutine resumes from exactly where it paused — the line after the await.',
    },
    {
      active: [8],
      caller: 'result = await coro',
      console: ['Fetching data...', 'Data received!'],
      vars: [['result', "{'data': 'some result'}"]],
      lesson: 'The coroutine returns. Its return value becomes the value of the await expression, so result holds the dictionary.',
    },
  ],
  sync: [
    { active: [2], caller: '# nothing called yet', console: [], vars: [], lesson: 'A regular def function. Defining it runs nothing.' },
    {
      active: [4],
      caller: 'result = get_data_from_network()',
      console: ['Fetching data...'],
      vars: [],
      lesson: 'A regular function runs its body the moment you call it. “Fetching data...” prints immediately — no coroutine object, no await.',
    },
    {
      active: [6],
      caller: 'result = get_data_from_network()',
      console: ['Fetching data...'],
      vars: [],
      pause: 'blocked',
      lesson: 'time.sleep(1) blocks. For one full second the whole program is frozen on this line. In a server, no other request could be handled.',
    },
    {
      active: [7],
      caller: 'result = get_data_from_network()',
      console: ['Fetching data...', 'Data received!'],
      vars: [],
      lesson: 'Only after the full second does the next line run.',
    },
    {
      active: [8],
      caller: 'result = get_data_from_network()',
      console: ['Fetching data...', 'Data received!'],
      vars: [['result', "{'data': 'some result'}"]],
      lesson: 'The function returns the dictionary directly to the caller.',
    },
  ],
};

export function CoroutineVisualizer() {
  const [mode, setMode] = useState('async');
  const steps = CORO_STEPS[mode];
  const stepper = useStepper(steps.length, 1500);
  const frame = steps[Math.min(stepper.index, steps.length - 1)];

  const switchMode = (next) => {
    setMode(next);
    stepper.reset();
  };

  return (
    <Frame
      title="Calling an async def function hands you a coroutine, not a result"
      hint="Step through the async version, then the regular def version. Watch the console and the variables."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(mode === 'async')} onClick={() => switchMode('async')}>
              async def
            </button>
            <button type="button" className={tabClass(mode === 'sync')} onClick={() => switchMode('sync')}>
              regular def
            </button>
          </div>
          <StepControls stepper={stepper} total={steps.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Lesson title={`Step ${stepper.index + 1}`}>{frame.lesson}</Lesson>
        <CodeLines lines={CORO_CODE[mode]} active={frame.active} title="network.py" />
        <div className="rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 font-mono text-[11px]">
          <span className="text-gray-500">caller › </span>
          <span className="text-teal-100">{frame.caller}</span>
        </div>
        {frame.pause && (
          <div
            className={`rounded-xl border px-3 py-2 text-[11px] flex items-center gap-2 ${
              frame.pause === 'paused' ? 'border-teal-400/50 bg-teal-500/10 text-teal-100' : 'border-rose-400/50 bg-rose-500/10 text-rose-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            {frame.pause === 'paused'
              ? 'Paused for 1 s — the event loop can run other tasks meanwhile.'
              : 'Blocked for 1 s — the whole program waits on this line.'}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-2">
          <div className="rounded-xl border border-gray-700 bg-black/70 p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">console output</p>
            {frame.console.length ? (
              frame.console.map((line) => (
                <p key={line} className="font-mono text-[11px] text-emerald-200">{line}</p>
              ))
            ) : (
              <p className="font-mono text-[11px] text-gray-600">(nothing printed)</p>
            )}
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">variables</p>
            {frame.vars.length ? (
              frame.vars.map(([name, value]) => (
                <p key={name} className="font-mono text-[11px] text-gray-200 break-all">
                  <span className="text-cyan-200">{name}</span> = {value}
                </p>
              ))
            ) : (
              <p className="font-mono text-[11px] text-gray-600">(none yet)</p>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Pausing execution with await                                      */
/* ------------------------------------------------------------------ */

const AWAIT_CODE = [
  'async def fetch_user():',
  '    print("user: start")',
  '    await asyncio.sleep(2)   # database',
  '    print("user: done")',
  '',
  'async def fetch_features():',
  '    print("features: start")',
  '    await asyncio.sleep(1)   # feature store',
  '    print("features: done")',
  '',
  'async def main():',
  '    await asyncio.gather(fetch_user(), fetch_features())',
];

const AWAIT_STEPS = [
  { t: 0, active: [11], user: 'ready', feat: 'ready', out: [], text: 'main() hands both coroutines to asyncio.gather. They are scheduled on the event loop. Nothing has run yet.' },
  { t: 0, active: [1], user: 'running', feat: 'ready', out: ['user: start'], text: 'The event loop runs fetch_user first. It prints.' },
  { t: 0, active: [2], user: 'suspended', feat: 'ready', out: ['user: start'], text: 'fetch_user reaches await asyncio.sleep(2). It is suspended — Python remembers exactly where — and control goes back to the event loop.' },
  { t: 0, active: [6], user: 'suspended', feat: 'running', out: ['user: start', 'features: start'], text: 'The loop is free, so it runs the next ready coroutine: fetch_features.' },
  { t: 0, active: [7], user: 'suspended', feat: 'suspended', out: ['user: start', 'features: start'], text: 'fetch_features awaits too. Both coroutines are now waiting at the same time. The loop has nothing to run until one of them is ready.' },
  { t: 1, active: [8], user: 'suspended', feat: 'done', out: ['user: start', 'features: start', 'features: done'], text: 'After 1 second the feature store answers. fetch_features resumes right after its await and finishes.' },
  { t: 2, active: [3], user: 'done', feat: 'done', out: ['user: start', 'features: start', 'features: done', 'user: done'], text: 'At 2 seconds the database answers. fetch_user resumes from the exact line where it paused and finishes.' },
  { t: 2, active: [11], user: 'done', feat: 'done', out: ['user: start', 'features: start', 'features: done', 'user: done'], text: 'gather returns. Total time: 2 seconds, not 1 + 2 = 3, because the two waits overlapped.' },
];

const STATE_TONE = {
  ready: 'border-gray-600 text-gray-300',
  running: 'border-emerald-400/70 bg-emerald-500/10 text-emerald-100',
  suspended: 'border-teal-400/60 bg-teal-500/10 text-teal-100',
  done: 'border-gray-700 text-gray-500',
};

const STATE_TEXT = {
  ready: 'ready — waiting for its turn',
  running: 'running — the loop is executing it',
  suspended: 'suspended at await — waiting on I/O',
  done: 'done ✓',
};

const AWAITABLES = [
  { code: 'await asyncio.sleep(1)', ok: true, why: 'asyncio.sleep returns a coroutine. Awaiting it pauses without blocking.' },
  { code: 'await fetch_features()', ok: true, why: 'Calling an async def function returns a coroutine, and coroutines are awaitable.' },
  { code: 'await db.fetch_one(query)', ok: true, why: 'Async database drivers return awaitables, so the query waits without blocking.' },
  {
    code: 'await time.sleep(1)',
    ok: false,
    why: "time.sleep blocks for a second and returns None. Then: TypeError: object NoneType can't be used in 'await' expression.",
  },
  {
    code: 'await requests.get(url)',
    ok: false,
    why: "requests is a blocking library. It waits for the whole reply, returns a Response, and then: TypeError: object Response can't be used in 'await' expression.",
  },
  {
    code: 'await model.predict(x)',
    ok: false,
    why: "A plain function doing CPU work. It runs to completion and returns an array, which is not awaitable. CPU-bound code needs different handling (covered later).",
  },
];

export function AwaitVisualizer() {
  const [tab, setTab] = useState('run');
  const [asyncHandler, setAsyncHandler] = useState(false);
  const [picked, setPicked] = useState(0);
  const stepper = useStepper(AWAIT_STEPS.length, 1600);
  const frame = AWAIT_STEPS[stepper.index];
  const choice = AWAITABLES[picked];

  return (
    <Frame
      title="await: pause here, let others run, resume later"
      hint={
        tab === 'run'
          ? 'Two coroutines, one event loop. Step through and watch which one is running, suspended, or done.'
          : 'Two rules decide where await is allowed and what it can be used on.'
      }
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(tab === 'run')} onClick={() => setTab('run')}>
              Two coroutines, one loop
            </button>
            <button type="button" className={tabClass(tab === 'rules')} onClick={() => setTab('rules')}>
              The rules of await
            </button>
          </div>
          {tab === 'run' && <StepControls stepper={stepper} total={AWAIT_STEPS.length} />}
        </div>
      }
    >
      {tab === 'run' ? (
        <div className="space-y-3">
          <Lesson title={`Clock: ${frame.t} s`}>{frame.text}</Lesson>
          <div className="grid md:grid-cols-[1.3fr_1fr] gap-3">
            <CodeLines lines={AWAIT_CODE} active={frame.active} title="app.py" />
            <div className="space-y-2">
              {[
                ['fetch_user()', frame.user, 2],
                ['fetch_features()', frame.feat, 1],
              ].map(([name, state, seconds]) => (
                <div key={name} className={`rounded-xl border p-2.5 transition-colors ${STATE_TONE[state]}`}>
                  <p className="font-mono text-xs text-white">{name}</p>
                  <p className="text-[11px] mt-0.5">{STATE_TEXT[state]}</p>
                  <div className="mt-1.5 h-1.5 rounded bg-gray-800 relative">
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-teal-400/70 transition-all"
                      style={{ width: `${Math.min(1, frame.t / seconds) * 100}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-500 mt-0.5">waits {seconds} s</p>
                </div>
              ))}
              <div className="rounded-xl border border-gray-700 bg-black/70 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">console</p>
                {frame.out.length ? (
                  frame.out.map((line) => (
                    <p key={line} className="font-mono text-[11px] text-emerald-200">{line}</p>
                  ))
                ) : (
                  <p className="font-mono text-[11px] text-gray-600">(empty)</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-700 p-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Rule 1 · await only works inside async def</p>
            <div className="flex gap-1.5">
              <button type="button" className={tabClass(!asyncHandler)} onClick={() => setAsyncHandler(false)}>
                def handler()
              </button>
              <button type="button" className={tabClass(asyncHandler)} onClick={() => setAsyncHandler(true)}>
                async def handler()
              </button>
            </div>
            <CodeLines
              lines={[`${asyncHandler ? 'async def' : 'def'} handler():`, '    data = await fetch_features()', '    return data']}
              active={[1]}
            />
            <p
              className={`rounded-lg border px-2.5 py-1.5 font-mono text-[11px] ${
                asyncHandler ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100' : 'border-rose-400/50 bg-rose-500/10 text-rose-100'
              }`}
            >
              {asyncHandler ? '✓ Valid: the coroutine can pause here.' : "SyntaxError: 'await' outside async function"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-700 p-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Rule 2 · you can only await an awaitable</p>
            <p className="text-[11px] text-gray-400">Click each line: can it be awaited?</p>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {AWAITABLES.map((item, i) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setPicked(i)}
                  className={`text-left rounded-lg border px-2.5 py-1.5 font-mono text-[11px] flex items-center gap-2 ${
                    picked === i ? 'border-teal-400/70 bg-teal-500/10 text-white' : 'border-gray-700 text-gray-300'
                  }`}
                >
                  {item.ok ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                  {item.code}
                </button>
              ))}
            </div>
            <Lesson title={choice.ok ? 'Awaitable ✓' : 'Not awaitable ✗'}>{choice.why}</Lesson>
          </div>
        </div>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 5. The event loop                                                    */
/* ------------------------------------------------------------------ */

const LOOP_NODES = {
  arrive: 'Request arrives',
  enter: 'Enter async function',
  await: 'await external_call()',
  yield: 'Yield control',
  loop: 'Event loop',
  other: 'Run other task(s)',
  resume: 'Resume function',
  ret: 'Return response',
};

const LOOP_STEPS = [
  { node: 'arrive', edge: null, running: null, ready: ['A'], waiting: [], done: [], text: 'Request A arrives at the server.' },
  { node: 'enter', edge: null, running: 'A', ready: [], waiting: [], done: [], text: 'FastAPI calls your async route handler for A. It starts running on the event loop.' },
  { node: 'await', edge: null, running: 'A', ready: [], waiting: [], done: [], text: 'A reaches await external_call() — for example, asking a feature service for data. The call is sent; the reply will take a while.' },
  { node: 'yield', edge: 'Pause', running: null, ready: [], waiting: ['A'], done: [], text: 'A pauses and yields control back to the event loop. It is parked in the waiting list: “resume me when my reply arrives.”' },
  { node: 'loop', edge: null, running: null, ready: ['B'], waiting: ['A'], done: [], text: 'The event loop looks for other ready work. Request B arrived meanwhile and is ready to run.' },
  { node: 'other', edge: 'Switch task', running: 'B', ready: [], waiting: ['A'], done: [], text: 'Switch task: the loop runs B. The CPU does useful work instead of idling while A waits.' },
  { node: 'loop', edge: 'Task yields / completes', running: null, ready: [], waiting: ['A', 'B'], done: [], text: 'B reaches its own await (a database query) and yields. Both requests are waiting; the loop keeps watching for I/O to finish.' },
  { node: 'loop', edge: 'I/O complete', running: null, ready: ['A'], waiting: ['B'], done: [], text: 'A’s external call completes. The event loop schedules A to resume.' },
  { node: 'resume', edge: null, running: 'A', ready: [], waiting: ['B'], done: [], text: 'A resumes exactly where it paused — the line after the await — with the result in hand.' },
  { node: 'ret', edge: 'Continue execution', running: null, ready: [], waiting: ['B'], done: ['A'], text: 'A finishes and its response goes back to the client. B will resume the same way when its database replies.' },
];

function LoopNode({ id, active, extra = '' }) {
  return (
    <div
      className={`rounded-xl border px-2 py-1.5 text-[10px] font-semibold text-center transition-all ${extra} ${
        active ? 'border-teal-300 bg-teal-500/25 text-white shadow-[0_0_14px_rgba(45,212,191,0.35)]' : 'border-gray-700 bg-gray-900/60 text-gray-400'
      } ${id === 'loop' ? 'rounded-full' : ''}`}
    >
      {LOOP_NODES[id]}
    </div>
  );
}

function EdgeLabel({ label, active }) {
  return (
    <span className={`text-[9px] whitespace-nowrap px-1 ${active ? 'text-teal-200 font-bold' : 'text-gray-600'}`}>
      {label} →
    </span>
  );
}

export function EventLoopVisualizer() {
  const stepper = useStepper(LOOP_STEPS.length, 1700);
  const frame = LOOP_STEPS[stepper.index];
  const on = (id) => frame.node === id;
  const edgeOn = (label) => frame.edge === label;

  const column = (title, items, tone) => (
    <div className="rounded-xl border border-gray-700 bg-gray-950/60 p-2 min-h-[4.5rem]">
      <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">{title}</p>
      <div className="flex flex-wrap gap-1">
        {items.length ? (
          items.map((item) => (
            <span key={item} className={`text-[10px] font-mono px-2 py-0.5 rounded ${tone}`}>
              request {item}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-gray-600">—</span>
        )}
      </div>
    </div>
  );

  return (
    <Frame
      title="The event loop decides who runs next"
      hint="Step through two requests. The flow chart shows where request A is; the board below shows what the loop is tracking."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={LOOP_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Lesson title={`Step ${stepper.index + 1}: ${LOOP_NODES[frame.node]}`}>{frame.text}</Lesson>

        <div className="rounded-xl border border-gray-700 bg-gray-950/50 p-3 space-y-3">
          <div className="flex items-center gap-1 flex-wrap">
            <LoopNode id="arrive" active={on('arrive')} />
            <EdgeLabel label="" active={false} />
            <LoopNode id="enter" active={on('enter')} />
            <EdgeLabel label="" active={false} />
            <LoopNode id="await" active={on('await')} />
            <EdgeLabel label="Pause" active={edgeOn('Pause')} />
            <LoopNode id="yield" active={on('yield')} />
            <EdgeLabel label="" active={false} />
            <LoopNode id="loop" active={on('loop')} extra="px-4" />
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="rounded-lg border border-dashed border-gray-700 p-2 flex items-center gap-1 flex-wrap">
              <EdgeLabel label="Switch task" active={edgeOn('Switch task')} />
              <LoopNode id="other" active={on('other')} />
              <span className={`text-[9px] ${edgeOn('Task yields / completes') ? 'text-teal-200 font-bold' : 'text-gray-600'}`}>
                ↩ task yields / completes
              </span>
            </div>
            <div className="rounded-lg border border-dashed border-gray-700 p-2 flex items-center gap-1 flex-wrap">
              <EdgeLabel label="I/O complete" active={edgeOn('I/O complete')} />
              <LoopNode id="resume" active={on('resume')} />
              <EdgeLabel label="Continue" active={edgeOn('Continue execution')} />
              <LoopNode id="ret" active={on('ret')} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">What the event loop is tracking</p>
          <div className="grid grid-cols-4 gap-2">
            {column('Running now', frame.running ? [frame.running] : [], 'bg-emerald-500/20 text-emerald-100')}
            {column('Ready to run', frame.ready, 'bg-gray-700 text-gray-100')}
            {column('Waiting on I/O', frame.waiting, 'bg-teal-500/20 text-teal-100')}
            {column('Done', frame.done, 'bg-gray-800 text-gray-400')}
          </div>
        </div>
        <p className="text-[11px] text-gray-400">
          Only one task is ever in “Running now”. The loop’s job is to keep that slot busy with work that is ready, while
          everything else waits. Python’s built-in <span className="font-mono text-gray-300">asyncio</span> library provides
          this loop.
        </p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 6. FastAPI on top of asyncio                                         */
/* ------------------------------------------------------------------ */

const STACK_LAYERS = [
  { id: 'handler', name: 'Your route handler', what: 'async def predict(...) — the code you write' },
  { id: 'fastapi', name: 'FastAPI', what: 'Calls your function, validates data, builds JSON and docs' },
  { id: 'starlette', name: 'Starlette', what: 'The ASGI toolkit FastAPI is built on: routing, requests, responses' },
  { id: 'asgi', name: 'ASGI (via Uvicorn)', what: 'The standard interface between the web server and your app' },
  { id: 'asyncio', name: 'asyncio', what: 'Python’s built-in event loop that runs, pauses, and resumes tasks' },
];

const HANDLER_CODE = [
  '@app.post("/predict")',
  'async def predict(req: PredictRequest):',
  '    features = await feature_db.fetch(req.user_id)',
  '    label = run_model(features)',
  '    return {"label": label}',
];

const JOURNEY = [
  { layers: ['asgi'], line: [], text: 'A request arrives at Uvicorn, an ASGI server. It turns the raw HTTP bytes into an ASGI event for the app.' },
  { layers: ['starlette'], line: [0], text: 'Starlette receives it and matches the path and method to your route: POST /predict.' },
  { layers: ['fastapi', 'handler', 'asyncio'], line: [1], text: 'FastAPI runs your route handler inside the event loop. You wrote ordinary Python with async/await — no threads to manage.' },
  { layers: ['handler', 'asyncio'], line: [2], text: 'Your handler awaits an I/O-bound call. FastAPI and asyncio pause it automatically and serve other requests meanwhile.' },
  { layers: ['asyncio', 'handler'], line: [3], text: 'The database replies. asyncio resumes the handler at the next line. (The model call here is CPU-bound — async code handles that specially, covered in Chapter 5.)' },
  { layers: ['fastapi', 'starlette', 'asgi'], line: [4], text: 'The handler returns a dict. FastAPI turns it into JSON, and the response travels back out through Starlette and Uvicorn.' },
];

const SORT_ITEMS = [
  { task: 'Fetch features from a database', kind: 'io', why: 'The server sends a query and waits for the reply. Awaiting it frees the loop.' },
  { task: 'Call an external API before prediction', kind: 'io', why: 'Network round trip: pure waiting. A perfect fit for await.' },
  { task: 'Validate the request (check the user ID exists in the DB)', kind: 'io', why: 'This validation step looks something up, so it waits on the database.' },
  { task: 'Log the prediction to a remote service', kind: 'io', why: 'Sending the log and waiting for an acknowledgment is I/O.' },
  { task: 'Save the result to storage', kind: 'io', why: 'Writing to a database or object storage waits on the network or disk.' },
  { task: 'Run the model’s forward pass', kind: 'cpu', why: 'Matrix math keeps the CPU busy. async alone does not help; it needs special handling (Chapter 5).' },
  { task: 'Normalize a large feature array with NumPy', kind: 'cpu', why: 'Pure computation. Nothing to wait for, so there is nothing for await to overlap.' },
];

export function FastAPIAsyncioVisualizer() {
  const [tab, setTab] = useState('stack');
  const [answers, setAnswers] = useState({});
  const stepper = useStepper(JOURNEY.length, 1800);
  const frame = JOURNEY[stepper.index];
  const answered = Object.keys(answers).length;
  const correct = SORT_ITEMS.filter((item, i) => answers[i] === item.kind).length;

  return (
    <Frame
      title="FastAPI is built on the event loop"
      hint={
        tab === 'stack'
          ? 'Step a request through the layers. The highlighted layers are the ones doing the work at that moment.'
          : 'Sort each task: does it mostly wait (I/O) or mostly compute (CPU)?'
      }
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(tab === 'stack')} onClick={() => setTab('stack')}>
              Where your handler runs
            </button>
            <button type="button" className={tabClass(tab === 'sort')} onClick={() => setTab('sort')}>
              Which steps benefit?
            </button>
          </div>
          {tab === 'stack' && <StepControls stepper={stepper} total={JOURNEY.length} />}
        </div>
      }
    >
      {tab === 'stack' ? (
        <div className="space-y-3">
          <Lesson title={`Step ${stepper.index + 1}`}>{frame.text}</Lesson>
          <div className="grid md:grid-cols-[1fr_1.1fr] gap-3">
            <div className="space-y-1.5">
              {STACK_LAYERS.map((layer) => {
                const on = frame.layers.includes(layer.id);
                return (
                  <div
                    key={layer.id}
                    className={`rounded-xl border px-3 py-2 transition-all ${
                      on ? 'border-teal-400/70 bg-teal-500/15' : 'border-gray-700 bg-gray-900/40'
                    }`}
                  >
                    <p className={`text-xs font-semibold ${on ? 'text-white' : 'text-gray-400'}`}>{layer.name}</p>
                    <p className="text-[10px] text-gray-400">{layer.what}</p>
                  </div>
                );
              })}
            </div>
            <div className="space-y-2">
              <CodeLines lines={HANDLER_CODE} active={frame.line} title="main.py" />
              <p className="text-[11px] text-gray-400 leading-relaxed">
                FastAPI handles the pausing and resuming for you. That is why it can serve many concurrent requests
                efficiently — especially ML APIs that fetch data or preprocess inputs before inference.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Lesson title={`Score: ${correct} / ${answered || 0} answered`}>
            I/O steps benefit greatly from async: while one request waits, others run. CPU steps keep the processor busy
            either way, so they need different handling.
          </Lesson>
          <div className="space-y-1.5">
            {SORT_ITEMS.map((item, i) => {
              const answer = answers[i];
              const right = answer === item.kind;
              return (
                <div key={item.task} className="rounded-xl border border-gray-700 bg-gray-950/50 p-2.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-[11px] text-white">{item.task}</p>
                    <div className="flex gap-1">
                      {[
                        ['io', 'Waits (I/O)'],
                        ['cpu', 'Computes (CPU)'],
                      ].map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setAnswers((current) => ({ ...current, [i]: id }))}
                          className={`text-[10px] px-2 py-1 rounded-md border ${
                            answer === id
                              ? right
                                ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-100'
                                : 'border-rose-400/70 bg-rose-500/15 text-rose-100'
                              : 'border-gray-700 text-gray-400 hover:bg-gray-800'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {answer && (
                    <p className={`text-[10px] mt-1 ${right ? 'text-emerald-200' : 'text-rose-200'}`}>
                      {right ? '✓ ' : `✗ It ${item.kind === 'io' ? 'mostly waits' : 'mostly computes'}. `}
                      {item.why}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Frame>
  );
}
