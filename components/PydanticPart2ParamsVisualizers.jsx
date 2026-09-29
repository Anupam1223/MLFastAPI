import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, MinusCircle, Database, Shield, Code2 } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines } from './VisualKit';
import { Mono, Pill, coerce } from './PydanticKit';

const Check = ({ status, children }) => (
  <div className="flex items-center gap-2 text-[11px]">
    {status === 'pass' ? <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" /> : status === 'fail' ? <XCircle className="w-4 h-4 text-rose-300 shrink-0" /> : <MinusCircle className="w-4 h-4 text-gray-600 shrink-0" />}
    <span className={status === 'fail' ? 'text-rose-100' : status === 'na' ? 'text-gray-500' : 'text-gray-200'}>{children}</span>
  </div>
);

const err422 = (items) => JSON.stringify({ detail: items }, null, 2);

/* ------------------------------------------------------------------ */
/* 9. Two kinds of URL parameters                                        */
/* ------------------------------------------------------------------ */

const MODELS = ['resnet50', 'bert-base', 'linear-reg-v1'];

const SORT_ITEMS = [
  { id: 'which', text: 'which model to run', answer: 'path' },
  { id: 'page', text: 'how many results per page', answer: 'query' },
  { id: 'user', text: 'which user’s profile', answer: 'path' },
  { id: 'sort', text: 'sort order (newest first)', answer: 'query' },
  { id: 'filter', text: 'only models for “nlp”', answer: 'query' },
];

export function UrlAnatomyVisualizer() {
  const [model, setModel] = useState('bert-base');
  const [limit, setLimit] = useState(10);
  const [focus, setFocus] = useState('model_id');
  const [answers, setAnswers] = useState({});

  const part = (id, text, tone) => (
    <button type="button" onClick={() => setFocus(id)} className={`rounded px-0.5 ${tone} ${focus === id ? 'ring-2 ring-white/70' : ''}`}>
      {text}
    </button>
  );

  return (
    <Frame
      title="Path parameters vs query parameters"
      hint="Pick a model and a limit. The same information can travel in the path or in the query string; click a coloured part to see which function argument receives it."
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {MODELS.map((m) => (
            <button key={m} type="button" className={`${tabClass(model === m)} font-mono`} onClick={() => setModel(m)}>
              {m}
            </button>
          ))}
          <span className="ml-2 text-[11px] text-gray-400">limit</span>
          <input type="range" min={1} max={50} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-28 accent-teal-500" />
          <span className="font-mono text-[11px] text-white">{limit}</span>
        </div>

        <div className="rounded-xl border border-amber-400/40 p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-amber-300">path parameter — part of the path itself</p>
          <p className="font-mono text-sm text-gray-300">
            /models/{part('model_id', model, 'bg-amber-500/25 text-amber-100')}/predict
          </p>
          <CodeLines lines={['@app.post("/models/{model_id}/predict")', 'async def predict(model_id: str): ...']} active={focus === 'model_id' ? [0, 1] : []} />
        </div>

        <div className="rounded-xl border border-cyan-400/40 p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-cyan-300">query parameters — after ?, separated by &</p>
          <p className="font-mono text-sm text-gray-300">
            /predictions?{part('q_model', `model_id=${model}`, 'bg-cyan-500/25 text-cyan-100')}&amp;{part('q_limit', `limit=${limit}`, 'bg-cyan-500/25 text-cyan-100')}
          </p>
          <CodeLines lines={['@app.get("/predictions")', 'async def list_predictions(model_id: str, limit: int = 10): ...']} active={focus === 'q_model' || focus === 'q_limit' ? [1] : []} />
          <p className="text-[10px] text-gray-500">
            {focus === 'q_limit' ? `limit arrives as the text "${limit}" and becomes the int ${limit} thanks to the type hint.` : 'model_id and limit are not in the path string, so FastAPI reads them from the query.'}
          </p>
        </div>

        <div className="rounded-xl border border-gray-700 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">quick check — path or query?</p>
          <div className="space-y-1">
            {SORT_ITEMS.map((it) => {
              const a = answers[it.id];
              return (
                <div key={it.id} className="flex items-center gap-2 text-[11px]">
                  <span className="flex-1 text-gray-200">{it.text}</span>
                  {['path', 'query'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers((cur) => ({ ...cur, [it.id]: opt }))}
                      className={`px-2 py-0.5 rounded border text-[10px] ${
                        a === opt ? (opt === it.answer ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100' : 'border-rose-400 bg-rose-500/20 text-rose-100') : 'border-gray-700 text-gray-400 hover:bg-gray-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-500 mt-2">Rule of thumb: path identifies a specific resource; query filters, sorts, or paginates.</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Path parameter lookup with 404                                    */
/* ------------------------------------------------------------------ */

const MODEL_DB = {
  resnet50: { framework: 'PyTorch', task: 'Image Classification' },
  'bert-base-uncased': { framework: 'Transformers', task: 'NLP' },
  'linear-reg-v1': { framework: 'Scikit-learn', task: 'Regression' },
};

const LOOKUP_INPUTS = ['resnet50', 'bert-base-uncased', 'linear-reg-v1', 'gpt-9', '42'];

const LOOKUP_STAGES = ['Extract model_id from the path', 'Validate with the type hint', 'Look it up in model_db', 'Respond'];

function LookupRun({ value, setValue, hint, setHint }) {
  const stepper = useStepper(LOOKUP_STAGES.length, 1300);
  const step = stepper.index;
  const conv = hint === 'int' ? coerce('int', value) : { ok: true, value };
  const key = conv.ok ? String(conv.value) : null;
  const found = conv.ok && Object.prototype.hasOwnProperty.call(MODEL_DB, key);

  const code = [
    'from fastapi import FastAPI, Path, HTTPException',
    '',
    '@app.get("/models/{model_id}")',
    `async def get_model_metadata(model_id: ${hint}):`,
    '    if model_id not in model_db:',
    `        raise HTTPException(status_code=404, detail=f"Model ID '{model_id}' not found.")`,
    '    return model_db[model_id]',
  ];
  const active = step === 0 ? [2] : step === 1 ? [3] : step === 2 ? [4] : conv.ok ? (found ? [6] : [5]) : [];

  return (
    <Frame
      title="GET /models/{model_id}"
      hint="Pick a model id and step through. Then switch the type hint to int and try again."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(hint === 'str')} onClick={() => setHint('str')}>model_id: str</button>
            <button type="button" className={tabClass(hint === 'int')} onClick={() => setHint('int')}>model_id: int</button>
          </div>
          <StepControls stepper={stepper} total={LOOKUP_STAGES.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] text-gray-500">/models/</span>
          {LOOKUP_INPUTS.map((v) => (
            <button key={v} type="button" className={`${tabClass(v === value)} font-mono`} onClick={() => setValue(v)}>
              {v}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {LOOKUP_STAGES.map((s, i) => (
            <div key={s} className={`rounded-lg border px-1.5 py-1.5 text-[10px] text-center transition-all ${i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'} ${!conv.ok && i === 2 ? 'opacity-30' : ''}`}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-3">
          <CodeLines lines={code} active={active} title="main.py" />
          <div className="space-y-2">
            {step >= 0 && (
              <div className="rounded-lg border border-gray-700 p-2 font-mono text-[11px]">
                <span className="text-gray-500">raw path segment: </span>
                <span className="text-amber-200">"{value}"</span>
              </div>
            )}
            {step >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-lg border p-2 font-mono text-[11px] ${conv.ok ? 'border-emerald-400/50 text-emerald-200' : 'border-rose-400/50 text-rose-200'}`}>
                {hint === 'str' ? `model_id = "${value}"  (already a string)` : conv.ok ? `model_id = ${conv.value}  (converted to int)` : '✗ cannot convert to int'}
              </motion.div>
            )}
          </div>
        </div>

        {step >= 2 && conv.ok && (
          <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden">
            <p className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase tracking-wider text-gray-500 border-b border-gray-800"><Database className="w-3 h-3" /> model_db</p>
            {Object.entries(MODEL_DB).map(([k, v]) => (
              <motion.div key={k} animate={{ backgroundColor: key === k ? 'rgba(16,185,129,0.2)' : 'rgba(0,0,0,0)' }} className="grid grid-cols-[10rem_1fr_1fr] gap-2 px-3 py-1 font-mono text-[11px]">
                <span className="text-white">"{k}"</span>
                <span className="text-gray-400">{v.framework}</span>
                <span className="text-gray-400">{v.task}</span>
              </motion.div>
            ))}
            {!found && <p className="px-3 py-1 text-[10px] text-rose-300 border-t border-gray-800">{key} is not a key{hint === 'int' ? ' — and the keys are strings, so an int never matches' : ''}.</p>}
          </div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
            {!conv.ok ? (
              <>
                <Pill code={422} text="Unprocessable Entity" />
                <Mono className="text-rose-100">{err422([{ type: conv.err.type, loc: ['path', 'model_id'], msg: conv.err.msg, input: value }])}</Mono>
                <p className="text-[10px] text-gray-400">Rejected by FastAPI’s validation — your function never ran.</p>
              </>
            ) : found ? (
              <>
                <Pill code={200} text="OK" />
                <Mono className="text-emerald-100">{JSON.stringify(MODEL_DB[key])}</Mono>
              </>
            ) : (
              <>
                <Pill code={404} text="Not Found" />
                <Mono className="text-amber-100">{JSON.stringify({ detail: `Model ID '${key}' not found.` })}</Mono>
                <p className="text-[10px] text-gray-400">Raised by your code with HTTPException: the input was valid, the resource just does not exist.</p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </Frame>
  );
}

export function PathLookupVisualizer() {
  const [value, setValue] = useState('bert-base-uncased');
  const [hint, setHint] = useState('str');
  return <LookupRun key={`${value}-${hint}`} value={value} setValue={setValue} hint={hint} setHint={setHint} />;
}

/* ------------------------------------------------------------------ */
/* 11. Path(..., ge=1) + 404: two gates                                   */
/* ------------------------------------------------------------------ */

const PC_CODE = [
  '@app.get("/items/{item_id}")',
  'async def read_item(',
  '    item_id: int = Path(',
  "        ..., # The '...' indicates the parameter is required",
  '        title="The ID of the item to get",',
  "        ge=1 # 'ge' means 'greater than or equal to' 1",
  '    )',
  '):',
  '    # Example: Replace with actual item fetching logic',
  '    if item_id > 100: # Simulate not found for IDs > 100',
  '        raise HTTPException(status_code=404, detail=f"Item ID {item_id} not found.")',
  '    return {"item_id": item_id, "name": f"Sample Item {item_id}"}',
];

const PC_CHIPS = ['abc', '-5', '0', '1', '42', '100', '101', '150'];

export function PathConstraintVisualizer() {
  const [raw, setRaw] = useState('42');
  const conv = coerce('int', raw);
  const n = conv.ok ? conv.value : null;
  const gate1 = !conv.ok ? 'type' : n < 1 ? 'ge' : null;
  const notFound = !gate1 && n > 100;

  let result;
  if (gate1 === 'type') result = { code: 422, body: err422([{ type: conv.err.type, loc: ['path', 'item_id'], msg: conv.err.msg, input: raw }]) };
  else if (gate1 === 'ge') result = { code: 422, body: err422([{ type: 'greater_than_equal', loc: ['path', 'item_id'], msg: 'Input should be greater than or equal to 1', input: raw, ctx: { ge: 1 } }]) };
  else if (notFound) result = { code: 404, body: JSON.stringify({ detail: `Item ID ${n} not found.` }) };
  else result = { code: 200, body: JSON.stringify({ item_id: n, name: `Sample Item ${n}` }) };

  const sliderVal = conv.ok ? Math.max(-10, Math.min(130, n)) : -10;
  const pct = (v) => `${((v + 10) / 140) * 100}%`;

  return (
    <Frame
      title="Path(..., ge=1): validation before your code runs"
      hint="Pick or slide an item_id. Watch which gate stops it: FastAPI’s validation (422) or your own code (404)."
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] text-gray-500">/items/</span>
          {PC_CHIPS.map((c) => (
            <button key={c} type="button" className={`${tabClass(raw === c)} font-mono`} onClick={() => setRaw(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <input type="range" min={-10} max={130} value={sliderVal} onChange={(e) => setRaw(e.target.value)} className="w-full accent-teal-500" />
          <div className="relative h-7 rounded-lg overflow-hidden border border-gray-800 text-[9px] font-semibold">
            <div className="absolute inset-y-0 bg-rose-500/30 flex items-center justify-center text-rose-100" style={{ left: 0, width: pct(0.5) }}>422 · ge=1</div>
            <div className="absolute inset-y-0 bg-emerald-500/30 flex items-center justify-center text-emerald-100" style={{ left: pct(0.5), width: `calc(${pct(100.5)} - ${pct(0.5)})` }}>200 · found</div>
            <div className="absolute inset-y-0 bg-amber-500/30 flex items-center justify-center text-amber-100" style={{ left: pct(100.5), right: 0 }}>404</div>
            {conv.ok && <motion.div animate={{ left: pct(sliderVal) }} className="absolute top-0 w-1 h-7 -ml-0.5 bg-white" />}
          </div>
          <div className="flex justify-between text-[9px] text-gray-500 font-mono"><span>-10</span><span>1</span><span>100</span><span>130</span></div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 text-[11px]">
          <div className="rounded-lg border border-sky-400/40 p-2 text-center font-mono text-sky-100">"{raw}"</div>
          <span className="text-gray-600">→</span>
          <motion.div animate={{ scale: gate1 ? 1.05 : 1 }} className={`rounded-lg border p-2 ${gate1 ? 'border-rose-400 bg-rose-500/15' : 'border-emerald-400/50 bg-emerald-500/10'}`}>
            <p className="flex items-center gap-1 font-semibold text-white"><Shield className="w-3.5 h-3.5" /> FastAPI validation</p>
            <Check status={conv.ok ? 'pass' : 'fail'}>is an int</Check>
            <Check status={!conv.ok ? 'na' : n >= 1 ? 'pass' : 'fail'}>≥ 1 (ge=1)</Check>
          </motion.div>
          <span className="text-gray-600">→</span>
          <motion.div animate={{ scale: notFound ? 1.05 : 1 }} className={`rounded-lg border p-2 ${gate1 ? 'border-gray-800 opacity-40' : notFound ? 'border-amber-400 bg-amber-500/15' : 'border-emerald-400/50 bg-emerald-500/10'}`}>
            <p className="flex items-center gap-1 font-semibold text-white"><Code2 className="w-3.5 h-3.5" /> your code</p>
            <Check status={gate1 ? 'na' : n <= 100 ? 'pass' : 'fail'}>item exists (≤ 100)</Check>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-3">
          <CodeLines lines={PC_CODE} active={gate1 ? [2, 5] : notFound ? [9, 10] : [11]} title="main.py" />
          <div className="space-y-1">
            <Pill code={result.code} text={result.code === 200 ? 'OK' : result.code === 404 ? 'Not Found' : 'Unprocessable Entity'} />
            <Mono className={result.code === 200 ? 'text-emerald-100' : result.code === 404 ? 'text-amber-100' : 'text-rose-100'}>{result.body}</Mono>
            <p className="text-[10px] text-gray-400">
              {gate1 ? 'Stopped before your function ran.' : notFound ? 'Valid input, but your logic decided the item does not exist.' : 'Passed both gates.'}
            </p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 12. Query parameters: pagination and search                           */
/* ------------------------------------------------------------------ */

const FAKE_DB = ['Foo', 'Bar', 'Baz'];
const SEARCH_PRESETS = [
  ['?query=ba', 'ba'],
  ['?query=FOO', 'FOO'],
  ['?query=z', 'z'],
  ['?query=xyz', 'xyz'],
  ['?query=', ''],
  ['(no query)', null],
];

export function QueryBasicsVisualizer() {
  const [tab, setTab] = useState('page');
  const [skip, setSkip] = useState(1);
  const [limit, setLimit] = useState(2);
  const [q, setQ] = useState('ba');

  const slice = FAKE_DB.slice(skip, skip + limit);
  const results = q ? FAKE_DB.filter((n) => n.toLowerCase().includes(q.toLowerCase())) : FAKE_DB;

  return (
    <Frame
      title="Query parameters in action"
      hint={tab === 'page' ? 'Slide skip and limit over the three items in fake_items_db.' : 'Type a search query. Matching is case-insensitive substring search.'}
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(tab === 'page')} onClick={() => setTab('page')}>GET /items/ (skip, limit)</button>
          <button type="button" className={tabClass(tab === 'search')} onClick={() => setTab('search')}>GET /search/ (query)</button>
        </div>
      }
    >
      {tab === 'page' ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-gray-700 bg-black/70 px-3 py-2 font-mono text-[12px] text-gray-300">
            /items/<span className="text-cyan-200">?skip={skip}&amp;limit={limit}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-[11px] text-gray-300">
              <span className="font-mono w-16">skip={skip}</span>
              <input type="range" min={0} max={4} value={skip} onChange={(e) => setSkip(Number(e.target.value))} className="flex-1 accent-teal-500" />
            </label>
            <label className="flex items-center gap-2 text-[11px] text-gray-300">
              <span className="font-mono w-16">limit={limit}</span>
              <input type="range" min={0} max={4} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="flex-1 accent-teal-500" />
            </label>
          </div>
          <div className="flex items-end gap-2">
            {FAKE_DB.map((name, i) => {
              const on = i >= skip && i < skip + limit;
              return (
                <motion.div key={name} animate={{ y: on ? -6 : 0, opacity: i < skip ? 0.35 : 1 }} className={`flex-1 rounded-xl border p-3 text-center ${on ? 'border-teal-400 bg-teal-500/15' : 'border-gray-700'}`}>
                  <p className="text-[9px] text-gray-500 font-mono">index {i}</p>
                  <p className="font-mono text-sm text-white">{name}</p>
                  <p className="text-[9px] mt-0.5">{on ? <span className="text-teal-200">returned</span> : i < skip ? <span className="text-gray-500">skipped</span> : <span className="text-gray-600">beyond limit</span>}</p>
                </motion.div>
              );
            })}
          </div>
          <CodeLines lines={['@app.get("/items/")', 'async def read_items(skip: int = 0, limit: int = 10):', '    return fake_items_db[skip : skip + limit]']} active={[2]} />
          <div className="space-y-1">
            <Pill code={200} text="OK" />
            <Mono className="text-emerald-100">{JSON.stringify(slice.map((n) => ({ item_name: n })))}</Mono>
            <p className="text-[10px] text-gray-400">fake_items_db[{skip}:{skip + limit}] {slice.length === 0 ? '→ empty list (not an error)' : ''}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {SEARCH_PRESETS.map(([label, v]) => (
              <button key={label} type="button" className={`${tabClass(q === v)} font-mono`} onClick={() => setQ(v)}>
                {label}
              </button>
            ))}
          </div>
          <input
            value={q ?? ''}
            onChange={(e) => setQ(e.target.value)}
            placeholder="type a query"
            className="w-full rounded-lg bg-black/70 border border-gray-700 focus:border-teal-400 outline-none px-2.5 py-1.5 font-mono text-[12px] text-sky-100"
          />
          <div className="rounded-lg border border-gray-700 bg-black/70 px-3 py-2 font-mono text-[12px] text-gray-300">
            /search/{q !== null && <span className="text-cyan-200">?query={q}</span>}
          </div>
          <div className="flex gap-2">
            {FAKE_DB.map((name) => {
              const hit = results.includes(name);
              const lower = name.toLowerCase();
              const idx = q ? lower.indexOf(q.toLowerCase()) : -1;
              return (
                <motion.div key={name} animate={{ opacity: hit ? 1 : 0.3, scale: hit ? 1 : 0.95 }} className={`flex-1 rounded-xl border p-3 text-center ${hit ? 'border-teal-400 bg-teal-500/15' : 'border-gray-800'}`}>
                  <p className="font-mono text-sm text-white">
                    {idx >= 0 ? (
                      <>
                        {name.slice(0, idx)}
                        <span className="bg-amber-400/40 rounded">{name.slice(idx, idx + q.length)}</span>
                        {name.slice(idx + q.length)}
                      </>
                    ) : (
                      name
                    )}
                  </p>
                  <p className="text-[9px] text-gray-500 font-mono">"{lower}"</p>
                </motion.div>
              );
            })}
          </div>
          <CodeLines
            lines={[
              '@app.get("/search/")',
              'async def search_items(query: Optional[str] = None):',
              '    results = fake_items_db',
              '    if query:',
              '        results = [item for item in fake_items_db if query.lower() in item["item_name"].lower()]',
              '    return {"query": query, "results": results}',
            ]}
            active={q ? [3, 4, 5] : [2, 5]}
          />
          <div className="space-y-1">
            <Pill code={200} text="OK" />
            <Mono className="text-emerald-100">{JSON.stringify({ query: q, results: results.map((n) => ({ item_name: n })) })}</Mono>
            <p className="text-[10px] text-gray-400">
              {q === null ? 'No query → None → no filtering.' : q === '' ? 'An empty string is falsy, so `if query:` skips the filter — all items come back.' : 'Both sides are lower-cased, so the match ignores case.'}
            </p>
          </div>
        </div>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 13. Important points about query parameters                           */
/* ------------------------------------------------------------------ */

const RULE_TABS = [
  { id: 'declare', label: 'Declaration' },
  { id: 'types', label: 'Type hints' },
  { id: 'defaults', label: 'Defaults' },
  { id: 'optional', label: 'Optional' },
  { id: 'bool', label: 'Boolean conversion' },
];

const DECL_PARAMS = [
  { name: 'item_id: int', where: 'path', why: '{item_id} appears in the path string' },
  { name: 'skip: int = 0', where: 'query', why: 'not in the path → query' },
  { name: 'limit: int = 10', where: 'query', why: 'not in the path → query' },
  { name: 'q: Optional[str] = None', where: 'query', why: 'not in the path → query' },
];

const BOOL_CHIPS = ['true', 'True', 'TRUE', '1', 'on', 'yes', 'false', 'False', '0', 'off', 'no', 'maybe', '2'];

export function QueryRulesVisualizer() {
  const [tab, setTab] = useState('declare');
  const declare = useStepper(DECL_PARAMS.length + 1, 1100);
  const [skipRaw, setSkipRaw] = useState('abc');
  const [sendSkip, setSendSkip] = useState(false);
  const [sendLimit, setSendLimit] = useState(true);
  const [sendQuery, setSendQuery] = useState(false);
  const [boolRaw, setBoolRaw] = useState('yes');

  const skipRes = coerce('int', skipRaw);
  const boolRes = coerce('bool', boolRaw);

  return (
    <Frame
      title="How FastAPI treats query parameters"
      hint="One tab per rule from the text."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-1.5">
            {RULE_TABS.map((t) => (
              <button key={t.id} type="button" className={tabClass(tab === t.id)} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'declare' && <StepControls stepper={declare} total={DECL_PARAMS.length + 1} showPlay />}
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
          {tab === 'declare' && (
            <>
              <Lesson title="Declaration">Any function parameter that is not part of the path definition is automatically a query parameter.</Lesson>
              <CodeLines lines={['@app.get("/items/{item_id}")', 'async def read_item(item_id: int, skip: int = 0, limit: int = 10, q: Optional[str] = None):']} active={[0, 1]} />
              <div className="grid grid-cols-2 gap-3">
                {['path', 'query'].map((bucket) => (
                  <div key={bucket} className={`rounded-xl border-2 border-dashed p-3 min-h-[8rem] ${bucket === 'path' ? 'border-amber-400/50' : 'border-cyan-400/50'}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-2 ${bucket === 'path' ? 'text-amber-300' : 'text-cyan-300'}`}>{bucket} parameters</p>
                    <AnimatePresence>
                      {DECL_PARAMS.slice(0, declare.index)
                        .filter((p) => p.where === bucket)
                        .map((p) => (
                          <motion.div key={p.name} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg bg-gray-900 border border-gray-700 px-2 py-1 mb-1">
                            <p className="font-mono text-[11px] text-white">{p.name}</p>
                            <p className="text-[9px] text-gray-500">{p.why}</p>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">
                {declare.index < DECL_PARAMS.length ? `Next: ${DECL_PARAMS[declare.index].name}` : 'Example URL: /items/5?skip=10&limit=5&q=cat'}
              </p>
            </>
          )}

          {tab === 'types' && (
            <>
              <Lesson title="Type Hints">int, str, bool, float… work just like with path parameters and request bodies: automatic conversion and validation.</Lesson>
              <div className="flex flex-wrap gap-1.5">
                {['abc', '10', '-3', '2.5', ' 7 '].map((v) => (
                  <button key={v} type="button" className={`${tabClass(skipRaw === v)} font-mono`} onClick={() => setSkipRaw(v)}>
                    ?skip={v}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <Mono className="text-sky-100">{`raw text: "${skipRaw}"`}</Mono>
                <span className="text-amber-300 text-xs">skip: int →</span>
                <Mono className={skipRes.ok ? 'text-emerald-100' : 'text-rose-100'}>{skipRes.ok ? `skip = ${skipRes.value}` : '✗ 422'}</Mono>
              </div>
              {!skipRes.ok && <Mono className="text-rose-100">{err422([{ type: skipRes.err.type, loc: ['query', 'skip'], msg: skipRes.err.msg, input: skipRaw }])}</Mono>}
            </>
          )}

          {tab === 'defaults' && (
            <>
              <Lesson title="Default Values">A default (e.g. skip: int = 0) makes the parameter optional. If the client does not send it, the default is used.</Lesson>
              <div className="flex gap-3 text-[11px] text-gray-300">
                <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-teal-500" checked={sendSkip} onChange={(e) => setSendSkip(e.target.checked)} /> send skip=2</label>
                <label className="flex items-center gap-1.5"><input type="checkbox" className="accent-teal-500" checked={sendLimit} onChange={(e) => setSendLimit(e.target.checked)} /> send limit=5</label>
              </div>
              <Mono className="text-sky-100">{`/items/${[sendSkip && 'skip=2', sendLimit && 'limit=5'].filter(Boolean).length ? `?${[sendSkip && 'skip=2', sendLimit && 'limit=5'].filter(Boolean).join('&')}` : ''}`}</Mono>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['skip', sendSkip, 2, 0],
                  ['limit', sendLimit, 5, 10],
                ].map(([name, sent, v, d]) => (
                  <div key={name} className={`rounded-lg border p-2 font-mono text-[12px] ${sent ? 'border-emerald-400/50 text-emerald-100' : 'border-amber-400/50 text-amber-100'}`}>
                    {name} = {sent ? v : d}
                    <span className="block font-sans text-[10px] text-gray-400">{sent ? 'from the URL' : 'default used'}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'optional' && (
            <>
              <Lesson title="Optional Parameters">
                Optional[Type] (or Union[Type, None], or Type | None in newer Python) with a default of None makes a parameter explicitly optional, without any default other than None.
              </Lesson>
              <label className="flex items-center gap-1.5 text-[11px] text-gray-300"><input type="checkbox" className="accent-teal-500" checked={sendQuery} onChange={(e) => setSendQuery(e.target.checked)} /> send ?query=bar</label>
              <CodeLines lines={['async def search_items(query: Optional[str] = None):']} active={[0]} />
              <div className={`rounded-lg border p-3 font-mono text-[12px] ${sendQuery ? 'border-emerald-400/50 text-emerald-100' : 'border-amber-400/50 text-amber-100'}`}>
                query = {sendQuery ? '"bar"' : 'None'}
                <span className="block font-sans text-[10px] text-gray-400">{sendQuery ? 'a str' : '“not provided” is clearly distinguishable from any real value'}</span>
              </div>
            </>
          )}

          {tab === 'bool' && (
            <>
              <Lesson title="Boolean Conversion">For bool hints, FastAPI converts true, True, 1, on, yes → True and false, False, 0, off, no → False. Anything else is a 422.</Lesson>
              <CodeLines lines={['@app.get("/models/")', 'async def list_models(in_production: bool = False): ...']} active={[1]} />
              <div className="flex flex-wrap gap-1.5">
                {BOOL_CHIPS.map((v) => (
                  <button key={v} type="button" className={`${tabClass(boolRaw === v)} font-mono`} onClick={() => setBoolRaw(v)}>
                    {v}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <Mono className="text-sky-100">{`?in_production=${boolRaw}`}</Mono>
                <span className="text-amber-300 text-xs">bool →</span>
                <motion.div key={boolRaw} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                  <Mono className={boolRes.ok ? (boolRes.value ? 'text-emerald-100' : 'text-sky-100') : 'text-rose-100'}>
                    {boolRes.ok ? `in_production = ${boolRes.value ? 'True' : 'False'}` : '✗ 422 bool_parsing'}
                  </Mono>
                </motion.div>
              </div>
              {!boolRes.ok && <p className="text-[10px] text-gray-400">“{boolRaw}” is not a recognised boolean spelling: {'"Input should be a valid boolean, unable to interpret input"'}.</p>}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 14. Query(...) with constraints and list values                       */
/* ------------------------------------------------------------------ */

const FW_PATTERN = '^(PyTorch|TensorFlow|Scikit-learn|Transformers)$';
const FW_RE = new RegExp(FW_PATTERN);
const FW_PRESETS = ['PyTorch', 'pytorch', 'TF', 'Transformers', 'Keras', ''];

const SM_CODE = [
  '@app.get("/models/search/")',
  'async def search_models(',
  '    task: Optional[str] = None,',
  '    framework: Optional[str] = Query(',
  '        None, # Default value is None, making it optional',
  '        min_length=3,',
  '        max_length=50,',
  '        regex="^(PyTorch|TensorFlow|Scikit-learn|Transformers)$", # Example regex',
  '        title="ML Framework",',
  '        description="Filter models by the ML framework (case-sensitive)."',
  '    ),',
  '    tags: List[str] = Query(',
  '        [], # Default is an empty list for multiple values',
  '        title="Tags",',
  '        description="Provide tags to filter models (e.g., ?tags=nlp&tags=text-generation)"',
  '    )',
  '):',
];

export function QueryValidatorVisualizer() {
  const [task, setTask] = useState('');
  const [fwOn, setFwOn] = useState(true);
  const [fw, setFw] = useState('pytorch');
  const [tags, setTags] = useState(['cv', 'classification']);
  const [tagInput, setTagInput] = useState('');

  const checks = fwOn
    ? [
        { label: 'min_length=3', status: fw.length >= 3 ? 'pass' : 'fail', err: { type: 'string_too_short', msg: 'String should have at least 3 characters', ctx: { min_length: 3 } } },
        { label: 'max_length=50', status: fw.length <= 50 ? 'pass' : 'fail', err: { type: 'string_too_long', msg: 'String should have at most 50 characters', ctx: { max_length: 50 } } },
        { label: 'matches the regex (exact, case-sensitive)', status: FW_RE.test(fw) ? 'pass' : 'fail', err: { type: 'string_pattern_mismatch', msg: `String should match pattern '${FW_PATTERN}'`, ctx: { pattern: FW_PATTERN } } },
      ]
    : [];
  const failed = checks.find((c) => c.status === 'fail');
  const shownChecks = checks.map((c) => (failed && checks.indexOf(c) > checks.indexOf(failed) ? { ...c, status: 'na' } : c));

  const params = [];
  if (task) params.push(`task=${encodeURIComponent(task)}`);
  if (fwOn) params.push(`framework=${encodeURIComponent(fw)}`);
  tags.forEach((t) => params.push(`tags=${encodeURIComponent(t)}`));
  const url = `/models/search/${params.length ? `?${params.join('&')}` : ''}`;

  const addTag = () => {
    const t = tagInput.trim();
    if (t) setTags((cur) => [...cur, t]);
    setTagInput('');
  };

  return (
    <Frame
      title="Query(): rules and metadata for query parameters"
      hint="Change the framework value and the tags. The URL, the checks, and the response update live."
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-gray-700 bg-black/70 px-3 py-2 font-mono text-[12px] text-gray-300 break-all">
          GET {url.split('?')[0]}
          {url.includes('?') && <span className="text-cyan-200">?{url.split('?')[1]}</span>}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="rounded-lg border border-gray-700 p-2 space-y-1">
              <p className="font-mono text-[11px] text-white">task <span className="text-gray-500">Optional[str] = None</span></p>
              <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="(not sent)" className="w-full rounded bg-black/70 border border-gray-700 focus:border-teal-400 outline-none px-2 py-1 font-mono text-[11px] text-sky-100" />
            </div>
            <div className={`rounded-lg border p-2 space-y-1.5 ${failed ? 'border-rose-400/50' : 'border-gray-700'}`}>
              <label className="flex items-center gap-2 font-mono text-[11px] text-white">
                <input type="checkbox" className="accent-teal-500" checked={fwOn} onChange={(e) => setFwOn(e.target.checked)} /> framework
                <span className="text-gray-500 font-sans text-[10px]">{fwOn ? 'sent' : 'not sent → None, no checks run'}</span>
              </label>
              {fwOn && (
                <>
                  <div className="flex flex-wrap gap-1">
                    {FW_PRESETS.map((p) => (
                      <button key={p} type="button" className={`${tabClass(fw === p)} font-mono !py-0.5`} onClick={() => setFw(p)}>
                        {p === '' ? '(empty)' : p}
                      </button>
                    ))}
                  </div>
                  <input value={fw} onChange={(e) => setFw(e.target.value)} className="w-full rounded bg-black/70 border border-gray-700 focus:border-teal-400 outline-none px-2 py-1 font-mono text-[11px] text-sky-100" />
                  {shownChecks.map((c) => (
                    <Check key={c.label} status={c.status}>{c.label}</Check>
                  ))}
                </>
              )}
            </div>
            <div className="rounded-lg border border-gray-700 p-2 space-y-1.5">
              <p className="font-mono text-[11px] text-white">tags <span className="text-gray-500">List[str] = Query([])</span></p>
              <div className="flex flex-wrap gap-1">
                <AnimatePresence>
                  {tags.map((t, i) => (
                    <motion.button
                      key={`${t}-${i}`}
                      type="button"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      onClick={() => setTags((cur) => cur.filter((_, j) => j !== i))}
                      className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 font-mono text-[10px]"
                    >
                      {t} ✕
                    </motion.button>
                  ))}
                </AnimatePresence>
                {!tags.length && <span className="text-[10px] text-gray-500">none → default []</span>}
              </div>
              <div className="flex gap-1">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="add a tag"
                  className="flex-1 rounded bg-black/70 border border-gray-700 focus:border-teal-400 outline-none px-2 py-1 font-mono text-[11px] text-sky-100"
                />
                <button type="button" onClick={addTag} className="px-2 rounded bg-teal-600 text-white text-[11px]">add</button>
              </div>
              <p className="text-[10px] text-gray-500">Each tag is its own <span className="font-mono">tags=…</span> in the URL; FastAPI collects them into one list.</p>
            </div>
          </div>

          <div className="space-y-2">
            {failed ? (
              <>
                <Pill code={422} text="Unprocessable Entity" />
                <Mono className="text-rose-100">{err422([{ type: failed.err.type, loc: ['query', 'framework'], msg: failed.err.msg, input: fw, ctx: failed.err.ctx }])}</Mono>
              </>
            ) : (
              <>
                <Pill code={200} text="OK" />
                <Mono className="text-emerald-100">
                  {JSON.stringify({ filters: { task: task || null, framework: fwOn ? fw : null, tags }, results: ['Model A', 'Model B'] }, null, 2)}
                </Mono>
              </>
            )}
            <div className="max-h-56 overflow-auto custom-scroll rounded-xl">
              <CodeLines lines={SM_CODE} active={failed ? [3, 5 + checks.indexOf(failed)] : [11, 12]} title="main.py" />
            </div>
            <p className="text-[10px] text-gray-500">
              Note: newer FastAPI versions name the argument <span className="font-mono">pattern=</span>; <span className="font-mono">regex=</span> still works but is deprecated.
            </p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 15. Everything becomes documentation                                  */
/* ------------------------------------------------------------------ */

const DOC_ENDPOINTS = {
  search: {
    method: 'GET',
    path: '/models/search/',
    summary: 'Search Models',
    params: [
      { name: 'task', in: 'query', type: 'string | null', req: false, schema: '{"anyOf": [{"type": "string"}, {"type": "null"}],\n "title": "Task"}' },
      {
        name: 'framework', in: 'query', type: 'string | null', req: false, desc: 'Filter models by the ML framework (case-sensitive).',
        schema: `{"anyOf": [{"type": "string", "minLength": 3, "maxLength": 50,\n            "pattern": "${FW_PATTERN}"},\n           {"type": "null"}],\n "title": "ML Framework",\n "description": "Filter models by the ML framework (case-sensitive)."}`,
      },
      { name: 'tags', in: 'query', type: 'array[string]', req: false, desc: 'Provide tags to filter models (e.g., ?tags=nlp&tags=text-generation)', schema: '{"type": "array", "items": {"type": "string"},\n "default": [], "title": "Tags"}' },
    ],
  },
  item: {
    method: 'GET',
    path: '/items/{item_id}',
    summary: 'Read Item',
    params: [{ name: 'item_id', in: 'path', type: 'integer', req: true, desc: 'The ID of the item to get', schema: '{"type": "integer", "minimum": 1,\n "title": "The ID of the item to get"}' }],
  },
  model: {
    method: 'GET',
    path: '/models/{model_id}',
    summary: 'Get Model Metadata',
    params: [{ name: 'model_id', in: 'path', type: 'string', req: true, schema: '{"type": "string", "title": "Model Id"}' }],
  },
};

export function ParamDocsVisualizer() {
  const [ep, setEp] = useState('search');
  const [param, setParam] = useState('framework');
  const e = DOC_ENDPOINTS[ep];
  const p = e.params.find((x) => x.name === param) || e.params[0];

  return (
    <Frame
      title="Your declarations become validation and documentation"
      hint="Pick an endpoint and a parameter. Everything shown — types, required flags, constraints, titles, descriptions — comes from the type hints, Path() and Query()."
      footer={
        <div className="flex flex-wrap gap-2">
          {Object.entries(DOC_ENDPOINTS).map(([id, x]) => (
            <button
              key={id}
              type="button"
              className={`${tabClass(ep === id)} font-mono`}
              onClick={() => {
                setEp(id);
                setParam(x.params[0].name);
              }}
            >
              {x.path}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 space-y-2">
          <div className="flex items-center gap-2 rounded-lg border border-sky-500/50 bg-sky-500/10 px-2 py-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500 text-white">{e.method}</span>
            <span className="font-mono text-[11px] text-white">{e.path}</span>
            <span className="text-[11px] text-gray-400">{e.summary}</span>
          </div>
          <p className="text-[11px] text-gray-400">Parameters</p>
          <div className="rounded-lg border border-gray-800 overflow-hidden">
            <div className="grid grid-cols-[9rem_1fr] gap-2 px-2 py-1 text-[9px] uppercase tracking-wider text-gray-500 border-b border-gray-800">
              <span>Name</span><span>Description</span>
            </div>
            {e.params.map((x) => (
              <button key={x.name} type="button" onClick={() => setParam(x.name)} className={`w-full grid grid-cols-[9rem_1fr] gap-2 px-2 py-1.5 text-left ${p.name === x.name ? 'bg-teal-500/15' : 'hover:bg-gray-800'}`}>
                <span>
                  <span className="font-mono text-[11px] text-white">{x.name}</span>
                  {x.req && <span className="text-rose-400 text-[10px]"> * required</span>}
                  <span className="block font-mono text-[10px] text-cyan-200">{x.type}</span>
                  <span className="block text-[10px] text-gray-500 italic">({x.in})</span>
                </span>
                <span className="text-[11px] text-gray-300">{x.desc || <span className="text-gray-600">—</span>}</span>
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={`${ep}-${p.name}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">schema of “{p.name}” in openapi.json</p>
            <Mono className="text-cyan-100">{p.schema}</Mono>
          </motion.div>
        </AnimatePresence>
        <Lesson title="Declare once, get both">
          The same declaration that makes FastAPI reject bad input also tells API consumers what good input looks like. Inputs are valid before they reach your core logic —
          important when parameters decide which ML model is queried or how.
        </Lesson>
      </div>
    </Frame>
  );
}
