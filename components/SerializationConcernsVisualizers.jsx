import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Container, ArrowRight } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines, Terminal } from './VisualKit';

/* ------------------------------------------------------------------ */
/* 9. Version compatibility                                              */
/* ------------------------------------------------------------------ */

const SK_VERSIONS = ['1.0', '1.2', '1.3', '1.5'];
const vnum = (v) => Number(v.split('.')[1]);

function compat(train, serve) {
  if (train === serve) return 'ok';
  return vnum(serve) > vnum(train) ? 'warn' : 'fail';
}

export function VersionCompatVisualizer() {
  const [train, setTrain] = useState('1.0');
  const [serve, setServe] = useState('1.2');
  const [container, setContainer] = useState(false);
  const effectiveServe = container ? train : serve;
  const status = compat(train, effectiveServe);

  const Env = ({ title, version, setVersion, locked }) => (
    <div className={`rounded-xl border-2 p-3 space-y-2 ${locked ? 'border-sky-400/60 bg-sky-500/5' : 'border-gray-700'}`}>
      <p className="text-[10px] uppercase tracking-wider text-gray-400">{title}</p>
      <div className="font-mono text-[11px] text-gray-300 space-y-0.5">
        <p>python 3.10</p>
        <p className="flex items-center gap-1 flex-wrap">
          scikit-learn
          {SK_VERSIONS.map((v) => (
            <button
              key={v}
              type="button"
              disabled={locked}
              onClick={() => setVersion(v)}
              className={`px-1.5 rounded border text-[10px] ${version === v ? 'border-teal-400 bg-teal-500/20 text-teal-100' : 'border-gray-700 text-gray-500'} ${locked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-800'}`}
            >
              {v}
            </button>
          ))}
        </p>
      </div>
    </div>
  );

  return (
    <Frame
      title="Version compatibility: the environment must match"
      hint="Pick the scikit-learn version used to train and save the model, and the one installed in your FastAPI app. Then containerize."
      footer={
        <button type="button" className={tabClass(container)} onClick={() => setContainer(!container)}>
          <span className="inline-flex items-center gap-1"><Container className="w-3.5 h-3.5" /> {container ? 'containerized: same image for both' : 'containerize the environment'}</span>
        </button>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <Env title="training environment" version={train} setVersion={setTrain} />
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-lg border border-amber-400/50 bg-amber-500/10 px-2 py-1 font-mono text-[10px] text-amber-100">model.joblib</div>
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </div>
          <Env title="FastAPI serving environment" version={effectiveServe} setVersion={setServe} locked={container} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={`${train}-${effectiveServe}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {status === 'ok' && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-400/50 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-100">
                <CheckCircle className="w-4 h-4" /> Versions match — the model loads and predicts exactly as it did in training.
              </div>
            )}
            {status === 'warn' && (
              <>
                <div className="flex items-center gap-2 rounded-lg border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-100">
                  <AlertTriangle className="w-4 h-4" /> It may load, with a warning — and results are not guaranteed.
                </div>
                <Terminal
                  title="uvicorn"
                  lines={[
                    {
                      kind: 'warn',
                      text: `${vnum(effectiveServe) >= 3 ? 'InconsistentVersionWarning' : 'UserWarning'}: Trying to unpickle estimator LogisticRegression from version ${train} when using version ${effectiveServe}. This might lead to breaking code or invalid results. Use at your own risk.`,
                    },
                  ]}
                />
              </>
            )}
            {status === 'fail' && (
              <>
                <div className="flex items-center gap-2 rounded-lg border border-rose-400/50 bg-rose-500/10 px-3 py-2 text-[12px] text-rose-100">
                  <XCircle className="w-4 h-4" /> Loading a model saved by a newer version into an older one often fails outright.
                </div>
                <Terminal title="uvicorn" lines={[{ kind: 'err', text: "AttributeError: Can't get attribute '…' on <module 'sklearn…'>   (example — internal classes differ between versions)" }]} />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {container && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CodeLines title="Dockerfile" lines={['FROM python:3.10-slim', `RUN pip install scikit-learn==${train}.* joblib fastapi uvicorn`, 'COPY models/ /app/models/', 'COPY main.py /app/']} active={[1]} />
          </motion.div>
        )}
        <Lesson title="Why this happens">
          A pickle/joblib file stores references to library classes by name plus their internal data. If the library’s internals changed between versions, the stored data no longer fits.
          Pin versions — containerization (Chapter 6) makes the training and serving environments identical.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 10. File size and startup impact                                       */
/* ------------------------------------------------------------------ */

const SIZES = [
  { id: 'lr', name: 'LogisticRegression (10 features)', mb: 0.001 },
  { id: 'rf', name: 'RandomForest (500 trees)', mb: 200 },
  { id: 'resnet', name: 'ResNet-50', mb: 98 },
  { id: 'bert', name: 'BERT-base', mb: 440 },
  { id: 'llm', name: '7B-parameter LLM (fp16)', mb: 13500 },
];

const DISKS = [
  { id: 'nvme', label: 'local NVMe SSD', mbps: 2000 },
  { id: 'ssd', label: 'SATA SSD', mbps: 500 },
  { id: 'net', label: 'network storage', mbps: 100 },
];

const fmtSize = (mb) => (mb >= 1000 ? `${(mb / 1000).toFixed(1)} GB` : mb >= 1 ? `${mb} MB` : `${Math.round(mb * 1000)} KB`);
const fmtSec = (s) => (s < 0.01 ? '< 0.01 s' : s < 60 ? `${s.toFixed(s < 1 ? 2 : 1)} s` : `${(s / 60).toFixed(1)} min`);

export function ModelSizeVisualizer() {
  const [model, setModel] = useState('bert');
  const [disk, setDisk] = useState('net');
  const d = DISKS.find((x) => x.id === disk);
  const logW = (mb) => `${Math.max(2, ((Math.log10(mb) + 3) / (Math.log10(20000) + 3)) * 100)}%`;
  const sel = SIZES.find((x) => x.id === model);
  const readSec = sel.mb / d.mbps;

  return (
    <Frame title="Model artifacts can be large" hint="Pick a model and the storage it is read from. Sizes are typical, approximate values; the bar uses a log scale.">
      <div className="space-y-3">
        <div className="space-y-1">
          {SIZES.map((s) => (
            <button key={s.id} type="button" onClick={() => setModel(s.id)} className={`w-full grid grid-cols-[11rem_1fr_4.5rem] items-center gap-2 rounded px-1.5 py-1 text-left ${model === s.id ? 'bg-teal-500/15' : 'hover:bg-gray-800'}`}>
              <span className="text-[11px] text-gray-200">{s.name}</span>
              <div className="h-3 rounded bg-gray-800 overflow-hidden">
                <motion.div initial={false} animate={{ width: logW(s.mb) }} className={`h-full ${s.mb > 1000 ? 'bg-rose-400' : s.mb > 100 ? 'bg-amber-400' : 'bg-teal-400'}`} />
              </div>
              <span className="font-mono text-[10px] text-white text-right">{fmtSize(s.mb)}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {DISKS.map((x) => (
            <button key={x.id} type="button" className={tabClass(disk === x.id)} onClick={() => setDisk(x.id)}>
              {x.label} · ~{x.mbps >= 1000 ? `${x.mbps / 1000} GB/s` : `${x.mbps} MB/s`}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-gray-700 p-3 space-y-2">
          <p className="text-[11px] text-gray-300">
            Just reading <span className="font-mono text-white">{fmtSize(sel.mb)}</span> from {d.label}:
          </p>
          <div className="h-5 rounded bg-gray-800 overflow-hidden">
            <motion.div key={`${model}-${disk}`} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (readSec / 140) * 100)}%` }} transition={{ duration: 1.2 }} className="h-full bg-amber-400/80" />
          </div>
          <p className="font-mono text-lg text-white">{fmtSec(readSec)}</p>
          <p className="text-[10px] text-gray-500">…plus deserialization and moving weights into memory or onto a GPU.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg border border-sky-400/40 p-2">
            <p className="font-semibold text-sky-200">Storage</p>
            <p className="text-gray-400">Where do the artifacts live, and how are they versioned and backed up?</p>
          </div>
          <div className="rounded-lg border border-amber-400/40 p-2">
            <p className="font-semibold text-amber-200">Startup time</p>
            <p className="text-gray-400">If the model is loaded on demand, this read is added to the first request that needs it.</p>
          </div>
        </div>
        <Lesson title="Megabytes or gigabytes">
          Trained models, especially deep learning models, produce large artifact files. A small scikit-learn model is kilobytes; a large language model is many gigabytes.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 11. What to serialize: model vs pipeline                              */
/* ------------------------------------------------------------------ */

const RAW = [
  ['age', '34'],
  ['income', '85000'],
  ['city', 'Austin'],
];

const TRAINED = { incomeMean: 52000, incomeStd: 18000, cities: ['Austin', 'Dallas', 'Houston'] };

function scale(income, mean, std) {
  return (income - mean) / std;
}

export function WhatToSerializeVisualizer() {
  const [mode, setMode] = useState('pipeline');
  const [appMean, setAppMean] = useState(60000);
  const income = 85000;
  const trainScaled = scale(income, TRAINED.incomeMean, TRAINED.incomeStd);
  const appScaled = scale(income, appMean, TRAINED.incomeStd);
  const used = mode === 'pipeline' ? trainScaled : appScaled;
  const drifted = mode === 'reimpl' && appMean !== TRAINED.incomeMean;
  const cityIdx = 0;

  return (
    <Frame
      title="Serialize the model — or the whole pipeline?"
      hint="The same raw request, two ways. Drag the app’s copy of the training mean and watch the features diverge."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(mode === 'model')} onClick={() => setMode('model')}>model only</button>
          <button type="button" className={tabClass(mode === 'reimpl')} onClick={() => setMode('reimpl')}>reimplemented in the app</button>
          <button type="button" className={tabClass(mode === 'pipeline')} onClick={() => setMode('pipeline')}>saved Pipeline</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid md:grid-cols-[0.8fr_auto_1.2fr] gap-2 items-center">
          <div className="rounded-xl border border-sky-400/40 p-2">
            <p className="text-[9px] uppercase tracking-wider text-sky-300">request JSON</p>
            {RAW.map(([k, v]) => (
              <p key={k} className="font-mono text-[11px] text-gray-200">
                {k}: <span className="text-white">{v}</span>
              </p>
            ))}
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 justify-self-center" />
          <div className={`rounded-xl border p-2 ${mode === 'model' || drifted ? 'border-amber-400 bg-amber-500/10' : 'border-emerald-400/50 bg-emerald-500/5'}`}>
            <p className="text-[9px] uppercase tracking-wider text-gray-400">what the model actually receives</p>
            {mode === 'model' ? (
              <>
                <p className="font-mono text-[11px] text-amber-100">age = 34, income = 85000, city = "Austin"</p>
                <p className="text-[10px] text-amber-200 mt-1">Raw values. The model was trained on scaled, encoded features — these numbers mean something else to it.</p>
              </>
            ) : (
              <>
                <p className="font-mono text-[11px] text-white">age = 34</p>
                <p className="font-mono text-[11px] text-white">
                  income_scaled = <span className={drifted ? 'text-amber-200' : 'text-emerald-200'}>{used.toFixed(2)}</span>
                  {drifted && <span className="text-gray-500"> (training used {trainScaled.toFixed(2)})</span>}
                </p>
                <p className="font-mono text-[11px] text-white">city_onehot = [{cityIdx === 0 ? '1, 0, 0' : ''}]</p>
              </>
            )}
          </div>
        </div>

        {mode !== 'model' && (
          <div className="rounded-lg border border-gray-700 p-2 space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>training mean (saved with the pipeline): {TRAINED.incomeMean.toLocaleString()}</span>
              <span>app’s mean: {mode === 'pipeline' ? TRAINED.incomeMean.toLocaleString() : appMean.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={30000}
              max={80000}
              step={1000}
              value={mode === 'pipeline' ? TRAINED.incomeMean : appMean}
              disabled={mode === 'pipeline'}
              onChange={(e) => setAppMean(Number(e.target.value))}
              className="w-full accent-teal-500 disabled:opacity-40"
            />
            <p className="text-[10px] text-gray-500">
              {mode === 'pipeline'
                ? 'Locked: the scaler’s mean travelled inside the saved Pipeline, so prediction uses exactly the training transformation.'
                : 'You re-typed the preprocessing in the API. If this number drifts from training, every prediction is silently wrong.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          {[
            ['StandardScaler', 'income → (x − mean) / std'],
            ['OneHotEncoder', 'city → [Austin, Dallas, Houston]'],
            ['LogisticRegression', 'the trained model'],
          ].map(([name, d], i) => (
            <div key={name} className={`rounded-lg border p-2 ${mode === 'model' && i < 2 ? 'border-gray-800 opacity-40' : 'border-teal-400/40 bg-teal-500/5'}`}>
              <p className="font-mono text-white">{name}</p>
              <p className="text-gray-400">{mode === 'model' && i < 2 ? 'not saved' : d}</p>
            </div>
          ))}
        </div>

        <CodeLines
          lines={
            mode === 'pipeline'
              ? ['pipeline = Pipeline([', "    ('scale', StandardScaler()),", "    ('encode', OneHotEncoder()),", "    ('model', LogisticRegression()),", '])', 'pipeline.fit(X_train, y_train)', "joblib.dump(pipeline, 'pipeline.joblib')"]
              : ['joblib.dump(model, "model.joblib")', '# preprocessing rewritten in the endpoint:', 'scaled = (income - MEAN) / STD', 'encoded = one_hot(city, CITIES)']
          }
          active={mode === 'pipeline' ? [5, 6] : [0]}
          title={mode === 'pipeline' ? 'train.py' : 'main.py'}
        />
        <Lesson title="Same transformations as training">
          Saving a scikit-learn Pipeline keeps the preprocessing steps and the model together. Reimplementing the steps in the FastAPI code works too — until the two copies drift apart.
        </Lesson>
      </div>
    </Frame>
  );
}