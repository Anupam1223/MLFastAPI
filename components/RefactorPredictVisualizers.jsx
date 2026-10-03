import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Frame, tabClass } from './VisualKit';

function FlowArrow({ hot = true }) {
  return (
    <div className="relative h-6 w-full min-w-[2.5rem]">
      <div className={`absolute left-0 right-2 top-1/2 h-0.5 ${hot ? 'bg-teal-400' : 'bg-gray-700'}`} />
      <motion.span
        className={`absolute top-1/2 -mt-1 h-2 w-2 rounded-full ${hot ? 'bg-teal-300' : 'bg-gray-600'}`}
        animate={hot ? { left: ['0%', '85%'] } : { left: '0%' }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

const EXTRAS = ['GET /model-info', 'POST /batch', 'POST /v2/predict'];

export function CrowdedMainVisualizer() {
  const [count, setCount] = useState(0);
  const routes = ['POST /predict', 'GET /', ...EXTRAS.slice(0, count)];
  return (
    <Frame title="One file holds the whole service" hint="Add the next endpoint. It lands in the same file.">
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={tabClass(true)} onClick={() => setCount((n) => Math.min(EXTRAS.length, n + 1))}>
          add an endpoint
        </button>
        <button type="button" className={tabClass(false)} onClick={() => setCount(0)}>
          start over
        </button>
      </div>
      <div className="rounded-2xl border border-gray-700 bg-gray-950/80 p-4">
        <p className="font-mono text-[12px] text-white">main_before_refactor.py</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['InputFeatures', 'PredictionOutput', 'joblib.load'].map((name) => (
            <span key={name} className="rounded-lg border border-gray-700 px-2 py-1 font-mono text-[11px] text-gray-300">{name}</span>
          ))}
          {routes.map((name) => (
            <motion.span
              key={name}
              initial={{ x: 16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="rounded-lg border border-teal-400/50 bg-teal-500/10 px-2 py-1 font-mono text-[11px] text-teal-100"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[12px] text-gray-300">
        {count === 0
          ? 'Schemas, the model load, and both routes share this file.'
          : `${routes.length} routes now share the file with the schemas and the model load.`}
      </p>
    </Frame>
  );
}

const HOMES = [
  { id: 'features', label: 'InputFeatures', file: 'app/models/schemas.py' },
  { id: 'output', label: 'PredictionOutput', file: 'app/models/schemas.py' },
  { id: 'predict', label: 'POST /predict', file: 'app/routers/predictions.py' },
  { id: 'root', label: 'GET /', file: 'app/main.py' },
  { id: 'include', label: 'include_router', file: 'app/main.py' },
  { id: 'tests', label: 'TestClient', file: 'tests/test_predictions.py' },
];

const FILES = [
  'app/main.py',
  'app/routers/predictions.py',
  'app/models/schemas.py',
  'app/core/config.py',
  'tests/test_predictions.py',
  'model.joblib',
];

export function ProjectTreeVisualizer() {
  const [split, setSplit] = useState(false);
  const [file, setFile] = useState('app/main.py');
  const inside = HOMES.filter((item) => (split ? item.file === file : file === 'app/main.py'));
  return (
    <Frame title="The same pieces, split by job" hint="Split the project, then click a file.">
      <div className="mb-3">
        <button type="button" className={tabClass(split)} onClick={() => { setSplit((v) => !v); setFile('app/main.py'); }}>
          {split ? 'split across files' : 'still one file'}
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-1.5">
          {(split ? FILES : ['main_before_refactor.py']).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => split && setFile(name)}
              className={`block w-full rounded-lg border px-2 py-1.5 text-left font-mono text-[11px] ${file === name || !split ? 'border-teal-400 text-white' : 'border-gray-800 text-gray-400'}`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-gray-800 p-3">
          <p className="font-mono text-[11px] text-teal-200">{split ? file : 'main_before_refactor.py'}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(split ? inside : HOMES).map((item) => (
              <motion.span layout key={item.id} className="rounded-lg border border-teal-400/40 px-2 py-1 font-mono text-[11px] text-teal-100">
                {item.label}
              </motion.span>
            ))}
            {split && file === 'app/core/config.py' && <p className="text-[12px] text-gray-400">Empty for now. Settings can live here later.</p>}
            {split && file === 'model.joblib' && <p className="text-[12px] text-gray-400">The saved model stays at the project root.</p>}
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function SchemaFileVisualizer() {
  const [which, setWhich] = useState('in');
  const input = which === 'in';
  return (
    <Frame title="The two models leave main.py" hint="Click a class. A request body has to match it.">
      <div className="mb-3 flex gap-2">
        <button type="button" className={tabClass(input)} onClick={() => setWhich('in')}>InputFeatures</button>
        <button type="button" className={tabClass(!input)} onClick={() => setWhich('out')}>PredictionOutput</button>
      </div>
      <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <div className={`rounded-2xl border p-3 ${input ? 'border-teal-400' : 'border-sky-400/60'}`}>
          <p className="font-mono text-[11px] text-gray-400">app/models/schemas.py</p>
          <p className="mt-2 font-mono text-[13px] text-white">{input ? 'class InputFeatures' : 'class PredictionOutput'}</p>
          {input ? (
            <div className="mt-2 space-y-1 font-mono text-[12px] text-teal-100">
              <p>feature1: float</p>
              <p>feature2: float</p>
            </div>
          ) : (
            <p className="mt-2 font-mono text-[12px] text-sky-100">prediction: float</p>
          )}
        </div>
        <div className="w-16"><FlowArrow /></div>
        <div className="rounded-2xl border border-gray-800 p-3 font-mono text-[12px]">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">{input ? 'POST body' : 'response'}</p>
          {input ? (
            <>
              <p className="mt-2 text-emerald-200">feature1: 5.1</p>
              <p className="text-emerald-200">feature2: 3.5</p>
            </>
          ) : (
            <p className="mt-2 text-emerald-200">prediction: 1.2</p>
          )}
        </div>
      </div>
    </Frame>
  );
}

export function RouterBuildVisualizer() {
  const [prefixOn, setPrefixOn] = useState(true);
  const url = prefixOn ? '/predict/' : '/';
  return (
    <Frame title="The router owns /predict" hint="Turn the prefix off. The public path shrinks to /.">
      <div className="mb-3">
        <button type="button" className={tabClass(prefixOn)} onClick={() => setPrefixOn((v) => !v)}>
          {prefixOn ? 'prefix="/predict"' : 'no prefix'}
        </button>
      </div>
      <div className="grid items-center gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-2xl border border-gray-800 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">decorator</p>
          <p className="mt-1 font-mono text-[12px] text-white">@router.post("/")</p>
          <p className="mt-2 text-[11px] text-amber-200">tag predictions</p>
        </div>
        <div className="hidden w-12 md:block"><FlowArrow /></div>
        <div className={`rounded-2xl border p-3 ${prefixOn ? 'border-teal-400' : 'border-gray-700'}`}>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">client calls</p>
          <p className="mt-1 font-mono text-[14px] text-teal-100">{url}</p>
        </div>
        <div className="hidden w-12 md:block"><FlowArrow /></div>
        <div className="rounded-2xl border border-gray-800 p-3 font-mono text-[11px] text-emerald-200">
          <p>[[feature1, feature2]]</p>
          <p className="mt-1 text-gray-400">model.predict</p>
          <p className="mt-1">PredictionOutput</p>
        </div>
      </div>
    </Frame>
  );
}

export function IncludeRouterVisualizer() {
  const [route, setRoute] = useState('post');
  const post = route === 'post';
  return (
    <Frame title="main.py mounts the router" hint="GET / stays in main.py. POST /predict goes through the router.">
      <div className="mb-3 flex gap-2">
        <button type="button" className={tabClass(!post)} onClick={() => setRoute('get')}>GET /</button>
        <button type="button" className={tabClass(post)} onClick={() => setRoute('post')}>POST /predict/</button>
      </div>
      <div className="grid items-center gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-2xl border border-teal-400/60 p-3">
          <p className="font-mono text-[12px] text-white">app/main.py</p>
          <p className="mt-2 font-mono text-[11px] text-teal-100">include_router(predictions.router)</p>
          {!post && <p className="mt-2 font-mono text-[11px] text-emerald-200">read_root()</p>}
        </div>
        <div className="hidden w-10 md:block"><FlowArrow hot={post} /></div>
        <div className={`rounded-2xl border p-3 ${post ? 'border-teal-400' : 'border-gray-800 opacity-40'}`}>
          <p className="font-mono text-[12px] text-white">predictions.py</p>
          <p className="mt-2 font-mono text-[11px] text-teal-100">make_prediction()</p>
        </div>
        <div className="hidden w-10 md:block"><FlowArrow hot={post} /></div>
        <div className="rounded-2xl border border-gray-800 bg-black/40 p-3 font-mono text-[12px]">
          {post ? <p className="text-emerald-200">{'{ prediction: 1.2 }'}</p> : <p className="text-emerald-200">{'{ message: "Prediction service is running" }'}</p>}
          <p className="mt-1 text-gray-500">200</p>
        </div>
      </div>
    </Frame>
  );
}

const NODES = {
  main: { title: 'main.py', detail: 'Builds the FastAPI app and calls include_router. GET / stays here.' },
  predictions: { title: 'predictions.py', detail: 'The APIRouter. main.py includes it. It imports the schemas.' },
  schemas: { title: 'schemas.py', detail: 'InputFeatures and PredictionOutput. The router uses these models.' },
  tests: { title: 'test_predictions.py', detail: 'TestClient talks to the FastAPI app. It does not import the router directly.' },
  app: { title: 'FastAPI app', detail: 'The object created in main.py. Tests send HTTP at this object.' },
  router: { title: 'APIRouter', detail: 'Mounted on the app. Its prefix is /predict.' },
  models: { title: 'Pydantic models', detail: 'The router declares them as the body and the response.' },
};

export function StructureMapVisualizer() {
  const [active, setActive] = useState('main');
  return (
    <Frame title="Who includes, imports, and tests" hint="Click a box.">
      <div className="space-y-3">
        <div className="grid items-center gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <MapNode id="main" active={active} onPick={setActive} />
          <ArrowLabel text="includes" />
          <MapNode id="predictions" active={active} onPick={setActive} />
          <ArrowLabel text="imports" />
          <MapNode id="schemas" active={active} onPick={setActive} />
        </div>
        <div className="grid items-center gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          <MapNode id="tests" active={active} onPick={setActive} />
          <ArrowLabel text="tests" />
          <MapNode id="app" active={active} onPick={setActive} />
          <ArrowLabel text="includes" />
          <MapNode id="router" active={active} onPick={setActive} />
          <ArrowLabel text="uses" />
          <MapNode id="models" active={active} onPick={setActive} />
        </div>
      </div>
      <p className="mt-3 text-[12px] text-gray-200">{NODES[active].detail}</p>
    </Frame>
  );
}

function MapNode({ id, active, onPick }) {
  const on = active === id;
  return (
    <button type="button" onClick={() => onPick(id)} className={`rounded-xl border px-2 py-3 text-left ${on ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800'}`}>
      <p className="font-mono text-[12px] text-white">{NODES[id].title}</p>
    </button>
  );
}

function ArrowLabel({ text }) {
  return <p className="hidden text-center text-[10px] uppercase tracking-wider text-teal-300 md:block">{text}</p>;
}

export function RootTestVisualizer() {
  const [ok, setOk] = useState(true);
  return (
    <Frame title='client.get("/")' hint="Flip the handler message. The second assert fails.">
      <div className="mb-3">
        <button type="button" className={tabClass(ok)} onClick={() => setOk((v) => !v)}>
          {ok ? 'handler returns the real message' : 'handler returns a different message'}
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 p-3 font-mono text-[12px]">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">GET /</p>
          <p className="mt-2 text-emerald-200">200</p>
          <p className={ok ? 'text-teal-100' : 'text-amber-200'}>
            {ok ? '{ message: "Prediction service is running" }' : '{ message: "hello" }'}
          </p>
        </div>
        <div className="space-y-2">
          <Assert ok label="status_code == 200" />
          <Assert ok={ok} label='json() == {"message": "Prediction service is running"}' />
        </div>
      </div>
    </Frame>
  );
}

function Assert({ ok, label }) {
  return (
    <div className={`rounded-xl border px-3 py-2 font-mono text-[11px] ${ok ? 'border-emerald-400/50 text-emerald-200' : 'border-rose-400/60 text-rose-200'}`}>
      {ok ? 'passed' : 'failed'} · {label}
    </div>
  );
}

export function PredictOkVisualizer() {
  return (
    <Frame title="A valid body reaches the model" hint="The test checks the status, the key, and the type.">
      <div className="grid items-center gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <div className="rounded-2xl border border-gray-800 p-3 font-mono text-[12px] text-teal-100">
          <p>feature1: 5.1</p>
          <p>feature2: 3.5</p>
        </div>
        <div className="hidden w-10 md:block"><FlowArrow /></div>
        <div className="rounded-2xl border border-teal-400/50 p-3 font-mono text-[12px] text-white">
          <p>POST /predict/</p>
          <p className="mt-1 text-[11px] text-gray-400">[[5.1, 3.5]]</p>
        </div>
        <div className="hidden w-10 md:block"><FlowArrow /></div>
        <div className="rounded-2xl border border-emerald-400/40 p-3 font-mono text-[12px]">
          <p className="text-emerald-200">200</p>
          <p className="text-teal-100">prediction: 1.2</p>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <Assert ok label="status_code == 200" />
        <Assert ok label='"prediction" in response' />
        <Assert ok label="prediction is a float" />
      </div>
    </Frame>
  );
}

export function WrongTypeVisualizer() {
  const [bad, setBad] = useState(true);
  return (
    <Frame title="A string where a float is required" hint="Send the string. The route returns 422 before the model runs.">
      <div className="mb-3">
        <button type="button" className={tabClass(bad)} onClick={() => setBad((v) => !v)}>
          {bad ? 'feature1 = "wrong_type"' : 'feature1 = 5.1'}
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 p-3 font-mono text-[12px]">
          <p className={bad ? 'text-rose-200' : 'text-teal-100'}>feature1: {bad ? '"wrong_type"' : '5.1'}</p>
          <p className="text-teal-100">feature2: 3.5</p>
          <p className="mt-3 text-gray-500">{bad ? 'model.predict does not run' : 'model.predict runs'}</p>
        </div>
        <div className={`rounded-2xl border p-3 font-mono text-[12px] ${bad ? 'border-rose-400/50' : 'border-emerald-400/40'}`}>
          <p className={bad ? 'text-rose-200' : 'text-emerald-200'}>{bad ? '422' : '200'}</p>
          {bad ? <p className="mt-2 text-amber-200">detail · feature1</p> : <p className="mt-2 text-teal-100">prediction: 1.2</p>}
        </div>
      </div>
    </Frame>
  );
}

export function MissingFeatureVisualizer() {
  const [missing, setMissing] = useState(true);
  return (
    <Frame title="feature2 never arrives" hint="Drop feature2. The 422 names that field.">
      <div className="mb-3">
        <button type="button" className={tabClass(missing)} onClick={() => setMissing((v) => !v)}>
          {missing ? 'body is only feature1' : 'both features sent'}
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 p-3 font-mono text-[12px]">
          <p className="text-teal-100">feature1: 5.1</p>
          <p className={missing ? 'text-rose-300 line-through' : 'text-teal-100'}>feature2: 3.5</p>
        </div>
        <div className={`rounded-2xl border p-3 font-mono text-[12px] ${missing ? 'border-rose-400/50' : 'border-emerald-400/40'}`}>
          <p className={missing ? 'text-rose-200' : 'text-emerald-200'}>{missing ? '422' : '200'}</p>
          {missing ? (
            <>
              <p className="mt-2 text-amber-200">detail · feature2</p>
              <p className="text-amber-200">field required</p>
            </>
          ) : (
            <p className="mt-2 text-teal-100">prediction: 1.2</p>
          )}
        </div>
      </div>
    </Frame>
  );
}

const PYTESTS = [
  { id: 'root', name: 'test_read_root', sent: 'GET /' },
  { id: 'ok', name: 'test_make_prediction_success', sent: 'POST /predict/  5.1, 3.5' },
  { id: 'type', name: 'test_make_prediction_invalid_input_type', sent: 'POST /predict/  feature1="wrong_type"' },
  { id: 'miss', name: 'test_make_prediction_missing_input_feature', sent: 'POST /predict/  feature2 missing' },
];

export function PytestRunVisualizer() {
  const [passed, setPassed] = useState(0);
  const [picked, setPicked] = useState('root');
  const running = passed > 0 && passed < PYTESTS.length;

  useEffect(() => {
    if (!running) return undefined;
    const id = setTimeout(() => setPassed((n) => n + 1), 700);
    return () => clearTimeout(id);
  }, [running, passed]);

  const current = PYTESTS.find((item) => item.id === picked);

  return (
    <Frame title="pytest collects tests/" hint="Run the file. Each test lights as it passes.">
      <div className="mb-3">
        <button
          type="button"
          className={tabClass(passed > 0)}
          onClick={() => setPassed(passed >= PYTESTS.length ? 1 : passed === 0 ? 1 : passed)}
        >
          {passed === 0 ? 'run pytest' : passed >= PYTESTS.length ? 'run again' : 'running'}
        </button>
      </div>
      <div className="space-y-2">
        {PYTESTS.map((item, index) => {
          const done = index < passed;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPicked(item.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left font-mono text-[12px] ${picked === item.id ? 'border-teal-400' : 'border-gray-800'} ${done ? 'text-emerald-200' : 'text-gray-400'}`}
            >
              <span>{item.name}</span>
              <span>{done ? 'passed' : '…'}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 font-mono text-[12px] text-teal-100">{current.sent}</p>
      {passed >= PYTESTS.length && <p className="mt-1 text-[12px] text-emerald-200">4 passed</p>}
    </Frame>
  );
}
