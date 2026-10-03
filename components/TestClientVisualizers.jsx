import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStepper, Frame, StepControls, tabClass, Caption } from './VisualKit';
import { Pill } from './PydanticKit';

function Stage({ children, className = '' }) {
  return <div className={`relative h-[17.5rem] w-full ${className}`}>{children}</div>;
}

function FlowDot({ travel, fail }) {
  return (
    <div className="relative h-8 flex-1 min-w-[4rem]">
      <div className={`absolute inset-x-0 top-1/2 h-px ${fail && travel ? 'bg-rose-900' : 'bg-gray-700'}`} />
      {travel && (
        <motion.span
          className={`absolute top-1/2 -mt-1.5 h-3 w-3 rounded-full ${fail ? 'bg-amber-300 shadow-[0_0_10px_#fcd34d]' : 'bg-teal-300 shadow-[0_0_10px_#5eead4]'}`}
          initial={{ left: '0%' }}
          animate={fail ? { left: ['0%', '72%', '8%'] } : { left: ['0%', '92%'] }}
          transition={{ duration: fail ? 1.15 : 0.85, repeat: Infinity, repeatDelay: 0.35, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}

function Slot({ k, v, tone = 'idle' }) {
  const toneClass = {
    idle: 'border-dashed border-gray-700 text-gray-600',
    ok: 'border-teal-400/80 bg-teal-500/10 text-white',
    bad: 'border-rose-400 bg-rose-500/10 text-rose-100',
  }[tone];
  return (
    <div className={`rounded-lg border px-2 py-1.5 min-w-[7.5rem] ${toneClass}`}>
      <p className="text-[9px] uppercase tracking-wider text-gray-500">{k}</p>
      <p className="font-mono text-[12px] h-4 leading-4">{v || ' '}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TestClient skips the server                                            */
/* ------------------------------------------------------------------ */

const DIRECT = [
  'curl heads for port 8000. Nothing is listening, so the packet bounces.',
  'TestClient is holding the app object. The port light stays off.',
  'The same GET travels into the app, inside the test.',
  'Hello World comes straight back. Uvicorn never started.',
];

export function NoServerVisualizer() {
  const stepper = useStepper(DIRECT.length, 1600);
  const step = stepper.index;
  return (
    <Frame
      title="The test talks to the app, not to a port"
      hint="Play it. The top path fails. The bottom path never opens a port."
      footer={<StepControls stepper={stepper} total={DIRECT.length} />}
    >
      <Caption text={DIRECT[step]} />
      <Stage className="flex flex-col justify-center gap-7 px-1">
        <div className={`flex items-center gap-3 transition-opacity duration-300 ${step > 0 ? 'opacity-30' : 'opacity-100'}`}>
          <div className="w-[7.5rem] shrink-0 rounded-2xl border border-amber-400/50 px-3 py-3 text-center">
            <p className="text-sm text-white">curl</p>
            <p className="text-[10px] text-gray-500">GET /</p>
          </div>
          <FlowDot travel={step === 0} fail />
          <motion.div
            animate={step === 0 ? { x: [0, -5, 5, -2, 0] } : { x: 0 }}
            transition={{ duration: 0.45, repeat: step === 0 ? Infinity : 0, repeatDelay: 0.9 }}
            className="shrink-0 rounded-2xl border border-rose-400/50 px-3 py-3 text-center min-w-[7rem]"
          >
            <p className="text-sm text-rose-100 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> :8000
            </p>
            <p className="text-[10px] text-gray-500 mt-1">{step === 0 ? 'refused' : 'off'}</p>
          </motion.div>
        </div>

        <div className={`flex items-center gap-3 transition-opacity duration-300 ${step === 0 ? 'opacity-30' : 'opacity-100'}`}>
          <div className={`w-[7.5rem] shrink-0 rounded-2xl border px-3 py-3 text-center ${step >= 1 ? 'border-teal-400 bg-teal-500/10' : 'border-gray-700'}`}>
            <p className="text-sm text-white">TestClient</p>
            <p className="text-[10px] text-teal-200/80">holds app</p>
          </div>
          <FlowDot travel={step >= 2} />
          <div className="flex items-center gap-2 shrink-0">
            <motion.div
              animate={step >= 2 ? { boxShadow: '0 0 0 1px rgba(45,212,191,0.8)' } : { boxShadow: '0 0 0 0px rgba(45,212,191,0)' }}
              className={`rounded-2xl border px-3 py-3 text-center min-w-[5.5rem] ${step >= 2 ? 'border-teal-400' : 'border-gray-700'}`}
            >
              <p className="text-sm text-white">app</p>
              <p className="text-[10px] text-gray-500">GET /</p>
            </motion.div>
            <AnimatePresence>
              {step >= 3 && (
                <motion.div initial={{ x: 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }}>
                  <Pill code={200} text="Hello World" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Stage>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* client.get("/")                                                        */
/* ------------------------------------------------------------------ */

const HELLO = [
  'GET / already lives on the app.',
  'TestClient closes around that same object.',
  'client.get("/") sends the request in.',
  'The status lock closes: 200 equals 200.',
  'The JSON lock closes on Hello World.',
];

export function HelloClientVisualizer() {
  const stepper = useStepper(HELLO.length, 1500);
  const step = stepper.index;
  const statusOn = step >= 3;
  const jsonOn = step >= 4;
  return (
    <Frame
      title="One GET, two asserts"
      hint="Watch the request go in, then each assert lock."
      footer={<StepControls stepper={stepper} total={HELLO.length} />}
    >
      <Caption text={HELLO[step]} />
      <Stage className="flex flex-col justify-center gap-4">
        <div className="flex items-center gap-3 w-full">
          <p className="w-28 shrink-0 text-[11px] text-gray-400">client.get("/")</p>
          <FlowDot travel={step >= 2} />
          <motion.div
            className="rounded-3xl p-3 shrink-0"
            animate={{ borderColor: step >= 1 ? 'rgba(45,212,191,0.8)' : 'rgba(55,65,81,1)' }}
            style={{ borderWidth: 2, borderStyle: 'solid' }}
          >
            <p className="text-[10px] text-teal-200 text-center mb-2 h-4">{step >= 1 ? 'TestClient(app)' : ''}</p>
            <div className={`rounded-2xl border px-4 py-4 text-center ${step >= 2 ? 'border-teal-400 bg-teal-500/10' : 'border-gray-700'}`}>
              <p className="text-sm text-white">app</p>
              <p className="font-mono text-[11px] text-gray-400 mt-1">GET /</p>
              <AnimatePresence>
                {step >= 2 && (
                  <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-[11px] text-emerald-200 mt-2">
                    Hello World
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 gap-2 max-w-md">
          <CheckRow on={statusOn} label="status_code" value="200 == 200" />
          <CheckRow on={jsonOn} label="json()" value='{"message": "Hello World"}' />
        </div>
      </Stage>
    </Frame>
  );
}

function CheckRow({ on, label, value }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 ${on ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-gray-800'}`}>
      <motion.span
        animate={on ? { scale: 1, backgroundColor: '#34d399' } : { scale: 0.7, backgroundColor: '#374151' }}
        className="w-4 h-4 rounded-full shrink-0"
      />
      <div className="min-w-0">
        <p className="text-[9px] uppercase text-gray-500">{label}</p>
        <p className={`font-mono text-[11px] truncate ${on ? 'text-emerald-100' : 'text-gray-500'}`}>{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One fixture, many tests                                                */
/* ------------------------------------------------------------------ */

const FIXTURE = [
  'pytest has two tests and no client yet.',
  'The fixture builds one TestClient.',
  'yield carries that client down into both tests.',
  'One sends GET /. The other sends POST /items/. Both pass.',
];

export function SharedFixtureVisualizer() {
  const stepper = useStepper(FIXTURE.length, 1600);
  const step = stepper.index;
  return (
    <Frame
      title="Build the client once"
      hint="One object, two tests. The lines are the yield."
      footer={<StepControls stepper={stepper} total={FIXTURE.length} />}
    >
      <Caption text={FIXTURE[step]} />
      <Stage>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          {step >= 2 && (
            <>
              <motion.line x1="50" y1="30" x2="24" y2="68" stroke="#2dd4bf" strokeWidth="1.5" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
              <motion.line x1="50" y1="30" x2="76" y2="68" stroke="#2dd4bf" strokeWidth="1.5" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />
            </>
          )}
        </svg>
        {step >= 2 && (
          <>
            <motion.span className="absolute w-2.5 h-2.5 rounded-full bg-teal-300" style={{ marginLeft: -5, marginTop: -5 }} initial={{ left: '50%', top: '30%' }} animate={{ left: '24%', top: '68%' }} transition={{ duration: 0.7 }} />
            <motion.span className="absolute w-2.5 h-2.5 rounded-full bg-teal-300" style={{ marginLeft: -5, marginTop: -5 }} initial={{ left: '50%', top: '30%' }} animate={{ left: '76%', top: '68%' }} transition={{ duration: 0.7, delay: 0.1 }} />
          </>
        )}
        <div className="absolute left-1/2 -translate-x-1/2 top-2">
          <AnimatePresence>
            {step >= 1 && (
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-full border border-teal-400 bg-gray-950 px-4 py-2 text-center">
                <p className="text-[10px] text-gray-500">fixture</p>
                <p className="text-sm text-white">one client</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <TestBench name="test_read_main" call="GET /" show={step >= 2} pass={step >= 3} className="left-[8%] bottom-1" />
        <TestBench name="test_create_item" call="POST /items/" show={step >= 2} pass={step >= 3} className="right-[8%] bottom-1" />
      </Stage>
    </Frame>
  );
}

function TestBench({ name, call, show, pass, className }) {
  return (
    <div className={`absolute w-36 rounded-2xl border px-3 py-3 text-center ${pass ? 'border-emerald-400/70 bg-emerald-500/10' : 'border-gray-700'} ${className}`}>
      <p className="text-[11px] text-white">{name}</p>
      <p className="font-mono text-[10px] text-gray-500 mt-1 h-4">{show ? call : 'waiting'}</p>
      {pass && <p className="text-[11px] text-emerald-200 mt-1">200</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* POST body gate                                                         */
/* ------------------------------------------------------------------ */

const POSTS = [
  'Item is a gate. name and price are the required slots.',
  'Both values land in the slots.',
  'The gate opens. create_item renames them on the way out.',
  'This body only has a name. The price slot stays empty.',
  'The gate stays shut. 422 comes back, and create_item never runs.',
];

export function PostGateVisualizer() {
  const stepper = useStepper(POSTS.length, 1500);
  const step = stepper.index;
  const pass = step === 1 || step === 2;
  const fail = step >= 3;
  const open = step === 2;
  return (
    <Frame
      title="The body has to fit Item"
      hint="Watch the fields get renamed, then watch a missing price bounce."
      footer={<StepControls stepper={stepper} total={POSTS.length} />}
    >
      <Caption text={POSTS[step]} />
      <Stage className="flex items-center justify-center gap-3">
        <div className="space-y-2">
          <Slot k="name" v={pass ? 'Test Item' : fail ? 'Incomplete Item' : ''} tone={pass || fail ? 'ok' : 'idle'} />
          <Slot k="price" v={pass ? '10.99' : ''} tone={pass ? 'ok' : fail ? 'bad' : 'idle'} />
        </div>
        <div className={`relative rounded-2xl border px-3 py-3 ${fail && step === 4 ? 'border-rose-400' : open ? 'border-teal-400' : 'border-gray-600'}`}>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 text-center mb-2">Item</p>
          <div className="space-y-2">
            <Slot k="name" v={pass ? 'Test Item' : fail ? 'Incomplete Item' : ''} tone={pass || (fail && step >= 3) ? 'ok' : 'idle'} />
            <Slot k="price" v={pass ? '10.99' : ''} tone={pass ? 'ok' : fail ? 'bad' : 'idle'} />
          </div>
          <motion.div
            className={`absolute -right-1 top-3 bottom-3 w-1.5 rounded-full ${step === 4 ? 'bg-rose-400' : 'bg-teal-400'}`}
            animate={{ scaleY: open ? 0.18 : 1 }}
            style={{ transformOrigin: 'top center' }}
          />
        </div>
        <div className="w-40 min-h-[7rem] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {open && (
              <motion.div key="out" initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                <Slot k="item_name" v="Test Item" tone="ok" />
                <Slot k="item_price" v="10.99" tone="ok" />
                <Pill code={200} text="OK" />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="err" initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-2">
                <Pill code={422} text="Unprocessable Entity" />
                <p className="text-[11px] text-gray-500 line-through">create_item()</p>
              </motion.div>
            )}
            {step < 2 && (
              <motion.p key="wait" className="text-[11px] text-gray-600">create_item</motion.p>
            )}
          </AnimatePresence>
        </div>
      </Stage>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Path and query                                                         */
/* ------------------------------------------------------------------ */

const URLS = [
  'The path is a sentence with an empty slot.',
  '5 drops into {item_id}.',
  'The response keeps 5, and q is null because nothing else was sent.',
  'params clips the query on. The wire writes %20. The JSON keeps the space.',
];

export function PathQueryVisualizer() {
  const stepper = useStepper(URLS.length, 1600);
  const step = stepper.index;
  const id = step === 0 ? null : step >= 3 ? 10 : 5;
  const queried = step >= 3;
  return (
    <Frame
      title="The path is in the URL. The query rides in params."
      hint="Watch the number fall in, then the query tag clip on."
      footer={<StepControls stepper={stepper} total={URLS.length} />}
    >
      <Caption text={URLS[step]} />
      <Stage className="flex flex-col items-center justify-center gap-6">
        <div className="flex items-end gap-1 font-mono text-xl text-white">
          <span className="text-gray-500 text-sm mb-1">GET</span>
          <span>/items/</span>
          <span className="relative inline-flex items-end justify-center w-12 border-b-2 border-teal-400 h-8">
            <AnimatePresence mode="wait">
              {id == null ? (
                <motion.span key="hole" className="text-sm text-gray-500">{'{ }'}</motion.span>
              ) : (
                <motion.span key={id} initial={{ y: -22, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-teal-200">
                  {id}
                </motion.span>
              )}
            </AnimatePresence>
          </span>
          <AnimatePresence>
            {queried && (
              <motion.span initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-sky-200 text-base ml-1">
                ?q=some%20query
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {queried && (
            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-full border border-sky-400/50 px-3 py-1 font-mono text-[11px] text-sky-100">
              {'params  { q: "some query" }'}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {step >= 2 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2">
              <Slot k="item_id" v={String(id)} tone="ok" />
              <Slot k="q" v={queried ? 'some query' : 'null'} tone={queried ? 'ok' : 'idle'} />
            </motion.div>
          )}
        </AnimatePresence>
      </Stage>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Four things a prediction test checks                                   */
/* ------------------------------------------------------------------ */

const AIMS = [
  { name: 'Input', line: 'The body is parsed into the two fields the schema asked for.' },
  { name: 'Call', line: 'The route reaches predict(). That call is part of the test.' },
  { name: 'Shape', line: 'prediction and probability drop into the response shape.' },
  { name: 'Errors', line: 'A failure becomes a status code. The traceback does not leak out.' },
];

export function PredictAimsVisualizer() {
  const stepper = useStepper(AIMS.length, 1700);
  const step = stepper.index;
  return (
    <Frame
      title="Test the API around the model"
      hint="The packet walks the route. Each stop is one thing the test is allowed to check."
      footer={<StepControls stepper={stepper} total={AIMS.length} />}
    >
      <Caption text={AIMS[step].line} />
      <Stage>
        <div className="absolute left-[8%] right-[8%] top-[4.25rem] h-px bg-gray-700" />
        {AIMS.map((aim, i) => (
          <div key={aim.name} className="absolute top-4 w-16 -translate-x-1/2 text-center" style={{ left: `${16 + i * 22}%` }}>
            <p className={`text-[11px] ${i === step ? 'text-white' : 'text-gray-600'}`}>{aim.name}</p>
            <div className={`mx-auto mt-6 w-2.5 h-2.5 rounded-full ${i === step ? 'bg-teal-300' : 'bg-gray-700'}`} />
          </div>
        ))}
        <motion.div
          animate={{ left: `${16 + step * 22}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="absolute top-[5.4rem] -translate-x-1/2 rounded-lg border border-teal-400 bg-gray-950 px-2 py-1 text-[10px] text-teal-100"
        >
          request
        </motion.div>
        <div className="absolute inset-x-0 bottom-2 flex justify-center">
          <AimAct step={step} />
        </div>
      </Stage>
    </Frame>
  );
}

function AimAct({ step }) {
  if (step === 0) {
    return (
      <div className="flex gap-2">
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}><Slot k="feature1" v="10.5" tone="ok" /></motion.div>
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12 }}><Slot k="feature2" v="categoryA" tone="ok" /></motion.div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: [1, 1.05, 1], opacity: 1 }} transition={{ duration: 0.6 }} className="rounded-2xl border border-teal-400 px-4 py-3 text-center">
        <p className="font-mono text-sm text-white">predict()</p>
        <p className="text-[10px] text-teal-200 mt-1">called</p>
      </motion.div>
    );
  }
  if (step === 2) {
    return (
      <div className="flex gap-2">
        {['prediction', 'probability'].map((key, i) => (
          <motion.div key={key} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.12 }}>
            <Slot k={key} v="float" tone="ok" />
          </motion.div>
        ))}
      </div>
    );
  }
  return (
    <div className="relative h-12 w-56">
      <motion.p initial={{ opacity: 1 }} animate={{ opacity: 0.25 }} className="font-mono text-sm text-rose-300 line-through text-center">Traceback</motion.p>
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }} className="absolute inset-0 flex items-center justify-center">
        <Pill code={422} text="status code" />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Valid prediction vs 422                                                */
/* ------------------------------------------------------------------ */

const PRED = [
  'PredictionInput is waiting for a float and a string.',
  '10.5 and categoryA fill both slots.',
  'predict runs. The result is stamped as a float, and HTTP_200_OK is just 200.',
  'feature2 never arrives. The slot goes red and predict stays dark.',
  'The body bounces. HTTP_422_UNPROCESSABLE_ENTITY is just 422.',
];

export function PredictGateVisualizer() {
  const stepper = useStepper(PRED.length, 1500);
  const step = stepper.index;
  const filled = step === 1 || step === 2;
  const missing = step >= 3;
  return (
    <Frame
      title="200 with a float, or 422"
      hint="The status names on the left are these two numbers."
      footer={<StepControls stepper={stepper} total={PRED.length} />}
    >
      <Caption text={PRED[step]} />
      <Stage className="flex items-center justify-center gap-4">
        <div className="space-y-2">
          <Slot k="feature1" v={filled || missing ? '10.5' : ''} tone={filled || missing ? 'ok' : 'idle'} />
          <Slot k="feature2" v={filled ? 'categoryA' : ''} tone={filled ? 'ok' : missing ? 'bad' : 'idle'} />
        </div>
        <FlowDot travel={step === 2 || step === 4} fail={step === 4} />
        <div className="w-44">
          <AnimatePresence mode="wait">
            {step === 2 && (
              <motion.div key="ok" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                <div className="rounded-2xl border border-teal-400 px-3 py-3 text-center">
                  <p className="text-[10px] text-gray-500">predict()</p>
                  <motion.p initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="font-mono text-2xl text-white">21.0</motion.p>
                  <p className="text-[10px] text-emerald-200">isinstance float</p>
                </div>
                <Pill code={200} text="OK" />
                <p className="text-[10px] text-gray-500">HTTP_200_OK</p>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="bad" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                <p className="text-[12px] text-gray-500 line-through text-center">predict()</p>
                <Pill code={422} text="Unprocessable Entity" />
                <p className="text-[10px] text-gray-500">HTTP_422_UNPROCESSABLE_ENTITY</p>
              </motion.div>
            )}
            {step < 2 && <motion.p key="idle" className="text-[12px] text-gray-600 text-center">predict()</motion.p>}
            {step === 3 && <motion.p key="dark" className="text-[12px] text-rose-200/80 text-center">predict() dark</motion.p>}
          </AnimatePresence>
        </div>
      </Stage>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* feature1 * 2                                                           */
/* ------------------------------------------------------------------ */

const TIMES = [
  'The body is sitting at the door.',
  'Depends carries it into perform_prediction. The wire to get_model is cut.',
  'feature1 is multiplied by 2. Drag the slider and watch only that number move.',
  'The route returns the dict. probability stays 0.9.',
];

export function TimesTwoVisualizer() {
  const [f1, setF1] = useState(10.5);
  const stepper = useStepper(TIMES.length, 1500);
  const step = stepper.index;
  const out = Math.round(f1 * 2 * 100) / 100;
  return (
    <Frame
      title="As written, the result is feature1 × 2"
      hint="The model box never lights. The published function does not call it."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-[11px] text-gray-300">
            feature1
            <input type="range" min={1} max={20} step={0.5} value={f1} onChange={(e) => setF1(Number(e.target.value))} className="accent-teal-500" />
            <span className="font-mono text-white w-8">{f1}</span>
          </label>
          <StepControls stepper={stepper} total={TIMES.length} />
        </div>
      }
    >
      <Caption text={TIMES[step]} />
      <Stage className="flex items-center justify-center">
        <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-3 items-center w-full max-w-lg">
          <Slot k="feature1" v={String(f1)} tone={step >= 0 ? 'ok' : 'idle'} />
          <div className="relative h-8">
            <div className={`absolute inset-x-0 top-1/2 h-px ${step >= 1 ? 'bg-teal-700' : 'bg-gray-800'}`} />
            {step >= 1 && (
              <motion.span className="absolute top-1/2 -mt-1.5 h-3 w-3 rounded-full bg-teal-300" initial={{ left: '0%' }} animate={{ left: '88%' }} transition={{ duration: 0.6 }} />
            )}
          </div>
          <motion.div animate={{ borderColor: step >= 2 ? 'rgba(45,212,191,1)' : 'rgba(55,65,81,1)' }} className="rounded-2xl border px-3 py-3 text-center min-w-[8.5rem]" style={{ borderWidth: 1 }}>
            <p className="text-[10px] text-gray-500">perform_prediction</p>
            <p className="font-mono text-sm text-white mt-1">
              {step >= 2 ? (
                <>
                  {f1} <span className="text-teal-300">× 2</span>
                </>
              ) : (
                '…'
              )}
            </p>
            {step >= 3 && (
              <motion.p key={out} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="font-mono text-lg text-emerald-200">
                {out}
              </motion.p>
            )}
          </motion.div>
          <div />
          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <span className="flex-1 border-t border-dashed border-gray-700" />
            cut
            <span className="flex-1 border-t border-dashed border-gray-700" />
          </div>
          <div className="rounded-2xl border border-dashed border-gray-700 px-3 py-2 text-center opacity-50">
            <p className="text-[10px] text-gray-500">get_model</p>
            <p className="text-[11px] text-gray-600">not called</p>
          </div>
          {step >= 3 && (
            <>
              <div />
              <div />
              <Slot k="probability" v="0.9" tone="ok" />
            </>
          )}
        </div>
      </Stage>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Override                                                               */
/* ------------------------------------------------------------------ */

const SWAP = [
  'The real function is plugged in. 10.5 goes in and 21 comes out.',
  'The cable moves. The mock takes the socket.',
  '10.5 still arrives, and it is ignored. 123.45 and 0.88 come out.',
  'clear() moves the cable back. 21 returns.',
];

export function MockSwapVisualizer() {
  const stepper = useStepper(SWAP.length, 1600);
  const step = stepper.index;
  const mockOn = step === 1 || step === 2;
  const showOut = step !== 1;
  return (
    <Frame
      title="The mock replaces the function"
      hint="Watch the cable. The input does not change. The socket does."
      footer={<StepControls stepper={stepper} total={SWAP.length} />}
    >
      <Caption text={SWAP[step]} />
      <Stage className="flex items-center justify-center gap-2">
        <div className={`w-24 text-center transition-opacity ${step === 2 ? 'opacity-40' : 'opacity-100'}`}>
          <p className="text-[10px] text-gray-500">POST body</p>
          <p className={`font-mono text-2xl text-white ${step === 2 ? 'line-through' : ''}`}>10.5</p>
          {step === 2 && <p className="text-[10px] text-amber-200">ignored</p>}
        </div>
        <div className="relative w-14 h-40">
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-teal-300 shadow-[0_0_8px_#5eead4]"
            animate={{ top: mockOn ? '72%' : '22%' }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          />
        </div>
        <div className="flex flex-col gap-3 w-44">
          <PlugCard title="perform_prediction" hot={!mockOn} detail="10.5 × 2" />
          <PlugCard title="mock" hot={mockOn} detail="123.45 · 0.88" />
        </div>
        <div className="w-24 text-center">
          <AnimatePresence mode="wait">
            {showOut && (
              <motion.div key={mockOn ? 'mock' : 'real'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-2xl text-white">{mockOn ? '123.45' : '21'}</p>
                <p className="text-[10px] text-gray-500">{mockOn ? 'p 0.88' : 'p 0.9'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Stage>
    </Frame>
  );
}

function PlugCard({ title, hot, detail }) {
  return (
    <div className={`rounded-2xl border px-3 py-3 ${hot ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800 opacity-50'}`}>
      <p className="text-[11px] text-white">{title}</p>
      <p className="font-mono text-[11px] text-gray-400 mt-1">{detail}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Forgot to clear                                                        */
/* ------------------------------------------------------------------ */

export function OverrideCleanupVisualizer() {
  const [forgot, setForgot] = useState(false);
  const steps = [
    'The fixture closes the latch and installs the mock.',
    'The first test reads 123.45.',
    forgot ? 'clear() never runs. The latch stays shut.' : 'After the test, clear() opens the latch.',
    forgot ? 'The second test still reads 123.45.' : 'The second test sees 10.5 × 2 again.',
  ];
  const stepper = useStepper(steps.length, 1500);
  const step = stepper.index;
  const stuck = forgot && step >= 2;
  return (
    <Frame
      title="The next test inherits the override"
      hint="Toggle clear(). The second test is the one that changes."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button type="button" className={tabClass(forgot)} onClick={() => setForgot((v) => !v)}>
            {forgot ? 'clear() skipped' : 'clear() ran'}
          </button>
          <StepControls stepper={stepper} total={steps.length} />
        </div>
      }
    >
      <Caption text={steps[step]} />
      <Stage>
        <div className="absolute left-[10%] right-[10%] top-16 h-px bg-gray-700" />
        {['fixture', 'test 1', forgot ? 'no clear' : 'clear()', 'test 2'].map((label, i) => (
          <div key={label} className="absolute top-8 w-20 -translate-x-1/2 text-center" style={{ left: `${16 + i * 22}%` }}>
            <p className={`text-[11px] ${i === step ? 'text-white' : 'text-gray-600'}`}>{label}</p>
            <div className={`mx-auto mt-6 h-2.5 w-2.5 rounded-full ${i === step ? 'bg-teal-300' : 'bg-gray-700'}`} />
          </div>
        ))}
        <motion.div
          className={`absolute top-[4.6rem] h-3 w-8 -translate-x-1/2 rounded-sm ${stuck ? 'bg-amber-400' : 'bg-teal-400'}`}
          animate={{ left: `${16 + step * 22}%`, width: step === 2 && !forgot ? 8 : 32 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        />
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <CleanupReadout step={step} forgot={forgot} />
        </div>
      </Stage>
    </Frame>
  );
}

function CleanupReadout({ step, forgot }) {
  if (step === 0) return <p className="font-mono text-sm text-teal-100">overrides[perform_prediction] = mock</p>;
  if (step === 1) return <p className="font-mono text-3xl text-white">123.45</p>;
  if (step === 2 && !forgot) return <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-emerald-200">dependency_overrides.clear()</motion.p>;
  if (step === 2 && forgot) return <p className="text-sm text-amber-200">mock still installed</p>;
  return <p className={`font-mono text-3xl ${forgot ? 'text-amber-200' : 'text-white'}`}>{forgot ? '123.45' : '21'}</p>;
}

/* ------------------------------------------------------------------ */
/* Dummy model                                                            */
/* ------------------------------------------------------------------ */

const MOCK_BEATS = [
  'The request leaves the route.',
  'The mock is standing where perform_prediction was.',
  'The dot stops. The model room stays dark.',
  '123.45 comes back. 2 + 3 never happens.',
];

const DUMMY_BEATS = [
  'The request leaves the route.',
  'perform_prediction still runs, and it calls the model.',
  'DummyModel.predict flashes.',
  '2 and 3 meet and become 5.',
];

export function DummyPathVisualizer() {
  const [mode, setMode] = useState('mock');
  const mock = mode === 'mock';
  const beats = mock ? MOCK_BEATS : DUMMY_BEATS;
  const stepper = useStepper(beats.length, 1500);
  const pick = (next) => {
    setMode(next);
    stepper.reset();
  };
  return (
    <Frame
      title={mock ? 'A mock skips the model' : 'A dummy still gets predict()'}
      hint="Same request. Switch who is allowed to answer it."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(mock)} onClick={() => pick('mock')}>mock the function</button>
            <button type="button" className={tabClass(!mock)} onClick={() => pick('dummy')}>dummy model</button>
          </div>
          <StepControls stepper={stepper} total={beats.length} />
        </div>
      }
    >
      <DummyRun mock={mock} step={stepper.index} />
    </Frame>
  );
}

function DummyRun({ mock, step }) {
  const beats = mock ? MOCK_BEATS : DUMMY_BEATS;
  const x = mock ? ['8%', '38%', '38%', '78%'][step] : ['8%', '38%', '62%', '84%'][step];
  return (
    <>
      <Caption text={beats[step]} />
      <Stage>
        <div className="absolute left-[8%] right-[8%] top-16 h-px bg-gray-700" />
        <Station left="8%" title="route" hot={step >= 0} />
        <Station left="38%" title={mock ? 'mock' : 'perform_prediction'} hot={step >= 1} />
        <Station left="62%" title={mock ? 'model' : 'DummyModel'} hot={!mock && step >= 2} dim={mock} />
        <div className="absolute top-14 -translate-x-1/2 text-center" style={{ left: '86%' }}>
          <p className="font-mono text-xl text-white h-7">{step === 3 ? (mock ? '123.45' : '5') : ''}</p>
        </div>
        <motion.span
          className="absolute top-[3.55rem] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-teal-300 shadow-[0_0_12px_#5eead4]"
          animate={{ left: x }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        />
        <div className="absolute inset-x-0 bottom-3 flex justify-center h-16 items-center">
          {!mock && step >= 2 && <SumClash done={step === 3} />}
          {mock && step >= 2 && <p className="text-[12px] text-gray-500">model.predict</p>}
          {!mock && step === 2 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-1 text-[11px] text-teal-200">
              predict called
            </motion.p>
          )}
        </div>
      </Stage>
    </>
  );
}

function Station({ left, title, hot, dim }) {
  return (
    <div className={`absolute top-6 -translate-x-1/2 text-center w-28 ${dim ? 'opacity-30' : ''}`} style={{ left }}>
      <p className={`text-[11px] ${hot ? 'text-white' : 'text-gray-600'}`}>{title}</p>
    </div>
  );
}

function SumClash({ done }) {
  return (
    <div className="relative w-40 h-10">
      <motion.span animate={{ x: done ? 28 : 0, opacity: done ? 0 : 1 }} className="absolute left-4 font-mono text-lg text-white">2</motion.span>
      <motion.span animate={{ x: done ? -28 : 0, opacity: done ? 0 : 1 }} className="absolute right-4 font-mono text-lg text-white">3</motion.span>
      {done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 text-center font-mono text-lg text-emerald-200">5</motion.span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* What to cover                                                          */
/* ------------------------------------------------------------------ */

const CASES = [
  { title: 'Happy path', line: 'A complete body walks the whole lane and comes back 200.' },
  { title: 'Validation', line: 'A missing feature2 hits the schema wall and bounces as 422.' },
  { title: 'Edge', line: '0 is still a value. The wall lets it through.' },
  { title: 'Schema', line: 'prediction and probability lock in. An extra key slides off.' },
];

export function ScenarioVisualizer() {
  const stepper = useStepper(CASES.length, 1700);
  const step = stepper.index;
  const blocked = step === 1;
  return (
    <Frame
      title={CASES[step].title}
      hint="Same lane, four different endings."
      footer={<StepControls stepper={stepper} total={CASES.length} />}
    >
      <Caption text={CASES[step].line} />
      <Stage>
        <div className="absolute left-[8%] right-[8%] top-20 h-px bg-gray-700" />
        <div className="absolute top-8 left-[10%] text-[11px] text-gray-400">body</div>
        <div className={`absolute top-8 left-[40%] -translate-x-1/2 text-[11px] ${blocked ? 'text-rose-200' : 'text-gray-400'}`}>schema</div>
        <div className="absolute top-8 right-[12%] text-[11px] text-gray-400">response</div>
        <motion.span
          key={step}
          className={`absolute top-[4.4rem] h-3.5 w-3.5 rounded-full ${blocked ? 'bg-rose-300' : 'bg-teal-300'}`}
          initial={{ left: '10%' }}
          animate={{ left: blocked ? '38%' : '82%' }}
          transition={{ duration: 0.75, ease: 'easeInOut' }}
        />
        <div className="absolute left-[6%] top-28">
          <Slot
            k="feature1"
            v={step === 2 ? '0' : '10.5'}
            tone="ok"
          />
          {step !== 1 && <div className="mt-2"><Slot k="feature2" v="categoryA" tone="ok" /></div>}
        </div>
        <motion.div
          className={`absolute left-[40%] top-10 -translate-x-1/2 w-1 rounded-full ${blocked ? 'bg-rose-400' : 'bg-teal-400/70'}`}
          animate={{ height: blocked ? 96 : 24, opacity: blocked ? 1 : 0.4 }}
        />
        <div className="absolute right-[4%] top-28 w-44">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                <Pill code={200} text="OK" />
                <p className="font-mono text-[12px] text-emerald-100 mt-2">{'{ prediction: 123.45 }'}</p>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="bad" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <Pill code={422} text="Unprocessable Entity" />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="zero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="space-y-2">
                <Pill code={200} text="OK" />
                <p className="text-[11px] text-teal-100">0 was present, so it passed</p>
              </motion.div>
            )}
            {step === 3 && <SchemaLock key="lock" />}
          </AnimatePresence>
        </div>
      </Stage>
    </Frame>
  );
}

function SchemaLock() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-1.5">
      <Slot k="prediction" v="float" tone="ok" />
      <Slot k="probability" v="float" tone="ok" />
      <motion.div initial={{ x: 0, opacity: 1 }} animate={{ x: 28, opacity: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
        <Slot k="score" v="extra" tone="bad" />
      </motion.div>
    </motion.div>
  );
}
