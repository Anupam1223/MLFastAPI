import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Filter, FileJson, BookOpen, Code2, ArrowRight } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines } from './VisualKit';
import { Mono, Pill } from './PydanticKit';

const KeyRow = ({ k, v, tone = 'text-gray-200', strike = false }) => (
  <p className={`pl-3 font-mono text-[11px] ${strike ? 'line-through opacity-50' : ''}`}>
    <span className="text-sky-200">"{k}"</span>: <span className={tone}>{v}</span>
  </p>
);

/* ------------------------------------------------------------------ */
/* 1. The response contract                                               */
/* ------------------------------------------------------------------ */

const INTERNAL = [
  ['label', '"cat"', true],
  ['confidence', '0.95', true],
  ['internal_model_version', '"v1.2.3"', false],
  ['processing_time_ms', '50', false],
];

const CONTRACT_STEPS = [
  { title: 'Your function returns a rich object', text: 'Inside your code you work with everything you need: the prediction plus internal details like the model version and timing.' },
  { title: 'It must adhere to the contract', text: 'With response_model=PredictionResult, the returned data is checked against a predefined contract: label must be a str, confidence a float between 0 and 1.' },
  { title: 'Outgoing data is filtered', text: 'Only fields in the contract leave the server. Internal fields are dropped automatically.' },
  { title: 'The contract is documented', text: 'The same model becomes the documented response schema in /docs, so clients know exactly what they will get.' },
];

export function ResponseContractVisualizer() {
  const [on, setOn] = useState(true);
  const stepper = useStepper(CONTRACT_STEPS.length, 1800);
  const step = stepper.index;

  return (
    <Frame
      title="A response model is a contract for what leaves your API"
      hint="Step through with the response model on, then switch it off and compare what the client receives and what the docs show."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(on)} onClick={() => setOn(true)}>with response_model</button>
            <button type="button" className={tabClass(!on)} onClick={() => setOn(false)}>without</button>
          </div>
          <StepControls stepper={stepper} total={CONTRACT_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Lesson title={`${step + 1}. ${CONTRACT_STEPS[step].title}`}>
          {on ? CONTRACT_STEPS[step].text : step === 0 ? CONTRACT_STEPS[0].text : 'Without a response model there is no contract: nothing is checked, nothing is filtered, and the docs cannot say what the response looks like.'}
        </Lesson>

        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
          <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-violet-300 mb-1">inside your function</p>
            <p className="font-mono text-[11px] text-gray-400">{'{'}</p>
            {INTERNAL.map(([k, v]) => (
              <KeyRow key={k} k={k} v={v} />
            ))}
            <p className="font-mono text-[11px] text-gray-400">{'}'}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500" />
          <motion.div
            animate={{ opacity: on ? 1 : 0.25 }}
            className={`rounded-xl border-2 border-dashed p-2.5 ${on && step >= 1 ? 'border-amber-400 bg-amber-500/10' : 'border-gray-700'}`}
          >
            <p className="text-[9px] uppercase tracking-wider text-amber-300 mb-1">contract: PredictionResult</p>
            <p className="font-mono text-[11px] text-gray-200">label: <span className="text-violet-200">str</span></p>
            <p className="font-mono text-[11px] text-gray-200">confidence: <span className="text-violet-200">float</span> <span className="text-gray-500">0–1</span></p>
            {on && step >= 1 && <p className="text-[10px] text-emerald-300 mt-1">✓ types and range ok</p>}
          </motion.div>
          <ArrowRight className="w-4 h-4 text-gray-500" />
          <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-emerald-300 mb-1">what the client receives</p>
            <p className="font-mono text-[11px] text-gray-400">{'{'}</p>
            <AnimatePresence>
              {INTERNAL.filter(([, , keep]) => keep || !on || step < 2).map(([k, v, keep]) => (
                <motion.div key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 30 }}>
                  <KeyRow k={k} v={v} tone={keep ? 'text-gray-200' : 'text-rose-300'} />
                </motion.div>
              ))}
            </AnimatePresence>
            <p className="font-mono text-[11px] text-gray-400">{'}'}</p>
            {!on && <p className="text-[10px] text-rose-300 mt-1">internal fields leaked</p>}
          </div>
        </div>

        <div className={`rounded-xl border p-3 transition-all ${step >= 3 ? 'border-gray-600' : 'border-gray-800 opacity-40'}`}>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">/docs → POST /predict/ → Responses → 200</p>
          {on ? (
            <p className="font-mono text-[11px] text-cyan-100">PredictionResult {'{'} label*: string, confidence*: number (0 ≤ x ≤ 1) {'}'}</p>
          ) : (
            <p className="font-mono text-[11px] text-gray-400">Successful Response · example value: <span className="text-gray-300">"string"</span> <span className="font-sans text-[10px] text-rose-300 ml-1">(no idea what comes back)</span></p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
          {[
            ['adheres to a contract', ShieldCheck],
            ['filters outgoing data', Filter],
            ['documents the response', BookOpen],
          ].map(([label, Icon]) => (
            <div key={label} className={`rounded-lg border py-1.5 flex items-center justify-center gap-1.5 ${on ? 'border-teal-400/50 text-teal-100' : 'border-gray-800 text-gray-600 line-through'}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Five advantages                                                     */
/* ------------------------------------------------------------------ */

const WHY_TABS = [
  { id: 'validation', label: '1. Data Validation', Icon: ShieldCheck },
  { id: 'filtering', label: '2. Data Filtering', Icon: Filter },
  { id: 'serialization', label: '3. Serialization', Icon: FileJson },
  { id: 'docs', label: '4. Documentation', Icon: BookOpen },
  { id: 'editor', label: '5. Editor Support', Icon: Code2 },
];

const SOURCES = {
  model: { label: 'a Pydantic model instance', code: 'return PredictionResult(label="cat", confidence=0.95)' },
  dict: { label: 'a dictionary', code: 'return {"label": "cat", "confidence": 0.95, "debug": True}' },
  orm: { label: 'a database / ORM object', code: 'row = db.get(Prediction, 7)   # row.label, row.confidence, row.id\nreturn row' },
};

export function WhyResponseModelsVisualizer() {
  const [tab, setTab] = useState('validation');
  const [conf, setConf] = useState(1.2);
  const [filterOn, setFilterOn] = useState(true);
  const [source, setSource] = useState('orm');
  const [typo, setTypo] = useState(false);
  const valid = conf >= 0 && conf <= 1;

  return (
    <Frame
      title="Why define response models?"
      hint="You can return plain dicts or lists — but each tab shows what an explicit response_model adds."
      footer={
        <div className="flex flex-wrap gap-1.5">
          {WHY_TABS.map((t) => (
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
              <Lesson title="Data Validation — a safety check on the way out">
                FastAPI checks that what you return matches the response_model. A bug that produces a malformed value is caught before it reaches a client.
              </Lesson>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-gray-300 w-36">confidence = {conf.toFixed(2)}</span>
                <input type="range" min={-0.2} max={1.5} step={0.05} value={conf} onChange={(e) => setConf(Number(e.target.value))} className="flex-1 accent-teal-500" />
              </div>
              <div className="relative h-3 rounded-full bg-rose-500/30 overflow-hidden">
                <div className="absolute inset-y-0 bg-emerald-500/50" style={{ left: `${(0.2 / 1.7) * 100}%`, width: `${(1 / 1.7) * 100}%` }} />
                <motion.div animate={{ left: `${((conf + 0.2) / 1.7) * 100}%` }} className="absolute top-0 w-1 h-3 bg-white" />
              </div>
              <p className="text-[10px] text-gray-500">green = allowed by <span className="font-mono">Field(ge=0.0, le=1.0)</span></p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-700 p-3 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">without response_model</p>
                  <Pill code={200} text="OK" />
                  <Mono className={valid ? 'text-emerald-100' : 'text-amber-100'}>{`{"label":"cat","confidence":${conf.toFixed(2)}}`}</Mono>
                  {!valid && <p className="text-[10px] text-amber-200">A broken value quietly reaches the client.</p>}
                </div>
                <div className="rounded-xl border border-teal-500/40 p-3 space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">with response_model=PredictionResult</p>
                  {valid ? (
                    <>
                      <Pill code={200} text="OK" />
                      <Mono className="text-emerald-100">{`{"label":"cat","confidence":${conf.toFixed(2)}}`}</Mono>
                    </>
                  ) : (
                    <>
                      <Pill code={500} text="Internal Server Error" />
                      <Mono className="text-rose-100">{`server log:\nResponseValidationError\n  loc: ('response', 'confidence')\n  type: ${conf < 0 ? 'greater_than_equal' : 'less_than_equal'}  input: ${conf.toFixed(2)}`}</Mono>
                      <p className="text-[10px] text-gray-400">It is your server’s bug, so it is a 500 — not something the client sent wrong.</p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'filtering' && (
            <>
              <Lesson title="Data Filtering — only declared fields go out">
                If your function returns more fields than the response_model defines, the extras are removed. Ideal for hiding implementation details or sensitive information.
              </Lesson>
              <label className="flex items-center gap-2 text-[11px] text-gray-300">
                <input type="checkbox" className="accent-teal-500" checked={filterOn} onChange={(e) => setFilterOn(e.target.checked)} />
                <span className="font-mono">response_model=UserPublic</span> <span className="text-gray-500">(fields: username, email)</span>
              </label>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-violet-300 mb-1">user record from the database</p>
                  {[['username', '"ana"'], ['email', '"ana@example.com"'], ['password_hash', '"$2b$12$Kx…"'], ['is_admin', 'true'], ['api_quota_used', '8214']].map(([k, v]) => (
                    <KeyRow key={k} k={k} v={v} />
                  ))}
                </div>
                <Filter className={`w-5 h-5 ${filterOn ? 'text-amber-300' : 'text-gray-700'}`} />
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-emerald-300 mb-1">sent to the client</p>
                  <AnimatePresence>
                    {[['username', '"ana"', true], ['email', '"ana@example.com"', true], ['password_hash', '"$2b$12$Kx…"'], ['is_admin', 'true'], ['api_quota_used', '8214']]
                      .filter(([, , keep]) => keep || !filterOn)
                      .map(([k, v, keep]) => (
                        <motion.div key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 20 }}>
                          <KeyRow k={k} v={v} tone={keep ? 'text-gray-200' : 'text-rose-300'} />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
              {!filterOn && <p className="text-[11px] text-rose-200">The password hash and internal flags just went to every client.</p>}
            </>
          )}

          {tab === 'serialization' && (
            <>
              <Lesson title="Serialization Control — any source, one JSON shape">
                Pydantic converts whatever you return — a model instance, a dict, a database object — into the JSON defined by the response_model.
              </Lesson>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(SOURCES).map(([id, s]) => (
                  <button key={id} type="button" className={tabClass(source === id)} onClick={() => setSource(id)}>
                    {s.label}
                  </button>
                ))}
              </div>
              <CodeLines lines={['@app.get("/predictions/7", response_model=PredictionResult)', 'async def get_prediction():', ...SOURCES[source].code.split('\n').map((l) => `    ${l}`)]} active={[2, 3].slice(0, SOURCES[source].code.split('\n').length)} />
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-400">JSON response:</span>
                <motion.span key={source} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-mono text-[12px] text-emerald-200 rounded bg-emerald-500/10 border border-emerald-400/40 px-2 py-1">
                  {'{"label":"cat","confidence":0.95}'}
                </motion.span>
              </div>
              <p className="text-[11px] text-gray-400">
                {source === 'orm'
                  ? 'Fields are read from the object’s attributes (row.label, row.confidence); row.id is not in the model, so it is left out.'
                  : source === 'dict'
                    ? 'Keys are matched to fields; the extra "debug" key is dropped.'
                    : 'Already the right shape — it is serialized directly.'}
              </p>
            </>
          )}

          {tab === 'docs' && (
            <>
              <Lesson title="Automatic Documentation">
                FastAPI uses the response_model to generate the schema of the expected response in /docs. Consumers can see the exact shape without reading your code.
              </Lesson>
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 text-[11px] space-y-2">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-2 py-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">POST</span>
                  <span className="font-mono text-white">/predict/</span>
                  <span className="text-gray-400">Make Prediction</span>
                </div>
                <p className="text-gray-400">Responses</p>
                <div className="grid grid-cols-[3rem_1fr] gap-2">
                  <span className="font-mono text-white">200</span>
                  <div>
                    <p className="text-gray-300">Successful Response · application/json</p>
                    <Mono className="text-cyan-100 mt-1">{'{\n  "label": "string",\n  "confidence": 0\n}'}</Mono>
                    <p className="text-gray-500 mt-1">Schema: PredictionResult — label* string · “The predicted class label.” · confidence* number [0, 1]</p>
                  </div>
                  <span className="font-mono text-white">422</span>
                  <p className="text-gray-300">Validation Error (documented automatically)</p>
                </div>
              </div>
            </>
          )}

          {tab === 'editor' && (
            <>
              <Lesson title="Editor Support">
                Explicit models give your editor real types: autocompletion while you build the response, and warnings when a field name or type is wrong.
              </Lesson>
              <div className="flex gap-2">
                <button type="button" className={tabClass(!typo)} onClick={() => setTypo(false)}>autocomplete</button>
                <button type="button" className={tabClass(typo)} onClick={() => setTypo(true)}>make a mistake</button>
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 font-mono text-[12px] space-y-1">
                {typo ? (
                  <>
                    <p className="text-gray-200">
                      return PredictionResult(label="cat", <span className="underline decoration-wavy decoration-rose-400 text-rose-200">confidense</span>=0.95)
                    </p>
                    <div className="inline-block rounded border border-rose-400/50 bg-gray-900 px-2 py-1 text-[10px] text-rose-200">No parameter named "confidense"</div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-200">return PredictionResult(<span className="animate-pulse">|</span></p>
                    <div className="ml-8 w-64 rounded border border-gray-700 bg-gray-900 text-[10px] p-1.5">
                      <p className="text-teal-100">(*, label: str, confidence: float) → PredictionResult</p>
                      <p className="text-gray-500 mt-0.5">label: The predicted class label.</p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Defining PredictionResult with Field                               */
/* ------------------------------------------------------------------ */

const PR_CODE = [
  'from pydantic import BaseModel, Field',
  '',
  'class PredictionResult(BaseModel):',
  '    label: str = Field(..., description="The predicted class label.")',
  '    confidence: float = Field(..., ge=0.0, le=1.0, description="The prediction confidence score (0.0 to 1.0).")',
  '',
  "# Example internal data structure our function might produce",
  "# Note it has an extra 'internal_model_version' field",
  'internal_data = {',
  '    "label": "cat",',
  '    "confidence": 0.95,',
  '    "internal_model_version": "v1.2.3"',
  '}',
];

const TOKENS = [
  { id: 'dots', text: '...', note: 'The Ellipsis (...) as the first argument means “no default — this field is required”. It is the same as writing no default at all, but lets you add Field options.' },
  { id: 'ge', text: 'ge=0.0', note: 'ge = greater than or equal to. confidence must be ≥ 0.0.' },
  { id: 'le', text: 'le=1.0', note: 'le = less than or equal to. confidence must be ≤ 1.0. Together: a probability-like score.' },
  { id: 'desc', text: 'description=…', note: 'Human-readable text that appears in the generated schema and the /docs page. No effect on validation.' },
];

export function PredictionResultVisualizer() {
  const [token, setToken] = useState('dots');
  const [conf, setConf] = useState(0.95);
  const t = TOKENS.find((x) => x.id === token);
  const ok = conf >= 0 && conf <= 1;

  return (
    <Frame
      title="PredictionResult: a model for the output"
      hint="Defining a response model is the same as defining a request model. Click the pieces of Field(...) and test the confidence range."
    >
      <div className="space-y-3">
        <CodeLines lines={PR_CODE} active={token === 'desc' ? [3, 4] : token === 'dots' ? [3, 4] : [4]} title="models.py" />

        <div className="rounded-xl border border-gray-700 bg-black/70 px-3 py-2.5 font-mono text-[12px] text-gray-300 flex flex-wrap items-center gap-1">
          confidence: float = Field(
          {TOKENS.map((tk, i) => (
            <React.Fragment key={tk.id}>
              <button type="button" onClick={() => setToken(tk.id)} className={`rounded px-1 ${token === tk.id ? 'bg-teal-500/30 text-white' : 'text-amber-200 hover:bg-gray-800'}`}>
                {tk.text}
              </button>
              {i < TOKENS.length - 1 && ','}
            </React.Fragment>
          ))}
          )
        </div>
        <Lesson title={t.text}>{t.note}</Lesson>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-700 p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">try a confidence value</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-white w-12">{conf.toFixed(2)}</span>
              <input type="range" min={-0.3} max={1.3} step={0.05} value={conf} onChange={(e) => setConf(Number(e.target.value))} className="flex-1 accent-teal-500" />
            </div>
            <div className="relative h-6 rounded bg-gray-900 border border-gray-800">
              <div className="absolute inset-y-0 bg-emerald-500/25 border-x border-emerald-400" style={{ left: `${(0.3 / 1.6) * 100}%`, width: `${(1 / 1.6) * 100}%` }} />
              <span className="absolute -bottom-4 text-[9px] text-emerald-300" style={{ left: `${(0.3 / 1.6) * 100}%` }}>0.0</span>
              <span className="absolute -bottom-4 text-[9px] text-emerald-300" style={{ left: `${(1.3 / 1.6) * 100 - 3}%` }}>1.0</span>
              <motion.div animate={{ left: `${((conf + 0.3) / 1.6) * 100}%` }} className={`absolute top-0.5 w-2 h-5 -ml-1 rounded ${ok ? 'bg-emerald-300' : 'bg-rose-400'}`} />
            </div>
            <p className={`pt-3 text-[11px] font-mono ${ok ? 'text-emerald-200' : 'text-rose-200'}`}>
              {ok ? `✓ PredictionResult(label='cat', confidence=${conf.toFixed(2)})` : `✗ ${conf < 0 ? 'greater_than_equal' : 'less_than_equal'} — outside [0.0, 1.0]`}
            </p>
          </div>
          <div className="rounded-xl border border-gray-700 p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">generated schema (what /docs shows)</p>
            <p className="font-mono text-[11px] text-white">PredictionResult</p>
            <p className={`font-mono text-[11px] pl-3 ${token === 'desc' || token === 'dots' ? 'text-teal-100' : 'text-gray-300'}`}>
              label<span className="text-rose-400">*</span> string <span className="font-sans text-[10px] text-gray-400">— The predicted class label.</span>
            </p>
            <p className="font-mono text-[11px] pl-3 text-gray-300">
              confidence<span className="text-rose-400">*</span> number{' '}
              <span className={token === 'ge' || token === 'le' ? 'text-teal-200' : 'text-gray-400'}>minimum: 0 · maximum: 1</span>
            </p>
            <p className={`pl-6 text-[10px] ${token === 'desc' ? 'text-teal-200' : 'text-gray-400'}`}>The prediction confidence score (0.0 to 1.0).</p>
            <p className="text-[10px] text-gray-500 pt-1"><span className="text-rose-400">*</span> required — from the <span className="font-mono">...</span></p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 4. response_model in action: take → validate → filter → serialize     */
/* ------------------------------------------------------------------ */

const FILTER_STEPS = [
  { title: 'Takes the returned dictionary', text: 'make_prediction returns prediction_output — a dict with more fields than PredictionResult.' },
  { title: 'Validates against PredictionResult', text: 'Is label a string? Is confidence a float between 0.0 and 1.0? If validation fails, it raises an internal server error.' },
  { title: 'Filters the data', text: 'Only the fields defined in PredictionResult (label and confidence) are kept. internal_model_version and processing_time_ms are discarded.' },
  { title: 'Serializes to JSON', text: 'The filtered data becomes the JSON response sent to the client.' },
];

export function ResponseFilterVisualizer() {
  const [labelNum, setLabelNum] = useState(false);
  const [conf, setConf] = useState(0.95);
  const [extras, setExtras] = useState(true);
  const stepper = useStepper(FILTER_STEPS.length, 1700);
  const step = stepper.index;

  const labelVal = labelNum ? '7' : '"cat"';
  const confOk = conf >= 0 && conf <= 1;
  const valid = !labelNum && confOk;
  const fields = [
    ['label', labelVal, true],
    ['confidence', conf.toFixed(2).replace(/0$/, ''), true],
    ...(extras ? [['internal_model_version', '"v1.2.3"', false], ['processing_time_ms', '50', false]] : []),
  ];
  const stopped = step >= 1 && !valid;

  const code = [
    '@app.post("/predict/", response_model=PredictionResult)',
    'async def make_prediction(input_data: dict): # Assuming input validation elsewhere',
    '    # ... process input_data and run ML model ...',
    '    # Function returns a dictionary with more fields than PredictionResult',
    '    prediction_output = {',
    `        "label": ${labelVal},`,
    `        "confidence": ${conf.toFixed(2).replace(/0$/, '')},`,
    ...(extras ? ['        "internal_model_version": "v1.2.3",', '        "processing_time_ms": 50'] : []),
    '    }',
    '    return prediction_output',
  ];

  return (
    <Frame
      title="What FastAPI does with the returned dict"
      hint="Step through the four stages. Then break the output — a numeric label or confidence above 1 — and watch validation stop it."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={FILTER_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-300">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="accent-rose-400" checked={labelNum} onChange={(e) => setLabelNum(e.target.checked)} /> label = 7 (a number)
          </label>
          <label className="flex items-center gap-2">
            confidence
            <input type="range" min={0} max={1.4} step={0.05} value={conf} onChange={(e) => setConf(Number(e.target.value))} className="w-28 accent-teal-500" />
            <span className="font-mono">{conf.toFixed(2)}</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" className="accent-teal-500" checked={extras} onChange={(e) => setExtras(e.target.checked)} /> extra internal fields
          </label>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {FILTER_STEPS.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => stepper.pick(i)}
              className={`rounded-lg border px-1.5 py-1.5 text-[10px] transition-all ${i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'} ${stopped && i > 1 ? 'opacity-30' : ''}`}
            >
              <span className="font-bold">{i + 1}.</span> {s.title}
            </button>
          ))}
        </div>

        <Lesson title={`${step + 1}. ${FILTER_STEPS[step].title}`}>{FILTER_STEPS[step].text}</Lesson>

        <div className="grid md:grid-cols-[1.1fr_1fr] gap-3">
          <CodeLines lines={code} active={step === 0 ? [code.length - 1] : [0]} title="main.py" />
          <div className="space-y-2">
            <div className="rounded-xl border border-gray-700 bg-gray-950 p-2.5">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">prediction_output</p>
              <AnimatePresence>
                {fields
                  .filter(([, , keep]) => keep || step < 2 || stopped)
                  .map(([k, v, keep]) => {
                    const bad = step >= 1 && ((k === 'label' && labelNum) || (k === 'confidence' && !confOk));
                    const good = step >= 1 && keep && !bad;
                    return (
                      <motion.div key={k} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 40, transition: { duration: 0.4 } }} className="flex items-center gap-2">
                        <KeyRow k={k} v={v} tone={bad ? 'text-rose-300' : 'text-gray-200'} />
                        {bad && <span className="text-[10px] text-rose-300">✗</span>}
                        {good && <span className="text-[10px] text-emerald-300">✓</span>}
                        {step === 1 && !keep && !stopped && <span className="text-[9px] text-gray-500">not in model</span>}
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>

            {stopped ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-rose-400/50 bg-rose-500/10 p-2.5 space-y-1">
                <Pill code={500} text="Internal Server Error" />
                <p className="text-[11px] text-gray-300">
                  {labelNum ? 'label must be a string (string_type).' : 'confidence must be ≤ 1.0 (less_than_equal).'} The response does not match the contract, so FastAPI refuses to send it.
                </p>
              </motion.div>
            ) : (
              step >= 3 && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                  <Pill code={200} text="OK" />
                  <Mono className="text-emerald-100">{`{\n  "label": "cat",\n  "confidence": ${conf.toFixed(2).replace(/0$/, '')}\n}`}</Mono>
                  <p className="text-[10px] text-gray-400">The client will receive exactly this.</p>
                </motion.div>
              )
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Rich inside, clean outside                                          */
/* ------------------------------------------------------------------ */

const EVOLUTION = [
  { version: 'v1.2.3', add: [] },
  { version: 'v1.3.0', add: [['feature_vector', '[0.12, 0.98, …]']] },
  { version: 'v1.4.0', add: [['feature_vector', '[0.12, 0.98, …]'], ['cache_hit', 'true']] },
  { version: 'v2.0.0', add: [['feature_vector', '[0.12, 0.98, …]'], ['cache_hit', 'true'], ['gpu_id', '3'], ['top5', '["cat","lynx",…]']] },
];

export function CleanContractVisualizer() {
  const stepper = useStepper(EVOLUTION.length, 1800);
  const e = EVOLUTION[stepper.index];
  const internal = [['label', '"cat"'], ['confidence', '0.95'], ['internal_model_version', `"${e.version}"`], ['processing_time_ms', '50'], ...e.add];

  return (
    <Frame
      title="Rich objects inside, a stable contract outside"
      hint="Step through releases of your service. The internal object keeps growing; see what each client receives with and without a response model."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={EVOLUTION.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {EVOLUTION.map((x, i) => (
            <span key={x.version} className={`px-2 py-0.5 rounded-full font-mono text-[10px] border ${i === stepper.index ? 'border-teal-400 bg-teal-500/15 text-white' : i < stepper.index ? 'border-gray-600 text-gray-400' : 'border-gray-800 text-gray-600'}`}>
              {x.version}
            </span>
          ))}
          <span className="text-[10px] text-gray-500 ml-1">release</span>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-violet-300 mb-1">internal object ({internal.length} fields)</p>
            <AnimatePresence>
              {internal.map(([k, v]) => (
                <motion.div key={k} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                  <KeyRow k={k} v={v} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="rounded-xl border border-rose-400/40 p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-rose-300 mb-1">client sees — no response_model</p>
            <AnimatePresence>
              {internal.map(([k, v]) => (
                <motion.div key={k} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <KeyRow k={k} v={v} tone={k === 'label' || k === 'confidence' ? 'text-gray-200' : 'text-rose-300'} />
                </motion.div>
              ))}
            </AnimatePresence>
            <p className="text-[10px] text-rose-200 mt-1">Payload grows every release; clients start depending on internals you meant to change.</p>
          </div>
          <div className="rounded-xl border border-emerald-400/40 p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-emerald-300 mb-1">client sees — response_model</p>
            <KeyRow k="label" v='"cat"' />
            <KeyRow k="confidence" v="0.95" />
            <p className="text-[10px] text-emerald-200 mt-1">Identical in every release. Refactor freely inside.</p>
          </div>
        </div>

        <Lesson title="A clean API contract">
          Work with richer internal objects in your application logic, but expose only the necessary fields externally. Adding a field to the public
          response becomes a deliberate change to PredictionResult — not an accident.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 6. exclude_unset / exclude_defaults / exclude_none playground          */
/* ------------------------------------------------------------------ */

const ITEM_FIELDS = [
  { name: 'name', def: undefined, fixed: '"Thingamajig"' },
  { name: 'description', def: null, options: [['not returned', undefined], ['None', null], ['"A small gadget"', 'A small gadget']] },
  { name: 'price', def: undefined, fixed: '10.5' },
  { name: 'tax', def: 0.0, options: [['not returned', undefined], ['0.0', 0.0], ['8.5', 8.5]] },
];

const fmt = (v) => (v === null ? 'null' : typeof v === 'string' ? `"${v}"` : Number.isInteger(v) ? `${v}.0` : String(v));

export function computeItem(values, flags) {
  return ITEM_FIELDS.map((f) => {
    if (f.fixed) return { name: f.name, out: f.fixed, reason: null };
    const set = values[f.name] !== undefined;
    const value = set ? values[f.name] : f.def;
    if (flags.unset && !set) return { name: f.name, out: null, reason: 'exclude_unset: not set in the returned data' };
    if (flags.defaults && value === f.def) return { name: f.name, out: null, reason: `exclude_defaults: equals its default (${fmt(f.def)})` };
    if (flags.none && value === null) return { name: f.name, out: null, reason: 'exclude_none: value is None' };
    return { name: f.name, out: fmt(value), reason: set ? null : 'filled in from the default' };
  });
}

const FLAG_INFO = [
  ['unset', 'response_model_exclude_unset=True', 'Drops fields that were not explicitly set in the returned data (they would only show their default).'],
  ['defaults', 'response_model_exclude_defaults=True', 'Drops fields whose value equals the default — even if you set them explicitly.'],
  ['none', 'response_model_exclude_none=True', 'Drops fields whose value is None.'],
];

export function ExcludeFlagsVisualizer() {
  const [values, setValues] = useState({ description: undefined, tax: 0.0 });
  const [flags, setFlags] = useState({ unset: true, defaults: false, none: false });
  const rows = computeItem(values, flags);
  const kept = rows.filter((r) => r.out !== null);

  return (
    <Frame
      title="Three switches for leaner responses"
      hint="Choose what your function returns for description and tax, then flip the three flags. Each field shows whether it survives, and why."
    >
      <div className="space-y-3">
        <CodeLines
          lines={['class Item(BaseModel):', '    name: str', '    description: str | None = None', '    price: float', '    tax: float | None = 0.0 # Default tax is 0.0']}
          active={[2, 4]}
          title="the response model"
        />

        <div className="grid sm:grid-cols-2 gap-2">
          {ITEM_FIELDS.filter((f) => f.options).map((f) => (
            <div key={f.name} className="rounded-lg border border-gray-700 p-2">
              <p className="font-mono text-[11px] text-white mb-1">returned {f.name}</p>
              <div className="flex flex-wrap gap-1">
                {f.options.map(([label, v]) => (
                  <button key={label} type="button" className={`${tabClass(values[f.name] === v)} !py-0.5 font-mono`} onClick={() => setValues((cur) => ({ ...cur, [f.name]: v }))}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {FLAG_INFO.map(([id, label, note]) => (
            <label key={id} className={`flex items-start gap-2 rounded-lg border px-2 py-1.5 text-[11px] cursor-pointer ${flags[id] ? 'border-teal-400/50 bg-teal-500/10' : 'border-gray-800'}`}>
              <input type="checkbox" className="accent-teal-500 mt-0.5" checked={flags[id]} onChange={(e) => setFlags((cur) => ({ ...cur, [id]: e.target.checked }))} />
              <span>
                <span className="font-mono text-teal-100">{label}</span>
                <span className="block text-gray-400">{note}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-700 bg-gray-950 p-2.5 space-y-1">
            <p className="text-[9px] uppercase tracking-wider text-gray-500">field by field</p>
            {rows.map((r) => (
              <div key={r.name} className="flex items-start gap-2 text-[11px]">
                <span className={`font-mono w-20 ${r.out === null ? 'text-gray-500 line-through' : 'text-white'}`}>{r.name}</span>
                <span className={r.out === null ? 'text-rose-200' : r.reason ? 'text-amber-200' : 'text-emerald-200'}>
                  {r.out === null ? `removed — ${r.reason}` : r.reason ? `kept (${r.reason})` : 'kept'}
                </span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">JSON response</p>
            <div className="rounded-xl border border-emerald-400/40 bg-black/70 p-2.5 font-mono text-[11px]">
              <p className="text-gray-400">{'{'}</p>
              <AnimatePresence>
                {kept.map((r, i) => (
                  <motion.p key={r.name} layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="pl-3">
                    <span className="text-sky-200">"{r.name}"</span>: <span className="text-emerald-200">{r.out}</span>
                    {i < kept.length - 1 ? ',' : ''}
                  </motion.p>
                ))}
              </AnimatePresence>
              <p className="text-gray-400">{'}'}</p>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 7. The course's Item example, step by step                            */
/* ------------------------------------------------------------------ */

const ITEM_STEPS = [
  { flags: { unset: false, defaults: false, none: false }, deco: '@app.get("/items/{item_id}", response_model=Item)', title: 'No flags', text: 'Every field in Item is sent, including description: null and the default-valued tax: 0.0.' },
  { flags: { unset: false, defaults: false, none: true }, deco: '@app.get("/items/{item_id}", response_model=Item, response_model_exclude_none=True)', title: 'response_model_exclude_none=True', text: 'description is None, so it is omitted.' },
  { flags: { unset: false, defaults: true, none: true }, deco: '@app.get("/items/{item_id}", response_model=Item, response_model_exclude_none=True,\n         response_model_exclude_defaults=True)', title: '+ response_model_exclude_defaults=True', text: 'tax is 0.0, which matches its default, so it is omitted too. (description would also qualify: None is its default.)' },
];

export function ItemExampleVisualizer() {
  const stepper = useStepper(ITEM_STEPS.length, 2000);
  const s = ITEM_STEPS[stepper.index];
  const rows = computeItem({ description: null, tax: 0.0 }, s.flags);
  const kept = rows.filter((r) => r.out !== null);

  return (
    <Frame
      title="The Item example: shrinking the payload"
      hint="The function always returns the same dict. Step through adding the flags and watch the JSON get leaner."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={ITEM_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Lesson title={`${stepper.index + 1}. ${s.title}`}>{s.text}</Lesson>
        <CodeLines
          lines={[
            ...s.deco.split('\n'),
            'async def read_item(item_id: str):',
            '    # Imagine fetching an item that has no description',
            '    item_data = {"name": "Thingamajig", "price": 10.50, "description": None, "tax": 0.0}',
            '    return item_data',
          ]}
          active={s.deco.split('\n').map((_, i) => i)}
          title="main.py"
        />
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div className="rounded-xl border border-violet-400/40 bg-violet-500/10 p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-violet-300 mb-1">item_data (returned)</p>
            <KeyRow k="name" v='"Thingamajig"' />
            <KeyRow k="price" v="10.5" />
            <KeyRow k="description" v="None" />
            <KeyRow k="tax" v="0.0" />
          </div>
          <ArrowRight className="w-5 h-5 text-amber-300" />
          <div className="rounded-xl border border-emerald-400/40 bg-black/70 p-2.5 font-mono text-[11px]">
            <p className="text-[9px] font-sans uppercase tracking-wider text-emerald-300 mb-1">JSON response</p>
            <p className="text-gray-400">{'{'}</p>
            <AnimatePresence>
              {kept.map((r, i) => (
                <motion.p key={r.name} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: 30, transition: { duration: 0.4 } }} className="pl-3">
                  <span className="text-sky-200">"{r.name}"</span>: <span className="text-emerald-200">{r.out}</span>
                  {i < kept.length - 1 ? ',' : ''}
                </motion.p>
              ))}
            </AnimatePresence>
            <p className="text-gray-400">{'}'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span>payload size:</span>
          <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
            <motion.div animate={{ width: `${(kept.length / 4) * 100}%` }} className="h-full bg-teal-400" />
          </div>
          <span className="font-mono">{kept.length}/4 fields</span>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Union of response models                                           */
/* ------------------------------------------------------------------ */

const UNION_CODE = [
  'from typing import Union',
  '',
  'class SuccessResponse(BaseModel):',
  '    message: str',
  '    result_id: int',
  '',
  'class ErrorResponse(BaseModel):',
  '    error_code: int',
  '    detail: str',
  '',
  '@app.post("/process/", response_model=Union[SuccessResponse, ErrorResponse])',
  'async def process_data(data: dict):',
  '    try:',
  '        # ... process data ...',
  '        if success:',
  '            return SuccessResponse(message="Processing successful", result_id=123)',
  '        else:',
  '            # This would typically be handled via HTTPException,',
  '            # but illustrates returning a different model structure.',
  '            return ErrorResponse(error_code=5001, detail="Processing failed")',
  '    except Exception as e:',
  '        return ErrorResponse(error_code=9999, detail=str(e))',
];

const OUTCOMES = {
  success: { label: 'processing succeeds', lines: [12, 14, 15], model: 'SuccessResponse', body: '{"message":"Processing successful","result_id":123}' },
  failed: { label: 'processing fails', lines: [12, 14, 16, 19], model: 'ErrorResponse', body: '{"error_code":5001,"detail":"Processing failed"}' },
  crash: { label: 'an exception is raised', lines: [12, 20, 21], model: 'ErrorResponse', body: '{"error_code":9999,"detail":"division by zero"}' },
};

export function UnionResponseVisualizer() {
  const [outcome, setOutcome] = useState('success');
  const [style, setStyle] = useState('union');
  const o = OUTCOMES[outcome];
  const httpExc = style === 'exception' && outcome !== 'success';

  return (
    <Frame
      title="One endpoint, two possible response shapes"
      hint="Pick what happens during processing. See which branch runs, which model the result matches, and what the client actually gets — then compare with HTTPException."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(style === 'union')} onClick={() => setStyle('union')}>return ErrorResponse (as shown)</button>
          <button type="button" className={tabClass(style === 'exception')} onClick={() => setStyle('exception')}>raise HTTPException (preferred)</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(OUTCOMES).map(([id, x]) => (
            <button key={id} type="button" className={tabClass(outcome === id)} onClick={() => setOutcome(id)}>
              {x.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-[1.3fr_1fr] gap-3">
          <div className="max-h-[24rem] overflow-auto custom-scroll rounded-xl">
            <CodeLines lines={UNION_CODE} active={httpExc ? [12] : o.lines} title="main.py" />
          </div>
          <div className="space-y-2">
            {httpExc ? (
              <>
                <Mono className="text-amber-100">{outcome === 'failed' ? 'raise HTTPException(status_code=500,\n                    detail="Processing failed")' : 'raise HTTPException(status_code=500,\n                    detail=str(e))'}</Mono>
                <Pill code={500} text="Internal Server Error" />
                <Mono className="text-rose-100">{outcome === 'failed' ? '{"detail":"Processing failed"}' : '{"detail":"division by zero"}'}</Mono>
                <p className="text-[11px] text-gray-400">The status code itself says “failed”. Clients, proxies, monitoring and retry logic all understand it — and the success path keeps a single clean model.</p>
              </>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">match the returned object against the Union</p>
                {['SuccessResponse', 'ErrorResponse'].map((m) => (
                  <motion.div
                    key={m}
                    animate={{ scale: o.model === m ? 1.03 : 1 }}
                    className={`rounded-lg border px-2.5 py-1.5 font-mono text-[11px] flex items-center justify-between ${o.model === m ? 'border-emerald-400/60 bg-emerald-500/10 text-white' : 'border-gray-800 text-gray-500'}`}
                  >
                    {m}
                    <span>{o.model === m ? '✓ matches' : '—'}</span>
                  </motion.div>
                ))}
                <div className="flex items-center gap-2">
                  <Pill code={200} text="OK" />
                  {outcome !== 'success' && <span className="text-[10px] text-amber-200">still 200, even though it failed!</span>}
                </div>
                <Mono className={outcome === 'success' ? 'text-emerald-100' : 'text-amber-100'}>{o.body}</Mono>
                {outcome !== 'success' && (
                  <p className="text-[11px] text-gray-400">Returning an error model from the success path sends HTTP 200. Clients must inspect the body to notice the failure.</p>
                )}
              </>
            )}
            <div className="rounded-lg border border-gray-700 p-2">
              <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">/docs response schema for 200</p>
              <p className="font-mono text-[10px] text-cyan-100">anyOf: [SuccessResponse, ErrorResponse]</p>
              <p className="text-[10px] text-gray-500">Both possibilities are documented.</p>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}
