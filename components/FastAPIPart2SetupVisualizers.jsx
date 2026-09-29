import React, { useState } from 'react';
import { Folder, FileCode, FileText, CheckCircle, XCircle, Globe, RefreshCw, Package, Server, Layers } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, Terminal, CodeLines } from './VisualKit';

const ROADMAP = ['Python 3.7+', 'Why a venv', 'Create venv', 'Activate', 'Install', 'Verify', 'First app', 'Run it', 'Docs'];

function SetupRoadmap({ current }) {
  return (
    <div className="flex flex-wrap items-center gap-1 mb-3">
      {ROADMAP.map((label, i) => (
        <span
          key={label}
          className={`text-[9px] px-2 py-0.5 rounded-full border ${
            i === current
              ? 'border-teal-400/70 bg-teal-500/20 text-teal-50 font-bold'
              : i < current
                ? 'border-emerald-500/40 text-emerald-300'
                : 'border-gray-700 text-gray-500'
          }`}
        >
          {i < current ? '✓ ' : ''}
          {label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Check your Python version                                         */
/* ------------------------------------------------------------------ */

const MACHINES = {
  modern: { label: 'Recent Python installed', python: 'Python 3.12.4', python3: 'Python 3.12.4' },
  mac: { label: 'Only “python3” on PATH', python: 'zsh: command not found: python', python3: 'Python 3.12.4' },
  old: { label: 'Old Python 3.6', python: 'Python 3.6.9', python3: 'Python 3.6.9' },
  none: { label: 'Python not installed', python: 'zsh: command not found: python', python3: 'zsh: command not found: python3' },
};

const PY_FEATURES = [
  { version: '3.5', text: 'Type hints (PEP 484) and async / await syntax' },
  { version: '3.6', text: 'Variable annotations like  age: int  and f-strings' },
  { version: '3.7', text: 'asyncio.run(), dataclasses, and a more mature asyncio' },
];

function versionVerdict(output) {
  const match = output.match(/Python (\d+)\.(\d+)/);
  if (!match) return { ok: false, text: 'Python was not found under this command. Try the other command, or install Python from python.org.' };
  const major = Number(match[1]);
  const minor = Number(match[2]);
  if (major > 3 || (major === 3 && minor >= 7)) {
    return { ok: true, text: `${match[0]} meets the course requirement (3.7 or later). Type hints and async are available.` };
  }
  return { ok: false, text: `${match[0]} is too old for FastAPI’s type hints and async features. Install a newer Python from python.org.` };
}

export function PythonVersionVisualizer() {
  const [machine, setMachine] = useState('modern');
  const [history, setHistory] = useState([]);
  const last = history[history.length - 1];

  const run = (cmd) => {
    const output = MACHINES[machine][cmd];
    setHistory((current) => [...current.slice(-2), { cmd: `${cmd} --version`, output }]);
  };

  const lines = history.flatMap((item) => [
    { kind: 'cmd', text: item.cmd },
    { kind: item.output.startsWith('Python') ? 'out' : 'err', text: item.output },
  ]);
  const verdict = last ? versionVerdict(last.output) : null;

  return (
    <Frame title="Step 0: do you have a recent enough Python?" hint="Pick a machine, then run both commands. Some systems only know “python3”.">
      <SetupRoadmap current={0} />
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-700 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">What your environment needs</p>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            {[
              ['Python 3.7+', 'the language, with type hints and async'],
              ['FastAPI', 'the web framework'],
              ['An ASGI server (Uvicorn)', 'runs your app'],
            ].map(([name, role]) => (
              <div key={name} className="rounded-lg border border-gray-700 bg-gray-900/50 p-2">
                <p className="text-white font-semibold">{name}</p>
                <p className="text-gray-400">{role}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">…all inside a virtual environment, the best practice set up on the next slides.</p>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-gray-500">machine:</span>
          {Object.entries(MACHINES).map(([id, item]) => (
            <button
              key={id}
              type="button"
              className={tabClass(machine === id)}
              onClick={() => {
                setMachine(id);
                setHistory([]);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => run('python')} className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono">
            python --version
          </button>
          <button type="button" onClick={() => run('python3')} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-100 text-xs font-mono">
            python3 --version
          </button>
        </div>
        <Terminal lines={lines.length ? lines : [{ kind: 'dim', text: '# run a command above' }]} />
        {verdict && (
          <div
            className={`rounded-xl border px-3 py-2 text-[11px] flex gap-2 ${
              verdict.ok ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100' : 'border-rose-400/50 bg-rose-500/10 text-rose-100'
            }`}
          >
            {verdict.ok ? <CheckCircle className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            {verdict.text}
          </div>
        )}
        <Lesson title="Why the version matters">
          <div className="space-y-1">
            {PY_FEATURES.map((item) => (
              <p key={item.version}>
                <span className="font-mono text-teal-200">Python {item.version}</span> — {item.text}
              </p>
            ))}
            <p className="text-gray-400">
              FastAPI is built on type hints and async, so it needs these modern versions. The course asks for 3.7 or later;
              recent FastAPI releases need newer still, so installing the latest Python 3 is the safe choice.
            </p>
          </div>
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Why virtual environments                                          */
/* ------------------------------------------------------------------ */

export function VenvWhyVisualizer() {
  const [mode, setMode] = useState('global');
  const [installed, setInstalled] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setInstalled(false);
  };

  const globalVersion = installed ? '1.5.1' : '1.0.2';
  const aOk = mode === 'venv' || !installed;
  const bOk = installed;

  const project = (name, needs, ok, detail) => (
    <div className={`rounded-xl border p-3 ${ok ? 'border-emerald-400/50 bg-emerald-500/5' : 'border-rose-400/50 bg-rose-500/5'}`}>
      <p className="text-xs font-semibold text-white flex items-center gap-1.5">
        <Folder className="w-3.5 h-3.5 text-amber-300" /> {name}
      </p>
      <p className="text-[10px] text-gray-400">needs scikit-learn {needs}</p>
      <p className={`text-[11px] mt-1 ${ok ? 'text-emerald-200' : 'text-rose-200'}`}>{detail}</p>
    </div>
  );

  const pkgBox = (title, version, highlight) => (
    <div className={`rounded-xl border p-2.5 ${highlight ? 'border-amber-400/60 bg-amber-500/10' : 'border-gray-700 bg-gray-900/50'}`}>
      <p className="text-[10px] text-gray-400 font-mono">{title}</p>
      <p className="font-mono text-[11px] text-white mt-0.5">{version ? `scikit-learn==${version}` : '(empty)'}</p>
    </div>
  );

  return (
    <Frame
      title="One global Python vs one environment per project"
      hint="Press the install button in each mode and watch what happens to Project A."
      footer={
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(mode === 'global')} onClick={() => switchMode('global')}>
              Everything in global Python
            </button>
            <button type="button" className={tabClass(mode === 'venv')} onClick={() => switchMode('venv')}>
              A virtual environment per project
            </button>
          </div>
          <button
            type="button"
            disabled={installed}
            onClick={() => setInstalled(true)}
            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-mono disabled:opacity-40"
          >
            pip install scikit-learn==1.5.1  (for Project B)
          </button>
        </div>
      }
    >
      <SetupRoadmap current={1} />
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {project(
            'Project A — churn model (2022)',
            '1.0.2',
            aOk,
            aOk ? 'Works: its model was trained and pickled with 1.0.2.' : 'Broken: 1.0.2 was replaced by 1.5.1. The old pickled model may fail to load or behave differently.'
          )}
          {project(
            'Project B — new FastAPI service',
            '1.5.1',
            bOk,
            bOk ? 'Works: 1.5.1 is installed where it looks.' : 'Missing: 1.5.1 is not installed yet.'
          )}
        </div>

        {mode === 'global' ? (
          <div className="rounded-xl border border-gray-700 p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">One shared place for packages</p>
            {pkgBox('global site-packages (shared by every project)', globalVersion, installed)}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-700 p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">Each project has its own isolated space</p>
            <div className="grid grid-cols-2 gap-2">
              {pkgBox('project-a/.venv/site-packages', '1.0.2', false)}
              {pkgBox('project-b/.venv/site-packages', installed ? '1.5.1' : null, installed)}
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5">Global Python is left untouched.</p>
          </div>
        )}

        <Lesson title={mode === 'global' ? 'The dependency conflict' : 'Isolation'}>
          {mode === 'global'
            ? installed
              ? 'Installing for Project B silently upgraded the one shared copy, and Project A broke. Two projects cannot need two versions of the same package in one global installation.'
              : 'Both projects share one global site-packages. Now install the version Project B needs.'
            : installed
              ? 'The install went only into Project B’s environment. Project A still has 1.0.2 and still works. Each project’s exact versions can be listed and recreated elsewhere — that is what makes a project reproducible.'
              : 'Each project gets its own isolated space for packages. Now install the version Project B needs.'}
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 9. Create a virtual environment                                       */
/* ------------------------------------------------------------------ */

const VENV_ENTRIES = {
  unix: [
    { path: '.venv/', depth: 0, kind: 'dir', why: 'The environment itself. Everything for this project lives in here.' },
    { path: 'bin/', depth: 1, kind: 'dir', why: 'Executables for this environment.' },
    { path: 'python', depth: 2, kind: 'file', why: 'A copy of (or link to) the Python interpreter this project will use.' },
    { path: 'pip', depth: 2, kind: 'file', why: 'A pip that installs into this environment only.' },
    { path: 'activate', depth: 2, kind: 'file', why: 'The script you run in the next step to switch your shell into this environment.' },
    { path: 'lib/python3.12/site-packages/', depth: 1, kind: 'dir', why: 'Where this project’s packages will be installed. Empty for now — FastAPI goes here later.' },
    { path: 'pyvenv.cfg', depth: 1, kind: 'file', why: 'Records which Python created the environment.' },
  ],
  windows: [
    { path: '.venv\\', depth: 0, kind: 'dir', why: 'The environment itself. Everything for this project lives in here.' },
    { path: 'Scripts\\', depth: 1, kind: 'dir', why: 'Executables for this environment (Windows uses Scripts instead of bin).' },
    { path: 'python.exe', depth: 2, kind: 'file', why: 'A copy of the Python interpreter this project will use.' },
    { path: 'pip.exe', depth: 2, kind: 'file', why: 'A pip that installs into this environment only.' },
    { path: 'activate.bat / Activate.ps1', depth: 2, kind: 'file', why: 'The activation scripts for Command Prompt and PowerShell.' },
    { path: 'Lib\\site-packages\\', depth: 1, kind: 'dir', why: 'Where this project’s packages will be installed. Empty for now.' },
    { path: 'pyvenv.cfg', depth: 1, kind: 'file', why: 'Records which Python created the environment.' },
  ],
};

const CREATE_STEPS = [
  { cmd: null, text: 'Open a terminal. You start in your home folder.' },
  { cmd: 'mkdir fastapi-ml-intro', text: 'Step 1a: make a folder for the project.' },
  { cmd: 'cd fastapi-ml-intro', text: 'Step 1b: move into it. Everything from now on happens inside this folder.' },
  { cmd: 'python -m venv .venv', text: 'Step 2: run Python’s built-in venv module and name the environment .venv (a common convention; “venv” is also used). Use python3 if that is your command.' },
  { cmd: null, text: 'A .venv folder now exists: a copy of the Python interpreter plus an empty place for project-specific packages. Click the entries to see what each is for.' },
];

export function CreateVenvVisualizer() {
  const [os, setOs] = useState('unix');
  const [entry, setEntry] = useState(2);
  const stepper = useStepper(CREATE_STEPS.length, 1600);
  const step = stepper.index;
  const home = os === 'unix' ? '~' : 'C:\\Users\\you';
  const inProject = step >= 2;
  const prompt = os === 'unix' ? `${inProject ? '~/fastapi-ml-intro' : '~'} $` : `${home}${inProject ? '\\fastapi-ml-intro' : ''}>`;

  const lines = [];
  CREATE_STEPS.slice(1, step + 1).forEach((item, i) => {
    if (!item.cmd) return;
    lines.push({ kind: 'cmd', text: item.cmd, prompt: os === 'unix' ? (i >= 2 ? '~/fastapi-ml-intro $' : '~ $') : `${home}${i >= 2 ? '\\fastapi-ml-intro' : ''}>` });
  });
  const entries = VENV_ENTRIES[os];

  return (
    <Frame
      title="Create the project folder and its virtual environment"
      hint="Step through the commands. The file tree on the right updates as each one runs."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(os === 'unix')} onClick={() => setOs('unix')}>
              macOS / Linux
            </button>
            <button type="button" className={tabClass(os === 'windows')} onClick={() => setOs('windows')}>
              Windows
            </button>
          </div>
          <StepControls stepper={stepper} total={CREATE_STEPS.length} />
        </div>
      }
    >
      <SetupRoadmap current={2} />
      <div className="space-y-3">
        <Lesson title={`Step ${step + 1} of ${CREATE_STEPS.length}`}>{CREATE_STEPS[step].text}</Lesson>
        <div className="grid md:grid-cols-2 gap-3">
          <Terminal title={prompt} lines={lines.length ? lines : [{ kind: 'dim', text: '# ready' }]} />
          <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 font-mono text-[11px] space-y-0.5">
            <p className="text-[10px] font-sans uppercase tracking-wider text-gray-500 mb-1">File tree</p>
            <p className="text-gray-400 flex items-center gap-1">
              <Folder className="w-3 h-3" /> {home}
            </p>
            {step >= 1 && (
              <p className={`pl-4 flex items-center gap-1 ${inProject ? 'text-teal-200' : 'text-gray-300'}`}>
                <Folder className="w-3 h-3 text-amber-300" /> fastapi-ml-intro {inProject && <span className="text-[9px] text-teal-400">← you are here</span>}
              </p>
            )}
            {step >= 3 &&
              entries.map((item, i) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => setEntry(i)}
                  style={{ paddingLeft: `${32 + item.depth * 14}px` }}
                  className={`w-full text-left flex items-center gap-1 rounded ${
                    entry === i && step >= 4 ? 'bg-teal-500/20 text-white' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {item.kind === 'dir' ? <Folder className="w-3 h-3 text-amber-300" /> : <FileText className="w-3 h-3 text-gray-400" />}
                  {item.path}
                </button>
              ))}
          </div>
        </div>
        {step >= 4 && (
          <div className="rounded-xl border border-teal-400/40 bg-teal-500/5 p-3 text-[11px] text-gray-200">
            <span className="font-mono text-teal-200">{entries[entry].path}</span> — {entries[entry].why}
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 10. Activate the virtual environment                                 */
/* ------------------------------------------------------------------ */

const SHELLS = {
  unix: {
    label: 'macOS / Linux',
    prompt: 'you@machine:~/fastapi-ml-intro$',
    activate: 'source .venv/bin/activate',
    which: 'which python',
    systemPython: '/usr/bin/python3',
    venvPython: '/home/you/fastapi-ml-intro/.venv/bin/python',
    path: ['/usr/local/bin', '/usr/bin', '/bin'],
    venvDir: '/home/you/fastapi-ml-intro/.venv/bin',
    site: '.venv/lib/python3.12/site-packages',
  },
  cmd: {
    label: 'Windows (Command Prompt)',
    prompt: 'C:\\Users\\you\\fastapi-ml-intro>',
    activate: '.venv\\Scripts\\activate.bat',
    which: 'where python',
    systemPython: 'C:\\Python312\\python.exe',
    venvPython: 'C:\\Users\\you\\fastapi-ml-intro\\.venv\\Scripts\\python.exe',
    path: ['C:\\Python312\\', 'C:\\Windows\\System32'],
    venvDir: 'C:\\Users\\you\\fastapi-ml-intro\\.venv\\Scripts',
    site: '.venv\\Lib\\site-packages',
  },
  ps: {
    label: 'Windows (PowerShell)',
    prompt: 'PS C:\\Users\\you\\fastapi-ml-intro>',
    activate: '.venv\\Scripts\\Activate.ps1',
    which: '(Get-Command python).Source',
    systemPython: 'C:\\Python312\\python.exe',
    venvPython: 'C:\\Users\\you\\fastapi-ml-intro\\.venv\\Scripts\\python.exe',
    path: ['C:\\Python312\\', 'C:\\Windows\\System32'],
    venvDir: 'C:\\Users\\you\\fastapi-ml-intro\\.venv\\Scripts',
    site: '.venv\\Lib\\site-packages',
  },
};

const ACTIVATE_TEXT = [
  'Before activation. Typing “python” finds the system-wide interpreter, because the shell searches the folders on PATH from top to bottom and uses the first match.',
  'Activate. The script puts the environment’s own folder at the top of PATH and adds (.venv) to your prompt so you can see it is on.',
  'Check which python runs now: the one inside .venv. The environment’s interpreter and packages now take priority.',
  'Every pip install from now on lands inside this isolated environment, not in global Python.',
  'Type deactivate to switch back. PATH and the prompt return to normal; the .venv folder stays for next time.',
];

export function ActivateVenvVisualizer() {
  const [shell, setShell] = useState('unix');
  const stepper = useStepper(ACTIVATE_TEXT.length, 1800);
  const step = stepper.index;
  const cfg = SHELLS[shell];
  const active = step >= 1 && step <= 3;
  const promptAt = (on) => `${on ? '(.venv) ' : ''}${cfg.prompt}`;

  const lines = [{ kind: 'cmd', text: cfg.which, prompt: promptAt(false) }, { kind: 'out', text: cfg.systemPython }];
  if (step >= 1) {
    if (shell === 'ps') {
      lines.push({ kind: 'cmd', text: 'Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process', prompt: promptAt(false) });
      lines.push({ kind: 'dim', text: '# only needed if PowerShell refuses to run the script' });
    }
    lines.push({ kind: 'cmd', text: cfg.activate, prompt: promptAt(false), highlight: step === 1 });
  }
  if (step >= 2) {
    lines.push({ kind: 'cmd', text: cfg.which, prompt: promptAt(true), highlight: step === 2 });
    lines.push({ kind: 'ok', text: cfg.venvPython, highlight: step === 2 });
  }
  if (step >= 3) {
    lines.push({ kind: 'cmd', text: 'pip install "fastapi[all]"', prompt: promptAt(true), highlight: step === 3 });
    lines.push({ kind: 'dim', text: `→ installs into ${cfg.site}` });
  }
  if (step >= 4) {
    lines.push({ kind: 'cmd', text: 'deactivate', prompt: promptAt(true), highlight: true });
  }

  const pathList = active ? [cfg.venvDir, ...cfg.path] : cfg.path;

  return (
    <Frame
      title="Activate: make this project’s Python the one your shell uses"
      hint="Pick your operating system, then step through. Watch the prompt, the PATH list, and which python answers."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(SHELLS).map(([id, item]) => (
              <button key={id} type="button" className={tabClass(shell === id)} onClick={() => setShell(id)}>
                {item.label}
              </button>
            ))}
          </div>
          <StepControls stepper={stepper} total={ACTIVATE_TEXT.length} />
        </div>
      }
    >
      <SetupRoadmap current={3} />
      <div className="space-y-3">
        <Lesson title={`Step ${step + 1}`}>{ACTIVATE_TEXT[step]}</Lesson>
        <div className={`rounded-xl border px-3 py-2 font-mono text-xs ${active ? 'border-teal-400/60 bg-teal-500/10' : 'border-gray-700'}`}>
          <span className="text-[10px] font-sans text-gray-500 mr-2">your prompt</span>
          {active && <span className="text-teal-300 font-bold">(.venv) </span>}
          <span className="text-gray-200">{cfg.prompt}</span>
        </div>
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-3">
          <Terminal title={cfg.label} lines={lines} />
          <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">PATH — searched top to bottom</p>
            {pathList.map((dir, i) => (
              <p
                key={dir}
                className={`font-mono text-[10px] rounded px-1 py-0.5 break-all ${
                  i === 0 ? (active ? 'bg-teal-500/20 text-teal-50' : 'bg-gray-800 text-white') : 'text-gray-500'
                }`}
              >
                {i + 1}. {dir} {i === 0 && <span className="text-[9px] font-sans text-teal-300">← python found here</span>}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 11. Install FastAPI and Uvicorn                                      */
/* ------------------------------------------------------------------ */

const PACKAGES = {
  fastapi: { role: 'The core web framework: routes, validation, docs.', main: true },
  starlette: { role: 'The ASGI toolkit FastAPI is built on. Pulled in automatically.' },
  pydantic: { role: 'Data validation — FastAPI relies on it heavily.', main: true },
  uvicorn: { role: 'The ASGI server that actually runs your app over HTTP.', main: true },
  'python-multipart': { role: 'Parses form data and file uploads.' },
  jinja2: { role: 'HTML templating, if you ever serve pages.' },
  httpx: { role: 'An HTTP client, used for testing your API.' },
  'email-validator': { role: 'Lets Pydantic validate email fields.' },
};

const INSTALL_SETS = {
  all: { cmd: 'pip install "fastapi[all]"', list: ['fastapi', 'starlette', 'pydantic', 'uvicorn', 'python-multipart', 'jinja2', 'httpx', 'email-validator'] },
  min: { cmd: 'pip install fastapi uvicorn pydantic', list: ['fastapi', 'starlette', 'pydantic', 'uvicorn'] },
};

export function InstallVisualizer() {
  const [set, setSet] = useState('all');
  const [picked, setPicked] = useState('uvicorn');
  const list = INSTALL_SETS[set].list;
  const stepper = useStepper(list.length + 2, 600);
  const installedCount = Math.max(0, Math.min(list.length, stepper.index));
  const finished = stepper.index === list.length + 1;

  const choose = (next) => {
    setSet(next);
    stepper.reset();
  };

  const lines = [{ kind: 'cmd', text: INSTALL_SETS[set].cmd, prompt: '(.venv) $' }];
  list.slice(0, installedCount).forEach((name) => lines.push({ kind: 'dim', text: `Collecting ${name}` }));
  if (finished) lines.push({ kind: 'ok', text: `Successfully installed ${list.join(' ')}${set === 'all' ? ' …' : ''}` });

  return (
    <Frame
      title="Install FastAPI and Uvicorn with pip"
      hint="Choose an install style, then press Play (or Next step) to run pip. Click any package to see its job."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(set === 'all')} onClick={() => choose('all')}>
              fastapi[all] — recommended
            </button>
            <button type="button" className={tabClass(set === 'min')} onClick={() => choose('min')}>
              Minimal
            </button>
          </div>
          <StepControls stepper={stepper} total={list.length + 2} />
        </div>
      }
    >
      <SetupRoadmap current={4} />
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1.5 text-center">
          <div className="rounded-xl border border-gray-700 p-2">
            <Globe className="w-4 h-4 mx-auto text-cyan-300" />
            <p className="text-[10px] text-gray-300">Browser / client</p>
          </div>
          <span className="text-[9px] text-gray-500">HTTP →</span>
          <div className={`rounded-xl border p-2 ${picked === 'uvicorn' ? 'border-teal-400/70 bg-teal-500/10' : 'border-gray-700'}`}>
            <Server className="w-4 h-4 mx-auto text-violet-300" />
            <p className="text-[10px] text-white font-semibold">Uvicorn</p>
            <p className="text-[9px] text-gray-400">ASGI server</p>
          </div>
          <span className="text-[9px] text-gray-500">ASGI →</span>
          <div className={`rounded-xl border p-2 ${picked === 'fastapi' ? 'border-teal-400/70 bg-teal-500/10' : 'border-gray-700'}`}>
            <Layers className="w-4 h-4 mx-auto text-teal-300" />
            <p className="text-[10px] text-white font-semibold">FastAPI app</p>
            <p className="text-[9px] text-gray-400">your code</p>
          </div>
        </div>

        <Terminal title="(.venv) terminal" lines={lines} />

        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">.venv site-packages</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {list.map((name, i) => {
              const done = i < installedCount;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setPicked(name)}
                  className={`rounded-lg border px-2 py-1.5 text-left transition-all ${
                    !done ? 'border-gray-800 text-gray-600' : picked === name ? 'border-teal-400/70 bg-teal-500/15 text-white' : 'border-gray-700 bg-gray-900/60 text-gray-200'
                  }`}
                >
                  <Package className="w-3 h-3 inline mr-1" />
                  <span className="font-mono text-[10px]">{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Lesson title={picked}>
          {PACKAGES[picked].role}
          <span className="block text-gray-400 mt-1">
            {set === 'all'
              ? 'The [all] option is a convenience: fastapi, uvicorn, pydantic, plus optional extras such as python-multipart and jinja2 — a comprehensive starting point. The quotes stop your shell from treating [ ] as a pattern.'
              : 'Minimal install: just the three you name (starlette still comes along as a dependency of fastapi). fastapi[all] is generally recommended for starting out.'}
          </span>
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 12. Verify the installation + development tools                      */
/* ------------------------------------------------------------------ */

const PIP_SHOW = [
  { text: 'Name: fastapi', field: 'name' },
  { text: 'Version: 0.115.0', field: 'version' },
  { text: 'Summary: FastAPI framework, high performance, easy to learn, fast to code, ready for production' },
  { text: 'Location: /home/you/fastapi-ml-intro/.venv/lib/python3.12/site-packages', field: 'location' },
  { text: 'Requires: pydantic, starlette, typing-extensions', field: 'requires' },
  { text: '---' },
  { text: 'Name: uvicorn', field: 'name' },
  { text: 'Version: 0.30.6', field: 'version' },
  { text: 'Summary: The lightning-fast ASGI server.' },
  { text: 'Location: /home/you/fastapi-ml-intro/.venv/lib/python3.12/site-packages', field: 'location' },
  { text: 'Requires: click, h11', field: 'requires' },
];

const FIELD_NOTES = {
  name: 'The package pip found.',
  version: 'The installed version. Yours will likely differ — any recent version is fine.',
  location: 'Installed inside .venv — proof that the environment was active when you installed.',
  requires: 'Packages it depends on, installed automatically.',
};

const EDITOR_FEATURES = [
  ['syntax', 'Syntax highlighting'],
  ['complete', 'Code completion'],
  ['debug', 'Debugging'],
  ['terminal', 'Terminal integration'],
];

function highlight(line) {
  const parts = line.split(/("[^"]*"|\b(?:from|import|async|def|return)\b|@app\.get)/g);
  return parts.map((part, i) => {
    if (/^"/.test(part)) return <span key={i} className="text-emerald-300">{part}</span>;
    if (/^(from|import|async|def|return)$/.test(part)) return <span key={i} className="text-violet-300">{part}</span>;
    if (part === '@app.get') return <span key={i} className="text-amber-300">{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

const EDITOR_CODE = ['from fastapi import FastAPI', '', 'app = FastAPI()', '', '@app.get("/")', 'async def read_root():', '    return {"message": "Hello"}'];

export function VerifyToolsVisualizer() {
  const [tab, setTab] = useState('verify');
  const [activated, setActivated] = useState(true);
  const [field, setField] = useState('location');
  const [editor, setEditor] = useState('VS Code');
  const [features, setFeatures] = useState({ syntax: true, complete: false, debug: false, terminal: false });

  const toggle = (id) => setFeatures((current) => ({ ...current, [id]: !current[id] }));

  const lines = [{ kind: 'cmd', text: 'pip show fastapi uvicorn', prompt: activated ? '(.venv) $' : '$' }];
  if (activated) {
    PIP_SHOW.forEach((item) => lines.push({ kind: 'out', text: item.text, highlight: item.field === field }));
  } else {
    lines.push({ kind: 'warn', text: 'WARNING: Package(s) not found: fastapi, uvicorn' });
  }

  return (
    <Frame
      title={tab === 'verify' ? 'Verify: ask pip what it installed' : 'Development tools: a good editor helps'}
      hint={
        tab === 'verify'
          ? 'Click a field to see what it tells you. Then try it with the environment not activated.'
          : 'Turn editor features on and off to see what each one gives you.'
      }
      footer={
        <div className="flex gap-2 flex-wrap">
          <button type="button" className={tabClass(tab === 'verify')} onClick={() => setTab('verify')}>
            pip show
          </button>
          <button type="button" className={tabClass(tab === 'editor')} onClick={() => setTab('editor')}>
            Your editor / IDE
          </button>
        </div>
      }
    >
      <SetupRoadmap current={5} />
      {tab === 'verify' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={tabClass(activated)} onClick={() => setActivated(true)}>
              .venv activated
            </button>
            <button type="button" className={tabClass(!activated)} onClick={() => setActivated(false)}>
              forgot to activate
            </button>
            {activated &&
              Object.keys(FIELD_NOTES).map((id) => (
                <button key={id} type="button" className={tabClass(field === id)} onClick={() => setField(id)}>
                  {id}
                </button>
              ))}
          </div>
          <Terminal title="terminal" lines={lines} />
          <Lesson title={activated ? `${field}` : 'Nothing found'}>
            {activated
              ? `${FIELD_NOTES[field]} If you see details for both packages and no errors, the installation worked.`
              : 'pip looked in global Python, where nothing was installed. Activate the environment (or re-install inside it) and run the command again.'}
          </Lesson>
          <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/5 p-3 text-[11px] text-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-1">
            {['Python ✓', 'Virtual environment ✓', 'FastAPI ✓', 'Uvicorn ✓'].map((item) => (
              <span key={item}>{item}</span>
            ))}
            <span className="col-span-full text-gray-300">Your development environment is ready. Next: your first FastAPI application.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {['VS Code', 'PyCharm', 'Sublime Text'].map((name) => (
              <button key={name} type="button" className={tabClass(editor === name)} onClick={() => setEditor(name)}>
                {name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EDITOR_FEATURES.map(([id, label]) => (
              <label key={id} className="text-[11px] text-gray-300 flex items-center gap-1.5 rounded-lg border border-gray-700 px-2 py-1">
                <input type="checkbox" checked={features[id]} onChange={() => toggle(id)} className="accent-teal-500" />
                {label}
              </label>
            ))}
          </div>
          <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden">
            <div className="px-3 py-1.5 text-[10px] text-gray-400 border-b border-gray-800 bg-gray-900/80 flex items-center gap-1.5">
              <FileCode className="w-3 h-3" /> {editor} — main.py
            </div>
            <div className="py-2 font-mono text-[11px] leading-relaxed relative">
              {EDITOR_CODE.map((line, i) => (
                <div key={i} className="flex gap-3 px-3">
                  <span className="w-5 shrink-0 text-right text-gray-600 relative">
                    {features.debug && i === 6 && <span className="absolute -left-2 top-1.5 w-2 h-2 rounded-full bg-rose-500" />}
                    {i + 1}
                  </span>
                  <span className={`whitespace-pre ${features.syntax ? 'text-gray-200' : 'text-gray-300'} ${features.debug && i === 6 ? 'bg-amber-500/15' : ''}`}>
                    {features.syntax ? highlight(line) : line || ' '}
                    {features.complete && i === 2 && <span className="text-gray-500">  # typing app.</span>}
                  </span>
                </div>
              ))}
              {features.complete && (
                <div className="absolute left-24 top-16 rounded-md border border-gray-600 bg-gray-800 shadow-lg text-[10px] w-40 z-10">
                  {['get', 'post', 'put', 'delete', 'patch'].map((item, i) => (
                    <p key={item} className={`px-2 py-0.5 ${i === 0 ? 'bg-teal-600/40 text-white' : 'text-gray-300'}`}>
                      <span className="text-violet-300">ƒ</span> app.{item}
                    </p>
                  ))}
                </div>
              )}
            </div>
            {features.debug && (
              <div className="border-t border-gray-800 px-3 py-1.5 text-[10px] font-mono text-gray-300">
                <span className="text-rose-300">● paused at line 7</span> · app = &lt;fastapi.applications.FastAPI object&gt;
              </div>
            )}
            {features.terminal && (
              <div className="border-t border-gray-800 bg-black/70 px-3 py-1.5 text-[10px] font-mono">
                <p className="text-gray-300"><span className="text-teal-400">(.venv) $</span> uvicorn main:app --reload</p>
                <p className="text-emerald-300">INFO:     Uvicorn running on http://127.0.0.1:8000</p>
              </div>
            )}
          </div>
          <Lesson title="Not required, but very helpful">
            {features.complete
              ? 'Code completion knows FastAPI’s API from its type hints: type app. and the editor lists get, post, put… '
              : ''}
            {features.debug ? 'Debugging lets you pause on a line and inspect variables. ' : ''}
            {features.terminal ? 'Terminal integration keeps the running server next to your code. ' : ''}
            {!features.complete && !features.debug && !features.terminal
              ? 'An editor or IDE such as VS Code, PyCharm, or Sublime Text adds syntax highlighting, code completion, debugging, and a built-in terminal. Turn them on above.'
              : ''}
          </Lesson>
        </div>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 13. Your first FastAPI application                                    */
/* ------------------------------------------------------------------ */

const MAIN_PY = [
  '# main.py',
  'from fastapi import FastAPI',
  '',
  '# Create an instance of the FastAPI class',
  'app = FastAPI()',
  '',
  '# Define a path operation decorator for the root path ("/")',
  '# This tells FastAPI that the function below handles GET requests to "/"',
  '@app.get("/")',
  'async def read_root():',
  '    """',
  '    This is the root endpoint of the API.',
  '    It returns a simple greeting message.',
  '    """',
  '    return {"message": "Hello from the FastAPI ML Service!"}',
  '',
  '# Define another simple endpoint',
  '@app.get("/status")',
  'async def get_status():',
  '    """',
  '    A simple status endpoint.',
  '    """',
  '    return {"status": "API is running"}',
];

const FIRST_APP_STEPS = [
  { lines: [1], title: 'from fastapi import FastAPI', text: 'Import the FastAPI class. It provides all the core functionality for your API.' },
  { lines: [4], title: 'app = FastAPI()', text: 'Create an instance of FastAPI. This app variable is the main point of interaction for creating API routes — and the thing Uvicorn will run.' },
  { lines: [8], title: '@app.get("/")', text: 'A decorator: it modifies the function right below it. @app.get tells FastAPI that read_root handles requests using the GET method on the path / (the root). Path + method together is called an operation, and the function handling it is the path operation function.' },
  { lines: [9], title: 'async def read_root():', text: 'An asynchronous function. FastAPI is built around asyncio, so async endpoints can handle many requests concurrently. Even without any await inside, async def lets FastAPI run it directly within its event loop.' },
  { lines: [14], title: 'return {…}', text: 'You return a plain Python dictionary. FastAPI automatically converts it into a JSON response for the client — automatic serialization.' },
  { lines: [17, 18, 22], title: '@app.get("/status")', text: 'A second endpoint at /status, also answering GET requests with a small JSON status message.' },
];

export function FirstAppVisualizer() {
  const stepper = useStepper(FIRST_APP_STEPS.length, 2200);
  const step = stepper.index;
  const frame = FIRST_APP_STEPS[step];

  const routes = [];
  if (step >= 2) routes.push({ method: 'GET', path: '/', fn: step >= 3 ? 'read_root' : '…' });
  if (step >= 5) routes.push({ method: 'GET', path: '/status', fn: 'get_status' });

  return (
    <Frame
      title="main.py, line by line"
      hint="Step through the code or click a highlighted line. The panel on the right shows what FastAPI knows after each line."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={FIRST_APP_STEPS.length} />
        </div>
      }
    >
      <SetupRoadmap current={6} />
      <div className="space-y-3">
        <Lesson title={`${step + 1}. ${frame.title}`}>{frame.text}</Lesson>
        <div className="grid md:grid-cols-[1.25fr_1fr] gap-3">
          <CodeLines
            lines={MAIN_PY}
            active={frame.lines}
            title="main.py"
            marks={{ 1: '1', 4: '2', 8: '3', 9: '4', 14: '5', 17: '6' }}
            onLineClick={(line) => {
              const target = FIRST_APP_STEPS.findIndex((item) => item.lines.includes(line));
              if (target >= 0) stepper.pick(target);
            }}
          />
          <div className="space-y-2">
            <div className={`rounded-xl border p-3 ${step >= 1 ? 'border-teal-400/50' : 'border-gray-800 opacity-50'}`}>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">the app object</p>
              <p className="font-mono text-xs text-white mt-0.5">{step >= 1 ? 'app = FastAPI()' : step === 0 ? 'FastAPI class imported' : ''}</p>
              <p className="text-[10px] text-gray-500 mt-2 mb-1">route table</p>
              {routes.length ? (
                routes.map((route) => (
                  <div key={route.path} className="flex items-center gap-2 font-mono text-[11px] py-0.5">
                    <span className="px-1.5 rounded bg-emerald-500/20 text-emerald-200 text-[10px]">{route.method}</span>
                    <span className="text-white">{route.path}</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-cyan-200">{route.fn}()</span>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-600">(no routes yet)</p>
              )}
            </div>
            {step === 2 && (
              <div className="rounded-xl border border-gray-700 p-3 text-[11px]">
                <p className="text-gray-300">
                  <span className="px-1.5 rounded bg-emerald-500/20 text-emerald-200 font-mono">GET</span> +{' '}
                  <span className="font-mono text-white">/</span> = an <strong className="text-white">operation</strong>
                </p>
                <p className="text-gray-400 mt-1">read_root = its path operation function</p>
              </div>
            )}
            {step === 3 && (
              <div className="rounded-xl border border-gray-700 p-3 text-[11px] text-gray-300">
                Runs on the <span className="text-teal-200">event loop</span> — the same loop from the async slides, so one
                slow request does not freeze the others.
              </div>
            )}
            {step >= 4 && (
              <div className="rounded-xl border border-gray-700 p-3 space-y-1.5">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">automatic serialization</p>
                <p className="font-mono text-[10px] text-amber-100">{"Python dict  {'message': 'Hello from the FastAPI ML Service!'}"}</p>
                <p className="text-center text-[10px] text-gray-500">↓ FastAPI</p>
                <p className="font-mono text-[10px] text-emerald-200">{'JSON  {"message":"Hello from the FastAPI ML Service!"}'}</p>
                <p className="font-mono text-[9px] text-gray-500">Content-Type: application/json</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 14. Run it with uvicorn                                              */
/* ------------------------------------------------------------------ */

const CMD_PARTS = [
  { id: 'uvicorn', text: 'uvicorn', note: 'The command that starts the Uvicorn ASGI server you installed. Uvicorn is what actually serves your FastAPI application over HTTP.' },
  { id: 'main', text: 'main', note: 'The Python file to load: main.py (written without the .py).' },
  { id: 'colon', text: ':', note: 'Separates the file from the object inside it.' },
  { id: 'app', text: 'app', note: 'The object inside main.py to run: app = FastAPI().' },
  { id: 'reload', text: ' --reload', note: 'Restart the server automatically whenever a code file changes — no manual stop and start during development. Leave it off in production.' },
];

const STARTUP_LOG = [
  { text: "INFO:     Will watch for changes in directory '/home/you/fastapi-ml-intro'", note: 'Because of --reload, Uvicorn watches your project folder for file changes.' },
  { text: 'INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)', note: 'Your app’s address. 127.0.0.1 means “this computer only”; 8000 is the port. CTRL+C stops the server.' },
  { text: 'INFO:     Started reloader process [12345] using StatReload', note: 'A small supervisor process that watches files and restarts the server when they change.' },
  { text: 'INFO:     Started server process [12346]', note: 'The actual server process that runs your FastAPI app and answers requests.' },
  { text: 'INFO:     Waiting for application startup.', note: 'Startup work runs here. Later in the course, this is where an ML model would be loaded once.' },
  { text: 'INFO:     Application startup complete.', note: 'Ready. Your FastAPI application is now running and accessible at http://127.0.0.1:8000.' },
];

export function RunUvicornVisualizer() {
  const [tab, setTab] = useState('command');
  const [part, setPart] = useState('main');
  const stepper = useStepper(STARTUP_LOG.length, 1200);
  const selected = CMD_PARTS.find((item) => item.id === part);

  return (
    <Frame
      title="uvicorn main:app --reload"
      hint={tab === 'command' ? 'Click each piece of the command.' : 'Step through the startup log line by line.'}
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(tab === 'command')} onClick={() => setTab('command')}>
              Read the command
            </button>
            <button type="button" className={tabClass(tab === 'log')} onClick={() => setTab('log')}>
              Watch it start
            </button>
          </div>
          {tab === 'log' && <StepControls stepper={stepper} total={STARTUP_LOG.length} />}
        </div>
      }
    >
      <SetupRoadmap current={7} />
      {tab === 'command' ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-700 bg-black/80 px-4 py-3 font-mono text-base">
            <span className="text-teal-400 text-sm">(.venv) ~/fastapi-ml-intro $ </span>
            {CMD_PARTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => item.id !== 'colon' && setPart(item.id)}
                className={`rounded px-0.5 ${part === item.id ? 'bg-teal-500/30 text-white' : 'text-gray-200 hover:bg-gray-800'}`}
              >
                {item.text}
              </button>
            ))}
          </div>
          <Lesson title={selected.text.trim()}>{selected.note}</Lesson>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 font-mono text-[11px] space-y-0.5">
              <p className="text-[10px] font-sans uppercase tracking-wider text-gray-500 mb-1">project folder</p>
              <p className="text-gray-400 flex items-center gap-1"><Folder className="w-3 h-3 text-amber-300" /> fastapi-ml-intro</p>
              <p className="pl-4 text-gray-500 flex items-center gap-1"><Folder className="w-3 h-3" /> .venv</p>
              <p className={`pl-4 flex items-center gap-1 rounded ${part === 'main' ? 'bg-teal-500/20 text-white' : 'text-gray-300'}`}>
                <FileCode className="w-3 h-3" /> main.py {part === 'main' && <span className="text-[9px] text-teal-300">← main</span>}
              </p>
            </div>
            <CodeLines
              lines={['from fastapi import FastAPI', '', 'app = FastAPI()', '', '@app.get("/")', 'async def read_root(): ...']}
              active={part === 'app' ? [2] : []}
              title="main.py"
            />
          </div>
          {part === 'reload' && (
            <p className="text-[11px] text-gray-400">See it in action on the next slide: edit the code and the server restarts by itself.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Terminal
            title="(.venv) terminal"
            lines={[
              { kind: 'cmd', text: 'uvicorn main:app --reload', prompt: '(.venv) $' },
              ...STARTUP_LOG.slice(0, stepper.index + 1).map((item, i) => ({
                kind: i === 5 ? 'ok' : 'info',
                text: item.text,
                highlight: i === stepper.index,
              })),
            ]}
          />
          <Lesson title={`Line ${stepper.index + 1}`}>{STARTUP_LOG[stepper.index].note}</Lesson>
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-xl border p-3 transition-all ${stepper.index >= 2 ? 'border-violet-400/50 bg-violet-500/10' : 'border-gray-800 opacity-40'}`}>
              <p className="text-xs font-semibold text-white flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-violet-300" /> Reloader [12345]</p>
              <p className="text-[10px] text-gray-400">watches files, restarts the server</p>
            </div>
            <div className={`rounded-xl border p-3 transition-all ${stepper.index >= 3 ? (stepper.index >= 5 ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-teal-400/50 bg-teal-500/10') : 'border-gray-800 opacity-40'}`}>
              <p className="text-xs font-semibold text-white flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-teal-300" /> Server [12346]</p>
              <p className="text-[10px] text-gray-400">{stepper.index >= 5 ? 'ready on 127.0.0.1:8000' : 'starting…'}</p>
            </div>
          </div>
        </div>
      )}
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 15. Talk to the running app, and see --reload                         */
/* ------------------------------------------------------------------ */

const MESSAGES = ['Hello from the FastAPI ML Service!', 'Hello, now served after an auto-reload!'];

export function BrowserReloadVisualizer() {
  const [url, setUrl] = useState(null);
  const [version, setVersion] = useState(0);
  const [log, setLog] = useState([{ kind: 'ok', text: 'INFO:     Application startup complete.' }]);
  const [serverPid, setServerPid] = useState(12346);
  const [port, setPort] = useState(52431);

  const respond = (path) => {
    if (path === '/') return { status: 200, body: `{"message":"${MESSAGES[version]}"}` };
    if (path === '/status') return { status: 200, body: '{"status":"API is running"}' };
    return { status: 404, body: '{"detail":"Not Found"}' };
  };

  const visit = (path) => {
    const res = respond(path);
    setUrl(path);
    setPort((p) => p + 1);
    setLog((current) => [
      ...current.slice(-6),
      { kind: res.status === 200 ? 'out' : 'warn', text: `INFO:     127.0.0.1:${port} - "GET ${path} HTTP/1.1" ${res.status} ${res.status === 200 ? 'OK' : 'Not Found'}` },
    ]);
  };

  const edit = () => {
    const nextVersion = version === 0 ? 1 : 0;
    const nextProcess = serverPid + 1;
    setVersion(nextVersion);
    setServerPid(nextProcess);
    setUrl(null);
    setLog((current) => [
      ...current.slice(-3),
      { kind: 'warn', text: "WARNING:  StatReload detected changes in 'main.py'. Reloading..." },
      { kind: 'dim', text: 'INFO:     Shutting down' },
      { kind: 'info', text: `INFO:     Started server process [${nextProcess}]` },
      { kind: 'ok', text: 'INFO:     Application startup complete.' },
    ]);
  };

  const res = url ? respond(url) : null;

  return (
    <Frame
      title="Your app is live at http://127.0.0.1:8000"
      hint="Visit each address. Then edit main.py and visit / again — --reload restarts the server for you."
    >
      <SetupRoadmap current={7} />
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-700 bg-gray-900 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800 bg-gray-800/70">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-mono text-[11px] text-gray-200 flex-1 bg-gray-950 rounded px-2 py-1">
              http://127.0.0.1:8000{url ?? ''}
            </span>
          </div>
          <div className="flex gap-1.5 px-3 py-2 border-b border-gray-800">
            {['/', '/status', '/predict-typo'].map((path) => (
              <button key={path} type="button" className={tabClass(url === path)} onClick={() => visit(path)}>
                GET {path}
              </button>
            ))}
          </div>
          <div className="p-3 min-h-[4rem]">
            {res ? (
              <>
                <p className={`text-[10px] font-mono mb-1 ${res.status === 200 ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {res.status} {res.status === 200 ? 'OK' : 'Not Found'} · application/json
                </p>
                <p className="font-mono text-sm text-white break-all">{res.body}</p>
              </>
            ) : (
              <p className="text-[11px] text-gray-500">Click an address above.</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_1.3fr] gap-3">
          <div className="space-y-2">
            <CodeLines
              lines={['@app.get("/")', 'async def read_root():', `    return {"message": "${MESSAGES[version]}"}`]}
              active={[2]}
              title="main.py"
            />
            <button type="button" onClick={edit} className="w-full px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold">
              Edit main.py and save
            </button>
          </div>
          <Terminal title="uvicorn --reload (server log)" lines={log} />
        </div>

        <Lesson title="What you are seeing">
          {!res
            ? 'The server is running. Each visit is a GET request; the terminal logs every one with its status code.'
            : url === '/'
              ? `read_root ran and returned a dict; FastAPI sent it as JSON. ${version === 1 ? 'This is the new message — the reloader restarted the server after your edit, with no manual restart.' : ''}`
              : url === '/status'
                ? 'get_status answered with its status message.'
                : 'No route matches this path, so FastAPI answers 404 with a JSON error. Only the operations you defined exist.'}
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 16. Automatic interactive documentation                              */
/* ------------------------------------------------------------------ */

const DOC_ROUTES = [
  { path: '/', fn: 'read_root', summary: 'Read Root', doc: 'This is the root endpoint of the API. It returns a simple greeting message.', body: '{\n  "message": "Hello from the FastAPI ML Service!"\n}' },
  { path: '/status', fn: 'get_status', summary: 'Get Status', doc: 'A simple status endpoint.', body: '{\n  "status": "API is running"\n}' },
];

const EXTRA_ROUTE = { path: '/model-info', fn: 'model_info', summary: 'Model Info', doc: 'Name and version of the loaded model.', body: '{\n  "model": "iris-classifier",\n  "version": "v1"\n}' };

const DOC_FLOW = [
  { id: 'code', label: 'main.py', sub: 'routes, Pydantic models, docstrings', text: 'It starts with your code: the path operations, their parameters, the data models, and the docstrings.' },
  { id: 'app', label: 'FastAPI instance', sub: 'app = FastAPI()', text: 'The FastAPI instance reads all of that when the app loads — the decorators already registered every route.' },
  { id: 'spec', label: 'OpenAPI spec', sub: '/openapi.json', text: 'From it, FastAPI generates an OpenAPI specification (with JSON Schema for the data). This is the machine-readable description of your API.' },
  { id: 'server', label: 'Uvicorn', sub: 'serves the app', text: 'Uvicorn serves the app — including the spec and the two documentation pages — over HTTP.' },
  { id: 'browser', label: 'Web browser', sub: 'you', text: 'You open a documentation URL in the browser, while the app is running.' },
  { id: 'docs', label: 'Swagger UI  /docs', sub: 'interactive, try it out', text: '/docs renders the spec as Swagger UI: every endpoint, its parameters and responses, and a button to try it right from the browser.' },
  { id: 'redoc', label: 'ReDoc  /redoc', sub: 'clean reference view', text: '/redoc renders the same spec as ReDoc: a clean, hierarchical reference view of your API.' },
];

export function AutoDocsVisualizer() {
  const [tab, setTab] = useState('flow');
  const [extra, setExtra] = useState(false);
  const [open, setOpen] = useState('/');
  const [tried, setTried] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [redocPick, setRedocPick] = useState('/');
  const stepper = useStepper(DOC_FLOW.length, 1600);
  const routes = extra ? [...DOC_ROUTES, EXTRA_ROUTE] : DOC_ROUTES;
  const openRoute = routes.find((route) => route.path === open) || routes[0];
  const redocRoute = routes.find((route) => route.path === redocPick) || routes[0];
  const flowOn = (id) => DOC_FLOW[stepper.index].id === id;

  const spec = `{
  "openapi": "3.1.0",
  "info": { "title": "FastAPI", "version": "0.1.0" },
  "paths": {
${routes.map((route) => `    "${route.path}": { "get": { "summary": "${route.summary}" } }`).join(',\n')}
  }
}`;

  const node = (id) => {
    const item = DOC_FLOW.find((entry) => entry.id === id);
    return (
      <div
        className={`rounded-xl border px-2 py-1.5 text-center transition-all ${
          flowOn(id) ? 'border-teal-300 bg-teal-500/20 shadow-[0_0_12px_rgba(45,212,191,0.3)]' : 'border-gray-700 bg-gray-900/60'
        }`}
      >
        <p className={`text-[10px] font-semibold ${flowOn(id) ? 'text-white' : 'text-gray-300'}`}>{item.label}</p>
        <p className="text-[9px] text-gray-500">{item.sub}</p>
      </div>
    );
  };

  return (
    <Frame
      title="Automatic interactive API documentation"
      hint={
        tab === 'flow'
          ? 'Step through how your code becomes two documentation pages.'
          : tab === 'swagger'
            ? 'Expand an endpoint, press Try it out, then Execute — just like the real /docs page.'
            : 'The same spec, shown as ReDoc. Docstrings become descriptions.'
      }
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button type="button" className={tabClass(tab === 'flow')} onClick={() => setTab('flow')}>
              How it is generated
            </button>
            <button type="button" className={tabClass(tab === 'swagger')} onClick={() => setTab('swagger')}>
              /docs (Swagger UI)
            </button>
            <button type="button" className={tabClass(tab === 'redoc')} onClick={() => setTab('redoc')}>
              /redoc (ReDoc)
            </button>
          </div>
          {tab === 'flow' && <StepControls stepper={stepper} total={DOC_FLOW.length} />}
        </div>
      }
    >
      <SetupRoadmap current={8} />
      <label className="mb-3 text-[11px] text-gray-300 flex items-center gap-1.5">
        <input type="checkbox" checked={extra} onChange={(e) => setExtra(e.target.checked)} className="accent-teal-500" />
        Add <span className="font-mono text-teal-200">@app.get("/model-info")</span> to main.py — and watch the docs update themselves
      </label>

      {tab === 'flow' && (
        <div className="space-y-3">
          <Lesson title={`Step ${stepper.index + 1}: ${DOC_FLOW[stepper.index].label}`}>{DOC_FLOW[stepper.index].text}</Lesson>
          <div className="rounded-xl border border-gray-700 bg-gray-950/50 p-3 space-y-2">
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1">
              {node('code')}
              <span className="text-[9px] text-gray-500 text-center">defines →</span>
              {node('app')}
              <span className="text-[9px] text-gray-500 text-center">generates →</span>
              {node('spec')}
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1">
              {node('server')}
              <span className="text-[9px] text-gray-500 text-center">serves →</span>
              {node('browser')}
              <span className="text-[9px] text-gray-500 text-center">accesses →</span>
              <div className="space-y-1">
                {node('docs')}
                {node('redoc')}
              </div>
            </div>
          </div>
          {stepper.index === 0 && <CodeLines lines={[...routes.flatMap((r) => [`@app.get("${r.path}")`, `async def ${r.fn}(): ...`])]} title="main.py" />}
          {stepper.index >= 2 && stepper.index <= 3 && (
            <pre className="font-mono text-[10px] leading-relaxed text-cyan-100 bg-gray-950 border border-gray-700 rounded-xl p-3 overflow-x-auto">{spec}</pre>
          )}
          {stepper.index >= 4 && (
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className={`rounded-xl border p-2.5 ${flowOn('docs') ? 'border-teal-400/60' : 'border-gray-700'}`}>
                <p className="font-mono text-teal-200">http://127.0.0.1:8000/docs</p>
                <p className="text-gray-400">Swagger UI — explore and try every endpoint.</p>
              </div>
              <div className={`rounded-xl border p-2.5 ${flowOn('redoc') ? 'border-teal-400/60' : 'border-gray-700'}`}>
                <p className="font-mono text-teal-200">http://127.0.0.1:8000/redoc</p>
                <p className="text-gray-400">ReDoc — clean, hierarchical reference.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'swagger' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-300 bg-white text-gray-800 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-200 flex items-baseline gap-2">
              <span className="text-lg font-bold">FastAPI</span>
              <span className="text-[9px] px-1.5 rounded bg-gray-500 text-white">0.1.0</span>
              <span className="text-[9px] px-1.5 rounded bg-emerald-600 text-white">OAS 3.1</span>
              <span className="text-[10px] text-blue-600 ml-auto font-mono">/openapi.json</span>
            </div>
            <div className="p-3 space-y-1.5">
              {routes.map((route) => (
                <div key={route.path} className="rounded border border-blue-300 bg-blue-50">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(route.path);
                      setTried(false);
                      setExecuted(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
                  >
                    <span className="text-[10px] font-bold text-white bg-blue-500 rounded px-2 py-0.5">GET</span>
                    <span className="font-mono text-xs font-semibold">{route.path}</span>
                    <span className="text-[11px] text-gray-600">{route.summary}</span>
                  </button>
                  {open === route.path && (
                    <div className="border-t border-blue-200 bg-white px-3 py-2 space-y-2 text-[11px]">
                      <p className="text-gray-600">{route.doc}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Parameters</span>
                        <button
                          type="button"
                          onClick={() => setTried((v) => !v)}
                          className="text-[10px] px-2 py-0.5 rounded border border-gray-400"
                        >
                          {tried ? 'Cancel' : 'Try it out'}
                        </button>
                      </div>
                      <p className="text-gray-500">No parameters</p>
                      {tried && (
                        <button
                          type="button"
                          onClick={() => setExecuted(true)}
                          className="w-full text-xs font-semibold py-1 rounded bg-blue-600 text-white"
                        >
                          Execute
                        </button>
                      )}
                      {tried && executed && (
                        <div className="space-y-1">
                          <p className="font-semibold">Curl</p>
                          <pre className="bg-gray-800 text-gray-100 rounded p-1.5 text-[10px] whitespace-pre-wrap">{`curl -X 'GET' 'http://127.0.0.1:8000${route.path}' -H 'accept: application/json'`}</pre>
                          <p className="font-semibold">Server response</p>
                          <p className="text-[10px]">Code <span className="font-mono">200</span></p>
                          <pre className="bg-gray-800 text-emerald-200 rounded p-1.5 text-[10px]">{route.body}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Lesson title="Swagger UI">
            Every endpoint is listed with its expected parameters and responses, and you can send a real request from the
            browser. {extra ? 'The new /model-info endpoint appeared without you writing any documentation.' : ''} This is
            a big productivity boost as your API grows.
          </Lesson>
        </div>
      )}

      {tab === 'redoc' && (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-300 bg-white text-gray-800 overflow-hidden grid grid-cols-[9rem_1fr] min-h-[14rem]">
            <div className="bg-gray-100 border-r border-gray-200 py-2">
              {routes.map((route) => (
                <button
                  key={route.path}
                  type="button"
                  onClick={() => setRedocPick(route.path)}
                  className={`w-full text-left px-3 py-1 text-[11px] flex items-center gap-1.5 ${
                    redocPick === route.path ? 'bg-gray-200 font-semibold' : ''
                  }`}
                >
                  <span className="text-[8px] font-bold text-white bg-blue-500 rounded px-1">GET</span>
                  {route.summary}
                </button>
              ))}
            </div>
            <div className="p-4 space-y-2">
              <p className="text-base font-semibold">{redocRoute.summary}</p>
              <p className="text-[11px] text-gray-600">{redocRoute.doc}</p>
              <p className="font-mono text-[11px] bg-gray-100 rounded px-2 py-1">
                <span className="text-blue-600 font-bold">GET</span> {redocRoute.path}
              </p>
              <p className="text-[11px] font-semibold">Responses</p>
              <p className="text-[11px]"><span className="text-emerald-600 font-bold">200</span> Successful Response</p>
              <pre className="bg-gray-800 text-emerald-200 rounded p-2 text-[10px]">{redocRoute.body}</pre>
            </div>
          </div>
          <Lesson title="ReDoc">
            Same specification, different presentation: a clean, hierarchical reference. The title “{redocRoute.summary}” comes
            from the function name {redocRoute.fn}, and the description is its docstring — you never wrote separate docs.
          </Lesson>
        </div>
      )}
    </Frame>
  );
}
