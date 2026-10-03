import React, { useEffect, useRef, useState } from 'react';
import { useStepper, Frame, StepControls, tabClass, Lesson } from './VisualKit';
import { CodeText } from './CodeBlock';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  ShieldCheck,
  BookOpen,
  Boxes,
  Server,
  User,
  ChefHat,
  Utensils,
  CheckCircle,
  XCircle,
  Database,
  Cpu,
  FileJson,
  Eye,
  Lock,
  Globe,
  Send,
  Trash2,
  RefreshCw,
  Code,
  Gauge,
  Bug,
  Sparkles,
  Layers,
  Braces,
} from 'lucide-react';

const PATH_STEPS = [
  {
    layer: 'Client',
    who: 'Not FastAPI',
    detail: 'POST /predict with a JSON body',
    payload: '{ "features": [5.1, 3.5, 1.4, 0.2] }',
    means: 'The caller only knows the URL and the JSON. It does not import the model.',
  },
  {
    layer: 'Starlette',
    who: 'Moves the HTTP',
    detail: 'ASGI accepts the connection and reads the message',
    payload: 'POST /predict HTTP/1.1',
    means: 'Starlette is the web engine. It reads method, URL, headers, and body. It does not check that the features are the right type.',
  },
  {
    layer: 'Pydantic',
    who: 'Checks the data',
    detail: 'Validates the body against your type hints',
    payload: 'features: list[float]  →  ok',
    means: 'Pydantic is the gate. Bad types stop here, before predict() runs. The same hints later become /docs.',
  },
  {
    layer: 'Your route',
    who: 'The only code you write',
    detail: 'model.predict(features)',
    payload: 'setosa, score 0.97',
    means: 'This middle step is ordinary Python. FastAPI called it only because the two engines around it already did their jobs.',
  },
  {
    layer: 'Pydantic',
    who: 'Shapes the output',
    detail: 'Drops fields you did not declare',
    payload: '{ "label": "setosa", "score": 0.97 }',
    means: 'The response model is a contract too. Extra internal values do not leak to the client.',
  },
  {
    layer: 'Starlette',
    who: 'Sends the HTTP',
    detail: 'Status, headers, and JSON go back',
    payload: 'HTTP/1.1 200 OK',
    means: 'Starlette writes the response. The client still never sees the weights — only this message.',
  },
];

export function StackFlowVisualizer() {
  const [tab, setTab] = useState('path');
  const stepper = useStepper(PATH_STEPS.length, 1100);
  const [engine, setEngine] = useState('starlette');

  return (
    <Frame
      title={tab === 'path' ? 'One prediction, six handoffs' : 'The two engines under FastAPI'}
      hint={
        tab === 'path'
          ? 'Use Prev step and Next step, or Play. Your model only runs after Pydantic says the input is valid.'
          : 'Click an engine. Starlette moves bytes. Pydantic decides what those bytes are allowed to mean.'
      }
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(tab === 'path')} onClick={() => setTab('path')}>
              Request path
            </button>
            <button type="button" className={tabClass(tab === 'engines')} onClick={() => setTab('engines')}>
              Starlette + Pydantic
            </button>
          </div>
          {tab === 'path' && <StepControls stepper={stepper} total={PATH_STEPS.length} />}
        </div>
      }
    >
      {tab === 'path' ? (
        <div className="space-y-2">
          <Lesson title="What this step is saying">
            <p>{PATH_STEPS[stepper.index].means}</p>
            <p className="font-mono text-[11px] text-teal-100 mt-1">{PATH_STEPS[stepper.index].payload}</p>
          </Lesson>
          {PATH_STEPS.map((step, i) => {
            const active = i === stepper.index;
            const done = i < stepper.index;
            return (
              <div key={`${step.layer}-${i}`} className="flex items-stretch gap-2">
                <div className="flex flex-col items-center w-4 shrink-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-3 ${
                      active ? 'bg-teal-400 shadow-[0_0_10px_#2dd4bf]' : done ? 'bg-teal-700' : 'bg-gray-600'
                    }`}
                  />
                  {i < PATH_STEPS.length - 1 && <div className={`w-px flex-1 ${done ? 'bg-teal-700' : 'bg-gray-700'}`} />}
                </div>
                <button
                  type="button"
                  onClick={() => stepper.pick(i)}
                  className={`flex-1 text-left rounded-xl border px-3 py-2 transition-all ${
                    active
                      ? 'border-teal-400/70 bg-teal-500/10'
                      : 'border-gray-700 bg-gray-900/50 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white">{step.layer}</span>
                    <span className={`text-[10px] font-medium ${active ? 'text-teal-200' : 'text-gray-500'}`}>{step.who}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{step.detail}</p>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          {[
            {
              id: 'starlette',
              icon: Zap,
              name: 'Starlette',
              role: 'ASGI web layer',
              points: [
                'Speaks HTTP: method, URL, headers, body',
                'async / await so one worker can juggle many connections',
                'Successor to WSGI, which Flask and classic Django sit on',
              ],
            },
            {
              id: 'pydantic',
              icon: ShieldCheck,
              name: 'Pydantic',
              role: 'Types, validation, docs',
              points: [
                'Your type hints are the schema',
                'Bad input becomes a clear error, not a crash inside the model',
                'The same hints generate OpenAPI at /docs and /redoc',
              ],
            },
          ].map((item) => {
            const Icon = item.icon;
            const on = engine === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setEngine(item.id)}
                className={`text-left rounded-2xl border p-4 transition-all ${
                  on ? 'border-teal-400/70 bg-teal-500/10' : 'border-gray-700 bg-gray-900/40 hover:border-gray-500'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${on ? 'text-teal-300' : 'text-gray-400'}`} />
                <p className="text-white font-bold">{item.name}</p>
                <p className="text-[11px] text-teal-300/90 mb-3">{item.role}</p>
                <ul className="space-y-2">
                  {item.points.map((point) => (
                    <li key={point} className="text-xs text-gray-300 leading-relaxed">
                      {point}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
        <Lesson title={engine === 'starlette' ? 'Starlette, in the words of the text' : 'Pydantic, in the words of the text'}>
          {engine === 'starlette'
            ? 'ASGI replaced WSGI, the interface under Flask and classic Django. Async I/O lets one process hold many connections. Starlette moves bytes. It does not validate them.'
            : 'Type hints are the schema. Incoming JSON is checked against a model, outgoing JSON is shaped by a model, and /docs is generated from those same models.'}
        </Lesson>
        </div>
      )}
    </Frame>
  );
}

const ASYNC_SCRIPT = [
  { caption: 'Both requests are still outside.', server: 'free', r1: 'idle', r2: 'idle', point: 'Nothing is running. The question this slide answers is: when request 1 waits on a database, can request 2 start?' },
  { caption: 'Request 1 is reading features from a database.', server: 'free', r1: 'await', r2: 'idle', point: 'await gives the worker back. The database wait continues, but the worker is not stuck inside it. This is the async advantage, and it only applies to I/O.' },
  { caption: 'Request 2 starts while request 1 is still waiting.', server: 'busy', r1: 'await', r2: 'proc', point: 'Yes. Request 2 is accepted during request 1’s wait. A WSGI worker could not do this — it would still be inside request 1.' },
  { caption: 'Both requests are waiting on I/O.', server: 'free', r1: 'await', r2: 'await', point: 'Two network waits are in flight at once. The worker is free for a third connection. Wall-clock time is overlapping, not adding up.' },
  { caption: 'Request 1’s data arrived, so it finishes.', server: 'busy', r1: 'done', r2: 'await', point: 'Request 1 resumes only when the data is back, then returns its prediction. Request 2 is still in its own wait.' },
  { caption: 'Request 2 finishes. The waits overlapped.', server: 'free', r1: 'done', r2: 'done', point: 'Total time is about one wait, not wait + wait. predict() itself was not made faster — only the waiting around it was shared.' },
];

const SYNC_SCRIPT = [
  { caption: 'Same two requests, one WSGI worker.', server: 'free', r1: 'idle', r2: 'idle', point: 'WSGI handles a request from start to finish. If that request waits on the network, the worker waits with it.' },
  { caption: 'Request 1’s database read blocks the worker.', server: 'blocked', r1: 'block', r2: 'idle', point: 'The process is stuck inside request 1. There is no await, so the worker cannot accept anyone else.' },
  { caption: 'Request 2 has arrived and can only queue.', server: 'blocked', r1: 'block', r2: 'wait', point: 'This is the line from the text: request 2 sits in a queue until request 1 has fully returned.' },
  { caption: 'Request 1 returned. Request 2 finally starts.', server: 'blocked', r1: 'done', r2: 'block', point: 'Request 2 gets the worker only after request 1 is completely done, including the database wait.' },
  { caption: 'Request 2 blocks the same way.', server: 'free', r1: 'done', r2: 'done', point: 'Wall time is wait 1 + wait 2. Switch back to Async and step to the same moment — request 2 has already started there.' },
];

const REQ_STYLE = {
  idle: 'border-gray-700 bg-gray-900/40 text-gray-400',
  proc: 'border-teal-400/70 bg-teal-500/10 text-teal-100',
  await: 'border-amber-400/70 bg-amber-500/10 text-amber-100',
  block: 'border-rose-400/70 bg-rose-500/10 text-rose-100',
  wait: 'border-gray-500 bg-gray-800 text-gray-300',
  done: 'border-emerald-400/70 bg-emerald-500/10 text-emerald-100',
};

const REQ_LABEL = {
  idle: 'waiting outside',
  proc: 'running',
  await: 'awaiting I/O — worker yielded',
  block: 'blocking the worker',
  wait: 'queued — worker is busy',
  done: 'response sent',
};

export function AsyncVsSyncVisualizer() {
  const [mode, setMode] = useState('async');
  const script = mode === 'async' ? ASYNC_SCRIPT : SYNC_SCRIPT;
  const stepper = useStepper(script.length, 1500);
  const frame = script[stepper.index];

  const switchMode = (next) => {
    setMode(next);
    stepper.reset();
  };

  const serverTone =
    frame.server === 'blocked'
      ? 'border-rose-400 bg-rose-500/15 text-rose-100'
      : frame.server === 'busy'
        ? 'border-teal-400 bg-teal-500/15 text-teal-100'
        : 'border-emerald-400/60 bg-emerald-500/10 text-emerald-100';

  return (
    <Frame
      title={mode === 'async' ? 'ASGI: yield while you wait' : 'WSGI: one request blocks the worker'}
      hint="Step through one stage at a time, or press Play. Switch Async / Sync to compare the same moment under both models."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(mode === 'async')} onClick={() => switchMode('async')}>
              Async (FastAPI)
            </button>
            <button type="button" className={tabClass(mode === 'sync')} onClick={() => switchMode('sync')}>
              Sync (WSGI)
            </button>
          </div>
          <StepControls stepper={stepper} total={script.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Lesson title={mode === 'async' ? 'What ASGI is doing' : 'What WSGI is doing'}>
          <p className="text-white">{frame.point}</p>
          <p className="text-gray-400 mt-1">{frame.caption}</p>
        </Lesson>
        {[
          ['Request 1', frame.r1],
          ['Request 2', frame.r2],
        ].map(([name, status]) => (
          <div key={name} className={`rounded-xl border px-3 py-3 transition-colors ${REQ_STYLE[status]}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-white">{name}</span>
              <span className="text-[11px] font-medium">{REQ_LABEL[status]}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-black/30 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  status === 'done' ? 'w-full bg-emerald-400' : status === 'idle' ? 'w-0' : 'w-2/3 bg-current'
                }`}
              />
            </div>
          </div>
        ))}
        <div className={`rounded-xl border px-3 py-3 ${serverTone}`}>
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            <span className="text-sm font-bold">
              Worker:{' '}
              {frame.server === 'blocked' ? 'blocked' : frame.server === 'busy' ? 'working, not stuck on I/O' : 'free'}
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}

const ATTRIBUTES = [
  {
    id: 'speed',
    title: 'High performance',
    icon: Gauge,
    line: 'On par with Node and Go for I/O-bound work, because the worker yields instead of blocking.',
    takeaway: 'The bars overlap on purpose. Request B starts while A is still waiting on the network. That is the performance claim, and it is about I/O, not about making predict() faster.',
  },
  {
    id: 'fast',
    title: 'Fast to code',
    icon: Sparkles,
    line: 'Validation, parsing, and docs are generated. You write the prediction function.',
    takeaway: 'The crossed-out lines are the boilerplate you no longer write. The remaining function is the endpoint: FastAPI builds the checks and the docs from the type hints.',
  },
  {
    id: 'bugs',
    title: 'Fewer bugs',
    icon: Bug,
    line: 'Type hints plus Pydantic catch bad data in the editor and at the door — not inside predict().',
    takeaway: '“thirty” is a string where an int is required. The editor and the gate both see that. predict() stays dark, so the bug never becomes a wrong prediction.',
  },
  {
    id: 'sync',
    title: 'Intuitive',
    icon: Eye,
    line: 'The docs are generated from the code, so the specification cannot drift from the route.',
    takeaway: 'Rename the field. The Python hint and the /docs schema change together because they are the same source, not a wiki someone has to update.',
  },
  {
    id: 'easy',
    title: 'Easy',
    icon: Code,
    line: 'A typed function is an endpoint. The tutorial surface area stays small.',
    takeaway: 'Those three lines are the whole endpoint. The decorator picks the URL and the verb. The argument type is the request. The return type is the response.',
  },
  {
    id: 'std',
    title: 'Standards-based',
    icon: Globe,
    line: 'OpenAPI for documentation. JSON Schema for the shape of the data.',
    takeaway: 'OpenAPI (formerly Swagger) describes the API. JSON Schema describes each body. Clients can generate a typed SDK from the running app instead of reading a separate spec.',
  },
];

export function AttributesVisualizer() {
  const [active, setActive] = useState('bugs');
  const [renamed, setRenamed] = useState(false);
  const current = ATTRIBUTES.find((item) => item.id === active);

  return (
    <Frame
      title="Six design goals"
      hint="Select a goal. The panel shows the consequence, not a slogan."
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
        {ATTRIBUTES.map((item) => {
          const Icon = item.icon;
          const on = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`rounded-xl border px-2 py-2 text-left transition-all ${
                on ? 'border-teal-400/70 bg-teal-500/10' : 'border-gray-700 bg-gray-900/40 hover:border-gray-500'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${on ? 'text-teal-300' : 'text-gray-400'}`} />
              <span className="block text-[11px] font-semibold text-white leading-tight">{item.title}</span>
            </button>
          );
        })}
      </div>
      <div className="mb-3">
        <Lesson title="What this goal is fixing">{current.takeaway}</Lesson>
      </div>
      <div className="rounded-xl border border-gray-700 bg-gray-950/60 p-3">
        <p className="text-xs text-gray-300 mb-3">{current.line}</p>
        {active === 'speed' && (
          <div className="space-y-2">
            <Bar label="Request A" width="78%" tone="bg-teal-400" />
            <Bar label="Request B" width="70%" tone="bg-cyan-400" offset="18%" />
            <p className="text-[11px] text-gray-500">The bars overlap. B does not wait for A to finish its I/O.</p>
          </div>
        )}
        {active === 'fast' && (
          <div className="font-mono text-[11px] space-y-1">
            <p className="line-through text-gray-500">if not isinstance(age, int): raise ...</p>
            <p className="line-through text-gray-500">write swagger by hand</p>
            <p className="text-teal-200">def predict(body: ModelInput) -&gt; Prediction</p>
          </div>
        )}
        {active === 'bugs' && (
          <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2">
              <p className="text-rose-200 font-semibold mb-1">Editor / gate</p>
              <p className="font-mono text-rose-100">age: &quot;thirty&quot;</p>
              <p className="text-rose-200/80 mt-1">Stopped before the model.</p>
            </div>
            <div className="rounded-lg border border-gray-700 p-2 text-gray-400">
              <p className="font-semibold mb-1">predict()</p>
              <p>Never called.</p>
            </div>
          </div>
        )}
        {active === 'sync' && (
          <div>
            <button
              type="button"
              onClick={() => setRenamed((v) => !v)}
              className="mb-2 text-[11px] px-2 py-1 rounded-md bg-gray-800 text-teal-200"
            >
              {renamed ? 'Rename back to age' : 'Rename field to years'}
            </button>
            <div className="grid sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="rounded-lg border border-gray-700 p-2 text-teal-100">{renamed ? 'years' : 'age'}: int</div>
              <div className="rounded-lg border border-gray-700 p-2 text-cyan-100">
                /docs schema: {renamed ? 'years' : 'age'}
              </div>
            </div>
          </div>
        )}
        {active === 'easy' && (
          <pre className="font-mono text-[11px] text-teal-100 leading-relaxed">{`@app.post("/predict")
def predict(body: ModelInput) -> Prediction:
    return model.predict(body)`}</pre>
        )}
        {active === 'std' && (
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] px-2 py-1 rounded-full border border-teal-500/40 text-teal-200">OpenAPI</span>
            <span className="text-[11px] px-2 py-1 rounded-full border border-violet-500/40 text-violet-200">
              JSON Schema
            </span>
            <span className="text-[11px] text-gray-400">Clients can generate typed SDKs from the running app.</span>
          </div>
        )}
      </div>
    </Frame>
  );
}

function Bar({ label, width, tone, offset = '0%' }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 mb-1">{label}</p>
      <div className="h-2 rounded-full bg-gray-800 relative overflow-hidden">
        <div className={`absolute top-0 h-full rounded-full ${tone}`} style={{ width, left: offset }} />
      </div>
    </div>
  );
}

const PILLARS = [
  {
    id: 'validate',
    icon: ShieldCheck,
    title: 'Validation',
    scene: 'A feature vector with the wrong type is rejected as JSON, before predict().',
    takeaway: 'The model expects specific features and types. {"age": "thirty"} never reaches predict(). The caller gets a 422 that names the bad field. A correct body would pass the same gate and come back shaped by the response model.',
    visual: 'gate',
  },
  {
    id: 'perf',
    icon: Gauge,
    title: 'Low latency',
    scene: 'The model may be CPU-bound. Receiving, parsing, and logging are I/O — ASGI overlaps those.',
    takeaway: 'The amber bar is the math you still pay for. The teal bar is everything around it — reading the request, loading features, writing a log. ASGI overlaps that surrounding work across users. It does not make one predict() call cheaper.',
    visual: 'latency',
  },
  {
    id: 'docs',
    icon: BookOpen,
    title: 'Automatic docs',
    scene: 'Swagger at /docs and ReDoc at /redoc. Consumers try the endpoint in the browser.',
    takeaway: 'Another team does not need your source. They open /docs (Swagger) or /redoc, see the feature names and types, and can send a trial request from the browser against the running app.',
    visual: 'docs',
  },
  {
    id: 'py',
    icon: Boxes,
    title: 'Python ML stack',
    scene: 'scikit-learn, PyTorch, TensorFlow, XGBoost, spaCy, pandas, NumPy — same process.',
    takeaway: 'FastAPI is ordinary Python in the same process. You load the model with the library that trained it. pandas and NumPy usually turn the JSON into the array predict() expects. No second runtime.',
    visual: 'libs',
  },
];

export function WhyFastAPIVisualizer() {
  const [id, setId] = useState('validate');
  const pillar = PILLARS.find((item) => item.id === id);

  return (
    <Frame title="Why this stack for model serving" hint="Pick a reason. Each one is expanded in a later slide.">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {PILLARS.map((item) => {
          const Icon = item.icon;
          const on = item.id === id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setId(item.id)}
              className={`rounded-xl border p-3 text-left ${
                on ? 'border-teal-400/70 bg-teal-500/10' : 'border-gray-700 bg-gray-900/40 hover:border-gray-500'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1 ${on ? 'text-teal-300' : 'text-gray-400'}`} />
              <span className="text-xs font-semibold text-white">{item.title}</span>
            </button>
          );
        })}
      </div>
      <div className="mb-3">
        <Lesson title="Why this matters for a model">{pillar.takeaway}</Lesson>
      </div>
      <div className="rounded-xl border border-gray-700 bg-gray-950/50 p-3">
        <p className="text-xs text-gray-300 mb-3">{pillar.scene}</p>
        {pillar.visual === 'gate' && (
          <div className="flex items-center gap-2 text-[11px] flex-wrap">
            <Chip tone="rose">{'{ "age": "thirty" }'}</Chip>
            <span className="text-gray-500">→</span>
            <Chip tone="rose">422 at the gate</Chip>
            <span className="text-gray-500">model stays dark</span>
          </div>
        )}
        {pillar.visual === 'latency' && (
          <div className="space-y-1.5">
            <Bar label="parse + log (I/O, overlapped)" width="40%" tone="bg-teal-400" />
            <Bar label="predict (CPU, still yours to pay)" width="55%" tone="bg-amber-400" />
          </div>
        )}
        {pillar.visual === 'docs' && (
          <div className="flex gap-2 text-[11px]">
            <span className="px-2 py-1 rounded-md bg-gray-800 text-teal-200 font-mono">/docs</span>
            <span className="px-2 py-1 rounded-md bg-gray-800 text-cyan-200 font-mono">/redoc</span>
          </div>
        )}
        {pillar.visual === 'libs' && (
          <div className="flex flex-wrap gap-1.5">
            {['sklearn', 'pytorch', 'tensorflow', 'xgboost', 'spacy', 'pandas', 'numpy'].map((name) => (
              <span key={name} className="text-[10px] px-2 py-1 rounded-full bg-gray-800 text-gray-200 font-mono">
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Frame>
  );
}

function Chip({ children, tone = 'teal' }) {
  const tones = {
    teal: 'border-teal-500/40 text-teal-100 bg-teal-500/10',
    rose: 'border-rose-500/40 text-rose-100 bg-rose-500/10',
    amber: 'border-amber-500/40 text-amber-100 bg-amber-500/10',
    slate: 'border-gray-600 text-gray-200 bg-gray-800',
  };
  return <span className={`px-2 py-1 rounded-md border font-mono ${tones[tone]}`}>{children}</span>;
}

const MENU = [
  {
    id: 'predict',
    dishName: 'Predict species',
    order: 'features [5.1, 3.5, 1.4, 0.2]',
    dish: 'setosa · 0.97',
    recipe: 'StandardScaler + logistic regression',
  },
  {
    id: 'info',
    dishName: 'Model info',
    order: 'GET /models/iris',
    dish: '{ name, version, n_features }',
    recipe: 'read a JSON file from disk',
  },
  {
    id: 'health',
    dishName: 'Health check',
    order: 'GET /health',
    dish: '{ "status": "ok" }',
    recipe: 'no model call',
  },
];

const ORDER_PHASES = [
  { id: 'menu', caption: 'The menu is the only thing the client can see. Choose a dish, then step forward.' },
  { id: 'ticket', caption: 'The order is the request. Features go to the kitchen. The recipe does not.' },
  { id: 'kitchen', caption: 'The server is working. The recipe stays in the kitchen — a client never receives it.' },
  { id: 'served', caption: 'Only the dish comes back. That is the prediction. Peek if you want to see what was hidden.' },
];

export function RestaurantVisualizer() {
  const [orderId, setOrderId] = useState('predict');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [showRecipe, setShowRecipe] = useState(false);
  const order = MENU.find((item) => item.id === orderId);
  const phase = ORDER_PHASES[phaseIndex].id;

  const go = (next) => {
    setShowRecipe(false);
    setPhaseIndex(Math.min(ORDER_PHASES.length - 1, Math.max(0, next)));
  };

  const place = (id) => {
    setOrderId(id);
    setShowRecipe(false);
    setPhaseIndex(1);
  };

  return (
    <Frame
      title="The menu is the API"
      hint="Pick a dish, then use Prev step and Next step. The kitchen does not jump ahead on its own."
      footer={
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => go(phaseIndex - 1)}
            disabled={phaseIndex === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev step
          </button>
          <span className="text-[11px] font-mono text-teal-200 px-1">
            {phaseIndex + 1} / {ORDER_PHASES.length}
          </span>
          <button
            type="button"
            onClick={() => go(phaseIndex + 1)}
            disabled={phaseIndex === ORDER_PHASES.length - 1}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next step
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      }
    >
      <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {[
          { phaseId: 'menu', metaphor: 'Menu', api: 'Endpoint' },
          { phaseId: 'ticket', metaphor: 'Order', api: 'JSON body' },
          { phaseId: 'kitchen', metaphor: 'Recipe', api: 'Model' },
          { phaseId: 'served', metaphor: 'Dish', api: 'Prediction' },
        ].map((row) => (
          <div
            key={row.phaseId}
            className={`rounded-lg border px-2 py-1.5 ${
              phase === row.phaseId ? 'border-teal-400/70 bg-teal-500/10' : 'border-gray-800 text-gray-500'
            }`}
          >
            <p className="text-[10px] text-gray-400">{row.metaphor}</p>
            <p className="text-[11px] font-semibold text-white">{row.api}</p>
          </div>
        ))}
      </div>
      <div className="mb-3">
        <Lesson title="Restaurant word → API word">
          {phase === 'menu' && `“${order.dishName}” is an endpoint. The client picks from the menu and never walks into the kitchen.`}
          {phase === 'ticket' && `The order is the request: ${order.order}. That is all the server is given.`}
          {phase === 'kitchen' && `The recipe is “${order.recipe}”. It runs on the server. It is not part of the API, which is why it stays blurred.`}
          {phase === 'served' && `The dish is the response: ${order.dish}. The client got a prediction and still does not have the weights.`}
        </Lesson>
      </div>
      <div className="grid sm:grid-cols-3 gap-2">
        <div className="rounded-xl border border-gray-700 p-3">
          <div className="flex items-center gap-1.5 text-teal-300 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5" /> You (client)
          </div>
          <div className="space-y-1.5">
            {MENU.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => place(item.id)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded-lg border ${
                  orderId === item.id
                    ? 'border-teal-400/60 bg-teal-500/10 text-white'
                    : 'border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                <Utensils className="w-3 h-3 inline mr-1" />
                {item.dishName}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-700 p-3">
          <div className="flex items-center gap-1.5 text-amber-200 text-xs font-semibold mb-2">
            <ChefHat className="w-3.5 h-3.5" /> Kitchen (server)
          </div>
          <p className="text-[11px] text-gray-400 mb-2">
            {phase === 'menu' && 'Waiting for an order.'}
            {phase === 'ticket' && 'Ticket received.'}
            {phase === 'kitchen' && 'Cooking… recipe stays in the kitchen.'}
            {phase === 'served' && 'Dish plated. Recipe still not on the plate.'}
          </p>
          {order && phase !== 'menu' && (
            <div className={`text-[11px] font-mono rounded-lg p-2 border ${showRecipe ? 'border-rose-400/50 text-rose-100' : 'border-gray-700 text-gray-500 blur-[2px] select-none'}`}>
              {order.recipe}
            </div>
          )}
          {order && phase === 'served' && (
            <button
              type="button"
              onClick={() => setShowRecipe((v) => !v)}
              className="mt-2 text-[11px] text-amber-200 underline"
            >
              {showRecipe ? 'Hide what the client never gets' : 'Peek at the recipe (not part of the API)'}
            </button>
          )}
        </div>
        <div className="rounded-xl border border-gray-700 p-3">
          <p className="text-xs font-semibold text-emerald-200 mb-2">What you receive</p>
          {phase === 'served' && order ? (
            <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-2 text-xs text-emerald-50">
              <p className="font-mono">{order.dish}</p>
              <p className="text-[11px] text-emerald-200/70 mt-1">From order: {order.order}</p>
            </div>
          ) : (
            <p className="text-[11px] text-gray-500">Nothing yet. The plate is empty until you step to the response.</p>
          )}
        </div>
      </div>
    </Frame>
  );
}

const EXCHANGE = [
  {
    caption: 'Nothing has been sent.',
    packet: 'none',
    server: 'idle',
    beat: 'Before the call',
    means: 'The client knows a URL. The server is this FastAPI app plus the model. No message exists yet.',
  },
  {
    caption: 'The client sends the action and the data.',
    packet: 'request',
    server: 'idle',
    beat: '1. Client request',
    means: 'POST /predict names the action. The body carries the features, [5.1, 3.5, 1.4, 0.2]. FastAPI has not run the model yet.',
  },
  {
    caption: 'The server validates, then runs the model.',
    packet: 'none',
    server: 'work',
    beat: '2. Server processing',
    means: 'This middle beat is your Python function. FastAPI checks the body, then calls predict(). The client is waiting.',
  },
  {
    caption: 'The server returns a status and the result.',
    packet: 'response',
    server: 'done',
    beat: '3. Server response',
    means: '200 means it worked. The body is {"label": "setosa", "score": 0.97}. A failure would still be a response — a status plus an explanation, not silence.',
  },
];

export function ClientServerVisualizer() {
  const stepper = useStepper(EXCHANGE.length, 1400);
  const frame = EXCHANGE[stepper.index];

  return (
    <Frame
      title="Request in, response out"
      hint="Step through the exchange, or press Play. The next slides open the request and the response and name every field."
      footer={
        <div className="flex items-center justify-end gap-3 flex-wrap">
          <StepControls stepper={stepper} total={EXCHANGE.length} />
        </div>
      }
    >
      <div className="mb-3">
        <Lesson title={frame.beat}>{frame.means}</Lesson>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
        <div className="rounded-xl border border-gray-700 p-3 text-center">
          <User className="w-5 h-5 mx-auto text-teal-300 mb-1" />
          <p className="text-xs font-semibold text-white">Client</p>
          <p className="text-[10px] text-gray-400">browser, app, service</p>
        </div>
        <div className="w-28 sm:w-40 relative h-24">
          <div
            className={`absolute left-0 right-0 top-3 text-center transition-opacity ${
              frame.packet === 'request' ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div className="text-[10px] font-mono text-teal-200 border border-teal-500/40 rounded-md px-1 py-1 bg-gray-950">
              POST /predict
              <br />
              features…
            </div>
            <p className="text-[9px] text-teal-400 mt-0.5">HTTP request →</p>
          </div>
          <div
            className={`absolute left-0 right-0 bottom-0 text-center transition-opacity ${
              frame.packet === 'response' ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <p className="text-[9px] text-emerald-400 mb-0.5">← HTTP response</p>
            <div className="text-[10px] font-mono text-emerald-200 border border-emerald-500/40 rounded-md px-1 py-1 bg-gray-950">
              200 OK
              <br />
              setosa
            </div>
          </div>
        </div>
        <div
          className={`rounded-xl border p-3 text-center transition-colors ${
            frame.server === 'work'
              ? 'border-amber-400/70 bg-amber-500/10'
              : frame.server === 'done'
                ? 'border-emerald-400/60 bg-emerald-500/10'
                : 'border-gray-700'
          }`}
        >
          <Server className="w-5 h-5 mx-auto text-cyan-300 mb-1" />
          <p className="text-xs font-semibold text-white">Server</p>
          <p className="text-[10px] text-gray-400">
            {frame.server === 'work' ? 'validating + inference' : 'FastAPI application'}
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {['1. Request', '2. Your function', '3. Response'].map((label, index) => (
          <div
            key={label}
            className={`rounded-lg border px-2 py-1.5 text-[11px] ${
              stepper.index === index + 1 ? 'border-teal-400/70 bg-teal-500/10 text-white' : 'border-gray-800 text-gray-500'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </Frame>
  );
}

const REQUEST_PARTS = [
  {
    id: 'method',
    label: 'Method',
    detail: 'The verb. POST asks the server to do something with the body — here, run the model.',
    fastapi: 'FastAPI maps this verb onto the decorator: @app.post. GET would be a different function, usually with no body.',
  },
  {
    id: 'url',
    label: 'URL',
    detail: 'Which resource. /predict is the inference endpoint. /models/iris would be a different resource.',
    fastapi: 'The path in the decorator is this URL. /predict and /models/iris are two different functions, even in the same app.',
  },
  {
    id: 'headers',
    label: 'Headers',
    detail: 'Metadata. Content-Type says the body is JSON. Authorization carries credentials.',
    fastapi: 'Headers are not model fields. Content-Type tells FastAPI to parse JSON. Authorization is checked before your function sees the features.',
  },
  {
    id: 'body',
    label: 'Body',
    detail: 'Optional. For inference this is the feature payload. GET usually has no body.',
    fastapi: 'This JSON becomes the Pydantic argument. [5.1, 3.5, 1.4, 0.2] are the features predict() will see — if the types match.',
  },
];

export function RequestAnatomyVisualizer() {
  const [part, setPart] = useState('body');
  const [method, setMethod] = useState('POST');
  const hasBody = method === 'POST' || method === 'PUT' || method === 'PATCH';
  const selected = REQUEST_PARTS.find((item) => item.id === part);
  const highlight = (id) => (part === id ? 'bg-teal-500/20 text-teal-50' : 'text-gray-300');

  return (
    <Frame
      title="Build the HTTP request"
      hint="Change the verb, then click a line in the message. GET drops the body — there is nothing to submit."
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        {['GET', 'POST', 'PUT', 'DELETE'].map((verb) => (
          <button key={verb} type="button" className={tabClass(method === verb)} onClick={() => setMethod(verb)}>
            {verb}
          </button>
        ))}
      </div>
      <pre className="font-mono text-[11px] leading-6 rounded-xl border border-gray-700 bg-gray-950 p-3 overflow-x-auto whitespace-pre-wrap">
        <button type="button" className={`rounded px-1 ${highlight('method')}`} onClick={() => setPart('method')}>
          {method}
        </button>
        {' '}
        <button type="button" className={`rounded px-1 ${highlight('url')}`} onClick={() => setPart('url')}>
          /predict
        </button>
        {' HTTP/1.1\n'}
        <button type="button" className={`rounded px-1 ${highlight('headers')}`} onClick={() => setPart('headers')}>
          Host: ml.internal
        </button>
        {'\n'}
        <button type="button" className={`rounded px-1 ${highlight('headers')}`} onClick={() => setPart('headers')}>
          Content-Type: application/json
        </button>
        {'\n'}
        <button type="button" className={`rounded px-1 ${highlight('headers')}`} onClick={() => setPart('headers')}>
          Authorization: Bearer tk_live
        </button>
        {'\n\n'}
        <button
          type="button"
          className={`rounded px-1 ${hasBody ? highlight('body') : 'text-gray-600'}`}
          onClick={() => hasBody && setPart('body')}
        >
          {hasBody ? '{ "features": [5.1, 3.5, 1.4, 0.2] }' : '# no body on this verb'}
        </button>
      </pre>
      <div className="mt-3">
        <Lesson title={`${selected.label} — what FastAPI does with it`}>
          {part === 'body' && !hasBody
            ? 'GET has no body, so there are no features to validate. Inference is usually POST because the feature vector has to travel in this slot.'
            : selected.fastapi}
        </Lesson>
      </div>
    </Frame>
  );
}

const STATUSES = [
  { code: 200, name: 'OK', tone: 'emerald', body: '{ "label": "setosa", "score": 0.97 }', note: 'Inference succeeded. The body is the prediction.' },
  { code: 201, name: 'Created', tone: 'emerald', body: '{ "id": "pred_456" }', note: 'A new resource was stored — less common for pure predict, natural if you save the result.' },
  { code: 400, name: 'Bad Request', tone: 'rose', body: '{ "detail": "malformed JSON" }', note: 'The message itself is broken. The model never starts.' },
  { code: 404, name: 'Not Found', tone: 'amber', body: '{ "detail": "model iris-v9 not found" }', note: 'The URL does not name a resource this server has.' },
  { code: 422, name: 'Unprocessable', tone: 'rose', body: '{ "detail": [{ "loc": ["body", "age"], "msg": "value is not a valid integer" }] }', note: 'FastAPI’s Pydantic failure. JSON parsed, but it does not match the model. predict() does not run.' },
  { code: 500, name: 'Server Error', tone: 'rose', body: '{ "detail": "Internal Server Error" }', note: 'The model threw, or something else crashed after validation.' },
];

export function ResponseAnatomyVisualizer() {
  const [code, setCode] = useState(200);
  const [part, setPart] = useState('status');
  const status = STATUSES.find((item) => item.code === code);
  const tone =
    status.tone === 'emerald' ? 'text-emerald-300' : status.tone === 'amber' ? 'text-amber-300' : 'text-rose-300';
  const mark = (id) => (part === id ? 'bg-teal-500/15' : '');

  return (
    <Frame
      title="What comes back"
      hint="Click a status code. 422 is the one you will see most often while a client is still learning your schema."
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        {STATUSES.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => {
              setCode(item.code);
              setPart('status');
            }}
            className={tabClass(code === item.code)}
          >
            {item.code}
          </button>
        ))}
      </div>
      <pre className="font-mono text-[11px] leading-6 rounded-xl border border-gray-700 bg-gray-950 p-3 overflow-x-auto whitespace-pre-wrap">
        <button type="button" className={`block w-full text-left rounded px-1 ${mark('status')}`} onClick={() => setPart('status')}>
          <span className={tone}>HTTP/1.1 {status.code} {status.name}</span>
        </button>
        <button type="button" className={`block w-full text-left rounded px-1 ${mark('headers')}`} onClick={() => setPart('headers')}>
          Content-Type: application/json
        </button>
        <button type="button" className={`block w-full text-left rounded px-1 ${mark('headers')}`} onClick={() => setPart('headers')}>
          Content-Length: {status.body.length}
        </button>
        <span className="block"> </span>
        <button type="button" className={`block w-full text-left rounded px-1 ${mark('body')}`} onClick={() => setPart('body')}>
          {status.body}
        </button>
      </pre>
      <div className="mt-3">
        <Lesson title={part === 'status' ? `${status.code} ${status.name}` : part === 'headers' ? 'Headers' : 'Body'}>
          {part === 'headers'
            ? 'Headers describe the body. Content-Type: application/json means the client should parse JSON, whether the status is 200 or 422.'
            : part === 'body'
              ? status.code < 300
                ? `This body is the prediction the client asked for: ${status.body}`
                : `This body is the explanation, not a prediction. The model result is absent on purpose. ${status.note}`
              : status.note}
        </Lesson>
      </div>
    </Frame>
  );
}

const REST_TONE = {
  teal: { card: 'border-teal-400/50 bg-teal-500/10', label: 'text-teal-300', mark: 'bg-teal-500/25 text-teal-50 ring-1 ring-teal-400/60' },
  violet: { card: 'border-violet-400/50 bg-violet-500/10', label: 'text-violet-300', mark: 'bg-violet-500/25 text-violet-50 ring-1 ring-violet-400/60' },
  amber: { card: 'border-amber-400/50 bg-amber-500/10', label: 'text-amber-300', mark: 'bg-amber-500/25 text-amber-50 ring-1 ring-amber-400/60' },
  cyan: { card: 'border-cyan-400/50 bg-cyan-500/10', label: 'text-cyan-300', mark: 'bg-cyan-500/25 text-cyan-50 ring-1 ring-cyan-400/60' },
  gray: { card: 'border-gray-600 bg-gray-800/40', label: 'text-gray-300', mark: '' },
};

const REST_IDEAS = [
  { id: 'resources', label: '1 · Resources', tone: 'teal' },
  { id: 'repr', label: '2 · Representations', tone: 'violet' },
  { id: 'stateless', label: '3 · Statelessness', tone: 'amber' },
  { id: 'methods', label: '4 · Standard methods', tone: 'cyan' },
  { id: 'together', label: 'All four in one request', tone: 'gray' },
];

function RuleCard({ tone, rule, analogy }) {
  const style = REST_TONE[tone];
  return (
    <div className={`rounded-xl border p-3 ${style.card}`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider ${style.label}`}>The rule in plain words</p>
      <p className="text-sm text-white font-semibold mt-0.5 leading-snug">{rule}</p>
      <p className="text-[11px] text-gray-300 mt-1.5 leading-relaxed">
        <span className="font-semibold text-gray-100">Everyday version: </span>
        {analogy}
      </p>
    </div>
  );
}

const RESOURCE_TREE = [
  {
    url: '/models',
    depth: 0,
    kind: 'collection',
    names: 'Every model this server offers',
    sample: '[{ "name": "iris-classifier" }, { "name": "spam-filter" }]',
  },
  {
    url: '/models/iris-classifier',
    depth: 1,
    kind: 'one item',
    names: 'One specific model — the iris classifier you trained',
    sample: '{ "name": "iris-classifier", "version": "v1", "status": "ready" }',
  },
  {
    url: '/predict',
    depth: 0,
    kind: 'processing resource',
    names: 'The prediction service. You send it features; it answers with a label.',
    sample: 'POST { "features": [5.1, 3.5, 1.4, 0.2] } → { "label": "setosa" }',
  },
  {
    url: '/predictions',
    depth: 0,
    kind: 'collection',
    names: 'Every prediction result the server has stored',
    sample: '[{ "id": 123 }, { "id": 456 }]',
  },
  {
    url: '/predictions/123',
    depth: 1,
    kind: 'one item',
    names: 'One prediction result — the answer given for request #123',
    sample: '{ "id": 123, "label": "setosa", "score": 0.97 }',
  },
];

const RPC_URLS = ['/getModelInfo?name=iris', '/runPredictionNow', '/fetchAllResults', '/fetchResult?id=123', '/removeResult?id=123'];

function ResourcesDemo() {
  const [picked, setPicked] = useState('/predictions/123');
  const [view, setView] = useState('rest');
  const item = RESOURCE_TREE.find((entry) => entry.url === picked);

  return (
    <div className="space-y-3">
      <RuleCard
        tone="teal"
        rule="Every piece of information is a “thing” (a resource), and every thing has its own unique address — its URL."
        analogy="A library. Every book has its own shelf code. You ask for “QA76.73”, not “that blue book I looked at yesterday.”"
      />
      <div className="flex gap-1.5">
        <button type="button" className={tabClass(view === 'rest')} onClick={() => setView('rest')}>
          With the rule
        </button>
        <button type="button" className={tabClass(view === 'rpc')} onClick={() => setView('rpc')}>
          Without the rule
        </button>
      </div>
      {view === 'rest' ? (
        <div className="grid sm:grid-cols-[1fr_1.1fr] gap-2">
          <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-2 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 px-1 mb-1">The server’s addresses — click one</p>
            {RESOURCE_TREE.map((entry) => (
              <button
                key={entry.url}
                type="button"
                onClick={() => setPicked(entry.url)}
                style={{ paddingLeft: `${8 + entry.depth * 16}px` }}
                className={`w-full text-left rounded-lg py-1.5 pr-2 font-mono text-[11px] transition-colors ${
                  picked === entry.url ? 'bg-teal-500/20 text-teal-50' : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                {entry.depth ? '└ ' : ''}
                {entry.url}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-teal-400/40 bg-gray-950/70 p-3 space-y-2">
            <p className="font-mono text-xs text-teal-100">{item.url}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">{item.kind}</p>
            <p className="text-xs text-white">{item.names}</p>
            <div>
              <p className="text-[10px] text-gray-500 mb-0.5">what you get when you ask for it</p>
              <p className="font-mono text-[10px] text-cyan-100 break-words">{item.sample}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/5 p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-rose-300 mb-1">Action-named URLs (not REST)</p>
          {RPC_URLS.map((url) => (
            <p key={url} className="font-mono text-[11px] text-rose-100">{url}</p>
          ))}
        </div>
      )}
      <Lesson title={view === 'rest' ? 'Why this helps' : 'What goes wrong without it'}>
        {view === 'rest'
          ? 'URLs are nouns. /predictions/123 always means the same result, whoever asks and whenever they ask. Collections (/predictions) hold items (/predictions/123), so the structure is guessable. The text’s examples — a user, a product, a prediction result — would be /users/42, /products/7, /predictions/123.'
          : 'The URLs are verbs and every API invents its own. Nothing tells you that fetchResult and removeResult touch the same thing. REST moves the action into the HTTP method (rule 4) and keeps the URL as the name of the thing.'}
      </Lesson>
    </div>
  );
}

function renderModel(model, format) {
  if (format === 'xml') {
    return `<model>
  <name>iris-classifier</name>
  <version>${model.version}</version>
  <accuracy>${model.accuracy}</accuracy>
  <status>${model.status}</status>
</model>`;
  }
  return `{
  "name": "iris-classifier",
  "version": "${model.version}",
  "accuracy": ${model.accuracy},
  "status": "${model.status}"
}`;
}

const MODEL_V1 = { version: 'v1', accuracy: 0.96, status: 'ready' };
const MODEL_V2 = { version: 'v2', accuracy: 0.97, status: 'ready' };

function RepresentationsDemo() {
  const [server, setServer] = useState(MODEL_V1);
  const [format, setFormat] = useState('json');
  const [copy, setCopy] = useState(null);
  const stale = copy && copy.version !== server.version;

  const fetchCopy = () => setCopy(server);

  let lesson;
  if (!copy) {
    lesson = 'Press GET. The model on the left is the resource: a Python object with a weight matrix in server memory. Watch what actually travels to the client.';
  } else if (stale) {
    lesson = 'The server now runs v2, but the client still holds the v1 snapshot. A representation is the state at the moment you asked. Press GET again to receive the current state.';
  } else {
    lesson = `The client got a ${format.toUpperCase()} description of the model — name, version, accuracy — not the model itself. The weights never left the server. Switch JSON/XML: same resource, different encoding. ML APIs almost always use JSON, which Pydantic parses.`;
  }

  return (
    <div className="space-y-3">
      <RuleCard
        tone="violet"
        rule="You never receive the resource itself. You receive a representation — a snapshot of its current state, written in a format such as JSON or XML."
        analogy="A weather report. You get a written description of today’s weather; the weather itself stays outside."
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={fetchCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
        >
          <Send className="w-3.5 h-3.5" /> GET /models/iris-classifier
        </button>
        <button type="button" className={tabClass(format === 'json')} onClick={() => setFormat('json')}>
          Accept: JSON
        </button>
        <button type="button" className={tabClass(format === 'xml')} onClick={() => setFormat('xml')}>
          Accept: XML
        </button>
        <button
          type="button"
          onClick={() => setServer((current) => (current.version === 'v1' ? MODEL_V2 : MODEL_V1))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Deploy {server.version === 'v1' ? 'v2' : 'v1'} on the server
        </button>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-stretch">
        <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
            <Server className="w-3 h-3" /> The resource (on the server)
          </p>
          <div className="font-mono text-[10px] space-y-0.5 text-gray-200">
            <p>IrisClassifier object</p>
            <p className="text-gray-500">weights: 4×3 float matrix</p>
            <p className="text-gray-500">bias: 3 floats</p>
            <p>version = {server.version}</p>
            <p>accuracy = {server.accuracy}</p>
            <p>status = {server.status}</p>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Lives in memory. Never sent as-is.</p>
        </div>
        <div className="flex items-center text-[10px] text-violet-300 text-center">
          {copy ? '→ snapshot →' : '→'}
        </div>
        <div className={`rounded-xl border p-3 ${stale ? 'border-amber-400/60 bg-amber-500/5' : copy ? 'border-violet-400/50 bg-violet-500/5' : 'border-gray-800'}`}>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
            <User className="w-3 h-3" /> What the client received
          </p>
          {copy ? (
            <>
              <p className="font-mono text-[10px] text-gray-400">
                Content-Type: application/{format}
              </p>
              <pre className="font-mono text-[10px] text-violet-100 mt-1 whitespace-pre-wrap">{renderModel(copy, format)}</pre>
              {stale && <p className="text-[10px] text-amber-200 mt-1">Out of date — the server changed after this GET.</p>}
            </>
          ) : (
            <p className="text-[11px] text-gray-500">Nothing yet.</p>
          )}
        </div>
      </div>
      <Lesson title="What this shows">{lesson}</Lesson>
    </div>
  );
}

const STATE_SCRIPT = {
  stateful: [
    {
      target: null,
      request: null,
      reply: null,
      memA: [],
      memB: [],
      caption: 'Two identical servers sit behind a load balancer. Any request may land on either one. This design lets the server remember the client.',
    },
    {
      target: 'A',
      request: 'POST /session/start\n{ "features": [5.1, 3.5, 1.4, 0.2] }',
      reply: '200 { "session": 9 }',
      ok: true,
      memA: ['session 9 → features [5.1, 3.5, 1.4, 0.2]'],
      memB: [],
      caption: 'Request 1 lands on Server A. A stores the features in its own memory and hands back a ticket: “session 9”.',
    },
    {
      target: 'B',
      request: 'POST /predict\n{ "session": 9 }',
      reply: '400 { "detail": "unknown session 9" }',
      ok: false,
      memA: ['session 9 → features [5.1, 3.5, 1.4, 0.2]'],
      memB: [],
      caption: 'Request 2 only says “session 9”. The load balancer sent it to Server B, which has never heard of session 9. The request fails.',
    },
    {
      target: 'A',
      restart: true,
      request: 'POST /predict\n{ "session": 9 }',
      reply: '400 { "detail": "unknown session 9" }',
      ok: false,
      memA: [],
      memB: [],
      caption: 'Even if every call went to Server A, a restart or a new deploy wipes its memory. Session 9 is gone, and the client has to start over.',
    },
  ],
  stateless: [
    {
      target: null,
      request: null,
      reply: null,
      memA: [],
      memB: [],
      caption: 'The same two servers behind a load balancer. This time every request is complete on its own.',
    },
    {
      target: 'A',
      request: 'POST /predict\nAuthorization: Bearer tk_91\n{ "features": [5.1, 3.5, 1.4, 0.2] }',
      reply: '200 { "label": "setosa" }',
      ok: true,
      memA: [],
      memB: [],
      caption: 'Request 1 lands on Server A. It carries who you are (the token) and all the features. A answers and keeps nothing about you.',
    },
    {
      target: 'B',
      request: 'POST /predict\nAuthorization: Bearer tk_91\n{ "features": [6.7, 3.0, 5.2, 2.3] }',
      reply: '200 { "label": "virginica" }',
      ok: true,
      memA: [],
      memB: [],
      caption: 'Request 2 lands on Server B. It carries its own token and its own features, so B answers without knowing request 1 ever happened.',
    },
    {
      target: 'A',
      restart: true,
      request: 'POST /predict\nAuthorization: Bearer tk_91\n{ "features": [5.9, 3.0, 4.2, 1.5] }',
      reply: '200 { "label": "versicolor" }',
      ok: true,
      memA: [],
      memB: [],
      caption: 'Server A restarts, and nothing is lost because nothing was stored. Add a third server and it can answer immediately.',
    },
  ],
};

function StatelessDemo() {
  const [mode, setMode] = useState('stateless');
  const stepper = useStepper(4, 1800);
  const frame = STATE_SCRIPT[mode][stepper.index];

  const switchMode = (next) => {
    setMode(next);
    stepper.reset();
  };

  const serverBox = (name, memory) => {
    const active = frame.target === name;
    const failed = active && frame.ok === false;
    return (
      <div
        className={`rounded-xl border p-2.5 transition-colors ${
          failed ? 'border-rose-400/70 bg-rose-500/10' : active ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-gray-700'
        }`}
      >
        <p className="text-xs font-semibold text-white flex items-center gap-1">
          <Server className="w-3.5 h-3.5" /> Server {name}
          {frame.restart && name === 'A' && <span className="text-[10px] text-amber-200 ml-1">(just restarted)</span>}
        </p>
        <p className="text-[10px] text-gray-500 mt-1">memory about clients</p>
        {memory.length ? (
          memory.map((line) => (
            <p key={line} className="font-mono text-[10px] text-amber-100">{line}</p>
          ))
        ) : (
          <p className="font-mono text-[10px] text-gray-600">empty</p>
        )}
      </div>
    );
  };

  const last = stepper.index === 3;

  return (
    <div className="space-y-3">
      <RuleCard
        tone="amber"
        rule="Every request must carry everything needed to handle it. The server keeps no memory of the client between requests."
        analogy="Calling a help line where a different agent picks up every time. “As I said earlier…” doesn’t work — you repeat your account number on every call."
      />
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" className={tabClass(mode === 'stateful')} onClick={() => switchMode('stateful')}>
          Server remembers you (stateful)
        </button>
        <button type="button" className={tabClass(mode === 'stateless')} onClick={() => switchMode('stateless')}>
          Every request complete (stateless)
        </button>
      </div>
      <div className="grid grid-cols-[1fr_1.4fr] gap-2 items-start">
        <div className="space-y-2">
          <div className="rounded-xl border border-gray-700 p-2.5">
            <p className="text-xs font-semibold text-white flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-teal-300" /> Client sends
            </p>
            <pre className="font-mono text-[10px] text-teal-100 mt-1 whitespace-pre-wrap">{frame.request || '—'}</pre>
          </div>
          <div
            className={`rounded-xl border p-2.5 ${
              !frame.reply ? 'border-gray-800' : frame.ok ? 'border-emerald-400/50' : 'border-rose-400/60'
            }`}
          >
            <p className="text-xs font-semibold text-white">Reply</p>
            <p className={`font-mono text-[10px] mt-1 ${frame.ok ? 'text-emerald-100' : 'text-rose-100'}`}>{frame.reply || '—'}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="rounded-lg border border-gray-700 bg-gray-900/60 px-2.5 py-1.5 text-[11px] text-gray-300 text-center">
            Load balancer {frame.target ? `→ sends this request to Server ${frame.target}` : '— picks any free server'}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {serverBox('A', frame.memA)}
            {serverBox('B', frame.memB)}
          </div>
        </div>
      </div>
      <Lesson title={`Step ${stepper.index + 1} of 4`}>
        <p>{frame.caption}</p>
        {last && (
          <p className="text-gray-300 mt-1">
            {mode === 'stateful'
              ? 'This is why the text says statelessness improves reliability (a crash loses nothing) and scalability (any server can take any request). Switch to the stateless version.'
              : 'Reliability: a crash or restart loses nothing. Scalability: add servers freely, because none of them needs to know your history. That is what the text means.'}
          </p>
        )}
      </Lesson>
      <StepControls stepper={stepper} total={4} />
    </div>
  );
}

const METHOD_GRID = [
  {
    url: '/models/iris-classifier',
    cells: { GET: 'Read the model’s info', POST: null, PUT: 'Replace the model’s config', DELETE: 'Retire this model' },
  },
  {
    url: '/predictions',
    cells: { GET: 'List every stored result', POST: 'Create a new stored result', PUT: null, DELETE: null },
  },
  {
    url: '/predictions/123',
    cells: { GET: 'Read result 123', POST: null, PUT: 'Replace result 123 (e.g. a corrected label)', DELETE: 'Delete result 123' },
  },
  {
    url: '/predict',
    cells: { GET: null, POST: 'Run the model on the features in the body', PUT: null, DELETE: null },
  },
];

const GRID_VERBS = ['GET', 'POST', 'PUT', 'DELETE'];

function MethodsDemo() {
  const [cell, setCell] = useState({ url: '/predictions/123', verb: 'DELETE' });
  const row = METHOD_GRID.find((entry) => entry.url === cell.url);
  const meaning = row.cells[cell.verb];

  return (
    <div className="space-y-3">
      <RuleCard
        tone="cyan"
        rule="Use the same few HTTP verbs — GET, POST, PUT, DELETE — on every resource. The URL says which thing; the verb says what to do to it."
        analogy="Every car has the same pedals. Learn them once and you can drive any car, instead of learning new controls for each model."
      />
      <div className="rounded-xl border border-gray-700 overflow-hidden">
        <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] text-[10px] uppercase tracking-wider text-gray-400 bg-gray-800/70">
          <span className="px-2 py-1.5">resource ↓ · verb →</span>
          {GRID_VERBS.map((verb) => (
            <span key={verb} className="px-2 py-1.5 font-mono text-center">{verb}</span>
          ))}
        </div>
        {METHOD_GRID.map((entry) => (
          <div key={entry.url} className="grid grid-cols-[1.4fr_repeat(4,1fr)] border-t border-gray-800">
            <span className="px-2 py-1.5 font-mono text-[10px] text-gray-200 self-center">{entry.url}</span>
            {GRID_VERBS.map((verb) => {
              const on = cell.url === entry.url && cell.verb === verb;
              const offered = entry.cells[verb] !== null;
              return (
                <button
                  key={verb}
                  type="button"
                  onClick={() => setCell({ url: entry.url, verb })}
                  className={`m-0.5 rounded-md py-1.5 text-[10px] font-semibold transition-colors ${
                    on
                      ? offered
                        ? 'bg-cyan-500/25 text-cyan-50 ring-1 ring-cyan-400/60'
                        : 'bg-rose-500/20 text-rose-100 ring-1 ring-rose-400/60'
                      : offered
                        ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                        : 'bg-gray-900 text-gray-600 hover:bg-gray-800'
                  }`}
                >
                  {offered ? '✓' : '—'}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <Lesson title={`${cell.verb} ${cell.url}`}>
        {meaning ? (
          <p>
            Means: <strong className="text-white">{meaning}</strong>. The URL alone doesn’t say this; the verb does. Put a
            different verb on the same URL and you get a different action.
          </p>
        ) : (
          <p>
            Not offered here. FastAPI would answer <span className="font-mono">405 Method Not Allowed</span> — the address
            exists, but not for that verb.
          </p>
        )}
      </Lesson>
      <div className="rounded-xl border border-rose-400/30 bg-rose-500/5 p-2.5 text-[11px] text-gray-300">
        <span className="font-semibold text-rose-200">Without the rule: </span>
        <span className="font-mono text-rose-100">getModelInfo, updateModelSettings, retireModel, fetchResult, removeResult, doPrediction</span>{' '}
        — six made-up action names to learn, and a new list for every API. With the rule: four verbs that mean the same everywhere.
        The previous slide shows what each verb does when you send it twice.
      </div>
    </div>
  );
}

const TOGETHER_REQUEST = [
  [{ t: 'POST', tag: 'methods' }, { t: ' ' }, { t: '/predict', tag: 'resources' }, { t: ' HTTP/1.1' }],
  [{ t: 'Host: ml.example.com' }],
  [{ t: 'Authorization: Bearer tk_live_91', tag: 'stateless' }],
  [{ t: 'Content-Type: application/json', tag: 'repr' }],
  [{ t: 'Accept: application/json', tag: 'repr' }],
  [{ t: '' }],
  [{ t: '{ "model": "iris-classifier", "features": [5.1, 3.5, 1.4, 0.2] }', tag: 'stateless repr' }],
];

const TOGETHER_RESPONSE = [
  [{ t: 'HTTP/1.1 200 OK' }],
  [{ t: 'Content-Type: application/json', tag: 'repr' }],
  [{ t: '' }],
  [{ t: '{ "label": "setosa", "score": 0.97 }', tag: 'repr' }],
];

const TOGETHER_NOTES = {
  resources: {
    tone: 'teal',
    title: '1 · Resource',
    text: '/predict names the thing being used — the prediction service. The URL is a noun; nothing in it says “run” or “do”.',
  },
  repr: {
    tone: 'violet',
    title: '2 · Representation',
    text: 'Content-Type says “my body is JSON”; Accept says “please answer in JSON”. Both bodies are JSON snapshots, not Python objects.',
  },
  stateless: {
    tone: 'amber',
    title: '3 · Statelessness',
    text: 'The token says who you are and the body holds every feature. The server needs nothing from earlier calls, so any replica can answer.',
  },
  methods: {
    tone: 'cyan',
    title: '4 · Standard method',
    text: 'POST is the action. The same URL with GET would be refused (405), because /predict only accepts POST.',
  },
};

function TogetherDemo() {
  const [focus, setFocus] = useState('resources');
  const note = TOGETHER_NOTES[focus];

  const renderLines = (lines) =>
    lines.map((segments, i) => (
      <div key={i} className="min-h-[1.1rem]">
        {segments.map((segment, j) => {
          const hit = segment.tag && segment.tag.split(' ').includes(focus);
          return (
            <span key={j} className={`rounded px-0.5 transition-colors ${hit ? REST_TONE[note.tone].mark : 'text-gray-400'}`}>
              {segment.t}
            </span>
          );
        })}
      </div>
    ));

  return (
    <div className="space-y-3">
      <Lesson title="One ordinary prediction call already follows all four rules">
        Click a rule. The parts of the request and the response that obey it light up.
      </Lesson>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(TOGETHER_NOTES).map(([id, item]) => (
          <button key={id} type="button" className={tabClass(focus === id)} onClick={() => setFocus(id)}>
            {item.title}
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">request (client → server)</p>
          <div className="font-mono text-[11px] leading-relaxed break-words">{renderLines(TOGETHER_REQUEST)}</div>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">response (server → client)</p>
          <div className="font-mono text-[11px] leading-relaxed break-words">{renderLines(TOGETHER_RESPONSE)}</div>
        </div>
      </div>
      <div className={`rounded-xl border p-3 ${REST_TONE[note.tone].card}`}>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${REST_TONE[note.tone].label}`}>{note.title}</p>
        <p className="text-xs text-gray-100 mt-1">{note.text}</p>
      </div>
    </div>
  );
}

export function RestPrinciplesVisualizer() {
  const [index, setIndex] = useState(0);
  const idea = REST_IDEAS[index];

  const hints = {
    resources: 'Click an address to see what thing it names. Then flip to “Without the rule”.',
    repr: 'Press GET, switch JSON/XML, then deploy v2 on the server and look at the client’s copy.',
    stateless: 'Step through both versions. The load balancer sends request 2 to a different server.',
    methods: 'Click any cell: the same URL with a different verb is a different action.',
    together: 'A normal POST /predict, annotated rule by rule.',
  };

  return (
    <Frame
      title="REST: four rules for building a web API"
      hint={hints[idea.id]}
      footer={
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIndex((current) => Math.max(0, current - 1))}
            disabled={index === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous rule
          </button>
          <span className="text-[11px] font-mono text-teal-200">
            {index + 1} / {REST_IDEAS.length}
          </span>
          <button
            type="button"
            onClick={() => setIndex((current) => Math.min(REST_IDEAS.length - 1, current + 1))}
            disabled={index === REST_IDEAS.length - 1}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next rule <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        {REST_IDEAS.map((item, i) => (
          <button key={item.id} type="button" className={tabClass(index === i)} onClick={() => setIndex(i)}>
            {item.label}
          </button>
        ))}
      </div>
      {idea.id === 'resources' && <ResourcesDemo />}
      {idea.id === 'repr' && <RepresentationsDemo />}
      {idea.id === 'stateless' && <StatelessDemo />}
      {idea.id === 'methods' && <MethodsDemo />}
      {idea.id === 'together' && <TogetherDemo />}
    </Frame>
  );
}

const START_STATE = {
  config: { version: 'v1', threshold: 0.5, batch_size: 32 },
  predictions: [
    { id: 123, label: 'setosa' },
    { id: 456, label: 'virginica' },
  ],
};

const CONFIG_KEYS = ['version', 'threshold', 'batch_size'];

const nextPredictionId = (state) => Math.max(0, ...state.predictions.map((item) => item.id)) + 1;

const sameState = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function describeChange(before, after) {
  const changes = [];
  CONFIG_KEYS.forEach((key) => {
    const was = before.config[key];
    const now = after.config[key];
    if (was === now) return;
    if (now === undefined) changes.push(`${key} was removed`);
    else if (was === undefined) changes.push(`${key} was added`);
    else changes.push(`${key} ${was} → ${now}`);
  });
  const beforeIds = before.predictions.map((item) => item.id);
  const afterIds = after.predictions.map((item) => item.id);
  afterIds.filter((id) => !beforeIds.includes(id)).forEach((id) => changes.push(`prediction #${id} was created`));
  beforeIds.filter((id) => !afterIds.includes(id)).forEach((id) => changes.push(`prediction #${id} was deleted`));
  return changes.join(', ');
}

const VERBS = {
  GET: {
    action: 'Read a resource',
    safe: true,
    idempotent: 'yes',
    request: 'GET /models/info/iris-classifier',
    route: '@app.get("/models/info/{name}")',
    example: 'GET /models/info/resnet50 · GET /predictions/123',
    intent: 'Asks for a copy of the model’s metadata. It only reads, so nothing on the server should change.',
    body: () => null,
    apply: (state) => ({
      state,
      response: `200 OK · {"version": "${state.config.version}", "threshold": ${state.config.threshold}}`,
    }),
  },
  POST: {
    action: 'Submit data or trigger work',
    safe: false,
    idempotent: 'no',
    request: 'POST /predict/image',
    route: '@app.post("/predict/image")',
    example: 'POST /predict/image · submit data to fine-tune',
    intent: 'Sends an image to run the model. The server stores each prediction as a new record with a new id.',
    body: () => '{ "image": "flower_07.jpg" }',
    apply: (state) => {
      const id = nextPredictionId(state);
      const label = ['versicolor', 'setosa', 'virginica'][id % 3];
      return {
        state: { ...state, predictions: [...state.predictions, { id, label }] },
        response: `201 Created · {"id": ${id}, "label": "${label}"}`,
      };
    },
  },
  PUT: {
    action: 'Replace the whole resource',
    safe: false,
    idempotent: 'yes',
    request: 'PUT /models/config/iris-classifier',
    route: '@app.put("/models/config/{name}")',
    example: 'PUT /models/config/iris-classifier · replace a model file',
    intent: 'Says “make the config look exactly like this body.” batch_size is not in the body, so it does not survive the replace.',
    body: () => '{ "version": "v2", "threshold": 0.8 }',
    apply: (state) => ({
      state: { ...state, config: { version: 'v2', threshold: 0.8 } },
      response: '200 OK · config replaced',
    }),
  },
  PATCH: {
    action: 'Change only some fields',
    safe: false,
    idempotent: 'maybe',
    request: 'PATCH /models/config/iris-classifier',
    route: '@app.patch("/models/config/{name}")',
    example: 'PATCH /models/config/iris-classifier · tweak one setting',
    intent: 'Says “change only the fields I send.” version and batch_size are left alone.',
    body: (variant) => (variant === 'add' ? '{ "threshold_add": 0.1 }' : '{ "threshold": 0.8 }'),
    apply: (state, variant) => {
      const threshold =
        variant === 'add' ? Number((state.config.threshold + 0.1).toFixed(1)) : 0.8;
      return {
        state: { ...state, config: { ...state.config, threshold } },
        response: `200 OK · threshold is ${threshold}`,
      };
    },
  },
  DELETE: {
    action: 'Remove a resource',
    safe: false,
    idempotent: 'yes',
    request: 'DELETE /predictions/456',
    route: '@app.delete("/predictions/{id}")',
    example: 'DELETE /models/version/spam-filter-v1 · DELETE /predictions/456',
    intent: 'Removes stored prediction #456.',
    body: () => null,
    apply: (state) => {
      const exists = state.predictions.some((item) => item.id === 456);
      return {
        state: { ...state, predictions: state.predictions.filter((item) => item.id !== 456) },
        response: exists ? '204 No Content · deleted' : '404 Not Found · already gone',
      };
    },
  },
  HEAD: {
    action: 'GET, but headers only',
    safe: true,
    idempotent: 'yes',
    request: 'HEAD /models/info/iris-classifier',
    route: 'FastAPI answers HEAD for GET routes',
    example: 'Check that a model exists, or its size, without downloading it',
    intent: 'Same question as GET, but the reply has headers and no body.',
    body: () => null,
    apply: (state) => ({ state, response: '200 OK · Content-Type, Content-Length — no body' }),
  },
  OPTIONS: {
    action: 'Ask which methods are allowed',
    safe: true,
    idempotent: 'yes',
    request: 'OPTIONS /predict/image',
    route: 'Usually sent by the browser (CORS preflight)',
    example: 'Browser checks POST /predict/image is allowed before sending it',
    intent: 'Asks what this URL accepts. It reads nothing and changes nothing.',
    body: () => null,
    apply: (state) => ({ state, response: '204 · Allow: POST, OPTIONS' }),
  },
};

const MAIN_VERBS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const EXTRA_VERBS = ['HEAD', 'OPTIONS'];

function PropertyPill({ label, value }) {
  const yes = value === true || value === 'yes';
  const tone = yes
    ? 'border-emerald-400/50 text-emerald-200 bg-emerald-500/10'
    : value === 'maybe'
      ? 'border-amber-400/50 text-amber-200 bg-amber-500/10'
      : 'border-rose-400/50 text-rose-200 bg-rose-500/10';
  const text = yes ? `${label} ✓` : value === 'maybe' ? `${label}: not guaranteed` : `not ${label} ✗`;
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tone}`}>{text}</span>;
}

function ServerSnapshot({ title, state, prev, reached, current }) {
  const ids = state.predictions.map((item) => item.id);
  const prevIds = prev ? prev.predictions.map((item) => item.id) : ids;
  const removed = prev ? prev.predictions.filter((item) => !ids.includes(item.id)) : [];

  return (
    <div
      className={`rounded-xl border p-2.5 transition-all ${
        !reached ? 'opacity-30 border-gray-800' : current ? 'border-teal-400/70 bg-teal-500/5' : 'border-gray-700'
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">{title}</p>
      {!reached ? (
        <p className="text-[11px] text-gray-500">Not sent yet.</p>
      ) : (
        <>
          <p className="text-[10px] text-gray-500 mb-0.5">model config</p>
          <div className="font-mono text-[11px] space-y-0.5 mb-2">
            {CONFIG_KEYS.map((key) => {
              const now = state.config[key];
              const was = prev ? prev.config[key] : now;
              const changed = now !== was;
              const tone =
                now === undefined
                  ? changed
                    ? 'bg-rose-500/15 text-rose-200 line-through'
                    : 'text-gray-600 line-through'
                  : changed
                    ? 'bg-amber-500/15 text-amber-100'
                    : 'text-gray-200';
              return (
                <p key={key} className={`rounded px-1 ${tone}`}>
                  {key}: {now === undefined ? was ?? 'gone' : String(now)}
                </p>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-500 mb-0.5">stored predictions</p>
          <div className="flex flex-wrap gap-1">
            {state.predictions.map((item) => (
              <span
                key={item.id}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  prevIds.includes(item.id) ? 'bg-gray-800 text-gray-200' : 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/50'
                }`}
              >
                #{item.id}
              </span>
            ))}
            {removed.map((item) => (
              <span key={item.id} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-200 line-through">
                #{item.id}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TwiceExperiment({ verb, setVerb, variant, setVariant, stepper }) {
  const info = VERBS[verb];
  const s0 = START_STATE;
  const first = info.apply(s0, variant);
  const second = info.apply(first.state, variant);
  const s1 = first.state;
  const s2 = second.state;
  const safeObserved = sameState(s0, s1);
  const idempotentObserved = sameState(s1, s2);
  const step = stepper.index;
  const body = info.body(variant);

  const chooseVerb = (next) => {
    setVerb(next);
    stepper.reset();
  };

  let lesson;
  if (step === 0) {
    lesson = (
      <>
        <p>{info.intent}</p>
        <p className="text-gray-400 mt-1">
          The left card is the server before anything is sent. Next step sends the request once, then again, and you compare the cards.
        </p>
      </>
    );
  } else if (step === 1) {
    lesson = safeObserved ? (
      <p>
        Nothing on the server changed. That is what <strong className="text-white">safe</strong> means: the call only read.
        The client still got a reply: <span className="font-mono text-teal-100">{first.response}</span>.
      </p>
    ) : (
      <p>
        The first call changed the server: <span className="text-amber-100">{describeChange(s0, s1)}</span>. Anything that
        changes the server is <strong className="text-white">not safe</strong>. Now send the exact same request again.
      </p>
    );
  } else {
    lesson = idempotentObserved ? (
      <>
        <p>
          The second identical call left the server exactly as the first did. That is{' '}
          <strong className="text-white">idempotent</strong>: once or ten times, same end state — like pressing an elevator
          button twice.
        </p>
        {first.response !== second.response && (
          <p className="text-gray-300 mt-1">
            The reply changed ({first.response.split(' · ')[0]} then {second.response.split(' · ')[0]}), but the server did not.
            Idempotency is about the server’s state, not the reply.
          </p>
        )}
        {verb === 'PATCH' && (
          <p className="text-amber-100 mt-1">
            HTTP does not promise PATCH is idempotent. This one is because it sets a value. Switch the body to “add 0.1”.
          </p>
        )}
      </>
    ) : (
      <>
        <p>
          The second call did new work: <span className="text-amber-100">{describeChange(s1, s2)}</span>. That is{' '}
          <strong className="text-white">not idempotent</strong> — like a vending machine, every press buys another soda.
        </p>
        {verb === 'POST' && (
          <p className="text-gray-300 mt-1">
            A client that retries a timed-out POST can create a duplicate. Retrying GET, PUT, or DELETE is harmless.
          </p>
        )}
        {verb === 'PATCH' && (
          <p className="text-gray-300 mt-1">
            Same verb, different body: “set threshold to 0.8” was idempotent, “add 0.1” is not. That is why PATCH is only “not guaranteed.”
          </p>
        )}
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {MAIN_VERBS.map((item) => (
          <button key={item} type="button" className={tabClass(verb === item)} onClick={() => chooseVerb(item)}>
            {item}
          </button>
        ))}
        <span className="text-[10px] text-gray-500 px-1">less common:</span>
        {EXTRA_VERBS.map((item) => (
          <button key={item} type="button" className={tabClass(verb === item)} onClick={() => chooseVerb(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <p className="text-xs font-semibold text-white">
            {verb} — {info.action}
          </p>
          <div className="flex gap-1.5">
            <PropertyPill label="safe" value={info.safe} />
            <PropertyPill label="idempotent" value={info.idempotent} />
          </div>
        </div>
        <p className="font-mono text-[11px] text-teal-100">{info.request}</p>
        {body && <p className="font-mono text-[11px] text-gray-300">{body}</p>}
        {verb === 'PATCH' && (
          <div className="flex gap-1.5 mt-2">
            {[
              ['set', 'Body: set threshold to 0.8'],
              ['add', 'Body: add 0.1 to threshold'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={tabClass(variant === id)}
                onClick={() => {
                  setVariant(id);
                  stepper.reset();
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <p className="text-[10px] text-gray-500 mt-1.5">FastAPI routes it to {info.route}</p>
      </div>

      <Lesson title={['Before sending', 'After the 1st call — is it safe?', 'After the 2nd call — is it idempotent?'][step]}>
        {lesson}
      </Lesson>

      <div className="grid grid-cols-3 gap-2">
        <ServerSnapshot title="Server before" state={s0} reached current={step === 0} />
        <ServerSnapshot title="After 1st call" state={s1} prev={s0} reached={step >= 1} current={step === 1} />
        <ServerSnapshot title="After 2nd call" state={s2} prev={s1} reached={step >= 2} current={step === 2} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
        <p className="text-gray-500 px-1">reply to the client ↓</p>
        <p className={`px-1 ${step >= 1 ? 'text-cyan-100' : 'text-gray-700'}`}>{step >= 1 ? first.response : '—'}</p>
        <p className={`px-1 ${step >= 2 ? 'text-cyan-100' : 'text-gray-700'}`}>{step >= 2 ? second.response : '—'}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
        <div
          className={`rounded-lg border px-2.5 py-2 ${
            step < 1
              ? 'border-gray-800 text-gray-600'
              : safeObserved
                ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100'
                : 'border-rose-400/50 bg-rose-500/10 text-rose-100'
          }`}
        >
          <p className="font-semibold">Safe? compare “before” with “after 1st”</p>
          <p>{step < 1 ? 'Send it once to find out.' : safeObserved ? 'Same → safe (read-only).' : 'Different → not safe (it changed the server).'}</p>
        </div>
        <div
          className={`rounded-lg border px-2.5 py-2 ${
            step < 2
              ? 'border-gray-800 text-gray-600'
              : idempotentObserved
                ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100'
                : 'border-rose-400/50 bg-rose-500/10 text-rose-100'
          }`}
        >
          <p className="font-semibold">Idempotent? compare “after 1st” with “after 2nd”</p>
          <p>
            {step < 2
              ? 'Send it twice to find out.'
              : idempotentObserved
                ? 'Same → idempotent (repeating is harmless).'
                : 'Different → not idempotent (each repeat does more).'}
          </p>
        </div>
      </div>
    </div>
  );
}

const COMPARE = [
  {
    verb: 'POST',
    request: 'POST /models/configs',
    body: '{ "version": "v2", "threshold": 0.8 }',
    rule: 'Here is some data — create something new. The server picks the new URL.',
    once: ['configs/1 · v1 · 0.5 · 32 (untouched)', 'configs/2 · v2 · 0.8 (new)'],
    twice: ['configs/1 · v1 · 0.5 · 32', 'configs/2 · v2 · 0.8', 'configs/3 · v2 · 0.8 (another new one)'],
    verdict: 'Not idempotent: two calls, two new configs.',
    tone: 'rose',
  },
  {
    verb: 'PUT',
    request: 'PUT /models/configs/1',
    body: '{ "version": "v2", "threshold": 0.8 }',
    rule: 'Make the thing at this URL look exactly like this body. Fields you leave out are gone.',
    once: ['configs/1 · v2 · 0.8 · batch_size removed'],
    twice: ['configs/1 · v2 · 0.8 · batch_size removed (same)'],
    verdict: 'Idempotent: the second PUT writes the same thing again.',
    tone: 'emerald',
  },
  {
    verb: 'PATCH',
    request: 'PATCH /models/configs/1',
    body: '{ "threshold": 0.8 }',
    rule: 'Change only the fields I send. Everything else stays as it was.',
    once: ['configs/1 · v1 · 0.8 · 32'],
    twice: ['configs/1 · v1 · 0.8 · 32 (same)'],
    verdict: 'This body is idempotent. A body like “add 0.1” would not be, so HTTP does not guarantee it.',
    tone: 'amber',
  },
];

function PostPutPatchCompare() {
  const toneClass = {
    rose: 'border-rose-400/50 bg-rose-500/10 text-rose-100',
    emerald: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100',
    amber: 'border-amber-400/50 bg-amber-500/10 text-amber-100',
  };
  return (
    <div className="space-y-3">
      <Lesson title="All three send data — they differ in what they do with it">
        <p>
          Start from one stored config, <span className="font-mono text-teal-100">configs/1 = {'{'} v1, threshold 0.5, batch_size 32 {'}'}</span>.
          POST and PUT below send the <em>same body</em>. PATCH sends only the field it wants to change. Read each column top to bottom.
        </p>
      </Lesson>
      <div className="grid md:grid-cols-3 gap-2">
        {COMPARE.map((item) => (
          <div key={item.verb} className="rounded-xl border border-gray-700 bg-gray-950/60 p-2.5 flex flex-col gap-2">
            <p className="text-sm font-bold text-white">{item.verb}</p>
            <div>
              <p className="font-mono text-[11px] text-teal-100">{item.request}</p>
              <p className="font-mono text-[10px] text-gray-300 break-words">{item.body}</p>
            </div>
            <p className="text-[11px] text-gray-200 leading-snug">{item.rule}</p>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">after 1 call</p>
              {item.once.map((line) => (
                <p key={line} className="font-mono text-[10px] text-gray-200">{line}</p>
              ))}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">after 2 calls</p>
              {item.twice.map((line) => (
                <p key={line} className="font-mono text-[10px] text-gray-200">{line}</p>
              ))}
            </div>
            <p className={`mt-auto rounded-lg border px-2 py-1.5 text-[11px] ${toneClass[item.tone]}`}>{item.verdict}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400">
        In an ML API the “something new” that POST creates is usually a prediction:{' '}
        <span className="font-mono text-teal-200">POST /predict/image</span>. PUT and PATCH show up for model settings.
      </p>
    </div>
  );
}

function MethodsCheatSheet() {
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-2.5">
          <p className="font-bold text-emerald-200">Safe</p>
          <p className="text-gray-200 mt-0.5">Reading the menu. You looked; nothing in the kitchen changed.</p>
        </div>
        <div className="rounded-xl border border-teal-400/40 bg-teal-500/10 p-2.5">
          <p className="font-bold text-teal-200">Idempotent</p>
          <p className="text-gray-200 mt-0.5">An elevator button. Press it five times — you still get one elevator.</p>
        </div>
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-2.5">
          <p className="font-bold text-rose-200">Not idempotent</p>
          <p className="text-gray-200 mt-0.5">A vending machine. Press it five times — five sodas, five charges.</p>
        </div>
      </div>
      <div className="rounded-xl border border-gray-700 overflow-hidden">
        <div className="grid grid-cols-[4.5rem_1fr_auto] gap-2 px-2.5 py-1.5 bg-gray-800/70 text-[10px] uppercase tracking-wider text-gray-400">
          <span>Verb</span>
          <span>What it does · ML example</span>
          <span>Properties</span>
        </div>
        {[...MAIN_VERBS, ...EXTRA_VERBS].map((verb) => {
          const info = VERBS[verb];
          return (
            <div key={verb} className="grid grid-cols-[4.5rem_1fr_auto] gap-2 px-2.5 py-2 border-t border-gray-800 items-center">
              <span className="font-mono text-xs font-bold text-white">{verb}</span>
              <div>
                <p className="text-[11px] text-gray-200">{info.action}</p>
                <p className="font-mono text-[10px] text-gray-400">{info.example}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <PropertyPill label="safe" value={info.safe} />
                <PropertyPill label="idempotent" value={info.idempotent} />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-400">Every safe method is also idempotent: if nothing changes, repeating it cannot change anything either.</p>
    </div>
  );
}

export function HttpMethodsVisualizer() {
  const [tab, setTab] = useState('twice');
  const [verb, setVerb] = useState('GET');
  const [variant, setVariant] = useState('set');
  const stepper = useStepper(3, 1600);

  const hints = {
    twice: 'Pick a verb, then press Next step twice: the request is sent once, then again. Compare the three server cards.',
    compare: 'Same starting config, three verbs that all send data. Watch what each one leaves behind after one and two calls.',
    sheet: 'All seven verbs from the text, with what “safe” and “idempotent” mean in everyday terms.',
  };

  return (
    <Frame
      title="What each verb does to the server — and what happens if you send it twice"
      hint={hints[tab]}
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button type="button" className={tabClass(tab === 'twice')} onClick={() => setTab('twice')}>
              Send it twice
            </button>
            <button type="button" className={tabClass(tab === 'compare')} onClick={() => setTab('compare')}>
              POST vs PUT vs PATCH
            </button>
            <button type="button" className={tabClass(tab === 'sheet')} onClick={() => setTab('sheet')}>
              Cheat sheet
            </button>
          </div>
          {tab === 'twice' && <StepControls stepper={stepper} total={3} />}
        </div>
      }
    >
      {tab === 'twice' && (
        <TwiceExperiment verb={verb} setVerb={setVerb} variant={variant} setVariant={setVariant} stepper={stepper} />
      )}
      {tab === 'compare' && <PostPutPatchCompare />}
      {tab === 'sheet' && <MethodsCheatSheet />}
    </Frame>
  );
}

const PRESETS = [
  { id: 'ok', label: 'Valid', text: '{ "age": 30, "signup_month": "June" }' },
  { id: 'age', label: 'Bad age', text: '{ "age": "thirty", "signup_month": "June" }' },
  { id: 'month', label: 'Bad month', text: '{ "age": 30, "signup_month": 6 }' },
  { id: 'broken', label: 'Broken JSON', text: '{ "age": 30, ' },
];

function judgePayload(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, stage: 'parse', errors: ['Body is not valid JSON.'] };
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, stage: 'validate', errors: ['Body must be a JSON object.'] };
  }
  const errors = [];
  if (!Number.isInteger(data.age)) errors.push('age: input should be a valid integer');
  if (typeof data.signup_month !== 'string') errors.push('signup_month: input should be a valid string');
  if (errors.length) return { ok: false, stage: 'validate', errors };
  return {
    ok: true,
    stage: 'model',
    errors: [],
    summary: `age=${data.age}, month=${data.signup_month}`,
  };
}

export function PydanticGateVisualizer() {
  const [text, setText] = useState(PRESETS[0].text);
  const [phase, setPhase] = useState('idle');
  const [result, setResult] = useState(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const send = (raw = text) => {
    timers.current.forEach((id) => window.clearTimeout(id));
    setPhase('parse');
    setResult(null);
    timers.current = [
      window.setTimeout(() => {
        const judged = judgePayload(raw);
        if (judged.stage === 'parse') {
          setPhase('rejected');
          setResult(judged);
          return;
        }
        setPhase('validate');
        timers.current.push(
          window.setTimeout(() => {
            setResult(judged);
            setPhase(judged.ok ? 'model' : 'rejected');
          }, 450)
        );
      }, 350),
    ];
  };

  const stageState = (name) => {
    if (phase === 'idle') return 'idle';
    if (name === 'parse') {
      if (phase === 'parse') return 'active';
      if (result?.stage === 'parse') return 'bad';
      return 'ok';
    }
    if (name === 'validate') {
      if (phase === 'parse' || result?.stage === 'parse') return 'idle';
      if (phase === 'validate') return 'active';
      if (result && !result.ok) return 'bad';
      if (phase === 'model') return 'ok';
      return 'idle';
    }
    if (phase === 'model') return 'ok';
    return 'idle';
  };

  return (
    <Frame
      title="Nothing reaches the model until the gate opens"
      hint="Send the valid payload, then the two invalid ones from the text. Edit the JSON if you want a third failure."
      footer={
        <button
          type="button"
          onClick={() => send()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
        >
          <Send className="w-3.5 h-3.5" />
          Send to /predict
        </button>
      }
    >
      <div className="mb-3">
        <Lesson title="The three steps from the text">
          {result?.ok
            ? 'Parse succeeded, the types matched age: int and signup_month: str, so the gate opened. Only now is predict() allowed to run.'
            : result && result.stage === 'parse'
              ? 'This failed at parse. The body is not JSON, so Pydantic never sees fields and the model never starts.'
              : result
                ? 'JSON parsed, then validation failed. FastAPI returns 422 and names the field. The third box stays dark: prediction code did not run.'
                : 'Send a payload. Watch the boxes left to right: read the JSON, check it against the class, and only then call the model. {"age": "thirty", "signup_month": 6} is the rejection from the text.'}
        </Lesson>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className={tabClass(text === preset.text)}
            onClick={() => {
              setText(preset.text);
              setPhase('idle');
              setResult(null);
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
        rows={3}
        className="w-full font-mono text-[11px] rounded-xl bg-gray-950 border border-gray-700 text-teal-50 p-2 focus:outline-none focus:ring-1 focus:ring-teal-500"
      />
      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <Stage label="Parse JSON" state={stageState('parse')} />
        <Stage label="Pydantic" state={stageState('validate')} />
        <Stage label="model.predict" state={stageState('model')} />
      </div>
      <div className="mt-3 min-h-[3rem] text-xs">
        {result?.ok && (
          <p className="text-emerald-200 flex items-start gap-1.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Gate open. predict() may run on {result.summary}.
          </p>
        )}
        {result && !result.ok && (
          <div className="text-rose-200">
            <p className="flex items-center gap-1.5 font-semibold">
              <XCircle className="w-4 h-4" />
              {result.stage === 'parse' ? 'Rejected while parsing' : '422 before the model'}
            </p>
            <ul className="mt-1 space-y-0.5 font-mono text-[11px]">
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Frame>
  );
}

function Stage({ label, state }) {
  const tone = {
    idle: 'border-gray-700 text-gray-500',
    active: 'border-teal-400/70 text-teal-100 bg-teal-500/10',
    ok: 'border-emerald-400/60 text-emerald-100 bg-emerald-500/10',
    bad: 'border-rose-400/60 text-rose-100 bg-rose-500/10',
  }[state];
  return <div className={`rounded-xl border px-2 py-2 text-[11px] font-semibold ${tone}`}>{label}</div>;
}

const WORK_STYLE = {
  io: 'bg-teal-500/70',
  cpu: 'bg-amber-400/85',
  wait: 'bg-gray-600/80',
  bg: 'bg-violet-500/70',
};

const WORK_LABEL = {
  io: 'I/O — waiting on something else',
  cpu: 'CPU — actually computing',
  wait: 'stuck / queued',
  bg: 'background task (after the response)',
};

function WorkLegend({ kinds }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gray-400">
      {kinds.map((kind) => (
        <span key={kind} className="inline-flex items-center gap-1">
          <span className={`w-3 h-2 rounded-sm ${WORK_STYLE[kind]}`} />
          {WORK_LABEL[kind]}
        </span>
      ))}
    </div>
  );
}

const PIPELINE = [
  {
    label: 'Fetch features from the database',
    kind: 'io',
    ms: 250,
    detail:
      'The server sends a query, then waits about 250 ms for the database to answer. During that wait the CPU has nothing to do. This is I/O-bound: the speed limit is the database and the network, not your processor.',
  },
  {
    label: 'Pre-process: download the image from cloud storage',
    kind: 'io',
    ms: 100,
    detail:
      'A pre-processing step that waits on an external resource. The server asked for the bytes and is waiting for them to arrive. The CPU is idle again.',
  },
  {
    label: 'model.predict(features)',
    kind: 'cpu',
    ms: 200,
    detail:
      'The model multiplies matrices. The CPU is busy for the whole 200 ms. This is CPU-bound: only a faster or additional processor makes it quicker. Writing async def does not speed this step up.',
  },
  {
    label: 'Log the prediction to a remote service',
    kind: 'io',
    ms: 150,
    detail:
      'Send the result to a logging service and wait for its acknowledgment. I/O-bound: the CPU just waits. The client is also still waiting, because the response has not been sent yet.',
  },
  {
    label: 'Update the monitoring dashboard / send an email',
    kind: 'bg',
    ms: 300,
    detail:
      'Non-critical follow-up. The client does not need it to get its prediction, so a background task can run it after the response has already been sent.',
  },
];

function RequestAnatomy({ stepper }) {
  const total = PIPELINE.reduce((sum, item) => sum + item.ms, 0);
  let offset = 0;
  const placed = PIPELINE.map((item) => {
    const x = offset;
    offset += item.ms;
    return { ...item, x };
  });
  const responseAt = placed.find((item) => item.kind === 'bg').x;
  const cpuMs = PIPELINE.filter((item) => item.kind === 'cpu').reduce((sum, item) => sum + item.ms, 0);
  const idlePct = Math.round(((responseAt - cpuMs) / responseAt) * 100);
  const active = placed[stepper.index];
  const pct = (value) => `${(value / total) * 100}%`;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-600 bg-gray-800/40 p-3 text-[11px] text-gray-300 leading-relaxed">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1">Two kinds of work, in kitchen terms</p>
        <p>
          <span className="text-amber-200 font-semibold">CPU-bound</span> is chopping vegetables: the chef’s hands are busy the
          whole time. <span className="text-teal-200 font-semibold">I/O-bound</span> is waiting for the oven or a delivery: no
          hands needed, so a good chef starts the next order meanwhile. <span className="font-mono text-white">async def</span>{' '}
          lets the server be that chef.
        </p>
      </div>

      <Lesson title={`Step ${stepper.index + 1}: ${active.label}`}>
        <p className="mb-1">
          <span className={`inline-block w-3 h-2 rounded-sm mr-1.5 ${WORK_STYLE[active.kind]}`} />
          <span className="font-semibold text-white">{WORK_LABEL[active.kind]}</span> · {active.ms} ms
        </p>
        <p>{active.detail}</p>
      </Lesson>

      <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-3 space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">One POST /predict, left to right in time</p>
        <div className="relative pt-4">
          <div
            className="absolute top-0 -translate-x-1/2 text-[9px] text-emerald-300 whitespace-nowrap"
            style={{ left: pct(responseAt) }}
          >
            response sent ✓
          </div>
          <div className="absolute top-3 bottom-0 w-px bg-emerald-400/80" style={{ left: pct(responseAt) }} />
          <div className="flex h-9 rounded-lg overflow-hidden">
            {placed.map((item, i) => (
              <button
                key={item.label}
                type="button"
                onClick={() => stepper.pick(i)}
                title={item.label}
                style={{ width: pct(item.ms) }}
                className={`${WORK_STYLE[item.kind]} text-[9px] text-gray-950 font-semibold px-1 truncate border-r border-gray-950 transition-opacity ${
                  i === stepper.index ? 'opacity-100 ring-2 ring-inset ring-white' : 'opacity-50 hover:opacity-80'
                }`}
              >
                {item.kind === 'cpu' ? 'predict()' : item.label.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-[10px] text-amber-200">CPU computing</span>
            <div className="relative flex-1 h-2.5 rounded bg-gray-800">
              {placed
                .filter((item) => item.kind === 'cpu')
                .map((item) => (
                  <div key={item.label} className="absolute inset-y-0 rounded bg-amber-400" style={{ left: pct(item.x), width: pct(item.ms) }} />
                ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-[10px] text-teal-200">Waiting on I/O</span>
            <div className="relative flex-1 h-2.5 rounded bg-gray-800">
              {placed
                .filter((item) => item.kind !== 'cpu')
                .map((item) => (
                  <div
                    key={item.label}
                    className={`absolute inset-y-0 rounded ${item.kind === 'bg' ? 'bg-violet-500/70' : 'bg-teal-500/70'}`}
                    style={{ left: pct(item.x), width: pct(item.ms) }}
                  />
                ))}
            </div>
          </div>
        </div>
        <WorkLegend kinds={['io', 'cpu', 'bg']} />
      </div>

      <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-3 text-[11px] text-gray-200">
        Before the response goes out ({responseAt} ms), the CPU computes for only {cpuMs} ms. It sits idle for{' '}
        <strong className="text-white">{idlePct}%</strong> of the request, waiting on the database, storage, and the log
        service. Async puts those idle gaps to use by serving other requests. The next tab shows how.
      </div>
    </div>
  );
}

const SERVE_ROWS = [
  { id: 'A', label: 'A · POST /predict', arrive: 0 },
  { id: 'B', label: 'B · POST /predict', arrive: 50 },
  { id: 'C', label: 'C · POST /predict', arrive: 100 },
  { id: 'H', label: 'GET /health', arrive: 350 },
];

const SERVE_SCALE = 2000;

const SERVE_PLANS = {
  sync: {
    plain: {
      A: { done: 650, segs: [['io', 0, 300], ['cpu', 300, 500], ['io', 500, 650]] },
      B: { done: 1300, segs: [['wait', 50, 650], ['io', 650, 950], ['cpu', 950, 1150], ['io', 1150, 1300]] },
      C: { done: 1950, segs: [['wait', 100, 1300], ['io', 1300, 1600], ['cpu', 1600, 1800], ['io', 1800, 1950]] },
      H: { done: 1950, segs: [['wait', 350, 1950]] },
    },
    bg: {
      A: { done: 500, segs: [['io', 0, 300], ['cpu', 300, 500], ['bg', 500, 650]] },
      B: { done: 1150, segs: [['wait', 50, 650], ['io', 650, 950], ['cpu', 950, 1150], ['bg', 1150, 1300]] },
      C: { done: 1800, segs: [['wait', 100, 1300], ['io', 1300, 1600], ['cpu', 1600, 1800], ['bg', 1800, 1950]] },
      H: { done: 1950, segs: [['wait', 350, 1950]] },
    },
  },
  inline: {
    plain: {
      A: { done: 700, segs: [['io', 0, 300], ['cpu', 300, 500], ['io', 500, 650], ['wait', 650, 700]] },
      B: { done: 900, segs: [['io', 50, 350], ['wait', 350, 500], ['cpu', 500, 700], ['io', 700, 850], ['wait', 850, 900]] },
      C: { done: 1050, segs: [['io', 100, 400], ['wait', 400, 700], ['cpu', 700, 900], ['io', 900, 1050]] },
      H: { done: 500, segs: [['wait', 350, 500]] },
    },
    bg: {
      A: { done: 500, segs: [['io', 0, 300], ['cpu', 300, 500], ['bg', 500, 650]] },
      B: { done: 700, segs: [['io', 50, 350], ['wait', 350, 500], ['cpu', 500, 700], ['bg', 700, 850]] },
      C: { done: 900, segs: [['io', 100, 400], ['wait', 400, 700], ['cpu', 700, 900], ['bg', 900, 1050]] },
      H: { done: 500, segs: [['wait', 350, 500]] },
    },
  },
  pool: {
    plain: {
      A: { done: 650, segs: [['io', 0, 300], ['cpu', 300, 500], ['io', 500, 650]] },
      B: { done: 850, segs: [['io', 50, 350], ['wait', 350, 500], ['cpu', 500, 700], ['io', 700, 850]] },
      C: { done: 1050, segs: [['io', 100, 400], ['wait', 400, 700], ['cpu', 700, 900], ['io', 900, 1050]] },
      H: { done: 350, segs: [] },
    },
    bg: {
      A: { done: 500, segs: [['io', 0, 300], ['cpu', 300, 500], ['bg', 500, 650]] },
      B: { done: 700, segs: [['io', 50, 350], ['wait', 350, 500], ['cpu', 500, 700], ['bg', 700, 850]] },
      C: { done: 900, segs: [['io', 100, 400], ['wait', 400, 700], ['cpu', 700, 900], ['bg', 900, 1050]] },
      H: { done: 350, segs: [] },
    },
  },
};

const SERVE_MODES = {
  sync: {
    label: 'Blocking: one worker',
    waitWhy: 'queued — the only worker is still busy with an earlier request, even while it just waits on I/O',
    ioWhy: 'waiting on I/O — and the worker waits with it, doing nothing',
  },
  inline: {
    label: 'async def, predict() inline',
    waitWhy: 'stuck — the event loop is busy running another request’s predict(), so nothing else can move',
    ioWhy: 'waiting on I/O — the event loop is free to serve others meanwhile',
  },
  pool: {
    label: 'async def + thread pool',
    waitWhy: 'waiting for the CPU — another predict() is running in the pool (the event loop itself is free)',
    ioWhy: 'waiting on I/O — the event loop is free to serve others meanwhile',
  },
};

function serveCode(mode, background) {
  const logLine = background
    ? 'background_tasks.add_task(remote_log.send, label)  # after the response'
    : null;
  if (mode === 'sync') {
    return `# Classic blocking server (like WSGI on slide 2), one worker
def predict(req):
    features = db.fetch(req.user_id)     # worker blocked while waiting
    label = model.predict(features)      # CPU
    ${logLine || 'remote_log.send(label)                # worker blocked while waiting'}
    return {"label": label}`;
  }
  const signature = background
    ? 'async def predict(req: Req, background_tasks: BackgroundTasks):'
    : 'async def predict(req: Req):';
  const predictLine =
    mode === 'inline'
      ? 'label = model.predict(features)            # ⚠ runs ON the event loop — blocks it'
      : 'label = await run_in_threadpool(model.predict, features)  # CPU work off the loop';
  const header = mode === 'pool' ? 'from fastapi.concurrency import run_in_threadpool\n\n' : '';
  return `${header}@app.post("/predict")
${signature}
    features = await db.fetch(req.user_id)     # yields while waiting
    ${predictLine}
    ${logLine || 'await remote_log.send(label)               # yields while waiting'}
    return {"label": label}`;
}

function planTimes(plan) {
  const set = new Set([0]);
  SERVE_ROWS.forEach((row) => {
    const entry = plan[row.id];
    set.add(row.arrive);
    set.add(entry.done);
    entry.segs.forEach(([, start, end]) => {
      set.add(start);
      set.add(end);
    });
  });
  return [...set].sort((a, b) => a - b);
}

function rowStatus(row, entry, t, mode) {
  if (t < row.arrive) return { tone: 'text-gray-600', text: 'not arrived yet' };
  if (t >= entry.done) {
    const running = entry.segs.find(([kind, start, end]) => kind === 'bg' && start <= t && t < end);
    return {
      tone: 'text-emerald-200',
      text: `answered ✓ at ${entry.done} ms${running ? ' — background task still running' : ''}`,
    };
  }
  const seg = entry.segs.find(([, start, end]) => start <= t && t < end);
  if (!seg) return { tone: 'text-gray-400', text: 'being handled' };
  const kind = seg[0];
  if (kind === 'cpu') return { tone: 'text-amber-200', text: 'running predict() on the CPU' };
  if (kind === 'io') return { tone: 'text-teal-200', text: SERVE_MODES[mode].ioWhy };
  return { tone: 'text-gray-300', text: SERVE_MODES[mode].waitWhy };
}

function ServingTimeline({ mode, setMode, background, setBackground, stepper }) {
  const plan = SERVE_PLANS[mode][background ? 'bg' : 'plain'];
  const times = planTimes(plan);
  const t = times[Math.min(stepper.index, times.length - 1)];
  const pct = (value) => `${(value / SERVE_SCALE) * 100}%`;

  const requestRows = SERVE_ROWS.filter((row) => row.id !== 'H');
  const lastDone = Math.max(...requestRows.map((row) => plan[row.id].done));
  const healthWait = plan.H.done - 350;
  const end = Math.max(
    ...SERVE_ROWS.map((row) => Math.max(plan[row.id].done, ...plan[row.id].segs.map(([, , e]) => e)))
  );
  const cpuSegs = SERVE_ROWS.flatMap((row) => plan[row.id].segs.filter(([kind]) => kind === 'cpu'));
  const cpuTotal = cpuSegs.reduce((sum, [, s, e]) => sum + (e - s), 0);
  const utilization = Math.round((cpuTotal / end) * 100);

  const summary = {
    sync: `One worker handles one request from start to finish. While A waits on the database, the worker waits too, so B and C sit in a queue. The last prediction is answered at ${lastDone} ms, and a 1 ms health check waits ${healthWait} ms.`,
    inline: `async def lets the waits overlap: B and C start fetching while A is still waiting, so the last answer comes at ${lastDone} ms instead of 1950. But predict() runs on the event loop itself. While it computes, nothing else moves: the health check waits ${healthWait} ms, and finished requests cannot even send their reply (grey after the teal).`,
    pool: `Same overlapping waits, but predict() runs in a worker thread, so the event loop never freezes. The health check is answered instantly and finished requests reply on time. Each prediction still takes 200 ms — async made the waiting cheaper, not the math faster. With more CPU cores, the pool can also run predictions side by side.`,
  };

  const switchMode = (next) => {
    setMode(next);
    stepper.reset();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {Object.entries(SERVE_MODES).map(([id, item]) => (
          <button key={id} type="button" className={tabClass(mode === id)} onClick={() => switchMode(id)}>
            {item.label}
          </button>
        ))}
        <label className="text-[11px] text-gray-300 flex items-center gap-1.5 ml-1">
          <input
            type="checkbox"
            checked={background}
            onChange={(event) => {
              setBackground(event.target.checked);
              stepper.reset();
            }}
            className="accent-violet-500"
          />
          Log as a background task
        </label>
      </div>

      <Lesson title={SERVE_MODES[mode].label}>
        <p>{summary[mode]}</p>
        {background && (
          <p className="text-violet-200 mt-1">
            Background task on: each client gets its answer as soon as predict() finishes. The remote log (violet) runs after
            the response has been sent.
          </p>
        )}
      </Lesson>

      <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-3 space-y-1.5">
        {SERVE_ROWS.map((row) => {
          const entry = plan[row.id];
          return (
            <div key={row.id} className="flex items-center gap-2">
              <span className={`w-28 shrink-0 font-mono text-[10px] ${row.id === 'H' ? 'text-cyan-200' : 'text-gray-200'}`}>
                {row.label}
              </span>
              <div className="relative flex-1 h-5 rounded bg-gray-900">
                <div className="absolute inset-y-0 w-px bg-gray-500" style={{ left: pct(row.arrive) }} title="arrives" />
                {entry.segs.map(([kind, start, stop]) => (
                  <div
                    key={`${kind}-${start}`}
                    className={`absolute inset-y-0.5 rounded-sm ${WORK_STYLE[kind]}`}
                    style={{ left: pct(start), width: pct(stop - start) }}
                    title={`${WORK_LABEL[kind]} · ${start}–${stop} ms`}
                  />
                ))}
                <div
                  className="absolute -top-0.5 text-[10px] text-emerald-300 font-bold -translate-x-1/2"
                  style={{ left: pct(entry.done) }}
                >
                  ✓
                </div>
                <div className="absolute -inset-y-1 w-0.5 bg-white/80" style={{ left: pct(t) }} />
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-[10px] text-amber-200">CPU computing</span>
          <div className="relative flex-1 h-2.5 rounded bg-gray-900">
            {cpuSegs.map(([, start, stop]) => (
              <div key={`cpu-${start}`} className="absolute inset-y-0 rounded-sm bg-amber-400" style={{ left: pct(start), width: pct(stop - start) }} />
            ))}
            <div className="absolute -inset-y-1 w-0.5 bg-white/80" style={{ left: pct(t) }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0" />
          <div className="relative flex-1 h-3 text-[9px] text-gray-500 font-mono">
            {[0, 500, 1000, 1500, 2000].map((tick) => (
              <span key={tick} className="absolute -translate-x-1/2" style={{ left: pct(tick) }}>
                {tick}ms
              </span>
            ))}
          </div>
        </div>
        <WorkLegend kinds={['io', 'cpu', 'wait', 'bg']} />
      </div>

      <div className="rounded-xl border border-gray-700 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300 mb-1">
          At t = {t} ms (white line) — press Next step to move time forward
        </p>
        <div className="space-y-0.5">
          {SERVE_ROWS.map((row) => {
            const status = rowStatus(row, plan[row.id], t, mode);
            return (
              <p key={row.id} className="text-[11px]">
                <span className="font-mono text-gray-400">{row.id === 'H' ? 'health' : row.id}: </span>
                <span className={status.tone}>{status.text}</span>
              </p>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ['Last prediction answered', `${lastDone} ms`],
          ['Health check waited', `${healthWait} ms`],
          ['CPU busy (resource use)', `${utilization}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-700 bg-gray-900/50 px-2 py-2">
            <p className="text-sm font-bold text-white">{value}</p>
            <p className="text-[10px] text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">The code for this setup</p>
        <pre className="font-mono text-[10px] leading-relaxed bg-gray-950 border border-gray-700 rounded-xl p-3 overflow-x-auto">
          <CodeText text={serveCode(mode, background)} />
        </pre>
      </div>
    </div>
  );
}

export function InferenceLoopVisualizer() {
  const [tab, setTab] = useState('anatomy');
  const [mode, setMode] = useState('sync');
  const [background, setBackground] = useState(false);
  const anatomy = useStepper(PIPELINE.length, 1800);
  const times = planTimes(SERVE_PLANS[mode][background ? 'bg' : 'plain']);
  const timeline = useStepper(times.length, 700);

  return (
    <Frame
      title="Async helps the waiting around the model, not the model itself"
      hint={
        tab === 'anatomy'
          ? 'Step through one prediction request. Teal means waiting, amber means computing. Click any block to jump to it.'
          : 'Three predictions and a health check hit one server. Compare the three setups, then step time forward.'
      }
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button type="button" className={tabClass(tab === 'anatomy')} onClick={() => setTab('anatomy')}>
              1 · Anatomy of one request
            </button>
            <button type="button" className={tabClass(tab === 'serve')} onClick={() => setTab('serve')}>
              2 · Serving three at once
            </button>
          </div>
          {tab === 'anatomy' ? (
            <StepControls stepper={anatomy} total={PIPELINE.length} />
          ) : (
            <StepControls stepper={timeline} total={times.length} />
          )}
        </div>
      }
    >
      {tab === 'anatomy' ? (
        <RequestAnatomy stepper={anatomy} />
      ) : (
        <ServingTimeline
          mode={mode}
          setMode={setMode}
          background={background}
          setBackground={setBackground}
          stepper={timeline}
        />
      )}
    </Frame>
  );
}

const FIELD_POOL = [
  { name: 'age', type: 'int', example: '30' },
  { name: 'signup_month', type: 'str', example: '"June"' },
  { name: 'score', type: 'float', example: '0.91' },
  { name: 'user_id', type: 'str', example: '"u_17"' },
];

export function DocsSyncVisualizer() {
  const [enabled, setEnabled] = useState(['age', 'signup_month']);
  const [view, setView] = useState('swagger');
  const fields = FIELD_POOL.filter((field) => enabled.includes(field.name));

  const toggle = (name) => {
    setEnabled((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name]
    );
  };

  return (
    <Frame
      title="Change the model, the docs move with it"
      hint="Toggle a field. The Python model and both doc UIs are the same list — FastAPI generates them from the hints."
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        {FIELD_POOL.map((field) => (
          <button key={field.name} type="button" className={tabClass(enabled.includes(field.name))} onClick={() => toggle(field.name)}>
            {field.name}: {field.type}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        <pre className="font-mono text-[11px] leading-5 rounded-xl border border-gray-700 bg-gray-950 p-3 text-teal-50 overflow-x-auto">
{`class ModelInput(BaseModel):
${fields.map((field) => `    ${field.name}: ${field.type}`).join('\n') || '    pass'}

class Prediction(BaseModel):
    label: str`}
        </pre>
        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
          <div className="flex gap-1.5 mb-2">
            <button type="button" className={tabClass(view === 'swagger')} onClick={() => setView('swagger')}>
              /docs
            </button>
            <button type="button" className={tabClass(view === 'redoc')} onClick={() => setView('redoc')}>
              /redoc
            </button>
          </div>
          {view === 'swagger' ? (
            <div className="text-[11px]">
              <p className="font-mono text-emerald-300 mb-1">POST /predict</p>
              <p className="text-gray-400 mb-1">Request body · application/json</p>
              {fields.map((field) => (
                <div key={field.name} className="flex justify-between border-t border-gray-800 py-1 font-mono text-gray-200">
                  <span>{field.name}</span>
                  <span className="text-gray-500">{field.type} · e.g. {field.example}</span>
                </div>
              ))}
              {fields.length === 0 && <p className="text-amber-200">Schema is empty. The endpoint would accept {`{}`}.</p>}
              <p className="text-[10px] text-gray-500 mt-2">Try it out uses this schema. No separate doc file.</p>
            </div>
          ) : (
            <div className="text-[11px] text-gray-300 space-y-1">
              <p className="text-white font-semibold">Prediction request</p>
              {fields.map((field) => (
                <p key={field.name}>
                  <span className="font-mono text-cyan-200">{field.name}</span> — {field.type}, required
                </p>
              ))}
              {fields.length === 0 && <p>No fields documented.</p>}
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <Lesson title="Why the docs cannot drift">
          {fields.length
            ? `The class and ${view === 'swagger' ? '/docs' : '/redoc'} both list ${fields.map((field) => field.name).join(', ')}. Toggle a field and both sides move, because FastAPI builds the docs from the type hints rather than from a separate file. The editor uses those same hints for autocomplete.`
            : 'With no fields, the schema is empty and the endpoint would accept {}. Add a field and it appears in the class and in the docs together.'}
        </Lesson>
      </div>
    </Frame>
  );
}

const LIBS = [
  { id: 'sklearn', name: 'scikit-learn', format: 'joblib', load: 'joblib.load("model.joblib")', call: 'model.predict(features)' },
  { id: 'torch', name: 'PyTorch', format: '.pt', load: 'torch.load("model.pt")', call: 'model(tensor)' },
  { id: 'tf', name: 'TensorFlow', format: 'SavedModel', load: 'tf.keras.models.load_model(path)', call: 'model.predict(batch)' },
  { id: 'onnx', name: 'ONNX', format: '.onnx', load: 'ort.InferenceSession("model.onnx")', call: 'session.run(None, feeds)' },
  { id: 'xgb', name: 'XGBoost', format: '.json', load: 'model.load_model("model.json")', call: 'model.predict(features)' },
  { id: 'spacy', name: 'spaCy', format: 'pipeline package', load: 'spacy.load("en_core_web_sm")', call: 'nlp(text)' },
];

export function EcosystemVisualizer() {
  const [libId, setLibId] = useState('sklearn');
  const [loaded, setLoaded] = useState(false);
  const lib = LIBS.find((item) => item.id === libId);

  const pick = (id) => {
    setLibId(id);
    setLoaded(false);
  };

  return (
    <Frame
      title="Drop a Python model into the route"
      hint="Pick a library and load it. The endpoint stays the same shape — only the call inside changes. pandas and NumPy usually sit just upstream, building the vector."
      footer={
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Load at startup
        </button>
      }
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        {LIBS.map((item) => (
          <button key={item.id} type="button" className={tabClass(libId === item.id)} onClick={() => pick(item.id)}>
            {item.name}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-2 items-center">
        <div className="rounded-xl border border-gray-700 p-3">
          <FileJson className="w-4 h-4 text-amber-300 mb-1" />
          <p className="text-xs font-semibold text-white">{lib.name}</p>
          <p className="text-[11px] text-gray-400">file: {lib.format}</p>
          <p className="font-mono text-[10px] text-gray-300 mt-2 break-all">{lib.load}</p>
        </div>
        <div className={`text-center text-xs font-semibold ${loaded ? 'text-teal-300' : 'text-gray-600'}`}>
          {loaded ? '→ in memory →' : '→ not loaded →'}
        </div>
        <div className={`rounded-xl border p-3 ${loaded ? 'border-teal-400/60 bg-teal-500/10' : 'border-gray-700'}`}>
          <Layers className="w-4 h-4 text-teal-300 mb-1" />
          <p className="text-xs font-semibold text-white">@app.post("/predict")</p>
          <p className="font-mono text-[10px] text-gray-300 mt-2 break-all">
            {loaded ? lib.call : '# waiting for startup'}
          </p>
          {loaded && (
            <p className="text-[11px] text-emerald-200 mt-2 flex items-center gap-1">
              <Braces className="w-3 h-3" /> JSON in, JSON out, same as every other slide.
            </p>
          )}
        </div>
      </div>
      <div className="mt-3">
        <Lesson title="What stays the same">
          {loaded
            ? `${lib.name} is loaded with ${lib.load}. Inside the route, the call is ${lib.call}. The URL is still POST /predict and the body is still JSON. pandas and NumPy would build that feature vector just before this line.`
            : `${lib.name} is not in memory yet. Loading it at startup is ordinary Python (${lib.format}). The HTTP contract does not change when you press Load.`}
        </Lesson>
      </div>
    </Frame>
  );
}
