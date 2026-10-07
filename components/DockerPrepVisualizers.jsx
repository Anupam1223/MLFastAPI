import { useState } from 'react';
import {
  Box,
  Layers,
  Shield,
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Terminal,
  FileCode,
  ArrowRight,
  Activity,
  Server,
  Laptop,
  Copy,
  Sparkles,
  Filter,
  Flame,
  Package,
  RefreshCw,
} from 'lucide-react';

function Stage({ children }) {
  return <div className="flex h-full min-h-0 flex-col justify-between px-4 pb-4 pt-12 select-none">{children}</div>;
}

export function DriftVisualizer() {
  const [mode, setMode] = useState('raw');
  const [step, setStep] = useState(0);
  const pick = (n) => setStep(Math.min(2, Math.max(0, n)));

  return (
    <Stage>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Deployment mode</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { setMode('raw'); setStep(0); }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold ${mode === 'raw' ? 'border border-rose-500/50 bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Raw code
          </button>
          <button
            type="button"
            onClick={() => { setMode('container'); setStep(0); }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold ${mode === 'container' ? 'border border-cyan-500/50 bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}
          >
            <Box className="h-3.5 w-3.5" />
            Container capsule
          </button>
        </div>
      </div>

      <div className="relative my-4 flex flex-1 items-center justify-between gap-3 px-1">
        <div className="absolute left-1/4 right-1/4 top-1/2 z-0 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full transition-all duration-700 ${mode === 'raw' ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'}`}
            style={{ width: step === 0 ? '15%' : step === 1 ? '55%' : '100%' }}
          />
        </div>

        <button
          type="button"
          onClick={() => pick(0)}
          className={`relative z-10 w-52 rounded-2xl border p-4 text-left transition-all duration-500 ${step === 0 ? 'scale-105 border-emerald-500/60 bg-slate-900 shadow-xl' : 'border-slate-800 bg-slate-900/70 opacity-80'}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-white"><Laptop className="h-5 w-5 text-emerald-400" /> Dev laptop</span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] text-emerald-300">WORKS</span>
          </div>
          <div className={`mb-3 rounded-xl border p-3 ${mode === 'container' ? 'border-cyan-500/50 bg-cyan-950/40' : 'border-slate-700 bg-slate-800/70'}`}>
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>app.py</span>
              {mode === 'container' && <span className="flex items-center gap-1 font-mono text-[10px] text-cyan-300"><Lock className="h-3 w-3" /> Sealed</span>}
            </div>
            {mode === 'container' && (
              <div className="mt-2 space-y-1 border-t border-cyan-500/30 pt-2 font-mono text-[11px] text-cyan-200">
                <div>+ Python 3.11 runtime</div>
                <div>+ libssl 3.0.8</div>
              </div>
            )}
          </div>
          <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 font-mono text-[11px] text-slate-400">
            <div className="font-sans text-[10px] font-semibold uppercase text-slate-500">Host</div>
            <div className="flex justify-between"><span>Python</span><span className="text-emerald-400">v3.11</span></div>
            <div className="flex justify-between"><span>OpenSSL</span><span className="text-emerald-400">v3.0.8</span></div>
          </div>
        </button>

        <button type="button" onClick={() => pick(1)} className={`relative z-20 transition-all duration-700 ${step === 0 ? '-translate-x-8 scale-90 opacity-50' : step === 1 ? 'scale-110 opacity-100' : 'translate-x-8 scale-90 opacity-50'}`}>
          <div className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-4 py-3 shadow-2xl ${mode === 'container' ? 'border-cyan-400 bg-cyan-950 text-cyan-200' : 'border-amber-400/80 bg-slate-900 text-amber-200'}`}>
            {mode === 'container' ? (
              <>
                <Box className="h-7 w-7 text-cyan-400" />
                <span className="text-xs font-bold">Container image</span>
                <span className="font-mono text-[10px] text-cyan-300/80">Code + Py3.11 + libs</span>
              </>
            ) : (
              <>
                <FileCode className="h-7 w-7 text-amber-400" />
                <span className="text-xs font-bold">Raw source zip</span>
                <span className="font-mono text-[10px] text-amber-300/80">Only app.py</span>
              </>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => pick(2)}
          className={`relative z-10 w-52 rounded-2xl border p-4 text-left transition-all duration-500 ${step === 2 ? (mode === 'raw' ? 'scale-105 border-rose-500 bg-rose-950/30 shadow-xl' : 'scale-105 border-cyan-400 bg-slate-900 shadow-xl') : 'border-slate-800 bg-slate-900/70 opacity-80'}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-white"><Server className={`h-5 w-5 ${step === 2 && mode === 'raw' ? 'text-rose-400' : 'text-cyan-400'}`} /> Prod server</span>
            {mode === 'raw' ? (
              <span className="flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] text-rose-300"><XCircle className="h-3 w-3" /> CRASH</span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-300"><CheckCircle2 className="h-3 w-3" /> HEALTHY</span>
            )}
          </div>
          <div className={`mb-3 rounded-xl border p-3 ${mode === 'container' ? 'border-cyan-400/60 bg-cyan-950/50' : 'border-rose-500/60 bg-rose-950/50'}`}>
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>app.py</span>
              <span className={`font-mono text-[10px] ${mode === 'container' ? 'text-emerald-300' : 'text-rose-300'}`}>{mode === 'container' ? 'Isolated' : 'ImportError'}</span>
            </div>
            {mode === 'container' ? (
              <div className="mt-2 space-y-1 border-t border-cyan-500/30 pt-2 font-mono text-[11px] text-cyan-200">
                <div>Uses internal Py 3.11</div>
                <div>Uses internal libssl 3.0</div>
              </div>
            ) : (
              <div className="mt-2 border-t border-rose-500/30 pt-2 font-mono text-[11px] text-rose-300">Needs Py 3.11 and libssl 3.0. The host has older ones.</div>
            )}
          </div>
          <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 font-mono text-[11px] text-slate-400">
            <div className="font-sans text-[10px] font-semibold uppercase text-slate-500">Host</div>
            <div className="flex justify-between"><span>Python</span><span className={mode === 'raw' ? 'font-bold text-rose-400' : 'text-slate-500 line-through'}>v3.8</span></div>
            <div className="flex justify-between"><span>OpenSSL</span><span className={mode === 'raw' ? 'font-bold text-rose-400' : 'text-slate-500 line-through'}>v1.1.1</span></div>
          </div>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <p className="max-w-xl text-xs text-slate-300">
          {mode === 'raw'
            ? 'Raw code uses the production host libraries, so the versions clash.'
            : 'The capsule carries Python 3.11 and OpenSSL 3.0, so the old host libraries are unused.'}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" onClick={() => pick(step - 1)} disabled={step === 0} className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold text-white disabled:opacity-30">Prev step</button>
          {['1. Dev', '2. Ship', '3. Prod'].map((label, idx) => (
            <button key={label} type="button" onClick={() => pick(idx)} className={`rounded-lg px-2.5 py-1 font-mono text-[11px] ${step === idx ? 'bg-slate-700 font-bold text-white' : 'bg-slate-800/50 text-slate-500'}`}>{label}</button>
          ))}
          <button type="button" onClick={() => pick(step + 1)} disabled={step === 2} className="rounded-lg bg-cyan-500 px-3 py-1 text-xs font-bold text-slate-950 disabled:opacity-30">Next step</button>
        </div>
      </div>
    </Stage>
  );
}

export function VMvsContainerVisualizer() {
  const [vmCount, setVmCount] = useState(2);
  const [containerCount, setContainerCount] = useState(3);
  const vmRamUsed = vmCount * 32;
  const containerRamUsed = 12 + containerCount * 8;

  return (
    <Stage>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Layers className="h-4 w-4 text-indigo-400" />
          Spawn workloads
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1">
            <span className="text-xs font-medium text-amber-300">VMs: {vmCount}</span>
            <button type="button" onClick={() => setVmCount(Math.max(1, vmCount - 1))} className="h-6 w-6 rounded-lg bg-slate-800 text-xs font-bold text-white">-</button>
            <button type="button" onClick={() => setVmCount(Math.min(3, vmCount + 1))} className="h-6 w-6 rounded-lg border border-amber-500/40 bg-amber-500/20 text-xs font-bold text-amber-300">+</button>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1">
            <span className="text-xs font-medium text-indigo-300">Containers: {containerCount}</span>
            <button type="button" onClick={() => setContainerCount(Math.max(1, containerCount - 1))} className="h-6 w-6 rounded-lg bg-slate-800 text-xs font-bold text-white">-</button>
            <button type="button" onClick={() => setContainerCount(Math.min(6, containerCount + 1))} className="h-6 w-6 rounded-lg border border-indigo-500/40 bg-indigo-500/20 text-xs font-bold text-indigo-300">+</button>
          </div>
        </div>
      </div>

      <div className="my-3 grid flex-1 grid-cols-2 items-end gap-4">
        <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-amber-300">Virtual machines</span>
              <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] text-amber-400">Boot ~45s</span>
            </div>
            <div className="mb-3">
              <div className="mb-1 flex justify-between font-mono text-[11px] text-slate-400">
                <span>Host RAM</span>
                <span className={vmRamUsed > 85 ? 'font-bold text-rose-400' : 'text-amber-300'}>{vmRamUsed}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-950">
                <div className={`h-full transition-all duration-500 ${vmRamUsed > 85 ? 'bg-rose-500' : 'bg-amber-500'}`} style={{ width: `${vmRamUsed}%` }} />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="grid min-h-[130px] grid-cols-3 content-end gap-1.5">
              {Array.from({ length: vmCount }).map((_, idx) => (
                <div key={idx} className="flex flex-col gap-1 rounded-xl border border-amber-500/40 bg-slate-950 p-2">
                  <div className="rounded border border-emerald-500/40 bg-emerald-500/20 py-1 text-center text-[10px] font-bold text-emerald-300">App #{idx + 1}</div>
                  <div className="rounded bg-slate-800 py-1 text-center font-mono text-[9px] text-slate-300">Bins / libs</div>
                  <div className="rounded border border-amber-500/50 bg-amber-500/25 py-3 text-center text-[10px] font-bold text-amber-200">
                    Guest OS
                    <span className="block font-mono text-[9px] text-amber-300/80">full kernel</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-amber-500/40 bg-amber-950/60 py-2 text-center text-xs font-bold text-amber-300">Hypervisor</div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 py-2 text-center text-xs font-bold text-slate-200">Physical hardware</div>
          </div>
        </div>

        <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-indigo-300">Containers</span>
              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] text-emerald-400">Boot ~50ms</span>
            </div>
            <div className="mb-3">
              <div className="mb-1 flex justify-between font-mono text-[11px] text-slate-400">
                <span>Host RAM</span>
                <span className="text-emerald-400">{containerRamUsed}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-950">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${containerRamUsed}%` }} />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="grid min-h-[130px] grid-cols-3 content-end gap-1.5">
              {Array.from({ length: containerCount }).map((_, idx) => (
                <div key={idx} className="flex flex-col gap-1 rounded-xl border border-indigo-500/50 bg-slate-950 p-1.5">
                  <div className="rounded border border-indigo-400/40 bg-indigo-500/25 py-1 text-center text-[10px] font-bold text-indigo-200">App #{idx + 1}</div>
                  <div className="rounded bg-slate-800/90 py-0.5 text-center font-mono text-[9px] text-slate-400">Libs</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 rounded-lg border border-indigo-400/50 bg-indigo-950/80 py-2 text-center text-xs font-bold text-indigo-200">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              Shared host kernel
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-800 py-2 text-center text-xs font-bold text-slate-200">Physical hardware</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 text-xs text-slate-300">
        {containerCount} containers use {containerRamUsed}% RAM. {vmCount} virtual machines use {vmRamUsed}%, because each one boots a guest OS.
      </div>
    </Stage>
  );
}

const PROCESSES = [
  { hostPid: 4812, nsPid: 1, container: 'Container A (API)', color: 'violet', portHost: '32768→8080', portNs: ':8080', rootHost: '/var/lib/docker/.../a9f', rootNs: '/ isolated app root' },
  { hostPid: 4819, nsPid: 2, container: 'Container A (worker)', color: 'violet', portHost: 'shared net', portNs: 'localhost', rootHost: '/var/lib/docker/.../a9f', rootNs: '/ isolated app root' },
  { hostPid: 5104, nsPid: 1, container: 'Container B (Redis)', color: 'cyan', portHost: '32769→6379', portNs: ':6379', rootHost: '/var/lib/docker/.../b3c', rootNs: '/ isolated redis root' },
  { hostPid: 892, nsPid: null, container: 'Host systemd / SSH', color: 'slate', portHost: ':22', portNs: 'Hidden', rootHost: '/ physical disk', rootNs: 'Hidden' },
];

export function NamespacesVisualizer() {
  const [viewMode, setViewMode] = useState('namespace');
  const [activeLens, setActiveLens] = useState('PID');

  return (
    <Stage>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setViewMode('host')} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${viewMode === 'host' ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
            <Eye className="h-3.5 w-3.5" /> Host reality
          </button>
          <button type="button" onClick={() => setViewMode('namespace')} className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${viewMode === 'namespace' ? 'border border-violet-500/50 bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-400'}`}>
            <EyeOff className="h-3.5 w-3.5" /> Container A blinders
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1">
          {['PID', 'NET', 'MNT'].map((ns) => (
            <button key={ns} type="button" onClick={() => setActiveLens(ns)} className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold ${activeLens === ns ? 'bg-violet-600 text-white' : 'text-slate-400'}`}>{ns}</button>
          ))}
        </div>
      </div>

      <div className="my-3 flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300">
            {viewMode === 'host' ? 'Host process table' : `Container A · ${activeLens} namespace`}
          </span>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 font-mono text-[11px] text-violet-300">{activeLens}</span>
        </div>
        <div className="my-auto space-y-2 py-2">
          {PROCESSES.map((proc) => {
            const hidden = viewMode === 'namespace' && proc.color !== 'violet';
            const detail = activeLens === 'PID'
              ? (viewMode === 'host' ? `Kernel id ${proc.hostPid}` : 'Sees itself as PID 1')
              : activeLens === 'NET'
                ? (viewMode === 'host' ? `Host map ${proc.portHost}` : `Virtual eth0 ${proc.portNs}`)
                : (viewMode === 'host' ? proc.rootHost : proc.rootNs);
            return (
              <div key={proc.hostPid} className={`flex items-center justify-between rounded-xl border p-3 transition-all duration-500 ${hidden ? 'pointer-events-none scale-[0.98] border-slate-800 bg-slate-900/20 opacity-20' : proc.color === 'violet' ? 'border-violet-500/50 bg-violet-950/30' : proc.color === 'cyan' ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-slate-700 bg-slate-900/60'}`}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold ${viewMode === 'namespace' && proc.nsPid ? 'bg-violet-500 text-white' : 'border border-slate-700 bg-slate-800 text-amber-300'}`}>
                    {viewMode === 'host' ? `PID ${proc.hostPid}` : `PID ${proc.nsPid || '—'}`}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{proc.container}</div>
                    <div className="font-mono text-[11px] text-slate-400">{detail}</div>
                  </div>
                </div>
                <span className={`rounded px-2 py-1 font-mono text-[10px] uppercase ${hidden ? 'bg-slate-800 text-slate-400' : 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-300'}`}>
                  {hidden ? 'Invisible' : 'Visible'}
                </span>
              </div>
            );
          })}
        </div>
        <p className="border-t border-slate-800 pt-2 text-xs text-slate-400">
          {activeLens === 'PID' && 'The PID namespace renumbers processes. The container has its own PID 1 and cannot see the host table.'}
          {activeLens === 'NET' && 'The NET namespace gives the container its own addresses and ports.'}
          {activeLens === 'MNT' && 'The MNT namespace gives the container its own root directory.'}
        </p>
      </div>
    </Stage>
  );
}

export function CgroupsVisualizer() {
  const [cgroupsEnabled, setCgroupsEnabled] = useState(true);
  const [leakActive, setLeakActive] = useState(false);
  const containerAMem = !leakActive ? 25 : cgroupsEnabled ? 50 : 92;
  const containerBMem = !leakActive ? 25 : cgroupsEnabled ? 25 : 8;
  const containerBHealthy = !leakActive || cgroupsEnabled;

  return (
    <Stage>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <button type="button" onClick={() => setCgroupsEnabled(!cgroupsEnabled)} className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold ${cgroupsEnabled ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'border border-slate-700 bg-slate-800 text-slate-400'}`}>
          {cgroupsEnabled ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          512 MB ceiling: {cgroupsEnabled ? 'ON' : 'OFF'}
        </button>
        <button type="button" onClick={() => setLeakActive(!leakActive)} className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold ${leakActive ? 'bg-rose-500 text-white' : 'border border-rose-500/40 bg-rose-500/20 text-rose-300'}`}>
          <Flame className="h-3.5 w-3.5" />
          {leakActive ? 'Stop memory leak' : 'Start memory leak in A'}
        </button>
      </div>

      <div className="my-3 flex flex-1 flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/90 p-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300"><Cpu className="h-4 w-4 text-emerald-400" /> Host RAM</span>
            <span className="font-mono text-xs text-slate-400">Used {containerAMem + containerBMem}%</span>
          </div>
          <div className="flex h-5 gap-0.5 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 p-0.5">
            <div className={`flex h-full items-center justify-center rounded-l-lg font-mono text-[10px] font-bold text-white transition-all duration-700 ${leakActive && !cgroupsEnabled ? 'bg-rose-600' : 'bg-amber-500'}`} style={{ width: `${containerAMem}%` }}>A {containerAMem}%</div>
            <div className="flex h-full items-center justify-center rounded-r-lg bg-cyan-500 font-mono text-[10px] font-bold text-slate-950 transition-all duration-700" style={{ width: `${containerBMem}%` }}>B {containerBMem}%</div>
          </div>
        </div>

        <div className="my-3 grid grid-cols-2 gap-4">
          <div className={`rounded-2xl border p-4 ${leakActive ? 'border-rose-500/60 bg-rose-950/25' : 'border-slate-800 bg-slate-900/70'}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Container A</span>
              {leakActive && <span className="rounded border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 font-mono text-[10px] text-rose-300">LEAK</span>}
            </div>
            <div className="relative flex h-28 flex-col justify-end overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
              {cgroupsEnabled && (
                <div className="absolute bottom-1/2 left-0 right-0 z-10 border-t-2 border-dashed border-emerald-400">
                  <span className="-mt-2.5 ml-2 inline-block rounded border border-emerald-500/40 bg-emerald-950 px-1.5 font-mono text-[9px] text-emerald-300">512 MB ceiling</span>
                </div>
              )}
              <div className={`flex w-full items-center justify-center rounded-lg transition-all duration-700 ${leakActive && cgroupsEnabled ? 'bg-amber-500/80' : leakActive ? 'bg-rose-600/90' : 'bg-amber-500/40'}`} style={{ height: `${containerAMem}%` }}>
                <span className="font-mono text-xs font-bold text-white">{Math.round(containerAMem * 10.24)} MB</span>
              </div>
            </div>
            <p className="mt-2 font-mono text-[11px] text-slate-400">
              {leakActive && cgroupsEnabled && 'Held at the ceiling. Only A is limited.'}
              {leakActive && !cgroupsEnabled && 'Uncapped. A is taking almost all of the host RAM.'}
              {!leakActive && 'Steady at about a quarter of the host.'}
            </p>
          </div>
          <div className={`rounded-2xl border p-4 ${containerBHealthy ? 'border-cyan-500/40 bg-slate-900/70' : 'border-rose-500 bg-rose-950/40'}`}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Container B</span>
              <span className={`rounded px-2 py-0.5 font-mono text-[10px] ${containerBHealthy ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500 font-bold text-white'}`}>{containerBHealthy ? 'PROTECTED' : 'STARVED'}</span>
            </div>
            <div className="flex h-28 flex-col justify-end overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-2">
              <div className={`flex w-full items-center justify-center rounded-lg transition-all duration-700 ${containerBHealthy ? 'bg-cyan-500/60' : 'bg-rose-500/40'}`} style={{ height: `${containerBMem}%` }}>
                <span className="font-mono text-xs font-bold text-white">{Math.round(containerBMem * 10.24)} MB</span>
              </div>
            </div>
            <p className="mt-2 font-mono text-[11px] text-slate-400">{containerBHealthy ? 'Checkout keeps its memory.' : 'A starved B. The service is down.'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 font-mono text-xs">
          <span className="text-slate-400">docker run <span className={cgroupsEnabled ? 'font-bold text-emerald-400' : 'text-slate-600 line-through'}>--memory=512m --cpus=1.0</span> analytics-app</span>
        </div>
      </div>
    </Stage>
  );
}

export function ImageVsContainerVisualizer() {
  const [instances, setInstances] = useState([
    { id: 101, tempFiles: ['session_a.tmp'] },
    { id: 102, tempFiles: [] },
  ]);

  const addInstance = () => {
    if (instances.length >= 3) return;
    const nextId = Math.max(...instances.map((i) => i.id)) + 1;
    setInstances([...instances, { id: nextId, tempFiles: [] }]);
  };
  const writeTempData = (id) => {
    setInstances(instances.map((inst) => (
      inst.id === id ? { ...inst, tempFiles: [...inst.tempFiles, `data_${inst.tempFiles.length + 1}.tmp`] } : inst
    )));
  };
  const resetContainer = (id) => {
    setInstances(instances.map((inst) => (inst.id === id ? { ...inst, tempFiles: [] } : inst)));
  };

  return (
    <Stage>
      <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/20 p-2.5 text-amber-300"><Lock className="h-5 w-5" /></div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-white">Image <code className="text-amber-300">payments-api:v1.4</code></span>
                <span className="rounded border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] uppercase text-amber-300">Read-only</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">One frozen blueprint, shared by every container below.</p>
            </div>
          </div>
          <button type="button" onClick={addInstance} disabled={instances.length >= 3} className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 disabled:opacity-40">
            <Play className="h-3.5 w-3.5 fill-current" />
            Stamp container ({instances.length}/3)
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-3 items-stretch gap-3 py-3">
        {instances.map((inst) => (
          <div key={inst.id} className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
            <div>
              <div className="mb-1 text-center font-mono text-[10px] text-slate-500">mounts read-only</div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white">Container #{inst.id}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </div>
              <div className="mb-2 rounded-xl border border-cyan-400/60 bg-cyan-950/50 p-2.5">
                <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] text-cyan-300">
                  <span className="font-bold">Writable layer</span>
                  <span>{inst.tempFiles.length} files</span>
                </div>
                <div className="min-h-[40px] space-y-0.5 rounded-lg bg-slate-950/80 p-1.5 font-mono text-[10px] text-cyan-200">
                  {inst.tempFiles.length === 0 ? <span className="italic text-slate-500">Clean</span> : inst.tempFiles.slice(-2).map((f) => <div key={f}>+ /tmp/{f}</div>)}
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-2 text-center font-mono text-[10px] text-amber-300">
                <Lock className="mr-1 inline h-3 w-3" /> Shared image stays locked
              </div>
            </div>
            <div className="mt-3 flex gap-1.5 border-t border-slate-800 pt-2">
              <button type="button" onClick={() => writeTempData(inst.id)} className="flex-1 rounded-lg border border-cyan-500/30 bg-cyan-500/20 py-1.5 text-[10px] font-semibold text-cyan-300">+ Write file</button>
              <button type="button" onClick={() => resetContainer(inst.id)} className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/20 px-2.5 py-1.5 text-[10px] font-semibold text-rose-300">
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
          </div>
        ))}
      </div>
    </Stage>
  );
}

export function UnionFSVisualizer() {
  const [merged, setMerged] = useState(false);
  const [cowTriggered, setCowTriggered] = useState(false);
  const layers = [
    { name: 'Layer 4 · writable top', color: 'border-cyan-400 bg-cyan-950/40 text-cyan-200', files: cowTriggered ? ['config.json (copy)', 'app.log'] : ['app.log'], mutable: true },
    { name: 'Layer 3 · app source', color: 'border-indigo-500/50 bg-indigo-950/30 text-indigo-200', files: ['server.js', 'routes.js'], mutable: false },
    { name: 'Layer 2 · config and deps', color: 'border-violet-500/50 bg-violet-950/30 text-violet-200', files: ['node_modules/', 'config.json'], mutable: false },
    { name: 'Layer 1 · base OS', color: 'border-amber-500/50 bg-amber-950/30 text-amber-200', files: ['/bin/sh', 'libc.so'], mutable: false },
  ];

  return (
    <Stage>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setMerged(false)} className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${!merged ? 'border border-sky-500/50 bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400'}`}>Layer stack</button>
          <button type="button" onClick={() => setMerged(true)} className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${merged ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>Merged view</button>
        </div>
        <button type="button" onClick={() => setCowTriggered(!cowTriggered)} className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold ${cowTriggered ? 'bg-cyan-500 text-slate-950' : 'border border-cyan-500/40 bg-slate-800 text-cyan-300'}`}>
          <Copy className="h-3.5 w-3.5" />
          {cowTriggered ? 'Undo the edit' : 'Edit config.json'}
        </button>
      </div>

      <div className="my-3 flex flex-1 flex-col justify-center">
        {!merged ? (
          <div className="space-y-2">
            {layers.map((layer) => (
              <div key={layer.name} className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3 ${layer.color}`}>
                <span className="flex items-center gap-2 text-xs font-bold">
                  {layer.mutable ? <Unlock className="h-4 w-4 text-cyan-400" /> : <Lock className="h-4 w-4 opacity-70" />}
                  {layer.name}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {layer.files.map((f) => (
                    <span key={f} className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] ${f.includes('copy') ? 'border-white bg-cyan-400 font-bold text-slate-950' : f === 'config.json' && cowTriggered ? 'border-slate-700 bg-slate-900/80 text-slate-500 line-through' : 'border-white/10 bg-slate-950/70'}`}>{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-emerald-500/60 bg-slate-950 p-5">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="flex items-center gap-2 text-sm font-bold text-white"><Layers className="h-5 w-5 text-emerald-400" /> One folder, four layers</span>
            </div>
            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-amber-300">/bin/sh<span className="mt-1 block text-[10px] text-slate-500">layer 1</span></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-violet-300">node_modules/<span className="mt-1 block text-[10px] text-slate-500">layer 2</span></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-indigo-300">server.js<span className="mt-1 block text-[10px] text-slate-500">layer 3</span></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-indigo-300">routes.js<span className="mt-1 block text-[10px] text-slate-500">layer 3</span></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-cyan-300">app.log<span className="mt-1 block text-[10px] text-slate-500">writable top</span></div>
              <div className={`rounded-xl border p-3 ${cowTriggered ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200' : 'border-slate-800 bg-slate-900 text-violet-300'}`}>
                config.json
                <span className="mt-1 block text-[10px]">{cowTriggered ? 'The top copy hides layer 2' : 'layer 2, still original'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 text-xs text-slate-300">
        {cowTriggered
          ? 'Layer 2 cannot change, so the engine copied config.json into the writable top and edited that copy.'
          : 'Switch to the merged view, or edit config.json to see the copy land on the top layer.'}
      </div>
    </Stage>
  );
}

const DOCKER_STEPS = [
  { cmd: 'FROM python:3.11-slim', stageName: '1. Base runtime', layerSize: '45 MB', visualDesc: 'The first layer is a small Linux image with Python 3.11.', badge: 'Build layer' },
  { cmd: 'WORKDIR /app', stageName: '2. Working directory', layerSize: '0 B', visualDesc: 'Creates /app and runs every later command from there.', badge: 'Path' },
  { cmd: 'COPY requirements.txt .', stageName: '3. Dependency manifest', layerSize: '2 KB', visualDesc: 'Only requirements.txt enters the image.', badge: 'Build layer' },
  { cmd: 'RUN pip install -r requirements.txt', stageName: '4. Install packages', layerSize: '38 MB', visualDesc: 'pip runs while the image is being built, and the installed packages freeze into a layer.', badge: 'Build layer' },
  { cmd: 'COPY . .', stageName: '5. Application code', layerSize: '140 KB', visualDesc: 'The Python source is copied in after the packages.', badge: 'Build layer' },
  { cmd: 'CMD ["gunicorn", "app:app"]', stageName: '6. Start command', layerSize: '0 B', visualDesc: 'This does not run during the build. It is the command that starts when the container boots.', badge: 'Runtime' },
];

export function DockerfileConveyorVisualizer() {
  const [activeStep, setActiveStep] = useState(0);
  const pick = (n) => setActiveStep(Math.min(DOCKER_STEPS.length - 1, Math.max(0, n)));

  return (
    <Stage>
      <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-3 lg:grid-cols-2">
        <div className="space-y-1.5 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono text-[11px] text-slate-400">
            <span>Dockerfile</span>
            <span>Pick a line</span>
          </div>
          {DOCKER_STEPS.map((s, idx) => (
            <button key={s.cmd} type="button" onClick={() => pick(idx)} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left font-mono text-xs ${activeStep === idx ? 'border-rose-500/50 bg-rose-500/20 text-rose-200' : idx < activeStep ? 'border-slate-800 bg-slate-900/90 text-emerald-300/90' : 'border-transparent bg-slate-900/30 text-slate-500'}`}>
              <span className="truncate">{s.cmd}</span>
              <span className="ml-2 shrink-0 rounded bg-slate-950 px-1.5 py-0.5 text-[10px]">{s.layerSize}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Image stack</span>
            <span className="rounded border border-rose-500/30 bg-rose-500/20 px-2 py-0.5 font-mono text-[11px] text-rose-300">{activeStep + 1} / {DOCKER_STEPS.length}</span>
          </div>
          <div className="my-3 flex flex-col-reverse gap-1.5">
            {DOCKER_STEPS.slice(0, activeStep + 1).map((s, idx) => (
              <div key={s.cmd} className={`flex items-center justify-between rounded-xl border p-2.5 font-mono text-xs ${idx === activeStep ? 'scale-[1.02] border-rose-400 bg-rose-500/25 text-white' : 'border-slate-800 bg-slate-950/80 text-slate-300'}`}>
                <span className="truncate">{s.stageName}</span>
                <span className="text-[10px] text-rose-300">{s.layerSize}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300">{DOCKER_STEPS[activeStep].stageName}</span>
              <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">{DOCKER_STEPS[activeStep].badge}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">{DOCKER_STEPS[activeStep].visualDesc}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <span className="text-xs text-slate-400">RUN happens while the image is built. CMD waits until the container starts.</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => pick(activeStep - 1)} disabled={activeStep === 0} className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-white disabled:opacity-30">Prev step</button>
          <button type="button" onClick={() => pick(activeStep + 1)} disabled={activeStep === DOCKER_STEPS.length - 1} className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-bold text-white disabled:opacity-30">Next step</button>
        </div>
      </div>
    </Stage>
  );
}

export function LayerCacheVisualizer() {
  const [editedCode, setEditedCode] = useState(false);
  const naiveLayers = [
    { cmd: 'FROM node:20-alpine', cached: true, time: '0.0s' },
    { cmd: 'WORKDIR /app', cached: true, time: '0.0s' },
    { cmd: 'COPY . .', cached: !editedCode, time: editedCode ? '0.8s' : '0.0s' },
    { cmd: 'RUN npm install', cached: !editedCode, time: editedCode ? '84.0s' : '0.0s' },
  ];
  const optimizedLayers = [
    { cmd: 'FROM node:20-alpine', cached: true, time: '0.0s' },
    { cmd: 'WORKDIR /app', cached: true, time: '0.0s' },
    { cmd: 'COPY package.json .', cached: true, time: '0.0s' },
    { cmd: 'RUN npm install', cached: true, time: '0.0s' },
    { cmd: 'COPY . .', cached: !editedCode, time: editedCode ? '0.6s' : '0.0s' },
  ];

  return (
    <Stage>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Zap className="h-4 w-4 text-emerald-400" /> Cache after one edit
        </span>
        <button type="button" onClick={() => setEditedCode(!editedCode)} className={`flex items-center gap-2 rounded-xl px-4 py-1.5 text-xs font-bold ${editedCode ? 'bg-amber-500 text-slate-950' : 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'}`}>
          <RefreshCw className="h-3.5 w-3.5" />
          {editedCode ? 'Restore the cache' : 'Edit one line and rebuild'}
        </button>
      </div>

      <div className="my-3 grid flex-1 grid-cols-2 gap-4">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-rose-300">Copy the app first</span>
              <span className={`rounded-lg px-2.5 py-0.5 font-mono text-xs font-bold ${editedCode ? 'border border-rose-500/40 bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>{editedCode ? '84.8s' : '0.1s'}</span>
            </div>
            <div className="space-y-2">
              {naiveLayers.map((l) => (
                <div key={l.cmd} className={`flex items-center justify-between rounded-xl border p-2.5 font-mono text-[11px] ${l.cached ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300' : 'border-rose-500 bg-rose-950/50 text-rose-200'}`}>
                  <span className="truncate">{l.cmd}</span>
                  <span className="ml-2 shrink-0 rounded bg-slate-950 px-2 py-0.5 text-[10px]">{l.cached ? 'cached' : `rebuild ${l.time}`}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-950/30 p-2.5 text-[11px] text-rose-200">Changing index.js sits above npm install, so the package install runs again.</p>
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-300">Install, then copy code</span>
              <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-300">{editedCode ? '0.6s' : '0.1s'}</span>
            </div>
            <div className="space-y-2">
              {optimizedLayers.map((l) => (
                <div key={l.cmd} className={`flex items-center justify-between rounded-xl border p-2.5 font-mono text-[11px] ${l.cached ? 'border-emerald-500/40 bg-emerald-950/25 text-emerald-300' : 'border-amber-400 bg-amber-950/40 text-amber-200'}`}>
                  <span className="truncate">{l.cmd}</span>
                  <span className="ml-2 shrink-0 rounded bg-slate-950 px-2 py-0.5 text-[10px]">{l.cached ? 'cached' : `rebuild ${l.time}`}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-2.5 text-[11px] text-emerald-200">package.json did not change, so npm install stays cached. Only the last layer rebuilds.</p>
        </div>
      </div>
    </Stage>
  );
}

export function MultiStageVisualizer() {
  const [mode, setMode] = useState('multistage');
  return (
    <Stage>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Package className="h-4 w-4 text-amber-400" /> What gets shipped
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode('single')} className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${mode === 'single' ? 'border border-rose-500/50 bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>Single stage · 1.14 GB</button>
          <button type="button" onClick={() => setMode('multistage')} className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${mode === 'multistage' ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>Multi-stage · 28 MB</button>
        </div>
      </div>

      <div className="my-3 grid flex-1 grid-cols-1 items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-col justify-between rounded-2xl border border-amber-500/40 bg-slate-900/80 p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-amber-300">Stage 1 · builder</span>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] text-amber-300">1,140 MB</span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between rounded-lg border border-rose-500/30 bg-rose-950/40 p-2 text-rose-300"><span>Compiler and SDK</span><span>680 MB</span></div>
              <div className="flex justify-between rounded-lg border border-rose-500/30 bg-rose-950/40 p-2 text-rose-300"><span>curl, bash, apt</span><span>240 MB</span></div>
              <div className="flex justify-between rounded-lg border border-rose-500/30 bg-rose-950/40 p-2 text-rose-300"><span>Source and caches</span><span>198 MB</span></div>
              <div className="flex justify-between rounded-lg border-2 border-emerald-400 bg-emerald-500/20 p-2.5 font-bold text-emerald-200"><span>Compiled server</span><span>22 MB</span></div>
            </div>
          </div>
          <p className="border-t border-slate-800 pt-2 font-mono text-[10px] text-slate-400">
            {mode === 'single' ? 'A single stage ships this whole builder.' : 'The red tools stay in stage 1 and are discarded.'}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className={`rounded-full border p-2 ${mode === 'multistage' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : 'border-rose-500/40 bg-rose-500/20 text-rose-300'}`}>
            <ArrowRight className="h-5 w-5" />
          </div>
          <span className="mt-1 text-center font-mono text-[9px] text-slate-400">{mode === 'multistage' ? 'COPY --from=builder' : 'ship all'}</span>
        </div>
        <div className={`flex flex-col justify-between rounded-2xl border p-4 ${mode === 'multistage' ? 'border-emerald-400/60 bg-emerald-950/20' : 'border-rose-500/60 bg-rose-950/20'}`}>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white">{mode === 'multistage' ? 'Stage 2 · production' : 'Shipped image'}</span>
              <span className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${mode === 'multistage' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>{mode === 'multistage' ? '28 MB' : '1,140 MB'}</span>
            </div>
            {mode === 'multistage' ? (
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between rounded-xl border border-emerald-400 bg-emerald-500/20 p-3 font-bold text-emerald-200"><span>server binary</span><span>22 MB</span></div>
                <div className="flex justify-between rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-300"><span>small base</span><span>6 MB</span></div>
              </div>
            ) : (
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="rounded bg-rose-500/20 p-2 text-rose-200">Compilers included</div>
                <div className="rounded bg-rose-500/20 p-2 text-rose-200">Shell and curl included</div>
                <div className="rounded bg-rose-500/20 p-2 text-rose-200">Source included</div>
                <div className="rounded bg-emerald-500/20 p-2 text-emerald-200">server binary</div>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-[11px]">
            <span className="text-slate-400">Extra tools in the image</span>
            <span className={mode === 'multistage' ? 'font-bold text-emerald-400' : 'font-bold text-rose-400'}>{mode === 'multistage' ? 'none' : 'compilers, shell, curl'}</span>
          </div>
        </div>
      </div>
    </Stage>
  );
}

export function HardeningChecklistVisualizer() {
  const [gates, setGates] = useState({ dockerignore: true, nonRoot: true, healthcheck: true, sigterm: true });
  const toggleGate = (key) => setGates((prev) => ({ ...prev, [key]: !prev[key] }));
  const score = Object.values(gates).filter(Boolean).length * 25;
  const cards = [
    { key: 'dockerignore', title: '.dockerignore', icon: Filter, on: 'Blocked .env, .git, and local caches', off: '.env and .git were copied into the image', onTag: 'ACTIVE', offTag: 'MISSING' },
    { key: 'nonRoot', title: 'Non-root user', icon: Lock, on: 'Process runs as UID 1001', off: 'Process runs as root', onTag: 'USER appuser', offTag: 'UID 0' },
    { key: 'healthcheck', title: 'HEALTHCHECK', icon: Activity, on: 'A probe hits /healthz', off: 'A stuck app still receives traffic', onTag: 'PROBE', offTag: 'BLIND' },
    { key: 'sigterm', title: 'SIGTERM drain', icon: Terminal, on: 'Open requests finish before exit', off: 'The process is killed mid-request', onTag: 'GRACEFUL', offTag: 'DROP' },
  ];

  return (
    <Stage>
      <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <div className="flex items-center gap-2">
          <Shield className={`h-5 w-5 ${score === 100 ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-white">Readiness {score}%</span>
        </div>
        <span className={`rounded-xl border px-3 py-1 font-mono text-xs font-bold ${score === 100 ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border-amber-500/40 bg-amber-500/20 text-amber-300'}`}>
          {score === 100 ? 'Ready' : `${4 - score / 25} open`}
        </span>
      </div>
      <div className="my-3 grid flex-1 grid-cols-2 gap-3">
        {cards.map((card) => {
          const on = gates[card.key];
          const Icon = card.icon;
          return (
            <button key={card.key} type="button" onClick={() => toggleGate(card.key)} className={`flex flex-col justify-between rounded-2xl border p-4 text-left ${on ? 'border-emerald-500/50 bg-slate-900/80' : 'border-rose-500/60 bg-rose-950/30'}`}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-white"><Icon className="h-4 w-4 text-cyan-400" />{card.title}</span>
                <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${on ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500 text-white'}`}>{on ? card.onTag : card.offTag}</span>
              </div>
              <p className={`my-2 rounded-xl border border-slate-800 bg-slate-950 p-2 font-mono text-[11px] ${on ? 'text-emerald-300' : 'text-rose-300'}`}>{on ? card.on : card.off}</p>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-400">Click a card to open or close that gate.</p>
    </Stage>
  );
}

const CONTEXT_FILES = [
  { name: 'app/main.py', keep: true },
  { name: 'requirements.txt', keep: true },
  { name: 'models/model_v1.joblib', keep: true },
  { name: 'venv/', keep: false },
  { name: '.git/', keep: false },
  { name: '__pycache__/', keep: false },
];

export function DockerignoreVisualizer() {
  const [ignored, setIgnored] = useState(true);
  const sent = CONTEXT_FILES.filter((file) => ignored ? file.keep : true);

  return (
    <Stage>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Build context</span>
        <button type="button" onClick={() => setIgnored((value) => !value)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${ignored ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'border border-rose-500/50 bg-rose-500/20 text-rose-300'}`}>
          {ignored ? '.dockerignore is on' : '.dockerignore is off'}
        </button>
      </div>
      <div className="my-3 grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 p-3">
          <p className="mb-2 text-xs font-bold text-white">Folder next to the Dockerfile</p>
          <div className="space-y-1.5">
            {CONTEXT_FILES.map((file) => {
              const blocked = ignored && !file.keep;
              return (
                <div key={file.name} className={`flex items-center justify-between rounded-xl border px-2.5 py-2 font-mono text-[11px] ${blocked ? 'border-slate-800 text-slate-500 line-through' : 'border-slate-700 text-slate-100'}`}>
                  <span>{file.name}</span>
                  <span className={blocked ? 'text-rose-300 no-underline' : 'text-emerald-300'}>{blocked ? 'left behind' : 'included'}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`flex flex-col justify-between rounded-2xl border p-3 ${ignored ? 'border-emerald-500/40' : 'border-rose-500/50'}`}>
          <div>
            <p className="mb-2 text-xs font-bold text-white">Sent to the Docker daemon</p>
            <div className="space-y-1.5">
              {sent.map((file) => (
                <p key={file.name} className={`rounded-xl border px-2.5 py-2 font-mono text-[11px] ${file.keep ? 'border-emerald-500/30 text-emerald-200' : 'border-rose-500/40 text-rose-200'}`}>{file.name}</p>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-300">{ignored ? 'venv, .git, and bytecode never enter the image.' : 'The virtualenv and .git are copied in with the app.'}</p>
        </div>
      </div>
    </Stage>
  );
}

export function DownloadModelVisualizer() {
  const [urlUp, setUrlUp] = useState(true);
  const [built, setBuilt] = useState(false);
  const [dropCurl, setDropCurl] = useState(true);
  const gotModel = built && urlUp;

  return (
    <Stage>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <button type="button" onClick={() => { setUrlUp(true); setBuilt(false); }} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${urlUp ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>URL is reachable</button>
        <button type="button" onClick={() => { setUrlUp(false); setBuilt(false); }} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${!urlUp ? 'border border-rose-500/50 bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>URL is down</button>
        <button type="button" onClick={() => setBuilt(true)} className="rounded-xl bg-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950">Run the build</button>
        <button type="button" onClick={() => setDropCurl((value) => !value)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${dropCurl ? 'border border-teal-400/40 bg-slate-800 text-teal-200' : 'border border-amber-400/40 bg-slate-800 text-amber-200'}`}>
          {dropCurl ? 'Second stage drops curl' : 'curl stays in the image'}
        </button>
      </div>
      <div className="my-3 grid min-h-0 flex-1 grid-cols-1 items-stretch gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400">Git repository</p>
          <p className="mt-3 font-mono text-xs text-slate-200">app/main.py</p>
          <p className="font-mono text-xs text-slate-200">requirements.txt</p>
          <p className="mt-3 font-mono text-[11px] text-slate-500">no model_v1.joblib</p>
        </div>
        <div className={`rounded-2xl border p-3 ${!built ? 'border-slate-700' : urlUp ? 'border-teal-400/50' : 'border-rose-500/50'}`}>
          <p className="text-[10px] font-bold uppercase text-slate-400">During docker build</p>
          <p className="mt-3 font-mono text-[11px] text-teal-100">RUN curl -o /app/models/model_v1.joblib $MODEL_URL</p>
          <p className="mt-3 text-xs text-slate-300">{!built ? 'Press Run the build.' : urlUp ? 'The file landed in the image.' : 'The build stopped. The URL did not answer.'}</p>
        </div>
        <div className={`rounded-2xl border p-3 ${gotModel ? 'border-emerald-400/50' : 'border-slate-800'}`}>
          <p className="text-[10px] font-bold uppercase text-slate-400">Image contents</p>
          <p className="mt-3 font-mono text-xs text-slate-200">app/main.py</p>
          <p className={`font-mono text-xs ${gotModel ? 'text-emerald-200' : 'text-slate-600'}`}>{gotModel ? 'models/model_v1.joblib' : 'models/ empty'}</p>
          <p className={`mt-3 font-mono text-[11px] ${dropCurl && gotModel ? 'text-slate-500' : gotModel ? 'text-amber-200' : 'text-slate-600'}`}>
            {gotModel ? (dropCurl ? 'curl was used, then left out' : 'curl is still installed') : 'nothing downloaded'}
          </p>
        </div>
      </div>
    </Stage>
  );
}

export function VolumeModelVisualizer() {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(true);
  const loaded = copied || mounted;

  return (
    <Stage>
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-3">
        <button type="button" onClick={() => setCopied(true)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${copied ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>Model copied into the image</button>
        <button type="button" onClick={() => setCopied(false)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${!copied ? 'border border-amber-400/50 bg-amber-500/15 text-amber-200' : 'bg-slate-800 text-slate-400'}`}>Model stays on the host</button>
        {!copied && (
          <button type="button" onClick={() => setMounted((value) => !value)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${mounted ? 'bg-teal-500 text-slate-950' : 'border border-rose-500/40 bg-rose-500/15 text-rose-200'}`}>
            {mounted ? 'Volume is mounted' : 'Mount ./models'}
          </button>
        )}
      </div>
      <div className="my-3 grid min-h-0 flex-1 grid-cols-1 items-stretch gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400">Image</p>
          <p className="mt-3 font-mono text-xs text-slate-200">app/main.py</p>
          <p className={`mt-2 font-mono text-xs ${copied ? 'text-emerald-200' : 'text-slate-600'}`}>{copied ? '/app/models/model_v1.joblib' : 'no model file'}</p>
        </div>
        <div className={`rounded-2xl border p-3 ${loaded ? 'border-emerald-400/40' : 'border-rose-500/50'}`}>
          <p className="text-[10px] font-bold uppercase text-slate-400">Running container</p>
          <p className={`mt-3 text-sm font-bold ${loaded ? 'text-emerald-200' : 'text-rose-200'}`}>{loaded ? 'Model loaded' : 'File not found'}</p>
          <p className="mt-2 text-[11px] text-slate-300">
            {copied ? 'The file is inside the image, so the container starts on its own.' : mounted ? 'The file is coming from the host folder, not from the image.' : 'Nothing is mounted, and the image has no model.'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 p-3">
          <p className="text-[10px] font-bold uppercase text-slate-400">Host folder ./models</p>
          <p className="mt-3 font-mono text-xs text-amber-200">model_v1.joblib</p>
          <p className="mt-2 text-[11px] text-slate-400">{copied ? 'The container does not need this folder.' : mounted ? 'Mounted at /app/models.' : 'Sitting on the laptop, unseen by the container.'}</p>
        </div>
      </div>
    </Stage>
  );
}

function PracticeButton({ active, onClick, children, tone = 'teal' }) {
  const on = tone === 'amber'
    ? 'border-amber-400/50 bg-amber-500/15 text-amber-100'
    : tone === 'rose'
      ? 'border-rose-400/50 bg-rose-500/15 text-rose-100'
      : 'border-teal-300/50 bg-teal-500/20 text-teal-100';
  return (
    <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${active ? on : 'border-transparent bg-slate-800 text-slate-400'}`}>
      {children}
    </button>
  );
}

function VersionPractice() {
  const [named, setNamed] = useState(false);
  const [viaArg, setViaArg] = useState(false);
  const file = named ? 'model_v1.2.joblib' : 'model_v1.joblib';
  return (
    <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
      <div className="flex flex-col justify-between rounded-2xl border border-slate-800 p-3">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Direct copy</p>
          <p className="mt-3 font-mono text-[11px] text-teal-100">COPY ./models/{file} /app/models/{file}</p>
          <p className="mt-3 rounded-xl border border-slate-700 px-2 py-2 font-mono text-xs text-white">{file}</p>
        </div>
        <button type="button" onClick={() => setNamed((value) => !value)} className="mt-3 rounded-xl bg-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950">
          {named ? 'Back to v1' : 'Replace the file with v1.2'}
        </button>
      </div>
      <div className="flex flex-col justify-between rounded-2xl border border-slate-800 p-3">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400">Download with ARG</p>
          <p className="mt-3 font-mono text-[11px] text-slate-300">ARG MODEL_VERSION</p>
          <p className="font-mono text-[11px] text-slate-300">RUN curl -o /app/models/model.joblib $MODEL_URL</p>
          <p className="mt-3 font-mono text-[11px] text-amber-100">docker build --build-arg MODEL_VERSION={viaArg ? 'v1.3' : 'v1.2'}</p>
        </div>
        <button type="button" onClick={() => setViaArg((value) => !value)} className="mt-3 rounded-xl border border-amber-400/40 px-3 py-1.5 text-xs font-bold text-amber-100">
          {viaArg ? 'CI passes v1.3' : 'CI passes v1.2'}
        </button>
      </div>
    </div>
  );
}

function PathPractice() {
  const [match, setMatch] = useState(true);
  const appPath = match ? '/app/models/model_v1.2.joblib' : '/models/model.joblib';
  return (
    <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 p-3">
        <p className="text-[10px] font-bold uppercase text-slate-400">Dockerfile saves the file here</p>
        <p className="mt-3 font-mono text-xs text-teal-100">/app/models/model_v1.2.joblib</p>
      </div>
      <div className={`rounded-2xl border p-3 ${match ? 'border-emerald-400/40' : 'border-rose-400/50'}`}>
        <p className="text-[10px] font-bold uppercase text-slate-400">FastAPI loads MODEL_PATH</p>
        <p className="mt-3 font-mono text-xs text-white">{appPath}</p>
        <p className={`mt-3 text-sm font-bold ${match ? 'text-emerald-200' : 'text-rose-200'}`}>{match ? 'Model loaded' : 'File not found'}</p>
        <button type="button" onClick={() => setMatch((value) => !value)} className="mt-3 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white">
          {match ? 'Point the app at a different path' : 'Point the app at /app/models/'}
        </button>
      </div>
    </div>
  );
}

function SizePractice() {
  const [slim, setSlim] = useState(true);
  const rows = slim
    ? [
      ['python:3.10-slim', 'kept'],
      ['app + model_v1.2.joblib', 'kept'],
      ['curl and apt lists', 'discarded'],
      ['pip cache', 'discarded'],
    ]
    : [
      ['python + curl + apt', 'shipped'],
      ['app + model_v1.2.joblib', 'shipped'],
      ['/var/lib/apt/lists', 'shipped'],
      ['/root/.cache/pip', 'shipped'],
    ];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <PracticeButton active={!slim} tone="rose" onClick={() => setSlim(false)}>One stage keeps the tools</PracticeButton>
        <PracticeButton active={slim} onClick={() => setSlim(true)}>Final stage copies the model only</PracticeButton>
      </div>
      <div className="space-y-1.5">
        {rows.map(([label, state]) => {
          const extra = state === 'shipped' && label !== 'app + model_v1.2.joblib';
          return (
            <div key={label} className={`flex items-center justify-between rounded-xl border px-3 py-2 font-mono text-[11px] ${state === 'discarded' ? 'border-slate-800 text-slate-500 line-through' : extra ? 'border-rose-400/40 text-rose-200' : 'border-emerald-400/30 text-emerald-100'}`}>
              <span>{label}</span>
              <span className="no-underline">{state}</span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-400">{slim ? 'Stage 1 downloads with curl. Stage 2 is the slim image plus the app and the model.' : 'curl, apt lists, and the pip cache stay in the image you ship.'}</p>
    </div>
  );
}

function SecretPractice() {
  const [secret, setSecret] = useState(true);
  return (
    <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
      <button type="button" onClick={() => setSecret(false)} className={`rounded-2xl border p-3 text-left ${secret ? 'border-slate-800' : 'border-rose-400/50'}`}>
        <p className="text-[10px] font-bold uppercase text-slate-400">ARG token</p>
        <p className="mt-3 font-mono text-[11px] text-rose-200">ARG AWS_TOKEN</p>
        <p className="mt-2 font-mono text-[11px] text-rose-100">layer history: AWS_TOKEN=AKIA…</p>
      </button>
      <button type="button" onClick={() => setSecret(true)} className={`rounded-2xl border p-3 text-left ${secret ? 'border-emerald-400/50' : 'border-slate-800'}`}>
        <p className="text-[10px] font-bold uppercase text-slate-400">docker build --secret</p>
        <p className="mt-3 font-mono text-[11px] text-emerald-100">RUN --mount=type=secret,id=token curl …</p>
        <p className="mt-2 font-mono text-[11px] text-slate-300">layer history: the token value is absent</p>
      </button>
    </div>
  );
}

export function BestPracticesVisualizer() {
  const [topic, setTopic] = useState('version');
  return (
    <Stage>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5">
        <PracticeButton active={topic === 'version'} onClick={() => setTopic('version')}>Version name</PracticeButton>
        <PracticeButton active={topic === 'path'} onClick={() => setTopic('path')}>Same path</PracticeButton>
        <PracticeButton active={topic === 'size'} onClick={() => setTopic('size')}>Image size</PracticeButton>
        <PracticeButton active={topic === 'secret'} tone="amber" onClick={() => setTopic('secret')}>Download token</PracticeButton>
      </div>
      {topic === 'version' && <VersionPractice />}
      {topic === 'path' && <PathPractice />}
      {topic === 'size' && <SizePractice />}
      {topic === 'secret' && <SecretPractice />}
    </Stage>
  );
}
