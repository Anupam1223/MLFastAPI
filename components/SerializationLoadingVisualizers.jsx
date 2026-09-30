import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, HardDrive, Database } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines, Terminal, Caption } from './VisualKit';
import { Pill, Mono } from './PydanticKit';

const LOAD_MS = 1800;

/* ------------------------------------------------------------------ */
/* 12. Load at startup into a global                                     */
/* ------------------------------------------------------------------ */

const GLOBAL_CODE = [
  '# main.py',
  'import joblib',
  'from fastapi import FastAPI',
  '',
  'app = FastAPI()',
  '',
  '# Load the model when the module is imported (at startup)',
  'try:',
  '    model = joblib.load("models/sentiment_model.pkl")',
  '    # You might also load related objects like vectorizers',
  '    vectorizer = joblib.load("models/tfidf_vectorizer.pkl")',
  '    print("Model loaded successfully at startup.")',
  'except FileNotFoundError:',
  '    print("Error: Model file not found. Ensure \'models/sentiment_model.pkl\' exists.")',
  '    model = None # Handle the absence of the model gracefully',
  'except Exception as e:',
  '    print(f"Error loading model: {e}")',
  '    model = None',
  '',
  '@app.post("/predict")',
  'async def predict_sentiment(text: str):',
  '    if model is None:',
  '        # Return an error if the model failed to load',
  '        raise HTTPException(status_code=503, detail="Model is not available")',
  '    return {"text": text, "sentiment_prediction": "positive"}',
];

export function GlobalLoadVisualizer() {
  const [file, setFile] = useState('ok');
  return <GlobalRun key={file} file={file} setFile={setFile} />;
}

function GlobalRun({ file, setFile }) {
  const stepper = useStepper(4, 1300);
  const step = stepper.index;
  const ok = file === 'ok';
  const lines = file === 'missing' ? [7, 8, 12, 13, 14] : file === 'corrupt' ? [7, 8, 15, 16, 17] : [7, 8, 10, 11];
  const reqLines = ok ? [20, 21, 24] : [20, 21, 22, 23];

  return (
    <Frame
      title="Load into a global when the module is imported"
      hint="Choose the state of the model file, then step from import to the first request."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-1.5">
            {[
              ['ok', 'file present'],
              ['missing', 'file missing'],
              ['corrupt', 'file unreadable'],
            ].map(([id, l]) => (
              <button key={id} type="button" className={tabClass(file === id)} onClick={() => setFile(id)}>
                {l}
              </button>
            ))}
          </div>
          <StepControls stepper={stepper} total={4} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-1.5">
          {['Import main.py', 'joblib.load', 'model = …', 'POST /predict'].map((s, i) => (
            <div key={s} className={`rounded-lg border px-1 py-1.5 text-[10px] text-center ${i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'}`}>
              {i + 1}. {s}
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-3">
          <div className="max-h-72 overflow-auto custom-scroll rounded-xl">
            <CodeLines lines={GLOBAL_CODE} active={step < 3 ? lines : reqLines} title="main.py" />
          </div>
          <div className="space-y-2">
            <div className="rounded-xl border border-gray-700 p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">module globals</p>
              <p className="font-mono text-[12px]">
                <span className="text-gray-400">model = </span>
                {step < 2 ? <span className="text-gray-600">…</span> : ok ? <span className="text-emerald-200">LogisticRegression(…)</span> : <span className="text-amber-200">None</span>}
              </p>
              <p className="font-mono text-[12px]">
                <span className="text-gray-400">vectorizer = </span>
                {step < 2 ? <span className="text-gray-600">…</span> : ok ? <span className="text-emerald-200">TfidfVectorizer(…)</span> : <span className="text-gray-600">never assigned</span>}
              </p>
            </div>
            {step >= 2 && (
              <Terminal
                title="uvicorn"
                lines={
                  ok
                    ? [{ text: 'Model loaded successfully at startup.', kind: 'ok' }]
                    : file === 'missing'
                      ? [{ text: "Error: Model file not found. Ensure 'models/sentiment_model.pkl' exists.", kind: 'err' }]
                      : [{ text: 'Error loading model: pickle data was truncated', kind: 'err' }]
                }
              />
            )}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                {ok ? (
                  <>
                    <Pill code={200} text="OK" />
                    <Mono className="text-emerald-100">{'{ "text": "great product", "sentiment_prediction": "positive" }'}</Mono>
                  </>
                ) : (
                  <>
                    <Pill code={503} text="Service Unavailable" />
                    <Mono className="text-amber-100">{'{ "detail": "Model is not available" }'}</Mono>
                    <p className="text-[10px] text-gray-400 mt-1">The app still started. The endpoint reports that the model never loaded.</p>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
        <Lesson title="Simple, with a cost">
          The model is in memory before the first request, so every prediction has the same latency. A global is shared by every request and every test, which gets awkward as the application grows.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 13. Lazy loading with lru_cache                                       */
/* ------------------------------------------------------------------ */

const LAZY_ROWS = [
  { who: '1st POST /predict', call: true },
  { who: '2nd POST /predict', call: false },
  { who: '3rd POST /predict', call: false },
];

export function LazyLoadVisualizer() {
  const [file, setFile] = useState('ok');
  return <LazyRun key={file} file={file} setFile={setFile} />;
}

function LazyRun({ file, setFile }) {
  const stepper = useStepper(LAZY_ROWS.length, 1400);
  const step = stepper.index;
  const ok = file === 'ok';

  return (
    <Frame
      title="Load on the first request, then cache"
      hint="Send three requests. The loader runs only for the first — even when it fails, because None is cached too."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(file === 'ok')} onClick={() => setFile('ok')}>file present</button>
            <button type="button" className={tabClass(file === 'missing')} onClick={() => setFile('missing')}>file missing</button>
          </div>
          <StepControls stepper={stepper} total={LAZY_ROWS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <div className="space-y-1.5">
            {LAZY_ROWS.map((r, i) => (
              <motion.div key={r.who} animate={{ opacity: i <= step ? 1 : 0.3 }} className={`rounded-lg border px-2 py-1.5 text-[11px] ${i === step ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800'}`}>
                <span className="text-white">{r.who}</span>
                {i <= step && <span className="block font-mono text-[10px] text-gray-400">{i === 0 ? 'get_model() runs' : 'cache hit — get_model() does not run'}</span>}
              </motion.div>
            ))}
          </div>
          <div className="text-gray-600 text-xs">→</div>
          <div className={`rounded-xl border-2 border-dashed p-3 min-h-[7rem] ${step >= 0 ? 'border-amber-400/50' : 'border-gray-700'}`}>
            <p className="text-[9px] uppercase tracking-wider text-amber-300">@lru_cache(maxsize=1)</p>
            <AnimatePresence>
              {step >= 0 && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-2 rounded-lg border border-gray-700 bg-gray-950 px-2 py-1.5 font-mono text-[11px]">
                  <span className="text-gray-500">cached: </span>
                  <span className={ok ? 'text-emerald-200' : 'text-amber-200'}>{ok ? 'the model object' : 'None'}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <Terminal
          title="uvicorn"
          lines={[
            ...(step >= 0
              ? [
                  { text: 'Attempting to load model (lazy)...' },
                  ok
                    ? { text: 'Model loaded successfully.', kind: 'ok' }
                    : { text: 'Error: Model file not found during lazy load.', kind: 'err' },
                ]
              : []),
            ...LAZY_ROWS.slice(0, step + 1).map((r, i) => ({
              text: i === 0 ? '' : `${r.who}: returned cached ${ok ? 'model' : 'None'} — loader not called`,
              kind: 'dim',
            })).filter((l) => l.text),
          ]}
        />

        {step >= 0 && (
          ok ? (
            <div className="space-y-1">
              <Pill code={200} text="OK" />
              <p className="text-[10px] text-gray-400">
                First request waited ~{LOAD_MS / 1000}s for the load. Requests 2 and 3 answer immediately.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <Pill code={503} text="Service Unavailable" />
              <Mono className="text-amber-100">{'{ "detail": "Model could not be loaded" }'}</Mono>
              <p className="text-[10px] text-amber-200">None is cached, so later requests fail instantly and the file is never tried again until the process restarts.</p>
            </div>
          )
        )}

        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          {[
            'The model is very large, so a fast startup matters.',
            'The endpoint is rarely called, so you only pay when needed.',
            'Memory is tight: don’t load it unless it is used.',
          ].map((t) => (
            <div key={t} className="rounded-lg border border-gray-700 p-2 text-gray-300">{t}</div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 14. Lifespan                                                           */
/* ------------------------------------------------------------------ */

const LIFE = [
  { id: 'start', label: 'startup: before any request' },
  { id: 'ready', label: 'yield: app accepts requests' },
  { id: 'req', label: 'POST /predict reads app_state' },
  { id: 'stop', label: 'shutdown: clean up' },
];

export function LifespanVisualizer() {
  const [file, setFile] = useState('ok');
  return <LifeRun key={file} file={file} setFile={setFile} />;
}

function LifeRun({ file, setFile }) {
  const stepper = useStepper(LIFE.length, 1400);
  const step = stepper.index;
  const ok = file === 'ok';
  const alive = step >= 1 && step < 3;
  const state = step === 0 ? {} : step === 3 ? {} : { model: ok ? 'LogisticRegression' : null, vectorizer: ok ? 'TfidfVectorizer' : undefined };

  return (
    <Frame
      title="Load in the lifespan, not at import time"
      hint="Step through startup, a request, and shutdown. The model lives in app_state, which is cleared when the app stops."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(file === 'ok')} onClick={() => setFile('ok')}>file present</button>
            <button type="button" className={tabClass(file === 'missing')} onClick={() => setFile('missing')}>file missing</button>
          </div>
          <StepControls stepper={stepper} total={LIFE.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-1">
          {LIFE.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`flex-1 rounded-lg border px-1 py-1.5 text-[9px] text-center leading-tight ${i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'}`}>
                {s.label}
              </div>
              {i < LIFE.length - 1 && <span className="text-gray-600 text-[10px]">→</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className={`rounded-xl border-2 p-3 ${alive ? 'border-emerald-400/50' : 'border-gray-700'}`}>
            <p className="text-[10px] uppercase tracking-wider text-gray-400">app_state</p>
            {Object.keys(state).length === 0 ? (
              <p className="font-mono text-[12px] text-gray-500 mt-2">{'{ }'}</p>
            ) : (
              <div className="mt-2 space-y-1 font-mono text-[12px]">
                <p>
                  <span className="text-gray-400">"model": </span>
                  <span className={state.model ? 'text-emerald-200' : 'text-amber-200'}>{state.model ?? 'None'}</span>
                </p>
                {'vectorizer' in state && state.vectorizer && (
                  <p>
                    <span className="text-gray-400">"vectorizer": </span>
                    <span className="text-emerald-200">{state.vectorizer}</span>
                  </p>
                )}
              </div>
            )}
            <p className="text-[10px] text-gray-500 mt-2">
              {step === 0 && 'Loading happens here, before the app accepts requests.'}
              {step === 1 && 'yield: the app is serving. State stays put.'}
              {step === 2 && 'The endpoint reads app_state.get("model").'}
              {step === 3 && 'app_state.clear() — resources released on shutdown.'}
            </p>
          </div>
          <div className="space-y-2">
            <Terminal
              title="uvicorn"
              lines={[
                ...(step >= 0 ? [{ text: 'Application startup: Loading model...' }] : []),
                ...(step >= 1
                  ? [ok ? { text: 'Model loaded successfully.', kind: 'ok' } : { text: 'Error: Model file not found.', kind: 'err' }]
                  : []),
                ...(step >= 1 && step < 3 ? [{ text: 'Uvicorn running on http://127.0.0.1:8000', kind: 'info' }] : []),
                ...(step === 3 ? [{ text: 'Application shutdown: Cleaning up resources...', kind: 'warn' }] : []),
              ]}
            />
            {step === 2 &&
              (ok ? (
                <>
                  <Pill code={200} text="OK" />
                  <Mono className="text-emerald-100">{'{ "text": "great product", "sentiment_prediction": "positive" }'}</Mono>
                </>
              ) : (
                <>
                  <Pill code={503} text="Service Unavailable" />
                  <Mono className="text-amber-100">{'{ "detail": "Model is not available" }'}</Mono>
                </>
              ))}
          </div>
        </div>
        <CodeLines
          lines={[
            '@asynccontextmanager',
            'async def lifespan(app: FastAPI):',
            '    app_state["model"] = joblib.load(...)   # startup',
            '    yield',
            '    app_state.clear()                        # shutdown',
            '',
            'app = FastAPI(lifespan=lifespan)',
          ]}
          active={step === 0 ? [2] : step === 3 ? [4] : step === 2 ? [2] : [3]}
        />
        <Lesson title="Recommended place for startup resources">
          The lifespan context manager keeps loading and cleanup separate from the application definition and the request handlers. The older startup/shutdown events do the same job with two separate functions.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 15. Strategy comparison diagram                                       */
/* ------------------------------------------------------------------ */

const LAZY_NODES = [
  ['App Starts', '(Fast Startup)'],
  ['Handle 1st Request', ''],
  ['Load Model', '(First Request Delay)'],
  ['Predict', ''],
  ['Handle 2nd Request', '(Fast Prediction)'],
];
const START_NODES = [
  ['App Starts', ''],
  ['Load Model', '(Startup Delay)'],
  ['App Ready', ''],
  ['Handle Request', '(Fast Prediction)'],
];

function FlowRow({ title, nodes, step, delayAt }) {
  return (
    <div className="rounded-lg bg-slate-100 p-2">
      <p className="text-center text-[10px] text-gray-700 mb-1">{title}</p>
      <div className="flex items-center">
        {nodes.map((n, i) => (
          <React.Fragment key={n[0]}>
            <motion.div
              animate={{ scale: i === step ? 1.06 : 1 }}
              className={`rounded-full border-2 px-2 py-1 text-center min-w-[5.5rem] ${i === delayAt ? 'border-amber-500 bg-amber-50' : i <= step ? 'border-teal-600 bg-white' : 'border-gray-300 bg-white'}`}
            >
              <p className="text-[9px] font-semibold text-gray-900 leading-tight">{n[0]}</p>
              {n[1] && <p className="text-[8px] text-gray-500 leading-tight">{n[1]}</p>}
            </motion.div>
            {i < nodes.length - 1 && (
              <div className={`flex-1 h-0.5 ${i === 3 ? 'border-t-2 border-dashed border-gray-400' : i < step ? 'bg-teal-600' : 'bg-gray-300'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function StrategyCompareVisualizer() {
  const [lane, setLane] = useState('lazy');
  const nodes = lane === 'lazy' ? LAZY_NODES : START_NODES;
  return <StrategyRun key={lane} lane={lane} setLane={setLane} nodes={nodes} />;
}

function StrategyRun({ lane, setLane, nodes }) {
  const stepper = useStepper(nodes.length, 1200);
  const step = stepper.index;
  const captions =
    lane === 'lazy'
      ? [
          'The app starts immediately — no model in memory yet.',
          'The first prediction request arrives.',
          'Only now is the model loaded. This request waits.',
          'Prediction runs. The loaded model is cached.',
          'The second request skips loading entirely and predicts fast.',
        ]
      : [
          'The process starts.',
          'The model is loaded before anything else. Startup waits here.',
          'The app is ready. Every later request is fast.',
          'A request is handled with the model already in memory.',
        ];

  return (
    <Frame
      title="Load on demand vs load at startup"
      hint="Play one strategy, then the other. Amber marks where the user waits."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(lane === 'lazy')} onClick={() => setLane('lazy')}>Load on demand</button>
            <button type="button" className={tabClass(lane === 'startup')} onClick={() => setLane('startup')}>Load at startup</button>
          </div>
          <StepControls stepper={stepper} total={nodes.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl bg-white p-2 space-y-3">
          <FlowRow title="Load On-Demand (Lazy)" nodes={LAZY_NODES} step={lane === 'lazy' ? step : -1} delayAt={2} />
          <FlowRow title="Load at Startup" nodes={START_NODES} step={lane === 'startup' ? step : -1} delayAt={1} />
        </div>
        <Caption text={captions[step]} />
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className={`rounded-lg border p-2 ${lane === 'startup' ? 'border-teal-400/50' : 'border-gray-800'}`}>
            <p className="flex items-center gap-1 text-white"><Clock className="w-3.5 h-3.5" /> Startup</p>
            <p className="text-gray-400">Slow once, then every request is equally fast.</p>
          </div>
          <div className={`rounded-lg border p-2 ${lane === 'lazy' ? 'border-teal-400/50' : 'border-gray-800'}`}>
            <p className="flex items-center gap-1 text-white"><Clock className="w-3.5 h-3.5" /> First request</p>
            <p className="text-gray-400">App is up quickly; the first caller pays the load time.</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 16. Handling loading failures                                         */
/* ------------------------------------------------------------------ */

const FAILURES = [
  { id: 'missing', label: 'file missing', err: 'FileNotFoundError' },
  { id: 'corrupt', label: 'file corrupted', err: 'UnpicklingError' },
  { id: 'version', label: 'incompatible version', err: 'InconsistentVersionWarning / AttributeError' },
];

export function LoadFailureVisualizer() {
  const [fail, setFail] = useState('missing');
  const [strategy, setStrategy] = useState('startup');
  const [strict, setStrict] = useState(false);
  const f = FAILURES.find((x) => x.id === fail);

  return (
    <Frame
      title="When loading fails"
      hint="Pick the failure and the strategy. For startup, choose whether the app refuses to boot or keeps running and answers 503."
      footer={
        <div className="flex flex-wrap gap-1.5">
          {FAILURES.map((x) => (
            <button key={x.id} type="button" className={tabClass(fail === x.id)} onClick={() => setFail(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabClass(strategy === 'startup')} onClick={() => setStrategy('startup')}>load at startup</button>
          <button type="button" className={tabClass(strategy === 'lazy')} onClick={() => setStrategy('lazy')}>lazy load</button>
          {strategy === 'startup' && (
            <button type="button" className={tabClass(strict)} onClick={() => setStrict(!strict)}>
              {strict ? 'crash on failure' : 'log and keep running'}
            </button>
          )}
        </div>

        <div className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-100">
          {f.err}: models/sentiment_model.pkl
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center text-[11px]">
          <div className="rounded-lg border border-gray-700 p-2 text-center text-gray-300">try: joblib.load(...)</div>
          <span className="text-gray-600">→</span>
          <div className="rounded-lg border border-rose-400/50 bg-rose-500/10 p-2 text-center text-rose-100">except: log the error</div>
          <span className="text-gray-600">→</span>
          <motion.div key={`${strategy}-${strict}-${fail}`} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-lg border border-amber-400/50 bg-amber-500/10 p-2 text-center">
            {strategy === 'lazy' && <p className="text-amber-100">that endpoint returns 503</p>}
            {strategy === 'startup' && strict && <p className="text-rose-100">app never starts</p>}
            {strategy === 'startup' && !strict && <p className="text-amber-100">app starts; /predict returns 503</p>}
          </motion.div>
        </div>

        {strategy === 'startup' && strict ? (
          <Terminal title="uvicorn" lines={[{ kind: 'err', text: `${f.err} — Application startup failed. Exiting.` }]} />
        ) : (
          <div className="space-y-1">
            <Pill code={503} text="Service Unavailable" />
            <Mono className="text-amber-100">{strategy === 'lazy' ? '{ "detail": "Model could not be loaded" }' : '{ "detail": "Model is not available" }'}</Mono>
          </div>
        )}
        <Lesson title="Always wrap the load">
          Missing, corrupted, or version-incompatible files are normal operational failures. A try/except decides whether the process dies or the prediction endpoint answers 503.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 17. Memory footprint                                                  */
/* ------------------------------------------------------------------ */

const MODELS = [
  { id: 'vec', name: 'TF-IDF vectorizer', mb: 40 },
  { id: 'lr', name: 'sentiment model', mb: 80 },
  { id: 'bert', name: 'BERT encoder', mb: 1400 },
];

export function MemoryFootprintVisualizer() {
  const [on, setOn] = useState({ vec: true, lr: true, bert: false });
  const [when, setWhen] = useState('startup');
  const [used, setUsed] = useState(false);
  const [ram, setRam] = useState(4);
  const base = 250;
  const loaded = when === 'startup' || used;
  const modelMb = MODELS.reduce((s, m) => s + (on[m.id] && loaded ? m.mb : 0), 0);
  const total = base + modelMb;
  const cap = ram * 1024;
  const over = total > cap;

  return (
    <Frame
      title="Models live in RAM while they are loaded"
      hint="Choose which models to serve, when they load, and how much RAM the machine has."
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabClass(when === 'startup')} onClick={() => setWhen('startup')}>load at startup</button>
          <button type="button" className={tabClass(when === 'lazy')} onClick={() => setWhen('lazy')}>lazy</button>
          {when === 'lazy' && (
            <button type="button" className={tabClass(used)} onClick={() => setUsed(!used)}>
              {used ? 'a request already used them' : 'no request yet'}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MODELS.map((m) => (
            <button key={m.id} type="button" className={tabClass(on[m.id])} onClick={() => setOn((c) => ({ ...c, [m.id]: !c[m.id] }))}>
              {m.name} · {m.mb >= 1024 ? `${(m.mb / 1024).toFixed(1)} GB` : `${m.mb} MB`}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-[11px] text-gray-300">
          <span className="w-24">machine RAM</span>
          <input type="range" min={1} max={16} value={ram} onChange={(e) => setRam(Number(e.target.value))} className="flex-1 accent-teal-500" />
          <span className="font-mono text-white w-12">{ram} GB</span>
        </label>

        <div className="rounded-xl border border-gray-700 p-3 space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="flex items-center gap-1 text-gray-300"><Database className="w-3.5 h-3.5" /> resident memory</span>
            <span className={`font-mono ${over ? 'text-rose-300' : 'text-white'}`}>{(total / 1024).toFixed(2)} GB / {ram} GB</span>
          </div>
          <div className="h-8 rounded bg-gray-800 overflow-hidden flex">
            <motion.div animate={{ width: `${Math.min(100, (base / cap) * 100)}%` }} className="h-full bg-sky-500/70" />
            <motion.div animate={{ width: `${Math.min(100 - (base / cap) * 100, (modelMb / cap) * 100)}%` }} className={`h-full ${over ? 'bg-rose-400' : 'bg-teal-400'}`} />
          </div>
          <div className="flex gap-3 text-[10px] text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-sky-500/70" /> app baseline ~250 MB</span>
            <span className="flex items-center gap-1"><span className={`w-2 h-2 rounded-sm ${over ? 'bg-rose-400' : 'bg-teal-400'}`} /> models {loaded ? '' : '(not loaded)'}</span>
          </div>
          {over && (
            <p className="flex items-center gap-1 text-[11px] text-rose-200">
              <XCircle className="w-3.5 h-3.5" /> Larger than this machine. The process will swap or be killed.
            </p>
          )}
          {!loaded && <p className="flex items-center gap-1 text-[11px] text-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> Nothing loaded yet — baseline only, until a request needs a model.</p>}
        </div>
        <p className="flex items-start gap-1.5 text-[11px] text-gray-400">
          <HardDrive className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Loading large models at startup raises the baseline for the whole life of the process. Size the deployment’s RAM for every model you intend to keep loaded.
        </p>
      </div>
    </Frame>
  );
}
