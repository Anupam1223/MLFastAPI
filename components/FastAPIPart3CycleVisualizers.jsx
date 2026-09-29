import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Server, Zap, Code2, ArrowRight } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines } from './VisualKit';

/* ------------------------------------------------------------------ */
/* Shared: the four actors of the cycle                                  */
/* ------------------------------------------------------------------ */

const ACTORS = [
  { id: 'client', label: 'Client', sub: 'browser, app, curl', Icon: Monitor, on: 'border-sky-400 bg-sky-500/20 text-sky-50', icon: 'text-sky-300' },
  { id: 'asgi', label: 'ASGI Server', sub: 'e.g. Uvicorn', Icon: Server, on: 'border-emerald-400 bg-emerald-500/20 text-emerald-50', icon: 'text-emerald-300' },
  { id: 'fastapi', label: 'FastAPI App', sub: 'routing, validation', Icon: Zap, on: 'border-amber-400 bg-amber-500/20 text-amber-50', icon: 'text-amber-300' },
  { id: 'func', label: 'Path Operation', sub: 'your code', Icon: Code2, on: 'border-violet-400 bg-violet-500/20 text-violet-50', icon: 'text-violet-300' },
];

const EDGE_INDEX = { 'c-a': 0, 'a-f': 1, 'f-p': 2 };

/** Compact 4-box diagram. `active` = actor id, `edge` = { at: 'c-a'|'a-f'|'f-p', dir: 'req'|'res' }. */
export function CycleDiagram({ active, edge }) {
  return (
    <div className="relative grid grid-cols-4 gap-3">
      <div className="absolute -inset-y-2 left-[calc(25%_-_0.25rem)] right-[-0.5rem] border border-dashed border-gray-600 rounded-xl pointer-events-none">
        <span className="absolute -top-2 right-3 bg-gray-900 px-1 text-[9px] uppercase tracking-wider text-gray-500">server environment</span>
      </div>
      {ACTORS.map((actor, i) => {
        const on = active === actor.id;
        const Icon = actor.Icon;
        const edgeHere = edge && EDGE_INDEX[edge.at] === i;
        return (
          <div key={actor.id} className="relative">
            <motion.div
              animate={{ scale: on ? 1.04 : 1 }}
              className={`rounded-lg border px-2 py-1.5 text-center transition-colors ${on ? actor.on : 'border-gray-700 bg-gray-900/80 text-gray-400'}`}
            >
              <Icon className={`w-4 h-4 mx-auto ${on ? actor.icon : 'text-gray-600'}`} />
              <p className="text-[11px] font-semibold leading-tight mt-0.5">{actor.label}</p>
              <p className="text-[9px] opacity-70 leading-tight">{actor.sub}</p>
            </motion.div>
            {i < 3 && (
              <div className="absolute top-1/2 -right-3 w-3 -translate-y-1/2 flex flex-col items-center text-[10px] leading-none z-10">
                <span className={edgeHere && edge.dir === 'req' ? 'text-teal-300 font-bold' : 'text-gray-600'}>›</span>
                <span className={edgeHere && edge.dir === 'res' ? 'text-teal-300 font-bold' : 'text-gray-600'}>‹</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const Mono = ({ children, className = '' }) => (
  <pre className={`font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all rounded-lg bg-black/60 border border-gray-800 p-2.5 text-gray-200 ${className}`}>
    {children}
  </pre>
);

const STATUS_TONE = (code) =>
  code < 300 ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50' : code < 500 ? 'bg-amber-500/20 text-amber-200 border-amber-400/50' : 'bg-rose-500/20 text-rose-200 border-rose-400/50';

export const StatusPill = ({ code, text }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full border font-mono text-[11px] font-bold ${STATUS_TONE(code)}`}>
    {code} {text}
  </span>
);

/* ------------------------------------------------------------------ */
/* 1. The whole trip at a glance                                          */
/* ------------------------------------------------------------------ */

const HOPS = [
  {
    at: 0, lane: 'req', title: 'The client builds a request',
    format: 'An HTTP request (text)',
    data: 'GET /items/5?query_param=abc HTTP/1.1\nHost: 127.0.0.1:8000\nAccept: application/json',
    text: 'A browser, mobile app, curl, or Python’s requests library prepares an HTTP request for the address where your app runs.',
  },
  {
    at: 0.5, lane: 'req', title: 'HTTP Request travels over the network',
    format: 'Raw bytes on a socket',
    data: 'b"GET /items/5?query_param=abc HTTP/1.1\\r\\nHost: 127.0.0.1:8000\\r\\n..."',
    text: 'The request reaches the address and port Uvicorn is listening on: 127.0.0.1:8000.',
  },
  {
    at: 1.5, lane: 'req', title: 'Uvicorn hands FastAPI an ASGI scope',
    format: 'A Python dictionary',
    data: "scope = {\n  'type': 'http',\n  'method': 'GET',\n  'path': '/items/5',\n  'query_string': b'query_param=abc',\n  'headers': [(b'host', b'127.0.0.1:8000'), ...],\n}",
    text: 'The ASGI server parses the raw bytes into a standard Python dict — the scope — and passes it to the FastAPI application.',
  },
  {
    at: 2.5, lane: 'req', title: 'FastAPI calls your function',
    format: 'A normal Python function call',
    data: 'await read_item(item_id=5, query_param="abc")',
    text: 'FastAPI finds the matching route, turns the URL pieces into typed arguments, and calls your path operation function with them.',
  },
  {
    at: 2.5, lane: 'res', title: 'Your function returns a value',
    format: 'A Python object (dict, list, model…)',
    data: "{'item_id': 5, 'query_param': 'abc'}",
    text: 'You just return Python data. No HTTP, no JSON strings — FastAPI handles those.',
  },
  {
    at: 1.5, lane: 'res', title: 'FastAPI builds an HTTP response',
    format: 'Status + headers + JSON body',
    data: 'status: 200\nheaders: content-type: application/json\nbody: {"item_id":5,"query_param":"abc"}',
    text: 'FastAPI converts the return value to JSON, sets the Content-Type header, and gives the response to the ASGI server.',
  },
  {
    at: 0.5, lane: 'res', title: 'HTTP Response travels back',
    format: 'Raw bytes on a socket',
    data: 'b"HTTP/1.1 200 OK\\r\\ncontent-type: application/json\\r\\n\\r\\n{\\"item_id\\":5,...}"',
    text: 'Uvicorn writes the response bytes back over the network connection.',
  },
  {
    at: 0, lane: 'res', title: 'The client receives the result',
    format: 'JSON shown to the user / parsed by code',
    data: '{"item_id":5,"query_param":"abc"}',
    text: 'The browser shows the JSON, or the calling program parses it. The cycle repeats for every incoming request.',
  },
];

const HOP_ACTIVE = ['client', null, 'fastapi', 'func', 'func', 'fastapi', null, 'client'];

export function CycleOverviewVisualizer() {
  const stepper = useStepper(HOPS.length, 1700);
  const hop = HOPS[stepper.index];
  const x = 12.5 + hop.at * 25;

  return (
    <Frame
      title="One request, one round trip"
      hint="Follow the packet. The top lane carries the request in; the bottom lane carries the response out. Watch how the data changes shape at each hop."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={HOPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Lesson title={`${stepper.index + 1}. ${hop.title}`}>{hop.text}</Lesson>

        <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-3">
          <div className="relative h-7">
            <span className="absolute left-0 top-1.5 text-[9px] uppercase tracking-wider text-gray-600">request →</span>
            {hop.lane === 'req' && (
              <motion.div
                initial={false}
                animate={{ left: `${x}%`, x: '-50%' }}
                transition={{ type: 'spring', stiffness: 110, damping: 18 }}
                className="absolute top-0 px-2 py-1 rounded-md bg-teal-500 text-gray-950 text-[10px] font-bold shadow-lg shadow-teal-500/30 whitespace-nowrap"
              >
                {hop.format.split(' (')[0]}
              </motion.div>
            )}
          </div>

          <div className="relative grid grid-cols-4 gap-3 my-2">
            <div className="absolute -inset-y-2 left-[calc(25%_-_0.4rem)] -right-1.5 border border-dashed border-gray-600 rounded-xl pointer-events-none">
              <span className="absolute -top-2 right-3 bg-gray-950 px-1 text-[9px] uppercase tracking-wider text-gray-500">server environment</span>
            </div>
            {ACTORS.map((actor) => {
              const on = HOP_ACTIVE[stepper.index] === actor.id;
              const Icon = actor.Icon;
              return (
                <motion.div
                  key={actor.id}
                  animate={{ scale: on ? 1.06 : 1 }}
                  className={`rounded-xl border p-2.5 text-center transition-colors ${on ? actor.on : 'border-gray-700 bg-gray-900 text-gray-400'}`}
                >
                  <Icon className={`w-5 h-5 mx-auto ${on ? actor.icon : 'text-gray-600'}`} />
                  <p className="text-xs font-semibold mt-1">{actor.label}</p>
                  <p className="text-[10px] opacity-70">{actor.sub}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="relative h-7">
            <span className="absolute left-0 bottom-1.5 text-[9px] uppercase tracking-wider text-gray-600">← response</span>
            {hop.lane === 'res' && (
              <motion.div
                initial={false}
                animate={{ left: `${x}%`, x: '-50%' }}
                transition={{ type: 'spring', stiffness: 110, damping: 18 }}
                className="absolute bottom-0 px-2 py-1 rounded-md bg-amber-400 text-gray-950 text-[10px] font-bold shadow-lg shadow-amber-500/30 whitespace-nowrap"
              >
                {hop.format.split(' (')[0]}
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={stepper.index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
              what the data looks like here · <span className="text-teal-300 normal-case">{hop.format}</span>
            </p>
            <Mono>{hop.data}</Mono>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-400">
          <p><span className="text-sky-300 font-semibold">Client</span> speaks HTTP</p>
          <p><span className="text-emerald-300 font-semibold">Uvicorn</span> translates HTTP ⇄ Python</p>
          <p><span className="text-amber-300 font-semibold">FastAPI</span> routes, validates, converts</p>
          <p><span className="text-violet-300 font-semibold">You</span> write plain Python</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Step 1 – what a request is made of                                 */
/* ------------------------------------------------------------------ */

const PART_TONE = {
  method: 'bg-rose-500/25 text-rose-100',
  path: 'bg-amber-500/25 text-amber-100',
  query: 'bg-cyan-500/25 text-cyan-100',
  headers: 'bg-violet-500/25 text-violet-100',
  body: 'bg-emerald-500/25 text-emerald-100',
};

const PART_INFO = {
  method: { label: 'HTTP Method', text: 'The verb: what the client wants to do. GET reads, POST creates/sends data, PUT replaces, DELETE removes. FastAPI uses it (with the path) to pick your function.' },
  path: { label: 'Path', text: 'Which resource: /items/5. Parts of the path can be variables — here 5 is the item id — which FastAPI extracts as path parameters.' },
  query: { label: 'Query Parameters (optional)', text: 'Extra key=value options after the ?. Used for filtering, sorting, pagination. FastAPI maps them to function arguments that are not in the path.' },
  headers: { label: 'Headers', text: 'Metadata about the request: Host, Content-Type (format of the body), Authorization (who is calling), Accept (what format the client wants back).' },
  body: { label: 'Request Body (optional)', text: 'The data payload, usually JSON. Common with POST and PUT — e.g. the features you want a model to score. GET requests normally have no body.' },
};

const CLIENTS = [
  { id: 'browser', label: 'Web browser' },
  { id: 'curl', label: 'curl' },
  { id: 'requests', label: 'Python requests' },
];

export function RequestAnatomyVisualizer() {
  const [method, setMethod] = useState('GET');
  const [withQuery, setWithQuery] = useState(true);
  const [withAuth, setWithAuth] = useState(false);
  const [withBody, setWithBody] = useState(true);
  const [client, setClient] = useState('curl');
  const [focus, setFocus] = useState('method');

  const bodyAllowed = method === 'POST' || method === 'PUT';
  const body = bodyAllowed && withBody;
  const url = `http://127.0.0.1:8000/items/5${withQuery ? '?query_param=abc' : ''}`;
  const bodyText = '{"name": "Iris model", "price": 9.5}';

  const headerLines = [
    'Host: 127.0.0.1:8000',
    'Accept: application/json',
    ...(body ? ['Content-Type: application/json'] : []),
    ...(withAuth ? ['Authorization: Bearer abc123'] : []),
  ];

  const seg = (part, text) => (
    <button
      type="button"
      onClick={() => setFocus(part)}
      className={`rounded px-0.5 transition-all ${PART_TONE[part]} ${focus === part ? 'ring-2 ring-white/70' : 'opacity-80 hover:opacity-100'}`}
    >
      {text}
    </button>
  );

  let clientCode;
  if (client === 'browser') {
    clientCode = method === 'GET' ? `Address bar:  ${url}` : `The address bar can only send GET.\nTo send ${method}, use curl, requests, or /docs.`;
  } else if (client === 'curl') {
    clientCode = [
      `curl -X ${method} "${url}"`,
      ...headerLines.slice(1).map((h) => `  -H "${h}"`),
      ...(body ? [`  -d '${bodyText}'`] : []),
    ].join(' \\\n');
  } else {
    const args = [`"http://127.0.0.1:8000/items/5"`];
    if (withQuery) args.push('params={"query_param": "abc"}');
    if (withAuth) args.push('headers={"Authorization": "Bearer abc123"}');
    if (body) args.push('json={"name": "Iris model", "price": 9.5}');
    clientCode = `import requests\n\nr = requests.${method.toLowerCase()}(\n    ${args.join(',\n    ')},\n)\nprint(r.status_code, r.json())`;
  }

  return (
    <Frame
      title="Build a request, then read it"
      hint="Change the method and options. The raw HTTP message below updates; click any coloured part to learn what it is."
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
            <button key={m} type="button" className={tabClass(method === m)} onClick={() => { setMethod(m); setFocus('method'); }}>
              {m}
            </button>
          ))}
          <span className="w-px h-5 bg-gray-700 mx-1" />
          <label className="flex items-center gap-1.5 text-[11px] text-gray-300">
            <input type="checkbox" className="accent-teal-500" checked={withQuery} onChange={(e) => { setWithQuery(e.target.checked); setFocus('query'); }} /> query
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-gray-300">
            <input type="checkbox" className="accent-teal-500" checked={withAuth} onChange={(e) => { setWithAuth(e.target.checked); setFocus('headers'); }} /> auth header
          </label>
          <label className={`flex items-center gap-1.5 text-[11px] ${bodyAllowed ? 'text-gray-300' : 'text-gray-600'}`}>
            <input type="checkbox" className="accent-teal-500" disabled={!bodyAllowed} checked={body} onChange={(e) => { setWithBody(e.target.checked); setFocus('body'); }} /> body
          </label>
        </div>

        <div className="rounded-xl border border-gray-700 bg-black/80 p-3 font-mono text-[12px] leading-relaxed text-gray-400 space-y-0.5">
          <p className="text-[9px] font-sans uppercase tracking-wider text-gray-500 mb-1">the raw HTTP request that goes over the wire</p>
          <p>
            {seg('method', method)} {seg('path', '/items/5')}
            {withQuery && seg('query', '?query_param=abc')} HTTP/1.1
          </p>
          {headerLines.map((h) => (
            <p key={h}>{seg('headers', h)}</p>
          ))}
          <p>&nbsp;</p>
          {body ? <p>{seg('body', bodyText)}</p> : <p className="text-gray-600 text-[11px]">(no body)</p>}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {Object.entries(PART_INFO).map(([id, info]) => {
            const present = id === 'query' ? withQuery : id === 'body' ? body : true;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setFocus(id)}
                className={`rounded-lg px-1.5 py-1.5 text-[10px] font-semibold border transition-all ${PART_TONE[id]} ${
                  focus === id ? 'border-white/70' : 'border-transparent'
                } ${present ? '' : 'opacity-35'}`}
              >
                {info.label.replace(' (optional)', '')}
                {!present && <span className="block text-[9px] font-normal">not sent</span>}
              </button>
            );
          })}
        </div>

        <Lesson title={PART_INFO[focus].label}>{PART_INFO[focus].text}</Lesson>

        <div>
          <div className="flex gap-2 mb-2">
            {CLIENTS.map((c) => (
              <button key={c.id} type="button" className={tabClass(client === c.id)} onClick={() => setClient(c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <Mono className={client === 'browser' && method !== 'GET' ? 'text-amber-200' : 'text-teal-100'}>{clientCode}</Mono>
          <p className="text-[10px] text-gray-500 mt-1">Different clients, same HTTP request underneath — the server can’t tell a browser GET from a curl GET.</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Steps 2–3 – raw HTTP becomes an ASGI scope                         */
/* ------------------------------------------------------------------ */

const RAW_REQ = [
  'POST /items/5?query_param=abc HTTP/1.1',
  'Host: 127.0.0.1:8000',
  'Content-Type: application/json',
  'Content-Length: 22',
  '',
  '{"name": "Iris model"}',
];

const SCOPE_ENTRIES = [
  { step: 1, text: "'type': 'http'," },
  { step: 1, text: "'asgi': {'version': '3.0'}," },
  { step: 1, text: "'http_version': '1.1'," },
  { step: 1, text: "'method': 'POST'," },
  { step: 1, text: "'path': '/items/5'," },
  { step: 1, text: "'raw_path': b'/items/5'," },
  { step: 1, text: "'query_string': b'query_param=abc'," },
  { step: 2, text: "'headers': [" },
  { step: 2, text: "    (b'host', b'127.0.0.1:8000')," },
  { step: 2, text: "    (b'content-type', b'application/json')," },
  { step: 2, text: "    (b'content-length', b'22')," },
  { step: 2, text: '],' },
  { step: 3, text: "'scheme': 'http'," },
  { step: 3, text: "'server': ('127.0.0.1', 8000)," },
  { step: 3, text: "'client': ('127.0.0.1', 52431)," },
  { step: 3, text: "'root_path': ''," },
];

const ASGI_STEPS = [
  { raw: [0, 1, 2, 3, 4, 5], actor: 'asgi', title: 'Raw bytes arrive at Uvicorn', text: 'The ASGI server (Uvicorn) receives the raw HTTP request: just bytes of text on a network socket. Python code can’t use this directly yet.' },
  { raw: [0], actor: 'asgi', title: 'Parse the request line', text: 'The first line gives the method, the path, the query string, and the HTTP version. Uvicorn stores each as a key in a Python dictionary: the ASGI scope.' },
  { raw: [1, 2, 3], actor: 'asgi', title: 'Parse the headers', text: 'Each header becomes a (name, value) pair of byte strings, with names lower-cased. They go into scope["headers"].' },
  { raw: [], actor: 'asgi', title: 'Add connection details', text: 'Uvicorn also records who is connected (client address), which server/port received it, and the scheme (http or https).' },
  { raw: [5], actor: 'asgi', title: 'The body arrives as event messages', text: 'The body is not in the scope. It is delivered as “receive” events, so large bodies can stream in pieces. FastAPI reads them when your function needs the body.' },
  { raw: [], actor: 'fastapi', title: 'FastAPI takes over', text: 'Uvicorn calls your application: await app(scope, receive, send). From here on, FastAPI is in charge — it has the scope, a way to receive the body, and a way to send the response.' },
];

export function AsgiScopeVisualizer() {
  const stepper = useStepper(ASGI_STEPS.length, 2000);
  const step = stepper.index;
  const frame = ASGI_STEPS[step];

  return (
    <Frame
      title="From raw HTTP to a Python dictionary"
      hint="Step through how Uvicorn translates the request. Highlighted lines on the left are being read; new keys light up on the right."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={ASGI_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <CycleDiagram active={frame.actor} edge={step === 5 ? { at: 'a-f', dir: 'req' } : { at: 'c-a', dir: step === 0 ? 'req' : null }} />
        <Lesson title={`${step + 1}. ${frame.title}`}>{frame.text}</Lesson>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-700 bg-black/80 p-3">
            <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">raw HTTP (bytes)</p>
            <div className="font-mono text-[11px] leading-relaxed">
              {RAW_REQ.map((line, i) => (
                <p key={i} className={`rounded px-1 transition-colors ${frame.raw.includes(i) ? 'bg-emerald-500/20 text-emerald-100' : 'text-gray-500'}`}>
                  {line || ' '}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
            <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">ASGI scope (a Python dict)</p>
            <div className="font-mono text-[11px] leading-relaxed">
              <p className="text-gray-400">scope = {'{'}</p>
              {SCOPE_ENTRIES.map((entry, i) => (
                <AnimatePresence key={i}>
                  {step >= entry.step && (
                    <motion.p
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`pl-3 rounded ${step === entry.step ? 'bg-teal-500/20 text-teal-50' : 'text-gray-300'}`}
                    >
                      {entry.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              ))}
              {step < 1 && <p className="pl-3 text-gray-600">(empty)</p>}
              <p className="text-gray-400">{'}'}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl border p-3 transition-all ${step >= 4 ? 'border-violet-400/50 bg-violet-500/10' : 'border-gray-800 opacity-40'}`}>
          <p className="text-[9px] uppercase tracking-wider text-gray-500 mb-1">body, delivered separately via receive()</p>
          <p className="font-mono text-[11px] text-violet-100">{"{'type': 'http.request', 'body': b'{\"name\": \"Iris model\"}', 'more_body': False}"}</p>
        </div>

        <div className={`flex items-center justify-center gap-2 flex-wrap rounded-xl border p-3 font-mono text-[12px] transition-all ${step === 5 ? 'border-amber-400/60 bg-amber-500/10 text-amber-50' : 'border-gray-800 text-gray-600'}`}>
          <span className="text-emerald-300">Uvicorn</span>
          <ArrowRight className="w-4 h-4" />
          <span>await app(scope, receive, send)</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-amber-300">FastAPI</span>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Step 4 – routing                                                    */
/* ------------------------------------------------------------------ */

const BASE_ROUTES = [
  { method: 'GET', path: '/', fn: 'read_root' },
  { method: 'GET', path: '/users/', fn: 'read_users' },
  { method: 'GET', path: '/items/{item_id}', fn: 'read_item' },
  { method: 'POST', path: '/items/', fn: 'create_item' },
];
const LATEST_ROUTE = { method: 'GET', path: '/items/latest', fn: 'read_latest', extra: true };

const ROUTE_REQUESTS = [
  { id: 'item5', method: 'GET', path: '/items/5' },
  { id: 'users', method: 'GET', path: '/users/' },
  { id: 'post', method: 'POST', path: '/items/' },
  { id: 'getItems', method: 'GET', path: '/items/' },
  { id: 'delete', method: 'DELETE', path: '/items/5' },
  { id: 'predict', method: 'GET', path: '/predict' },
  { id: 'latest', method: 'GET', path: '/items/latest' },
];

function matchPath(template, path) {
  const names = [];
  const pattern = template.replace(/\{(\w+)\}/g, (_, name) => {
    names.push(name);
    return '([^/]+)';
  });
  const m = new RegExp(`^${pattern}$`).exec(path);
  if (!m) return null;
  return Object.fromEntries(names.map((n, i) => [n, m[i + 1]]));
}

function buildRoutes(latestPos) {
  if (latestPos === 'before') return [BASE_ROUTES[0], BASE_ROUTES[1], LATEST_ROUTE, BASE_ROUTES[2], BASE_ROUTES[3]];
  if (latestPos === 'after') return [BASE_ROUTES[0], BASE_ROUTES[1], BASE_ROUTES[2], LATEST_ROUTE, BASE_ROUTES[3]];
  return BASE_ROUTES;
}

function RoutingRun({ reqId, setReqId, latestPos, setLatestPos }) {
  const req = ROUTE_REQUESTS.find((r) => r.id === reqId);
  const routes = buildRoutes(latestPos);

  const evals = [];
  let winner = null;
  for (const route of routes) {
    const params = matchPath(route.path, req.path);
    const methodOk = route.method === req.method;
    evals.push({ route, pathOk: !!params, methodOk, params });
    if (params && methodOk) {
      winner = { route, params };
      break;
    }
  }
  const pathMatches = evals.filter((e) => e.pathOk);
  const stepper = useStepper(evals.length + 1, 900);
  const scanning = stepper.index < evals.length ? stepper.index : -1;
  const done = stepper.index === evals.length;

  let result;
  if (winner) {
    const args = Object.entries(winner.params).map(([k, v]) => `${k}="${v}"`).join(', ');
    const lateMismatch = winner.route.fn === 'read_item' && Number.isNaN(Number(winner.params.item_id));
    result = {
      tone: lateMismatch ? 'amber' : 'emerald',
      title: `Match → ${winner.route.fn}(${args})`,
      text: lateMismatch
        ? `The path pattern /items/{item_id} accepts any text, so "latest" is captured as item_id. Routing is done — but item_id: int will reject it in the next step with 422. Declare /items/latest before /items/{item_id} to fix it.`
        : Object.keys(winner.params).length
          ? 'Routing captured the path parameter as a string. Converting it to the declared type happens in the next step (parameter parsing).'
          : 'First matching path operation found. FastAPI moves on to parse parameters and call it.',
    };
  } else if (pathMatches.length) {
    result = {
      tone: 'amber',
      code: 405,
      title: '405 Method Not Allowed',
      text: `The path exists, but not for ${req.method}. FastAPI replies 405 with an Allow: ${pathMatches.map((e) => e.route.method).join(', ')} header — your code never runs.`,
    };
  } else {
    result = { tone: 'rose', code: 404, title: '404 Not Found', text: 'No path operation matches this path. FastAPI replies {"detail":"Not Found"} — your code never runs.' };
  }

  return (
    <Frame
      title="Routing: find the first matching path operation"
      hint="Pick a request. FastAPI scans your routes top to bottom, checking the path pattern and the method, and stops at the first full match."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={evals.length + 1} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {ROUTE_REQUESTS.map((r) => (
            <button key={r.id} type="button" className={`${tabClass(r.id === reqId)} font-mono`} onClick={() => setReqId(r.id)}>
              {r.method} {r.path}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-400 flex-wrap">
          <span>Extra route <span className="font-mono text-teal-200">GET /items/latest</span>:</span>
          {[
            ['none', 'not declared'],
            ['before', 'declared before {item_id}'],
            ['after', 'declared after {item_id}'],
          ].map(([id, label]) => (
            <button key={id} type="button" className={tabClass(latestPos === id)} onClick={() => setLatestPos(id)}>
              {label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden">
          <div className="grid grid-cols-[3.5rem_1fr_6rem_4.5rem_4.5rem] gap-2 px-3 py-1.5 text-[9px] uppercase tracking-wider text-gray-500 border-b border-gray-800">
            <span>method</span><span>path operation</span><span>function</span><span>path?</span><span>method?</span>
          </div>
          {routes.map((route, i) => {
            const ev = evals[i];
            const checked = ev && (i < stepper.index || done);
            const isScan = i === scanning;
            const isWinner = done && winner && winner.route === route;
            return (
              <div
                key={route.method + route.path}
                className={`grid grid-cols-[3.5rem_1fr_6rem_4.5rem_4.5rem] gap-2 px-3 py-1.5 font-mono text-[11px] items-center transition-colors ${
                  isWinner ? 'bg-emerald-500/20' : isScan ? 'bg-teal-500/15' : ''
                } ${route.extra ? 'border-l-2 border-l-cyan-400' : ''}`}
              >
                <span className={route.method === 'GET' ? 'text-emerald-300' : 'text-amber-300'}>{route.method}</span>
                <span className="text-white">{route.path}</span>
                <span className="text-cyan-200 truncate">{route.fn}</span>
                <span>{isScan || checked ? (ev.pathOk ? <span className="text-emerald-300">✓</span> : <span className="text-rose-300">✗</span>) : <span className="text-gray-700">·</span>}</span>
                <span>{isScan || checked ? (ev.methodOk ? <span className="text-emerald-300">✓</span> : <span className="text-rose-300">✗</span>) : <span className="text-gray-700">·</span>}</span>
              </div>
            );
          })}
          {routes.length > evals.length && (
            <p className="px-3 py-1 text-[10px] text-gray-600 border-t border-gray-800">Routes below the match are never checked.</p>
          )}
        </div>

        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-3 ${
              result.tone === 'emerald' ? 'border-emerald-400/50 bg-emerald-500/10' : result.tone === 'amber' ? 'border-amber-400/50 bg-amber-500/10' : 'border-rose-400/50 bg-rose-500/10'
            }`}
          >
            <p className="font-mono text-xs text-white font-semibold">{result.title}</p>
            <p className="text-[11px] text-gray-300 mt-1">{result.text}</p>
          </motion.div>
        ) : (
          <Lesson title={`Checking route ${scanning + 1}`}>
            Does <span className="font-mono">{req.path}</span> fit the pattern <span className="font-mono">{evals[scanning].route.path}</span>? And is the method{' '}
            <span className="font-mono">{req.method}</span>? Both must be true.
          </Lesson>
        )}
      </div>
    </Frame>
  );
}

export function RoutingVisualizer() {
  const [reqId, setReqId] = useState('item5');
  const [latestPos, setLatestPos] = useState('none');
  return <RoutingRun key={`${reqId}-${latestPos}`} reqId={reqId} setReqId={setReqId} latestPos={latestPos} setLatestPos={setLatestPos} />;
}

/* ------------------------------------------------------------------ */
/* 5. Step 5 – parameter parsing and validation                          */
/* ------------------------------------------------------------------ */

const SOURCE_TONE = {
  path: 'bg-amber-500/20 text-amber-200',
  query: 'bg-cyan-500/20 text-cyan-200',
  body: 'bg-emerald-500/20 text-emerald-200',
};

const PARSE_SCENARIOS = {
  path: [
    {
      id: 'ok', label: '/items/5', request: 'GET /items/5',
      code: ['@app.get("/items/{item_id}")', 'async def read_item(item_id: int):', '    ...'],
      sigLine: 1,
      rows: [{ name: 'item_id', source: 'path', raw: '"5"', type: 'int', value: '5', ok: true }],
      call: 'read_item(item_id=5)',
    },
    {
      id: 'bad', label: '/items/abc', request: 'GET /items/abc',
      code: ['@app.get("/items/{item_id}")', 'async def read_item(item_id: int):', '    ...'],
      sigLine: 1,
      rows: [{ name: 'item_id', source: 'path', raw: '"abc"', type: 'int', value: '✗ not an integer', ok: false }],
      error: '{"detail":[{"type":"int_parsing","loc":["path","item_id"],\n  "msg":"Input should be a valid integer, unable to parse string as an integer",\n  "input":"abc"}]}',
    },
  ],
  query: [
    {
      id: 'ok', label: '/items/5?query_param=abc', request: 'GET /items/5?query_param=abc',
      code: ['@app.get("/items/{item_id}")', 'async def read_item(item_id: int, query_param: Optional[str] = None):', '    ...'],
      sigLine: 1,
      rows: [
        { name: 'item_id', source: 'path', raw: '"5"', type: 'int', value: '5', ok: true, why: 'named in the path template' },
        { name: 'query_param', source: 'query', raw: '"abc"', type: 'Optional[str]', value: '"abc"', ok: true, why: 'not in the path → query' },
      ],
      call: 'read_item(item_id=5, query_param="abc")',
    },
    {
      id: 'default', label: '/items/5', request: 'GET /items/5',
      code: ['@app.get("/items/{item_id}")', 'async def read_item(item_id: int, query_param: Optional[str] = None):', '    ...'],
      sigLine: 1,
      rows: [
        { name: 'item_id', source: 'path', raw: '"5"', type: 'int', value: '5', ok: true, why: 'named in the path template' },
        { name: 'query_param', source: 'query', raw: '(missing)', type: 'Optional[str]', value: 'None (default)', ok: true, why: 'has a default → optional' },
      ],
      call: 'read_item(item_id=5, query_param=None)',
    },
    {
      id: 'bad', label: '/users/?limit=ten', request: 'GET /users/?limit=ten',
      code: ['@app.get("/users/")', 'async def read_users(skip: int = 0, limit: int = 10):', '    ...'],
      sigLine: 1,
      rows: [
        { name: 'skip', source: 'query', raw: '(missing)', type: 'int', value: '0 (default)', ok: true, why: 'not in the path → query' },
        { name: 'limit', source: 'query', raw: '"ten"', type: 'int', value: '✗ not an integer', ok: false, why: 'not in the path → query' },
      ],
      error: '{"detail":[{"type":"int_parsing","loc":["query","limit"],\n  "msg":"Input should be a valid integer, unable to parse string as an integer",\n  "input":"ten"}]}',
    },
  ],
  body: [
    {
      id: 'ok', label: 'valid JSON', request: 'POST /items/   body: {"name": "Iris model", "price": 9.5}',
      code: ['class Item(BaseModel):', '    name: str', '    price: float', '', '@app.post("/items/")', 'async def create_item(item: Item):', '    ...'],
      sigLine: 5,
      rows: [
        { name: 'item.name', source: 'body', raw: '"Iris model"', type: 'str', value: '"Iris model"', ok: true },
        { name: 'item.price', source: 'body', raw: '9.5', type: 'float', value: '9.5', ok: true },
      ],
      call: 'create_item(item=Item(name="Iris model", price=9.5))',
    },
    {
      id: 'wrong', label: 'price: "cheap"', request: 'POST /items/   body: {"name": "Iris model", "price": "cheap"}',
      code: ['class Item(BaseModel):', '    name: str', '    price: float', '', '@app.post("/items/")', 'async def create_item(item: Item):', '    ...'],
      sigLine: 5,
      rows: [
        { name: 'item.name', source: 'body', raw: '"Iris model"', type: 'str', value: '"Iris model"', ok: true },
        { name: 'item.price', source: 'body', raw: '"cheap"', type: 'float', value: '✗ not a number', ok: false },
      ],
      error: '{"detail":[{"type":"float_parsing","loc":["body","price"],\n  "msg":"Input should be a valid number, unable to parse string as a number",\n  "input":"cheap"}]}',
    },
    {
      id: 'missing', label: 'price missing', request: 'POST /items/   body: {"name": "Iris model"}',
      code: ['class Item(BaseModel):', '    name: str', '    price: float', '', '@app.post("/items/")', 'async def create_item(item: Item):', '    ...'],
      sigLine: 5,
      rows: [
        { name: 'item.name', source: 'body', raw: '"Iris model"', type: 'str', value: '"Iris model"', ok: true },
        { name: 'item.price', source: 'body', raw: '(missing)', type: 'float', value: '✗ required', ok: false },
      ],
      error: '{"detail":[{"type":"missing","loc":["body","price"],\n  "msg":"Field required",\n  "input":{"name":"Iris model"}}]}',
    },
  ],
};

const PARSE_STEPS = [
  { title: 'Read your function signature', text: 'FastAPI inspects the parameters and type hints of your function. That signature is the contract: which values it needs, where each comes from, and what type each must be.' },
  { title: 'Extract the raw values', text: 'Everything in a URL is text. FastAPI pulls the raw strings out of the path and query string — or parses the JSON body for POST/PUT.' },
  { title: 'Convert and validate with type hints', text: 'Each raw value is converted to its declared type. "5" becomes the integer 5. If conversion is impossible, the value is invalid. Missing optional values get their defaults.' },
  { title: 'Call your function — or reject', text: 'All valid → your function is called with clean, typed arguments. Anything invalid → FastAPI answers 422 with a JSON error explaining exactly what and where. Your code never sees bad input.' },
];

const PARSE_TABS = [
  { id: 'path', label: 'Path parameters' },
  { id: 'query', label: 'Query parameters' },
  { id: 'body', label: 'Request body' },
];

function ParseRun({ tab, setTab, scenarioId, setScenarioId }) {
  const list = PARSE_SCENARIOS[tab];
  const sc = list.find((s) => s.id === scenarioId) || list[0];
  const stepper = useStepper(PARSE_STEPS.length, 1700);
  const step = stepper.index;
  const failed = sc.rows.some((r) => !r.ok);

  return (
    <Frame
      title="Parameter parsing and validation"
      hint="Pick where the data comes from and a test request, then step through what FastAPI does before your function runs."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={PARSE_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {PARSE_TABS.map((t) => (
            <button key={t.id} type="button" className={tabClass(tab === t.id)} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {list.map((s) => (
            <button key={s.id} type="button" className={`${tabClass(s.id === sc.id)} font-mono`} onClick={() => setScenarioId(s.id)}>
              {s.label}
            </button>
          ))}
        </div>

        <Lesson title={`${step + 1}. ${PARSE_STEPS[step].title}`}>{PARSE_STEPS[step].text}</Lesson>

        <div className="rounded-lg border border-gray-700 bg-black/70 px-3 py-2 font-mono text-[11px] text-sky-100">
          <span className="text-[9px] font-sans uppercase tracking-wider text-gray-500 mr-2">request</span>
          {sc.request}
        </div>

        <CodeLines lines={sc.code} active={step === 0 ? [sc.sigLine] : []} title="main.py" />

        <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden">
          <div className="grid grid-cols-[1fr_4rem_5.5rem_6rem_1fr] gap-2 px-3 py-1.5 text-[9px] uppercase tracking-wider text-gray-500 border-b border-gray-800">
            <span>parameter</span><span>from</span><span>raw</span><span>type hint</span><span>final value</span>
          </div>
          {sc.rows.map((row) => (
            <div key={row.name} className="grid grid-cols-[1fr_4rem_5.5rem_6rem_1fr] gap-2 px-3 py-1.5 font-mono text-[11px] items-center">
              <span className="text-white">
                {row.name}
                {row.why && step >= 0 && <span className="block font-sans text-[9px] text-gray-500">{row.why}</span>}
              </span>
              <span className={`px-1.5 rounded text-[10px] text-center ${SOURCE_TONE[row.source]}`}>{row.source}</span>
              <span className={step >= 1 ? 'text-gray-200' : 'text-gray-700'}>{step >= 1 ? row.raw : '…'}</span>
              <span className="text-violet-200">{row.type}</span>
              <span className={step >= 2 ? (row.ok ? 'text-emerald-300' : 'text-rose-300') : 'text-gray-700'}>{step >= 2 ? row.value : '…'}</span>
            </div>
          ))}
        </div>

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {failed ? (
              <div className="rounded-xl border border-rose-400/50 bg-rose-500/10 p-3 space-y-1.5">
                <StatusPill code={422} text="Unprocessable Entity" />
                <Mono className="text-rose-100">{sc.error}</Mono>
                <p className="text-[10px] text-gray-400">Your function was never called. <span className="font-mono">loc</span> says where the problem is; <span className="font-mono">msg</span> says what.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-emerald-300 mb-1">FastAPI calls</p>
                <p className="font-mono text-xs text-white">{sc.call}</p>
              </div>
            )}
          </motion.div>
        )}
        {tab === 'body' && <p className="text-[10px] text-gray-500">Request bodies are defined with Pydantic models — covered in detail in the next chapter.</p>}
      </div>
    </Frame>
  );
}

export function ParamParsingVisualizer() {
  const [tab, setTab] = useState('path');
  const [scenarioId, setScenarioId] = useState('ok');
  const changeTab = (t) => {
    setTab(t);
    setScenarioId('ok');
  };
  return <ParseRun key={`${tab}-${scenarioId}`} tab={tab} setTab={changeTab} scenarioId={scenarioId} setScenarioId={setScenarioId} />;
}

/* ------------------------------------------------------------------ */
/* 6. Steps 6–8 – dependencies, execution, your logic                    */
/* ------------------------------------------------------------------ */

const DI_CODE = [
  'async def get_db():',
  '    return database          # shared connection',
  '',
  '@app.get("/items/{item_id}")',
  'async def read_item(item_id: int, db = Depends(get_db)):',
  '    row = await db.fetch_item(item_id)',
  '    return {"item_id": item_id, "name": row["name"]}',
];

const DI_STEPS = [
  { n: 6, lines: [0, 1, 4], title: 'Dependency Injection', text: 'Before calling read_item, FastAPI sees db = Depends(get_db). It calls get_db() first and keeps the result. Dependencies are shared helpers — a database connection, the current user, a loaded model. More in later chapters.' },
  { n: 7, lines: [4], title: 'Path Operation Function Execution', text: 'FastAPI now calls read_item(item_id=5, db=database) with the validated parameters. Because it is async def, FastAPI awaits it on the event loop.' },
  { n: 8, lines: [5], title: 'Processing Logic — waiting on I/O', text: 'Your code runs. await db.fetch_item(...) waits for the database; while it waits, the event loop serves other requests.' },
  { n: 8, lines: [6], title: 'Processing Logic — build the result', text: 'The data is back. Your function builds the result (here a dict). In this course, this is where you would preprocess input and run model inference.' },
];

const EXEC_MODES = {
  async_io: {
    label: 'async def + await I/O',
    code: ['@app.get("/predict")', 'async def predict(user_id: int):', '    features = await fetch_features(user_id)  # I/O', '    return {"score": score(features)}'],
    rows: {
      A: [[0, 1, 'loop'], [1, 4, 'io'], [4, 5, 'loop']],
      B: [[0, 1, 'queue'], [1, 2, 'loop'], [2, 5, 'io'], [5, 6, 'loop']],
      C: [[0, 2, 'queue'], [2, 3, 'loop'], [3, 6, 'io'], [6, 7, 'loop']],
    },
    lesson: 'async def is awaited on the event loop. Each await on I/O hands the loop to another request, so waits overlap. Ideal when the work is mostly waiting.',
  },
  sync_def: {
    label: 'def (blocking work)',
    code: ['@app.get("/predict")', 'def predict(user_id: int):', '    row = db_sync.fetch(user_id)        # blocking', '    return {"score": model.predict(row)}  # CPU'],
    rows: {
      A: [[0, 3, 'thread']],
      B: [[0, 3, 'thread']],
      C: [[0, 3, 'thread']],
    },
    lesson: 'A plain def is run in an external threadpool, so blocking code does not freeze the event loop — the loop stays free to accept more requests. This is why def is the safe choice for CPU-bound work like ML inference. (Threads run truly in parallel when the library releases the GIL, as NumPy, scikit-learn and PyTorch mostly do.)',
  },
  async_block: {
    label: 'async def + blocking call (mistake)',
    code: ['@app.get("/predict")', 'async def predict(user_id: int):', '    # no await — this blocks the event loop!', '    return {"score": model.predict(load(user_id))}'],
    rows: {
      A: [[0, 3, 'block']],
      B: [[0, 3, 'queue'], [3, 6, 'block']],
      C: [[0, 6, 'queue'], [6, 9, 'block']],
    },
    lesson: 'Blocking work inside async def runs directly on the event loop and holds it hostage. Every other request — even a health check — waits in line. Use def instead, or offload the work (Chapter 5).',
  },
};

const KIND_STYLE = {
  loop: 'bg-teal-500/70 border-teal-300',
  io: 'bg-gray-700/40 border-dashed border-gray-400',
  thread: 'bg-violet-500/60 border-violet-300',
  queue: 'bg-rose-500/15 border-rose-400/40',
  block: 'bg-rose-500/70 border-rose-300',
};
const KIND_LABEL = {
  loop: 'running on event loop',
  io: 'awaiting I/O (loop free)',
  thread: 'running in threadpool',
  queue: 'waiting for the loop',
  block: 'blocking the event loop',
};

const T_MAX = 9;

function Timeline({ mode, t }) {
  const rows = EXEC_MODES[mode].rows;
  const loopRow = [];
  Object.entries(rows).forEach(([name, segs]) => {
    segs.forEach(([s, e, k]) => {
      if (k === 'loop' || k === 'block') loopRow.push([s, e, k, name]);
    });
  });
  const pct = (v) => `${(v / T_MAX) * 100}%`;
  const clip = (s, e) => Math.max(0, Math.min(e, t) - s);

  const renderSeg = ([s, e, k, label], i) => {
    const w = clip(s, e);
    if (w <= 0) return null;
    return (
      <motion.div
        key={i}
        initial={false}
        animate={{ width: pct(w) }}
        className={`absolute top-0.5 bottom-0.5 rounded border text-[9px] font-bold text-white flex items-center justify-center overflow-hidden ${KIND_STYLE[k]}`}
        style={{ left: pct(s) }}
      >
        {label}
      </motion.div>
    );
  };

  const finish = Object.fromEntries(Object.entries(rows).map(([n, segs]) => [n, segs[segs.length - 1][1]]));

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 space-y-1.5">
      <div className="grid grid-cols-[5.5rem_1fr_3rem] gap-2 items-center">
        <span className="text-[10px] text-amber-200 font-semibold">event loop</span>
        <div className="relative h-6 rounded bg-gray-900 border border-gray-800">
          {loopRow.map(renderSeg)}
        </div>
        <span />
      </div>
      <div className="border-t border-gray-800 my-1" />
      {Object.entries(rows).map(([name, segs]) => (
        <div key={name} className="grid grid-cols-[5.5rem_1fr_3rem] gap-2 items-center">
          <span className="text-[10px] text-gray-300">request {name}</span>
          <div className="relative h-6 rounded bg-gray-900 border border-gray-800">{segs.map((s, i) => renderSeg([...s, ''], i))}</div>
          <span className={`text-[10px] font-mono ${t >= finish[name] ? 'text-emerald-300' : 'text-gray-600'}`}>{t >= finish[name] ? `✓ t=${finish[name]}` : '…'}</span>
        </div>
      ))}
      <div className="grid grid-cols-[5.5rem_1fr_3rem] gap-2">
        <span />
        <div className="relative h-3">
          <motion.div initial={false} animate={{ left: pct(t) }} className="absolute top-0 w-px h-3 bg-teal-300" />
          <span className="absolute right-0 text-[9px] text-gray-600">time →</span>
        </div>
        <span />
      </div>
    </div>
  );
}

export function ExecutionVisualizer() {
  const [tab, setTab] = useState('walk');
  const [mode, setMode] = useState('async_io');
  const walk = useStepper(DI_STEPS.length, 2000);
  const clock = useStepper(T_MAX + 1, 650);
  const frame = DI_STEPS[walk.index];

  return (
    <Frame
      title="Dependencies → your function → your logic"
      hint={tab === 'walk' ? 'Step through steps 6, 7 and 8 on real code.' : 'Three requests arrive at once. Pick how the function is written and run the clock.'}
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(tab === 'walk')} onClick={() => setTab('walk')}>Walk steps 6–8</button>
            <button type="button" className={tabClass(tab === 'modes')} onClick={() => setTab('modes')}>async def vs def</button>
          </div>
          {tab === 'walk' ? <StepControls stepper={walk} total={DI_STEPS.length} /> : <StepControls stepper={clock} total={T_MAX + 1} />}
        </div>
      }
    >
      {tab === 'walk' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              [6, 'Dependency Injection'],
              [7, 'Function Execution'],
              [8, 'Processing Logic'],
            ].map(([n, label]) => (
              <div key={n} className={`rounded-lg border px-2 py-1.5 text-center transition-all ${frame.n === n ? 'border-teal-400 bg-teal-500/15 text-white' : 'border-gray-800 text-gray-500'}`}>
                <p className="text-lg font-bold leading-none">{n}</p>
                <p className="text-[10px]">{label}</p>
              </div>
            ))}
          </div>
          <Lesson title={`${frame.n}. ${frame.title}`}>{frame.text}</Lesson>
          <CodeLines lines={DI_CODE} active={frame.lines} title="main.py" />
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div className={`rounded-lg border p-2 ${walk.index >= 0 ? 'border-violet-400/50' : 'border-gray-800'}`}>
              <p className="text-[9px] uppercase text-gray-500">resolved deps</p>
              <p className="font-mono text-violet-200">db = database</p>
            </div>
            <div className={`rounded-lg border p-2 transition-all ${walk.index >= 1 ? 'border-teal-400/50' : 'border-gray-800 opacity-40'}`}>
              <p className="text-[9px] uppercase text-gray-500">call</p>
              <p className="font-mono text-teal-100">await read_item(item_id=5, db=…)</p>
            </div>
            <div className={`rounded-lg border p-2 transition-all ${walk.index >= 2 ? 'border-amber-400/50' : 'border-gray-800 opacity-40'}`}>
              <p className="text-[9px] uppercase text-gray-500">event loop</p>
              <p className="text-amber-100">{walk.index === 2 ? 'free — serving others while DB answers' : walk.index === 3 ? 'resumed read_item' : 'running read_item'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {Object.entries(EXEC_MODES).map(([id, m]) => (
              <button key={id} type="button" className={tabClass(mode === id)} onClick={() => { setMode(id); clock.reset(); }}>
                {m.label}
              </button>
            ))}
          </div>
          <CodeLines lines={EXEC_MODES[mode].code} active={[1]} title="main.py" />
          <Timeline mode={mode} t={clock.index} />
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(KIND_LABEL).map(([k, label]) => (
              <span key={k} className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className={`w-3 h-2.5 rounded-sm border ${KIND_STYLE[k]}`} /> {label}
              </span>
            ))}
          </div>
          <Lesson title={EXEC_MODES[mode].label}>{EXEC_MODES[mode].lesson}</Lesson>
        </div>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Steps 9–11 – return value → HTTP response                          */
/* ------------------------------------------------------------------ */

const RETURNS = [
  { id: 'dict', label: 'dict', code: 'return {"item_id": 5, "name": "Iris model"}', py: "dict  {'item_id': 5, 'name': 'Iris model'}", status: [200, 'OK'], ctype: 'application/json', body: '{"item_id":5,"name":"Iris model"}', how: 'Converted to JSON automatically.' },
  { id: 'list', label: 'list', code: 'return [{"user_id": 0}, {"user_id": 1}]', py: "list  [{'user_id': 0}, {'user_id': 1}]", status: [200, 'OK'], ctype: 'application/json', body: '[{"user_id":0},{"user_id":1}]', how: 'Lists become JSON arrays.' },
  { id: 'model', label: 'Pydantic model', code: 'return Item(name="Iris model", price=9.5)', py: "Item  Item(name='Iris model', price=9.5)", status: [200, 'OK'], ctype: 'application/json', body: '{"name":"Iris model","price":9.5}', how: 'Pydantic models are turned into JSON objects field by field.' },
  { id: 'str', label: 'str', code: 'return "model ready"', py: "str  'model ready'", status: [200, 'OK'], ctype: 'application/json', body: '"model ready"', how: 'Even a string is sent as JSON (a quoted JSON string).' },
  { id: 'json', label: 'JSONResponse', code: 'return JSONResponse(content={"id": 7}, status_code=201)', py: 'JSONResponse  (you built the response)', status: [201, 'Created'], ctype: 'application/json', body: '{"id":7}', how: 'You control the status code and headers directly; FastAPI sends it as-is.' },
  { id: 'html', label: 'HTMLResponse', code: 'return HTMLResponse("<h1>Model ready</h1>")', py: 'HTMLResponse  (you built the response)', status: [200, 'OK'], ctype: 'text/html; charset=utf-8', body: '<h1>Model ready</h1>', how: 'A Response subclass skips JSON conversion entirely — here the browser renders HTML.' },
];

const RM_CODE = [
  'class ModelInfo(BaseModel):',
  '    name: str',
  '    version: str',
  '',
  '@app.get("/model-info", response_model=ModelInfo)',
  'async def model_info():',
  '    return MODEL_RECORD',
];

const RM_CASES = [
  {
    id: 'extra', label: 'extra private field',
    returned: "{'name': 'iris-classifier', 'version': 'v1',\n 'weights_path': '/srv/models/iris.pkl'}",
    status: [200, 'OK'], body: '{"name":"iris-classifier","version":"v1"}',
    text: 'weights_path is not part of ModelInfo, so it is filtered out. Internal details never leak to clients.',
  },
  {
    id: 'missing', label: 'missing field',
    returned: "{'name': 'iris-classifier'}",
    status: [500, 'Internal Server Error'], body: 'Internal Server Error',
    text: 'version is required by ModelInfo but missing. The response fails validation — that is a bug in your code, so the client gets a 500 and the details go to the server log.',
  },
  {
    id: 'none', label: 'no response_model',
    returned: "{'name': 'iris-classifier', 'version': 'v1',\n 'weights_path': '/srv/models/iris.pkl'}",
    status: [200, 'OK'], body: '{"name":"iris-classifier","version":"v1","weights_path":"/srv/models/iris.pkl"}',
    text: 'Without response_model, whatever you return is sent — including the private path. Step 11 is optional, but useful.',
  },
];

const RESP_STEPS = [
  { n: 9, title: 'Response Generation', text: 'Your function returns a result: a dict, list, Pydantic model, string, or a Response object.' },
  { n: 10, title: 'Data Conversion', text: 'FastAPI converts the return value into an HTTP response. Python data becomes JSON with Content-Type: application/json. A Response object you built is used as-is.' },
  { n: 11, title: 'Response Model Validation (optional)', text: 'If the decorator declares response_model, FastAPI validates the outgoing data against it and filters out extra fields, so the response matches the schema.' },
];

export function ResponseVisualizer() {
  const [tab, setTab] = useState('convert');
  const [retId, setRetId] = useState('dict');
  const [caseId, setCaseId] = useState('extra');
  const stepper = useStepper(RESP_STEPS.length, 1800);
  const step = stepper.index;
  const ret = RETURNS.find((r) => r.id === retId);
  const rm = RM_CASES.find((c) => c.id === caseId);

  const status = tab === 'convert' ? ret.status : step >= 2 ? rm.status : [200, 'OK'];
  const body = tab === 'convert' ? ret.body : step >= 2 ? rm.body : '(waiting for step 11)';
  const ctype = tab === 'convert' ? ret.ctype : rm.status[0] === 500 && step >= 2 ? 'text/plain; charset=utf-8' : 'application/json';

  return (
    <Frame
      title="From return value to HTTP response"
      hint="Choose what your function returns and step through steps 9, 10 and 11."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(tab === 'convert')} onClick={() => { setTab('convert'); stepper.reset(); }}>Return types</button>
            <button type="button" className={tabClass(tab === 'model')} onClick={() => { setTab('model'); stepper.reset(); }}>response_model</button>
          </div>
          <StepControls stepper={stepper} total={RESP_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {tab === 'convert'
            ? RETURNS.map((r) => (
                <button key={r.id} type="button" className={tabClass(retId === r.id)} onClick={() => { setRetId(r.id); stepper.reset(); }}>
                  {r.label}
                </button>
              ))
            : RM_CASES.map((c) => (
                <button key={c.id} type="button" className={tabClass(caseId === c.id)} onClick={() => { setCaseId(c.id); stepper.reset(); }}>
                  {c.label}
                </button>
              ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {RESP_STEPS.map((s, i) => (
            <div key={s.n} className={`rounded-lg border px-2 py-1.5 text-center transition-all ${i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'}`}>
              <p className="text-lg font-bold leading-none">{s.n}</p>
              <p className="text-[10px]">{s.title.replace(' (optional)', '')}</p>
            </div>
          ))}
        </div>

        <Lesson title={`${RESP_STEPS[step].n}. ${RESP_STEPS[step].title}`}>
          {RESP_STEPS[step].text}
          {step === 1 && tab === 'convert' && <span className="block mt-1 text-teal-200">{ret.how}</span>}
          {step === 2 && tab === 'convert' && <span className="block mt-1 text-gray-400">No response_model declared here, so this step is skipped. Try the response_model tab.</span>}
          {step === 2 && tab === 'model' && <span className="block mt-1 text-teal-200">{rm.text}</span>}
        </Lesson>

        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-2 items-stretch">
          <div className="space-y-2">
            {tab === 'convert' ? (
              <CodeLines lines={['@app.get("/example")', 'async def example():', `    ${ret.code}`]} active={[2]} title="your function" />
            ) : (
              <CodeLines lines={caseId === 'none' ? RM_CODE.map((l, i) => (i === 4 ? '@app.get("/model-info")' : l)) : RM_CODE} active={step === 2 ? [4] : [6]} title="your function" />
            )}
            <div className="rounded-lg border border-violet-400/40 bg-violet-500/10 p-2">
              <p className="text-[9px] uppercase tracking-wider text-violet-300">returned Python object</p>
              <p className="font-mono text-[11px] text-violet-50 whitespace-pre-wrap">{tab === 'convert' ? ret.py : rm.returned}</p>
            </div>
          </div>
          <div className="flex md:flex-col items-center justify-center text-amber-300">
            <Zap className="w-4 h-4" />
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className={`rounded-xl border bg-black/70 p-3 font-mono text-[11px] space-y-1 transition-all ${step >= 1 ? 'border-gray-600' : 'border-gray-800 opacity-30'}`}>
            <p className="text-[9px] font-sans uppercase tracking-wider text-gray-500">HTTP response</p>
            <p><StatusPill code={status[0]} text={status[1]} /></p>
            <p className="text-gray-400">content-type: <span className="text-cyan-200">{ctype}</span></p>
            <p className="text-gray-600">&nbsp;</p>
            <p className="text-emerald-100 break-all whitespace-pre-wrap">{body}</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 8. All 13 steps + where things break                                  */
/* ------------------------------------------------------------------ */

const THIRTEEN = [
  { title: 'Request Arrival', actor: 'client', edge: { at: 'c-a', dir: 'req' }, data: 'GET /items/5?query_param=abc HTTP/1.1', text: 'A client sends an HTTP request (method, path, headers, optional query and body) to the server’s address and port.' },
  { title: 'ASGI Server Handling', actor: 'asgi', data: "scope = {'type': 'http', 'method': 'GET', 'path': '/items/5', ...}", text: 'Uvicorn receives the raw request, parses it, and translates it into the ASGI scope — a Python dict of request details.' },
  { title: 'FastAPI Takes Over', actor: 'fastapi', edge: { at: 'a-f', dir: 'req' }, data: 'await app(scope, receive, send)', text: 'The ASGI server passes the scope (and body events) to the FastAPI application instance.' },
  { title: 'Routing', actor: 'fastapi', data: 'GET /items/{item_id}  →  read_item', text: 'FastAPI compares the path and method to your path operations and finds the first matching function.' },
  { title: 'Parameter Parsing & Validation', actor: 'fastapi', data: 'item_id: "5" → 5     query_param: "abc"', text: 'Path, query, and body values are extracted and converted to your type hints; invalid input gets a 422.' },
  { title: 'Dependency Injection', actor: 'fastapi', data: 'Depends(...) → resolved values', text: 'Any declared dependencies are resolved before your function runs.' },
  { title: 'Path Operation Function Execution', actor: 'func', edge: { at: 'f-p', dir: 'req' }, data: 'await read_item(item_id=5, query_param="abc")', text: 'FastAPI calls your function: awaited if async def, run in a threadpool if def.' },
  { title: 'Processing Logic', actor: 'func', data: 'fetch data · preprocess · model inference', text: 'Your code runs: database lookups, input processing, loading a model and predicting.' },
  { title: 'Response Generation', actor: 'func', edge: { at: 'f-p', dir: 'res' }, data: "return {'item_id': 5, 'query_param': 'abc'}", text: 'Your function returns a dict, list, Pydantic model, string, or Response object.' },
  { title: 'Data Conversion', actor: 'fastapi', data: '{"item_id":5,"query_param":"abc"}   content-type: application/json', text: 'FastAPI converts the return value into JSON and sets Content-Type — or uses your Response object directly.' },
  { title: 'Response Model Validation (optional)', actor: 'fastapi', data: 'response_model=... → validate + filter', text: 'If a response_model is declared, the outgoing data is validated and filtered against it.' },
  { title: 'Response Transmission', actor: 'asgi', edge: { at: 'a-f', dir: 'res' }, data: 'status 200 · headers · body  →  Uvicorn', text: 'FastAPI hands the finished HTTP response (status code, headers, body) back to the ASGI server.' },
  { title: 'Final Delivery', actor: 'client', edge: { at: 'c-a', dir: 'res' }, data: 'HTTP/1.1 200 OK  {"item_id":5,"query_param":"abc"}', text: 'The ASGI server transmits the response over the network to the original client. Then the cycle repeats for the next request.' },
];

const SYMPTOMS = [
  { id: 'refused', label: 'curl: Connection refused', step: 1, actor: 'asgi', cause: 'Nothing is listening on that address/port — the ASGI server is not running (or is on another port).', fix: 'Start it with uvicorn main:app --reload and check the “Uvicorn running on …” line.' },
  { id: '404', label: '404 Not Found', step: 3, actor: 'fastapi', cause: 'Routing found no path operation for this path. Typo in the URL, a missing trailing slash, or the route was never declared.', fix: 'Compare the URL with your decorators, or check /docs for the exact paths.' },
  { id: '405', label: '405 Method Not Allowed', step: 3, actor: 'fastapi', cause: 'The path exists, but not for this method — e.g. opening a POST-only URL in the browser (which sends GET).', fix: 'Use the right method: curl -X POST, requests.post, or /docs.' },
  { id: '422', label: '422 Unprocessable Entity', step: 4, actor: 'fastapi', cause: 'Parameter parsing/validation failed: a value could not be converted to its type hint, or a required field is missing.', fix: 'Read detail[].loc and detail[].msg in the error body — they point to the exact field.' },
  { id: '500', label: '500 Internal Server Error', step: 7, actor: 'func', cause: 'Your function raised an exception during processing (or the return value failed response_model validation).', fix: 'Read the traceback in the Uvicorn terminal — the client never sees it.' },
  { id: 'slow', label: 'Everything is slow under load', step: 6, actor: 'func', cause: 'Blocking work (e.g. CPU-heavy inference or a sync DB call) inside an async def function is holding the event loop.', fix: 'Make that function a plain def, or offload the work (Chapter 5).' },
];

export function FullCycleVisualizer() {
  const [tab, setTab] = useState('steps');
  const [symptom, setSymptom] = useState('422');
  const stepper = useStepper(THIRTEEN.length, 1500);
  const s = THIRTEEN[stepper.index];
  const sym = SYMPTOMS.find((x) => x.id === symptom);
  const activeIndex = tab === 'steps' ? stepper.index : sym.step;

  return (
    <Frame
      title={tab === 'steps' ? 'All 13 steps, in order' : 'Where did it break?'}
      hint={
        tab === 'steps'
          ? 'Step through the complete cycle. The diagram shows who is working; the list shows where you are.'
          : 'Knowing the cycle turns error messages into locations. Pick a symptom to see which stage produced it.'
      }
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(tab === 'steps')} onClick={() => setTab('steps')}>13 steps</button>
            <button type="button" className={tabClass(tab === 'debug')} onClick={() => setTab('debug')}>Debugging with the cycle</button>
          </div>
          {tab === 'steps' && <StepControls stepper={stepper} total={THIRTEEN.length} showPlay />}
        </div>
      }
    >
      <div className="space-y-3">
        <CycleDiagram active={tab === 'steps' ? s.actor : sym.actor} edge={tab === 'steps' ? s.edge : null} />

        {tab === 'steps' ? (
          <>
            <Lesson title={`${stepper.index + 1}. ${s.title}`}>{s.text}</Lesson>
            <Mono className="text-teal-100">{s.data}</Mono>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {SYMPTOMS.map((x) => (
                <button key={x.id} type="button" className={`${tabClass(symptom === x.id)} font-mono`} onClick={() => setSymptom(x.id)}>
                  {x.label}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 space-y-1.5">
              <p className="text-xs text-white font-semibold">Stage: {THIRTEEN[sym.step].title} (step {sym.step + 1})</p>
              <p className="text-[11px] text-gray-300"><span className="text-amber-200 font-semibold">Why:</span> {sym.cause}</p>
              <p className="text-[11px] text-gray-300"><span className="text-emerald-200 font-semibold">Fix:</span> {sym.fix}</p>
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          {THIRTEEN.map((item, i) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                setTab('steps');
                stepper.pick(i);
              }}
              className={`flex items-center gap-2 text-left rounded px-1.5 py-0.5 text-[11px] transition-colors ${
                i === activeIndex ? 'bg-teal-500/20 text-white' : tab === 'steps' && i < activeIndex ? 'text-gray-400' : 'text-gray-600 hover:text-gray-300'
              }`}
            >
              <span className={`w-4 text-right font-mono ${i === activeIndex ? 'text-teal-300' : ''}`}>{i + 1}</span>
              {item.title}
            </button>
          ))}
        </div>
      </div>
    </Frame>
  );
}
