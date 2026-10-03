import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStepper, Frame, StepControls, tabClass, Lesson, Caption } from './VisualKit';
import { Mono, Pill } from './PydanticKit';

const SPECIES = ['setosa', 'versicolor', 'virginica'];
const SPECIES_COLOR = ['#fbbf24', '#a78bfa', '#7c3aed'];

function irisCall(sl, sw, pl, pw) {
  const scores = [
    6.4 - pl * 1.85 - pw * 3.1 + (5.5 - sl) * 0.12,
    2.2 - Math.abs(pl - 4.25) * 1.45 - Math.abs(pw - 1.35) * 1.7 + sw * 0.12,
    pl * 1.2 + pw * 2.15 - 7.4,
  ];
  const peak = Math.max(...scores);
  const exps = scores.map((score) => Math.exp((score - peak) / 1.8));
  const total = exps.reduce((sum, value) => sum + value, 0);
  const raw = exps.map((value) => value / total);
  const id = raw.indexOf(Math.max(...raw));
  const rounded = raw.map((value) => Math.round(value * 100) / 100);
  const drift = Math.round((1 - rounded.reduce((sum, value) => sum + value, 0)) * 100) / 100;
  rounded[id] = Math.round((rounded[id] + drift) * 100) / 100;
  return { id, probs: rounded };
}

function IrisMark({ pl, pw, species }) {
  const petal = 18 + pl * 7;
  const petalW = 7 + pw * 8;
  const color = SPECIES_COLOR[species];
  return (
    <svg viewBox="0 0 120 120" className="w-28 h-28">
      {[0, 60, 120].map((deg) => (
        <ellipse key={deg} cx="60" cy="60" rx="14" ry="34" fill="#86efac" opacity="0.85" transform={`rotate(${deg} 60 60)`} />
      ))}
      {[30, 150, 270].map((deg) => (
        <ellipse key={deg} cx="60" cy="60" rx={petalW} ry={petal} fill={color} transform={`rotate(${deg} 60 60)`} />
      ))}
      <circle cx="60" cy="60" r="6" fill="#fef3c7" />
    </svg>
  );
}

function ProbBars({ probs, winner }) {
  return (
    <div className="space-y-1">
      {SPECIES.map((name, i) => (
        <div key={name} className="grid grid-cols-[5.2rem_1fr_2.2rem] items-center gap-2 text-[10px]">
          <span className={i === winner ? 'text-white' : 'text-gray-500'}>{name}</span>
          <div className="h-2 rounded bg-gray-800 overflow-hidden">
            <motion.div animate={{ width: `${probs[i] * 100}%` }} className="h-full rounded" style={{ background: SPECIES_COLOR[i] }} />
          </div>
          <span className="font-mono text-gray-300">{probs[i].toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The whole service                                                      */
/* ------------------------------------------------------------------ */

const OVERVIEW = [
  { title: 'Train on 150 iris flowers', detail: 'Four measurements in, one of three species out.' },
  { title: 'joblib writes the fitted model to disk', detail: 'iris_classifier.joblib is the artifact the API will load.' },
  { title: 'FastAPI reads that file as the process starts', detail: 'The model is in memory before the first request.' },
  { title: 'POST /predict returns the species and three probabilities', detail: 'Pydantic checks the measurements on the way in and the response on the way out.' },
];

export function ServiceOverviewVisualizer() {
  const stepper = useStepper(OVERVIEW.length, 1400);
  const step = stepper.index;
  const stages = ['train', 'file', 'api', 'client'];
  return (
    <Frame
      title="One saved model, one prediction URL"
      hint="This practice ties the earlier pieces together: fit, save, load, validate, predict, respond."
      footer={<StepControls stepper={stepper} total={OVERVIEW.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${OVERVIEW[step].title}`} />
        <div className="grid grid-cols-4 gap-1.5">
          {[
            ['train', 'fit'],
            ['file', '.joblib'],
            ['api', 'load'],
            ['client', '/predict'],
          ].map(([id, label], i) => (
            <motion.div key={id} animate={{ opacity: i <= step ? 1 : 0.35, y: i === step ? -2 : 0 }} className={`rounded-xl border px-2 py-3 text-center ${i === step ? 'border-teal-400 bg-teal-500/10' : 'border-gray-700'}`}>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">{stages[i]}</p>
              <p className="font-mono text-[12px] text-white mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-[12px] text-gray-200">{OVERVIEW[step].detail}</p>
        {step === 3 && (
          <div className="flex items-center gap-3">
            <IrisMark pl={1.4} pw={0.2} species={0} />
            <div className="flex-1 space-y-1">
              <Mono className="text-sky-100">{'{ "sepal_length": 5.1, "sepal_width": 3.5, "petal_length": 1.4, "petal_width": 0.2 }'}</Mono>
              <Mono className="text-emerald-100">{'{ "predicted_class_id": 0, "predicted_class_name": "setosa", "probabilities": [0.97, 0.02, 0.00] }'}</Mono>
            </div>
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Train and dump                                                         */
/* ------------------------------------------------------------------ */

const TRAIN_STEPS = [
  'load_iris() gives 150 rows and 4 measurements. The target is 0, 1, or 2.',
  'LogisticRegression(max_iter=200) fits on the whole table.',
  'joblib.dump writes iris_classifier.joblib next to the script.',
  'The file remembers the order: 0 setosa, 1 versicolor, 2 virginica.',
];

const CLUSTERS = [
  [1.4, 0.2], [1.5, 0.2], [1.3, 0.3], [1.6, 0.4],
  [4.0, 1.2], [4.5, 1.5], [4.2, 1.3], [3.9, 1.1],
  [5.5, 2.0], [5.8, 2.2], [5.1, 1.8], [6.1, 2.3],
];

export function TrainIrisVisualizer() {
  const stepper = useStepper(TRAIN_STEPS.length, 1400);
  const step = stepper.index;
  return (
    <Frame
      title="Fit once, then dump the fitted object"
      hint="Petal length and petal width already separate the three species. The saved file is what the API loads later."
      footer={<StepControls stepper={stepper} total={TRAIN_STEPS.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${TRAIN_STEPS[step]}`} />
        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
          <svg viewBox="0 0 280 150" className="w-full">
            <text x="8" y="14" fontSize="10" fill="#94a3b8">petal width</text>
            <text x="200" y="146" fontSize="10" fill="#94a3b8">petal length →</text>
            {CLUSTERS.map(([pl, pw], i) => {
              const show = step === 0 ? i < 4 : true;
              const color = i < 4 ? SPECIES_COLOR[0] : i < 8 ? SPECIES_COLOR[1] : SPECIES_COLOR[2];
              return (
                <motion.circle
                  key={`${pl}-${pw}`}
                  cx={30 + pl * 36}
                  cy={120 - pw * 40}
                  r="5"
                  fill={color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: show ? 1 : 0.15 }}
                />
              );
            })}
          </svg>
          <div className="flex gap-3 text-[10px] text-gray-400">
            {SPECIES.map((name, i) => (
              <span key={name} className="inline-flex items-center gap-1">
                <i className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: SPECIES_COLOR[i] }} />
                {i} {name}
              </span>
            ))}
          </div>
        </div>
        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-teal-400/40 bg-teal-500/10 px-3 py-2 font-mono text-[12px] text-teal-50">
            iris_classifier.joblib
          </motion.div>
        )}
        {step === 3 && <Lesson title="The order is part of the file's contract">class_names in the API must follow this same order, or a correct id will be given the wrong species name.</Lesson>}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Three files                                                            */
/* ------------------------------------------------------------------ */

const LAYOUT = [
  { title: 'fastapi_ml_service/ is the working directory', hot: 'root', detail: 'Uvicorn is started from here, so main.py can import models and find the joblib file by name.' },
  { title: 'iris_classifier.joblib is the trained model', hot: 'file', detail: 'main.py loads this path at startup. It is not Python.' },
  { title: 'models.py is the request and the response', hot: 'models', detail: 'IrisFeatures is what the client sends. PredictionOut is what the client gets back.' },
  { title: 'main.py connects the file to the URL', hot: 'main', detail: 'It loads the joblib file, imports the two Pydantic models, and defines GET / and POST /predict.' },
];

export function ServiceLayoutVisualizer() {
  const stepper = useStepper(LAYOUT.length, 1500);
  const step = stepper.index;
  const hot = LAYOUT[step].hot;
  return (
    <Frame
      title="Three files, one directory"
      hint="The model file, the Pydantic models, and the FastAPI app sit together. main.py is the only one that talks to the other two."
      footer={<StepControls stepper={stepper} total={LAYOUT.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${LAYOUT[step].title}`} />
        <div className={`rounded-xl border p-3 ${hot === 'root' ? 'border-teal-400 bg-teal-500/5' : 'border-gray-700'}`}>
          <p className="font-mono text-[12px] text-sky-200 mb-3">fastapi_ml_service/</p>
          <div className="grid grid-cols-3 gap-2">
            <FileCard name="iris_classifier.joblib" role="saved model" on={hot === 'file' || step === 3} />
            <FileCard name="models.py" role="IrisFeatures and PredictionOut" on={hot === 'models' || step === 3} />
            <FileCard name="main.py" role="load + /predict" on={hot === 'main' || step === 3} />
          </div>
          {step === 3 && (
            <div className="mt-3 flex justify-between text-[10px] font-mono text-teal-200">
              <span>joblib.load("iris_classifier.joblib")</span>
              <span>from models import …</span>
            </div>
          )}
        </div>
        <p className="text-[12px] text-gray-200">{LAYOUT[step].detail}</p>
      </div>
    </Frame>
  );
}

function FileCard({ name, role, on }) {
  return (
    <motion.div animate={{ opacity: on ? 1 : 0.45 }} className={`rounded-lg border px-2 py-2 ${on ? 'border-teal-400 bg-gray-950' : 'border-gray-800'}`}>
      <p className="font-mono text-[10px] text-white break-all">{name}</p>
      <p className="text-[10px] text-gray-400 mt-1">{role}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* IrisFeatures                                                           */
/* ------------------------------------------------------------------ */

const EXAMPLE = { sl: 5.1, sw: 3.5, pl: 1.4, pw: 0.2 };

export function IrisFeaturesVisualizer() {
  const [sl, setSl] = useState(EXAMPLE.sl);
  const [sw, setSw] = useState(EXAMPLE.sw);
  const [pl, setPl] = useState(EXAMPLE.pl);
  const [pw, setPw] = useState(EXAMPLE.pw);
  const bad = [sl, sw, pl, pw].some((value) => value <= 0);
  const guess = irisCall(sl, sw, pl, pw);
  return (
    <Frame
      title="Four measurements, each greater than 0"
      hint="Field(gt=0) rejects 0 and negatives before the model runs. The example in schema_extra is the payload Swagger will offer."
      footer={
        <div className="flex gap-2 flex-wrap">
          <button type="button" className={tabClass(false)} onClick={() => { setSl(EXAMPLE.sl); setSw(EXAMPLE.sw); setPl(EXAMPLE.pl); setPw(EXAMPLE.pw); }}>docs example</button>
          <button type="button" className={tabClass(pw <= 0)} onClick={() => setPw(0)}>petal width 0</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <IrisMark pl={Math.max(pl, 0.4)} pw={Math.max(pw, 0.1)} species={bad ? 0 : guess.id} />
          <div className="flex-1 space-y-1">
            <Measure label="sepal length" value={sl} min={0} max={8} onChange={setSl} />
            <Measure label="sepal width" value={sw} min={0} max={5} onChange={setSw} />
            <Measure label="petal length" value={pl} min={0} max={7} onChange={setPl} />
            <Measure label="petal width" value={pw} min={0} max={3} onChange={setPw} />
          </div>
        </div>
        {bad ? (
          <div className="space-y-1">
            <Pill code={422} text="Unprocessable Entity" />
            <Mono className="text-rose-100">{'{ "detail": [{ "loc": ["body", "petal_width"], "msg": "ensure this value is greater than 0" }] }'}</Mono>
            <p className="text-[11px] text-gray-400">model.predict is not called.</p>
          </div>
        ) : (
          <Mono className="text-sky-100">{JSON.stringify({ sepal_length: sl, sepal_width: sw, petal_length: pl, petal_width: pw })}</Mono>
        )}
      </div>
    </Frame>
  );
}

function Measure({ label, value, min, max, onChange }) {
  const bad = value <= 0;
  return (
    <label className="grid grid-cols-[6.2rem_1fr_2rem] items-center gap-2 text-[10px]">
      <span className={bad ? 'text-rose-300' : 'text-gray-400'}>{label}</span>
      <input type="range" min={min} max={max} step={0.1} value={value} onChange={(event) => onChange(Number(event.target.value))} className="accent-teal-500" />
      <span className={`font-mono ${bad ? 'text-rose-200' : 'text-white'}`}>{value.toFixed(1)}</span>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* PredictionOut                                                          */
/* ------------------------------------------------------------------ */

export function PredictionOutVisualizer() {
  const [pl, setPl] = useState(1.4);
  const [pw, setPw] = useState(0.2);
  const guess = irisCall(5.1, 3.5, pl, pw);
  return (
    <Frame
      title="The response is an id, a name, and a list of three probabilities"
      hint="The list is in class order: index 0 is setosa, 1 is versicolor, 2 is virginica. Grow the petal and the winning bar moves."
    >
      <div className="space-y-3">
        <Measure label="petal length" value={pl} min={1} max={7} onChange={setPl} />
        <Measure label="petal width" value={pw} min={0.1} max={2.5} onChange={setPw} />
        <div className="grid grid-cols-3 gap-2">
          <OutCell label="predicted_class_id" value={String(guess.id)} />
          <OutCell label="predicted_class_name" value={SPECIES[guess.id]} />
          <OutCell label="probabilities" value="3 floats" />
        </div>
        <ProbBars probs={guess.probs} winner={guess.id} />
        <Mono className="text-emerald-100">
          {JSON.stringify({ predicted_class_id: guess.id, predicted_class_name: SPECIES[guess.id], probabilities: guess.probs })}
        </Mono>
      </div>
    </Frame>
  );
}

function OutCell({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-700 px-2 py-2">
      <p className="text-[9px] text-gray-500">{label}</p>
      <p className="font-mono text-[12px] text-white">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Startup load                                                           */
/* ------------------------------------------------------------------ */

const LOAD_STEPS = [
  'The process looks for iris_classifier.joblib in the working directory.',
  'joblib.load puts the fitted LogisticRegression in the name model.',
  'class_names is set to the Iris order, matching the training script.',
  'The app is ready. A later request will use this object.',
];

export function StartupLoadVisualizer() {
  const [file, setFile] = useState('ok');
  return <LoadRun key={file} file={file} setFile={setFile} />;
}

function LoadRun({ file, setFile }) {
  const stepper = useStepper(LOAD_STEPS.length, 1300);
  const step = stepper.index;
  const ok = file === 'ok';
  return (
    <Frame
      title="The model is loaded before any request"
      hint="A missing file does not crash startup. model becomes None, and /predict answers 503."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button type="button" className={tabClass(file === 'ok')} onClick={() => setFile('ok')}>file present</button>
            <button type="button" className={tabClass(file === 'missing')} onClick={() => setFile('missing')}>file missing</button>
            <button type="button" className={tabClass(file === 'bad')} onClick={() => setFile('bad')}>load raises</button>
          </div>
          <StepControls stepper={stepper} total={LOAD_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        {ok ? (
          <>
            <Caption text={`${step + 1}. ${LOAD_STEPS[step]}`} />
            <div className="flex items-center gap-2 text-[12px]">
              <span className={`px-2 py-1 rounded font-mono ${step >= 1 ? 'bg-teal-500/15 text-teal-100' : 'bg-gray-800 text-gray-500'}`}>model</span>
              <span className="text-gray-600">→</span>
              <span className="text-gray-200">{step >= 1 ? 'LogisticRegression' : '…'}</span>
            </div>
            {step >= 2 && (
              <div className="flex gap-1">
                {SPECIES.map((name, i) => (
                  <motion.span key={name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="px-2 py-1 rounded-full bg-gray-800 font-mono text-[10px] text-white">{i} {name}</motion.span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <Caption text={file === 'missing' ? 'FileNotFoundError. model = None. class_names is never assigned.' : 'Some other exception while loading. model = None as well.'} />
            <Mono className="text-rose-100">{file === 'missing' ? 'Error: Model file not found at iris_classifier.joblib' : 'Error loading model: invalid joblib data'}</Mono>
            <Pill code={503} text="Service Unavailable" />
            <Mono className="text-amber-100">{'{ "detail": "Model is not loaded or unavailable." }'}</Mono>
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Predict journey                                                        */
/* ------------------------------------------------------------------ */

const JOURNEY = [
  'IrisFeatures has already accepted the four numbers.',
  'They become one row of a 2D array. Shape (1, 4).',
  'predict returns an array. [0] is the class id.',
  'predict_proba returns shape (1, 3). [0].tolist() is the three probabilities.',
  'PredictionOut is the JSON body. FastAPI checks it against the response model.',
];

export function PredictJourneyVisualizer() {
  const [pl, setPl] = useState(1.4);
  const [pw, setPw] = useState(0.2);
  return <JourneyRun pl={pl} setPl={setPl} pw={pw} setPw={setPw} />;
}

function JourneyRun({ pl, setPl, pw, setPw }) {
  const stepper = useStepper(JOURNEY.length, 1400);
  const step = stepper.index;
  const guess = irisCall(5.1, 3.5, pl, pw);
  const row = [5.1, 3.5, pl, pw];
  return (
    <Frame
      title="From four fields to one PredictionOut"
      hint="Move the petal. The same numbers pass through a row vector, an id, and a probability list."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-3 flex-1 min-w-[12rem]">
            <Measure label="petal length" value={pl} min={1} max={7} onChange={setPl} />
          </div>
          <StepControls stepper={stepper} total={JOURNEY.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Measure label="petal width" value={pw} min={0.1} max={2.5} onChange={setPw} />
        <Caption text={`${step + 1}. ${JOURNEY[step]}`} />
        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 font-mono text-[12px] text-white space-y-1">
          {step >= 1 && <p>[[{row.join(', ')}]] <span className="text-teal-200">shape (1, 4)</span></p>}
          {step >= 2 && <p>predict → [{guess.id}] → <span className="text-teal-200">{guess.id}</span></p>}
          {step >= 3 && <p>predict_proba → [[{guess.probs.join(', ')}]]</p>}
          {step >= 3 && <p className="text-teal-200">[0].tolist() → [{guess.probs.join(', ')}]</p>}
        </div>
        {step >= 3 && <ProbBars probs={guess.probs} winner={guess.id} />}
        {step === 4 && (
          <div className="space-y-1">
            <Pill code={200} text="OK" />
            <Mono className="text-emerald-100">
              {JSON.stringify({ predicted_class_id: guess.id, predicted_class_name: SPECIES[guess.id], probabilities: guess.probs })}
            </Mono>
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Failures inside the endpoint                                          */
/* ------------------------------------------------------------------ */

const FAILS = [
  { id: 'none', code: 503, title: 'model is None', body: '{ "detail": "Model is not loaded or unavailable." }', note: 'The check runs before any NumPy array is built.' },
  { id: 'boom', code: 500, title: 'predict raises', body: '{ "detail": "Prediction error: X has 4 features, but model is expecting 5" }', note: 'The except turns the library error into HTTP 500.' },
  { id: 'index', code: 500, title: 'class id is out of range', body: '{ "detail": "Prediction index out of bounds." }', note: 'class_names has 3 entries. An id of 3 would crash the lookup, so the endpoint stops first.' },
];

export function PredictFailureVisualizer() {
  const [id, setId] = useState('none');
  const fail = FAILS.find((item) => item.id === id);
  return (
    <Frame
      title="Three ways /predict refuses to return a species"
      hint="None of these responses is a PredictionOut. The status code is how the client tells them apart."
      footer={
        <div className="flex gap-2 flex-wrap">
          {FAILS.map((item) => (
            <button key={item.id} type="button" className={tabClass(id === item.id)} onClick={() => setId(item.id)}>{item.title}</button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <span className="px-2 py-1 rounded bg-gray-800 text-gray-200">IrisFeatures ok</span>
          <span>→</span>
          <span className="px-2 py-1 rounded bg-rose-500/15 text-rose-100">{fail.title}</span>
          <span>→</span>
          <span className="line-through">PredictionOut</span>
        </div>
        <Pill code={fail.code} text={fail.code === 503 ? 'Service Unavailable' : 'Internal Server Error'} />
        <Mono className="text-rose-100">{fail.body}</Mono>
        <p className="text-[12px] text-gray-200">{fail.note}</p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* uvicorn                                                                */
/* ------------------------------------------------------------------ */

const FLAGS = [
  { token: 'main:app', detail: 'The app object inside main.py.' },
  { token: '--reload', detail: 'Restart when a file in this directory changes.' },
  { token: '--host 0.0.0.0', detail: 'Listen on every interface, not only this machine.' },
  { token: '--port 8000', detail: 'The port in the browser and in the curl URL.' },
];

export function UvicornVisualizer() {
  const stepper = useStepper(FLAGS.length, 1300);
  const step = stepper.index;
  return (
    <Frame
      title="Start it from the service directory"
      hint="The if __name__ block in main.py is commented out, so python main.py does not start a server. This command does."
      footer={<StepControls stepper={stepper} total={FLAGS.length} />}
    >
      <div className="space-y-3">
        <div className="rounded-xl bg-black/70 border border-gray-700 p-3 font-mono text-[12px] text-gray-200">
          <span className="text-teal-300">uvicorn </span>
          {FLAGS.map((flag, i) => (
            <span key={flag.token} className={i === step ? 'text-white bg-teal-500/20 rounded px-1' : i < step ? 'text-teal-100' : 'text-gray-600'}>
              {flag.token}{' '}
            </span>
          ))}
        </div>
        <Caption text={FLAGS[step].detail} />
        <div className={`rounded-xl border px-3 py-3 ${step === 3 ? 'border-teal-400' : 'border-gray-700'}`}>
          <p className="text-[10px] uppercase tracking-wider text-gray-500">listening</p>
          <p className="font-mono text-sm text-white mt-1">{step === 3 ? '0.0.0.0:8000' : 'not started'}</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Docs and curl                                                          */
/* ------------------------------------------------------------------ */

const CALL_STEPS = [
  'GET /docs opens Swagger. The example body comes from schema_extra.',
  'POST /predict sends that example. FastAPI parses it into IrisFeatures.',
  'The loaded model scores the row.',
  'The JSON you get back names the species and lists three probabilities.',
];

export function DocsCurlVisualizer() {
  const stepper = useStepper(CALL_STEPS.length, 1400);
  const step = stepper.index;
  return (
    <Frame
      title="The documented example is a setosa"
      hint="5.1, 3.5, 1.4, 0.2 is the payload in the course. A real LogisticRegression's probabilities can differ slightly from 0.97, 0.02, 0.00."
      footer={<StepControls stepper={stepper} total={CALL_STEPS.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${CALL_STEPS[step]}`} />
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-xl border p-3 ${step === 0 ? 'border-teal-400' : 'border-gray-700'}`}>
            <p className="text-[10px] text-gray-500">GET /docs</p>
            <p className="font-mono text-[11px] text-white mt-1">localhost:8000/docs</p>
            <p className="text-[10px] text-gray-400 mt-2">routes / and /predict</p>
          </div>
          <div className={`rounded-xl border p-3 ${step >= 1 ? 'border-teal-400' : 'border-gray-700'}`}>
            <p className="text-[10px] text-gray-500">POST /predict</p>
            <p className="font-mono text-[11px] text-sky-100 mt-1">5.1 · 3.5 · 1.4 · 0.2</p>
          </div>
        </div>
        {step >= 2 && <ProbBars probs={[0.97, 0.02, 0.01]} winner={0} />}
        {step === 3 && (
          <div className="space-y-1">
            <Pill code={200} text="OK" />
            <Mono className="text-emerald-100">{'{ "predicted_class_id": 0, "predicted_class_name": "setosa", "probabilities": [0.97, 0.02, 0.01] }'}</Mono>
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 422                                                                    */
/* ------------------------------------------------------------------ */

const INVALID = {
  type: {
    label: '"not-a-number"',
    field: 'sepal_width',
    body: '{ "loc": ["body", "sepal_width"], "msg": "value is not a valid float", "type": "type_error.float" }',
  },
  missing: {
    label: 'petal_width omitted',
    field: 'petal_width',
    body: '{ "loc": ["body", "petal_width"], "msg": "field required", "type": "value_error.missing" }',
  },
};

export function ValidationFailVisualizer() {
  const [mode, setMode] = useState('type');
  const item = INVALID[mode];
  return (
    <Frame
      title="A bad body never reaches the model"
      hint="FastAPI validates against IrisFeatures first. This 422 is the shape from the lesson. Current FastAPI, on Pydantic v2, uses different msg and type strings."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(mode === 'type')} onClick={() => setMode('type')}>not a number</button>
          <button type="button" className={tabClass(mode === 'missing')} onClick={() => setMode('missing')}>missing field</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 font-mono text-[11px] text-gray-300 space-y-0.5">
          <p>sepal_length: 5.1</p>
          <p className={mode === 'type' ? 'text-rose-200' : ''}>sepal_width: {mode === 'type' ? '"not-a-number"' : '3.5'}</p>
          <p>petal_length: 1.4</p>
          <p className={mode === 'missing' ? 'text-rose-200' : ''}>{mode === 'missing' ? 'petal_width: missing' : 'petal_width: 0.2'}</p>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-rose-200">IrisFeatures rejects {item.field}</span>
          <span className="text-gray-600">→</span>
          <span className="text-gray-500 line-through">model.predict</span>
        </div>
        <Pill code={422} text="Unprocessable Entity" />
        <Mono className="text-rose-100">{`{ "detail": [${item.body}] }`}</Mono>
      </div>
    </Frame>
  );
}
