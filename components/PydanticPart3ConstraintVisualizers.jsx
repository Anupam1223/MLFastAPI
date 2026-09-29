import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Bug } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines } from './VisualKit';
import { Mono, Pill } from './PydanticKit';
import { validateObject, validateValue, errorBody, VersionToggle, ResultBox, pyValue } from './ConstraintKit';

const OMIT = Symbol('omit');

const Verdict = ({ ok, children }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${ok ? 'text-emerald-300' : 'text-rose-300'}`}>
    {ok ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
    {children}
  </span>
);

const TypeBadge = ({ t }) => {
  const tone = {
    int: 'bg-sky-500/20 text-sky-200',
    float: 'bg-violet-500/20 text-violet-200',
    str: 'bg-amber-500/20 text-amber-200',
    bool: 'bg-emerald-500/20 text-emerald-200',
    None: 'bg-gray-600/30 text-gray-300',
    list: 'bg-cyan-500/20 text-cyan-200',
  }[t];
  return <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${tone}`}>{t}</span>;
};

const pyType = (v) => (v === null || v === undefined ? 'None' : typeof v === 'boolean' ? 'bool' : typeof v === 'string' ? 'str' : Array.isArray(v) ? 'list' : Number.isInteger(v) ? 'int' : 'float');

/* ------------------------------------------------------------------ */
/* 1. Types are not enough                                               */
/* ------------------------------------------------------------------ */

const zeros = (n) => Array.from({ length: n }, () => 0.1);

const TVC = {
  range: {
    label: 'Numeric range',
    typeOnly: 'probability_threshold: float',
    withRule: 'probability_threshold: float = Field(..., ge=0, le=1)',
    spec: { name: 'probability_threshold', type: 'float', ge: 0, le: 1 },
    values: [['0.7', 0.7], ['-0.3', -0.3], ['1.8', 1.8], ['"abc"', 'abc']],
    harm: 'A threshold of -0.3 or 1.8 is a valid float, but every prediction passes (or fails) the threshold — silently wrong results.',
  },
  length: {
    label: 'String length',
    typeOnly: 'username: str',
    withRule: 'username: str = Field(..., min_length=3, max_length=50)',
    spec: { name: 'username', type: 'str', min_length: 3, max_length: 50 },
    values: [['"ann"', 'ann'], ['""', ''], ['"ab"', 'ab'], ['60 × "x"', 'x'.repeat(60)]],
    harm: 'An empty username is still a str. Without a rule it lands in your database.',
  },
  size: {
    label: 'List size',
    typeOnly: 'vector: list[float]',
    withRule: 'vector: list[float] = Field(..., min_items=128, max_items=128)',
    spec: { name: 'vector', type: 'list', items: { type: 'float' }, min_length: 128, max_length: 128 },
    values: [['128 floats', zeros(128)], ['3 floats', zeros(3)], ['200 floats', zeros(200)], ['"abc"', 'abc']],
    harm: 'A 3-number vector is a valid list[float], but the model expects exactly 128 — it crashes during inference.',
  },
};

export function TypesVsConstraintsVisualizer() {
  const [tab, setTab] = useState('range');
  const [pick, setPick] = useState(1);
  const sc = TVC[tab];
  const [label, raw] = sc.values[pick];
  const typeRes = validateValue({ ...sc.spec, ge: undefined, le: undefined, min_length: undefined, max_length: undefined }, raw, ['body', sc.spec.name]);
  const fullRes = validateValue(sc.spec, raw, ['body', sc.spec.name]);
  const trap = typeRes.errors.length === 0 && fullRes.errors.length > 0;

  return (
    <Frame
      title="Type hints check the kind of value — constraints check the value itself"
      hint="Pick a scenario and a value. Compare a model with only a type hint against one that adds a constraint."
      footer={
        <div className="flex flex-wrap gap-2">
          {Object.entries(TVC).map(([id, s]) => (
            <button
              key={id}
              type="button"
              className={tabClass(tab === id)}
              onClick={() => {
                setTab(id);
                setPick(1);
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {sc.values.map(([l], i) => (
            <button key={l} type="button" className={`${tabClass(pick === i)} font-mono`} onClick={() => setPick(i)}>
              {l}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          <motion.div key={`${tab}-${pick}`} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="rounded-lg border border-sky-400/50 bg-sky-500/10 px-3 py-1.5 font-mono text-[12px] text-sky-100">
            {label}
          </motion.div>
          <ArrowRight className="w-4 h-4 text-gray-500" />
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {[
            ['Type hint only', sc.typeOnly, typeRes],
            ['Type hint + constraint', sc.withRule, fullRes],
          ].map(([title, code, res], i) => {
            const ok = res.errors.length === 0;
            return (
              <motion.div
                key={title}
                animate={{ scale: trap && i === 0 ? 1.02 : 1 }}
                className={`rounded-xl border p-3 space-y-2 ${ok ? (trap && i === 0 ? 'border-amber-400 bg-amber-500/10' : 'border-emerald-400/50 bg-emerald-500/5') : 'border-rose-400/60 bg-rose-500/10'}`}
              >
                <p className="text-[10px] uppercase tracking-wider text-gray-400">{title}</p>
                <p className="font-mono text-[11px] text-white break-all">{code}</p>
                <Verdict ok={ok}>{ok ? 'accepted' : `422 · ${res.errors[0].type}`}</Verdict>
                {!ok && <p className="text-[10px] text-rose-200">{res.errors[0].msg}</p>}
                {ok && trap && i === 0 && <p className="text-[10px] text-amber-200">Accepted, but nonsense.</p>}
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {trap && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
              {sc.harm}
            </motion.div>
          )}
        </AnimatePresence>

        <Lesson title="Granular control">
          Type hints are the foundation. Constraints add the rules on top: a numeric range, a string length, or a precise number of list elements.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Automatic data conversion                                          */
/* ------------------------------------------------------------------ */

const ITEM_FIELDS = [
  { name: 'item_id', type: 'int', required: true, hint: 'int' },
  { name: 'name', type: 'str', required: true, hint: 'str' },
  { name: 'price', type: 'float', required: true, hint: 'float' },
  { name: 'is_offer', type: 'bool', nullable: true, default: null, hint: 'bool | None = None' },
];

const ITEM_OPTIONS = {
  item_id: [['"42"', '42'], ['42', 42], ['"abc"', 'abc'], ['42.5', 42.5], ['(omit)', OMIT]],
  name: [['"Example Item"', 'Example Item'], ['123', 123], ['(omit)', OMIT]],
  price: [['"99.95"', '99.95'], ['99.95', 99.95], ['"free"', 'free'], ['(omit)', OMIT]],
  is_offer: [['"true"', 'true'], ['"yes"', 'yes'], ['"0"', '0'], ['null', null], ['"maybe"', 'maybe'], ['(omit)', OMIT]],
};

const CONVERSION_NOTE = {
  item_id: { '42': 'digits-only string → int', abc: 'not a number → error', 42.5: 'has a fractional part → error (no silent rounding)' },
  name: { 123: 'Pydantic v2 does not turn numbers into strings (v1 did)' },
  price: { '99.95': 'numeric string → float', free: 'not a number → error' },
  is_offer: { true: 'string "true" → True', yes: '"yes" is also accepted → True', 0: '"0" → False', maybe: 'not a boolean spelling → error' },
};

export function AutoConversionVisualizer() {
  const [choice, setChoice] = useState({ item_id: 0, name: 0, price: 0, is_offer: 0 });
  const stepper = useStepper(ITEM_FIELDS.length + 1, 1100);
  const step = stepper.index;

  const payload = {};
  const labels = [];
  ITEM_FIELDS.forEach((f) => {
    const [label, v] = ITEM_OPTIONS[f.name][choice[f.name]];
    if (v !== OMIT) {
      payload[f.name] = v;
      labels.push(`  "${f.name}": ${label}`);
    }
  });
  const res = validateObject(ITEM_FIELDS, payload);

  return (
    <Frame
      title="Automatic conversion: JSON strings become Python types"
      hint="Change what the client sends for each field, then step through the fields one by one."
      footer={<StepControls stepper={stepper} total={ITEM_FIELDS.length + 1} />}
    >
      <div className="space-y-3">
        <div className="grid md:grid-cols-[1fr_1.1fr] gap-3">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">JSON payload</p>
            <Mono className="text-sky-100">{`{\n${labels.join(',\n')}\n}`}</Mono>
            <CodeLines
              title="models.py"
              lines={['class Item(BaseModel):', '    item_id: int', '    name: str', '    price: float', '    is_offer: bool | None = None # Allows boolean or None']}
              active={step < ITEM_FIELDS.length ? [step + 1] : [0]}
            />
          </div>
          <div className="space-y-1.5">
            {ITEM_FIELDS.map((f, i) => {
              const row = res.rows[i];
              const shown = i < step || (i === step && step < ITEM_FIELDS.length);
              const [label, v] = ITEM_OPTIONS[f.name][choice[f.name]];
              const note = CONVERSION_NOTE[f.name]?.[String(v)];
              return (
                <div key={f.name} className={`rounded-lg border p-2 transition-all ${i === step ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-white">
                      {f.name} <span className="text-gray-500">: {f.hint}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ITEM_OPTIONS[f.name].map(([l], j) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setChoice((c) => ({ ...c, [f.name]: j }))}
                        className={`px-1.5 py-0.5 rounded border font-mono text-[10px] ${choice[f.name] === j ? 'border-teal-400 bg-teal-500/20 text-teal-100' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {shown && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1.5 flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-sky-200">{label}</span>
                        <ArrowRight className="w-3 h-3 text-gray-500" />
                        {row.status === 'error' ? (
                          <span className="text-rose-300">✗ {row.errors[0].type}</span>
                        ) : (
                          <>
                            <span className="text-emerald-200">{pyValue(row.value, f.type)}</span>
                            <TypeBadge t={pyType(row.value)} />
                            {row.status === 'default' && <span className="text-[9px] text-amber-300 font-sans">default</span>}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {shown && note && <p className="text-[9px] text-gray-500 mt-0.5">{note}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {step === ITEM_FIELDS.length && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {res.errors.length ? (
              <ResultBox errors={res.errors} errNote="Conversion failed, so FastAPI answers with an informative 422 instead of calling your function." />
            ) : (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">your function receives</p>
                <Mono className="text-emerald-100">
                  {`Item(${ITEM_FIELDS.map((f) => `${f.name}=${pyValue(res.value[f.name], f.type)}`).join(', ')})`}
                </Mono>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Numeric constraints: gt / ge / lt / le                             */
/* ------------------------------------------------------------------ */

const OPS = {
  gt: { sym: '>', name: 'Greater than', closed: false, dir: 1 },
  ge: { sym: '≥', name: 'Greater than or equal to', closed: true, dir: 1 },
  lt: { sym: '<', name: 'Less than', closed: false, dir: -1 },
  le: { sym: '≤', name: 'Less than or equal to', closed: true, dir: -1 },
};

function NumberLine({ min, max, zones, value, width = 460 }) {
  const x = (v) => 20 + ((v - min) / (max - min)) * (width - 40);
  const clamp = (v) => Math.max(min, Math.min(max, v));
  return (
    <svg viewBox={`0 0 ${width} 56`} className="w-full">
      <line x1={20} x2={width - 20} y1={28} y2={28} stroke="#4b5563" strokeWidth={2} />
      {zones.map((z, i) => (
        <rect key={i} x={x(clamp(z.from))} y={22} width={Math.max(0, x(clamp(z.to)) - x(clamp(z.from)))} height={12} rx={3} fill="rgba(45,212,191,0.35)" />
      ))}
      {zones.flatMap((z, i) =>
        [
          z.fromEdge && { v: z.from, closed: z.fromClosed },
          z.toEdge && { v: z.to, closed: z.toClosed },
        ]
          .filter(Boolean)
          .map((e, j) => <circle key={`${i}-${j}`} cx={x(e.v)} cy={28} r={6} fill={e.closed ? '#2dd4bf' : '#111827'} stroke="#2dd4bf" strokeWidth={2} />),
      )}
      {[min, (min + max) / 2, max].map((t) => (
        <text key={t} x={x(t)} y={52} textAnchor="middle" fontSize={9} fill="#6b7280" fontFamily="monospace">
          {t}
        </text>
      ))}
      <motion.g animate={{ x: x(clamp(value)) }} initial={false}>
        <line x1={0} x2={0} y1={8} y2={40} stroke="white" strokeWidth={2} />
        <text x={0} y={7} textAnchor="middle" fontSize={9} fill="white" fontFamily="monospace">
          {value}
        </text>
      </motion.g>
    </svg>
  );
}

const MI_FIELDS = [
  { name: 'feature1', type: 'float', gt: 0, required: true, min: -2, max: 5, step: 0.5, rule: 'gt=0', comment: 'Feature must be positive' },
  { name: 'probability_threshold', type: 'float', ge: 0, le: 1, required: true, min: -0.5, max: 1.5, step: 0.05, rule: 'ge=0, le=1', comment: 'Probability must be between 0 and 1 (inclusive)' },
  { name: 'count_feature', type: 'int', ge: 0, le: 100, required: true, min: -20, max: 120, step: 1, rule: 'ge=0, le=100', comment: 'Integer feature within a specific range' },
];

const round = (v) => Math.round(v * 1000) / 1000;

export function NumericConstraintsVisualizer() {
  const [tab, setTab] = useState('ops');
  const [op, setOp] = useState('gt');
  const [v, setV] = useState(0);
  const [vals, setVals] = useState({ feature1: 1.5, probability_threshold: 1.2, count_feature: 42 });
  const [required, setRequired] = useState(true);
  const [omit, setOmit] = useState(true);

  const o = OPS[op];
  const pass = op === 'gt' ? v > 0 : op === 'ge' ? v >= 0 : op === 'lt' ? v < 0 : v <= 0;
  const zone = o.dir > 0 ? { from: 0, to: 3, fromEdge: true, fromClosed: o.closed } : { from: -3, to: 0, toEdge: true, toClosed: o.closed };

  const miRes = validateObject(MI_FIELDS, vals);

  const f1Spec = [{ name: 'feature1', type: 'float', gt: 0, required, default: 1.0 }];
  const f1Res = validateObject(f1Spec, omit ? {} : { feature1: 2.5 });

  return (
    <Frame
      title="Numeric constraints with Field"
      hint="Explore the four operators on a number line, then test ModelInput, then compare ... (required) with a real default."
      footer={
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabClass(tab === 'ops')} onClick={() => setTab('ops')}>gt · ge · lt · le</button>
          <button type="button" className={tabClass(tab === 'model')} onClick={() => setTab('model')}>ModelInput</button>
          <button type="button" className={tabClass(tab === 'required')} onClick={() => setTab('required')}>... vs default</button>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
          {tab === 'ops' && (
            <>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(OPS).map(([id, x]) => (
                  <button key={id} type="button" onClick={() => setOp(id)} className={`rounded-lg border p-2 text-center ${op === id ? 'border-teal-400 bg-teal-500/15' : 'border-gray-700 hover:bg-gray-800'}`}>
                    <p className="font-mono text-sm text-white">{id}=0</p>
                    <p className="text-[9px] text-gray-400">{x.name}</p>
                  </button>
                ))}
              </div>
              <NumberLine min={-3} max={3} zones={[zone]} value={v} />
              <input type="range" min={-3} max={3} step={0.5} value={v} onChange={(e) => setV(Number(e.target.value))} className="w-full accent-teal-500" />
              <div className="flex items-center justify-between rounded-lg border border-gray-700 px-3 py-2">
                <span className="font-mono text-sm text-white">
                  {v} {o.sym} 0 ?
                </span>
                <Verdict ok={pass}>{pass ? 'valid' : '422'}</Verdict>
              </div>
              <p className="text-[11px] text-gray-400">
                {o.closed ? 'Filled circle: the boundary value 0 itself is allowed.' : 'Hollow circle: the boundary value 0 itself is rejected.'} Slide onto 0 to see the difference between{' '}
                <span className="font-mono">{o.dir > 0 ? 'gt and ge' : 'lt and le'}</span>.
              </p>
            </>
          )}

          {tab === 'model' && (
            <>
              <CodeLines
                title="class ModelInput(BaseModel)"
                lines={MI_FIELDS.flatMap((f) => [`    # ${f.comment}`, `    ${f.name}: ${f.type} = Field(..., ${f.rule})`])}
                active={MI_FIELDS.flatMap((f, i) => (miRes.rows[i].status === 'error' ? [i * 2 + 1] : []))}
              />
              {MI_FIELDS.map((f, i) => {
                const row = miRes.rows[i];
                const lo = f.gt ?? f.ge;
                const hi = f.le ?? f.max;
                return (
                  <div key={f.name} className="rounded-lg border border-gray-800 p-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-white">
                        {f.name} = {vals[f.name]}
                      </span>
                      <Verdict ok={row.status !== 'error'}>{row.status === 'error' ? row.errors[0].type : 'valid'}</Verdict>
                    </div>
                    <NumberLine
                      min={f.min}
                      max={f.max}
                      value={vals[f.name]}
                      zones={[{ from: lo, to: hi, fromEdge: true, fromClosed: f.ge !== undefined, toEdge: f.le !== undefined, toClosed: true }]}
                    />
                    <input
                      type="range"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={vals[f.name]}
                      onChange={(e) => setVals((c) => ({ ...c, [f.name]: round(Number(e.target.value)) }))}
                      className="w-full accent-teal-500"
                    />
                  </div>
                );
              })}
              {miRes.errors.length > 0 && <Mono className="text-rose-100">{errorBody(miRes.errors)}</Mono>}
            </>
          )}

          {tab === 'required' && (
            <>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={`${tabClass(required)} font-mono`} onClick={() => setRequired(true)}>Field(..., gt=0)</button>
                <button type="button" className={`${tabClass(!required)} font-mono`} onClick={() => setRequired(false)}>Field(1.0, gt=0)</button>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-gray-300">
                <input type="checkbox" className="accent-teal-500" checked={omit} onChange={(e) => setOmit(e.target.checked)} /> client omits feature1
              </label>
              <Mono className="text-sky-100">{omit ? '{ }' : '{ "feature1": 2.5 }'}</Mono>
              <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
                <motion.div key={`${required}-${omit}`} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`w-14 h-14 rounded-full flex items-center justify-center text-[10px] font-bold ${f1Res.errors.length ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'}`}>
                  {f1Res.errors.length ? '422' : '✓'}
                </motion.div>
                <div className="text-[11px] text-gray-300">
                  {f1Res.errors.length
                    ? 'The Ellipsis (...) means "no default": the field is required, so leaving it out is an error.'
                    : omit
                      ? `No value sent, so the default is used: feature1 = ${pyValue(f1Res.value.feature1, 'float')}. The field is optional.`
                      : `feature1 = ${pyValue(f1Res.value.feature1, 'float')} — sent by the client and still checked against gt=0.`}
                </div>
              </div>
              {f1Res.errors.length > 0 && <Mono className="text-rose-100">{errorBody(f1Res.errors)}</Mono>}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 4. String constraints: min_length / max_length / pattern              */
/* ------------------------------------------------------------------ */

const UP_FIELDS = [
  { name: 'username', type: 'str', required: true, min_length: 3, max_length: 50 },
  { name: 'user_id', type: 'str', required: true, pattern: '^UID\\d+$' },
  { name: 'bio', type: 'str', nullable: true, default: null, max_length: 250 },
];

const LOREM = 'Machine learning engineer who loves building fast, well-validated APIs. ';

export function StringConstraintsVisualizer() {
  const [username, setUsername] = useState('al');
  const [userId, setUserId] = useState('UID12a');
  const [bioOn, setBioOn] = useState(false);
  const [bio, setBio] = useState('ML engineer.');

  const payload = { username, user_id: userId };
  if (bioOn) payload.bio = bio;
  const res = validateObject(UP_FIELDS, payload);

  const uidOk = userId.startsWith('UID');
  const digits = userId.slice(3);
  const pieces = [
    { tok: '^', ok: true, text: 'start of string' },
    { tok: 'UID', ok: uidOk, text: 'literal "UID"' },
    { tok: '\\d+', ok: uidOk && /^\d/.test(digits), text: 'one or more digits' },
    { tok: '$', ok: uidOk && /^\d+$/.test(digits), text: 'end of string (nothing extra)' },
  ];
  const lenPct = (n) => `${(Math.min(n, 60) / 60) * 100}%`;

  return (
    <Frame title="String constraints on UserProfile" hint="Type into each field. The length meter, the pattern matcher and the response update as you type.">
      <div className="space-y-3">
        <div className="rounded-lg border border-gray-800 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-white">username <span className="text-gray-500">min_length=3, max_length=50</span></span>
            <Verdict ok={res.rows[0].status !== 'error'}>{username.length} chars</Verdict>
          </div>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded bg-black/70 border border-gray-700 focus:border-teal-400 outline-none px-2 py-1 font-mono text-[12px] text-sky-100" />
          <div className="relative h-3 rounded-full bg-gray-800 overflow-hidden">
            <div className="absolute inset-y-0 bg-emerald-500/30" style={{ left: lenPct(3), width: `calc(${lenPct(50)} - ${lenPct(3)})` }} />
            <motion.div animate={{ width: lenPct(username.length) }} className={`absolute inset-y-0 left-0 ${res.rows[0].status === 'error' ? 'bg-rose-400/70' : 'bg-teal-400/70'}`} />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-gray-500"><span>0</span><span>3</span><span>50</span><span>60+</span></div>
        </div>

        <div className="rounded-lg border border-gray-800 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-white">user_id <span className="text-gray-500">pattern=r"^UID\d+$"</span></span>
            <Verdict ok={res.rows[1].status !== 'error'}>{res.rows[1].status !== 'error' ? 'matches' : 'no match'}</Verdict>
          </div>
          <input value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full rounded bg-black/70 border border-gray-700 focus:border-teal-400 outline-none px-2 py-1 font-mono text-[12px] text-sky-100" />
          <div className="flex flex-wrap gap-0.5 font-mono text-[13px]">
            {userId.split('').map((ch, i) => {
              const ok = i < 3 ? ch === 'UID'[i] : /\d/.test(ch) && uidOk;
              return (
                <motion.span key={`${i}-${ch}`} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`w-5 text-center rounded ${ok ? 'bg-emerald-500/25 text-emerald-100' : 'bg-rose-500/30 text-rose-100'}`}>
                  {ch}
                </motion.span>
              );
            })}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {pieces.map((p) => (
              <div key={p.tok} className={`rounded border px-1.5 py-1 text-center ${p.ok ? 'border-emerald-400/40' : 'border-rose-400/50 bg-rose-500/10'}`}>
                <p className="font-mono text-[11px] text-white">{p.tok}</p>
                <p className="text-[9px] text-gray-400">{p.text}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {['UID42', 'uid42', 'UID', 'XUID7', 'UID12a'].map((s) => (
              <button key={s} type="button" className={`${tabClass(userId === s)} font-mono !py-0.5`} onClick={() => setUserId(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 p-2.5 space-y-1.5">
          <label className="flex items-center gap-2 font-mono text-[11px] text-white">
            <input type="checkbox" className="accent-teal-500" checked={bioOn} onChange={(e) => setBioOn(e.target.checked)} /> bio
            <span className="text-gray-500">str | None = Field(default=None, max_length=250)</span>
          </label>
          {bioOn ? (
            <>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="w-full rounded bg-black/70 border border-gray-700 focus:border-teal-400 outline-none px-2 py-1 font-mono text-[11px] text-sky-100" />
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                  <motion.div animate={{ width: `${Math.min(100, (bio.length / 250) * 100)}%` }} className={`h-full ${bio.length > 250 ? 'bg-rose-400' : 'bg-teal-400'}`} />
                </div>
                <span className={`font-mono text-[10px] ${bio.length > 250 ? 'text-rose-300' : 'text-gray-400'}`}>{bio.length}/250</span>
                <button type="button" className="text-[10px] text-teal-300 underline" onClick={() => setBio(LOREM.repeat(4).trim())}>paste a long bio</button>
              </div>
            </>
          ) : (
            <p className="text-[10px] text-gray-500">Not sent → bio = None. Optional, so that is fine.</p>
          )}
        </div>

        <ResultBox errors={res.errors} okBody={`UserProfile(username='${username}', user_id='${userId}', bio=${bioOn ? `'${bio.length > 30 ? `${bio.slice(0, 30)}…` : bio}'` : 'None'})`} />
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Collection constraints                                              */
/* ------------------------------------------------------------------ */

const EMB_FIELDS = [
  { name: 'vector', type: 'list', items: { type: 'float' }, required: true, min_length: 128, max_length: 128 },
  { name: 'tags', type: 'list', items: { type: 'str' }, required: true, min_length: 1, max_length: 10 },
];

const TAG_POOL = ['nlp', 'cv', 'audio', 'prod', 'beta', 'fast', 'large', 'small', 'v2', 'text', 'vision', 'edge'];

export function CollectionConstraintsVisualizer() {
  const [len, setLen] = useState(100);
  const [tags, setTags] = useState(['nlp']);
  const [guard, setGuard] = useState(true);

  const payload = { vector: zeros(len), tags };
  const res = validateObject(EMB_FIELDS, payload);
  const vecBad = len !== 128;
  const cells = Math.max(len, 128);

  const nextTag = TAG_POOL.find((t) => !tags.includes(t)) || `tag${tags.length + 1}`;

  return (
    <Frame
      title="Collection constraints: size limits for lists"
      hint="Resize the embedding vector and add or remove tags. Then switch off early validation to see where a wrong-sized vector fails instead."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(guard)} onClick={() => setGuard(true)}>validate early (Field)</button>
          <button type="button" className={tabClass(!guard)} onClick={() => setGuard(false)}>no size check</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-gray-800 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-white">vector: list[float] <span className="text-gray-500">min_items=128, max_items=128</span></span>
            <span className={`font-mono text-[11px] ${vecBad ? 'text-rose-300' : 'text-emerald-300'}`}>{len} / 128</span>
          </div>
          <input type="range" min={0} max={160} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-full accent-teal-500" />
          <div className="flex gap-1">
            {[3, 100, 128, 150].map((n) => (
              <button key={n} type="button" className={`${tabClass(len === n)} font-mono !py-0.5`} onClick={() => setLen(n)}>
                {n}
              </button>
            ))}
          </div>
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(32, minmax(0, 1fr))' }}>
            {Array.from({ length: cells }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-[2px] ${i >= 128 ? 'bg-rose-400/80' : i < len ? 'bg-teal-400/80' : 'border border-dashed border-gray-600'}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-gray-500">
            teal = sent · dashed = missing slot · red = too many. The model’s input layer has exactly 128 slots.
          </p>
        </div>

        <div className="rounded-lg border border-gray-800 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] text-white">tags: list[str] <span className="text-gray-500">min_items=1, max_items=10</span></span>
            <span className={`font-mono text-[11px] ${res.rows[1].status === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>{tags.length} / 1–10</span>
          </div>
          <div className="flex flex-wrap gap-1 min-h-[1.75rem]">
            {Array.from({ length: Math.max(10, tags.length) }).map((_, i) =>
              i < tags.length ? (
                <motion.button
                  key={`${tags[i]}-${i}`}
                  type="button"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setTags((t) => t.filter((_, j) => j !== i))}
                  className={`px-2 py-0.5 rounded-full border font-mono text-[10px] ${i >= 10 ? 'border-rose-400 bg-rose-500/20 text-rose-100' : 'border-cyan-400/40 bg-cyan-500/20 text-cyan-100'}`}
                >
                  {tags[i]} ✕
                </motion.button>
              ) : (
                <span key={`slot-${i}`} className="w-10 h-5 rounded-full border border-dashed border-gray-700" />
              ),
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setTags((t) => [...t, nextTag])} className="px-2 py-1 rounded bg-teal-600 text-white text-[10px]">+ add tag</button>
            <button type="button" onClick={() => setTags([])} className="px-2 py-1 rounded bg-gray-800 text-gray-200 text-[10px]">clear</button>
          </div>
        </div>

        {guard ? (
          <ResultBox errors={res.errors} okBody={`EmbeddingInput(vector=[0.1, 0.1, … ×128], tags=${pyValue(tags)})`} okNote="The vector reaches model inference with exactly the dimensionality it expects." errNote="Rejected at the door — the model never sees a wrong-sized vector." />
        ) : vecBad ? (
          <div className="space-y-1">
            <Pill code={500} text="Internal Server Error" />
            <div className="rounded-lg border border-rose-400/40 bg-black/70 p-2.5 font-mono text-[11px] text-rose-200 space-y-0.5">
              <p className="flex items-center gap-1"><Bug className="w-3.5 h-3.5" /> Traceback (most recent call last):</p>
              <p className="text-gray-400">  File "main.py", line 18, in embed</p>
              <p className="text-gray-400">    scores = model.predict([features.vector])</p>
              <p>ValueError: X has {len} features, but the model is expecting 128 features as input.</p>
            </div>
            <p className="text-[10px] text-gray-400">A runtime error during inference, and a vague 500 for the client.</p>
          </div>
        ) : (
          <ResultBox errors={res.errors.filter((e) => e.loc[1] === 'tags')} okBody="model.predict(...) ran fine this time" />
        )}

        <p className="text-[10px] text-gray-500">
          In Pydantic v2 these are spelled <span className="font-mono">min_length</span>/<span className="font-mono">max_length</span> for lists too; <span className="font-mono">min_items</span>/<span className="font-mono">max_items</span> are the v1 names.
        </p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Applying constraints in practice: HouseFeatures                    */
/* ------------------------------------------------------------------ */

export const HOUSE_FIELDS = [
  { name: 'area_sqft', type: 'float', required: true, gt: 0, rule: 'gt=0', desc: 'Surface area of the house in square feet.', example: 1500.5 },
  { name: 'bedrooms', type: 'int', required: true, ge: 1, le: 10, rule: 'ge=1, le=10', desc: 'Number of bedrooms.', example: 3 },
  { name: 'year_built', type: 'int', required: true, gt: 1800, lt: 2025, rule: 'gt=1800, lt=2025', desc: 'Year the house was built.', example: 1995 },
  { name: 'zip_code', type: 'str', required: true, pattern: '^\\d{5}$', rule: 'pattern=r"^\\d{5}$"', desc: '5-digit US zip code.', example: '90210' },
];

const HOUSE_PRESETS = [
  { id: 'valid', label: 'valid example', v: { area_sqft: '1500.5', bedrooms: '3', year_built: '1995', zip_code: '"90210"' } },
  { id: 'bed0', label: 'bedrooms: 0', v: { area_sqft: '1500.5', bedrooms: '0', year_built: '1995', zip_code: '"90210"' } },
  { id: 'neg', label: 'area_sqft: -100', v: { area_sqft: '-100', bedrooms: '3', year_built: '1995', zip_code: '"90210"' } },
  { id: 'zip', label: 'zip_code: "abcde"', v: { area_sqft: '1500.5', bedrooms: '3', year_built: '1995', zip_code: '"abcde"' } },
  { id: 'all', label: 'all three', v: { area_sqft: '-100', bedrooms: '0', year_built: '1995', zip_code: '"abcde"' } },
  { id: 'str', label: 'bedrooms: "3"', v: { area_sqft: '1500.5', bedrooms: '"3"', year_built: '1995', zip_code: '"90210"' } },
];

export const parseLoose = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export function HouseConstraintsVisualizer() {
  const [vals, setVals] = useState(HOUSE_PRESETS[4].v);
  const [version, setVersion] = useState('v2');
  const payload = Object.fromEntries(Object.entries(vals).map(([k, t]) => [k, parseLoose(t)]));
  const res = validateObject(HOUSE_FIELDS, payload);

  return (
    <Frame
      title="POST /predict_price/ with HouseFeatures"
      hint="Load a preset or edit a value (as JSON). Every rule is checked and all violations come back in one 422."
      footer={<VersionToggle version={version} setVersion={setVersion} />}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {HOUSE_PRESETS.map((p) => (
            <button key={p.id} type="button" className={`${tabClass(JSON.stringify(vals) === JSON.stringify(p.v))} font-mono`} onClick={() => setVals(p.v)}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          {HOUSE_FIELDS.map((f, i) => {
            const row = res.rows[i];
            const bad = row.status === 'error';
            return (
              <motion.div key={f.name} animate={{ x: bad ? [0, -4, 4, -2, 0] : 0 }} transition={{ duration: 0.3 }} className={`grid grid-cols-[7rem_6rem_1fr_auto] items-center gap-2 rounded-lg border px-2 py-1.5 ${bad ? 'border-rose-400/60 bg-rose-500/10' : 'border-gray-800'}`}>
                <span className="font-mono text-[11px] text-white">{f.name}</span>
                <input
                  value={vals[f.name]}
                  onChange={(e) => setVals((c) => ({ ...c, [f.name]: e.target.value }))}
                  className="rounded bg-black/70 border border-gray-700 focus:border-teal-400 outline-none px-1.5 py-0.5 font-mono text-[11px] text-sky-100 w-full"
                />
                <span className="font-mono text-[10px] text-gray-400 truncate">
                  {f.type} · {f.rule}
                </span>
                {bad ? <XCircle className="w-4 h-4 text-rose-300" /> : <CheckCircle className={`w-4 h-4 ${row.status === 'coerced' ? 'text-cyan-300' : 'text-emerald-300'}`} />}
              </motion.div>
            );
          })}
        </div>

        <ResultBox
          errors={res.errors}
          version={version}
          okBody={`features = HouseFeatures(${HOUSE_FIELDS.map((f) => `${f.name}=${pyValue(res.value?.[f.name], f.type)}`).join(', ')})`}
          okNote="At this point, 'features' is guaranteed to be valid — your endpoint runs model prediction with it."
          errNote="The response details exactly which fields failed and why. Your endpoint function never ran."
        />
      </div>
    </Frame>
  );
}
