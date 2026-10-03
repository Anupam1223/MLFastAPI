import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStepper, Frame, StepControls, tabClass, Lesson, Caption } from './VisualKit';
import { Mono, Pill } from './PydanticKit';

const ENDPOINTS = [
  { id: 'predict', method: 'POST', path: '/predict', kind: 'prediction' },
  { id: 'info', method: 'GET', path: '/info', kind: 'prediction' },
  { id: 'health', method: 'GET', path: '/health', kind: 'status' },
  { id: 'reload', method: 'POST', path: '/reload', kind: 'manage' },
];

const KIND_TONE = {
  prediction: 'border-teal-400/60 bg-teal-500/10 text-teal-100',
  status: 'border-sky-400/60 bg-sky-500/10 text-sky-100',
  manage: 'border-amber-400/60 bg-amber-500/10 text-amber-100',
};

/* ------------------------------------------------------------------ */
/* One file vs routers                                                    */
/* ------------------------------------------------------------------ */

const SPLIT = [
  'Every URL lives in main.py. Prediction, health, and reload sit in the same file.',
  'The prediction pair belongs together. Pull them into a mini app called a router.',
  'Status and model-management routes get their own files too.',
  'main.py only creates the app and includes the routers. The URL the client calls does not change.',
];

function mainItems(step) {
  if (step === 0) return ENDPOINTS;
  if (step === 1) return ENDPOINTS.filter((item) => item.kind !== 'prediction');
  if (step === 2) return [];
  return [];
}

export function TangledMainVisualizer() {
  const stepper = useStepper(SPLIT.length, 1400);
  const step = stepper.index;
  return (
    <Frame
      title="main.py should not hold every URL"
      hint="An APIRouter is a mini FastAPI app. Related endpoints move into their own module, then the main app includes that module."
      footer={<StepControls stepper={stepper} total={SPLIT.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${SPLIT[step]}`} />
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <FileLane
            name="main.py"
            items={mainItems(step)}
            extra={step >= 3 ? ['include predictions', 'include status', 'include manage', 'GET /'] : []}
            highlight={step === 0 || step === 3}
          />
          <div className="space-y-2">
            {step >= 1 && <FileLane name="routers/predictions.py" items={ENDPOINTS.filter((item) => item.kind === 'prediction')} highlight={step === 1} />}
            {step >= 2 && <FileLane name="routers/status.py" items={ENDPOINTS.filter((item) => item.kind === 'status')} highlight={step === 2} />}
            {step >= 2 && <FileLane name="routers/manage.py" items={ENDPOINTS.filter((item) => item.kind === 'manage')} highlight={step === 2} />}
          </div>
        </div>
        {step === 3 && <Lesson title="The client still calls the same URLs">include_router copies the path operations onto the app. /predict is still /predict unless you add a prefix.</Lesson>}
      </div>
    </Frame>
  );
}

function FileLane({ name, items, extra = [], highlight }) {
  return (
    <motion.div layout className={`rounded-xl border p-2 min-h-[7rem] ${highlight ? 'border-teal-400 bg-teal-500/5' : 'border-gray-700'}`}>
      <p className="font-mono text-[11px] text-white mb-2">{name}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <motion.div layout key={item.id} className={`rounded-md border px-2 py-1 font-mono text-[10px] ${KIND_TONE[item.kind]}`}>
            {item.method} {item.path}
          </motion.div>
        ))}
        {extra.map((line) => (
          <p key={line} className="font-mono text-[10px] text-gray-400">{line}</p>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* @router.post is the same shape as @app.post                            */
/* ------------------------------------------------------------------ */

const ROUTER_LINES = [
  'router = APIRouter()',
  '@router.post("/make")',
  'async def make_prediction(data: PredictionInput):',
  '    return PredictionOutput(...)',
  '@router.get("/info")',
  'async def get_model_info():',
  '    return {"model_name": "ExamplePredictor"}',
];

const ROUTER_STEPS = [
  { title: 'Create the router object, the way you create app', active: [0], note: 'APIRouter() is empty until you decorate functions on it.' },
  { title: '@router.post, not @app.post. The function looks the same.', active: [1, 2, 3], note: 'PredictionInput in, PredictionOutput out. The decorator is the only change.' },
  { title: 'A GET on the same router stays next to the POST', active: [4, 5, 6], note: 'Both live in routers/predictions.py. Neither is registered on the app yet.' },
  { title: 'Until include_router runs, these URLs do not exist', active: [], note: 'A request to /make would 404. The next slide plugs the router in.' },
];

export function RouterDefineVisualizer() {
  const stepper = useStepper(ROUTER_STEPS.length, 1400);
  const step = stepper.index;
  const s = ROUTER_STEPS[step];
  return (
    <Frame
      title="A router takes the same decorators as app"
      hint="The path, the Pydantic models, and the function body stay. Only the object you decorate changes from app to router."
      footer={<StepControls stepper={stepper} total={ROUTER_STEPS.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${s.title}`} />
        <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden font-mono text-[11px]">
          {ROUTER_LINES.map((line, i) => (
            <div key={line} className={`px-3 py-1 ${s.active.includes(i) ? 'bg-teal-500/20 text-teal-50' : 'text-gray-400'}`}>
              {line}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-lg border px-2 py-2 ${step >= 1 ? 'border-teal-400/50' : 'border-gray-800'}`}>
            <p className="text-[10px] text-gray-500">POST /make</p>
            <p className="font-mono text-[11px] text-white">{step >= 1 ? 'on the router' : 'not defined'}</p>
          </div>
          <div className={`rounded-lg border px-2 py-2 ${step >= 2 ? 'border-teal-400/50' : 'border-gray-800'}`}>
            <p className="text-[10px] text-gray-500">GET /info</p>
            <p className="font-mono text-[11px] text-white">{step >= 2 ? 'on the router' : 'not defined'}</p>
          </div>
        </div>
        <p className="text-[12px] text-gray-200">{s.note}</p>
        {step === 3 && <Pill code={404} text="Not Found  —  the app does not know this router yet" />}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* include_router                                                         */
/* ------------------------------------------------------------------ */

const INCLUDE = [
  { title: 'main.py creates the FastAPI app', detail: 'GET / can stay here. Prediction routes do not.' },
  { title: 'Import the module that holds the router', detail: 'from routers import predictions  →  predictions.router' },
  { title: 'app.include_router copies those path operations onto the app', detail: 'FastAPI now answers POST /make and GET /info.' },
  { title: 'A request arrives at the app, which forwards it to the function on the router', detail: 'The function never asked which file it lives in.' },
];

export function IncludeRouterVisualizer() {
  const stepper = useStepper(INCLUDE.length, 1400);
  const step = stepper.index;
  const plugged = step >= 2;
  return (
    <Frame
      title="include_router is how the app learns those URLs"
      hint="The router is a box of routes. include_router opens the box and hangs them on the app."
      footer={<StepControls stepper={stepper} total={INCLUDE.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${INCLUDE[step].title}`} />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className={`rounded-xl border p-3 ${step === 0 || step === 3 ? 'border-teal-400' : 'border-gray-700'}`}>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">app</p>
            <p className="font-mono text-[12px] text-white mt-1">GET /</p>
            {plugged && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-1">
                <p className="font-mono text-[11px] text-teal-100">POST /make</p>
                <p className="font-mono text-[11px] text-teal-100">GET /info</p>
              </motion.div>
            )}
          </div>
          <span className="text-[10px] text-gray-500 text-center w-16">{plugged ? 'includes' : 'waiting'}</span>
          <div className={`rounded-xl border p-3 ${step === 1 || step === 2 ? 'border-teal-400' : 'border-gray-700'}`}>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">predictions.router</p>
            <p className="font-mono text-[11px] text-gray-200 mt-1">POST /make</p>
            <p className="font-mono text-[11px] text-gray-200">GET /info</p>
          </div>
        </div>
        {step === 3 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">POST /make</span>
              <span className="text-gray-600">→</span>
              <span className="px-2 py-1 rounded bg-teal-500/15 text-teal-100">make_prediction</span>
            </div>
            <Pill code={200} text="OK" />
            <Mono className="text-emerald-100">{'{ "prediction": 1.0, "probability": 0.85 }'}</Mono>
          </div>
        )}
        <p className="text-[12px] text-gray-200">{INCLUDE[step].detail}</p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Prefix and tags                                                        */
/* ------------------------------------------------------------------ */

export function PrefixTagVisualizer() {
  const [prefix, setPrefix] = useState(true);
  const [tag, setTag] = useState(true);
  const base = prefix ? '/api/v1' : '';
  return (
    <Frame
      title="A prefix is added in front of every path on that router"
      hint="The function still says /make. The client calls /api/v1/make. Tags only change how docs group the routes."
      footer={
        <div className="flex gap-2 flex-wrap">
          <button type="button" className={tabClass(prefix)} onClick={() => setPrefix(!prefix)}>{prefix ? 'prefix /api/v1' : 'no prefix'}</button>
          <button type="button" className={tabClass(tag)} onClick={() => setTag(!tag)}>{tag ? 'tags=["predictions"]' : 'no tag'}</button>
        </div>
      }
    >
      <div className="space-y-3">
        <Mono className="text-sky-100">{`app.include_router(predictions.router${prefix ? ', prefix="/api/v1"' : ''}${tag ? ', tags=["predictions"]' : ''})`}</Mono>
        <div className="grid grid-cols-2 gap-2">
          {['/make', '/info'].map((path) => (
            <motion.div key={path} layout className="rounded-xl border border-gray-700 p-3">
              <p className="text-[10px] text-gray-500">on the router</p>
              <p className="font-mono text-[12px] text-gray-300">{path}</p>
              <p className="text-[10px] text-gray-500 mt-2">the client calls</p>
              <p className="font-mono text-sm text-teal-100">{base}{path}</p>
            </motion.div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Swagger groups</p>
          {tag ? (
            <div>
              <p className="text-[11px] text-teal-200 mb-1">predictions</p>
              <p className="font-mono text-[11px] text-white">{base}/make · {base}/info</p>
            </div>
          ) : (
            <p className="text-[11px] text-gray-400">default · mixed in with GET /</p>
          )}
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Five router benefits                                                   */
/* ------------------------------------------------------------------ */

const ROUTER_BENEFITS = [
  { title: 'Separate concerns', body: 'Prediction URLs live in predictions.py. Health stays out of that file.' },
  { title: 'Smaller files', body: 'A reader opens one module and sees only the routes for that feature.' },
  { title: 'Fewer merge conflicts', body: 'One person edits predictions while another edits status. Git does not collide in main.py.' },
  { title: 'URL structure', body: 'prefix="/api/v1" turns /make into /api/v1/make without rewriting the functions.' },
  { title: 'Docs stay grouped', body: 'tags=["predictions"] puts those routes under one heading in /docs.' },
];

export function RouterBenefitsVisualizer() {
  const stepper = useStepper(ROUTER_BENEFITS.length, 1400);
  const step = stepper.index;
  return (
    <Frame
      title={ROUTER_BENEFITS[step].title}
      hint="Five reasons to split routes early, before main.py is a few hundred lines."
      footer={<StepControls stepper={stepper} total={ROUTER_BENEFITS.length} />}
    >
      <div className="space-y-3">
        <Caption text={ROUTER_BENEFITS[step].body} />
        {step === 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-teal-400/40 p-3"><p className="text-[10px] text-gray-500">predictions.py</p><p className="font-mono text-[11px] text-white mt-1">POST /make<br />GET /info</p></div>
            <div className="rounded-xl border border-gray-700 p-3"><p className="text-[10px] text-gray-500">status.py</p><p className="font-mono text-[11px] text-white mt-1">GET /health</p></div>
          </div>
        )}
        {step === 1 && (
          <div className="flex items-end gap-2 h-24">
            <div className="flex-1 bg-rose-400/70 rounded-t h-full text-center text-[10px] pt-1 text-slate-950">main.py 400 lines</div>
            <div className="flex-1 bg-teal-400/80 rounded-t h-10 text-center text-[10px] pt-1 text-slate-950">80</div>
            <div className="flex-1 bg-teal-400/80 rounded-t h-8 text-center text-[10px] pt-1 text-slate-950">60</div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-1 font-mono text-[11px]">
            <p className="text-emerald-200">alice  predictions.py   +12 −3</p>
            <p className="text-sky-200">bob    status.py         +8 −1</p>
            <p className="text-gray-500">main.py unchanged</p>
          </div>
        )}
        {step === 3 && <Mono className="text-teal-100">/make  →  /api/v1/make</Mono>}
        {step === 4 && (
          <div className="rounded-xl border border-gray-700 p-3">
            <p className="text-[11px] text-teal-200"># predictions</p>
            <p className="font-mono text-[11px] text-white">POST /api/v1/make</p>
            <p className="font-mono text-[11px] text-white">GET /api/v1/info</p>
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Three layers                                                           */
/* ------------------------------------------------------------------ */

const LAYERS = [
  {
    id: 'api',
    name: 'API layer',
    folder: 'routers/',
    color: 'border-sky-400 bg-sky-500/10',
    jobs: [
      'Decorators: @router.post, @router.get',
      'Parse path, query, and body',
      'Validate with Pydantic models',
      'Call a function in the service layer',
      'Turn the result into an HTTP response',
      'HTTPException and status codes',
    ],
  },
  {
    id: 'biz',
    name: 'Business logic',
    folder: 'services/ or core_logic/',
    color: 'border-emerald-400 bg-emerald-500/10',
    jobs: [
      'Preprocess for the model',
      'Load or receive the fitted model',
      'model.predict(...)',
      'Post-process the output',
      'Application rules',
      'No FastAPI imports',
    ],
  },
  {
    id: 'data',
    name: 'Data layer',
    folder: 'schemas.py or models/',
    color: 'border-amber-400 bg-amber-500/10',
    jobs: [
      'Pydantic request models',
      'Pydantic response models',
      'Internal shapes the service uses',
      'Not the joblib file directory',
    ],
  },
];

export function ThreeLayersVisualizer() {
  const [id, setId] = useState('api');
  const layer = LAYERS.find((item) => item.id === id);
  return (
    <Frame
      title="A router is not enough. The function body has a layer too."
      hint="The API layer talks HTTP. The service talks to the model. The data layer is the Pydantic shapes. The joblib file is a fourth thing, not a Pydantic model."
      footer={
        <div className="flex gap-2 flex-wrap">
          {LAYERS.map((item) => (
            <button key={item.id} type="button" className={tabClass(id === item.id)} onClick={() => setId(item.id)}>{item.name}</button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          {LAYERS.map((item) => (
            <div key={item.id} className={`rounded-xl border px-2 py-2 ${id === item.id ? item.color : 'border-gray-800 opacity-50'}`}>
              <p className="text-[11px] text-white">{item.name}</p>
              <p className="font-mono text-[10px] text-gray-400 mt-1">{item.folder}</p>
            </div>
          ))}
        </div>
        <div className={`rounded-xl border p-3 ${layer.color}`}>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">this layer owns</p>
          <ul className="space-y-1">
            {layer.jobs.map((job) => (
              <li key={job} className="text-[12px] text-gray-100">· {job}</li>
            ))}
          </ul>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Request flow through layers                                            */
/* ------------------------------------------------------------------ */

const FLOW = [
  { title: 'The client sends HTTP to the API layer only', hot: ['client', 'api'] },
  { title: 'The route validates the body against a Pydantic model', hot: ['api', 'data'] },
  { title: 'The route calls the prediction service. It does not call model.predict itself.', hot: ['api', 'biz'] },
  { title: 'The service runs inference on the loaded model', hot: ['biz', 'ml'] },
  { title: 'The result comes back. The API layer formats the HTTP response.', hot: ['ml', 'biz', 'api', 'client'] },
];

export function LayerFlowVisualizer() {
  const stepper = useStepper(FLOW.length, 1400);
  const step = stepper.index;
  const hot = (id) => FLOW[step].hot.includes(id);
  return (
    <Frame
      title="The client never talks to the model"
      hint="HTTP in and HTTP out stay in routers/. predict lives in services/. The schema is the contract between them."
      footer={<StepControls stepper={stepper} total={FLOW.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${FLOW[step].title}`} />
        <div className="rounded-xl bg-white text-slate-900 p-3 overflow-x-auto">
          <svg viewBox="0 0 540 228" className="w-full min-w-[440px]">
            <defs>
              <marker id="flow-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#334155" />
              </marker>
            </defs>
            <LayerBox x={16} y={78} w={128} h={72} fill={hot('api') ? '#7dd3fc' : '#e2e8f0'} title="API Layer" sub="routers · /predict" />
            <LayerBox x={200} y={10} w={196} h={70} fill={hot('biz') ? '#86efac' : '#e2e8f0'} title="Business Logic" sub="services · preprocess, infer" />
            <LayerBox x={424} y={10} w={100} h={70} fill={hot('ml') ? '#d8b4fe' : '#e2e8f0'} title="ML Model" sub="model.predict" />
            <LayerBox x={200} y={102} w={196} h={54} fill={hot('data') ? '#fde047' : '#e2e8f0'} title="Data Layer" sub="Pydantic schemas" />
            <LayerBox x={200} y={174} w={140} h={42} fill={hot('client') ? '#cbd5e1' : '#f1f5f9'} title="HTTP Client" sub="" />
            <line x1={200} y1={195} x2={80} y2={150} stroke={step === 0 || step === 4 ? '#0f766e' : '#94a3b8'} strokeWidth="1.6" markerEnd="url(#flow-arrow)" />
            <text x="88" y="186" fontSize="8" fill="#334155">{step === 4 ? 'HTTP Response' : 'HTTP Request'}</text>
            <line x1={144} y1={90} x2={200} y2={50} stroke={hot('api') && hot('biz') ? '#0f766e' : '#94a3b8'} strokeWidth={hot('api') && hot('biz') ? 2 : 1} markerEnd="url(#flow-arrow)" />
            <text x="124" y="62" fontSize="8" fill="#334155">Call Service</text>
            <line x1={200} y1={64} x2={144} y2={110} stroke={step >= 4 ? '#0f766e' : '#94a3b8'} strokeWidth="1.5" markerEnd="url(#flow-arrow)" />
            <text x="96" y="118" fontSize="8" fill="#334155">Return Result</text>
            <line x1={396} y1={45} x2={424} y2={45} stroke={hot('biz') && hot('ml') ? '#0f766e' : '#94a3b8'} strokeWidth={hot('biz') && hot('ml') ? 2 : 1} markerEnd="url(#flow-arrow)" />
            <text x="398" y="38" fontSize="8" fill="#334155">Infer</text>
            <line x1={200} y1={129} x2={144} y2={129} stroke={hot('api') && hot('data') ? '#0f766e' : '#94a3b8'} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#flow-arrow)" />
            <text x="146" y="144" fontSize="8" fill="#334155">validate / format</text>
          </svg>
        </div>
        <p className="text-[11px] italic text-gray-400">The client interacts only with the API layer, which orchestrates the rest.</p>
      </div>
    </Frame>
  );
}

function LayerBox({ x, y, w, h, fill, title, sub }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill={fill} stroke="#64748b" />
      <text x={x + w / 2} y={y + 18} textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">{title}</text>
      {sub && <text x={x + w / 2} y={y + 34} textAnchor="middle" fontSize="8" fill="#334155">{sub}</text>}
    </g>
  );
}


/* ------------------------------------------------------------------ */
/* Project tree                                                           */
/* ------------------------------------------------------------------ */

const SOC_NODES = {
  root: { x: 310, y: 6, w: 130, h: 28, label: 'your_ml_api/', kind: 'folder' },
  app: { x: 40, y: 56, w: 90, h: 26, label: 'app/', kind: 'folder' },
  tests: { x: 480, y: 56, w: 90, h: 26, label: 'tests/', kind: 'folder' },
  req: { x: 620, y: 56, w: 130, h: 26, label: 'requirements.txt', kind: 'file' },
  main: { x: 8, y: 108, w: 100, h: 24, label: 'main.py', kind: 'file' },
  routers: { x: 120, y: 108, w: 96, h: 24, label: 'routers/', kind: 'folder' },
  services: { x: 230, y: 108, w: 100, h: 24, label: 'services/', kind: 'folder' },
  schemas: { x: 344, y: 108, w: 96, h: 24, label: 'schemas/', kind: 'folder' },
  core: { x: 454, y: 108, w: 80, h: 24, label: 'core/', kind: 'folder' },
  mlmodels: { x: 548, y: 108, w: 108, h: 24, label: 'ml_models/', kind: 'folder' },
  inf: { x: 110, y: 160, w: 116, h: 24, label: 'inference.py', kind: 'file' },
  pred: { x: 236, y: 160, w: 118, h: 24, label: 'prediction.py', kind: 'file' },
  sch: { x: 364, y: 160, w: 118, h: 24, label: 'prediction.py', kind: 'file' },
  loader: { x: 500, y: 160, w: 132, h: 24, label: 'model_loader.py', kind: 'file' },
  joblib: { x: 640, y: 160, w: 168, h: 24, label: 'sentiment_model.joblib', kind: 'model' },
};

const SOC_EDGES = [
  ['root', 'app'], ['root', 'tests'], ['root', 'req'],
  ['app', 'main'], ['app', 'routers'], ['app', 'services'], ['app', 'schemas'], ['app', 'core'], ['app', 'mlmodels'],
  ['routers', 'inf'], ['services', 'pred'], ['schemas', 'sch'], ['core', 'loader'], ['mlmodels', 'joblib'],
];

const SOC_STEPS = [
  { title: 'your_ml_api/ holds the package, the tests, and the pin file', hot: ['root', 'app', 'tests', 'req'] },
  { title: 'app/main.py creates FastAPI and includes routers. It is not the prediction function.', hot: ['app', 'main'] },
  { title: 'routers/inference.py is HTTP. It validates, then calls the service.', hot: ['routers', 'inf'] },
  { title: 'services/prediction.py is predict_sentiment. No FastAPI imports.', hot: ['services', 'pred'] },
  { title: 'schemas/prediction.py is PredictionInput and PredictionOutput.', hot: ['schemas', 'sch'] },
  { title: 'core/model_loader.py loads the file in ml_models/. That directory is not the Pydantic models.', hot: ['core', 'loader', 'mlmodels', 'joblib'] },
];

const SOC_CLICK = { root: 0, app: 1, tests: 0, req: 0, main: 1, routers: 2, inf: 2, services: 3, pred: 3, schemas: 4, sch: 4, core: 5, loader: 5, mlmodels: 5, joblib: 5 };

export function SocTreeVisualizer() {
  const stepper = useStepper(SOC_STEPS.length, 1500);
  const step = stepper.index;
  const hot = new Set(SOC_STEPS[step].hot);
  return (
    <Frame
      title="Each layer is a directory"
      hint="Click a box. routers/ is HTTP. services/ is predict. schemas/ is Pydantic. ml_models/ is the joblib file."
      footer={<StepControls stepper={stepper} total={SOC_STEPS.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${SOC_STEPS[step].title}`} />
        <div className="rounded-xl bg-[#1b2430] p-2 overflow-x-auto">
          <svg viewBox="0 0 820 200" className="w-full min-w-[640px]">
            <defs>
              <marker id="soc-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
              </marker>
            </defs>
            {SOC_EDGES.map(([from, to]) => {
              const a = SOC_NODES[from];
              const b = SOC_NODES[to];
              const on = hot.has(from) && hot.has(to);
              return (
                <line
                  key={`${from}-${to}`}
                  x1={a.x + a.w / 2}
                  y1={a.y + a.h}
                  x2={b.x + b.w / 2}
                  y2={b.y}
                  stroke={on ? '#5eead4' : '#475569'}
                  strokeWidth={on ? 2 : 1}
                  markerEnd="url(#soc-arrow)"
                />
              );
            })}
            {Object.entries(SOC_NODES).map(([id, node]) => (
              <g key={id} onClick={() => stepper.pick(SOC_CLICK[id])} style={{ cursor: 'pointer', opacity: hot.has(id) ? 1 : 0.32 }}>
                {node.kind === 'folder' && <rect x={node.x + 4} y={node.y - 6} width="18" height="7" rx="1.5" fill={node.kind === 'folder' ? '#7dd3fc' : '#fff'} />}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.w}
                  height={node.h}
                  rx="3"
                  fill={node.kind === 'folder' ? '#bae6fd' : node.kind === 'model' ? '#6ee7b7' : '#f8fafc'}
                  stroke={hot.has(id) ? '#0f766e' : '#94a3b8'}
                  strokeWidth={hot.has(id) ? 2 : 1}
                />
                <text x={node.x + node.w / 2} y={node.y + node.h / 2 + 3.5} textAnchor="middle" fontSize="9" fontWeight="600" fill="#0f172a">{node.label}</text>
              </g>
            ))}
          </svg>
        </div>
        {step === 5 && <Lesson title="Two directories named models">schemas/ (or models.py) is Pydantic. ml_models/ is the serialized artifact. Mixing them is how a later reader opens the wrong folder.</Lesson>}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Who calls whom                                                         */
/* ------------------------------------------------------------------ */

const CALLS = [
  { title: 'A POST hits routers/inference.py', from: 'HTTP', to: 'inference.py' },
  { title: 'It builds PredictionInput from schemas/prediction.py', from: 'inference.py', to: 'schemas/prediction.py' },
  { title: 'It calls predict_sentiment in services/prediction.py', from: 'inference.py', to: 'services/prediction.py' },
  { title: 'The service asks core/model_loader.py for the fitted object', from: 'services/prediction.py', to: 'model_loader.py' },
  { title: 'model.predict runs. The service still has not imported FastAPI.', from: 'model_loader.py', to: 'sentiment_model.joblib' },
];

export function WhoCallsVisualizer() {
  const stepper = useStepper(CALLS.length, 1400);
  const step = stepper.index;
  const chain = ['inference.py', 'schemas/prediction.py', 'services/prediction.py', 'model_loader.py', 'sentiment_model.joblib'];
  return (
    <Frame
      title="inference.py calls the service. The service does not call FastAPI."
      hint="That split is what makes the service testable without TestClient."
      footer={<StepControls stepper={stepper} total={CALLS.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${CALLS[step].title}`} />
        <div className="space-y-1">
          {chain.map((name, i) => (
            <div key={name} className={`rounded-lg border px-3 py-2 font-mono text-[11px] ${i <= step ? 'border-teal-400 text-teal-50 bg-teal-500/10' : 'border-gray-800 text-gray-600'}`}>
              {name}
            </div>
          ))}
        </div>
        {step === 4 && <p className="text-[12px] text-gray-200">A CLI could import predict_sentiment and skip the router entirely.</p>}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* SoC benefits                                                           */
/* ------------------------------------------------------------------ */

export function SocBenefitsVisualizer() {
  const [mode, setMode] = useState('path');
  return (
    <Frame
      title="Change one layer. Leave the others alone."
      hint="A new URL is a router edit. A new preprocessing step is a service edit. A test of predict_sentiment does not need HTTP."
      footer={
        <div className="flex gap-2 flex-wrap">
          <button type="button" className={tabClass(mode === 'path')} onClick={() => setMode('path')}>rename the URL</button>
          <button type="button" className={tabClass(mode === 'prep')} onClick={() => setMode('prep')}>add preprocessing</button>
          <button type="button" className={tabClass(mode === 'test')} onClick={() => setMode('test')}>test without HTTP</button>
          <button type="button" className={tabClass(mode === 'cli')} onClick={() => setMode('cli')}>reuse in a CLI</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
          {['routers/', 'services/', 'schemas/'].map((name) => {
            const on = (mode === 'path' && name === 'routers/') || (mode === 'prep' && name === 'services/') || (mode === 'test' && name === 'services/') || (mode === 'cli' && name === 'services/');
            return (
              <div key={name} className={`rounded-lg border px-2 py-3 ${on ? 'border-teal-400 bg-teal-500/10 text-teal-50' : 'border-gray-800 text-gray-500'}`}>
                {name}
                <p className="mt-1">{on ? 'this file changes' : 'untouched'}</p>
              </div>
            );
          })}
        </div>
        {mode === 'path' && <Mono className="text-sky-100">@router.post("/predict")  →  @router.post("/v2/predict")</Mono>}
        {mode === 'prep' && <Mono className="text-sky-100">predict_sentiment: scale X before model.predict</Mono>}
        {mode === 'test' && (
          <div className="space-y-1">
            <p className="text-[12px] text-gray-200">Call predict_sentiment(features) in a unit test. TestClient is for the router, not for this function.</p>
            <Mono className="text-emerald-100">assert predict_sentiment({'{'}...{'}'})["label"] == "positive"</Mono>
          </div>
        )}
        {mode === 'cli' && <Mono className="text-emerald-100">python -m tools.score --text "great movie"</Mono>}
        <Lesson title="Depends comes next">FastAPI can inject the service or the loaded model into the route, so the router still does not construct them itself.</Lesson>
      </div>
    </Frame>
  );
}
