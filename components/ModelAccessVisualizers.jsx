import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Folder, HardDrive, KeyRound, Lock, Server, Shield } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, Caption } from './VisualKit';
import { Mono, Pill } from './PydanticKit';

const score = (f1, f2) => Math.round((f1 * 1.2 + f2 * 0.4) * 100) / 100;

/* ------------------------------------------------------------------ */
/* Global variable vs Depends                                             */
/* ------------------------------------------------------------------ */

const COUPLE = [
  'The file is loaded once, into a name every endpoint can see.',
  'make_prediction reaches sideways into that global. The function signature never mentions a model.',
  'A test wants a fake model. The global is already the real file, so the endpoint still calls it.',
  'Depends leaves an empty parameter. FastAPI fills it before the function runs.',
  'Production passes the real model. The test passes a fake. The endpoint code stays the same.',
];

export function GlobalCouplingVisualizer() {
  const stepper = useStepper(COUPLE.length, 1400);
  const step = stepper.index;
  const testing = step === 2 || step === 4;
  const injected = step >= 3;
  const modelName = step === 4 && testing ? 'fake' : 'real file';
  return (
    <Frame
      title="The endpoint should receive the model, not reach for it"
      hint="A global is easy until a test needs a different model. Depends is the slot FastAPI fills."
      footer={<StepControls stepper={stepper} total={COUPLE.length} />}
    >
      <div className="space-y-3">
        <Caption text={COUPLE[step]} />
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <div className={`rounded-xl border p-3 ${injected ? 'border-gray-700' : 'border-amber-400/50'}`}>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">module</p>
            <p className="font-mono text-[12px] text-white mt-1">loaded_model</p>
            <p className="text-[10px] text-gray-400">{step === 4 ? 'stays on the shelf during the test' : 'joblib.load(...) at import'}</p>
          </div>
          <div className="flex items-center text-[10px] text-gray-500 w-16 text-center">
            {injected ? 'passed in' : 'reached from inside'}
          </div>
          <div className={`rounded-xl border p-3 ${injected ? 'border-teal-400/50' : 'border-gray-700'}`}>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">make_prediction</p>
            <p className="font-mono text-[11px] text-teal-100 mt-1">{injected ? 'model = Depends(get_model)' : 'uses global model'}</p>
            <p className="mt-2 text-[11px] text-white">calls {testing && step === 4 ? 'fake.predict' : step >= 1 ? `${modelName}.predict` : '…'}</p>
          </div>
        </div>
        {step === 2 && <p className="text-[11px] text-rose-200">The test cannot swap the model without editing the endpoint or the global.</p>}
        {step === 4 && <Lesson title="What changed">The endpoint still only validates, predicts, and formats. Who built the model lives in get_model.</Lesson>}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* The three Depends steps                                                */
/* ------------------------------------------------------------------ */

const FLOW = [
  { title: 'A request arrives at POST /predict/', detail: 'FastAPI has not called your function yet.' },
  { title: 'It calls the callable you passed to Depends', detail: 'get_model() runs.' },
  { title: 'It keeps the return value', detail: 'That value is the object stored as loaded_model.' },
  { title: 'It passes that object in as model', detail: 'make_prediction then runs, and never looks up the file itself.' },
];

export function DependsFlowVisualizer() {
  const stepper = useStepper(FLOW.length, 1300);
  const step = stepper.index;
  const boxes = [
    { id: 0, label: 'request', sub: 'POST /predict/' },
    { id: 1, label: 'get_model()', sub: 'the dependency' },
    { id: 2, label: 'loaded_model', sub: 'return value' },
    { id: 3, label: 'model arg', sub: 'your function' },
  ];
  return (
    <Frame
      title="FastAPI calls get_model before your function"
      hint="Depends does three things: call the dependency, take what it returns, and pass that in."
      footer={<StepControls stepper={stepper} total={FLOW.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${FLOW[step].title}`} />
        <div className="grid grid-cols-4 gap-1.5">
          {boxes.map((box) => (
            <motion.div key={box.id} animate={{ opacity: box.id <= step ? 1 : 0.35, y: box.id === step ? -2 : 0 }} className={`rounded-xl border px-2 py-3 text-center ${box.id === step ? 'border-teal-400 bg-teal-500/10' : 'border-gray-700'}`}>
              <p className="font-mono text-[11px] text-white">{box.label}</p>
              <p className="text-[9px] text-gray-500 mt-1">{box.sub}</p>
            </motion.div>
          ))}
        </div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <motion.div animate={{ width: `${((step + 1) / FLOW.length) * 100}%` }} className="h-full bg-teal-400" />
        </div>
        <p className="text-[12px] text-gray-200">{FLOW[step].detail}</p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Injected prediction                                                    */
/* ------------------------------------------------------------------ */

const PREDICT_STEPS = [
  'get_model() returns the object that will be called model',
  'The body is built into the 2D list the model expects',
  'model.predict returns an array, even for one row',
  'prediction_result[0] is the single number',
  'PredictionOutput is the JSON body, status 200',
];

export function InjectedPredictVisualizer() {
  const [f1, setF1] = useState(2);
  const [f2, setF2] = useState(4);
  const [boom, setBoom] = useState(false);
  return <PredictRun key={boom ? 'boom' : 'ok'} f1={f1} setF1={setF1} f2={f2} setF2={setF2} boom={boom} setBoom={setBoom} />;
}

function PredictRun({ f1, setF1, f2, setF2, boom, setBoom }) {
  const stepper = useStepper(PREDICT_STEPS.length, 1200);
  const step = stepper.index;
  const value = score(f1, f2);
  return (
    <Frame
      title="The endpoint only sees the model argument"
      hint="Move the features. The injected model scores 1.2 × feature1 + 0.4 × feature2. If predict raises, the client gets 500."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button type="button" className={tabClass(boom)} onClick={() => setBoom(!boom)}>{boom ? 'predict raised' : 'predict works'}</button>
          <StepControls stepper={stepper} total={PREDICT_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Slider label="feature1" min={0} max={10} step={0.5} value={f1} onChange={setF1} />
          <Slider label="feature2" min={0} max={10} step={1} value={f2} onChange={setF2} />
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-full bg-teal-500/15 text-teal-100 text-[10px] font-mono">model ← get_model()</span>
          <span className="text-[10px] text-gray-500">the function does not open a file</span>
        </div>
        {boom ? (
          <div className="space-y-1">
            <Caption text="The try block catches the exception and raises HTTPException. The response model is not used." />
            <Pill code={500} text="Internal Server Error" />
            <Mono className="text-rose-100">{'{ "detail": "Prediction error: feature mismatch" }'}</Mono>
          </div>
        ) : (
          <div className="space-y-2">
            <Caption text={`${step + 1}. ${PREDICT_STEPS[step]}`} />
            <div className="font-mono text-[12px] text-white space-y-1">
              {step >= 1 && <p>[[{f1}, {f2}]]</p>}
              {step >= 2 && <p className="text-gray-300">predict → [{value}]</p>}
              {step >= 3 && <p className="text-teal-200">[0] → {value}</p>}
            </div>
            {step === 4 && (
              <div className="space-y-1">
                <Pill code={200} text="OK" />
                <Mono className="text-emerald-100">{JSON.stringify({ prediction: value })}</Mono>
              </div>
            )}
          </div>
        )}
      </div>
    </Frame>
  );
}

function Slider({ label, min, max, step, value, onChange }) {
  return (
    <label className="text-[11px] text-gray-300">
      <span className="flex justify-between"><span>{label}</span><span className="font-mono text-white">{value}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-teal-500" />
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Five benefits                                                          */
/* ------------------------------------------------------------------ */

const BENEFITS = [
  {
    title: 'Decoupling',
    body: 'make_prediction validates, predicts, and formats. get_model is the only function that knows how the file was loaded.',
  },
  {
    title: 'Testability',
    body: 'TestClient overrides get_model with a fake that returns 0.5. The real model stays unused.',
  },
  {
    title: 'Reusability',
    body: '/predict and /predict_proba both declare Depends(get_model). One function serves both.',
  },
  {
    title: 'Maintainability',
    body: 'Adding a cache happens inside get_model. Neither endpoint changes.',
  },
  {
    title: 'Clarity',
    body: 'The signature lists model, so a reader can see the requirement without opening the body.',
  },
];

export function DependsBenefitsVisualizer() {
  const stepper = useStepper(BENEFITS.length, 1500);
  const step = stepper.index;
  return (
    <Frame
      title={BENEFITS[step].title}
      hint="Same endpoint, five reasons to take the model as a dependency."
      footer={<StepControls stepper={stepper} total={BENEFITS.length} />}
    >
      <div className="space-y-3">
        <Caption text={BENEFITS[step].body} />
        {step === 0 && <SplitRooms />}
        {step === 1 && <TestSwap />}
        {step === 2 && <SharedDep />}
        {step === 3 && <CacheEdit />}
        {step === 4 && <SignatureGlow />}
      </div>
    </Frame>
  );
}

function SplitRooms() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-gray-700 p-3">
        <p className="text-[10px] text-gray-500">get_model</p>
        <p className="font-mono text-[11px] text-white mt-1">return loaded_model</p>
      </div>
      <div className="rounded-xl border border-teal-400/40 p-3">
        <p className="text-[10px] text-gray-500">make_prediction</p>
        <p className="text-[11px] text-gray-200 mt-1">validate → predict → JSON</p>
      </div>
    </div>
  );
}

function TestSwap() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[11px]">
        <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 line-through">real model</span>
        <span className="text-gray-600">override</span>
        <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="px-2 py-1 rounded bg-teal-500/20 text-teal-100">fake.predict → 0.5</motion.span>
      </div>
      <Pill code={200} text="OK" />
      <Mono className="text-emerald-100">{'{ "prediction": 0.5 }'}</Mono>
    </div>
  );
}

function SharedDep() {
  return (
    <div className="flex items-center justify-center gap-3">
      {['/predict', '/predict_proba'].map((path) => (
        <div key={path} className="rounded-xl border border-gray-700 px-3 py-2 font-mono text-[11px] text-white">{path}</div>
      ))}
      <span className="text-gray-600">←</span>
      <div className="rounded-xl border border-teal-400/50 px-3 py-2 font-mono text-[11px] text-teal-100">get_model</div>
    </div>
  );
}

function CacheEdit() {
  return (
    <div className="space-y-2">
      <motion.div initial={{ borderColor: '#374151' }} animate={{ borderColor: '#2dd4bf' }} className="rounded-xl border p-3">
        <p className="text-[10px] text-gray-500">only this function changes</p>
        <p className="font-mono text-[12px] text-white">get_model() + cache</p>
      </motion.div>
      <p className="text-[11px] text-gray-400">/predict and /predict_proba still say Depends(get_model)</p>
    </div>
  );
}

function SignatureGlow() {
  return (
    <div className="rounded-xl bg-gray-950 border border-gray-700 p-3 font-mono text-[11px] leading-relaxed text-gray-300">
      <p>async def make_prediction(</p>
      <p className="pl-4">input_data: PredictionInput,</p>
      <motion.p initial={{ backgroundColor: 'rgba(20,184,166,0)' }} animate={{ backgroundColor: 'rgba(20,184,166,0.18)' }} className="pl-4 text-teal-100 rounded">model: Any = Depends(get_model)</motion.p>
      <p>):</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Where the file lives                                                   */
/* ------------------------------------------------------------------ */

const STORES = [
  {
    id: 'app',
    label: 'in the app',
    icon: Folder,
    place: 'models/  or  artifacts/',
    pros: ['No extra service', 'Sits next to the code', 'Git can track the filename'],
    cons: ['Repo and image grow', 'Model ships with every deploy', 'Awkward for frequent retrains'],
  },
  {
    id: 'share',
    label: 'file server',
    icon: Server,
    place: '\\\\fileserver\\models\\sentiment.pkl',
    pros: ['One copy for many apps', 'Separate from the git repo'],
    cons: ['Needs network permission', 'Slow path adds latency', 'Versioning is mostly manual'],
  },
  {
    id: 'cloud',
    label: 'cloud bucket',
    icon: Cloud,
    place: 's3://models/sentiment.pkl',
    pros: ['Durable and scalable', 'Object versions built in', 'Update the file without a new deploy'],
    cons: ['Account, keys, and an SDK', 'boto3 or google-cloud-storage', 'Storage and transfer cost'],
  },
  {
    id: 'registry',
    label: 'model registry',
    icon: Shield,
    place: 'mlflow: sentiment @ Production',
    pros: ['Stage: Staging → Production', 'Run, params, and metrics stay attached', 'Lineage for the team'],
    cons: ['Another platform to learn', 'Heavier than a single file', 'More than a tiny app needs'],
  },
];

export function StorageLocationVisualizer() {
  const [id, setId] = useState('app');
  const store = STORES.find((item) => item.id === id);
  const Icon = store.icon;
  return (
    <Frame
      title="The artifact has to live somewhere"
      hint="Pick a home for the serialized file. The app still has to be able to open that path at load time."
      footer={
        <div className="flex gap-2 flex-wrap">
          {STORES.map((item) => (
            <button key={item.id} type="button" className={tabClass(id === item.id)} onClick={() => setId(item.id)}>{item.label}</button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        <motion.div key={id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-teal-400/40 bg-teal-500/5 p-3 flex items-center gap-3">
          <Icon className="w-5 h-5 text-teal-300 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">file location</p>
            <p className="font-mono text-[12px] text-white">{store.place}</p>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 gap-2">
          <ChipList title="helps" tone="text-emerald-200" items={store.pros} />
          <ChipList title="costs" tone="text-amber-200" items={store.cons} />
        </div>
      </div>
    </Frame>
  );
}

function ChipList({ title, tone, items }) {
  return (
    <div className="space-y-1">
      <p className={`text-[10px] uppercase tracking-wider ${tone}`}>{title}</p>
      {items.map((item) => (
        <p key={item} className="text-[11px] text-gray-200 rounded-lg bg-gray-950 border border-gray-800 px-2 py-1">{item}</p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Config path and when to load                                           */
/* ------------------------------------------------------------------ */

const ENVS = {
  dev: './models/sentiment_v1.pkl',
  staging: 's3://staging-models/sentiment_v1.pkl',
  prod: 's3://prod-models/sentiment_v1.pkl',
};

export function ConfigLoadVisualizer() {
  const [env, setEnv] = useState('dev');
  const [when, setWhen] = useState('startup');
  const [hard, setHard] = useState(false);
  const path = ENVS[env];
  const broken = hard && env !== 'dev';
  return (
    <Frame
      title="Read the path from settings, then choose when to load"
      hint="The code asks for settings.model_path. The environment fills it in. Cloud files are slower the first time, so a startup load plus a cache is the usual choice."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {Object.keys(ENVS).map((name) => (
              <button key={name} type="button" className={tabClass(env === name)} onClick={() => setEnv(name)}>{name}</button>
            ))}
            <button type="button" className={tabClass(hard)} onClick={() => setHard(!hard)}>{hard ? 'path hardcoded' : 'path from settings'}</button>
          </div>
          <div className="flex gap-2">
            <button type="button" className={tabClass(when === 'startup')} onClick={() => setWhen('startup')}>load at startup</button>
            <button type="button" className={tabClass(when === 'demand')} onClick={() => setWhen('demand')}>load on demand</button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 font-mono text-[11px]">
          <p className="text-gray-500"># application code, same in every environment</p>
          <p className={broken ? 'text-rose-200' : 'text-teal-100'}>{hard ? "path = './models/sentiment_v1.pkl'" : 'path = settings.model_path'}</p>
          <p className="text-white mt-2">{broken ? 'FileNotFoundError in this environment' : path}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-gray-500">{when === 'startup' ? 'Download once while the app boots. Requests after that are local.' : 'The first request waits on the download. Later requests can hit a cache.'}</p>
          <Latency label="boot" width={when === 'startup' ? (env === 'dev' ? 20 : 70) : 8} />
          <Latency label="1st request" width={when === 'demand' ? (env === 'dev' ? 28 : 80) : 8} />
          <Latency label="2nd request" width={8} />
        </div>
      </div>
    </Frame>
  );
}

function Latency({ label, width }) {
  return (
    <div className="grid grid-cols-[5.5rem_1fr] items-center gap-2 text-[10px]">
      <span className="text-gray-400">{label}</span>
      <div className="h-2 rounded bg-gray-800"><motion.div animate={{ width: `${width}%` }} className={`h-full rounded ${width > 40 ? 'bg-amber-400' : 'bg-teal-400'}`} /></div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Why version                                                            */
/* ------------------------------------------------------------------ */

const VERSION_STEPS = [
  { live: 'v1', note: 'Every prediction can be traced to sentiment_v1.', bad: false, ab: false },
  { live: 'v2', note: 'v2 is now the file the app loads.', bad: false, ab: false },
  { live: 'v2', note: 'v2 is wrong on real traffic. The previous file is still on disk.', bad: true, ab: false },
  { live: 'v1', note: 'Rollback points the app at v1 again. No retrain required.', bad: false, ab: false },
  { live: 'both', note: 'A/B keeps both versions serving. Each response says which one ran.', bad: false, ab: true },
];

export function VersioningVisualizer() {
  const stepper = useStepper(VERSION_STEPS.length, 1400);
  const step = stepper.index;
  const item = VERSION_STEPS[step];
  return (
    <Frame
      title="A version is how you trace, undo, and compare"
      hint="Ship v2, watch it fail, roll back to v1, or serve both."
      footer={<StepControls stepper={stepper} total={VERSION_STEPS.length} />}
    >
      <div className="space-y-3">
        <Caption text={item.note} />
        <div className="grid grid-cols-2 gap-2">
          {['v1', 'v2'].map((ver) => {
            const on = item.live === ver || item.live === 'both';
            return (
              <motion.div key={ver} animate={{ opacity: on ? 1 : 0.4 }} className={`rounded-xl border p-3 ${on ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800'}`}>
                <p className="font-mono text-sm text-white">sentiment_{ver}.pkl</p>
                <p className="text-[10px] text-gray-400 mt-1">{on ? 'serving' : 'kept, not serving'}</p>
              </motion.div>
            );
          })}
        </div>
        {item.bad && <p className="text-[12px] text-rose-200">predictions from v2 are off</p>}
        <Mono className={item.bad ? 'text-rose-100' : 'text-emerald-100'}>
          {item.ab
            ? '{ "prediction": 0.62, "model_version": "v1" }   |   { "prediction": 0.71, "model_version": "v2" }'
            : `{ "prediction": ${item.live === 'v2' ? '0.71' : '0.62'}, "model_version": "${item.live === 'v2' ? 'v2' : 'v1'}" }`}
        </Mono>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* How the version is named                                               */
/* ------------------------------------------------------------------ */

const STRATEGIES = [
  {
    id: 'name',
    label: 'filename',
    files: ['sentiment_model_v1.2.pkl', 'forecast_model_2024-03-15.joblib'],
    point: 'The version is in the filename. The settings path names one of them.',
  },
  {
    id: 'dir',
    label: 'directories',
    files: ['models/v1/model.pkl', 'models/v2/model.pkl'],
    point: 'Same filename, different folder. Point the app at models/v2.',
  },
  {
    id: 'cloud',
    label: 'object versions',
    files: ['sentiment.pkl  version 3P2k…', 'sentiment.pkl  version 9aQ1…'],
    point: 'One key. The bucket keeps older bytes and you request a version id.',
  },
  {
    id: 'reg',
    label: 'registry',
    files: ['version 3 · Staging · acc 0.91', 'version 4 · Production · acc 0.94'],
    point: 'The registry ties a version to a training run, metrics, and a stage.',
  },
];

export function VersionStrategyVisualizer() {
  const [id, setId] = useState('name');
  const [pick, setPick] = useState(0);
  const strategy = STRATEGIES.find((item) => item.id === id);
  return (
    <Frame
      title="Four ways to point at one version"
      hint="Click a file. That is the artifact the app will load."
      footer={
        <div className="flex gap-2 flex-wrap">
          {STRATEGIES.map((item) => (
            <button key={item.id} type="button" className={tabClass(id === item.id)} onClick={() => { setId(item.id); setPick(0); }}>{item.label}</button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          {strategy.files.map((file, i) => (
            <button key={file} type="button" onClick={() => setPick(i)} className={`w-full text-left rounded-lg border px-3 py-2 font-mono text-[11px] ${pick === i ? 'border-teal-400 text-teal-50 bg-teal-500/10' : 'border-gray-700 text-gray-300'}`}>
              {file}
            </button>
          ))}
        </div>
        <p className="text-[12px] text-gray-200">{strategy.point}</p>
        <Mono className="text-emerald-100">loading {strategy.files[pick]}</Mono>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Project tree                                                           */
/* ------------------------------------------------------------------ */

const TREE_NODES = {
  root: { x: 360, y: 8, w: 140, h: 34, label: 'my_ml_api/', kind: 'folder' },
  app: { x: 118, y: 102, w: 110, h: 32, label: 'app/', kind: 'folder' },
  models: { x: 400, y: 102, w: 120, h: 32, label: 'models/', kind: 'folder' },
  req: { x: 560, y: 102, w: 148, h: 32, label: 'requirements.txt', kind: 'file' },
  docker: { x: 730, y: 102, w: 112, h: 32, label: 'Dockerfile', kind: 'file' },
  main: { x: 8, y: 208, w: 96, h: 30, label: 'main.py', kind: 'file' },
  routers: { x: 112, y: 208, w: 104, h: 30, label: 'routers.py', kind: 'file' },
  schemas: { x: 224, y: 208, w: 108, h: 30, label: 'schemas.py', kind: 'file' },
  v1: { x: 352, y: 208, w: 150, h: 30, label: 'sentiment_v1.pkl', kind: 'model' },
  v2: { x: 514, y: 208, w: 172, h: 30, label: 'sentiment_v2.joblib', kind: 'model' },
};

const TREE_EDGES = [
  ['root', 'app'],
  ['root', 'models'],
  ['root', 'req'],
  ['root', 'docker'],
  ['app', 'main'],
  ['app', 'routers'],
  ['app', 'schemas'],
  ['models', 'v1'],
  ['models', 'v2'],
];

const TREE_STEPS = [
  {
    title: 'my_ml_api/ holds four things side by side',
    hot: ['root', 'app', 'models', 'req', 'docker'],
    detail: 'app/ and models/ are siblings. The weights are not stored inside the Python package.',
  },
  {
    title: 'app/ is only the code',
    hot: ['app', 'main', 'routers', 'schemas'],
    detail: 'main.py starts the API. routers.py defines the endpoints. schemas.py defines the Pydantic models.',
  },
  {
    title: 'models/ is the other sibling, and it holds the files you trained',
    hot: ['models', 'v1', 'v2'],
    detail: 'sentiment_v1.pkl is the file the app loads. sentiment_v2.joblib is the newer one sitting next to it.',
  },
  {
    title: 'main.py leaves app/ and opens the sibling file',
    hot: ['main', 'app', 'root', 'models', 'v1'],
    detail: 'From inside app/, the path ../models/sentiment_v1.pkl means: go up one folder, then into models/.',
  },
];

const NODE_STEP = {
  root: 0, req: 0, docker: 0, app: 1, main: 1, routers: 1, schemas: 1, models: 2, v2: 2, v1: 3,
};

export function ProjectTreeVisualizer() {
  const stepper = useStepper(TREE_STEPS.length, 1600);
  const step = stepper.index;
  const stage = TREE_STEPS[step];
  const hot = new Set(stage.hot);
  const focus = (id) => stepper.pick(NODE_STEP[id]);

  return (
    <Frame
      title="The model file sits beside the code, not inside it"
      hint="Follow the arrows. app/ and models/ are both children of my_ml_api/. The last step is the path main.py uses to open the model."
      footer={<StepControls stepper={stepper} total={TREE_STEPS.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${stage.title}`} />
        <div className="rounded-xl bg-[#1b2430] p-2 overflow-x-auto">
          <svg viewBox="0 0 860 318" className="w-full min-w-[640px]">
            <defs>
              <marker id="tree-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="#94a3b8" />
              </marker>
              <marker id="tree-arrow-hot" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 Z" fill="#5eead4" />
              </marker>
            </defs>
            {TREE_EDGES.map(([from, to]) => {
              const a = TREE_NODES[from];
              const b = TREE_NODES[to];
              const on = hot.has(from) && hot.has(to);
              return (
                <line
                  key={`${from}-${to}`}
                  x1={a.x + a.w / 2}
                  y1={a.y + a.h}
                  x2={b.x + b.w / 2}
                  y2={b.y - (b.kind === 'folder' ? 8 : 0)}
                  stroke={on ? '#5eead4' : '#64748b'}
                  strokeWidth={on ? 2 : 1.25}
                  markerEnd={on ? 'url(#tree-arrow-hot)' : 'url(#tree-arrow)'}
                />
              );
            })}
            {step === 3 && <LoadArc />}
            {Object.entries(TREE_NODES).map(([id, node]) => (
              <TreeGlyph key={id} id={id} node={node} on={hot.has(id)} onPick={focus} />
            ))}
          </svg>
        </div>
        <div className="flex gap-3 text-[10px] text-gray-400">
          <span className="inline-flex items-center gap-1"><i className="w-3 h-3 rounded-sm bg-sky-200 inline-block" /> folder</span>
          <span className="inline-flex items-center gap-1"><i className="w-3 h-3 rounded-sm bg-white inline-block" /> Python or config</span>
          <span className="inline-flex items-center gap-1"><i className="w-3 h-3 rounded-sm bg-emerald-300 inline-block" /> model artifact</span>
        </div>
        <p className="text-[12px] text-gray-100">{stage.detail}</p>
        {step === 3 && (
          <Mono className="text-emerald-100">app/main.py  →  ../models/sentiment_v1.pkl</Mono>
        )}
      </div>
    </Frame>
  );
}

function LoadArc() {
  const main = TREE_NODES.main;
  const model = TREE_NODES.v1;
  const x1 = main.x + main.w / 2;
  const x2 = model.x + model.w / 2;
  const y = 292;
  return (
    <g>
      <motion.path
        d={`M ${x1} ${main.y + main.h + 2} C ${x1} ${y}, ${x2} ${y}, ${x2} ${model.y + model.h + 2}`}
        fill="none"
        stroke="#2dd4bf"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7 }}
      />
      <text x={(x1 + x2) / 2} y="310" textAnchor="middle" fontSize="11" fill="#99f6e4" fontFamily="ui-monospace, monospace">
        ../models/sentiment_v1.pkl
      </text>
    </g>
  );
}

function TreeGlyph({ id, node, on, onPick }) {
  const fill = node.kind === 'folder' ? (on ? '#7dd3fc' : '#e0f2fe') : node.kind === 'model' ? (on ? '#34d399' : '#d1fae5') : (on ? '#ffffff' : '#f8fafc');
  return (
    <g onClick={() => onPick(id)} style={{ cursor: 'pointer', opacity: on ? 1 : 0.38 }}>
      {node.kind === 'folder' && <rect x={node.x + 2} y={node.y - 7} width="26" height="8" rx="2" fill={fill} />}
      <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="4" fill={fill} stroke={on ? '#0f766e' : '#cbd5e1'} strokeWidth={on ? 2 : 1} />
      {node.kind !== 'folder' && <path d={`M ${node.x + node.w - 10} ${node.y} L ${node.x + node.w} ${node.y + 10} L ${node.x + node.w - 10} ${node.y + 10} Z`} fill="#cbd5e1" />}
      <text x={node.x + node.w / 2} y={node.y + node.h / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0f172a" fontFamily="ui-sans-serif, system-ui, sans-serif">
        {node.label}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Security                                                               */
/* ------------------------------------------------------------------ */

const LOCKS = {
  local: {
    label: 'local disk',
    icon: HardDrive,
    locked: 'mode 640 — only the app user can read models/',
    open: 'world-readable directory — any user on the machine can open the file',
    deny: 'Permission denied',
  },
  cloud: {
    label: 'cloud bucket',
    icon: Cloud,
    locked: 'IAM allows this role. The object is encrypted at rest.',
    open: 'No access key. The bucket answers 403.',
    deny: '403 AccessDenied',
  },
  registry: {
    label: 'registry',
    icon: Shield,
    locked: 'A token for this service account can pull the Production model.',
    open: 'Anonymous pull is rejected by the registry.',
    deny: '401 Unauthorized',
  },
};

export function ArtifactSecurityVisualizer() {
  const [place, setPlace] = useState('local');
  const [ok, setOk] = useState(true);
  const lock = LOCKS[place];
  const Icon = lock.icon;
  return (
    <Frame
      title="The file is a credential-shaped artifact"
      hint="Proprietary weights, and sometimes the preprocessing inside them, should not be readable by everyone."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            {Object.entries(LOCKS).map(([id, item]) => (
              <button key={id} type="button" className={tabClass(place === id)} onClick={() => setPlace(id)}>{item.label}</button>
            ))}
          </div>
          <button type="button" className={tabClass(ok)} onClick={() => setOk(!ok)}>{ok ? 'credentials present' : 'no credentials'}</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-700 bg-gray-950 p-3">
          <Icon className="w-5 h-5 text-gray-300" />
          <div className="flex-1">
            <p className="font-mono text-[12px] text-white">sentiment_v1.pkl</p>
            <p className="text-[11px] text-gray-400">{ok ? lock.locked : lock.open}</p>
          </div>
          {ok ? <Lock className="w-4 h-4 text-teal-300" /> : <KeyRound className="w-4 h-4 text-rose-300" />}
        </div>
        {ok ? <Pill code={200} text="model bytes" /> : <Pill code={place === 'registry' ? 401 : place === 'cloud' ? 403 : 500} text={lock.deny} />}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Packaging                                                              */
/* ------------------------------------------------------------------ */

export function PackagingVisualizer() {
  const [mode, setMode] = useState('copy');
  const [offline, setOffline] = useState(false);
  const copy = mode === 'copy';
  const failed = !copy && offline;
  return (
    <Frame
      title="The image either contains the file or fetches it"
      hint="COPY bakes the artifact into the image. A bucket download keeps the image small and needs the network plus credentials when the container starts."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(copy)} onClick={() => setMode('copy')}>COPY into the image</button>
            <button type="button" className={tabClass(!copy)} onClick={() => setMode('pull')}>download at startup</button>
          </div>
          {!copy && <button type="button" className={tabClass(offline)} onClick={() => setOffline(!offline)}>{offline ? 'network down' : 'network up'}</button>}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-400"><span>image size</span><span className="font-mono text-white">{copy ? '840 MB' : '160 MB'}</span></div>
          <div className="h-3 rounded bg-gray-800"><motion.div animate={{ width: copy ? '100%' : '22%' }} className={`h-full rounded ${copy ? 'bg-amber-400' : 'bg-teal-400'}`} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stage on label="build" detail={copy ? 'COPY models/' : 'code only'} />
          <Stage on={copy || !offline} label="start" detail={copy ? 'file already inside' : offline ? 'cannot reach bucket' : 'download artifact'} />
          <Stage on={!failed} label="ready" detail={failed ? 'crash' : 'model in memory'} />
        </div>
        {failed ? <Pill code={500} text="model download failed" /> : <Pill code={200} text={copy ? 'ready, no network' : 'ready after download'} />}
        <Lesson title="What production usually does">A registry or a bucket keeps the model off the image, so a retrain does not require a new build. The container then needs credentials and a network path.</Lesson>
      </div>
    </Frame>
  );
}

function Stage({ on, label, detail }) {
  return (
    <div className={`rounded-xl border px-2 py-2 ${on ? 'border-teal-400/40' : 'border-rose-400/40'}`}>
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`text-[11px] mt-1 ${on ? 'text-gray-100' : 'text-rose-200'}`}>{detail}</p>
    </div>
  );
}
