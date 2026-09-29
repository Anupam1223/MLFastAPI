import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, ShieldOff, AlertTriangle } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines } from './VisualKit';
import { SCHEMAS, validateModel, instanceRepr, errorsV2, Mono, Pill, ModelPlayground } from './PydanticKit';

/* ------------------------------------------------------------------ */
/* 1. Why validation matters                                             */
/* ------------------------------------------------------------------ */

const IRIS_OK = { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2 };

const GARBAGE = [
  {
    id: 'good', label: 'clean data', body: IRIS_OK,
    raw: { status: 200, out: '{"species":"setosa"}', note: 'Works — when the data happens to be perfect.' },
  },
  {
    id: 'text', label: '"five" as text', body: { ...IRIS_OK, sepal_length: 'five' },
    raw: { status: 500, trace: "ValueError: could not convert string to float: 'five'", note: 'NumPy blows up deep inside your code. The client gets a vague 500 and no hint about what to fix.' },
  },
  {
    id: 'missing', label: 'missing field', body: { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4 },
    raw: { status: 500, trace: "KeyError: 'petal_width'", note: 'A dictionary lookup crashes. Again a 500 — it looks like your server is broken.' },
  },
  {
    id: 'list', label: 'list instead of number', body: { ...IRIS_OK, petal_length: [1.4] },
    raw: { status: 500, trace: 'ValueError: setting an array element with a sequence.', note: 'Wrong structure → cryptic NumPy error far away from the real cause.' },
  },
  {
    id: 'neg', label: 'negative width', body: { ...IRIS_OK, petal_width: -2.0 },
    raw: { status: 200, out: '{"species":"versicolor"}', silent: true, note: 'No crash at all — just a confident, meaningless prediction. The most dangerous failure: nobody notices.' },
  },
];

const RAW_CODE = [
  '@app.post("/predict")',
  'async def predict(data: dict):',
  '    x = [[data["sepal_length"], data["sepal_width"],',
  '          data["petal_length"], data["petal_width"]]]',
  '    return {"species": model.predict(np.array(x, dtype=float))[0]}',
];

const PYD_CODE = [
  '@app.post("/predict")',
  'async def predict(features: InputFeatures):',
  '    x = [[features.sepal_length, features.sepal_width,',
  '          features.petal_length, features.petal_width]]',
  '    return {"species": model.predict(np.array(x))[0]}',
];

export function GarbageInVisualizer() {
  const [id, setId] = useState('text');
  const p = GARBAGE.find((g) => g.id === id);
  const result = validateModel(SCHEMAS.InputFeatures, p.body);

  return (
    <Frame
      title="Same bad request, two APIs"
      hint="Send each payload to an API with no validation (left) and one guarded by a Pydantic model (right). Watch where things go wrong."
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {GARBAGE.map((g) => (
            <button key={g.id} type="button" className={tabClass(g.id === id)} onClick={() => setId(g.id)}>
              {g.label}
            </button>
          ))}
        </div>

        <div className="relative rounded-xl border border-gray-700 bg-black/70 p-2.5">
          <AnimatePresence mode="wait">
            <motion.div key={id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2">
              <Mail className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
              <pre className="font-mono text-[11px] text-sky-100 whitespace-pre-wrap break-all">POST /predict  {JSON.stringify(p.body)}</pre>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <motion.div key={`raw-${id}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-gray-700 p-3 space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-200"><ShieldOff className="w-4 h-4 text-rose-300" /> No validation (data: dict)</p>
            <CodeLines lines={RAW_CODE} active={p.raw.status === 500 ? [2, 3, 4] : [4]} />
            <div className="flex items-center gap-2">
              <Pill code={p.raw.status} text={p.raw.status === 200 ? 'OK' : 'Internal Server Error'} />
              {p.raw.silent && <span className="flex items-center gap-1 text-[10px] text-amber-200"><AlertTriangle className="w-3 h-3" /> silently wrong</span>}
            </div>
            <Mono className={p.raw.status === 500 ? 'text-rose-200' : p.raw.silent ? 'text-amber-100' : 'text-emerald-100'}>
              {p.raw.trace ? `Traceback (server log)\n${p.raw.trace}` : p.raw.out}
            </Mono>
            <p className="text-[11px] text-gray-400">{p.raw.note}</p>
          </motion.div>

          <motion.div key={`pyd-${id}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-teal-500/40 p-3 space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-200"><ShieldCheck className="w-4 h-4 text-teal-300" /> Pydantic model (features: InputFeatures)</p>
            <CodeLines lines={PYD_CODE} active={result.ok ? [1, 4] : [1]} />
            <Pill code={result.ok ? 200 : 422} text={result.ok ? 'OK' : 'Unprocessable Entity'} />
            <Mono className={result.ok ? 'text-emerald-100' : 'text-rose-100'}>
              {result.ok ? (id === 'neg' ? '{"species":"versicolor"}' : '{"species":"setosa"}') : errorsV2(result.errors)}
            </Mono>
            <p className="text-[11px] text-gray-400">
              {result.ok
                ? id === 'neg'
                  ? 'Accepted: every field has the right type. Catching impossible values needs a constraint like Field(gt=0) — you will add one in Request Body Validation.'
                  : 'Valid data reaches your model as a typed Python object.'
                : 'Rejected before your code runs, with the exact field and reason. Your model never sees bad input.'}
            </p>
          </motion.div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Imperative checks vs declarative model                             */
/* ------------------------------------------------------------------ */

const RULES = [
  {
    id: 'age', label: 'age is required and must be an int',
    manual: ['    if "age" not in data:', '        raise ValueError("age is required")', '    if not isinstance(data["age"], int):', '        raise ValueError("age must be an int")'],
    decl: '    age: int',
  },
  {
    id: 'prev', label: 'previous_interaction is required and must be a bool',
    manual: ['    if "previous_interaction" not in data:', '        raise ValueError("previous_interaction is required")', '    if not isinstance(data["previous_interaction"], bool):', '        raise ValueError("previous_interaction must be a bool")'],
    decl: '    previous_interaction: bool',
  },
  {
    id: 'camp', label: 'campaign_id is an optional string (default None)',
    manual: ['    campaign_id = data.get("campaign_id")', '    if campaign_id is not None and not isinstance(campaign_id, str):', '        raise ValueError("campaign_id must be a string")', '    data["campaign_id"] = campaign_id'],
    decl: '    campaign_id: str | None = None',
  },
];

const COMPARE = [
  ['Converts "35" → 35 where sensible', 'no — extra code needed', 'yes'],
  ['Reports every problem at once', 'no — stops at the first raise', 'yes'],
  ['Error says where and why (loc, msg)', 'only what you write by hand', 'yes'],
  ['Documents the API schema', 'no', 'yes (JSON Schema → /docs)'],
];

export function ImperativeVsDeclarativeVisualizer() {
  const [on, setOn] = useState(['age', 'prev']);
  const active = RULES.filter((r) => on.includes(r.id));
  const manual = ['def validate(data):', ...active.flatMap((r) => r.manual), '    return data'];
  const decl = ['class AdPredictionInput(BaseModel):', ...(active.length ? active.map((r) => r.decl) : ['    pass'])];
  const max = 16;

  return (
    <Frame
      title="Write checks, or declare a shape?"
      hint="Inputs for an ad-click model: tick the rules the API needs. The hand-written checks grow; the declared shape (a Pydantic model) gains one line per rule. How that class works is the next slide."
    >
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-1.5">
          {RULES.map((r) => (
            <label key={r.id} className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[11px] cursor-pointer ${on.includes(r.id) ? 'border-teal-400/50 bg-teal-500/10 text-white' : 'border-gray-700 text-gray-400'}`}>
              <input
                type="checkbox"
                className="accent-teal-500"
                checked={on.includes(r.id)}
                onChange={() => setOn((cur) => (cur.includes(r.id) ? cur.filter((x) => x !== r.id) : [...cur, r.id]))}
              />
              {r.label}
            </label>
          ))}
        </div>

        <div className="grid md:grid-cols-[1.3fr_1fr] gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-rose-200 font-semibold">Imperative: check every field by hand</span>
              <span className="font-mono text-gray-400">{manual.length} lines</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <motion.div animate={{ width: `${Math.min(100, (manual.length / max) * 100)}%` }} className="h-full bg-rose-400" />
            </div>
            <CodeLines lines={manual} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-teal-200 font-semibold">Declarative: describe the shape</span>
              <span className="font-mono text-gray-400">{decl.length} lines</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <motion.div animate={{ width: `${Math.min(100, (decl.length / max) * 100)}%` }} className="h-full bg-teal-400" />
            </div>
            <CodeLines lines={decl} />
          </div>
        </div>

        {on.includes('age') && (
          <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
            Hidden bug in the hand-written version: in Python, <span className="font-mono">isinstance(True, int)</span> is <span className="font-mono">True</span>, so{' '}
            <span className="font-mono">{'{"age": true}'}</span> slips through the age check. Easy to miss when you write checks yourself.
          </div>
        )}

        <div className="rounded-xl border border-gray-700 overflow-hidden text-[11px]">
          <div className="grid grid-cols-[1.6fr_1fr_1fr] gap-2 px-3 py-1.5 text-[9px] uppercase tracking-wider text-gray-500 border-b border-gray-800">
            <span>capability</span><span>hand-written</span><span>Pydantic</span>
          </div>
          {COMPARE.map(([cap, a, b]) => (
            <div key={cap} className="grid grid-cols-[1.6fr_1fr_1fr] gap-2 px-3 py-1.5">
              <span className="text-gray-200">{cap}</span>
              <span className="text-rose-200">{a}</span>
              <span className="text-emerald-200">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 3. InputFeatures playground                                           */
/* ------------------------------------------------------------------ */

const INPUT_FEATURES_CODE = [
  '# A simple example illustrating the concept',
  'from pydantic import BaseModel',
  'from typing import List',
  '',
  'class InputFeatures(BaseModel):',
  '    sepal_length: float',
  '    sepal_width: float',
  '    petal_length: float',
  '    petal_width: float',
  '    tags: List[str] = [] # Optional list of strings with default',
];

const IF_PRESETS = [
  { id: 'valid', label: 'valid', json: '{\n  "sepal_length": 5.1,\n  "sepal_width": 3.5,\n  "petal_length": 1.4,\n  "petal_width": 0.2\n}', note: 'All four required floats are present. tags is not sent, so it takes its default: an empty list.' },
  { id: 'strings', label: 'numbers as strings', json: '{\n  "sepal_length": "5.1",\n  "sepal_width": "3.5",\n  "petal_length": 1.4,\n  "petal_width": 0.2\n}', note: 'Pydantic parses: "5.1" is a clean numeric string, so it is converted to the float 5.1.' },
  { id: 'ints', label: 'whole numbers', json: '{\n  "sepal_length": 5,\n  "sepal_width": 3,\n  "petal_length": 1,\n  "petal_width": 0\n}', note: 'Integers are valid floats: 5 becomes 5.0.' },
  { id: 'tags', label: 'with tags', json: '{\n  "sepal_length": 5.1,\n  "sepal_width": 3.5,\n  "petal_length": 1.4,\n  "petal_width": 0.2,\n  "tags": ["field-sample", "2026"]\n}', note: 'tags is provided, so every item is checked to be a string.' },
  { id: 'bad', label: 'three problems', json: '{\n  "sepal_length": "long",\n  "sepal_width": 3.5,\n  "petal_length": 1.4,\n  "tags": "setosa"\n}', note: 'Three independent problems — and Pydantic reports all three at once: an unparseable float, a missing field, and a string where a list was expected.' },
];

const IF_NOTES = {
  sepal_length: 'float: accepts numbers, and strings that look like numbers ("5.1"). Rejects things like "long".',
  sepal_width: 'float, required: no default, so the key must be present.',
  petal_length: 'float, required.',
  petal_width: 'float, required. Try deleting it from the JSON.',
  tags: 'List[str] = []: optional because it has a default. If sent, it must be a list whose items are strings. (Pydantic copies mutable defaults, so each instance gets its own list.)',
};

export function InputFeaturesVisualizer() {
  return (
    <ModelPlayground
      schemaKey="InputFeatures"
      code={INPUT_FEATURES_CODE}
      fieldLines={{ sepal_length: 5, sepal_width: 6, petal_length: 7, petal_width: 8, tags: 9 }}
      presets={IF_PRESETS}
      notes={IF_NOTES}
      title="Pydantic parses and validates with your type hints"
      hint="Pick a payload or edit the JSON. Each field is checked against its type hint. Click a field row or code line to learn about it."
    />
  );
}

/* ------------------------------------------------------------------ */
/* 4. Four advantages in FastAPI                                          */
/* ------------------------------------------------------------------ */

const ADV_TABS = [
  { id: 'validation', label: 'Automatic validation' },
  { id: 'serialization', label: 'Serialization' },
  { id: 'devx', label: 'Developer experience' },
  { id: 'docs', label: 'API documentation' },
];

const IF_SCHEMA = `{
  "title": "InputFeatures",
  "type": "object",
  "properties": {
    "sepal_length": {"title": "Sepal Length", "type": "number"},
    "sepal_width":  {"title": "Sepal Width",  "type": "number"},
    "petal_length": {"title": "Petal Length", "type": "number"},
    "petal_width":  {"title": "Petal Width",  "type": "number"},
    "tags": {"title": "Tags", "type": "array",
             "items": {"type": "string"}, "default": []}
  },
  "required": ["sepal_length", "sepal_width",
               "petal_length", "petal_width"]
}`;

export function AdvantagesVisualizer() {
  const [tab, setTab] = useState('validation');
  const [bad, setBad] = useState(true);
  const [filter, setFilter] = useState(true);
  const [typo, setTypo] = useState(false);
  const body = bad ? { sepal_length: 5.1, sepal_width: 'wide', petal_length: 1.4 } : IRIS_OK;
  const result = validateModel(SCHEMAS.InputFeatures, body);

  return (
    <Frame
      title="What Pydantic gives you inside FastAPI"
      hint="Each tab is one advantage from the text, shown in action."
      footer={
        <div className="flex flex-wrap gap-2">
          {ADV_TABS.map((t) => (
            <button key={t.id} type="button" className={tabClass(tab === t.id)} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
          {tab === 'validation' && (
            <>
              <Lesson title="Automatic Data Validation">
                Declare the model as the type of a body parameter. FastAPI reads the body, parses the JSON, validates it, and returns a standard 422 if it does not fit —
                invalid data never reaches your logic.
              </Lesson>
              <div className="flex gap-2">
                <button type="button" className={tabClass(!bad)} onClick={() => setBad(false)}>send valid body</button>
                <button type="button" className={tabClass(bad)} onClick={() => setBad(true)}>send invalid body</button>
              </div>
              <Mono className="text-sky-100">POST /predict  {JSON.stringify(body)}</Mono>
              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                {['read body', 'parse JSON', 'validate'].map((s, i) => (
                  <motion.div key={s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.25 }} className="rounded-lg border border-teal-400/40 bg-teal-500/10 py-1.5 text-teal-100">
                    {s}
                  </motion.div>
                ))}
              </div>
              {result.ok ? (
                <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 font-mono text-[11px] text-white">
                  predict(features={instanceRepr(SCHEMAS.InputFeatures, result.rows)})
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Pill code={422} text="Unprocessable Entity" />
                  <Mono className="text-rose-100">{errorsV2(result.errors)}</Mono>
                </div>
              )}
            </>
          )}

          {tab === 'serialization' && (
            <>
              <Lesson title="Data Serialization">
                Pydantic converts Python objects to JSON as easily as it parses JSON. FastAPI uses this for <span className="font-mono">response_model</span>, so outgoing data
                matches a declared structure too.
              </Lesson>
              <CodeLines
                lines={[
                  'class Prediction(BaseModel):',
                  '    species: str',
                  '    confidence: float',
                  '',
                  filter ? '@app.post("/predict", response_model=Prediction)' : '@app.post("/predict")',
                  'async def predict(features: InputFeatures):',
                  "    return {'species': 'setosa', 'confidence': 0.97,",
                  "            'debug_logits': [2.1, 0.3, -1.2]}",
                ]}
                active={[4]}
              />
              <label className="flex items-center gap-2 text-[11px] text-gray-300">
                <input type="checkbox" className="accent-teal-500" checked={filter} onChange={(e) => setFilter(e.target.checked)} />
                use <span className="font-mono text-teal-200">response_model=Prediction</span>
              </label>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <Mono className="text-violet-100">{"{'species': 'setosa',\n 'confidence': 0.97,\n 'debug_logits': [2.1, 0.3, -1.2]}"}</Mono>
                <span className="text-amber-300 text-xs">→ JSON →</span>
                <Mono className="text-emerald-100">
                  {filter ? '{"species":"setosa",\n "confidence":0.97}' : '{"species":"setosa",\n "confidence":0.97,\n "debug_logits":[2.1,0.3,-1.2]}'}
                </Mono>
              </div>
              <p className="text-[11px] text-gray-400">{filter ? 'Only the fields declared in Prediction are sent. Internal details stay internal.' : 'Without a response model, everything you return is sent — including debug data.'}</p>
            </>
          )}

          {tab === 'devx' && (
            <>
              <Lesson title="Improved Development Experience">
                Type hints make code readable, and editors use them for autocompletion, static analysis, and refactoring — catching type mistakes before you run anything.
              </Lesson>
              <div className="flex gap-2">
                <button type="button" className={tabClass(!typo)} onClick={() => setTypo(false)}>autocomplete</button>
                <button type="button" className={tabClass(typo)} onClick={() => setTypo(true)}>make a typo</button>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 font-mono text-[12px] space-y-1">
                <p className="text-gray-400">async def predict(features: <span className="text-teal-200">InputFeatures</span>):</p>
                {typo ? (
                  <>
                    <p className="pl-4 text-gray-200">
                      x = features.<span className="underline decoration-wavy decoration-rose-400 text-rose-200">sepal_lenght</span>
                    </p>
                    <div className="ml-10 inline-block rounded border border-rose-400/50 bg-gray-900 px-2 py-1 text-[10px] text-rose-200">
                      Cannot access attribute "sepal_lenght" for class "InputFeatures"
                    </div>
                  </>
                ) : (
                  <>
                    <p className="pl-4 text-gray-200">x = features.<span className="animate-pulse">|</span></p>
                    <div className="ml-16 w-56 rounded border border-gray-700 bg-gray-900 text-[10px]">
                      {SCHEMAS.InputFeatures.fields.map((f, i) => (
                        <p key={f.name} className={`flex justify-between px-2 py-0.5 ${i === 0 ? 'bg-teal-500/20 text-teal-100' : 'text-gray-300'}`}>
                          {f.name} <span className="text-gray-500">{f.type === 'list_str' ? 'List[str]' : f.type}</span>
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <p className="text-[11px] text-gray-400">{typo ? 'The editor flags the misspelling immediately — no need to wait for a runtime AttributeError.' : 'The editor knows every field and its type, straight from the model.'}</p>
            </>
          )}

          {tab === 'docs' && (
            <>
              <Lesson title="Automatic API Documentation">
                FastAPI introspects your models to generate JSON Schema definitions, which power the interactive docs (Swagger UI, ReDoc). Consumers see exactly what to send and what comes back.
              </Lesson>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">generated JSON Schema</p>
                  <Mono className="text-cyan-100">{IF_SCHEMA}</Mono>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">how /docs shows it (Schemas section)</p>
                  <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 text-[11px] space-y-1">
                    <p className="font-semibold text-white">InputFeatures <span className="text-gray-500 font-normal">{'{'}</span></p>
                    {SCHEMAS.InputFeatures.fields.map((f) => (
                      <p key={f.name} className="pl-3 font-mono">
                        <span className="text-white">{f.name}</span>
                        {f.required && <span className="text-rose-400">*</span>} <span className="text-cyan-200">{f.type === 'list_str' ? 'array<string>' : 'number'}</span>
                        {!f.required && <span className="text-gray-500"> default: []</span>}
                      </p>
                    ))}
                    <p className="text-gray-500">{'}'}</p>
                    <p className="text-[10px] text-gray-500 pt-1"><span className="text-rose-400">*</span> required</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Pydantic's role in the request flow (diagram)                     */
/* ------------------------------------------------------------------ */

const NODES = {
  client: { x: 10, y: 110, w: 90, h: 40, label: ['API Client'], fill: '#e5e7eb', text: '#111827' },
  fastapi: { x: 160, y: 105, w: 110, h: 50, label: ['FastAPI', 'Application'], fill: '#93c5fd', text: '#0b1220' },
  pydantic: { x: 330, y: 105, w: 125, h: 50, label: ['Pydantic Model', 'Validation'], fill: '#6ee7b7', text: '#052e1f' },
  validated: { x: 520, y: 60, w: 115, h: 50, label: ['Validated Data', '(Python Object)'], fill: '#bbf7d0', text: '#052e1f' },
  logic: { x: 680, y: 20, w: 130, h: 50, label: ['Your API Logic', '(e.g., ML Inference)'], fill: '#c4b5fd', text: '#1e1033' },
  error: { x: 520, y: 175, w: 115, h: 50, label: ['HTTP 422 Error', 'Response'], fill: '#fecaca', text: '#450a0a' },
};

const EDGES = {
  req: { d: 'M100,122 L160,122', label: 'HTTP Request', lx: 130, ly: 114 },
  res: { d: 'M160,142 L100,142', label: 'HTTP Response', lx: 130, ly: 158 },
  pass: { d: 'M270,130 L330,130', label: 'Pass Data', lx: 300, ly: 122 },
  success: { d: 'M455,118 L520,90', label: 'Validation Success', lx: 488, ly: 94 },
  failure: { d: 'M455,142 L520,195', label: 'Validation Failure', lx: 490, ly: 180 },
  use: { d: 'M635,78 L680,52', label: 'Use Valid Data', lx: 655, ly: 58 },
  process: { d: 'M745,20 C745,-2 320,-2 225,105', label: 'Process & Generate Response Data', lx: 480, ly: 12 },
  details: { d: 'M520,212 C400,242 250,230 220,155', label: 'Error Details', lx: 370, ly: 238 },
};

const FLOW = {
  valid: [
    { edge: 'req', node: 'fastapi', title: 'HTTP Request with a JSON body', data: 'POST /predict\n{"sepal_length": 5.1, "sepal_width": 3.5, "petal_length": 1.4, "petal_width": 0.2}' },
    { edge: 'pass', node: 'pydantic', title: 'FastAPI passes the data to Pydantic', data: "{'sepal_length': 5.1, 'sepal_width': 3.5, 'petal_length': 1.4, 'petal_width': 0.2}" },
    { edge: 'success', node: 'validated', title: 'Validation success', data: "InputFeatures(sepal_length=5.1, sepal_width=3.5, petal_length=1.4, petal_width=0.2, tags=[])" },
    { edge: 'use', node: 'logic', title: 'Your logic uses the valid object', data: 'model.predict([[5.1, 3.5, 1.4, 0.2]])  →  "setosa"' },
    { edge: 'process', node: 'fastapi', title: 'Process and generate response data', data: "return {'species': 'setosa'}" },
    { edge: 'res', node: 'client', title: 'HTTP Response', data: '200 OK\n{"species":"setosa"}' },
  ],
  invalid: [
    { edge: 'req', node: 'fastapi', title: 'HTTP Request with a JSON body', data: 'POST /predict\n{"sepal_length": "five", "sepal_width": 3.5, "petal_length": 1.4}' },
    { edge: 'pass', node: 'pydantic', title: 'FastAPI passes the data to Pydantic', data: "{'sepal_length': 'five', 'sepal_width': 3.5, 'petal_length': 1.4}" },
    { edge: 'failure', node: 'error', title: 'Validation failure', data: "sepal_length: unable to parse string as a number\npetal_width: Field required" },
    { edge: 'details', node: 'fastapi', title: 'Error details go back to FastAPI', data: '[{"loc": ["body","sepal_length"], ...}, {"loc": ["body","petal_width"], ...}]' },
    { edge: 'res', node: 'client', title: 'HTTP Response: 422', data: '422 Unprocessable Entity\n{"detail": [ …both errors… ]}\n\nYour API logic never ran.' },
  ],
};

function FlowRun({ scenario, setScenario }) {
  const steps = FLOW[scenario];
  const stepper = useStepper(steps.length, 1600);
  const s = steps[stepper.index];
  const visited = steps.slice(0, stepper.index + 1).map((x) => x.edge);

  return (
    <Frame
      title="Pydantic’s role in the request"
      hint="Choose a valid or invalid payload and step along the diagram. The glowing path is where the data is right now."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(scenario === 'valid')} onClick={() => setScenario('valid')}>valid payload</button>
            <button type="button" className={tabClass(scenario === 'invalid')} onClick={() => setScenario('invalid')}>invalid payload</button>
          </div>
          <StepControls stepper={stepper} total={steps.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-700 bg-white/[0.03] p-2">
          <svg viewBox="0 -10 820 260" className="w-full h-auto">
            <defs>
              <marker id="pyd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#6b7280" />
              </marker>
              <marker id="pyd-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#2dd4bf" />
              </marker>
            </defs>
            {Object.entries(EDGES).map(([id, e]) => {
              const on = s.edge === id;
              const seen = visited.includes(id);
              return (
                <g key={id}>
                  <path
                    d={e.d}
                    fill="none"
                    stroke={on ? '#2dd4bf' : seen ? '#0f766e' : '#4b5563'}
                    strokeWidth={on ? 3 : 1.5}
                    strokeDasharray={on ? '6 4' : undefined}
                    markerEnd={`url(#${on ? 'pyd-arrow-on' : 'pyd-arrow'})`}
                  >
                    {on && <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.6s" repeatCount="indefinite" />}
                  </path>
                  {on && (
                    <circle r="5" fill="#fbbf24">
                      <animateMotion dur="1.2s" repeatCount="indefinite" path={e.d} />
                    </circle>
                  )}
                  <text x={e.lx} y={e.ly} textAnchor="middle" fontSize="10" fill={on ? '#5eead4' : '#9ca3af'}>
                    {e.label}
                  </text>
                </g>
              );
            })}
            {Object.entries(NODES).map(([id, n]) => {
              const on = s.node === id;
              const skipped = (scenario === 'valid' && id === 'error') || (scenario === 'invalid' && (id === 'validated' || id === 'logic'));
              return (
                <g key={id} opacity={skipped ? 0.3 : 1}>
                  <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="6" fill={n.fill} stroke={on ? '#f59e0b' : '#374151'} strokeWidth={on ? 3 : 1} />
                  {n.label.map((line, i) => (
                    <text key={line} x={n.x + n.w / 2} y={n.y + n.h / 2 + (i - (n.label.length - 1) / 2) * 13 + 4} textAnchor="middle" fontSize="11" fill={n.text}>
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>

        <Lesson title={`${stepper.index + 1}. ${s.title}`}>
          {scenario === 'valid'
            ? 'If the data is valid, a Python object is passed to your application logic.'
            : 'If the data is invalid, Pydantic reports every problem and FastAPI turns them into a 422 error response.'}
        </Lesson>
        <AnimatePresence mode="wait">
          <motion.div key={`${scenario}-${stepper.index}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Mono className={scenario === 'invalid' && stepper.index >= 2 ? 'text-rose-100' : 'text-teal-100'}>{s.data}</Mono>
          </motion.div>
        </AnimatePresence>
      </div>
    </Frame>
  );
}

export function ValidationFlowVisualizer() {
  const [scenario, setScenario] = useState('valid');
  return <FlowRun key={scenario} scenario={scenario} setScenario={setScenario} />;
}

/* ------------------------------------------------------------------ */
/* 6. Beyond basic types – a preview                                      */
/* ------------------------------------------------------------------ */

const BEYOND = [
  { id: 'nested', label: 'Nested structures' },
  { id: 'constraints', label: 'Constraints' },
  { id: 'defaults', label: 'Default values' },
  { id: 'custom', label: 'Custom validation' },
  { id: 'settings', label: 'Settings' },
];

function BeyondDemo({ id }) {
  const [flag, setFlag] = useState(false);
  const [age, setAge] = useState(25);
  const [sendThreshold, setSendThreshold] = useState(false);
  const [sendTopK, setSendTopK] = useState(true);
  const [text, setText] = useState('great product!');

  if (id === 'nested') {
    const body = flag ? '{"user_id": 1, "location": {"lat": "40.7"}}' : '{"user_id": 1, "location": {"lat": "40.7", "lon": -74.0}}';
    return (
      <>
        <CodeLines lines={['class Location(BaseModel):', '    lat: float', '    lon: float', '', 'class ScoreRequest(BaseModel):', '    user_id: int', '    location: Location   # a model inside a model']} active={[6]} />
        <div className="flex gap-2">
          <button type="button" className={tabClass(!flag)} onClick={() => setFlag(false)}>complete</button>
          <button type="button" className={tabClass(flag)} onClick={() => setFlag(true)}>lon missing</button>
        </div>
        <Mono className="text-sky-100">{body}</Mono>
        {flag ? (
          <Mono className="text-rose-100">{'422  {"detail":[{"type":"missing","loc":["body","location","lon"],"msg":"Field required", ...}]}'}</Mono>
        ) : (
          <Mono className="text-emerald-100">{'ScoreRequest(user_id=1, location=Location(lat=40.7, lon=-74.0))'}</Mono>
        )}
        <p className="text-[11px] text-gray-400">Validation goes all the way down; <span className="font-mono">loc</span> shows the full path to the problem.</p>
      </>
    );
  }
  if (id === 'constraints') {
    const err = age < 18 ? 'Input should be greater than or equal to 18' : age > 100 ? 'Input should be less than or equal to 100' : null;
    return (
      <>
        <CodeLines lines={['class Applicant(BaseModel):', '    age: int = Field(ge=18, le=100)']} active={[1]} />
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-400 w-24">age = <span className="font-mono text-white">{age}</span></span>
          <input type="range" min={0} max={120} value={age} onChange={(e) => setAge(Number(e.target.value))} className="flex-1 accent-teal-500" />
        </div>
        <div className="relative h-3 rounded-full bg-gray-800 overflow-hidden">
          <div className="absolute inset-y-0 bg-emerald-500/40" style={{ left: `${(18 / 120) * 100}%`, width: `${(82 / 120) * 100}%` }} />
          <motion.div animate={{ left: `${(age / 120) * 100}%` }} className="absolute top-0 w-1 h-3 bg-white" />
        </div>
        <Mono className={err ? 'text-rose-100' : 'text-emerald-100'}>{err ? `422  ${err}` : `Applicant(age=${age})`}</Mono>
        <p className="text-[11px] text-gray-400">Types say “an integer”; constraints say “an integer between 18 and 100”.</p>
      </>
    );
  }
  if (id === 'defaults') {
    const parts = [];
    if (sendThreshold) parts.push('"threshold": 0.8');
    if (sendTopK) parts.push('"top_k": 5');
    return (
      <>
        <CodeLines lines={['class PredictOptions(BaseModel):', '    threshold: float = 0.5', '    top_k: int = 3']} active={[1, 2]} />
        <div className="flex gap-3 text-[11px] text-gray-300">
          <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-teal-500" checked={sendThreshold} onChange={(e) => setSendThreshold(e.target.checked)} /> send threshold</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-teal-500" checked={sendTopK} onChange={(e) => setSendTopK(e.target.checked)} /> send top_k</label>
        </div>
        <Mono className="text-sky-100">{`{${parts.join(', ')}}`}</Mono>
        <Mono className="text-emerald-100">
          PredictOptions(threshold=<span className={sendThreshold ? '' : 'text-amber-200'}>{sendThreshold ? '0.8' : '0.5'}</span>, top_k=<span className={sendTopK ? '' : 'text-amber-200'}>{sendTopK ? '5' : '3'}</span>)
        </Mono>
        <p className="text-[11px] text-gray-400">Omitted fields get their defaults (amber), so clients only send what they want to change.</p>
      </>
    );
  }
  if (id === 'custom') {
    const blank = !text.trim();
    return (
      <>
        <CodeLines
          lines={['class Review(BaseModel):', '    text: str', '', '    @field_validator("text")', '    @classmethod', '    def not_blank(cls, v):', '        if not v.strip():', '            raise ValueError("text must not be blank")', '        return v']}
          active={blank ? [6, 7] : [8]}
        />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="type a review (try only spaces)" className="w-full rounded-lg bg-black/70 border border-gray-700 focus:border-teal-400 outline-none px-2.5 py-1.5 font-mono text-[11px] text-sky-100" />
        <Mono className={blank ? 'text-rose-100' : 'text-emerald-100'}>
          {blank ? '422  {"type":"value_error","loc":["body","text"],"msg":"Value error, text must not be blank", ...}' : `Review(text='${text}')`}
        </Mono>
        <p className="text-[11px] text-gray-400">"   " is a valid str — only your own rule can reject it.</p>
      </>
    );
  }
  return (
    <>
      <CodeLines lines={['from pydantic_settings import BaseSettings', '', 'class Settings(BaseSettings):', '    model_path: str = "models/iris.pkl"', '    debug: bool = False', '', 'settings = Settings()']} active={[6]} />
      <label className="flex items-center gap-2 text-[11px] text-gray-300">
        <input type="checkbox" className="accent-teal-500" checked={flag} onChange={(e) => setFlag(e.target.checked)} />
        set environment variables <span className="font-mono text-teal-200">MODEL_PATH=/srv/models/v2.pkl DEBUG=true</span>
      </label>
      <Mono className="text-emerald-100">{flag ? "Settings(model_path='/srv/models/v2.pkl', debug=True)" : "Settings(model_path='models/iris.pkl', debug=False)"}</Mono>
      <p className="text-[11px] text-gray-400">The same typed validation, applied to configuration from environment variables. (Lives in the separate pydantic-settings package.)</p>
    </>
  );
}

export function BeyondBasicsVisualizer() {
  const [id, setId] = useState('nested');
  return (
    <Frame
      title="Beyond basic types: a preview"
      hint="Five things Pydantic can do besides checking types. Each gets its own section later — here is a quick taste of each."
      footer={
        <div className="flex flex-wrap gap-2">
          {BEYOND.map((b) => (
            <button key={b.id} type="button" className={tabClass(id === b.id)} onClick={() => setId(b.id)}>
              {b.label}
            </button>
          ))}
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div key={id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
          <BeyondDemo id={id} />
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 7. A model is a blueprint – build one                                 */
/* ------------------------------------------------------------------ */

const PALETTE = [
  { name: 'age', type: 'int', json: '35', jsonType: 'number (integer)' },
  { name: 'income', type: 'float', json: '52000.5', jsonType: 'number' },
  { name: 'country', type: 'str', json: '"NP"', jsonType: 'string' },
  { name: 'is_member', type: 'bool', json: 'true', jsonType: 'true / false' },
  { name: 'tags', type: 'List[str]', json: '["sports", "tech"]', jsonType: 'array of strings' },
  { name: 'address', type: 'Address', json: '{"city": "Kathmandu", "zip": "44600"}', jsonType: 'object (another model)' },
];

export function ModelBuilderVisualizer() {
  const [fields, setFields] = useState(['age', 'country', 'is_member']);
  const [optional, setOptional] = useState(['country']);
  const [hover, setHover] = useState(null);
  const chosen = PALETTE.filter((p) => fields.includes(p.name));
  const hasAddress = fields.includes('address');

  const code = [
    'from pydantic import BaseModel',
    ...(fields.includes('tags') ? ['from typing import List'] : []),
    '',
    ...(hasAddress ? ['class Address(BaseModel):', '    city: str', '    zip: str', ''] : []),
    'class Customer(BaseModel):',
    ...(chosen.length
      ? chosen.map((p) => (optional.includes(p.name) ? `    ${p.name}: ${p.type} | None = None` : `    ${p.name}: ${p.type}`))
      : ['    pass']),
  ];
  const offset = code.length - Math.max(chosen.length, 1);
  const hoverLine = hover ? offset + chosen.findIndex((p) => p.name === hover) : -1;

  const toggle = (list, setList, name) => setList(list.includes(name) ? list.filter((x) => x !== name) : [...list, name]);

  return (
    <Frame
      title="A model is a blueprint for your data"
      hint="Add fields from the palette and mark some optional. The class (left) and the JSON shape it expects (right) stay in sync. Hover a field to link them."
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {PALETTE.map((p) => {
            const on = fields.includes(p.name);
            return (
              <div key={p.name} className={`rounded-lg border px-2 py-1.5 transition-all ${on ? 'border-teal-400/60 bg-teal-500/10' : 'border-gray-700'}`}>
                <button type="button" onClick={() => toggle(fields, setFields, p.name)} className="w-full text-left">
                  <span className={`font-mono text-[11px] ${on ? 'text-white' : 'text-gray-400'}`}>{on ? '− ' : '+ '}{p.name}</span>
                  <span className="font-mono text-[10px] text-violet-300 ml-1">{p.type}</span>
                </button>
                {on && (
                  <label className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                    <input type="checkbox" className="accent-amber-400" checked={optional.includes(p.name)} onChange={() => toggle(optional, setOptional, p.name)} />
                    optional
                  </label>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">the blueprint (Python)</p>
            <CodeLines lines={code} active={hoverLine >= 0 ? [hoverLine] : []} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">the shape it expects (JSON)</p>
            <div className="rounded-xl border border-gray-700 bg-black/70 p-3 font-mono text-[11px] leading-relaxed">
              <p className="text-gray-400">{'{'}</p>
              <AnimatePresence>
                {chosen.map((p, i) => (
                  <motion.p
                    key={p.name}
                    layout
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    onMouseEnter={() => setHover(p.name)}
                    onMouseLeave={() => setHover(null)}
                    className={`pl-3 rounded cursor-default ${hover === p.name ? 'bg-teal-500/20' : ''}`}
                  >
                    <span className="text-sky-200">"{p.name}"</span>: <span className="text-emerald-200">{p.json}</span>
                    {i < chosen.length - 1 ? ',' : ''}
                    {optional.includes(p.name) && <span className="text-amber-300/80 font-sans text-[9px] ml-2">may be omitted</span>}
                  </motion.p>
                ))}
              </AnimatePresence>
              <p className="text-gray-400">{'}'}</p>
            </div>
            <div className="mt-2 space-y-0.5">
              {chosen.map((p) => (
                <p key={p.name} onMouseEnter={() => setHover(p.name)} onMouseLeave={() => setHover(null)} className="text-[10px] text-gray-400">
                  <span className="font-mono text-violet-300">{p.type}</span> ⇄ JSON {p.jsonType}
                </p>
              ))}
            </div>
          </div>
        </div>
        <Lesson title="Field names = JSON keys, type hints = expected value types">
          The model declares the “shape”: which keys exist, what type each value must be, and which may be left out. Types can be simple (int, float, str, bool),
          containers (List), or other models (Address) for nested objects.
        </Lesson>
      </div>
    </Frame>
  );
}
