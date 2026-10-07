import { useState } from 'react';
import {
  Box,
  Cpu,
  Terminal,
  Filter,
  Check,
  FolderGit2,
  AlertTriangle,
  Tag,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Laptop,
  Unlock,
  ArrowRight,
  Play,
  DoorOpen,
  DoorClosed,
  Lock,
  Key,
  Sliders,
  Shield,
} from 'lucide-react';

function Frame({ children }) {
  return <div className="flex h-full min-h-0 flex-col gap-3 overflow-auto px-3 pb-3 pt-12 select-none">{children}</div>;
}

function DockerBuildInner() {
  const [selectedToken, setSelectedToken] = useState('context');
  const [hasDockerignore, setHasDockerignore] = useState(true);
  const [buildStep, setBuildStep] = useState(0);
  const pick = (n) => setBuildStep(Math.min(4, Math.max(0, n)));

  const tokens = [
    { id: 'cmd', code: 'docker build', label: 'Build command', desc: 'Asks the daemon to build an image from the Dockerfile.' },
    { id: 'tag', code: '-t fastapi-ml-api:v1.0', label: 'Name and tag', desc: 'The image is stored as fastapi-ml-api with tag v1.0.' },
    { id: 'context', code: '.', label: 'Build context', desc: 'The dot sends this directory to the daemon so COPY can see the files.' },
  ];
  const daemonSteps = [
    { title: '1. Send context', detail: hasDockerignore ? 'Small context. .git and venv stay out.' : 'The whole folder is sent, including venv.' },
    { title: '2. Read Dockerfile', detail: 'The daemon reads the instructions in order.' },
    { title: '3. Run each instruction', detail: 'FROM, then COPY, then RUN, each as a layer.' },
    { title: '4. Use the cache', detail: 'An instruction that has not changed is reused.' },
    { title: '5. Name the image', detail: 'sha256:8f4a… is also fastapi-ml-api:v1.0' },
  ];
  const active = tokens.find((t) => t.id === selectedToken);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
            <Terminal className="h-3.5 w-3.5" /> Click a piece of the command
          </span>
          <button type="button" onClick={() => setHasDockerignore((v) => !v)} className={`flex items-center gap-1.5 rounded-xl px-3 py-1 font-mono text-[11px] font-bold ${hasDockerignore ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border border-rose-500/40 bg-rose-500/20 text-rose-300'}`}>
            <Filter className="h-3 w-3" /> .dockerignore {hasDockerignore ? 'on' : 'off'}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-sm">
          <span className="text-slate-500">$</span>
          {tokens.map((t) => (
            <button key={t.id} type="button" onClick={() => setSelectedToken(t.id)} className={`rounded-lg px-3 py-1.5 font-bold ${selectedToken === t.id ? 'bg-cyan-500 text-slate-950' : 'border border-slate-700 bg-slate-900 text-cyan-300'}`}>{t.code}</button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-300"><span className="font-bold text-cyan-300">{active.label}. </span>{active.desc}</p>
      </div>

      <div className="grid min-h-0 flex-1 items-stretch gap-3 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 lg:col-span-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-white"><FolderGit2 className="h-4 w-4 text-amber-400" /> Context .</p>
          <div className="space-y-1.5 font-mono text-[11px]">
            {['Dockerfile', 'main.py', 'requirements.txt', 'model.pkl'].map((name) => (
              <div key={name} className="flex justify-between rounded-lg border border-emerald-500/40 bg-emerald-950/40 p-2 text-emerald-300"><span>{name}</span><span>sent</span></div>
            ))}
            <div className={`flex justify-between rounded-lg border p-2 ${hasDockerignore ? 'border-slate-800 text-slate-500 line-through' : 'border-rose-500/50 bg-rose-950/50 text-rose-300'}`}>
              <span>.git and venv/</span><span>{hasDockerignore ? 'blocked' : 'sent'}</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-500/40 bg-slate-950 p-3 lg:col-span-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-300"><Cpu className="h-4 w-4 text-cyan-400" /> Daemon</span>
            <span className="font-mono text-[10px] text-cyan-300">{buildStep + 1} / 5</span>
          </div>
          <div className="space-y-1.5">
            {daemonSteps.map((st, idx) => (
              <button key={st.title} type="button" onClick={() => pick(idx)} className={`w-full rounded-xl border p-2 text-left ${idx === buildStep ? 'border-cyan-400 bg-cyan-500/20 text-white' : idx < buildStep ? 'border-emerald-500/30 text-emerald-300' : 'border-slate-800 text-slate-500'}`}>
                <span className="flex items-center justify-between text-[11px] font-bold">{st.title}{idx <= buildStep && <Check className="h-3 w-3 text-emerald-400" />}</span>
                <span className="block truncate font-mono text-[10px] opacity-80">{st.detail}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => pick(buildStep - 1)} disabled={buildStep === 0} className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-white disabled:opacity-30">Prev step</button>
            <button type="button" onClick={() => pick(buildStep + 1)} disabled={buildStep === 4} className="rounded-lg bg-cyan-500 px-3 py-1 text-xs font-bold text-slate-950 disabled:opacity-30">Next step</button>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-cyan-500/50 bg-slate-900 p-3 lg:col-span-3">
          <div className={`rounded-xl border border-cyan-400/50 bg-slate-950 p-3 text-center ${buildStep === 4 ? '' : 'opacity-40'}`}>
            <Box className="mx-auto mb-1.5 h-8 w-8 text-cyan-400" />
            <p className="font-mono text-xs font-bold text-white">fastapi-ml-api</p>
            <p className="font-mono text-[11px] text-cyan-300">tag v1.0</p>
            <p className="mt-1 font-mono text-[10px] text-slate-500">sha256:8f4a9c</p>
          </div>
          <p className="mt-2 font-mono text-[10px] text-emerald-400">docker images → fastapi-ml-api v1.0</p>
        </div>
      </div>
    </div>
  );
}

function TaggingInner() {
  const [strategy, setStrategy] = useState('latest');
  const [pushed, setPushed] = useState(false);
  const drifted = strategy === 'latest' && pushed;
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setStrategy('latest')} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${strategy === 'latest' ? 'border border-rose-500/50 bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}><AlertTriangle className="h-3.5 w-3.5" /> :latest</button>
          <button type="button" onClick={() => setStrategy('pinned')} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${strategy === 'pinned' ? 'border border-indigo-500/50 bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}><Tag className="h-3.5 w-3.5" /> :0.1.0</button>
        </div>
        <button type="button" onClick={() => setPushed((v) => !v)} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${pushed ? 'bg-amber-500 text-slate-950' : 'border border-indigo-500/40 bg-indigo-500/20 text-indigo-300'}`}>
          <RefreshCw className="h-3.5 w-3.5" /> {pushed ? 'Reset registry' : 'Push model v2'}
        </button>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="mb-2 text-xs font-bold text-slate-300">Registry · prediction-service</p>
          <div className="mb-2 flex items-center justify-between rounded-xl border border-emerald-500/40 bg-slate-950 p-3">
            <div>
              <p className="font-mono text-xs font-bold text-white">sha256:a1b2c3</p>
              <p className="text-[11px] text-slate-400">Model v1</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded border border-indigo-500/40 bg-indigo-500/20 px-2 font-mono text-[10px] font-bold text-indigo-300">:0.1.0</span>
              {!pushed && <span className="rounded border border-amber-500/40 bg-amber-500/20 px-2 font-mono text-[10px] font-bold text-amber-300">:latest</span>}
            </div>
          </div>
          <div className={`flex items-center justify-between rounded-xl border p-3 ${pushed ? 'border-amber-500/60 bg-slate-950' : 'border-slate-800 opacity-40'}`}>
            <div>
              <p className="font-mono text-xs font-bold text-white">sha256:9f8e7d</p>
              <p className="text-[11px] text-amber-300">Model v2</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="rounded border border-indigo-500/40 bg-indigo-500/20 px-2 font-mono text-[10px] font-bold text-indigo-300">:0.2.0</span>
              {pushed && <span className="rounded bg-rose-500 px-2 font-mono text-[10px] font-bold text-white">:latest moved</span>}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-300">Two production nodes</p>
            <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${drifted ? 'border border-rose-500/40 bg-rose-500/20 text-rose-300' : 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'}`}>{drifted ? 'drift' : 'same image'}</span>
          </div>
          <div className="mb-2 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div>
              <p className="text-xs font-bold text-white">Node 1 · yesterday</p>
              <p className="font-mono text-[11px] text-emerald-400">sha256:a1b2c3</p>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className={`rounded-xl border p-3 ${drifted ? 'border-rose-500 bg-rose-950/40' : 'border-emerald-500/40 bg-slate-950'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Node 2 · today</p>
                <p className="font-mono text-[11px] text-slate-400">pulled :{strategy === 'latest' ? 'latest' : '0.1.0'}</p>
              </div>
              {drifted ? <XCircle className="h-4 w-4 text-rose-400" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            </div>
            <p className={`mt-2 rounded p-1.5 font-mono text-[11px] ${drifted ? 'bg-rose-950 text-rose-200' : 'bg-emerald-950/40 text-emerald-300'}`}>
              {drifted ? 'Node 2 got sha256:9f8e7d. The two nodes disagree.' : 'Node 2 got sha256:a1b2c3, the same image as node 1.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BuildStepsVisualizer() {
  const [mode, setMode] = useState('build');
  return (
    <Frame>
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('build')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${mode === 'build' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>Build</button>
        <button type="button" onClick={() => setMode('tags')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${mode === 'tags' ? 'bg-indigo-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>latest vs 0.1.0</button>
      </div>
      {mode === 'build' ? <DockerBuildInner /> : <TaggingInner />}
    </Frame>
  );
}

function PortPipe() {
  const [published, setPublished] = useState(true);
  const [result, setResult] = useState('idle');
  const send = () => setResult(published ? 'arrived' : 'blocked');
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setPublished(false); setResult('idle'); }} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${!published ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}><Lock className="h-3.5 w-3.5" /> No -p</button>
          <button type="button" onClick={() => { setPublished(true); setResult('idle'); }} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${published ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}><Unlock className="h-3.5 w-3.5" /> -p 8000:80</button>
        </div>
        <button type="button" onClick={send} className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950"><Play className="h-3.5 w-3.5" /> Send localhost:8000</button>
      </div>
      <div className="grid min-h-0 flex-1 items-stretch gap-2 md:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-amber-400/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-amber-200"><Laptop className="h-4 w-4" /> Laptop</p>
          <p className="font-mono text-xs font-bold text-amber-200">localhost:8000</p>
          <p className="font-mono text-[11px] text-slate-400">door 8000</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 p-3 text-center">
          {published ? (
            <>
              <p className="font-mono text-[11px] font-bold text-emerald-300">8000 → 80</p>
              <ArrowRight className="my-2 h-4 w-4 text-emerald-300" />
              <p className="text-[11px] text-emerald-200">pipe is open</p>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-rose-300" />
              <p className="mt-2 text-[11px] text-rose-200">no pipe</p>
            </>
          )}
        </div>
        <div className={`flex flex-col justify-between rounded-2xl border p-3 ${result === 'arrived' ? 'border-emerald-400' : 'border-cyan-400/40'}`}>
          <p className="flex items-center gap-1.5 text-xs font-bold text-cyan-200"><Box className="h-4 w-4" /> Container</p>
          <p className="font-mono text-[11px] text-cyan-100">uvicorn --port 80</p>
          <p className="font-mono text-[11px] text-slate-400">door 80</p>
        </div>
      </div>
      <p className={`rounded-xl border px-3 py-2 text-[11px] ${result === 'arrived' ? 'border-emerald-400/40 text-emerald-200' : result === 'blocked' ? 'border-rose-400/40 text-rose-200' : 'border-slate-800 text-slate-400'}`}>
        {result === 'arrived' && 'The request used laptop port 8000, crossed the pipe, and reached FastAPI on port 80.'}
        {result === 'blocked' && 'FastAPI is on port 80 inside the container. The laptop has no pipe to it.'}
        {result === 'idle' && 'Send a request. Without -p the container stays sealed.'}
      </p>
    </>
  );
}

function PortNumbers() {
  const [hostPort, setHostPort] = useState(8000);
  const [mapped, setMapped] = useState(80);
  const [uvicornPort, setUvicornPort] = useState(80);
  const matched = mapped === uvicornPort;
  const pick = (current, value, set) => (
    <button type="button" onClick={() => set(value)} className={`rounded-lg px-2 py-1 font-mono text-[11px] font-bold ${current === value ? 'bg-teal-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>{value}</button>
  );
  return (
    <>
      <div className="grid gap-2 md:grid-cols-3">
        <div className="rounded-xl border border-amber-400/30 p-2">
          <p className="mb-1 text-[10px] font-bold uppercase text-amber-200">Left · host</p>
          <div className="flex gap-1">{[8000, 3000, 9090].map((port) => <span key={port}>{pick(hostPort, port, setHostPort)}</span>)}</div>
        </div>
        <div className="rounded-xl border border-cyan-400/30 p-2">
          <p className="mb-1 text-[10px] font-bold uppercase text-cyan-200">Right · container</p>
          <div className="flex gap-1">{[80, 8000, 5000].map((port) => <span key={port}>{pick(mapped, port, setMapped)}</span>)}</div>
        </div>
        <div className="rounded-xl border border-emerald-400/30 p-2">
          <p className="mb-1 text-[10px] font-bold uppercase text-emerald-200">uvicorn --port</p>
          <div className="flex gap-1">{[80, 8000].map((port) => <span key={port}>{pick(uvicornPort, port, setUvicornPort)}</span>)}</div>
        </div>
      </div>
      <p className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-[11px] text-slate-300">
        docker run -p <span className="text-amber-200">{hostPort}</span>:<span className={matched ? 'text-cyan-200' : 'text-rose-300'}>{mapped}</span> my-ml-api
        <span className="ml-2 text-amber-200">localhost:{hostPort}</span>
      </p>
      <div className="grid min-h-0 flex-1 gap-2 md:grid-cols-3">
        <div className="rounded-2xl border border-amber-400/30 p-3 text-center">
          <p className="text-[10px] uppercase text-amber-200">Browser</p>
          <p className="mt-2 font-mono text-sm font-bold text-white">localhost:{hostPort}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 p-3 text-center">
          <p className="text-[10px] uppercase text-slate-400">-p pipe</p>
          <p className="mt-2 font-mono text-sm font-bold"><span className="text-amber-200">{hostPort}</span> → <span className={matched ? 'text-cyan-200' : 'text-rose-300'}>{mapped}</span></p>
        </div>
        <div className={`rounded-2xl border p-3 text-center ${matched ? 'border-emerald-400' : 'border-rose-400'}`}>
          <p className="text-[10px] uppercase text-emerald-200">Inside</p>
          <p className="mt-2 font-mono text-sm font-bold text-white">--port {uvicornPort}</p>
          <p className={`mt-1 text-[11px] ${matched ? 'text-emerald-200' : 'text-rose-200'}`}>{matched ? 'The right number matches.' : `The pipe ends on ${mapped}. The app is on ${uvicornPort}.`}</p>
        </div>
      </div>
    </>
  );
}

function BindHost() {
  const [open, setOpen] = useState(true);
  const host = open ? '0.0.0.0' : '127.0.0.1';
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen(false)} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-bold ${!open ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'}`}><DoorClosed className="h-3.5 w-3.5" /> --host 127.0.0.1</button>
        <button type="button" onClick={() => setOpen(true)} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-xs font-bold ${open ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}><DoorOpen className="h-3.5 w-3.5" /> --host 0.0.0.0</button>
      </div>
      <p className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-[11px] text-slate-300">
        uvicorn main:app --host <span className={open ? 'text-emerald-300' : 'text-rose-300'}>{host}</span> --port 80
      </p>
      <div className="grid min-h-0 flex-1 items-center gap-2 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-amber-200"><Laptop className="h-4 w-4" /> Laptop pipe</p>
          <p className="mt-2 font-mono text-[11px] text-emerald-200">localhost:8000 → port 80</p>
        </div>
        <div className={`flex flex-col items-center rounded-2xl border p-3 ${open ? 'border-emerald-400 text-emerald-200' : 'border-rose-400 text-rose-200'}`}>
          {open ? <DoorOpen className="h-7 w-7" /> : <DoorClosed className="h-7 w-7" />}
          <p className="mt-2 text-[11px] font-bold">{open ? 'Door open' : 'Locked'}</p>
        </div>
        <div className={`rounded-2xl border p-3 text-xs ${open ? 'border-emerald-400/40 text-emerald-100' : 'border-rose-400/40 text-rose-100'}`}>
          {open ? '0.0.0.0 accepts the request that Docker forwarded from the laptop.' : '127.0.0.1 only accepts programs inside this container. The laptop is outside.'}
        </div>
      </div>
    </>
  );
}

const PORT_LINES = [
  { label: '-p connects the two ports', highlight: 'pipe' },
  { label: 'container_port is uvicorn --port 80', highlight: 'container' },
  { label: '0.0.0.0 opens the container', highlight: 'zero' },
  { label: 'host_port is localhost:8000', highlight: 'host' },
];

function PortQuote() {
  const [part, setPart] = useState(0);
  const highlight = PORT_LINES[part].highlight;
  const box = (key) => highlight === key ? 'border-teal-300 bg-teal-500/15' : 'border-slate-800 opacity-50';
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {PORT_LINES.map((line, index) => (
          <button key={line.label} type="button" onClick={() => setPart(index)} className={`rounded-xl px-3 py-1.5 text-left text-[11px] font-bold ${part === index ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>{line.label}</button>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 gap-2 md:grid-cols-3">
        <div className={`rounded-2xl border p-3 ${box('host')}`}>
          <p className="text-[10px] font-bold uppercase text-amber-200">host_port 8000</p>
          <p className="mt-2 font-mono text-sm font-bold text-white">localhost:8000</p>
        </div>
        <div className={`rounded-2xl border p-3 ${box('pipe')}`}>
          <p className="text-[10px] font-bold uppercase text-cyan-200">-p 8000:80</p>
          <p className="mt-2 font-mono text-sm font-bold text-white">8000 → 80</p>
        </div>
        <div className={`rounded-2xl border p-3 ${highlight === 'container' || highlight === 'zero' ? 'border-teal-300 bg-teal-500/15' : 'border-slate-800 opacity-50'}`}>
          <p className="text-[10px] font-bold uppercase text-emerald-200">container_port 80</p>
          <p className="mt-2 font-mono text-xs text-white">--host <span className={highlight === 'zero' ? 'rounded bg-teal-400 px-1 text-slate-950' : ''}>0.0.0.0</span> --port <span className={highlight === 'container' ? 'rounded bg-teal-400 px-1 text-slate-950' : ''}>80</span></p>
        </div>
      </div>
    </>
  );
}

export function RunOptionsVisualizer() {
  const [view, setView] = useState('pipe');
  const tab = (id, label) => (
    <button type="button" onClick={() => setView(id)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${view === id ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>{label}</button>
  );
  return (
    <Frame>
      <div className="flex flex-wrap gap-2">
        {tab('pipe', 'The pipe')}
        {tab('numbers', '8000:80')}
        {tab('bind', '0.0.0.0')}
        {tab('quote', 'Each sentence')}
      </div>
      {view === 'pipe' && <PortPipe />}
      {view === 'numbers' && <PortNumbers />}
      {view === 'bind' && <BindHost />}
      {view === 'quote' && <PortQuote />}
    </Frame>
  );
}

export function ManageContainerVisualizer() {
  const [status, setStatus] = useState('running');
  const [activeCmd, setActiveCmd] = useState('docker ps');
  const runCommand = (cmd) => {
    setActiveCmd(cmd);
    if (cmd === 'docker run -d') setStatus('running');
    if (cmd === 'docker stop my_api') setStatus('stopped');
    if (cmd === 'docker start my_api' && status !== 'removed') setStatus('running');
    if (cmd === 'docker rm my_api' && status === 'stopped') setStatus('removed');
  };
  const states = [
    { key: 'running', title: 'Running', sub: 'Shows in docker ps', note: 'localhost:8000/docs' },
    { key: 'stopped', title: 'Exited', sub: 'Only in docker ps -a', note: 'port 8000 closed' },
    { key: 'removed', title: 'Removed', sub: 'Gone from disk', note: 'name is free' },
  ];
  return (
    <Frame>
      <div className="flex flex-wrap gap-2">
        {['docker ps', 'docker ps -a', 'docker logs -f my_api'].map((cmd) => (
          <button key={cmd} type="button" onClick={() => runCommand(cmd)} className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold ${activeCmd === cmd ? 'bg-violet-500 text-white' : 'bg-slate-800 text-slate-300'}`}>{cmd}</button>
        ))}
        {status === 'running' && <button type="button" onClick={() => runCommand('docker stop my_api')} className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 font-mono text-xs font-bold text-amber-300">docker stop my_api</button>}
        {status === 'stopped' && (
          <>
            <button type="button" onClick={() => runCommand('docker start my_api')} className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 font-mono text-xs font-bold text-emerald-300">docker start my_api</button>
            <button type="button" onClick={() => runCommand('docker rm my_api')} className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 font-mono text-xs font-bold text-rose-300">docker rm my_api</button>
          </>
        )}
        {status === 'removed' && <button type="button" onClick={() => runCommand('docker run -d')} className="rounded-xl bg-emerald-500 px-3 py-1.5 font-mono text-xs font-bold text-slate-950">docker run -d</button>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {states.map((st) => (
          <div key={st.key} className={`rounded-2xl border p-3 ${status === st.key ? 'border-teal-300 bg-slate-900' : 'border-slate-800 opacity-40'}`}>
            <p className="font-mono text-xs font-bold text-white">{st.title}</p>
            <p className="text-[11px] text-slate-400">{st.sub}</p>
            <p className="mt-1 font-mono text-[10px] text-slate-300">{st.note}</p>
          </div>
        ))}
      </div>
      <div className="min-h-0 flex-1 rounded-2xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px]">
        <p className="mb-2 border-b border-slate-800 pb-2 text-slate-500">$ {activeCmd}</p>
        {activeCmd === 'docker ps' && (status === 'running' ? <p className="text-emerald-300">c4f9a1b2 fastapi-ml-api:latest Up 0.0.0.0:8000→80/tcp my_api</p> : <p className="text-slate-500">No running containers. docker ps -a includes stopped ones.</p>)}
        {activeCmd === 'docker ps -a' && status === 'running' && <p className="text-emerald-300">c4f9a1b2 fastapi-ml-api:latest Up my_api</p>}
        {activeCmd === 'docker ps -a' && status === 'stopped' && <p className="text-amber-300">c4f9a1b2 fastapi-ml-api:latest Exited my_api</p>}
        {activeCmd === 'docker ps -a' && status === 'removed' && <p className="text-slate-500">my_api is gone.</p>}
        {activeCmd === 'docker logs -f my_api' && status !== 'removed' && (
          <div className="space-y-1 text-cyan-200">
            <p>Uvicorn running on http://0.0.0.0:80</p>
            <p className="text-emerald-300">GET /docs 200</p>
            {status === 'stopped' && <p className="text-amber-300">Shutting down</p>}
          </div>
        )}
        {activeCmd === 'docker logs -f my_api' && status === 'removed' && <p className="text-rose-300">No such container: my_api</p>}
        {activeCmd.startsWith('docker stop') || activeCmd.startsWith('docker start') || activeCmd.startsWith('docker rm') || activeCmd === 'docker run -d' ? (
          <p className="text-emerald-300">Container is {status}. Check docker ps or docker ps -a.</p>
        ) : null}
      </div>
    </Frame>
  );
}

function PythonDepsCache({ initialStrategy }) {
  const [strategy, setStrategy] = useState(initialStrategy);
  const [noCacheDir, setNoCacheDir] = useState(true);
  const [codeModified, setCodeModified] = useState(false);
  const imageSize = noCacheDir ? 410 : 790;
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => setStrategy('basic')} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${strategy === 'basic' ? 'border border-rose-500/50 bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>COPY . . first</button>
          <button type="button" onClick={() => setStrategy('optimized')} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${strategy === 'optimized' ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>requirements first</button>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setNoCacheDir((v) => !v)} className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold ${noCacheDir ? 'border border-cyan-500/50 bg-cyan-500/20 text-cyan-300' : 'border border-amber-500/50 bg-amber-500/20 text-amber-300'}`}>--no-cache-dir {noCacheDir ? 'on' : 'off'}</button>
          <button type="button" onClick={() => setCodeModified((v) => !v)} className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950">{codeModified ? 'Restore main.py' : 'Edit main.py'}</button>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 lg:col-span-7">
          <p className="mb-2 font-mono text-xs font-bold text-white">{strategy === 'optimized' ? 'Requirements copied first' : 'Whole folder copied first'} · {codeModified ? (strategy === 'optimized' ? '0.9s' : '118s') : 'cached'}</p>
          <div className="space-y-2 font-mono text-[11px]">
            <Row ok label="FROM python:3.9-slim" />
            {strategy === 'basic' ? (
              <>
                <Row ok={!codeModified} label="COPY . ." mark={codeModified ? 'miss' : 'cached'} />
                <Row ok={!codeModified} label={`RUN pip install ${noCacheDir ? '--no-cache-dir ' : ''}-r requirements.txt`} mark={codeModified ? 'reinstall' : 'cached'} />
              </>
            ) : (
              <>
                <Row ok label="COPY requirements.txt ." mark="cached" />
                <Row ok label={`RUN pip install ${noCacheDir ? '--no-cache-dir ' : ''}-r requirements.txt`} mark="cached" />
                <Row ok={!codeModified} label="COPY . ." mark={codeModified ? 'this layer only' : 'cached'} warn={codeModified} />
              </>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 lg:col-span-5">
          <p className="mb-2 text-xs font-bold text-white">Image · {imageSize} MB</p>
          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex justify-between rounded-xl border border-slate-800 bg-slate-950 p-2 text-slate-300"><span>python:3.9-slim</span><span>125 MB</span></div>
            <div className="flex justify-between rounded-xl border border-emerald-500/30 bg-slate-950 p-2 text-emerald-300"><span>site-packages</span><span>285 MB</span></div>
            <div className={`flex justify-between rounded-xl border p-2 ${noCacheDir ? 'border-slate-800 text-slate-500 line-through' : 'border-rose-500/60 text-rose-200'}`}><span>/root/.cache/pip</span><span>{noCacheDir ? '0 MB' : '+380 MB'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ ok, label, mark = 'cached', warn = false }) {
  const hot = warn ? 'border-amber-400 bg-amber-950/40 text-amber-100' : ok ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200' : 'border-rose-500 bg-rose-950/50 text-rose-100';
  return (
    <div className={`flex items-center justify-between gap-2 rounded-xl border p-2 ${hot}`}>
      <span className="truncate">{label}</span>
      <span className="shrink-0">{mark}</span>
    </div>
  );
}

export function SlowCopyVisualizer() {
  return <Frame><PythonDepsCache initialStrategy="basic" /></Frame>;
}

export function FastCopyVisualizer() {
  return <Frame><PythonDepsCache initialStrategy="optimized" /></Frame>;
}

function PinningAndVenv() {
  const [pinned, setPinned] = useState(true);
  const [useVenv, setUseVenv] = useState(false);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setPinned((v) => !v)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${pinned ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'border border-rose-500/50 bg-rose-500/20 text-rose-300'}`}>{pinned ? 'Pinned with pip freeze' : 'Unpinned names'}</button>
        <button type="button" onClick={() => setUseVenv((v) => !v)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${useVenv ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300' : 'border border-cyan-500/50 bg-cyan-500/20 text-cyan-300'}`}>{useVenv ? 'venv inside the container' : 'pip into the container Python'}</button>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="mb-2 font-mono text-xs font-bold text-white">requirements.txt</p>
          <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
            {[['fastapi', '==0.85.0'], ['uvicorn[standard]', '==0.18.3'], ['pydantic', '==1.10.2'], ['scikit-learn', '==1.1.2'], ['joblib', '==1.1.0']].map(([name, ver]) => (
              <p key={name} className={pinned ? 'text-emerald-300' : name === 'scikit-learn' ? 'font-bold text-rose-300' : 'text-amber-200'}>{name}{pinned ? ver : ''}</p>
            ))}
          </div>
          <p className={`mt-2 text-[11px] ${pinned ? 'text-emerald-200' : 'text-rose-200'}`}>{pinned ? 'The same versions install on every build.' : 'A later scikit-learn can refuse to load the model.'}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className={`rounded-2xl border-2 p-4 ${useVenv ? 'border-dashed border-amber-400' : 'border-cyan-500/50'}`}>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-cyan-200"><Box className="h-4 w-4" /> Container</p>
            {useVenv ? (
              <div className="rounded-xl border border-amber-400/60 p-3 text-center">
                <p className="text-xs font-bold text-amber-200">venv</p>
                <p className="mt-1 font-mono text-[11px] text-white">packages inside the venv</p>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-center text-xs font-bold text-emerald-200">site-packages in the container Python</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PinVisualizer() {
  return <Frame><PinningAndVenv /></Frame>;
}

export function NoVenvVisualizer() {
  return <Frame><PinningAndVenv /></Frame>;
}

const LAUNCHES = {
  dev: { title: 'Development', level: 'DEBUG', model: 'dev_iris_small.joblib', key: 'dev-test-key' },
  staging: { title: 'Staging', level: 'INFO', model: 'candidate_v2.joblib', key: 'stg-key' },
  prod: { title: 'Production', level: 'WARNING', model: 'prod_verified.joblib', key: 'prod-live-secret' },
};

export function EnvLaunchVisualizer() {
  const [env, setEnv] = useState('prod');
  const active = LAUNCHES[env];
  return (
    <Frame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-300"><Sliders className="h-4 w-4" /> Same image</span>
        <div className="flex gap-2">
          {Object.keys(LAUNCHES).map((name) => (
            <button key={name} type="button" onClick={() => setEnv(name)} className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold uppercase ${env === name ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>{name}</button>
          ))}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-center">
          <Lock className="mx-auto mb-2 h-6 w-6 text-amber-400" />
          <p className="font-mono text-xs font-bold text-white">fastapi-ml-api:1.0.0</p>
          <p className="mt-1 font-mono text-[10px] text-slate-500">sha256:7d2c91e0</p>
          <p className="mt-3 font-mono text-[10px] text-emerald-300">no rebuild</p>
        </div>
        <div className="rounded-2xl border border-sky-500/40 bg-slate-950 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-sky-300"><Key className="h-4 w-4" /> Injected</p>
          <p className="font-mono text-[11px] text-white">LOG_LEVEL={active.level}</p>
          <p className="font-mono text-[11px] text-white">MODEL_PATH={active.model}</p>
          <p className="font-mono text-[11px] text-white">API_KEY={active.key}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/70 p-3">
          <p className="text-sm font-bold text-white">{active.title}</p>
          <p className="mt-2 font-mono text-[11px] text-emerald-200">level {active.level}</p>
          <p className="font-mono text-[11px] text-emerald-200">{active.model}</p>
        </div>
      </div>
    </Frame>
  );
}

export function OsEnvironVisualizer() {
  const [accessMethod, setAccessMethod] = useState('bracket');
  const [envProvided, setEnvProvided] = useState(false);
  const crashed = accessMethod === 'bracket' && !envProvided;
  return (
    <Frame>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setAccessMethod('bracket')} className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold ${accessMethod === 'bracket' ? 'border border-rose-500/50 bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>os.environ['MY_API_KEY']</button>
        <button type="button" onClick={() => setAccessMethod('get')} className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold ${accessMethod === 'get' ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>os.environ.get(..., default)</button>
        <button type="button" onClick={() => setEnvProvided((v) => !v)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${envProvided ? 'bg-cyan-500 text-slate-950' : 'border border-amber-500/40 bg-amber-500/20 text-amber-200'}`}>{envProvided ? 'MY_API_KEY is set' : 'MY_API_KEY is missing'}</button>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
          <p className="text-pink-300">import os</p>
          {accessMethod === 'bracket' ? (
            <p className="mt-3 rounded-xl border border-rose-500/50 bg-rose-950/40 p-2 text-rose-100">api_key = os.environ['MY_API_KEY']</p>
          ) : (
            <p className="mt-3 rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-2 text-emerald-100">api_key = os.environ.get('MY_API_KEY', 'default_key_if_not_set')</p>
          )}
        </div>
        <div className={`rounded-2xl border p-3 ${crashed ? 'border-rose-500 bg-rose-950/30' : 'border-emerald-500/50 bg-slate-900/80'}`}>
          <p className={`mb-2 font-mono text-[10px] font-bold ${crashed ? 'text-rose-200' : 'text-emerald-300'}`}>{crashed ? 'Exit 1' : 'Running'}</p>
          {crashed ? (
            <p className="font-mono text-[11px] text-rose-200">KeyError: 'MY_API_KEY'</p>
          ) : (
            <p className="font-mono text-[11px] text-emerald-200">API Key: {envProvided ? 'live_secret_991' : 'default_key_if_not_set'}</p>
          )}
        </div>
      </div>
    </Frame>
  );
}

const SETTINGS_SCENES = {
  defaults: {
    label: 'No env vars',
    valid: true,
    rows: [
      ['app_title', 'ML Model API'],
      ['log_level', 'INFO'],
      ['model_path', './models/default_model.joblib'],
      ['port', '8000'],
    ],
  },
  valid: {
    label: 'Valid overrides',
    valid: true,
    rows: [
      ['app_title', 'Prod Fraud Detector'],
      ['log_level', 'DEBUG'],
      ['model_path', './models/default_model.joblib'],
      ['port', '9000'],
    ],
  },
  invalid: {
    label: 'PORT=not-an-int',
    valid: false,
    rows: [],
  },
};

export function SettingsFillVisualizer() {
  return <Frame><PydanticSettings /></Frame>;
}

export function InfoEndpointVisualizer() {
  return <Frame><PydanticSettings /></Frame>;
}

function PydanticSettings() {
  const [scenario, setScenario] = useState('defaults');
  const current = SETTINGS_SCENES[scenario];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {Object.entries(SETTINGS_SCENES).map(([key, val]) => (
          <button key={key} type="button" onClick={() => setScenario(key)} className={`rounded-xl px-3 py-1.5 text-[11px] font-bold ${scenario === key ? (key === 'invalid' ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white') : 'bg-slate-800 text-slate-400'}`}>{val.label}</button>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-slate-300">
          <p><span className="text-pink-300">class</span> <span className="text-amber-200">AppSettings</span>(BaseSettings):</p>
          <p className="pl-3">app_title: str = "ML Model API"</p>
          <p className="pl-3">log_level: str = "INFO"</p>
          <p className="pl-3">model_path: str = "./models/default_model.joblib"</p>
          <p className="pl-3">port: int = 8000</p>
          <p className="mt-3 text-indigo-200">info(cfg = Depends(get_settings))</p>
        </div>
        <div className={`rounded-2xl border p-3 ${current.valid ? 'border-emerald-500/50' : 'border-rose-500 bg-rose-950/30'}`}>
          {current.valid ? current.rows.map(([k, v]) => (
            <p key={k} className="flex justify-between border-b border-slate-800 py-1 font-mono text-xs"><span className="text-indigo-200">{k}</span><span className="text-emerald-200">{v}</span></p>
          )) : (
            <p className="font-mono text-[11px] text-rose-200">ValidationError: port is not an integer</p>
          )}
        </div>
      </div>
    </div>
  );
}

function EnvPrecedence({ initialSecret }) {
  const [hasEnvFile, setHasEnvFile] = useState(true);
  const [hasCliFlag, setHasCliFlag] = useState(true);
  const [secretMode, setSecretMode] = useState(initialSecret);
  const level = hasCliFlag ? 'DEBUG' : hasEnvFile ? 'WARNING' : 'INFO';
  const source = hasCliFlag ? '-e' : hasEnvFile ? '--env-file' : 'Dockerfile ENV';
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setHasEnvFile((v) => !v)} className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold ${hasEnvFile ? 'border border-violet-500/50 bg-violet-500/20 text-violet-200' : 'bg-slate-800 text-slate-500'}`}>--env-file {hasEnvFile ? 'on' : 'off'}</button>
        <button type="button" onClick={() => setHasCliFlag((v) => !v)} className={`rounded-xl px-3 py-1.5 font-mono text-xs font-bold ${hasCliFlag ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-200' : 'bg-slate-800 text-slate-500'}`}>-e {hasCliFlag ? 'on' : 'off'}</button>
        <button type="button" onClick={() => setSecretMode((v) => (v === 'plain' ? 'vault' : 'plain'))} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold ${secretMode === 'vault' ? 'border border-cyan-500/50 bg-cyan-500/20 text-cyan-200' : 'border border-rose-500/50 bg-rose-500/20 text-rose-200'}`}>
          <Shield className="h-3.5 w-3.5" /> {secretMode === 'plain' ? 'docker inspect' : 'secret manager'}
        </button>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-7">
          <Layer hot={hasCliFlag} title="-e LOG_LEVEL=DEBUG" note={hasCliFlag ? 'wins' : 'off'} />
          <Layer hot={!hasCliFlag && hasEnvFile} title="--env-file LOG_LEVEL=WARNING" note={!hasEnvFile ? 'off' : hasCliFlag ? 'overridden' : 'wins'} />
          <Layer hot={!hasCliFlag && !hasEnvFile} title='ENV LOG_LEVEL="INFO"' note={hasCliFlag || hasEnvFile ? 'overridden' : 'wins'} />
          <p className="rounded-xl border border-cyan-500/40 bg-slate-950 p-2 font-mono text-xs text-cyan-200">container LOG_LEVEL={level} · from {source}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 lg:col-span-5">
          {secretMode === 'plain' ? (
            <div className="font-mono text-[11px] text-rose-200">
              <p className="text-slate-400">docker inspect my_api</p>
              <p className="mt-2 font-bold">API_KEY=secret-prod-12345</p>
              <p className="mt-2 text-[10px] text-amber-200">The key is not in the image. Inspect still prints it.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-200"><Lock className="h-3.5 w-3.5" /> Fetched at startup</p>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] text-slate-200">
                {['HashiCorp Vault', 'AWS Secrets Manager', 'Google Secret Manager', 'Azure Key Vault'].map((name) => (
                  <div key={name} className="rounded-lg border border-slate-800 bg-slate-950 p-1.5">{name}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Layer({ hot, title, note }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border p-3 font-mono text-xs ${hot ? 'border-emerald-400 bg-emerald-950/40 text-white' : 'border-slate-800 text-slate-400'}`}>
      <span>{title}</span>
      <span className="text-[10px]">{note}</span>
    </div>
  );
}

export function EnvSourceVisualizer() {
  return <Frame><EnvPrecedence initialSecret="vault" /></Frame>;
}

export function InspectSecretVisualizer() {
  return <Frame><EnvPrecedence initialSecret="plain" /></Frame>;
}
