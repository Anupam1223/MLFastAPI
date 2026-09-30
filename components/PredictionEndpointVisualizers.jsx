import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines, Caption } from './VisualKit';
import { Mono, Pill } from './PydanticKit';

const scoreOf = (f1, f2, f3) => Math.round((f1 * 1.2 + f2 * 0.4 + f3 * 0.8) * 100) / 100;

/* ------------------------------------------------------------------ */
/* 1. The endpoint is the interface                                      */
/* ------------------------------------------------------------------ */

export function EndpointBridgeVisualizer() {
  const [method, setMethod] = useState('POST');
  const [sent, setSent] = useState(false);
  const post = method === 'POST';

  return (
    <Frame
      title="The endpoint is how clients reach the model"
      hint="POST carries a body. Try GET and see that the features have nowhere to go."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(post)} onClick={() => { setMethod('POST'); setSent(false); }}>POST /predict</button>
          <button type="button" className={tabClass(!post)} onClick={() => { setMethod('GET'); setSent(false); }}>GET /predict</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
          <div className="rounded-xl border border-sky-400/40 p-2">
            <p className="text-[9px] uppercase tracking-wider text-sky-300">client</p>
            <Mono className="text-sky-100">{post ? '{ "feature1": 1.5, "feature2": 3 }' : '(no body)'}</Mono>
            <button type="button" onClick={() => setSent(true)} className="mt-2 px-2 py-1 rounded bg-teal-600 text-white text-[11px]">send {method}</button>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500" />
          <div className={`rounded-xl border p-2 text-center ${sent && post ? 'border-teal-400 bg-teal-500/10' : 'border-gray-700'}`}>
            <p className="font-mono text-[11px] text-white">{method} /predict</p>
            <p className="text-[10px] text-gray-400 mt-1">{post ? 'body → InputFeatures → model.predict' : 'nothing to predict on'}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500" />
          <div className="rounded-xl border border-emerald-400/40 p-2">
            <p className="text-[9px] uppercase tracking-wider text-emerald-300">response</p>
            {sent && post && <Mono className="text-emerald-100">{'{ "prediction": 3.0 }'}</Mono>}
            {sent && !post && <Mono className="text-amber-100">{'{ "detail": "Method Not Allowed" }'}</Mono>}
            {!sent && <p className="text-[10px] text-gray-600">waiting</p>}
          </div>
        </div>
        <Lesson title="POST, then Pydantic">
          Predictions send data to the server, so POST is the method. The Pydantic models from Chapter 2 check the body and describe the response.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Load the model, then register the route                            */
/* ------------------------------------------------------------------ */

const SETUP = ['Define InputFeatures and PredictionOutput', 'joblib.load at import', 'Register POST /predict'];

export function RouteSetupVisualizer() {
  const [file, setFile] = useState(true);
  return <SetupRun key={String(file)} file={file} setFile={setFile} />;
}

function SetupRun({ file, setFile }) {
  const stepper = useStepper(SETUP.length, 1200);
  const step = stepper.index;
  return (
    <Frame
      title="Models, then the file, then the route"
      hint="Step through setup. Remove the model file and the app still starts — model becomes None."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button type="button" className={tabClass(!file)} onClick={() => setFile(!file)}>
            {file ? 'your_model.joblib exists' : 'file missing'}
          </button>
          <StepControls stepper={stepper} total={SETUP.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${SETUP[step]}`} />
        <div className="grid md:grid-cols-3 gap-2">
          <motion.div animate={{ opacity: step >= 0 ? 1 : 0.3 }} className={`rounded-xl border p-2 ${step === 0 ? 'border-teal-400' : 'border-gray-700'}`}>
            <p className="font-mono text-[10px] text-sky-200">InputFeatures</p>
            <p className="font-mono text-[10px] text-gray-400">feature1: float · feature2: int · feature3: float · category_feature: str</p>
            <p className="font-mono text-[10px] text-emerald-200 mt-2">PredictionOutput</p>
            <p className="font-mono text-[10px] text-gray-400">prediction: float</p>
          </motion.div>
          <motion.div animate={{ opacity: step >= 1 ? 1 : 0.3 }} className={`rounded-xl border p-2 ${step === 1 ? 'border-teal-400' : 'border-gray-700'}`}>
            <p className="text-[10px] text-gray-400">at import time</p>
            <p className="font-mono text-[12px] mt-1">{file ? <span className="text-emerald-200">model = LogisticRegression(…)</span> : <span className="text-amber-200">model = None</span>}</p>
            {!file && step >= 1 && <p className="text-[10px] text-rose-200 mt-1">FileNotFoundError caught. The app keeps running.</p>}
          </motion.div>
          <motion.div animate={{ opacity: step >= 2 ? 1 : 0.3 }} className={`rounded-xl border p-2 ${step === 2 ? 'border-teal-400' : 'border-gray-700'}`}>
            <p className="font-mono text-[11px] text-white">POST /predict</p>
            <p className="text-[10px] text-gray-400">body: InputFeatures</p>
            <p className="text-[10px] text-gray-400">response_model: PredictionOutput</p>
          </motion.div>
        </div>
        <p className="text-[10px] text-gray-500">
          The preprocessor load line is commented out, so a successful load never assigns <span className="font-mono">preprocessor</span>. Only the except branch sets it to None. And <span className="font-mono">HTTPException</span> is used later without being imported.
        </p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 3–6. One request through make_prediction                              */
/* ------------------------------------------------------------------ */

const PHASES = [
  { id: 'sign', title: '1. Function signature' },
  { id: 'prep', title: '2. Prepare the array' },
  { id: 'infer', title: '3. model.predict' },
  { id: 'fmt', title: '4. Format PredictionOutput' },
];

export function RequestJourneyVisualizer() {
  const [f1, setF1] = useState(1.5);
  const [f2, setF2] = useState(3);
  const [f3, setF3] = useState(0.5);
  const [cat, setCat] = useState('A');
  const [loaded, setLoaded] = useState(true);
  const [boom, setBoom] = useState(false);
  const [pre, setPre] = useState(false);
  return <JourneyRun key={`${loaded}-${boom}-${pre}-${cat}`} {...{ f1, setF1, f2, setF2, f3, setF3, cat, setCat, loaded, setLoaded, boom, setBoom, pre, setPre }} />;
}

function JourneyRun(p) {
  const stepper = useStepper(PHASES.length, 1300);
  const step = stepper.index;
  const badType = p.cat === '12';
  const pred = scoreOf(p.f1, p.f2, p.f3);
  const stopped = badType || !p.loaded || (p.boom && step >= 2);

  return (
    <Frame
      title="One request through make_prediction"
      hint="Change the body, unload the model, or make predict raise. Each phase matches a part of the course breakdown."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={tabClass(p.loaded)} onClick={() => p.setLoaded(!p.loaded)}>{p.loaded ? 'model loaded' : 'model is None'}</button>
            <button type="button" className={tabClass(p.pre)} onClick={() => p.setPre(!p.pre)}>{p.pre ? 'separate preprocessor' : 'pipeline / raw features'}</button>
            <button type="button" className={tabClass(p.boom)} onClick={() => p.setBoom(!p.boom)}>predict raises</button>
          </div>
          <StepControls stepper={stepper} total={PHASES.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            ['feature1 (float)', p.f1, p.setF1, 0, 5, 0.1],
            ['feature2 (int)', p.f2, p.setF2, 0, 10, 1],
            ['feature3 (float)', p.f3, p.setF3, 0, 5, 0.1],
          ].map(([l, v, set, min, max, st]) => (
            <label key={l} className="flex items-center gap-2 text-[11px] text-gray-300">
              <span className="w-28 font-mono">{l.split(' ')[0]}={v}</span>
              <input type="range" min={min} max={max} step={st} value={v} onChange={(e) => set(Number(e.target.value))} className="flex-1 accent-teal-500" />
            </label>
          ))}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-400 font-mono">category</span>
            {['A', 'B', '12'].map((c) => (
              <button key={c} type="button" className={`${tabClass(p.cat === c)} font-mono !py-0.5`} onClick={() => p.setCat(c)}>{c === '12' ? '12 (not a str)' : c}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {PHASES.map((ph, i) => (
            <div key={ph.id} className={`rounded-lg border px-1 py-1.5 text-[9px] text-center ${stopped && i > (badType ? -1 : !p.loaded ? 0 : 1) ? 'border-gray-800 text-gray-700 line-through' : i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'}`}>
              {ph.title}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {step === 0 && (
              badType ? (
                <>
                  <Pill code={422} text="Unprocessable Entity" />
                  <Mono className="text-rose-100">{'{ "detail": [{ "loc": ["body", "category_feature"], "msg": "Input should be a valid string" }] }'}</Mono>
                  <p className="text-[10px] text-gray-400">FastAPI rejects the body before make_prediction runs.</p>
                </>
              ) : (
                <>
                  <Mono className="text-emerald-100">{`input_data = InputFeatures(feature1=${p.f1}, feature2=${p.f2}, feature3=${p.f3}, category_feature='${p.cat}')`}</Mono>
                  <p className="text-[10px] text-gray-400">response_model=PredictionOutput will check whatever you return, and it documents the 200 schema.</p>
                </>
              )
            )}
            {step === 1 && (
              !p.loaded ? (
                <>
                  <Pill code={503} text="Service Unavailable" />
                  <Mono className="text-amber-100">{'{ "detail": "Model not loaded" }'}</Mono>
                </>
              ) : (
                <>
                  <p className="font-mono text-[11px] text-gray-300">shape (1, 3) — one row, even for a single sample</p>
                  <div className="inline-grid grid-cols-3 gap-1">
                    {[p.f1, p.f2, p.f3].map((n, i) => (
                      <div key={i} className="rounded bg-teal-500/20 border border-teal-400/40 px-2 py-1 text-center font-mono text-[12px] text-white">{n}</div>
                    ))}
                  </div>
                  {p.pre && <p className="text-[11px] text-amber-200">preprocessor.transform(features) runs first. It must be the same steps as training.</p>}
                  <p className="text-[10px] text-gray-500">category_feature is not in this array. If training one-hot encoded it, leaving it out is a silent shape or meaning error.</p>
                </>
              )
            )}
            {step === 2 && p.loaded && !badType && (
              p.boom ? (
                <>
                  <Pill code={500} text="Internal Server Error" />
                  <Mono className="text-rose-100">{'{ "detail": "Prediction error: X has 3 features, but the model is expecting 4" }'}</Mono>
                  <p className="text-[10px] text-gray-400">The except Exception block turns a crash inside predict into a 500 instead of an unhandled traceback.</p>
                </>
              ) : (
                <>
                  <Mono className="text-sky-100">{`prediction_value = array([${pred}])   # still a NumPy array`}</Mono>
                  <p className="text-[10px] text-gray-400">This is model.predict. predict_proba would be used when you also need class probabilities. A slow predict blocks the worker — Chapter 5.</p>
                </>
              )
            )}
            {((step > 0 && badType) || (step > 1 && !p.loaded) || (step > 2 && p.boom)) && (
              <p className="text-[11px] text-gray-400">This phase never runs — the request already stopped.</p>
            )}
            {step === 3 && p.loaded && !badType && !p.boom && (
              <>
                <div className="flex items-center gap-2 text-[11px] font-mono flex-wrap">
                  <span className="text-sky-200">array([{pred}])</span>
                  <ArrowRight className="w-3 h-3 text-gray-500" />
                  <span className="text-white">[{0}]</span>
                  <ArrowRight className="w-3 h-3 text-gray-500" />
                  <span className="text-emerald-200">float → {pred}</span>
                </div>
                <Pill code={200} text="OK" />
                <Mono className="text-emerald-100">{`{ "prediction": ${pred} }`}</Mono>
                <p className="text-[10px] text-gray-400">Returning the NumPy array itself is not JSON. float(...) makes a plain Python number that PredictionOutput can serialize.</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Shape: why (1, n)                                                     */
/* ------------------------------------------------------------------ */

export function ShapeVisualizer() {
  const [n, setN] = useState(1);
  const [flat, setFlat] = useState(false);
  const cols = 4;
  const ok = !flat;
  return (
    <Frame title="Even one sample is a 2D array" hint="Add samples. Then send a flat list and see the shape scikit-learn rejects.">
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-[11px] text-gray-300">
          <span>samples</span>
          <input type="range" min={1} max={5} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-32 accent-teal-500" />
          <span className="font-mono text-white">{n}</span>
          <button type="button" className={tabClass(flat)} onClick={() => setFlat(!flat)}>{flat ? 'flat list' : 'reshape(n, -1)'}</button>
        </div>
        <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${flat ? n * cols : cols}, minmax(0, 2rem))` }}>
          {Array.from({ length: n * cols }).map((_, i) => (
            <div key={i} className={`h-7 rounded border text-center font-mono text-[10px] leading-7 ${flat ? 'border-rose-400/50 bg-rose-500/10 text-rose-100' : 'border-teal-400/40 bg-teal-500/10 text-teal-100'}`}>
              {((i % cols) + 1).toFixed(1)}
            </div>
          ))}
        </div>
        <p className={`font-mono text-[12px] ${ok ? 'text-emerald-200' : 'text-rose-200'}`}>
          shape = {flat ? `(${n * cols},)` : `(${n}, ${cols})`} {ok ? '→ model.predict accepts this' : '→ ValueError: Expected 2D array, got 1D array instead'}
        </p>
        <Lesson title="One row is still a row">
          reshape(1, -1) makes a single JSON object into shape (1, n_features). A batch is the same idea with more rows.
        </Lesson>
      </div>
    </Frame>
  );
}
