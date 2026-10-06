import { useState } from 'react';
import {
  AlertTriangle,
  Cpu,
  FolderGit2,
  Gauge,
  Network,
  Send,
  Server,
  Shield,
  Terminal,
} from 'lucide-react';

function Frame({ children }) {
  return <div className="flex h-full min-h-0 flex-col gap-3 overflow-auto px-3 pb-3 pt-12 select-none">{children}</div>;
}

function Bar({ on, children }) {
  return <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gray-800 bg-gray-950/80 p-2.5">{children}{on}</div>;
}

function Chip({ active, onClick, children, tone = 'teal' }) {
  const on = tone === 'rose'
    ? 'bg-rose-500/20 text-rose-200 border-rose-400/50'
    : tone === 'amber'
      ? 'bg-amber-500/20 text-amber-200 border-amber-400/50'
      : 'bg-teal-500/20 text-teal-100 border-teal-300/50';
  return (
    <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${active ? on : 'border-transparent bg-gray-800 text-gray-400'}`}>
      {children}
    </button>
  );
}

export function ProjectTreeVisualizer() {
  const [selected, setSelected] = useState('predict.py');
  const nodes = {
    'main.py': {
      path: 'app/main.py',
      role: 'FastAPI app',
      dest: '/app/app/main.py',
      code: 'app = FastAPI()\napp.include_router(predict.router)',
    },
    'predict.py': {
      path: 'app/api/predict.py',
      role: '/predict',
      dest: '/app/app/api/predict.py',
      code: '@router.post("/predict")\nasync def predict_sentiment(payload): ...',
    },
    'inference.py': {
      path: 'app/core/inference.py',
      role: 'Load and infer',
      dest: '/app/app/core/inference.py',
      code: 'model = joblib.load("/app/models/sentiment_model.joblib")',
    },
    'sentiment_model.joblib': {
      path: 'models/sentiment_model.joblib',
      role: 'Trained model',
      dest: '/app/models/sentiment_model.joblib',
      code: 'joblib artifact',
    },
    Dockerfile: {
      path: 'Dockerfile',
      role: 'Build file',
      dest: 'read at build time',
      code: 'FROM python:3.9-slim',
    },
    'requirements.txt': {
      path: 'requirements.txt',
      role: 'Packages',
      dest: '/app/requirements.txt',
      code: 'fastapi, uvicorn, scikit-learn, joblib, pydantic',
    },
  };
  const current = nodes[selected];
  const row = (id, label) => (
    <button key={id} type="button" onClick={() => setSelected(id)} className={`w-full rounded px-2 py-0.5 text-left font-mono text-[11px] ${selected === id ? 'bg-teal-400 font-bold text-gray-950' : 'text-teal-100'}`}>
      {label}
    </button>
  );

  return (
    <Frame>
      <Bar>
        <span className="flex items-center gap-1.5 text-xs font-bold text-teal-200"><FolderGit2 className="h-3.5 w-3.5" /> my_ml_api/</span>
      </Bar>
      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
        <div className="space-y-1 rounded-2xl border border-gray-800 p-3 font-mono text-[11px] text-gray-400">
          <p className="font-bold text-amber-200">my_ml_api/</p>
          <p className="pl-3">app/</p>
          <div className="pl-6">{row('main.py', 'main.py')}</div>
          <p className="pl-6">api/</p>
          <div className="pl-10">{row('predict.py', 'predict.py')}</div>
          <p className="pl-6">core/</p>
          <div className="pl-10">{row('inference.py', 'inference.py')}</div>
          <p className="pl-3">models/</p>
          <div className="pl-6">{row('sentiment_model.joblib', 'sentiment_model.joblib')}</div>
          <p className="pl-3 text-gray-600">tests/</p>
          <div className="pl-3">{row('Dockerfile', 'Dockerfile')}</div>
          <div className="pl-3">{row('requirements.txt', 'requirements.txt')}</div>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-teal-400/30 p-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">{current.role}</p>
            <p className="mt-1 font-mono text-xs text-white">{current.path}</p>
            <p className="font-mono text-[11px] text-emerald-300">{current.dest}</p>
            <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px] text-teal-100">{current.code}</pre>
          </div>
        </div>
      </div>
    </Frame>
  );
}

const DOCKER_STEPS = [
  { code: 'FROM python:3.9-slim', title: 'Slim Python base', explain: 'Pin 3.9 and keep the image smaller.', fs: ['/bin/python3.9'] },
  { code: 'WORKDIR /app', title: 'Working directory', explain: 'Later COPY and CMD run in /app.', fs: ['/app'] },
  { code: 'COPY requirements.txt requirements.txt', title: 'Requirements first', explain: 'Only the package list is copied, so pip can stay cached.', fs: ['/app/requirements.txt'] },
  { code: 'RUN pip install --no-cache-dir -r requirements.txt', title: 'Install packages', explain: 'One layer. --no-cache-dir leaves the pip cache out.', fs: ['site-packages: fastapi, sklearn, joblib'] },
  { code: 'COPY ./app /app/app\nCOPY ./models /app/models', title: 'Code and model', explain: 'tests/ stay on the host.', fs: ['/app/app/main.py', '/app/models/sentiment_model.joblib'] },
  { code: 'EXPOSE 8000', title: 'Document port 8000', explain: 'This records the port. It does not publish it.', fs: ['metadata: 8000/tcp'] },
  { code: 'CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]', title: 'Start command', explain: 'main.py is inside app/, so the module is app.main:app.', fs: ['listening 0.0.0.0:8000'] },
];

export function DockerfileRecipeVisualizer() {
  const [step, setStep] = useState(0);
  const pick = (n) => setStep(Math.min(6, Math.max(0, n)));
  const active = DOCKER_STEPS[step];

  return (
    <Frame>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => pick(step - 1)} disabled={step === 0} className="rounded-lg bg-gray-800 px-3 py-1.5 text-xs font-semibold disabled:opacity-30">Prev</button>
        <button type="button" onClick={() => pick(step + 1)} disabled={step === 6} className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-30">Next</button>
        {DOCKER_STEPS.map((s, i) => (
          <button key={s.title} type="button" onClick={() => pick(i)} className={`h-7 w-7 rounded-lg font-mono text-xs font-bold ${step === i ? 'bg-teal-400 text-gray-950' : i < step ? 'bg-emerald-500/20 text-emerald-200' : 'bg-gray-800 text-gray-400'}`}>{i + 1}</button>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-5">
        <div className="space-y-1.5 md:col-span-3">
          {DOCKER_STEPS.map((s, i) => (
            <button key={s.title} type="button" onClick={() => pick(i)} className={`w-full whitespace-pre-wrap rounded-xl border px-2 py-1.5 text-left font-mono text-[11px] ${step === i ? 'border-teal-300 bg-teal-500/15 text-white' : i < step ? 'border-gray-800 text-emerald-200' : 'border-transparent text-gray-600'}`}>
              {s.code}
            </button>
          ))}
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-teal-400/30 p-3 md:col-span-2">
          <div>
            <p className="text-[10px] font-bold uppercase text-teal-300">Step {step + 1} of 7</p>
            <p className="mt-1 text-sm font-bold text-white">{active.title}</p>
            <p className="mt-1 text-xs text-gray-300">{active.explain}</p>
            <div className="mt-3 space-y-1 rounded-xl border border-gray-800 bg-gray-950 p-2 font-mono text-[11px] text-emerald-200">
              {active.fs.map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-amber-400/40 bg-amber-500/10 p-2 font-mono text-[11px] text-amber-100">COPY ./app /app/app → app.main:app</p>
        </div>
      </div>
    </Frame>
  );
}

const BUILD_LAYERS = [
  { instr: 'FROM python:3.9-slim', cold: '4.2s', warm: 'cached' },
  { instr: 'WORKDIR /app', cold: '0.1s', warm: 'cached' },
  { instr: 'COPY requirements.txt', cold: '0.1s', warm: 'cached' },
  { instr: 'RUN pip install', cold: '94.6s', warm: 'cached' },
  { instr: 'COPY ./app /app/app', cold: '0.2s', warm: 'rebuilt' },
  { instr: 'COPY ./models /app/models', cold: '0.4s', warm: 'rebuilt' },
];

export function BuildImageVisualizer() {
  const [buildType, setBuildType] = useState('cached');
  const [showImages, setShowImages] = useState(true);

  return (
    <Frame>
      <Bar>
        <div className="flex flex-wrap gap-2">
          <Chip active={buildType === 'first'} tone="amber" onClick={() => setBuildType('first')}>First build</Chip>
          <Chip active={buildType === 'cached'} onClick={() => setBuildType('cached')}>Edit app code, build again</Chip>
        </div>
        <Chip active={showImages} onClick={() => setShowImages((v) => !v)}>docker images</Chip>
      </Bar>
      <div className="flex min-h-0 flex-1 flex-col justify-between rounded-2xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px]">
        <div>
          <p className="mb-2 text-gray-400">docker build -t my-ml-api:latest . <span className="text-teal-200">{buildType === 'first' ? '99.6s' : '0.6s'}</span></p>
          <div className="space-y-1.5">
            {BUILD_LAYERS.map((layer, i) => {
              const cached = buildType === 'cached' && i < 4;
              return (
                <div key={layer.instr} className={`flex items-center justify-between rounded-lg border px-2 py-1.5 ${cached ? 'border-emerald-400/30 text-emerald-200' : 'border-gray-800 text-gray-200'}`}>
                  <span>{layer.instr}</span>
                  <span className="font-bold">{buildType === 'first' ? layer.cold : layer.warm}</span>
                </div>
              );
            })}
          </div>
        </div>
        {showImages && (
          <div className="mt-3 rounded-xl border border-teal-400/30 p-2">
            <p className="text-gray-500">REPOSITORY   TAG     SIZE</p>
            <p className="font-bold text-emerald-200">my-ml-api    latest  412MB</p>
          </div>
        )}
      </div>
    </Frame>
  );
}

export function RunFlagsVisualizer() {
  const [hostPort, setHostPort] = useState(8000);
  const [containerPort, setContainerPort] = useState(8000);
  const uvicornPort = 8000;
  const aligned = containerPort === uvicornPort;
  const set = (host, container) => {
    setHostPort(host);
    setContainerPort(container);
  };

  return (
    <Frame>
      <Bar>
        <div className="flex flex-wrap gap-2">
          <Chip active={aligned && hostPort === 8000} onClick={() => set(8000, 8000)}>-p 8000:8000</Chip>
          <Chip active={aligned && hostPort === 9090} onClick={() => set(9090, 8000)}>-p 9090:8000</Chip>
          <Chip active={!aligned} tone="rose" onClick={() => set(8000, 5000)}>-p 8000:5000</Chip>
        </div>
      </Bar>
      <p className="rounded-xl border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-[11px]">
        docker run -d <span className={aligned ? 'text-emerald-300' : 'text-rose-300'}>-p {hostPort}:{containerPort}</span> --name ml-api-container my-ml-api:latest
      </p>
      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-800 p-3">
          <p className="text-[10px] uppercase text-gray-500">Host</p>
          <p className="mt-2 font-mono text-sm font-bold text-amber-200">localhost:{hostPort}</p>
        </div>
        <div className={`rounded-2xl border p-3 ${aligned ? 'border-emerald-400/40' : 'border-rose-400/50'}`}>
          <p className="text-[10px] uppercase text-gray-500">-p bridge</p>
          <p className="mt-2 font-mono text-sm font-bold text-white">{hostPort} → {containerPort}</p>
          <p className="mt-2 text-[11px] text-gray-300">{aligned ? 'Reaches the process on 8000.' : 'Nothing is listening on 5000.'}</p>
        </div>
        <div className="rounded-2xl border border-teal-400/30 p-3">
          <p className="text-[10px] uppercase text-teal-300">Inside the container</p>
          <p className="mt-2 font-mono text-[11px] text-teal-100">EXPOSE {uvicornPort}</p>
          <p className="font-mono text-[11px] text-teal-100">--port {uvicornPort}</p>
        </div>
      </div>
    </Frame>
  );
}

const SAMPLES = [
  { text: 'FastAPI is great for ML models!', sentiment: 'POSITIVE', confidence: '0.98' },
  { text: 'The build failed after a bad pin.', sentiment: 'NEGATIVE', confidence: '0.94' },
  { text: 'The model file is in the image.', sentiment: 'POSITIVE', confidence: '0.89' },
];

export function VerifyApiVisualizer() {
  const [status, setStatus] = useState('running');
  const [sampleIdx, setSampleIdx] = useState(0);
  const [logs, setLogs] = useState([
    'Uvicorn running on http://0.0.0.0:8000',
    'Loaded sentiment_model.joblib',
  ]);
  const [last, setLast] = useState({ ...SAMPLES[0], status: 200 });
  const sample = SAMPLES[sampleIdx];

  const send = () => {
    const next = (sampleIdx + 1) % SAMPLES.length;
    const chosen = SAMPLES[next];
    setSampleIdx(next);
    if (status !== 'running') {
      setLast({ text: chosen.text, status: 0 });
      return;
    }
    setLast({ ...chosen, status: 200 });
    setLogs((prev) => [...prev.slice(-3), `POST /predict 200 ${chosen.sentiment}`]);
  };

  return (
    <Frame>
      <Bar>
        <button type="button" onClick={send} className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-3 py-1.5 text-xs font-bold text-gray-950">
          <Send className="h-3.5 w-3.5" /> curl POST /predict
        </button>
        <div className="flex flex-wrap gap-2">
          {status === 'running' && (
            <button type="button" onClick={() => { setStatus('stopped'); setLogs((prev) => [...prev.slice(-3), 'Shutting down']); }} className="rounded-xl bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-100">docker stop</button>
          )}
          {status === 'stopped' && (
            <>
              <button type="button" onClick={() => setStatus('running')} className="rounded-xl bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-100">docker start</button>
              <button type="button" onClick={() => setStatus('removed')} className="rounded-xl bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-100">docker rm</button>
            </>
          )}
          {status === 'removed' && (
            <button type="button" onClick={() => setStatus('running')} className="rounded-xl bg-teal-500 px-3 py-1.5 text-xs font-bold text-gray-950">docker run -d</button>
          )}
        </div>
      </Bar>
      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px]">
          <p className="text-gray-500">curl -X POST localhost:8000/predict</p>
          <p className="mt-1 text-pink-200">{"{\"text\": \""}{sample.text}{"\"}"}</p>
          {last.status === 200 ? (
            <div className="mt-3 rounded-xl border border-emerald-400/30 p-2 text-emerald-100">
              <p>200</p>
              <p>sentiment {last.sentiment}</p>
              <p>confidence {last.confidence}</p>
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-rose-400/40 p-2 text-rose-200">Connection refused</p>
          )}
        </div>
        <div className="rounded-2xl border border-gray-800 p-3 font-mono text-[11px]">
          <p className="mb-2 text-gray-400">docker ps <span className="text-teal-200">{status}</span></p>
          {status === 'running' ? (
            <p className="mb-3 text-emerald-200">ml-api-container  0.0.0.0:8000→8000/tcp</p>
          ) : (
            <p className="mb-3 text-gray-500">{status}</p>
          )}
          <p className="mb-1 text-gray-400">docker logs ml-api-container</p>
          {status === 'removed' ? (
            <p className="text-rose-300">No such container</p>
          ) : (
            logs.map((line) => <p key={line} className="truncate text-teal-100">{line}</p>)
          )}
        </div>
      </div>
    </Frame>
  );
}

function DevVsProd() {
  const [mode, setMode] = useState('prod');
  const [crashed, setCrashed] = useState(null);
  const [burst, setBurst] = useState(false);
  const dead = crashed === 'dev';

  return (
    <>
      <Bar>
        <div className="flex flex-wrap gap-2">
          <Chip active={mode === 'dev'} tone="amber" onClick={() => { setMode('dev'); setCrashed(null); }}>uvicorn --reload</Chip>
          <Chip active={mode === 'prod'} onClick={() => { setMode('prod'); setCrashed(null); }}>Gunicorn + 4 workers</Chip>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={burst} onClick={() => setBurst((v) => !v)}>{burst ? 'Traffic on' : 'Send traffic'}</Chip>
          <Chip tone="rose" active={crashed !== null} onClick={() => setCrashed(mode === 'dev' ? 'dev' : 2)}>Crash a process</Chip>
        </div>
      </Bar>
      <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-800 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[11px] text-gray-400">{mode === 'dev' ? 'uvicorn main:app --reload' : 'gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app'}</p>
          <span className={`rounded-lg px-2 py-1 font-mono text-[11px] font-bold ${dead ? 'bg-rose-500 text-white' : crashed === 2 ? 'bg-amber-500/20 text-amber-100' : 'bg-emerald-500/20 text-emerald-100'}`}>
            {dead ? 'API down' : crashed === 2 ? 'Worker 2 exited' : '200'}
          </span>
        </div>
        {mode === 'prod' ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-teal-400/40 px-3 py-2">
            <span className="flex items-center gap-2 text-xs font-bold text-white"><Shield className="h-3.5 w-3.5 text-teal-300" /> Gunicorn master</span>
            {crashed === 2 ? (
              <button type="button" onClick={() => setCrashed(null)} className="rounded-lg bg-teal-500 px-2 py-1 text-[11px] font-bold text-gray-950">Respawn worker 2</button>
            ) : (
              <span className="font-mono text-[11px] text-teal-200">watching 4 workers</span>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-400/30 px-3 py-2">
            <span className="flex items-center gap-2 text-xs font-bold text-amber-100"><AlertTriangle className="h-3.5 w-3.5" /> No process manager</span>
            {dead && <button type="button" onClick={() => setCrashed(null)} className="rounded-lg bg-amber-400 px-2 py-1 text-[11px] font-bold text-gray-950">Restart server</button>}
          </div>
        )}
        <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((core) => {
            const idle = mode === 'dev' && core > 1;
            const down = (mode === 'dev' && core === 1 && dead) || (mode === 'prod' && core === crashed);
            return (
              <div key={core} className={`flex min-h-[108px] flex-col justify-between rounded-2xl border p-3 ${down ? 'border-rose-400 bg-rose-950/40' : idle ? 'border-gray-800 opacity-40' : 'border-emerald-400/40'}`}>
                <span className="flex items-center justify-between font-mono text-[10px] text-gray-400">Core {core}<Cpu className={`h-3.5 w-3.5 ${down ? 'text-rose-300' : 'text-emerald-300'}`} /></span>
                <p className="text-center text-[11px] font-bold text-white">{idle ? 'idle' : down ? 'exited' : mode === 'dev' ? 'one Uvicorn' : `worker ${core}`}</p>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-950">
                  <div className={`h-full bg-teal-400 ${down || idle ? 'w-0' : burst ? 'w-full' : 'w-1/3'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const PHASES = ['idle', 'toMaster', 'toWorker', 'response'];
const PHASE_LABEL = ['Send request', 'Forward to worker', 'Return response', 'Clear'];

function RequestPath() {
  const [worker, setWorker] = useState(0);
  const [phase, setPhase] = useState(0);
  const [reloading, setReloading] = useState(false);
  const name = PHASES[phase];
  const workers = [
    { name: 'Worker 1', pid: 1041 },
    { name: 'Worker 2', pid: 1042 },
    { name: 'Worker N', pid: 1043 },
  ];

  return (
    <>
      <Bar>
        <span className="flex items-center gap-1.5 text-xs font-bold text-teal-200"><Network className="h-3.5 w-3.5" /> Request path</span>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setPhase((n) => (n + 1) % 4)} className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-3 py-1.5 text-xs font-bold text-gray-950">
            <Send className="h-3.5 w-3.5" /> {PHASE_LABEL[phase]}
          </button>
          <Chip active={reloading} onClick={() => setReloading((v) => !v)}>{reloading ? 'New workers up' : 'Zero-downtime reload'}</Chip>
        </div>
      </Bar>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-between rounded-2xl border border-gray-800 p-3">
        <div className={`rounded-full border px-4 py-2 text-center ${name === 'toMaster' || name === 'response' ? 'border-teal-300 bg-teal-500/15' : 'border-gray-700'}`}>
          <p className="text-xs font-bold text-white">Client</p>
          <p className="font-mono text-[10px] text-teal-200">{name === 'response' ? '200 JSON' : 'POST /predict'}</p>
        </div>
        <p className="font-mono text-[10px] text-gray-400">{name === 'toMaster' ? 'request ↓' : name === 'response' ? 'response ↑' : ' '}</p>
        <div className={`w-full max-w-sm rounded-2xl border px-3 py-2 text-center ${name !== 'idle' ? 'border-teal-300' : 'border-teal-400/30'}`}>
          <p className="text-xs font-bold text-teal-200">Gunicorn master</p>
          <p className="font-mono text-[10px] text-gray-300">listens on 8000</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2">
          {workers.map((item, id) => (
            <button key={item.pid} type="button" onClick={() => setWorker(id)} className={`rounded-2xl border p-2 text-center ${reloading ? 'border-emerald-300' : worker === id && name === 'toWorker' ? 'border-teal-200 bg-teal-400 text-gray-950' : worker === id ? 'border-teal-400/60' : 'border-gray-800'}`}>
              <p className="font-mono text-[10px]">PID {reloading ? item.pid + 100 : item.pid}</p>
              <p className="text-xs font-bold">{item.name}</p>
              <p className="text-[10px]">FastAPI</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function GunicornWorkersVisualizer() {
  const [view, setView] = useState('crash');
  return (
    <Frame>
      <div className="flex gap-2">
        <Chip active={view === 'crash'} onClick={() => setView('crash')}>One process vs four workers</Chip>
        <Chip active={view === 'path'} onClick={() => setView('path')}>Master forwards a request</Chip>
      </div>
      {view === 'crash' ? <DevVsProd /> : <RequestPath />}
    </Frame>
  );
}

const TOKENS = [
  { id: 'bin', code: 'gunicorn', title: 'Process manager', detail: 'Starts the master. The master watches the workers.' },
  { id: 'workers', code: '-w 4', title: 'Worker count', detail: 'Four worker processes. A usual start is (2 × cores) + 1.' },
  { id: 'workerClass', code: '-k uvicorn.workers.UvicornWorker', title: 'Uvicorn worker class', detail: 'FastAPI needs ASGI. This flag makes each worker a Uvicorn worker.' },
  { id: 'module', code: 'main:app', title: 'App import', detail: 'Module main, object app. The hands-on tree uses app.main:app.' },
  { id: 'bind', code: '-b 0.0.0.0:8000', title: 'Bind address', detail: '0.0.0.0 lets traffic from outside the container reach port 8000.' },
];

function CommandInspector() {
  const [token, setToken] = useState('workerClass');
  const [tab, setTab] = useState('cli');
  const active = TOKENS.find((item) => item.id === token);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Chip active={tab === 'cli'} onClick={() => setTab('cli')}>Command</Chip>
        <Chip active={tab === 'dockerfile'} onClick={() => setTab('dockerfile')}>Dockerfile CMD</Chip>
      </div>
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-gray-800 bg-gray-950 p-2 font-mono text-[11px]">
        {TOKENS.map((item) => (
          <button key={item.id} type="button" onClick={() => setToken(item.id)} className={`rounded-lg px-2 py-1 font-bold ${token === item.id ? 'bg-teal-400 text-gray-950' : 'bg-gray-900 text-teal-100'}`}>{item.code}</button>
        ))}
      </div>
      {tab === 'cli' ? (
        <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-5">
          <div className="rounded-2xl border border-teal-400/30 p-3 md:col-span-3">
            <p className="font-mono text-sm font-bold text-white">{active.code}</p>
            <p className="text-xs font-semibold text-teal-200">{active.title}</p>
            <p className="mt-2 text-xs text-gray-300">{active.detail}</p>
          </div>
          <div className="rounded-2xl border border-rose-400/40 p-3 md:col-span-2">
            <p className="text-xs font-bold text-white">Without -k</p>
            <p className="mt-2 font-mono text-[11px] text-rose-200">Default workers speak WSGI. FastAPI needs ASGI.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px] text-gray-300">
          <p className="text-gray-500">EXPOSE 8000</p>
          <p className="mt-2 rounded-xl border border-teal-400/30 p-2 text-teal-100">CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "-b", "0.0.0.0:8000"]</p>
        </div>
      )}
    </>
  );
}

function WorkerSizing() {
  const [cores, setCores] = useState(4);
  const [workload, setWorkload] = useState('ml');
  const [workers, setWorkers] = useState(4);
  const formula = 2 * cores + 1;
  const ram = ((workers * 450) / 1024).toFixed(1);
  const thrashing = workload === 'ml' && workers > cores * 2;
  const under = workers < cores;
  const pickCores = (count) => {
    setCores(count);
    setWorkers(workload === 'io' ? 2 * count + 1 : count);
  };

  return (
    <>
      <Bar>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-amber-200">Cores</span>
          {[2, 4, 8].map((count) => (
            <Chip key={count} active={cores === count} tone="amber" onClick={() => pickCores(count)}>{count}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={workload === 'io'} onClick={() => { setWorkload('io'); setWorkers(formula); }}>I/O API</Chip>
          <Chip active={workload === 'ml'} tone="amber" onClick={() => { setWorkload('ml'); setWorkers(cores); }}>ML inference</Chip>
        </div>
      </Bar>
      <div className="rounded-2xl border border-gray-800 bg-gray-950 p-3">
        <div className="mb-1 flex justify-between font-mono text-[11px] text-gray-300">
          <span>-w {workers}</span>
          <span>(2 × {cores}) + 1 = {formula}</span>
        </div>
        <input type="range" min={1} max={cores * 3 + 1} value={workers} onChange={(event) => setWorkers(Number(event.target.value))} className="w-full accent-teal-400" />
      </div>
      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
        <div className={`rounded-2xl border p-3 ${thrashing ? 'border-rose-400/50' : under ? 'border-amber-400/40' : 'border-emerald-400/40'}`}>
          <p className="flex items-center gap-1.5 text-xs font-bold text-white"><Gauge className="h-3.5 w-3.5 text-amber-300" /> {thrashing ? 'Context switching' : under ? 'Cores idle' : 'Fits the cores'}</p>
          <p className="mt-2 text-xs text-gray-300">
            {thrashing && `${workers} CPU-bound workers on ${cores} cores keep getting paused.`}
            {under && `${workers} worker${workers === 1 ? '' : 's'} on ${cores} cores leaves cores idle.`}
            {!thrashing && !under && workload === 'io' && 'While one worker waits on I/O, another can use the CPU.'}
            {!thrashing && !under && workload === 'ml' && 'Keep ML workers near the core count.'}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-800 p-3">
          <p className="text-xs font-bold text-white">RAM {ram} GB</p>
          <p className="mt-1 text-[11px] text-gray-400">450 MB model copied into each worker.</p>
          <div className="mt-2 grid grid-cols-4 gap-1">
            {Array.from({ length: Math.min(workers, 8) }).map((_, index) => (
              <p key={index} className="rounded-lg border border-teal-400/30 px-1 py-1 text-center font-mono text-[10px] text-teal-100">W{index + 1}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function GunicornCommandVisualizer() {
  const [pane, setPane] = useState('command');
  return (
    <Frame>
      <div className="flex gap-2">
        <Chip active={pane === 'command'} onClick={() => setPane('command')}><span className="inline-flex items-center gap-1"><Terminal className="h-3.5 w-3.5" /> Flags</span></Chip>
        <Chip active={pane === 'size'} tone="amber" onClick={() => setPane('size')}>How many workers</Chip>
      </div>
      {pane === 'command' ? <CommandInspector /> : <WorkerSizing />}
    </Frame>
  );
}

export function EnvWorkersVisualizer() {
  const [preset, setPreset] = useState('default');
  const [shell, setShell] = useState(true);
  const workers = preset === 'default' ? '4' : '8';
  const port = preset === 'default' ? '8000' : '9000';

  return (
    <Frame>
      <Bar>
        <div className="flex flex-wrap gap-2">
          <Chip active={preset === 'default'} onClick={() => setPreset('default')}>docker run -p 8000:8000</Chip>
          <Chip active={preset === 'override'} onClick={() => setPreset('override')}>-e WORKERS=8 -e PORT=9000</Chip>
        </div>
        <Chip active tone={shell ? 'teal' : 'rose'} onClick={() => setShell((v) => !v)}>{shell ? 'Shell form' : 'Exec form'}</Chip>
      </Bar>
      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-5">
        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-3 font-mono text-[11px] text-gray-300 md:col-span-3">
          <p><span className="text-pink-300">ENV</span> PORT=8000</p>
          <p><span className="text-pink-300">ENV</span> WORKERS=4</p>
          <p><span className="text-pink-300">ENV</span> APP_MODULE=&quot;main:app&quot;</p>
          {shell ? (
            <p className="mt-3 rounded-xl border border-emerald-400/30 p-2 text-emerald-100">CMD gunicorn -w $WORKERS ... -b 0.0.0.0:$PORT</p>
          ) : (
            <p className="mt-3 rounded-xl border border-rose-400/40 p-2 text-rose-100">CMD [&quot;gunicorn&quot;, &quot;-w&quot;, &quot;$WORKERS&quot;] stays the literal text</p>
          )}
          <p className="mt-3 text-teal-200">{preset === 'default' ? 'docker run -p 8000:8000 your-ml-api-image' : 'docker run -p 9000:9000 -e WORKERS=8 -e PORT=9000 your-ml-api-image'}</p>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-gray-800 p-3 md:col-span-2">
          {shell ? (
            <>
              <p className="font-mono text-[11px] text-emerald-200">gunicorn -w {workers} -k uvicorn.workers.UvicornWorker main:app -b 0.0.0.0:{port}</p>
              <div className="mt-3 space-y-2 font-mono text-xs">
                <p className="flex justify-between rounded-xl border border-gray-800 px-2 py-2"><span className="text-gray-400">Workers</span><span>{workers}</span></p>
                <p className="flex justify-between rounded-xl border border-gray-800 px-2 py-2"><span className="text-gray-400">Socket</span><span className="text-teal-200">0.0.0.0:{port}</span></p>
              </div>
            </>
          ) : (
            <p className="font-mono text-[11px] text-rose-200">-w is not an integer: $WORKERS</p>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-400"><Server className="h-3.5 w-3.5" /> Same image, different -e values.</p>
        </div>
      </div>
    </Frame>
  );
}
