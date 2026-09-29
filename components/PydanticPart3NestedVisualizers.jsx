import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { CheckCircle, XCircle, MinusCircle, ArrowRight, Box as BoxIcon } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines, Terminal } from './VisualKit';
import { Mono, Pill } from './PydanticKit';
import { validateObject, errorBody, pyValue } from './ConstraintKit';

/* ------------------------------------------------------------------ */
/* Shared model specs                                                     */
/* ------------------------------------------------------------------ */

export const MODEL_CONFIG = [
  { name: 'model_version', type: 'str', default: 'latest' },
  { name: 'confidence_threshold', type: 'float', default: 0.7, ge: 0, le: 1 },
  { name: 'return_probabilities', type: 'bool', default: false },
];

export const INPUT_FEATURES = [
  { name: 'sepal_length', type: 'float', required: true },
  { name: 'sepal_width', type: 'float', required: true },
  { name: 'petal_length', type: 'float', required: true },
  { name: 'petal_width', type: 'float', required: true },
];

export const PREDICTION_REQUEST = [
  { name: 'request_id', type: 'str', required: true },
  { name: 'features', type: 'model', fields: INPUT_FEATURES, required: true },
  { name: 'config', type: 'model', fields: MODEL_CONFIG, nullable: true, default: null },
];

const FEATURES = { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2 };

const TYPE_OF = { str: 'str', float: 'float', bool: 'bool' };

export function modelRepr(name, fields, value) {
  if (value === null || value === undefined) return 'None';
  return `${name}(${fields
    .map((f) => {
      const v = value[f.name];
      if (f.type === 'model') return `${f.name}=${modelRepr(f.name === 'features' ? 'InputFeatures' : 'ModelConfig', f.fields, v)}`;
      return `${f.name}=${pyValue(v, TYPE_OF[f.type])}`;
    })
    .join(', ')})`;
}

const StatusIcon = ({ s }) =>
  s === 'error' ? <XCircle className="w-3.5 h-3.5 text-rose-300" /> : s === 'default' ? <MinusCircle className="w-3.5 h-3.5 text-amber-300" /> : s === 'pending' ? <span className="w-3.5 h-3.5 rounded-full border border-gray-600 inline-block" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />;

/* ------------------------------------------------------------------ */
/* 8. Flat vs nested                                                      */
/* ------------------------------------------------------------------ */

const FLAT_KEYS = [
  { k: 'request_id', v: '"req-001"', g: 'root' },
  { k: 'sepal_length', v: '5.1', g: 'features' },
  { k: 'sepal_width', v: '3.5', g: 'features' },
  { k: 'petal_length', v: '1.4', g: 'features' },
  { k: 'petal_width', v: '0.2', g: 'features' },
  { k: 'model_version', v: '"v2"', g: 'config' },
  { k: 'confidence_threshold', v: '0.8', g: 'config' },
  { k: 'return_probabilities', v: 'true', g: 'config' },
];

const GROUP_STYLE = {
  root: { box: 'border-sky-400/60 bg-sky-500/10', chip: 'bg-sky-500/20 text-sky-100', model: 'PredictionRequest' },
  features: { box: 'border-emerald-400/60 bg-emerald-500/10', chip: 'bg-emerald-500/20 text-emerald-100', model: 'InputFeatures' },
  config: { box: 'border-orange-400/60 bg-orange-500/10', chip: 'bg-orange-500/20 text-orange-100', model: 'ModelConfig' },
};

export function FlatVsNestedVisualizer() {
  const [nested, setNested] = useState(false);
  const [focus, setFocus] = useState('features');

  const chip = (item) => (
    <motion.div
      layout
      layoutId={item.k}
      key={item.k}
      onClick={() => setFocus(item.g)}
      className={`cursor-pointer rounded-md px-2 py-1 font-mono text-[10px] flex justify-between gap-2 ${GROUP_STYLE[item.g].chip} ${focus === item.g ? 'ring-1 ring-white/60' : ''}`}
    >
      <span>{item.k}</span>
      <span className="text-white/70">{item.v}</span>
    </motion.div>
  );

  const flatJson = `{\n${FLAT_KEYS.map((x) => `  "${x.k}": ${x.v}`).join(',\n')}\n}`;
  const nestedJson = `{\n  "request_id": "req-001",\n  "features": {\n${FLAT_KEYS.filter((x) => x.g === 'features').map((x) => `    "${x.k}": ${x.v}`).join(',\n')}\n  },\n  "config": {\n${FLAT_KEYS.filter((x) => x.g === 'config').map((x) => `    "${x.k}": ${x.v}`).join(',\n')}\n  }\n}`;

  return (
    <Frame
      title="From one flat bag of keys to a hierarchy"
      hint="Toggle between a flat payload and a nested one. The same keys regroup into the structures they belong to; click any key to see its model."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(!nested)} onClick={() => setNested(false)}>flat model</button>
          <button type="button" className={tabClass(nested)} onClick={() => setNested(true)}>nested models</button>
        </div>
      }
    >
      <div className="grid md:grid-cols-2 gap-3">
        <LayoutGroup>
          <div className="space-y-2">
            {!nested ? (
              <motion.div layout className="rounded-xl border border-gray-600 p-2 space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">one big model, 8 fields</p>
                {FLAT_KEYS.map(chip)}
              </motion.div>
            ) : (
              <motion.div layout className={`rounded-xl border-2 p-2 space-y-2 ${GROUP_STYLE.root.box}`}>
                <p className="text-[10px] font-semibold text-sky-200">PredictionRequest</p>
                {FLAT_KEYS.filter((x) => x.g === 'root').map(chip)}
                {['features', 'config'].map((g) => (
                  <motion.div layout key={g} className={`rounded-lg border p-2 space-y-1 ${GROUP_STYLE[g].box}`}>
                    <p className="text-[10px] font-semibold text-white">
                      {g}: {GROUP_STYLE[g].model}
                      {g === 'config' && <span className="text-gray-400 font-normal"> (optional)</span>}
                    </p>
                    {FLAT_KEYS.filter((x) => x.g === g).map(chip)}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </LayoutGroup>
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">the JSON the client sends</p>
          <AnimatePresence mode="wait">
            <motion.div key={String(nested)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Mono className="text-sky-100">{nested ? nestedJson : flatJson}</Mono>
            </motion.div>
          </AnimatePresence>
          <div className={`rounded-lg border px-2 py-1.5 text-[11px] ${GROUP_STYLE[focus].box}`}>
            <span className="font-mono text-white">{GROUP_STYLE[focus].model}</span>
            <span className="text-gray-300">
              {focus === 'root' ? ' — the overall request' : focus === 'features' ? ' — the primary input data for the ML model' : ' — configuration settings sent alongside the features'}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <Lesson title="Why nest?">
          {nested
            ? 'Each concern has its own model: reusable, independently validated, and shaped exactly like the JSON. Nesting mirrors how JSON represents hierarchical data.'
            : 'Flat: configuration and features are mixed together, and nothing tells you which key belongs to which concern.'}
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Defining nested models (Optional[ModelConfig])                     */
/* ------------------------------------------------------------------ */

const CONFIG_CHOICES = [
  { id: 'omit', label: '(omitted)', present: false },
  { id: 'empty', label: '{}', present: true, v: {} },
  { id: 'partial', label: '{"confidence_threshold": 0.9}', present: true, v: { confidence_threshold: 0.9 } },
  { id: 'bad', label: '{"confidence_threshold": 1.5}', present: true, v: { confidence_threshold: 1.5 } },
  { id: 'str', label: '"fast"', present: true, v: 'fast' },
];

const NM_STEPS = ['ModelConfig: settings with defaults', 'InputFeatures: the primary input', 'PredictionRequest nests both', 'Try different config values'];

export function NestedModelsVisualizer() {
  const stepper = useStepper(NM_STEPS.length, 1400);
  const step = stepper.index;
  const [cfg, setCfg] = useState('omit');
  const choice = CONFIG_CHOICES.find((c) => c.id === cfg);
  const body = { request_id: 'req-001', features: FEATURES };
  if (choice.present) body.config = choice.v;
  const res = validateObject(PREDICTION_REQUEST, body);

  const cards = [
    { name: 'ModelConfig', tone: 'border-orange-400/60', lines: ['model_version: str = "latest"', 'confidence_threshold: float = Field(default=0.7, ge=0.0, le=1.0)', 'return_probabilities: bool = False'] },
    { name: 'InputFeatures', tone: 'border-emerald-400/60', lines: ['sepal_length: float', 'sepal_width: float', 'petal_length: float', 'petal_width: float'] },
    { name: 'PredictionRequest', tone: 'border-sky-400/60', lines: ['request_id: str', 'features: InputFeatures           # Nesting the InputFeatures model', 'config: Optional[ModelConfig] = None # Nesting ModelConfig, making it optional'] },
  ];

  return (
    <Frame title="Defining nested models" hint="Step through the three classes, then try different values for config." footer={<StepControls stepper={stepper} total={NM_STEPS.length} />}>
      <div className="space-y-3">
        <p className="text-[11px] text-teal-200">{step + 1}. {NM_STEPS[step]}</p>
        <div className="space-y-2">
          {cards.map((c, i) => (
            <motion.div key={c.name} animate={{ opacity: i <= step ? 1 : 0.2, scale: i === step ? 1.01 : 1 }} className={`rounded-xl border-2 ${c.tone} bg-gray-950 p-2`}>
              <p className="font-mono text-[11px] text-white">class {c.name}(BaseModel):</p>
              {c.lines.map((l) => {
                const isRef = i === 2 && (l.startsWith('features') || l.startsWith('config'));
                return (
                  <p key={l} className={`font-mono text-[10px] pl-4 ${isRef && step >= 2 ? 'text-teal-200' : 'text-gray-400'}`}>
                    {l}
                  </p>
                );
              })}
            </motion.div>
          ))}
        </div>

        {step >= 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="rounded-lg border border-emerald-400/40 p-2">
              <p className="font-mono text-emerald-200">features: InputFeatures</p>
              <p className="text-gray-400">Required. The data must conform to the InputFeatures schema.</p>
            </div>
            <div className="rounded-lg border border-dashed border-orange-400/50 p-2">
              <p className="font-mono text-orange-200">config: Optional[ModelConfig] = None</p>
              <p className="text-gray-400">May be left out → None. If it is provided, it must be a valid ModelConfig.</p>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-gray-500 self-center">"config":</span>
              {CONFIG_CHOICES.map((c) => (
                <button key={c.id} type="button" className={`${tabClass(cfg === c.id)} font-mono !py-0.5`} onClick={() => setCfg(c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
            {res.errors.length ? (
              <>
                <Pill code={422} text="Unprocessable Entity" />
                <Mono className="text-rose-100">{errorBody(res.errors)}</Mono>
                <p className="text-[10px] text-gray-400">Optional does not mean “anything goes”: a provided config is validated field by field — note the nested loc.</p>
              </>
            ) : (
              <>
                <Mono className="text-emerald-100">{`request.config = ${modelRepr('ModelConfig', MODEL_CONFIG, res.value.config)}`}</Mono>
                <p className="text-[10px] text-gray-400">
                  {choice.id === 'omit'
                    ? 'Not provided → None. The endpoint falls back to ModelConfig() to get the defaults.'
                    : choice.id === 'empty'
                      ? 'An empty object is a valid ModelConfig: every field takes its default.'
                      : 'Only confidence_threshold was sent; the other two fields take their defaults.'}
                </p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Nested validation in a FastAPI endpoint                           */
/* ------------------------------------------------------------------ */

const NV_PRESETS = [
  { id: 'valid', label: 'valid + config', body: { request_id: 'req-001', features: FEATURES, config: { model_version: 'v2', confidence_threshold: 0.8 } } },
  { id: 'noconfig', label: 'config omitted', body: { request_id: 'req-002', features: FEATURES } },
  { id: 'abc', label: 'sepal_length: "abc"', body: { request_id: 'req-003', features: { ...FEATURES, sepal_length: 'abc' } } },
  { id: 'noid', label: 'missing request_id', body: { features: FEATURES } },
  { id: 'thr', label: 'threshold 1.5', body: { request_id: 'req-005', features: FEATURES, config: { confidence_threshold: 1.5 } } },
  { id: 'nofeat', label: 'features missing', body: { request_id: 'req-006' } },
];

const NV_STEPS = ['Parse', 'Validate', 'Instantiate', 'Run endpoint'];

const NV_CODE = [
  '@app.post("/predict")',
  'async def create_prediction(request: PredictionRequest):',
  '    # Access nested data easily',
  '    features_data = request.features',
  '    config_data = request.config if request.config else ModelConfig() # Use defaults if not provided',
  '',
  '    print(f"Received request: {request.request_id}")',
  '    print(f"Features: {features_data.dict()}")',
  '    print(f"Config: Version={config_data.model_version}, Threshold={config_data.confidence_threshold}")',
  '',
  '    prediction = {"class": "setosa", "probability": 0.95} # Example output',
  '    return {"request_id": request.request_id, "prediction": prediction}',
];

function TreeRows({ fields, rows, loc, reveal, depth = 0 }) {
  return fields.map((f, i) => {
    const row = rows?.[i];
    const s = !reveal ? 'pending' : row?.status || 'pending';
    const childErrors = row?.errors || [];
    return (
      <div key={f.name}>
        <div className="flex items-center gap-2 py-0.5" style={{ paddingLeft: depth * 16 }}>
          <StatusIcon s={s} />
          <span className={`font-mono text-[11px] ${f.type === 'model' ? 'text-white font-semibold' : 'text-gray-200'}`}>
            {f.name}
            <span className="text-gray-500 font-normal"> : {f.type === 'model' ? (f.name === 'features' ? 'InputFeatures' : 'Optional[ModelConfig]') : f.type}</span>
          </span>
          {reveal && s === 'default' && <span className="text-[9px] text-amber-300">not sent → {row.value === null ? 'None' : 'default'}</span>}
          {reveal && s === 'error' && childErrors[0]?.loc.length === loc.length + 1 && <span className="text-[9px] text-rose-300">{childErrors[0].msg}</span>}
        </div>
        {f.type === 'model' && reveal && row?.status !== 'default' && (
          <NestedChildren f={f} row={row} loc={[...loc, f.name]} depth={depth + 1} />
        )}
      </div>
    );
  });
}

function NestedChildren({ f, row, loc, depth }) {
  if (!row || row.raw === undefined || row.raw === null || typeof row.raw !== 'object') return null;
  const sub = validateObject(f.fields, row.raw, loc);
  return <TreeRows fields={f.fields} rows={sub.rows} loc={loc} reveal depth={depth} />;
}

export function NestedValidationVisualizer() {
  const [preset, setPreset] = useState('valid');
  const p = NV_PRESETS.find((x) => x.id === preset);
  return <NestedValidationRun key={preset} preset={preset} setPreset={setPreset} body={p.body} />;
}

function NestedValidationRun({ preset, setPreset, body }) {
  const stepper = useStepper(NV_STEPS.length, 1300);
  const step = stepper.index;
  const res = validateObject(PREDICTION_REQUEST, body, ['body']);
  const failed = res.errors.length > 0;

  const v = res.value;
  const cfg = v ? v.config || { model_version: 'latest', confidence_threshold: 0.7, return_probabilities: false } : null;
  const activeCode = step === 3 && !failed ? [3, 4, 6, 7, 8, 10, 11] : step >= 1 ? [1] : [0];

  return (
    <Frame
      title="POST /predict with a nested PredictionRequest"
      hint="Pick a request body and step through: parse, validate the whole tree, instantiate, and run."
      footer={<StepControls stepper={stepper} total={NV_STEPS.length} />}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {NV_PRESETS.map((x) => (
            <button key={x.id} type="button" className={`${tabClass(preset === x.id)} font-mono`} onClick={() => setPreset(x.id)}>
              {x.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {NV_STEPS.map((s, i) => {
            const dead = failed && i >= 2;
            return (
              <div key={s} className={`rounded-lg border px-2 py-1.5 text-[10px] text-center ${dead ? 'border-gray-800 text-gray-700 line-through' : i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'}`}>
                {i + 1}. {s}
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">{step === 0 ? 'raw JSON → Python dict' : 'validation tree'}</p>
            {step === 0 ? (
              <Mono className="text-sky-100">{JSON.stringify(body, null, 2)}</Mono>
            ) : (
              <div className="rounded-xl border border-gray-700 bg-gray-950 p-2">
                <p className="font-mono text-[11px] text-sky-200 font-semibold mb-1">PredictionRequest</p>
                <TreeRows fields={PREDICTION_REQUEST} rows={res.rows} loc={['body']} reveal depth={0} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            {step >= 1 && failed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                <Pill code={422} text="Unprocessable Entity" />
                <Mono className="text-rose-100">{errorBody(res.errors)}</Mono>
                <p className="text-[10px] text-gray-400">The loc path walks into the nested model. Your endpoint code never ran.</p>
              </motion.div>
            )}
            {step >= 2 && !failed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">request =</p>
                <Mono className="text-emerald-100">{modelRepr('PredictionRequest', PREDICTION_REQUEST, v)}</Mono>
              </motion.div>
            )}
            {step === 3 && !failed && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <Terminal
                  title="uvicorn logs"
                  lines={[
                    { text: `Received request: ${v.request_id}` },
                    { text: `Features: ${pyValue(v.features)}` },
                    { text: `Config: Version=${cfg.model_version}, Threshold=${cfg.confidence_threshold}`, kind: v.config ? 'out' : 'warn' },
                  ]}
                />
                <Pill code={200} text="OK" />
                <Mono className="text-emerald-100">{JSON.stringify({ request_id: v.request_id, prediction: { class: 'setosa', probability: 0.95 } })}</Mono>
              </motion.div>
            )}
          </div>
        </div>

        <CodeLines lines={NV_CODE} active={activeCode} title="main.py" />
        <p className="text-[10px] text-gray-500">
          <span className="font-mono">.dict()</span> is the Pydantic v1 name; in v2 it still works (deprecated) — the new name is <span className="font-mono">.model_dump()</span>.
        </p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 11. Diagram: nested input model structure                             */
/* ------------------------------------------------------------------ */

const DIAGRAM_NODES = {
  PredictionRequest: { x: 20, y: 70, w: 170, fill: '#bae6fd', fields: ['request_id: str', 'features: InputFeatures', 'config: Optional[ModelConfig]'] },
  InputFeatures: { x: 330, y: 10, w: 150, fill: '#bbf7d0', fields: ['sepal_length: float', 'sepal_width: float', 'petal_length: float', 'petal_width: float'] },
  ModelConfig: { x: 330, y: 130, w: 150, fill: '#fed7aa', fields: ['model_version: str = "latest"', 'confidence_threshold: float = 0.7', 'return_probabilities: bool = False'] },
};

const DG_STEPS = ['The outer model: PredictionRequest', 'features → an instance of InputFeatures (required)', 'config → an instance of ModelConfig (optional)'];

export function NestedDiagramVisualizer() {
  const stepper = useStepper(DG_STEPS.length, 1500);
  const step = stepper.index;
  const [picked, setPicked] = useState('PredictionRequest');
  const [sendConfig, setSendConfig] = useState(true);

  const lit = step === 0 ? ['PredictionRequest'] : step === 1 ? ['PredictionRequest', 'InputFeatures'] : ['PredictionRequest', 'ModelConfig'];
  const node = DIAGRAM_NODES[picked];

  const json = `{\n  "request_id": "req-001",\n  "features": { "sepal_length": 5.1, ... }${sendConfig ? ',\n  "config": { "model_version": "v2" }' : ''}\n}`;

  return (
    <Frame
      title="PredictionRequest is composed of other models"
      hint="Step through the edges, click any box to see its fields, and toggle whether the client sends config."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-[11px] text-gray-300">
            <input type="checkbox" className="accent-teal-500" checked={sendConfig} onChange={(e) => setSendConfig(e.target.checked)} /> client sends "config"
          </label>
          <StepControls stepper={stepper} total={DG_STEPS.length} showPlay={false} />
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-[11px] text-teal-200">{DG_STEPS[step]}</p>
        <div className="rounded-xl bg-white p-2">
          <svg viewBox="0 0 500 190" className="w-full">
            <defs>
              <marker id="nd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#111827" />
              </marker>
            </defs>
            <motion.line x1={190} y1={85} x2={328} y2={32} stroke="#111827" strokeWidth={lit.includes('InputFeatures') ? 3 : 1.5} markerEnd="url(#nd-arrow)" />
            <text x={255} y={48} fontSize={11} fill="#111827" textAnchor="middle">features</text>
            <motion.line
              x1={190}
              y1={100}
              x2={328}
              y2={152}
              stroke={sendConfig ? '#111827' : '#9ca3af'}
              strokeDasharray={sendConfig ? '0' : '5 4'}
              strokeWidth={lit.includes('ModelConfig') ? 3 : 1.5}
              markerEnd="url(#nd-arrow)"
            />
            <text x={255} y={116} fontSize={11} fill={sendConfig ? '#111827' : '#9ca3af'} textAnchor="middle">
              config (optional){sendConfig ? '' : ' = None'}
            </text>
            {Object.entries(DIAGRAM_NODES).map(([name, n]) => {
              const on = lit.includes(name);
              const faded = name === 'ModelConfig' && !sendConfig;
              return (
                <g key={name} onClick={() => setPicked(name)} style={{ cursor: 'pointer' }}>
                  <motion.rect
                    x={n.x}
                    y={n.y}
                    width={n.w}
                    height={44}
                    rx={4}
                    fill={n.fill}
                    stroke="#111827"
                    strokeWidth={on ? 3 : 1.2}
                    animate={{ opacity: faded ? 0.35 : 1 }}
                  />
                  <text x={n.x + n.w / 2} y={n.y + 27} textAnchor="middle" fontSize={13} fill="#111827">
                    {name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <AnimatePresence mode="wait">
            <motion.div key={picked} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-gray-700 bg-gray-950 p-2">
              <p className="flex items-center gap-1 font-mono text-[11px] text-white mb-1"><BoxIcon className="w-3.5 h-3.5" /> {picked}</p>
              {node.fields.map((f) => (
                <p key={f} className="font-mono text-[10px] text-gray-300 pl-4">{f}</p>
              ))}
            </motion.div>
          </AnimatePresence>
          <div className="space-y-1">
            <Mono className="text-sky-100">{json}</Mono>
            <p className="text-[10px] text-gray-400">
              {sendConfig ? 'request.config is a ModelConfig instance.' : 'No "config" key → request.config is None. Still valid.'}
            </p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 12. Nested models for response data                                   */
/* ------------------------------------------------------------------ */

const NR_STEPS = ['model_output: plain dicts', 'PredictionResult(**item) for each', 'Wrap in PredictionResponse', 'FastAPI checks response_model', 'JSON to the client'];

const ENSURES = [
  ['Validation', 'The returned data is validated against PredictionResponse, including the nested PredictionResult list.'],
  ['Serialization', 'The returned Pydantic model instance is automatically serialized to JSON.'],
  ['Filtering', 'Only fields defined in PredictionResponse are included — no accidental leaks.'],
  ['Documentation', 'Swagger UI shows the nested response structure.'],
];

export function NestedResponseVisualizer() {
  const [version, setVersion] = useState('omit');
  const [extra, setExtra] = useState(false);
  const [broken, setBroken] = useState(false);
  return <NestedResponseRun key={`${version}-${extra}-${broken}`} {...{ version, setVersion, extra, setExtra, broken, setBroken }} />;
}

function NestedResponseRun({ version, setVersion, extra, setExtra, broken, setBroken }) {
  const stepper = useStepper(NR_STEPS.length, 1200);
  const step = stepper.index;

  const modelOutput = [
    { predicted_class: 'setosa', probability: broken ? 'high' : 0.98, ...(extra ? { logit: 4.1 } : {}) },
    { predicted_class: 'versicolor', probability: 0.02, ...(extra ? { logit: -3.9 } : {}) },
  ];
  const modelVersion = version === 'omit' ? 'latest' : 'v2.1';

  const outputText = `model_output = [\n${modelOutput.map((m) => `    ${pyValue(m)}`).join(',\n')}\n]`;
  const results = modelOutput.map((m) => `PredictionResult(predicted_class='${m.predicted_class}', probability=${pyValue(m.probability, 'float')})`);
  const finalJson = {
    request_id: 'req-001',
    results: modelOutput.map((m) => ({ predicted_class: m.predicted_class, probability: m.probability })),
    model_version_used: modelVersion,
  };

  return (
    <Frame
      title="Building a nested PredictionResponse"
      hint="Step from raw model output to the JSON the client receives. Toggle the options to see what happens to extra keys, bad values and config."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={tabClass(version === 'v2.1')} onClick={() => setVersion(version === 'omit' ? 'v2.1' : 'omit')}>
              config.model_version = {version === 'omit' ? '(not sent)' : '"v2.1"'}
            </button>
            <button type="button" className={tabClass(extra)} onClick={() => setExtra(!extra)}>extra "logit" key</button>
            <button type="button" className={tabClass(broken)} onClick={() => setBroken(!broken)}>probability "high"</button>
          </div>
          <StepControls stepper={stepper} total={NR_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-1">
          {NR_STEPS.map((s, i) => (
            <div key={s} className={`rounded-lg border px-1 py-1.5 text-[9px] text-center leading-tight ${broken && i >= 2 ? 'border-gray-800 text-gray-700 line-through' : i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'}`}>
              {s}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Mono className="text-sky-100">{outputText}</Mono>

          {step >= 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              {broken ? (
                <div className="space-y-1">
                  <Pill code={500} text="Internal Server Error" />
                  <Mono className="text-rose-100">{`pydantic_core.ValidationError: 1 validation error for PredictionResult\nprobability\n  Input should be a valid number, unable to parse string as a number [type=float_parsing, input_value='high', input_type=str]`}</Mono>
                  <p className="text-[10px] text-gray-400">The error happens inside your function while building the result, so the client just sees a 500. Bad output never leaves the server.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((r, i) => (
                    <motion.div key={r} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.15 }} className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-teal-400 shrink-0" />
                      <span className="font-mono text-[10px] text-emerald-100">{r}</span>
                    </motion.div>
                  ))}
                  {extra && <p className="text-[10px] text-amber-200 pl-5">"logit" is not a field of PredictionResult, so it is ignored when the object is built.</p>}
                </div>
              )}
            </motion.div>
          )}

          {step >= 2 && !broken && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border-2 border-sky-400/60 bg-sky-500/5 p-2 space-y-1">
              <p className="font-mono text-[11px] text-sky-200">PredictionResponse(</p>
              <p className="font-mono text-[10px] text-gray-300 pl-4">request_id='req-001',</p>
              <div className="pl-4">
                <p className="font-mono text-[10px] text-gray-300">results=[</p>
                {results.map((r) => (
                  <div key={r} className="ml-4 my-0.5 rounded border border-emerald-400/50 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] text-emerald-100">{r}</div>
                ))}
                <p className="font-mono text-[10px] text-gray-300">],</p>
              </div>
              <p className="font-mono text-[10px] text-gray-300 pl-4">
                model_version_used='{modelVersion}' <span className="text-gray-500">{version === 'omit' ? '# ModelConfig() default' : '# from request.config'}</span>
              </p>
              <p className="font-mono text-[11px] text-sky-200">)</p>
            </motion.div>
          )}

          {step >= 3 && !broken && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-1.5">
              {ENSURES.map(([t, d], i) => (
                <motion.div key={t} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} className="rounded-lg border border-teal-400/40 bg-teal-500/5 p-1.5">
                  <p className="text-[10px] font-semibold text-teal-200">{i + 1}. {t}</p>
                  <p className="text-[9px] text-gray-400">{d}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {step === 4 && !broken && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
              <Pill code={200} text="OK" />
              <Mono className="text-emerald-100">{JSON.stringify(finalJson, null, 2)}</Mono>
            </motion.div>
          )}
        </div>
      </div>
    </Frame>
  );
}
