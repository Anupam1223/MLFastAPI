import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStepper, Frame, StepControls, tabClass, Caption } from './VisualKit';

function FlowArrow({ tone = 'teal' }) {
  const color = tone === 'rose' ? 'bg-rose-400' : tone === 'amber' ? 'bg-amber-400' : 'bg-teal-400';
  return (
    <div className="relative h-6 w-full min-w-[3rem]">
      <div className={`absolute left-0 right-2 top-1/2 h-0.5 ${color}`} />
      <motion.span
        className={`absolute top-1/2 -mt-1 h-2 w-2 rounded-full ${color}`}
        animate={{ left: ['0%', '88%'] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

const ENV_PRESETS = {
  dev: { model: './models/dev_v1.joblib', key: 'sk-dev-1111', log: 'DEBUG' },
  test: { model: './models/test_v2.joblib', key: 'sk-test-2222', log: 'INFO' },
  prod: { model: '/data/prod_resnet.joblib', key: 'sk-LIVE-9999', log: 'WARNING' },
};

/* ------------------------------------------------------------------ */
/* Hardcoded file vs a value supplied from outside                        */
/* ------------------------------------------------------------------ */

export function HardcodeVisualizer() {
  const [mode, setMode] = useState('hardcoded');
  const [env, setEnv] = useState('dev');
  const current = ENV_PRESETS[env];
  const hardcoded = mode === 'hardcoded';
  return (
    <Frame
      title="Same file, or a value from outside"
      hint="Switch the mode, then change dev, test, and prod."
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" className={tabClass(hardcoded)} onClick={() => setMode('hardcoded')}>hardcoded</button>
        <button type="button" className={tabClass(!hardcoded)} onClick={() => setMode('external')}>from outside</button>
        <span className="mx-1 text-gray-700">|</span>
        {['dev', 'test', 'prod'].map((name) => (
          <button key={name} type="button" className={tabClass(env === name)} onClick={() => setEnv(name)}>{name}</button>
        ))}
      </div>
      <div className="grid items-center gap-3 md:grid-cols-[1fr_4.5rem_1.3fr]">
        <div className={`rounded-2xl border p-3 ${hardcoded ? 'border-gray-800 opacity-50' : 'border-teal-400/70'}`}>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">{env} environment</p>
          <p className="mt-2 truncate font-mono text-[11px] text-emerald-200">MODEL={current.model}</p>
          <p className="truncate font-mono text-[11px] text-amber-200">KEY={current.key}</p>
          <p className="font-mono text-[11px] text-sky-200">LOG={current.log}</p>
        </div>
        <div className="px-1">
          <FlowArrow tone={hardcoded ? 'rose' : 'teal'} />
          <p className={`mt-1 text-center text-[10px] ${hardcoded ? 'text-rose-300' : 'text-teal-200'}`}>
            {hardcoded ? 'edit the file' : 'injected'}
          </p>
        </div>
        <div className={`rounded-2xl border p-3 ${hardcoded ? 'border-rose-400/70 bg-rose-500/5' : 'border-gray-700'}`}>
          <div className="mb-2 flex items-center justify-between">
            <p className="font-mono text-[11px] text-white">main.py</p>
            <p className={`text-[10px] ${hardcoded ? 'text-rose-200' : 'text-emerald-200'}`}>
              {hardcoded ? 'key is in git' : 'file stays clean'}
            </p>
          </div>
          {hardcoded ? (
            <div className="space-y-1 font-mono text-[11px]">
              <p className="rounded bg-rose-500/10 px-2 py-1 text-rose-100">MODEL_PATH = "{current.model}"</p>
              <p className="rounded bg-rose-500/10 px-2 py-1 text-amber-100">API_KEY = "{current.key}"</p>
              <p className="rounded bg-rose-500/10 px-2 py-1 text-sky-100">LOG_LEVEL = "{current.log}"</p>
            </div>
          ) : (
            <div className="space-y-1 font-mono text-[11px] text-teal-100">
              <p className="rounded bg-gray-900 px-2 py-1">settings.model_path</p>
              <p className="rounded bg-gray-900 px-2 py-1">settings.external_api_key</p>
              <p className="rounded bg-gray-900 px-2 py-1">settings.log_level</p>
            </div>
          )}
        </div>
      </div>
      <p className={`mt-3 text-[12px] ${hardcoded ? 'text-rose-200' : 'text-emerald-200'}`}>
        {hardcoded
          ? `${env}: change the file, retest, redeploy.`
          : `${env}: same file. Only the outside values changed.`}
      </p>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* os.environ.get                                                         */
/* ------------------------------------------------------------------ */

export function EnvGetVisualizer() {
  const [modelOn, setModelOn] = useState(true);
  const [keyOn, setKeyOn] = useState(false);
  const model = modelOn ? '"/srv/models/xgboost_v3.joblib"' : '"./models/default_model.joblib"';
  const key = keyOn ? '"sk-prod-89f2a1"' : 'None';
  return (
    <Frame title="os.environ.get" hint="Turn each name on or off.">
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={tabClass(modelOn)} onClick={() => setModelOn((v) => !v)}>
          MODEL_PATH {modelOn ? 'set' : 'unset'}
        </button>
        <button type="button" className={tabClass(keyOn)} onClick={() => setKeyOn((v) => !v)}>
          EXTERNAL_API_KEY {keyOn ? 'set' : 'unset'}
        </button>
      </div>
      <div className="space-y-3">
        <LookupRow
          name="MODEL_PATH"
          envValue={modelOn ? '"/srv/models/xgboost_v3.joblib"' : null}
          resultLabel="model_path"
          result={model}
          ok={modelOn}
          miss="default used"
        />
        <LookupRow
          name="EXTERNAL_API_KEY"
          envValue={keyOn ? '"sk-prod-89f2a1"' : null}
          resultLabel="api_key"
          result={key}
          ok={keyOn}
          miss="None"
        />
      </div>
      <div className="mt-3 rounded-xl border border-gray-800 bg-black/40 px-3 py-2 font-mono text-[11px]">
        {!keyOn && <p className="text-amber-200">Warning: EXTERNAL_API_KEY is not set.</p>}
        <p className="text-gray-200">Using model path: <span className="text-teal-200">{model.replace(/"/g, '')}</span></p>
      </div>
    </Frame>
  );
}

function LookupRow({ name, envValue, resultLabel, result, ok, miss }) {
  return (
    <div className="grid items-center gap-2 rounded-2xl border border-gray-800 bg-gray-950/70 p-3 md:grid-cols-[1fr_5.5rem_1fr]">
      <div>
        <p className="font-mono text-[11px] text-white">{name}</p>
        <p className={`mt-1 font-mono text-[11px] ${ok ? 'text-teal-200' : 'text-gray-500'}`}>{envValue || 'not in the OS'}</p>
      </div>
      <div>
        <FlowArrow tone={ok ? 'teal' : 'amber'} />
        <p className={`text-center text-[10px] ${ok ? 'text-teal-300' : 'text-amber-200'}`}>{ok ? 'from OS' : miss}</p>
      </div>
      <div>
        <p className="font-mono text-[11px] text-gray-400">{resultLabel} =</p>
        <p className={`font-mono text-[12px] ${result === 'None' ? 'text-rose-200' : 'text-emerald-200'}`}>{result}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Strings only                                                           */
/* ------------------------------------------------------------------ */

const TRAPS = [
  {
    name: 'DEBUG_MODE',
    raw: '"false"',
    expr: 'if os.environ.get("DEBUG_MODE"):',
    result: 'True. A non-empty string is truthy.',
    fix: 'value.lower() == "true"',
  },
  {
    name: 'PORT',
    raw: '"8080"',
    expr: 'port + 1',
    result: 'TypeError: str + int',
    fix: 'int(os.environ.get("PORT"))',
  },
  {
    name: 'MAX_WORKERS',
    raw: '"four"',
    expr: 'int(os.environ.get("MAX_WORKERS"))',
    result: "ValueError: 'four'",
    fix: 'needs a real check',
  },
];

export function StringTrapVisualizer() {
  const [index, setIndex] = useState(0);
  const item = TRAPS[index];
  return (
    <Frame title="Every value arrives as text" hint="Pick a name. The OS never stored a bool or an int.">
      <div className="mb-3 flex flex-wrap gap-2">
        {TRAPS.map((trap, i) => (
          <button key={trap.name} type="button" className={tabClass(i === index)} onClick={() => setIndex(i)}>
            {trap.name}={trap.raw}
          </button>
        ))}
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-800 p-3">
          <p className="text-[10px] uppercase text-gray-500">OS</p>
          <p className="mt-2 font-mono text-[12px] text-emerald-200">{item.name}={item.raw}</p>
          <p className="mt-2 text-[11px] text-amber-200">type str</p>
        </div>
        <div className="rounded-2xl border border-rose-400/50 bg-rose-500/5 p-3">
          <p className="text-[10px] uppercase text-rose-200">used raw</p>
          <p className="mt-2 font-mono text-[11px] text-white">{item.expr}</p>
          <p className="mt-2 text-[11px] text-rose-200">{item.result}</p>
        </div>
        <div className="rounded-2xl border border-gray-800 p-3">
          <p className="text-[10px] uppercase text-gray-500">by hand</p>
          <p className="mt-2 font-mono text-[11px] text-amber-100">{item.fix}</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Click a field                                                          */
/* ------------------------------------------------------------------ */

const FIELDS = [
  { id: 'app_name', title: 'app_name: str = "ML Prediction Service"', badge: 'default', env: 'APP_NAME', behavior: 'Uses the default unless the environment overrides it.' },
  { id: 'log_level', title: 'log_level: str = "INFO"', badge: 'default', env: 'LOG_LEVEL', behavior: 'Stays INFO until LOG_LEVEL is set.' },
  { id: 'model_path', title: 'model_path: str', badge: 'required', env: 'MODEL_PATH', behavior: 'No default. Missing MODEL_PATH stops startup.' },
  { id: 'database_url', title: 'database_url: Optional[str] = None', badge: 'optional', env: 'DATABASE_URL', behavior: 'Missing means None.' },
  { id: 'external_api_key', title: 'external_api_key: str', badge: 'secret', env: 'EXTERNAL_API_KEY', behavior: 'Required. It has to arrive from outside.' },
  { id: 'model_config', title: "env_file='.env', case_sensitive=False", badge: 'config', env: '.env + any case', behavior: 'Also reads .env. MODEL_PATH matches model_path.' },
];

const BADGE = {
  default: 'text-sky-200 border-sky-400/40',
  required: 'text-amber-200 border-amber-400/40',
  optional: 'text-purple-200 border-purple-400/40',
  secret: 'text-rose-200 border-rose-400/40',
  config: 'text-teal-200 border-teal-400/40',
};

export function SettingsLoadVisualizer() {
  const [active, setActive] = useState('model_path');
  const field = FIELDS.find((item) => item.id === active);
  return (
    <Frame title="AppSettings" hint="Click a line.">
      <div className="grid gap-3 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-1.5">
          {FIELDS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2 py-2 text-left font-mono text-[11px] ${active === item.id ? 'border-teal-400 bg-teal-500/10 text-white' : 'border-gray-800 text-gray-300'}`}
            >
              <span className="truncate">{item.title}</span>
              <span className={`shrink-0 rounded-full border px-1.5 text-[10px] ${BADGE[item.badge]}`}>{item.badge}</span>
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-teal-400/40 p-3">
          <p className="font-mono text-[12px] text-emerald-200">{field.env}</p>
          <p className="mt-3 text-[12px] text-gray-200">{field.behavior}</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Startup gate                                                           */
/* ------------------------------------------------------------------ */

export function StartupGateVisualizer() {
  const [hasModel, setHasModel] = useState(true);
  const [hasKey, setHasKey] = useState(true);
  const [customLog, setCustomLog] = useState(false);
  const ok = hasModel && hasKey;
  const missing = [!hasModel && 'MODEL_PATH', !hasKey && 'EXTERNAL_API_KEY'].filter(Boolean);
  return (
    <Frame title="settings = AppSettings()" hint="Uncheck a required name.">
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={tabClass(hasModel)} onClick={() => setHasModel((v) => !v)}>MODEL_PATH</button>
        <button type="button" className={tabClass(hasKey)} onClick={() => setHasKey((v) => !v)}>EXTERNAL_API_KEY</button>
        <button type="button" className={tabClass(customLog)} onClick={() => setCustomLog((v) => !v)}>LOG_LEVEL=DEBUG</button>
      </div>
      <div className="grid items-center gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-gray-800 p-3 font-mono text-[11px]">
          <p className={hasModel ? 'text-emerald-200' : 'text-rose-300 line-through'}>MODEL_PATH=/models/v2.pkl</p>
          <p className={hasKey ? 'text-amber-200' : 'text-rose-300 line-through'}>EXTERNAL_API_KEY=sk-98a7</p>
          <p className="text-sky-200">LOG_LEVEL={customLog ? 'DEBUG' : 'INFO'}</p>
        </div>
        <div className={`rounded-2xl border px-3 py-4 text-center ${ok ? 'border-teal-400' : 'border-rose-400'}`}>
          <p className="font-mono text-[12px] text-white">AppSettings()</p>
          <p className={`mt-2 text-[12px] ${ok ? 'text-emerald-200' : 'text-rose-200'}`}>{ok ? 'valid' : 'ValidationError'}</p>
        </div>
        <div className={`rounded-xl border p-3 font-mono text-[11px] ${ok ? 'border-emerald-400/40' : 'border-rose-400/50'}`}>
          {ok ? (
            <>
              <p className="text-emerald-200">app starts</p>
              <p className="text-teal-100">model /models/v2.pkl</p>
              <p className="text-sky-200">log {customLog ? 'DEBUG' : 'INFO'}</p>
              <p className="text-amber-200">key sk-9…</p>
            </>
          ) : (
            <>
              <p className="text-rose-200">startup stops</p>
              <p className="text-amber-200">missing {missing.join(', ')}</p>
            </>
          )}
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Depends                                                                */
/* ------------------------------------------------------------------ */

export function SettingsInjectVisualizer() {
  const [who, setWho] = useState('info');
  const info = who === 'info';
  return (
    <Frame title="Depends(get_settings)" hint="Call /info or load_model.">
      <div className="mb-3 flex gap-2">
        <button type="button" className={tabClass(info)} onClick={() => setWho('info')}>GET /info</button>
        <button type="button" className={tabClass(!info)} onClick={() => setWho('model')}>load_model()</button>
      </div>
      <div className="grid items-center gap-3 md:grid-cols-[1fr_4rem_1fr]">
        <div className="rounded-2xl border border-teal-400/50 p-3">
          <p className="font-mono text-[11px] text-amber-200">settings = AppSettings()</p>
          <div className="my-2"><FlowArrow /></div>
          <p className="font-mono text-[11px] text-teal-100">get_settings()</p>
        </div>
        <FlowArrow />
        <div className="space-y-2">
          <Consumer on={info} title='GET /info' />
          <Consumer on={!info} title="load_model()" />
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-gray-800 bg-black/40 px-3 py-2 font-mono text-[11px]">
        {info ? (
          <p className="text-emerald-200">{'{ app_name, model_path: "/data/prod.pkl", log_level: "INFO" }'}</p>
        ) : (
          <p className="text-amber-200">Loading model from: /data/prod.pkl</p>
        )}
      </div>
    </Frame>
  );
}

function Consumer({ on, title }) {
  return (
    <div className={`rounded-xl border px-3 py-2 ${on ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800 opacity-45'}`}>
      <p className="font-mono text-[12px] text-white">{title}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* gitignore + vaults                                                     */
/* ------------------------------------------------------------------ */

const VAULTS = {
  cloud: ['AWS Secrets Manager', 'Google Secret Manager', 'Azure Key Vault'],
  tool: ['HashiCorp Vault'],
  platform: ['Kubernetes Secrets', 'Docker Secrets'],
};

export function GitignoreVisualizer() {
  const [shield, setShield] = useState(true);
  const [vault, setVault] = useState('cloud');
  return (
    <Frame title=".env and the commit" hint="Turn the shield off to see the key land in git.">
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={tabClass(shield)} onClick={() => setShield((v) => !v)}>
          {shield ? '.gitignore on' : '.gitignore off'}
        </button>
        {Object.keys(VAULTS).map((name) => (
          <button key={name} type="button" className={tabClass(vault === name)} onClick={() => setVault(name)}>{name}</button>
        ))}
      </div>
      <div className="grid items-center gap-2 md:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border border-gray-800 p-3 font-mono text-[12px]">
          <p className="text-sky-200">main.py</p>
          <p className="text-amber-200">.env</p>
          <p className="text-gray-500">__pycache__/</p>
        </div>
        <div className={`rounded-full border px-3 py-2 text-center text-[11px] ${shield ? 'border-emerald-400 text-emerald-200' : 'border-rose-400 text-rose-200'}`}>
          {shield ? 'blocks .env' : 'no filter'}
        </div>
        <div className={`rounded-xl border p-3 font-mono text-[12px] ${shield ? 'border-emerald-400/50' : 'border-rose-400'}`}>
          <p className="text-sky-200">main.py</p>
          {shield ? <p className="text-emerald-200">.env stayed out</p> : <p className="text-rose-200">.env committed</p>}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {VAULTS[vault].map((name) => (
          <span key={name} className="rounded-lg border border-teal-400/40 px-2 py-1 text-[11px] text-teal-100">{name}</span>
        ))}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Runtime pipeline                                                       */
/* ------------------------------------------------------------------ */

const PIPE = [
  { zone: 'runtime', title: 'Secrets manager', detail: 'Holds the key outside the repo.' },
  { zone: 'runtime', title: 'Environment', detail: 'MODEL_PATH and EXTERNAL_API_KEY land here.' },
  { zone: 'runtime', title: 'FastAPI process', detail: 'The process starts and reads that environment.' },
  { zone: 'app', title: 'AppSettings', detail: 'Types are checked. A missing required field stops startup.' },
  { zone: 'app', title: 'Routes and load_model', detail: 'Depends(get_settings) hands them the same object.' },
];

export function SecretFlowVisualizer() {
  const stepper = useStepper(PIPE.length, 1500);
  const step = stepper.index;
  const item = PIPE[step];
  return (
    <Frame
      title="From the vault to the route"
      hint="Click a box, or step through."
      footer={<StepControls stepper={stepper} total={PIPE.length} />}
    >
      <Caption text={item.detail} />
      <div className={`mb-2 rounded-2xl border p-3 ${step <= 2 ? 'border-teal-400/60' : 'border-gray-800'}`}>
        <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-500">runtime</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {PIPE.slice(0, 3).map((node, i) => (
            <PipeNode key={node.title} title={node.title} on={step === i} onClick={() => stepper.pick(i)} />
          ))}
        </div>
      </div>
      <div className="mb-2 text-center text-[11px] text-teal-300">↓</div>
      <div className={`rounded-2xl border p-3 ${step >= 3 ? 'border-teal-400/60' : 'border-gray-800'}`}>
        <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-500">application</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {PIPE.slice(3).map((node, i) => (
            <PipeNode key={node.title} title={node.title} on={step === i + 3} onClick={() => stepper.pick(i + 3)} />
          ))}
        </div>
      </div>
    </Frame>
  );
}

function PipeNode({ title, on, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-3 text-left ${on ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800'}`}>
      <p className="text-[12px] text-white">{title}</p>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Log pipeline                                                           */
/* ------------------------------------------------------------------ */

const LOG_NOTES = {
  logger: 'Your code calls this object. The name app.predict follows the module.',
  filter: 'The level floor decides whether the record continues.',
  handler: 'The handler chooses the destination: the terminal or a file.',
  formatter: 'The formatter adds the time and the level onto the message.',
};

export function LogPartsVisualizer() {
  const [call, setCall] = useState('info');
  const [floor, setFloor] = useState('INFO');
  const [dest, setDest] = useState('stream');
  const [focus, setFocus] = useState('logger');
  const level = call === 'info' ? 'INFO' : 'DEBUG';
  const message = call === 'info' ? 'model loaded' : 'weights shape';
  const passes = call === 'info' || floor === 'DEBUG';
  const line = `12:26  ${level}  app.predict  ${message}`;
  const note = focus === 'filter'
    ? (passes ? `${level} is allowed through a ${floor} floor.` : `${level} is below ${floor}, so the record stops.`)
    : LOG_NOTES[focus];

  return (
    <Frame title="Logger, handler, formatter, filter" hint="Send INFO and DEBUG. Change the floor, then switch the destination.">
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={tabClass(call === 'info')} onClick={() => { setCall('info'); setFocus('logger'); }}>
          logger.info
        </button>
        <button type="button" className={tabClass(call === 'debug')} onClick={() => { setCall('debug'); setFocus('filter'); }}>
          logger.debug
        </button>
        <span className="mx-1 text-gray-700">|</span>
        <button type="button" className={tabClass(floor === 'INFO')} onClick={() => { setFloor('INFO'); setFocus('filter'); }}>floor INFO</button>
        <button type="button" className={tabClass(floor === 'DEBUG')} onClick={() => { setFloor('DEBUG'); setFocus('filter'); }}>floor DEBUG</button>
        <span className="mx-1 text-gray-700">|</span>
        <button type="button" className={tabClass(dest === 'stream')} onClick={() => { setDest('stream'); setFocus('handler'); }}>stdout</button>
        <button type="button" className={tabClass(dest === 'file')} onClick={() => { setDest('file'); setFocus('handler'); }}>app.log</button>
      </div>

      <div className="grid items-stretch gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
        <LogNode
          kicker="Logger"
          on={focus === 'logger'}
          onClick={() => setFocus('logger')}
          body={`logger.${call}("${message}")`}
          foot="app.predict"
        />
        <Pipe on={passes || focus === 'logger'} />
        <LogNode
          kicker="Filter"
          on={focus === 'filter'}
          blocked={!passes}
          onClick={() => setFocus('filter')}
          body={`level >= ${floor}`}
          foot={passes ? 'passes' : 'dropped'}
        />
        <Pipe on={passes} />
        <LogNode
          kicker="Handler"
          on={focus === 'handler'}
          dim={!passes}
          onClick={() => setFocus('handler')}
          body={dest === 'stream' ? 'StreamHandler' : 'FileHandler'}
          foot={dest === 'stream' ? 'stdout' : 'app.log'}
        />
        <Pipe on={passes} />
        <LogNode
          kicker="Formatter"
          on={focus === 'formatter'}
          dim={!passes}
          onClick={() => setFocus('formatter')}
          body={passes ? '12:26 + level' : '—'}
          foot={passes ? message : 'no line'}
        />
      </div>

      <p className="mt-3 text-[12px] text-gray-300">{note}</p>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-black/40 px-3 py-2 font-mono text-[11px]">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">Uvicorn access log</p>
          <p className="text-sky-200">INFO  127.0.0.1  "POST /predict"  200</p>
        </div>
        <div className={`rounded-xl border px-3 py-2 font-mono text-[11px] ${passes ? 'border-teal-400/50 bg-teal-500/5' : 'border-rose-400/40 bg-rose-500/5'}`}>
          <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">
            {dest === 'stream' ? 'stdout' : 'app.log'}
          </p>
          {passes ? (
            <p className={level === 'INFO' ? 'text-emerald-200' : 'text-amber-200'}>{line}</p>
          ) : (
            <p className="text-rose-200">nothing written</p>
          )}
        </div>
      </div>
    </Frame>
  );
}

function LogNode({ kicker, body, foot, on, blocked, dim, onClick }) {
  const border = blocked ? 'border-rose-400 bg-rose-500/10' : on ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800';
  return (
    <button type="button" onClick={onClick} className={`rounded-xl border px-2.5 py-2 text-left ${border} ${dim ? 'opacity-40' : ''}`}>
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{kicker}</p>
      <p className="mt-1 font-mono text-[11px] text-white">{body}</p>
      <p className={`mt-1 text-[11px] ${blocked ? 'text-rose-200' : 'text-teal-200'}`}>{foot}</p>
    </button>
  );
}

function Pipe({ on }) {
  return (
    <div className="hidden items-center md:flex">
      <FlowArrow tone={on ? 'teal' : 'rose'} />
    </div>
  );
}

const CALLS = {
  root: {
    label: 'GET /',
    code: 'logger.info("Root endpoint was accessed.")',
    lines: ['Root endpoint was accessed.'],
  },
  ok: {
    label: 'POST /predict',
    code: 'logger.info(... keys)  then  logger.info(prediction_result)',
    lines: [
      "Prediction request received with data keys: ['feature1', 'api_key']",
      "Prediction successful: {'prediction': 'example_class', 'probability': 0.95}",
    ],
  },
  fail: {
    label: 'POST /predict raises',
    code: 'logger.error(..., exc_info=True)',
    lines: ['Prediction request received with data keys: [\'feature1\']', 'Error during prediction: bad input shape'],
    trace: true,
  },
  debug: {
    label: 'logger.debug',
    code: 'logger.debug("checking shape")',
    lines: [],
  },
};

export function BasicLogVisualizer() {
  const [route, setRoute] = useState('root');
  const [uvicorn, setUvicorn] = useState(false);
  const [force, setForce] = useState(false);
  const applied = !uvicorn || force;
  const call = CALLS[route];
  const stamp = (message, level) => (applied ? `12:26:01 - main - ${level} - ${message}` : `INFO:     ${message}`);

  return (
    <Frame
      title="basicConfig, then the route writes a line"
      hint="Open a route. Then give Uvicorn the handler and watch basicConfig skip the format."
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.entries(CALLS).map(([id, item]) => (
          <button key={id} type="button" className={tabClass(route === id)} onClick={() => setRoute(id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={tabClass(uvicorn)} onClick={() => setUvicorn((value) => !value)}>
          {uvicorn ? 'Uvicorn handler already attached' : 'No handler yet'}
        </button>
        <button type="button" className={tabClass(force)} onClick={() => setForce((value) => !value)}>
          {force ? 'force=True' : 'force=False'}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">logger = getLogger(__name__)</p>
          <p className="mt-2 font-mono text-[12px] text-white">name = main</p>
          <p className="mt-3 font-mono text-[11px] text-teal-100">{call.code}</p>
        </div>
        <div className={`rounded-2xl border p-3 ${applied ? 'border-teal-400/60' : 'border-amber-400/60'}`}>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">logging.basicConfig</p>
          <p className="mt-2 font-mono text-[12px] text-white">level = INFO</p>
          <p className={`mt-1 font-mono text-[11px] ${applied ? 'text-teal-100' : 'text-gray-500 line-through'}`}>
            %(asctime)s - %(name)s - %(levelname)s - %(message)s
          </p>
          <p className={`mt-2 text-[12px] ${applied ? 'text-emerald-200' : 'text-amber-200'}`}>
            {applied
              ? (uvicorn ? 'force=True replaced the handler. This format is used.' : 'This format is used.')
              : 'Uvicorn already had a handler. basicConfig returned and left it alone.'}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-gray-800 bg-black/50 px-3 py-3 font-mono text-[11px]">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-500">Terminal</p>
        {call.lines.length === 0 && (
          <p className="text-rose-200">DEBUG is below INFO, so nothing is written.</p>
        )}
        {call.lines.map((message, index) => {
          const level = call.trace && index === call.lines.length - 1 ? 'ERROR' : 'INFO';
          return (
            <p key={message} className={`leading-relaxed ${level === 'ERROR' ? 'text-rose-200' : 'text-emerald-200'}`}>
              {stamp(message, level)}
            </p>
          );
        })}
        {call.trace && (
          <div className="mt-2 border-l border-rose-400/70 pl-2 text-rose-300/80">
            <p>Traceback (most recent call last):</p>
            <p>File &quot;main.py&quot;, line 18, in predict</p>
            <p>ValueError: bad input shape</p>
          </div>
        )}
      </div>
    </Frame>
  );
}

const WHAT_CASES = {
  request: {
    label: 'Request',
    title: 'Request information',
    note: 'Keep the route, the request id, and the parameters. Leave out the password and the API key.',
    facts: [
      { text: 'POST /predict', keep: true },
      { text: 'request_id = a1f3', keep: true },
      { text: 'feature1 = 10.5', keep: true },
      { text: 'password = hunter2', keep: false },
      { text: 'api_key = sk-live', keep: false },
    ],
    line: 'INFO  POST /predict  request_id=a1f3  feature1=10.5',
  },
  inference: {
    label: 'ML inference',
    title: 'ML inference',
    note: 'A large input can be a count. The prediction and the confidence stay.',
    facts: [
      { text: 'feature1 … feature4', keep: true },
      { text: 'prediction = setosa', keep: true },
      { text: 'confidence = 0.97', keep: true },
    ],
    line: 'INFO  features=4  prediction=setosa  confidence=0.97',
  },
  external: {
    label: 'External call',
    title: 'External interactions',
    note: 'A call to a database, another API, or a file is part of the record.',
    facts: [
      { text: 'GET model-store /v2.pkl', keep: true },
      { text: 'status 200', keep: true },
      { text: '18 ms', keep: true },
    ],
    line: 'INFO  GET model-store /v2.pkl  200  18ms',
  },
  error: {
    label: 'Error',
    title: 'Errors and exceptions',
    note: 'The error keeps the route and the traceback.',
    facts: [
      { text: 'POST /predict', keep: true },
      { text: 'ValueError: bad input shape', keep: true },
      { text: 'stack from predict', keep: true },
    ],
    line: 'ERROR  POST /predict  ValueError: bad input shape',
    trace: ['File "main.py", line 18, in predict', 'ValueError: bad input shape'],
  },
  state: {
    label: 'State change',
    title: 'Significant state changes',
    note: 'Loading the model, or swapping it, is an event worth a line.',
    facts: [
      { text: 'model was not loaded', keep: true },
      { text: 'loaded /models/v2.pkl', keep: true },
    ],
    line: 'INFO  model loaded  path=/models/v2.pkl',
  },
};

export function WhatToLogVisualizer() {
  const [active, setActive] = useState('request');
  const item = WHAT_CASES[active];
  return (
    <Frame title="What gets a log line" hint="Pick a case. The line underneath is what you keep.">
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.entries(WHAT_CASES).map(([id, entry]) => (
          <button key={id} type="button" className={tabClass(active === id)} onClick={() => setActive(id)}>
            {entry.label}
          </button>
        ))}
      </div>
      <p className="mb-3 text-[12px] text-gray-300">{item.note}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {item.facts.map((fact) => (
          <div
            key={fact.text}
            className={`rounded-xl border px-3 py-2 font-mono text-[12px] ${fact.keep ? 'border-teal-400/50 text-teal-100' : 'border-rose-400/50 text-rose-200 line-through'}`}
          >
            {fact.text}
            <span className={`ml-2 text-[10px] ${fact.keep ? 'text-emerald-300' : 'text-rose-300'}`}>
              {fact.keep ? 'logged' : 'left out'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-gray-800 bg-black/50 px-3 py-2 font-mono text-[12px] text-emerald-200">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">Log line</p>
        <p>{item.line}</p>
        {item.trace && item.trace.map((row) => (
          <p key={row} className="text-rose-200">{row}</p>
        ))}
      </div>
    </Frame>
  );
}

const JSON_BASE = [
  ['asctime', '2026-10-02 13:28:40,512'],
  ['levelname', 'INFO'],
  ['name', '__main__'],
  ['message', 'Status check performed'],
];

const JSON_EXTRA = [
  ['service_version', '1.2.3'],
  ['uptime_seconds', '12345'],
];

export function JsonLogVisualizer() {
  const [extraOn, setExtraOn] = useState(true);
  const [guard, setGuard] = useState(true);
  const fields = extraOn ? [...JSON_BASE, ...JSON_EXTRA] : JSON_BASE;
  const indexed = [
    ['@timestamp', '2026-10-02T13:28:40'],
    ['level', 'INFO'],
    ['logger.name', '__main__'],
    ['message', 'Status check performed'],
    ...(extraOn ? JSON_EXTRA : []),
  ];
  const copies = guard ? 1 : 2;

  return (
    <Frame
      title="One JSON object, then indexed fields"
      hint="Turn extra on to add the two custom fields. Turn the guard off to see a second handler."
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" className={tabClass(extraOn)} onClick={() => setExtraOn((value) => !value)}>
          {extraOn ? 'extra on' : 'extra off'}
        </button>
        <button type="button" className={tabClass(guard)} onClick={() => setGuard((value) => !value)}>
          {guard ? 'hasHandlers guard on' : 'hasHandlers guard off'}
        </button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">
            StreamHandler console output ({copies} handler{copies === 1 ? '' : 's'} attached)
          </p>
          <div className="mt-3 space-y-3">
            {Array.from({ length: copies }).map((_, copy) => (
              <pre key={copy} className="overflow-x-auto rounded-xl bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
{`{
${fields.map(([key, value]) => `  "${key}": ${/^\d+$/.test(value) ? value : `"${value}"`}`).join(',\n')}
}`}
              </pre>
            ))}
          </div>
          <p className={`mt-3 text-[11px] ${guard ? 'text-emerald-300' : 'text-amber-200'}`}>
            {guard
              ? 'if not log.hasHandlers() keeps a single handler, even after the module reloads.'
              : 'The guard is off. A reload called addHandler again, so the same JSON is written twice.'}
          </p>
        </div>
        <div className="rounded-2xl border border-teal-400/50 bg-gray-950/80 p-3 shadow-[0_0_28px_rgba(45,212,191,0.18)]">
          <p className="text-[10px] uppercase tracking-wider text-teal-200">Log aggregator (ELK / Splunk / Datadog)</p>
          <p className="mt-2 text-[12px] text-emerald-300">Automatically parsed and indexed</p>
          <div className="mt-3 space-y-2">
            {indexed.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-black/30 px-3 py-2 font-mono text-[11px]">
                <span className={JSON_EXTRA.some(([extraKey]) => extraKey === key) ? 'text-amber-200' : 'text-gray-400'}>{key}</span>
                <span className="text-teal-100">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

const REQUESTS = [
  { id: 'req-8f2a', label: 'req-8f2a (Client A)', badge: 'border-indigo-400/50 bg-indigo-500/20 text-indigo-100' },
  { id: 'req-3c91', label: 'req-3c91 (Client B)', badge: 'border-rose-400/50 bg-rose-500/15 text-rose-100' },
  { id: 'req-7b44', label: 'req-7b44 (Client C)', badge: 'border-amber-400/50 bg-amber-500/15 text-amber-100' },
];

const STREAM = [
  { t: '13:28:01.010', id: 'req-8f2a', text: 'POST /predict received (image_id=101)' },
  { t: '13:28:01.014', id: 'req-3c91', text: 'POST /predict received (image_id=409)' },
  { t: '13:28:01.022', id: 'req-8f2a', text: 'Fetched user embeddings from Feature Store (8ms)' },
  { t: '13:28:01.025', id: 'req-7b44', text: 'POST /predict received (image_id=882)' },
  { t: '13:28:01.039', id: 'req-3c91', text: 'ERROR: Feature Store timeout after 25ms!', error: true },
  { t: '13:28:01.045', id: 'req-8f2a', text: 'Model inference completed: class="cat" (prob=0.97)' },
  { t: '13:28:01.051', id: 'req-7b44', text: 'Model inference completed: class="dog" (prob=0.89)' },
  { t: '13:28:01.054', id: 'req-8f2a', text: 'HTTP 200 OK sent in 44ms', ok: true },
];

export function CorrelationVisualizer() {
  const [on, setOn] = useState(false);
  const [filter, setFilter] = useState('all');
  const request = REQUESTS.find((item) => item.id === filter);

  return (
    <Frame title="One id on every line of a request" hint="Turn the middleware on, then filter to one client.">
      <div className="mb-3 rounded-2xl border border-gray-800 bg-gray-950/70 p-3">
        <button
          type="button"
          onClick={() => setOn((value) => !value)}
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${on ? 'border-indigo-400/60 bg-indigo-500/20 text-indigo-100' : 'border-rose-400/60 bg-rose-500/15 text-rose-200'}`}
        >
          {on ? 'Correlation ID middleware: ON' : 'Correlation IDs: OFF'}
        </button>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-gray-400">Filter by correlation ID</span>
          <button type="button" className={tabClass(filter === 'all')} onClick={() => setFilter('all')}>Show all (3 concurrent)</button>
          {REQUESTS.map((item) => (
            <button key={item.id} type="button" className={tabClass(filter === item.id)} onClick={() => setFilter(item.id)}>
              {item.label}{item.id === 'req-3c91' ? ' *' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-black/40 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500">Interleaved log (3 concurrent requests)</p>
          <p className={`text-[10px] uppercase tracking-wider ${on ? 'text-indigo-200' : 'text-gray-500'}`}>
            {on ? 'asgi-correlation-id active' : 'no request context'}
          </p>
        </div>
        <div className="space-y-1.5">
          {STREAM.map((row) => {
            const match = on && filter !== 'all' && row.id === filter;
            const dim = on && filter !== 'all' && row.id !== filter;
            const badge = request && row.id === request.id ? request.badge : REQUESTS.find((item) => item.id === row.id).badge;
            return (
              <div
                key={`${row.t}-${row.text}`}
                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 font-mono text-[11px] ${match ? 'border-indigo-400/70 bg-indigo-500/10' : 'border-gray-800'} ${dim ? 'opacity-35' : ''}`}
              >
                <span className="shrink-0 text-gray-500">{row.t}</span>
                <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] ${on ? badge : 'border-gray-700 bg-gray-900 text-gray-500'}`}>
                  {on ? row.id : '???'}
                </span>
                <span className={row.error ? 'text-rose-200' : row.ok && match ? 'text-emerald-200' : 'text-slate-200'}>{row.text}</span>
              </div>
            );
          })}
        </div>
        {!on && filter !== 'all' && (
          <p className="mt-2 text-[11px] text-rose-200">Every line is [???], so this filter cannot pick out {filter}.</p>
        )}
      </div>
    </Frame>
  );
}
