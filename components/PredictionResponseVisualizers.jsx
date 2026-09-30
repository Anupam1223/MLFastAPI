import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStepper, Frame, StepControls, tabClass, Lesson, Caption } from './VisualKit';
import { Mono, Pill } from './PydanticKit';

const r4 = (n) => Math.round(n * 10000) / 10000;

/* ------------------------------------------------------------------ */
/* A raw value vs a response object                                      */
/* ------------------------------------------------------------------ */

const RAW = {
  string: { bare: '"tabby"', field: 'predicted_class', value: 'tabby' },
  number: { bare: '0.73', field: 'predicted_value', value: 0.73 },
};

export function RawResponseVisualizer() {
  const [kind, setKind] = useState('string');
  return <RawRun key={kind} kind={kind} setKind={setKind} />;
}

function RawRun({ kind, setKind }) {
  const stepper = useStepper(3, 1200);
  const step = stepper.index;
  const raw = RAW[kind];
  return (
    <Frame
      title="A bare value has no contract"
      hint="The model can emit a label or a number. The client only knows what it means once that value sits in a named JSON field."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(kind === 'string')} onClick={() => setKind('string')}>raw string</button>
            <button type="button" className={tabClass(kind === 'number')} onClick={() => setKind('number')}>raw number</button>
          </div>
          <StepControls stepper={stepper} total={3} />
        </div>
      }
    >
      <div className="space-y-3">
        <Caption text={[
          'The model has finished. This is the whole payload.',
          'The client has a value and no field name, so it cannot tell a class from a score.',
          'response_model names the field. The same value is now a documented JSON object.',
        ][step]} />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">model output</p>
            <p className="font-mono text-lg text-white">{raw.bare}</p>
          </div>
          <span className="text-gray-600">→</span>
          <div className={`rounded-xl border p-3 min-h-[5.5rem] ${step < 2 ? 'border-amber-400/40 bg-amber-500/5' : 'border-teal-400/40 bg-teal-500/5'}`}>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">client receives</p>
            {step === 0 && <p className="font-mono text-lg text-white text-center">{raw.bare}</p>}
            {step === 1 && (
              <div className="space-y-1">
                {['which field?', 'a class, a score, or a price?', 'what else came back?'].map((q) => (
                  <motion.p key={q} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="text-[11px] text-amber-200">{q}</motion.p>
                ))}
              </div>
            )}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Mono className="text-emerald-100">{`{ "${raw.field}": ${JSON.stringify(raw.value)} }`}</Mono>
              </motion.div>
            )}
          </div>
        </div>
        {step === 2 && <Lesson title="What FastAPI adds">The response model is also the schema in the generated docs, so a client can see the field before it ever calls the endpoint.</Lesson>}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* PredictionResponse contract                                           */
/* ------------------------------------------------------------------ */

export function ResponseContractVisualizer() {
  const [bare, setBare] = useState(false);
  return <ContractRun key={bare ? 'bare' : 'model'} bare={bare} setBare={setBare} />;
}

function ContractRun({ bare, setBare }) {
  const stepper = useStepper(4, 1300);
  const step = stepper.index;
  const stages = [
    { name: 'body', text: '{ "feature1": 1.2, "feature2": 3 }' },
    { name: 'preprocess', text: 'features.dict() → [[1.2, 3]]' },
    { name: 'predict', text: 'model.predict(...) → "cat"' },
    { name: 'return', text: bare ? '"cat"' : 'PredictionResponse(predicted_class="cat")' },
  ];
  return (
    <Frame
      title="The return value has to fit the model"
      hint="response_model=PredictionResponse is a mold. A PredictionResponse instance fits. A bare string does not."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(!bare)} onClick={() => setBare(false)}>return the model</button>
            <button type="button" className={tabClass(bare)} onClick={() => setBare(true)}>return the raw label</button>
          </div>
          <StepControls stepper={stepper} total={4} />
        </div>
      }
    >
      <div className="space-y-3">
        <Caption text={stages[step].text} />
        <div className="flex gap-1">
          {['POST', 'preprocess', 'predict', 'return'].map((label, i) => (
            <div key={label} className={`flex-1 rounded-lg border px-2 py-2 text-center ${i === step ? 'border-teal-400 bg-teal-500/10' : i < step ? 'border-gray-700 bg-gray-900' : 'border-gray-800 opacity-50'}`}>
              <p className="text-[10px] text-gray-400">{i + 1}</p>
              <p className="text-[11px] text-white">{label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">PredictionResponse mold</p>
          <div className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-teal-400/50 px-3 py-2">
            <span className="font-mono text-[11px] text-teal-100">predicted_class: str</span>
            {step < 3 && <span className="text-[10px] text-gray-500">waiting</span>}
            {step === 3 && !bare && <span className="text-[10px] font-semibold text-emerald-300">"cat" fits</span>}
            {step === 3 && bare && <span className="text-[10px] font-semibold text-rose-300">a lone string has no field</span>}
          </div>
        </div>
        {step === 3 && !bare && (
          <div className="space-y-1">
            <Pill code={200} text="OK" />
            <Mono className="text-emerald-100">{'{ "predicted_class": "cat" }'}</Mono>
          </div>
        )}
        {step === 3 && bare && (
          <div className="space-y-1">
            <Pill code={500} text="Response Validation Error" />
            <Mono className="text-rose-100">string "cat" cannot fill PredictionResponse</Mono>
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Probability bars                                                       */
/* ------------------------------------------------------------------ */

const CLASS_PRESET = (top) => {
  const rest = 1 - top;
  return [
    { name: 'Class D', p: rest * 0.14 },
    { name: 'Class C', p: rest * 0.3 },
    { name: 'Class B', p: rest * 0.56 },
    { name: 'Class A', p: top },
  ];
};

export function ProbabilityChartVisualizer() {
  const [top, setTop] = useState(0.74);
  const [sorted, setSorted] = useState(false);
  const [proba, setProba] = useState(true);
  const rows = CLASS_PRESET(top);
  const view = sorted ? [...rows].sort((a, b) => b.p - a.p) : rows;
  const winner = [...rows].sort((a, b) => b.p - a.p)[0];
  const dict = Object.fromEntries(view.map((row) => [row.name, r4(row.p)]));
  return (
    <Frame
      title="predict() names a class. predict_proba() shows the rest."
      hint="Drag confidence. Class A keeps the largest share. Sorting only changes the order the client reads."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <button type="button" className={tabClass(proba)} onClick={() => setProba(!proba)}>{proba ? 'with probabilities' : 'label only'}</button>
            <button type="button" className={tabClass(sorted)} onClick={() => setSorted(!sorted)}>{sorted ? 'sorted high → low' : 'model class order'}</button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-gray-300">
          <span className="w-24">Class A share</span>
          <input type="range" min={0.4} max={0.95} step={0.01} value={top} onChange={(e) => setTop(Number(e.target.value))} className="flex-1 accent-teal-500" />
          <span className="font-mono text-white w-12">{top.toFixed(2)}</span>
        </label>
        <div className="rounded-xl bg-white text-slate-900 p-3">
          <div className="space-y-1.5">
            {(proba ? view : [winner]).map((row) => (
              <div key={row.name} className="grid grid-cols-[4.2rem_1fr] items-center gap-2">
                <span className="text-[11px] text-right">{row.name}</span>
                <div className="h-4 bg-slate-100 relative">
                  <motion.div animate={{ width: `${row.p * 100}%` }} className="h-full bg-[#4c6ef5]" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1 ml-[4.2rem] flex justify-between text-[9px] text-slate-500 font-mono">
            <span>0</span><span>0.2</span><span>0.4</span><span>0.6</span><span>0.8</span><span>1</span>
          </div>
          <p className="mt-2 text-[10px] italic text-slate-500 text-center">{winner.name} has the highest probability.</p>
        </div>
        <Mono className="text-emerald-100">
          {proba
            ? JSON.stringify({ predicted_class: winner.name, probabilities: dict })
            : JSON.stringify({ predicted_class: winner.name })}
        </Mono>
        {!proba && <p className="text-[11px] text-amber-200">Without the bars, a close call looks the same as a sure one.</p>}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Output shapes                                                          */
/* ------------------------------------------------------------------ */

const SHAPES = [
  {
    id: 'class',
    label: 'classification',
    json: { predicted_class: 'cat', probabilities: { cat: 0.95, dog: 0.04, other: 0.01 } },
  },
  {
    id: 'reg',
    label: 'regression',
    json: { predicted_value: 12.4, confidence_interval: { lower_bound: 10.1, upper_bound: 14.8 } },
  },
  {
    id: 'multi',
    label: 'multi-output',
    json: { price: 240.5, demand: 18, risk: 0.22 },
  },
  {
    id: 'detect',
    label: 'detection',
    json: { boxes: [{ label: 'cat', x: 12, y: 18, w: 40, h: 36 }, { label: 'bowl', x: 58, y: 48, w: 30, h: 22 }] },
  },
];

export function OutputShapeVisualizer() {
  const [id, setId] = useState('class');
  const shape = SHAPES.find((item) => item.id === id);
  return (
    <Frame
      title="The response model matches the model you trained"
      hint="Same idea every time: describe the output, then put that model on response_model."
      footer={
        <div className="flex gap-2 flex-wrap">
          {SHAPES.map((item) => (
            <button key={item.id} type="button" className={tabClass(id === item.id)} onClick={() => setId(item.id)}>{item.label}</button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 min-h-[8.5rem] flex items-center justify-center">
          {id === 'class' && <ClassSketch />}
          {id === 'reg' && <RegressionSketch />}
          {id === 'multi' && <MultiSketch />}
          {id === 'detect' && <DetectSketch />}
        </div>
        <Mono className="text-emerald-100">{JSON.stringify(shape.json)}</Mono>
      </div>
    </Frame>
  );
}

function ClassSketch() {
  return (
    <div className="w-full max-w-xs space-y-1">
      {[['cat', 0.95], ['dog', 0.04], ['other', 0.01]].map(([name, p]) => (
        <div key={name} className="grid grid-cols-[3rem_1fr_2.2rem] items-center gap-2 text-[10px]">
          <span className="text-gray-400">{name}</span>
          <div className="h-2 rounded bg-gray-800"><motion.div initial={{ width: 0 }} animate={{ width: `${p * 100}%` }} className={`h-full rounded ${name === 'cat' ? 'bg-teal-400' : 'bg-gray-600'}`} /></div>
          <span className="font-mono text-gray-300">{p}</span>
        </div>
      ))}
    </div>
  );
}

function RegressionSketch() {
  const left = 10.1;
  const right = 14.8;
  const mid = 12.4;
  const x = (n) => ((n - 8) / 10) * 100;
  return (
    <div className="w-full max-w-sm">
      <div className="relative h-10">
        <div className="absolute top-4 left-0 right-0 h-px bg-gray-600" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-2 h-4 bg-teal-400/30" style={{ left: `${x(left)}%`, width: `${x(right) - x(left)}%` }} />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 w-1 h-4 bg-white" style={{ left: `${x(mid)}%` }} />
      </div>
      <div className="flex justify-between font-mono text-[10px] text-gray-400">
        <span>lower 10.1</span><span className="text-white">12.4</span><span>upper 14.8</span>
      </div>
    </div>
  );
}

function MultiSketch() {
  const heads = [
    ['price', '240.5'],
    ['demand', '18'],
    ['risk', '0.22'],
  ];
  return (
    <div className="flex gap-2">
      {heads.map(([name, value], i) => (
        <motion.div key={name} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }} className="rounded-lg border border-gray-700 px-3 py-2 text-center">
          <p className="text-[10px] text-gray-500">{name}</p>
          <p className="font-mono text-sm text-white">{value}</p>
        </motion.div>
      ))}
    </div>
  );
}

function DetectSketch() {
  const boxes = [
    { label: 'cat', x: 18, y: 16, w: 38, h: 42 },
    { label: 'bowl', x: 58, y: 52, w: 28, h: 26 },
  ];
  return (
    <div className="relative w-44 h-28 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border border-gray-600">
      {boxes.map((box, i) => (
        <motion.div key={box.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }} className="absolute border-2 border-teal-300" style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}>
          <span className="absolute -top-3 left-0 text-[8px] bg-teal-400 text-slate-950 px-1">{box.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Rounding and prediction errors                                         */
/* ------------------------------------------------------------------ */

export function PrecisionErrorVisualizer() {
  const [boom, setBoom] = useState(false);
  return <PrecisionRun key={boom ? 'boom' : 'ok'} boom={boom} setBoom={setBoom} />;
}

function PrecisionRun({ boom, setBoom }) {
  const stepper = useStepper(3, 1200);
  const step = stepper.index;
  const raw = '0.73333333333334';
  return (
    <Frame
      title="Round the float, and fail as an HTTP error"
      hint="The response model will happily serialize a long float. Rounding is your code. A crash during predict should be status 500, not a prediction body."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button type="button" className={tabClass(boom)} onClick={() => setBoom(!boom)}>{boom ? 'model raised' : 'model succeeded'}</button>
          <StepControls stepper={stepper} total={3} />
        </div>
      }
    >
      <div className="space-y-3">
        {boom ? (
          <div className="space-y-2">
            <Caption text="predict() raised. The endpoint raises HTTPException instead of returning ProbabilityResponse." />
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 font-mono text-[12px] text-rose-100">Exception: feature mismatch</div>
            <Pill code={500} text="Internal Server Error" />
            <Mono className="text-rose-100">{'{ "detail": "Prediction error: feature mismatch" }'}</Mono>
          </div>
        ) : (
          <div className="space-y-2">
            <Caption text={['predict_proba hands back a long float.', 'The endpoint rounds it before building the response.', 'The client sees a short decimal and status 200.'][step]} />
            <p className="font-mono text-sm text-center">
              <span className="text-white">0.7333</span>
              <span className={step === 0 ? 'text-amber-300' : 'text-gray-700'}>{raw.slice(6)}</span>
            </p>
            {step >= 1 && <p className="text-center text-[11px] text-teal-200">round(value, 4) → 0.7333</p>}
            {step === 2 && (
              <div className="space-y-1">
                <Pill code={200} text="OK" />
                <Mono className="text-emerald-100">{'{ "predicted_class": "cat", "probabilities": { "cat": 0.7333, "dog": 0.2667 } }'}</Mono>
              </div>
            )}
          </div>
        )}
      </div>
    </Frame>
  );
}
