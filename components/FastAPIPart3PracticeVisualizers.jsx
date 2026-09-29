import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Terminal as TerminalIcon, Mail, CheckCircle, XCircle, Pencil } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, Terminal, CodeLines } from './VisualKit';
import { StatusPill } from './FastAPIPart3CycleVisualizers';

/* ------------------------------------------------------------------ */
/* Shared mocks                                                           */
/* ------------------------------------------------------------------ */

function BrowserMock({ url, children, dim = false }) {
  return (
    <div className={`rounded-xl border border-gray-700 bg-gray-900 overflow-hidden transition-opacity ${dim ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border-b border-gray-700">
        <span className="w-2 h-2 rounded-full bg-rose-400/80" />
        <span className="w-2 h-2 rounded-full bg-amber-400/80" />
        <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
        <div className="flex-1 ml-2 flex items-center gap-1.5 rounded-md bg-gray-950 px-2 py-0.5 font-mono text-[11px] text-gray-200 truncate">
          <Globe className="w-3 h-3 text-gray-500 shrink-0" />
          {url}
        </div>
      </div>
      <div className="p-3 min-h-[3rem] font-mono text-[11px] text-gray-100 whitespace-pre-wrap break-all">{children}</div>
    </div>
  );
}

const METHOD_TONE = {
  GET: 'bg-sky-500 text-white',
  POST: 'bg-emerald-500 text-white',
  PUT: 'bg-amber-500 text-gray-950',
  DELETE: 'bg-rose-500 text-white',
};
const ROW_TONE = {
  GET: 'border-sky-500/50 bg-sky-500/10',
  POST: 'border-emerald-500/50 bg-emerald-500/10',
};

function SwaggerRow({ method, path, summary, open, onClick, children }) {
  return (
    <div className={`rounded-lg border ${ROW_TONE[method]} overflow-hidden`}>
      <button type="button" onClick={onClick} className="w-full flex items-center gap-2 px-2 py-1.5 text-left">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${METHOD_TONE[method]}`}>{method}</span>
        <span className="font-mono text-[11px] text-white">{path}</span>
        <span className="text-[11px] text-gray-400 truncate">{summary}</span>
        <span className="ml-auto text-gray-500 text-xs">{open ? '▾' : '▸'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-700/60 bg-gray-950/60 overflow-hidden">
            <div className="p-2.5 space-y-2 text-[11px]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Mono = ({ children, className = '' }) => (
  <pre className={`font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all rounded-lg bg-black/60 border border-gray-800 p-2.5 text-gray-200 ${className}`}>
    {children}
  </pre>
);

const USERS = Array.from({ length: 100 }, (_, i) => i);

/* ------------------------------------------------------------------ */
/* 9. Creating a basic GET endpoint                                      */
/* ------------------------------------------------------------------ */

const BASIC_MAIN = [
  '# main.py',
  'from fastapi import FastAPI',
  '',
  'app = FastAPI()',
  '',
  '@app.get("/")',
  'async def read_root():',
  '    """',
  '    This endpoint returns a message.',
  '    It serves as the root or index of the API.',
  '    """',
  '    return {"message": "To the ML Model API"}',
];

const BASIC_STEPS = [
  { lines: [5], title: '@app.get("/")', text: 'This decorator tells FastAPI that the function read_root below it is responsible for handling GET requests made to the path / (the root path).' },
  { lines: [6], title: 'async def read_root():', text: 'Defines an asynchronous function named read_root. FastAPI supports both def and async def route handlers; async def lets you use asyncio for concurrent operations (Chapter 5). For now: it is the standard way to write path operation functions.' },
  { lines: [11], title: 'return {"message": ...}', text: 'You return a plain Python dictionary. FastAPI automatically converts it into a JSON response.' },
  { lines: [], title: 'Save the file', text: 'Uvicorn is running with --reload, so saving main.py makes it restart automatically with your new code.' },
  { lines: [], title: 'Open http://127.0.0.1:8000/', text: 'The browser sends GET / and shows the JSON response returned by read_root.' },
  { lines: [], title: 'Open /docs and find GET /', text: 'The automatically generated Swagger UI lists your endpoint. The summary “Read Root” comes from the function name; the description is your docstring. Expand it.' },
  { lines: [], title: 'Try it out → Execute', text: 'Swagger UI sends a real request to your running app and shows the response — testing without leaving the browser.' },
];

export function BasicGetVisualizer() {
  const stepper = useStepper(BASIC_STEPS.length, 2100);
  const step = stepper.index;
  const frame = BASIC_STEPS[step];

  return (
    <Frame
      title="Your first GET endpoint, end to end"
      hint="Step through the three lines that matter, then save, open the browser, and test it in /docs."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={BASIC_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Lesson title={`${step + 1}. ${frame.title}`}>{frame.text}</Lesson>
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-3">
          <CodeLines lines={BASIC_MAIN} active={frame.lines} title="main.py" marks={{ 5: '1', 6: '2', 11: '3' }} />
          <div className="space-y-2">
            {step <= 2 && (
              <div className="rounded-xl border border-gray-700 p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">what FastAPI knows</p>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className={`px-1.5 rounded text-[10px] font-bold ${METHOD_TONE.GET}`}>GET</span>
                  <span className="text-white">/</span>
                  <span className="text-gray-500">→</span>
                  <span className="text-cyan-200">read_root()</span>
                </div>
                {step >= 1 && <p className="text-[11px] text-gray-400">runs on the <span className="text-teal-200">event loop</span> (async def)</p>}
                {step >= 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                    <p className="font-mono text-[10px] text-amber-100">{"dict   {'message': 'To the ML Model API'}"}</p>
                    <p className="text-[10px] text-gray-500 text-center">↓ automatic conversion</p>
                    <p className="font-mono text-[10px] text-emerald-200">{'JSON   {"message":"To the ML Model API"}'}</p>
                  </motion.div>
                )}
              </div>
            )}
            {step === 3 && (
              <Terminal
                title="uvicorn main:app --reload"
                lines={[
                  { kind: 'dim', text: 'INFO:     Application startup complete.' },
                  { kind: 'warn', text: "WARNING:  StatReload detected changes in 'main.py'. Reloading..." },
                  { kind: 'info', text: 'INFO:     Started server process [12347]' },
                  { kind: 'ok', text: 'INFO:     Application startup complete.', highlight: true },
                ]}
              />
            )}
            {step === 4 && <BrowserMock url="http://127.0.0.1:8000/">{'{"message":"To the ML Model API"}'}</BrowserMock>}
            {step >= 5 && (
              <BrowserMock url="http://127.0.0.1:8000/docs">
                <div className="font-sans space-y-2">
                  <p className="text-sm font-bold text-white">FastAPI <span className="text-[9px] px-1 rounded bg-gray-700 text-gray-300 align-middle">0.1.0</span></p>
                  <SwaggerRow method="GET" path="/" summary="Read Root" open>
                    <p className="text-gray-400">This endpoint returns a message. It serves as the root or index of the API.</p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Parameters: none</span>
                      <span className={`ml-auto px-2 py-0.5 rounded border text-[10px] ${step === 6 ? 'border-gray-600 text-gray-500' : 'border-gray-400 text-gray-200'}`}>Try it out</span>
                    </div>
                    {step === 6 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                        <span className="block w-full text-center rounded bg-sky-600 text-white text-[10px] font-bold py-1">Execute</span>
                        <p className="text-gray-500">Server response</p>
                        <div className="flex items-center gap-2">
                          <StatusPill code={200} text="OK" />
                        </div>
                        <Mono className="text-emerald-100">{'{\n  "message": "To the ML Model API"\n}'}</Mono>
                      </motion.div>
                    )}
                  </SwaggerRow>
                </div>
              </BrowserMock>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Path parameters                                                    */
/* ------------------------------------------------------------------ */

const PATH_CODE = [
  '@app.get("/items/{item_id}")',
  'async def read_item(item_id: int):',
  '    """',
  '    Retrieves an item based on its ID provided in the path.',
  '    """',
  '    # In a real application, you would fetch data based on item_id',
  '    return {"item_id": item_id, "description": f"Details for item {item_id}"}',
];

const PATH_INPUTS = ['42', '7', '-3', 'abc', 'forty-two'];

const PATH_STAGES = [
  { title: 'The URL arrives', text: 'The browser sends GET with the full path. Everything in a URL is text.' },
  { title: 'Match the template, capture {item_id}', text: 'The path fits /items/{item_id}, so the segment after /items/ is captured — still as a string.' },
  { title: 'Validate and convert with : int', text: 'The type hint int tells FastAPI to check that the string can be converted to an integer, and to convert it.' },
  { title: 'Call your function — or answer 422', text: 'Valid: read_item gets a real int and builds the response. Invalid: FastAPI intercepts the request before it reaches your code and returns a JSON error.' },
];

function PathRun({ value, setValue }) {
  const [format, setFormat] = useState('v1');
  const [showEditor, setShowEditor] = useState(false);
  const stepper = useStepper(PATH_STAGES.length, 1400);
  const step = stepper.index;
  const valid = /^-?\d+$/.test(value);
  const n = valid ? parseInt(value, 10) : null;

  const errV1 = `{\n  "detail": [\n    {\n      "loc": ["path", "item_id"],\n      "msg": "value is not a valid integer",\n      "type": "type_error.integer"\n    }\n  ]\n}`;
  const errV2 = `{\n  "detail": [\n    {\n      "type": "int_parsing",\n      "loc": ["path", "item_id"],\n      "msg": "Input should be a valid integer, unable to parse string as an integer",\n      "input": "${value}"\n    }\n  ]\n}`;

  return (
    <Frame
      title="Path parameters: /items/{item_id}"
      hint="Pick a value for the URL, then step through what happens to it. Try abc to see FastAPI reject it before your code runs."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={PATH_STAGES.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] text-gray-400">http://127.0.0.1:8000/items/</span>
          {PATH_INPUTS.map((v) => (
            <button key={v} type="button" className={`${tabClass(v === value)} font-mono`} onClick={() => setValue(v)}>
              {v}
            </button>
          ))}
        </div>

        <Lesson title={`${step + 1}. ${PATH_STAGES[step].title}`}>{PATH_STAGES[step].text}</Lesson>

        <div className="grid grid-cols-4 gap-2 items-stretch">
          <div className={`rounded-lg border p-2 transition-all ${step >= 0 ? 'border-sky-400/60 bg-sky-500/10' : 'border-gray-800'}`}>
            <p className="text-[9px] uppercase text-gray-500">URL path</p>
            <p className="font-mono text-[11px] text-white break-all">/items/<span className="text-amber-200">{value}</span></p>
          </div>
          <div className={`rounded-lg border p-2 transition-all ${step >= 1 ? 'border-amber-400/60 bg-amber-500/10' : 'border-gray-800 opacity-40'}`}>
            <p className="text-[9px] uppercase text-gray-500">captured (str)</p>
            <p className="font-mono text-[11px] text-amber-100">item_id = "{value}"</p>
          </div>
          <div className={`rounded-lg border p-2 transition-all ${step >= 2 ? (valid ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-rose-400/60 bg-rose-500/10') : 'border-gray-800 opacity-40'}`}>
            <p className="text-[9px] uppercase text-gray-500">int("{value}")</p>
            <p className={`font-mono text-[11px] ${valid ? 'text-emerald-200' : 'text-rose-200'}`}>{step >= 2 ? (valid ? `item_id = ${n}` : '✗ not an integer') : '…'}</p>
          </div>
          <div className={`rounded-lg border p-2 transition-all ${step >= 3 ? (valid ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-rose-400/60 bg-rose-500/10') : 'border-gray-800 opacity-40'}`}>
            <p className="text-[9px] uppercase text-gray-500">outcome</p>
            <p className="text-[11px]">{step >= 3 ? (valid ? <StatusPill code={200} text="OK" /> : <StatusPill code={422} text="Unprocessable" />) : '…'}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <CodeLines lines={PATH_CODE} active={step === 1 ? [0] : step === 2 ? [1] : step === 3 && valid ? [6] : []} title="main.py" />
          <div className="space-y-2">
            {step === 3 && valid && (
              <BrowserMock url={`http://127.0.0.1:8000/items/${value}`}>{`{"item_id":${n},"description":"Details for item ${n}"}`}</BrowserMock>
            )}
            {step === 3 && !valid && (
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <button type="button" className={tabClass(format === 'v1')} onClick={() => setFormat('v1')}>As in the course text</button>
                  <button type="button" className={tabClass(format === 'v2')} onClick={() => setFormat('v2')}>Current FastAPI (Pydantic v2)</button>
                </div>
                <Mono className="text-rose-100">{format === 'v1' ? errV1 : errV2}</Mono>
                <p className="text-[10px] text-gray-500">Same meaning, newer wording. <span className="font-mono">loc</span> = where (the path, item_id), <span className="font-mono">msg</span> = what went wrong.</p>
              </div>
            )}
            {step < 3 && (
              <div className="rounded-xl border border-gray-700 p-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">the : int type hint does three jobs</p>
                {[
                  ['Validate', 'can "…" become an integer?', step >= 2],
                  ['Convert', 'the string "42" becomes the number 42', step >= 2],
                  ['Editor support', 'autocompletion and type checking', showEditor],
                ].map(([label, text, on]) => (
                  <div key={label} className={`flex items-start gap-2 text-[11px] ${on ? 'text-white' : 'text-gray-500'}`}>
                    {on ? <CheckCircle className="w-3.5 h-3.5 text-emerald-300 mt-0.5 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border border-gray-600 mt-0.5 shrink-0" />}
                    <span><strong>{label}</strong> — {text}</span>
                  </div>
                ))}
                <button type="button" onClick={() => setShowEditor((s) => !s)} className="text-[10px] text-teal-300 underline">
                  {showEditor ? 'hide editor demo' : 'show editor demo'}
                </button>
                {showEditor && (
                  <div className="rounded-lg bg-gray-950 border border-gray-800 p-2 font-mono text-[11px]">
                    <p className="text-gray-300">item_id.<span className="animate-pulse">|</span></p>
                    <div className="mt-1 ml-12 w-40 rounded border border-gray-700 bg-gray-900 text-[10px]">
                      {['bit_length()', 'to_bytes()', 'conjugate()', 'real'].map((m, i) => (
                        <p key={m} className={`px-2 py-0.5 ${i === 0 ? 'bg-teal-500/20 text-teal-100' : 'text-gray-400'}`}>{m} <span className="text-gray-600">int</span></p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function PathParamVisualizer() {
  const [value, setValue] = useState('42');
  return <PathRun key={value} value={value} setValue={setValue} />;
}

/* ------------------------------------------------------------------ */
/* 11. Query parameters: skip & limit                                    */
/* ------------------------------------------------------------------ */

const USERS_CODE = [
  '@app.get("/users/")',
  'async def read_users(skip: int = 0, limit: int = 10):',
  '    """',
  '    Retrieves a list of users, with optional pagination.',
  "    Uses query parameters 'skip' and 'limit'.",
  '    """',
  '    # Simulate fetching users from a data source',
  '    all_users = [{"user_id": i, "name": f"User {i}"} for i in range(100)]',
  '    return all_users[skip : skip + limit]',
];

export function QueryParamVisualizer() {
  const [useSkip, setUseSkip] = useState(true);
  const [skip, setSkip] = useState(10);
  const [useLimit, setUseLimit] = useState(true);
  const [limit, setLimit] = useState(5);
  const [bad, setBad] = useState(false);

  const effSkip = useSkip ? skip : 0;
  const effLimit = useLimit ? limit : 10;
  const qs = [];
  if (bad) qs.push('skip=abc');
  else if (useSkip) qs.push(`skip=${skip}`);
  if (useLimit) qs.push(`limit=${limit}`);
  const url = `/users/${qs.length ? `?${qs.join('&')}` : ''}`;
  const slice = USERS.slice(effSkip, effSkip + effLimit);

  const rows = [
    { name: 'skip', raw: bad ? '"abc"' : useSkip ? `"${skip}"` : '(missing)', value: bad ? '✗ not an integer' : useSkip ? String(skip) : '0  ← default', ok: !bad, def: !useSkip && !bad },
    { name: 'limit', raw: useLimit ? `"${limit}"` : '(missing)', value: useLimit ? String(limit) : '10  ← default', ok: true, def: !useLimit },
  ];

  return (
    <Frame
      title="Query parameters: /users/?skip=…&limit=…"
      hint="Toggle and slide the parameters. The URL, the parsed values, and the slice of the 100 users update live."
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-gray-700 bg-black/70 px-3 py-2 font-mono text-[12px] text-gray-200 break-all">
          <span className="text-gray-500">GET http://127.0.0.1:8000</span>
          <span className="text-amber-200">/users/</span>
          {qs.length > 0 && <span className="text-cyan-200">?{qs.join('&')}</span>}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className={`rounded-xl border p-3 space-y-1.5 ${useSkip || bad ? 'border-cyan-400/40' : 'border-gray-800'}`}>
            <label className="flex items-center gap-2 text-xs text-white">
              <input type="checkbox" className="accent-teal-500" checked={useSkip} onChange={(e) => { setUseSkip(e.target.checked); setBad(false); }} />
              send <span className="font-mono text-cyan-200">skip</span>
              <span className="ml-auto font-mono text-cyan-100">{bad ? 'abc' : useSkip ? skip : '—'}</span>
            </label>
            <input type="range" min={0} max={100} value={skip} disabled={!useSkip || bad} onChange={(e) => setSkip(Number(e.target.value))} className="w-full accent-teal-500" />
            <p className="text-[10px] text-gray-500">how many users to skip from the start</p>
          </div>
          <div className={`rounded-xl border p-3 space-y-1.5 ${useLimit ? 'border-cyan-400/40' : 'border-gray-800'}`}>
            <label className="flex items-center gap-2 text-xs text-white">
              <input type="checkbox" className="accent-teal-500" checked={useLimit} onChange={(e) => setUseLimit(e.target.checked)} />
              send <span className="font-mono text-cyan-200">limit</span>
              <span className="ml-auto font-mono text-cyan-100">{useLimit ? limit : '—'}</span>
            </label>
            <input type="range" min={1} max={20} value={limit} disabled={!useLimit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full accent-teal-500" />
            <p className="text-[10px] text-gray-500">maximum number of users to return</p>
          </div>
        </div>
        <button type="button" className={tabClass(bad)} onClick={() => { setBad((b) => !b); setUseSkip(true); }}>
          {bad ? 'Fix it: use a number for skip' : 'Try an invalid value: skip=abc'}
        </button>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-3">
          <div className="space-y-2">
            <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden">
              <div className="grid grid-cols-[3.5rem_5rem_1fr] gap-2 px-3 py-1.5 text-[9px] uppercase tracking-wider text-gray-500 border-b border-gray-800">
                <span>param</span><span>raw</span><span>value passed</span>
              </div>
              {rows.map((r) => (
                <div key={r.name} className="grid grid-cols-[3.5rem_5rem_1fr] gap-2 px-3 py-1.5 font-mono text-[11px]">
                  <span className="text-cyan-200">{r.name}</span>
                  <span className="text-gray-300">{r.raw}</span>
                  <span className={!r.ok ? 'text-rose-300' : r.def ? 'text-amber-200' : 'text-emerald-300'}>{r.value}</span>
                </div>
              ))}
            </div>
            <Lesson title="Why are these query parameters?">
              <span className="font-mono">skip</span> and <span className="font-mono">limit</span> are function arguments that do not appear in the path string <span className="font-mono">/users/</span>, so FastAPI reads them from the query string. <span className="font-mono">: int</span> validates and converts; <span className="font-mono">= 0</span> and <span className="font-mono">= 10</span> make them optional.
            </Lesson>
          </div>

          <div className="space-y-2">
            {bad ? (
              <div className="rounded-xl border border-rose-400/50 bg-rose-500/10 p-3 space-y-1.5">
                <StatusPill code={422} text="Unprocessable Entity" />
                <Mono className="text-rose-100">{'{"detail":[{"type":"int_parsing","loc":["query","skip"],\n  "msg":"Input should be a valid integer, unable to parse string as an integer",\n  "input":"abc"}]}'}</Mono>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-gray-700 bg-gray-950 p-2">
                  <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1.5">all_users (100) · returned slice [{effSkip} : {effSkip + effLimit}]</p>
                  <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}>
                    {USERS.map((u) => {
                      const on = u >= effSkip && u < effSkip + effLimit;
                      return (
                        <motion.div
                          key={u}
                          animate={{ scale: on ? 1 : 0.85 }}
                          title={`User ${u}`}
                          className={`aspect-square rounded-[3px] ${on ? 'bg-teal-400' : u < effSkip ? 'bg-gray-700' : 'bg-gray-800'}`}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">gray-dark = skipped · teal = returned · the list simply ends at user 99</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill code={200} text="OK" />
                  <span className="text-[11px] text-gray-400">{slice.length} user{slice.length === 1 ? '' : 's'} returned{slice.length < effLimit ? ` (fewer than limit — only ${slice.length} left after skipping ${effSkip})` : ''}</span>
                </div>
                <Mono className="text-emerald-100 max-h-24 overflow-auto">
                  {slice.length
                    ? `[${slice.slice(0, 3).map((u) => `{"user_id":${u},"name":"User ${u}"}`).join(',')}${slice.length > 3 ? `, … ${slice.length - 3} more` : ''}]`
                    : '[]'}
                </Mono>
              </>
            )}
          </div>
        </div>

        <CodeLines lines={USERS_CODE} active={bad ? [1] : [1, 8]} title="main.py" />
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 12. Optional q + "Test these"                                          */
/* ------------------------------------------------------------------ */

const ITEM_Q_CODE = [
  '@app.get("/items/{item_id}")',
  'async def read_item(item_id: int, q: Optional[str] = None):',
  '    """',
  "    Retrieves an item by ID, with an optional query parameter 'q'.",
  '    """',
  '    response = {"item_id": item_id, "description": f"Details for item {item_id}"}',
  '    if q:',
  '        response.update({"query_param": q})',
  '    return response',
];

const LAB_TESTS = [
  {
    url: '/users/', note: 'Uses defaults (skip=0, limit=10).', fn: 'users',
    params: [['skip', 'query', '(missing)', '0 (default)'], ['limit', 'query', '(missing)', '10 (default)']],
    status: 200, body: '[{"user_id":0,"name":"User 0"}, … {"user_id":9,"name":"User 9"}]   (10 users)',
  },
  {
    url: '/users/?skip=10&limit=5', note: 'Uses provided values.', fn: 'users',
    params: [['skip', 'query', '"10"', '10'], ['limit', 'query', '"5"', '5']],
    status: 200, body: '[{"user_id":10,"name":"User 10"}, … {"user_id":14,"name":"User 14"}]   (5 users)',
  },
  {
    url: '/items/5', note: 'No query parameter q.', fn: 'item', qSet: false,
    params: [['item_id', 'path', '"5"', '5'], ['q', 'query', '(missing)', 'None (default)']],
    status: 200, body: '{"item_id":5,"description":"Details for item 5"}',
  },
  {
    url: '/items/5?q=somequery', note: 'Includes the query parameter q.', fn: 'item', qSet: true,
    params: [['item_id', 'path', '"5"', '5'], ['q', 'query', '"somequery"', '"somequery"']],
    status: 200, body: '{"item_id":5,"description":"Details for item 5","query_param":"somequery"}',
  },
  {
    url: '/users/?skip=abc', note: 'Invalid type → automatic validation error.', fn: 'users',
    params: [['skip', 'query', '"abc"', '✗ not an integer'], ['limit', 'query', '(missing)', '10 (default)']],
    status: 422, body: '{"detail":[{"type":"int_parsing","loc":["query","skip"],"msg":"Input should be a valid integer, unable to parse string as an integer","input":"abc"}]}',
  },
];

export function OptionalQueryVisualizer() {
  const stepper = useStepper(LAB_TESTS.length, 2400);
  const test = LAB_TESTS[stepper.index];
  const itemActive = test.fn === 'item' ? (test.qSet ? [1, 5, 6, 7, 8] : [1, 5, 6, 8]) : [];

  return (
    <Frame
      title="Test these URLs"
      hint="Step through the course’s test list (or click one). See where each value comes from, which code runs, and what comes back."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={LAB_TESTS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1">
          {LAB_TESTS.map((t, i) => (
            <button
              key={t.url}
              type="button"
              onClick={() => stepper.pick(i)}
              className={`w-full flex items-center gap-2 rounded-lg px-2 py-1 text-left border transition-all ${
                i === stepper.index ? 'border-teal-400/60 bg-teal-500/10' : 'border-transparent hover:bg-gray-800/60'
              }`}
            >
              <span className="font-mono text-[11px] text-gray-500">127.0.0.1:8000</span>
              <span className="font-mono text-[11px] text-white">{t.url}</span>
              <span className="ml-auto text-[10px] text-gray-400">{t.note}</span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden">
          <div className="grid grid-cols-[4rem_4rem_6rem_1fr] gap-2 px-3 py-1.5 text-[9px] uppercase tracking-wider text-gray-500 border-b border-gray-800">
            <span>param</span><span>from</span><span>raw</span><span>value passed</span>
          </div>
          {test.params.map(([name, src, raw, val]) => (
            <motion.div key={`${stepper.index}-${name}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="grid grid-cols-[4rem_4rem_6rem_1fr] gap-2 px-3 py-1.5 font-mono text-[11px]">
              <span className="text-white">{name}</span>
              <span className={src === 'path' ? 'text-amber-200' : 'text-cyan-200'}>{src}</span>
              <span className="text-gray-300">{raw}</span>
              <span className={val.startsWith('✗') ? 'text-rose-300' : val.includes('default') ? 'text-amber-200' : 'text-emerald-300'}>{val}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            {test.fn === 'item' ? (
              <CodeLines lines={ITEM_Q_CODE} active={itemActive} title="read_item" marks={{ 6: test.qSet ? 'q is set → runs' : 'q is None → skipped' }} />
            ) : (
              <CodeLines lines={USERS_CODE.filter((_, i) => i < 2 || i > 5)} active={test.status === 422 ? [1] : [1, 4]} title="read_users" />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusPill code={test.status} text={test.status === 200 ? 'OK' : 'Unprocessable Entity'} />
              {test.status === 422 && <span className="text-[10px] text-gray-400">read_users never ran</span>}
            </div>
            <Mono className={test.status === 200 ? 'text-emerald-100' : 'text-rose-100'}>{test.body}</Mono>
            {test.fn === 'item' && (
              <Lesson title="q: Optional[str] = None">
                <span className="font-mono">Optional[str]</span> means q can be a string or None. <span className="font-mono">= None</span> makes it optional: when the URL has no q, it is None, <span className="font-mono">if q:</span> is false, and "query_param" is not added.
              </Lesson>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 13. A basic POST endpoint (and why the browser can't test it)        */
/* ------------------------------------------------------------------ */

const POST_CODE = [
  '# main.py (add this function)',
  'from fastapi import FastAPI',
  'from typing import Optional',
  '',
  'app = FastAPI()',
  '',
  '# ... (all previous endpoints) ...',
  '',
  '@app.post("/items/")',
  'async def create_item():',
  '    """',
  '    Placeholder endpoint for creating a new item.',
  '    Currently just returns a confirmation message.',
  '    Data reception will be handled in Chapter 2.',
  '    """',
  "    # In Chapter 2, we'll learn how to receive data here",
  '    return {"message": "Item received (but not processed yet)"}',
];

const POST_STEPS = [
  { title: 'Add @app.post("/items/")', text: 'Defining a POST endpoint looks just like GET, with the @app.post() decorator. POST is used to send data to the server to create or update a resource.', sender: null },
  { title: 'Type the URL in the browser…', text: 'The address bar can only make GET requests. So typing http://127.0.0.1:8000/items/ sends GET /items/, not POST.', sender: 'browser' },
  { title: '…and routing says 405', text: 'The path /items/ exists, but only for POST. FastAPI replies 405 Method Not Allowed (with an Allow: POST header). create_item never runs.', sender: 'browser' },
  { title: 'Send a real POST with a tool', text: 'A tool that can choose the method — the /docs page or curl — sends POST /items/. Routing matches create_item, which returns the confirmation message.', sender: 'tool' },
  { title: 'What about sending data?', text: 'The function declares no parameter for a body yet, so any data sent is simply ignored. Receiving and validating request bodies uses Pydantic models — Chapter 2.', sender: 'tool' },
];

export function PostEndpointVisualizer() {
  const stepper = useStepper(POST_STEPS.length, 2200);
  const step = stepper.index;
  const frame = POST_STEPS[step];
  const method = frame.sender === 'browser' ? 'GET' : 'POST';

  return (
    <Frame
      title="A basic POST endpoint"
      hint="Step through adding the endpoint, trying it from the browser, and then sending a real POST."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={POST_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Lesson title={`${step + 1}. ${frame.title}`}>{frame.text}</Lesson>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div className="space-y-2">
            <div className={`rounded-xl border p-2.5 flex items-center gap-2 transition-all ${frame.sender === 'browser' ? 'border-sky-400/60 bg-sky-500/10' : 'border-gray-800 opacity-50'}`}>
              <Globe className="w-5 h-5 text-sky-300" />
              <div>
                <p className="text-xs text-white font-semibold">Browser address bar</p>
                <p className="text-[10px] text-gray-400">GET only</p>
              </div>
            </div>
            <div className={`rounded-xl border p-2.5 flex items-center gap-2 transition-all ${frame.sender === 'tool' ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-gray-800 opacity-50'}`}>
              <TerminalIcon className="w-5 h-5 text-emerald-300" />
              <div>
                <p className="text-xs text-white font-semibold">/docs or curl</p>
                <p className="text-[10px] text-gray-400">any method</p>
              </div>
            </div>
          </div>

          <div className="w-28 h-16 relative">
            {frame.sender && (
              <motion.div
                key={`${step}-${method}`}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 30, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute top-3 left-6 flex flex-col items-center"
              >
                <Mail className="w-7 h-7 text-gray-200" />
                <span className={`px-1.5 rounded text-[9px] font-bold ${METHOD_TONE[method]}`}>{method} /items/</span>
                {step === 4 && <span className="text-[8px] text-gray-400 mt-0.5">+ {'{"name": "Iris"}'}</span>}
              </motion.div>
            )}
          </div>

          <div className="rounded-xl border border-gray-700 bg-gray-950 p-2.5">
            <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">route table</p>
            {[
              ['GET', '/'],
              ['GET', '/users/'],
              ['GET', '/items/{item_id}'],
            ].map(([m, p]) => (
              <p key={p} className="font-mono text-[10px] text-gray-400"><span className="text-sky-300">{m}</span> {p}</p>
            ))}
            <motion.p
              initial={false}
              animate={{ opacity: 1 }}
              className={`font-mono text-[10px] rounded px-1 -mx-1 ${step === 0 ? 'bg-emerald-500/25 text-white' : step === 2 ? 'bg-amber-500/20 text-amber-100' : step >= 3 ? 'bg-emerald-500/20 text-white' : 'text-gray-300'}`}
            >
              <span className="text-emerald-300">POST</span> /items/ → create_item
            </motion.p>
          </div>
        </div>

        {step >= 2 && (
          <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 gap-3">
            {step === 2 ? (
              <BrowserMock url="http://127.0.0.1:8000/items/">{'{"detail":"Method Not Allowed"}'}</BrowserMock>
            ) : (
              <Mono className="text-emerald-100">{'{"message":"Item received (but not processed yet)"}'}</Mono>
            )}
            <div className="rounded-xl border border-gray-700 p-2.5 font-mono text-[11px] space-y-1">
              {step === 2 ? <StatusPill code={405} text="Method Not Allowed" /> : <StatusPill code={200} text="OK" />}
              <p className="text-gray-400">content-type: application/json</p>
              {step === 2 && <p className="text-amber-200">allow: POST</p>}
              {step === 4 && <p className="text-gray-500 font-sans text-[10px]">The body was sent, but create_item has no parameter to receive it.</p>}
            </div>
          </motion.div>
        )}

        <CodeLines lines={POST_CODE} active={step === 0 ? [8, 9] : step >= 3 ? [16] : []} title="main.py" />
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 14. Testing POST: /docs and curl                                       */
/* ------------------------------------------------------------------ */

const DOCS_STEPS = [
  { title: 'Open /docs', text: 'Navigate to http://127.0.0.1:8000/docs. Swagger UI lists every endpoint of your app.' },
  { title: 'Find POST /items/ and expand it', text: 'The green row is the POST endpoint. Expanding it shows its description (your docstring) and parameters — none yet.' },
  { title: 'Click “Try it out”', text: 'The panel becomes editable and an Execute button appears.' },
  { title: 'Click “Execute”', text: 'Swagger UI sends a real POST request to your running server and shows the equivalent curl command, the request URL, and the server’s response.' },
];

const CURL_PARTS = [
  { id: 'curl', text: 'curl', note: 'A command-line tool for making HTTP requests.' },
  { id: 'x', text: '-X POST', note: 'The -X POST flag specifies the HTTP method. Without it, curl sends GET.' },
  { id: 'url', text: 'http://127.0.0.1:8000/items/', note: 'The address of your endpoint.' },
  { id: 'h', text: '-H "accept: application/json"', note: 'The -H flag adds a header — here, saying we accept JSON responses.' },
];

export function TestPostVisualizer() {
  const [tab, setTab] = useState('docs');
  const docs = useStepper(DOCS_STEPS.length, 1800);
  const [part, setPart] = useState('x');
  const [ran, setRan] = useState(null);
  const d = docs.index;

  const runCurl = (withMethod) => setRan(withMethod ? 'post' : 'get');

  return (
    <Frame
      title="Testing a POST endpoint"
      hint={tab === 'docs' ? 'Step through testing from the interactive docs.' : 'Click each piece of the curl command, then run it.'}
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(tab === 'docs')} onClick={() => setTab('docs')}>1. FastAPI docs</button>
            <button type="button" className={tabClass(tab === 'curl')} onClick={() => setTab('curl')}>2. curl</button>
          </div>
          {tab === 'docs' && <StepControls stepper={docs} total={DOCS_STEPS.length} />}
        </div>
      }
    >
      {tab === 'docs' ? (
        <div className="space-y-3">
          <Lesson title={`${d + 1}. ${DOCS_STEPS[d].title}`}>{DOCS_STEPS[d].text}</Lesson>
          <BrowserMock url="http://127.0.0.1:8000/docs">
            <div className="font-sans space-y-1.5">
              <p className="text-sm font-bold text-white">Simple API Practice <span className="text-[9px] px-1 rounded bg-gray-700 text-gray-300 align-middle">0.1.0</span></p>
              <SwaggerRow method="GET" path="/" summary="Read Root" open={false} onClick={() => {}} />
              <SwaggerRow method="GET" path="/users/" summary="Read Users" open={false} onClick={() => {}} />
              <SwaggerRow method="GET" path="/items/{item_id}" summary="Read Item" open={false} onClick={() => {}} />
              <motion.div animate={{ scale: d === 1 ? [1, 1.02, 1] : 1 }} transition={{ duration: 0.6 }}>
                <SwaggerRow method="POST" path="/items/" summary="Create Item" open={d >= 1} onClick={() => docs.pick(d >= 1 ? 0 : 1)}>
                  <p className="text-gray-400">Placeholder endpoint for creating a new item via POST.</p>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Parameters: No parameters</span>
                    <button
                      type="button"
                      onClick={() => docs.pick(2)}
                      className={`ml-auto px-2 py-0.5 rounded border text-[10px] ${d >= 2 ? 'border-rose-400/60 text-rose-200' : 'border-gray-400 text-gray-200 hover:bg-gray-800'}`}
                    >
                      {d >= 2 ? 'Cancel' : 'Try it out'}
                    </button>
                  </div>
                  {d >= 2 && (
                    <button type="button" onClick={() => docs.pick(3)} className="block w-full text-center rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold py-1">
                      Execute
                    </button>
                  )}
                  {d >= 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
                      <p className="text-gray-500">Curl</p>
                      <Mono className="text-gray-200">{"curl -X 'POST' \\\n  'http://127.0.0.1:8000/items/' \\\n  -H 'accept: application/json' \\\n  -d ''"}</Mono>
                      <p className="text-gray-500">Request URL <span className="font-mono text-gray-300">http://127.0.0.1:8000/items/</span></p>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Server response</span>
                        <StatusPill code={200} text="OK" />
                      </div>
                      <Mono className="text-emerald-100">{'{\n  "message": "Item received (but not processed yet)"\n}'}</Mono>
                    </motion.div>
                  )}
                </SwaggerRow>
              </motion.div>
            </div>
          </BrowserMock>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-700 bg-black/80 px-3 py-3 font-mono text-[13px] flex flex-wrap gap-x-1.5 gap-y-1 items-center">
            <span className="text-teal-400 text-[11px]">$</span>
            {CURL_PARTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPart(p.id)}
                className={`rounded px-1 ${part === p.id ? 'bg-teal-500/30 text-white' : 'text-gray-200 hover:bg-gray-800'}`}
              >
                {p.text}
              </button>
            ))}
          </div>
          <Lesson title={CURL_PARTS.find((p) => p.id === part).text}>{CURL_PARTS.find((p) => p.id === part).note}</Lesson>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => runCurl(true)} className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold">
              Run the command
            </button>
            <button type="button" onClick={() => runCurl(false)} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold">
              What if I forget -X POST?
            </button>
          </div>
          {ran && (
            <motion.div key={ran} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <Terminal
                title="terminal"
                lines={
                  ran === 'post'
                    ? [
                        { kind: 'cmd', text: 'curl -X POST http://127.0.0.1:8000/items/ -H "accept: application/json"' },
                        { kind: 'ok', text: '{"message":"Item received (but not processed yet)"}' },
                      ]
                    : [
                        { kind: 'cmd', text: 'curl http://127.0.0.1:8000/items/ -H "accept: application/json"' },
                        { kind: 'warn', text: '{"detail":"Method Not Allowed"}' },
                      ]
                }
              />
              <Terminal
                title="uvicorn server log"
                lines={[
                  ran === 'post'
                    ? { kind: 'out', text: 'INFO:     127.0.0.1:52544 - "POST /items/ HTTP/1.1" 200 OK' }
                    : { kind: 'warn', text: 'INFO:     127.0.0.1:52545 - "GET /items/ HTTP/1.1" 405 Method Not Allowed' },
                ]}
              />
              <p className="text-[11px] text-gray-400">
                {ran === 'post'
                  ? 'Same result as the docs page — both are just HTTP clients sending POST.'
                  : 'Without -X POST, curl defaults to GET — the same mistake as typing the URL in the browser.'}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 15. The complete main.py                                               */
/* ------------------------------------------------------------------ */

const COMPLETE_BASE = [
  '# main.py',
  'from fastapi import FastAPI',
  'from typing import Optional',
  '',
  'app = FastAPI(title="Simple API Practice", version="0.1.0")',
  '',
  '@app.get("/")',
  'async def read_root():',
  '    """',
  '    Root endpoint returning a message.',
  '    """',
  '    return {"message": "To the ML Model API"}',
  '',
  '@app.get("/users/")',
  'async def read_users(skip: int = 0, limit: int = 10):',
  '    """',
  '    Retrieves a list of users, with optional pagination.',
  "    Uses query parameters 'skip' and 'limit'.",
  '    """',
  '    all_users = [{"user_id": i, "name": f"User {i}"} for i in range(100)]',
  '    return all_users[skip : skip + limit]',
  '',
  '@app.get("/items/{item_id}")',
  'async def read_item(item_id: int, q: Optional[str] = None):',
  '    """',
  "    Retrieves an item by ID (path parameter), with an optional query parameter 'q'.",
  '    """',
  '    response = {"item_id": item_id, "description": f"Details for item {item_id}"}',
  '    if q:',
  '        response.update({"query_param": q})',
  '    return response',
  '',
  '@app.post("/items/")',
  'async def create_item():',
  '    """',
  '    Placeholder endpoint for creating a new item via POST.',
  '    """',
  '    return {"message": "Item received (but not processed yet)"}',
  '',
  '# To run: uvicorn main:app --reload',
];

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

const ENDPOINTS = [
  {
    id: 'root', method: 'GET', path: '/', summary: 'Read Root', lines: range(6, 11),
    params: [], example: 'GET /', status: 200, body: '{"message":"To the ML Model API"}',
  },
  {
    id: 'users', method: 'GET', path: '/users/', summary: 'Read Users', lines: range(13, 20),
    params: [['skip', 'query', 'int', '0'], ['limit', 'query', 'int', '10']], example: 'GET /users/?skip=10&limit=5', status: 200, body: '[{"user_id":10,"name":"User 10"}, … 5 users]',
  },
  {
    id: 'item', method: 'GET', path: '/items/{item_id}', summary: 'Read Item', lines: range(22, 30),
    params: [['item_id', 'path', 'int', 'required'], ['q', 'query', 'str | None', 'None']], example: 'GET /items/5?q=somequery', status: 200, body: '{"item_id":5,"description":"Details for item 5","query_param":"somequery"}',
  },
  {
    id: 'post', method: 'POST', path: '/items/', summary: 'Create Item', lines: range(32, 37),
    params: [], example: 'POST /items/', status: 200, body: '{"message":"Item received (but not processed yet)"}',
  },
];

export function CompleteAppVisualizer() {
  const [sel, setSel] = useState('item');
  const [titled, setTitled] = useState(true);
  const ep = ENDPOINTS.find((e) => e.id === sel);
  const code = titled ? COMPLETE_BASE : COMPLETE_BASE.map((l, i) => (i === 4 ? 'app = FastAPI()' : l));

  return (
    <Frame
      title="The complete main.py — and the docs it produces"
      hint="Click an endpoint in the docs to highlight its code and see its parameters and an example call. Toggle the title and version."
    >
      <div className="space-y-3">
        <div className="grid md:grid-cols-[1.15fr_1fr] gap-3">
          <div className="max-h-[26rem] overflow-auto custom-scroll rounded-xl">
            <CodeLines lines={code} active={[...ep.lines, ...(titled ? [4] : [])]} title="main.py" onLineClick={(i) => {
              const hit = ENDPOINTS.find((e) => e.lines.includes(i));
              if (hit) setSel(hit.id);
              if (i === 4) setTitled((t) => !t);
            }} />
          </div>
          <div className="space-y-2">
            <BrowserMock url="http://127.0.0.1:8000/docs">
              <div className="font-sans space-y-1.5">
                <div className="flex items-center gap-2">
                  <motion.p key={String(titled)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-white">
                    {titled ? 'Simple API Practice' : 'FastAPI'}
                  </motion.p>
                  <span className="text-[9px] px-1 rounded bg-gray-700 text-gray-300">0.1.0</span>
                  <span className="text-[9px] px-1 rounded bg-emerald-700/60 text-emerald-100">OAS 3.1</span>
                </div>
                {ENDPOINTS.map((e) => (
                  <SwaggerRow key={e.id} method={e.method} path={e.path} summary={e.summary} open={false} onClick={() => setSel(e.id)} />
                ))}
              </div>
            </BrowserMock>
            <label className="flex items-center gap-2 text-[11px] text-gray-300">
              <input type="checkbox" className="accent-teal-500" checked={titled} onChange={(e) => setTitled(e.target.checked)} />
              <span className="font-mono">FastAPI(title="Simple API Practice", version="0.1.0")</span>
            </label>
            <p className="text-[10px] text-gray-500">{titled ? 'title and version are shown at the top of /docs and /redoc.' : 'Without them, the docs fall back to the defaults: “FastAPI”, version 0.1.0.'}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={sel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                <span className={`px-1.5 rounded text-[9px] font-bold mr-1 ${METHOD_TONE[ep.method]}`}>{ep.method}</span>
                <span className="font-mono normal-case text-white">{ep.path}</span> · parameters
              </p>
              {ep.params.length ? (
                ep.params.map(([name, src, type, def]) => (
                  <p key={name} className="font-mono text-[11px] text-gray-300">
                    <span className="text-white">{name}</span> <span className={src === 'path' ? 'text-amber-200' : 'text-cyan-200'}>({src})</span> {type} <span className="text-gray-500">default: {def}</span>
                  </p>
                ))
              ) : (
                <p className="text-[11px] text-gray-500">No parameters</p>
              )}
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 space-y-1">
              <p className="font-mono text-[11px] text-sky-100">{ep.example}</p>
              <StatusPill code={ep.status} text="OK" />
              <p className="font-mono text-[11px] text-emerald-100 break-all">{ep.body}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 16. Recap quiz: predict the response                                  */
/* ------------------------------------------------------------------ */

const QUIZ = [
  {
    req: 'GET /items/42',
    options: ['422 validation error', '200 {"item_id":"42","description":"Details for item 42"}', '200 {"item_id":42,"description":"Details for item 42"}', '404 Not Found'],
    answer: 2,
    why: 'The : int hint converted the string "42" into the number 42 — notice there are no quotes around 42 in the JSON.',
    stage: 'Parameter parsing → your function',
  },
  {
    req: 'GET /items/abc',
    options: ['422 Unprocessable Entity', '404 Not Found', '500 Internal Server Error', '200 {"item_id":"abc",…}'],
    answer: 0,
    why: '"abc" cannot become an int. FastAPI rejects it during validation; read_item is never called.',
    stage: 'Parameter parsing & validation',
  },
  {
    req: 'GET /users/?skip=95',
    options: ['200 with 10 users', '422 because limit is missing', '200 with 5 users (95–99)', '404 Not Found'],
    answer: 2,
    why: 'limit falls back to its default 10, but all_users[95:105] only has 5 items left — Python slicing stops at the end of the list.',
    stage: 'Defaults → your function',
  },
  {
    req: 'Typing http://127.0.0.1:8000/items/ in the browser',
    options: ['200 {"message":"Item received (but not processed yet)"}', '405 Method Not Allowed', '404 Not Found', '422 Unprocessable Entity'],
    answer: 1,
    why: 'The browser sends GET, but /items/ only has a POST operation. The path exists, the method doesn’t → 405.',
    stage: 'Routing',
  },
  {
    req: 'GET /items/5?q=fast',
    options: ['200 without query_param', '422 because q is unknown', '404 Not Found', '200 {"item_id":5,"description":"Details for item 5","query_param":"fast"}'],
    answer: 3,
    why: 'q is an optional query parameter. It is set, so if q: is true and "query_param" is added to the response.',
    stage: 'Parameter parsing → your function',
  },
  {
    req: 'GET /predict',
    options: ['404 Not Found', '405 Method Not Allowed', '422 Unprocessable Entity', '500 Internal Server Error'],
    answer: 0,
    why: 'No path operation matches /predict at all (yet!). Routing fails → 404 {"detail":"Not Found"}.',
    stage: 'Routing',
  },
  {
    req: 'curl -X POST http://127.0.0.1:8000/items/',
    options: ['201 Created', '200 {"message":"Item received (but not processed yet)"}', '405 Method Not Allowed', '422 because there is no body'],
    answer: 1,
    why: 'POST matches create_item. FastAPI’s default status code is 200, and the function declares no body, so none is required.',
    stage: 'Routing → your function',
  },
];

export function RecapQuizVisualizer() {
  const stepper = useStepper(QUIZ.length, 4000);
  const [answers, setAnswers] = useState({});
  const q = QUIZ[stepper.index];
  const picked = answers[stepper.index];
  const score = Object.entries(answers).filter(([i, a]) => QUIZ[i].answer === a).length;

  return (
    <Frame
      title="Predict the response"
      hint="Everything from this part in one game: routing, path and query parameters, defaults, validation, and methods. Pick an answer to reveal why."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs text-gray-300">
            Score <span className="font-mono text-teal-300">{score}</span> / {QUIZ.length}
            {Object.keys(answers).length > 0 && (
              <button type="button" onClick={() => { setAnswers({}); stepper.reset(); }} className="ml-3 text-[10px] text-gray-400 underline">
                restart
              </button>
            )}
          </span>
          <StepControls stepper={stepper} total={QUIZ.length} showPlay={false} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-700 bg-black/70 px-3 py-3">
          <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">request {stepper.index + 1} · running the complete main.py</p>
          <p className="font-mono text-sm text-sky-100">{q.req}</p>
        </div>

        <div className="grid gap-2">
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const isAnswer = q.answer === i;
            const reveal = picked !== undefined;
            return (
              <button
                key={opt}
                type="button"
                disabled={reveal}
                onClick={() => setAnswers((a) => ({ ...a, [stepper.index]: i }))}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left font-mono text-[11px] transition-all ${
                  reveal
                    ? isAnswer
                      ? 'border-emerald-400/70 bg-emerald-500/15 text-white'
                      : isPicked
                        ? 'border-rose-400/70 bg-rose-500/15 text-rose-100'
                        : 'border-gray-800 text-gray-600'
                    : 'border-gray-700 text-gray-200 hover:border-teal-400/60 hover:bg-teal-500/10'
                }`}
              >
                {reveal && isAnswer && <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />}
                {reveal && isPicked && !isAnswer && <XCircle className="w-4 h-4 text-rose-300 shrink-0" />}
                {!reveal && <Pencil className="w-3.5 h-3.5 text-gray-600 shrink-0" />}
                <span className="break-all">{opt}</span>
              </button>
            );
          })}
        </div>

        {picked !== undefined && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <Lesson title={`${picked === q.answer ? 'Correct' : 'Not quite'} · decided at: ${q.stage}`}>{q.why}</Lesson>
          </motion.div>
        )}

        <div className="grid grid-cols-7 gap-1">
          {QUIZ.map((item, i) => {
            const a = answers[i];
            return (
              <button
                key={item.req}
                type="button"
                onClick={() => stepper.pick(i)}
                className={`h-1.5 rounded-full ${a === undefined ? (i === stepper.index ? 'bg-teal-400' : 'bg-gray-700') : a === item.answer ? 'bg-emerald-400' : 'bg-rose-400'}`}
                aria-label={`Question ${i + 1}`}
              />
            );
          })}
        </div>

        <p className="text-[11px] text-gray-500">
          Next chapter: request bodies for POST with Pydantic models — so create_item can actually receive and validate data.
        </p>
      </div>
    </Frame>
  );
}
