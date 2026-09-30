import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileImage, Braces } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, Caption, CodeLines } from './VisualKit';
import { Mono, Pill } from './PydanticKit';

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const r1 = (n) => Math.round(n * 10) / 10;

const SPECIES = ['setosa', 'versicolor', 'virginica'];
function irisCall(f) {
  const s = f.petal_length * 0.6 + f.petal_width * 1.4;
  const idx = s < 2 ? 0 : s < 4.2 ? 1 : 2;
  const proba = [0.05, 0.05, 0.05];
  proba[idx] = 0.9;
  return { idx, proba };
}

/* ------------------------------------------------------------------ */
/* Formats converge                                                       */
/* ------------------------------------------------------------------ */

const KINDS = [
  { id: 'json', label: 'JSON object', sample: '{ "sepal_length": 5.1, ... }', out: 'array shape (1, 4)' },
  { id: 'batch', label: 'JSON array', sample: '{ "instances": [ {...}, {...} ] }', out: 'array shape (N, 4)' },
  { id: 'text', label: 'text', sample: '{ "text": "great product" }', out: 'string or vector' },
  { id: 'file', label: 'file upload', sample: 'multipart image bytes', out: 'tensor (1, 224, 224, 3)' },
];

export function FormatsConvergeVisualizer() {
  const [id, setId] = useState('json');
  const k = KINDS.find((x) => x.id === id);
  return (
    <Frame title="The API is the bridge between formats" hint="Clients send JSON or files. The model wants arrays or tensors. Pick a format and follow it to predict().">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((x) => (
            <button key={x.id} type="button" className={tabClass(id === x.id)} onClick={() => setId(x.id)}>{x.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 items-center">
          <motion.div key={id} initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="rounded-xl border border-sky-400/40 p-2">
            <p className="text-[9px] uppercase tracking-wider text-sky-300">client</p>
            <p className="font-mono text-[10px] text-sky-100 mt-1">{k.sample}</p>
          </motion.div>
          <ArrowRight className="w-4 h-4 text-gray-500" />
          <div className="rounded-xl border border-amber-400/40 p-2 text-center">
            <p className="text-[9px] uppercase tracking-wider text-amber-300">FastAPI</p>
            <p className="text-[10px] text-gray-300 mt-1">validate or read → preprocess</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500" />
          <div className="rounded-xl border border-emerald-400/40 p-2">
            <p className="text-[9px] uppercase tracking-wider text-emerald-300">model.predict</p>
            <p className="font-mono text-[10px] text-emerald-100 mt-1">{k.out}</p>
          </div>
        </div>
        <Lesson title="Same pattern every time">
          Receive, validate or read, preprocess into the library’s exact format, predict, then turn the result back into JSON.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Single iris JSON                                                       */
/* ------------------------------------------------------------------ */

export function SingleIrisVisualizer() {
  const [f, setF] = useState({ sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2 });
  const [flat, setFlat] = useState(false);
  const vals = [f.sepal_length, f.sepal_width, f.petal_length, f.petal_width];
  const { idx, proba } = irisCall(f);
  const set = (k, v) => setF((c) => ({ ...c, [k]: r1(Number(v)) }));

  return (
    <Frame title="One JSON object → shape (1, 4)" hint="Move the measurements. reshape(1, -1) is what turns the list into the row scikit-learn expects.">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(f).map(([k, v]) => (
            <label key={k} className="flex items-center gap-2 text-[11px] text-gray-300">
              <span className="w-24 font-mono truncate">{k}</span>
              <input type="range" min={0} max={8} step={0.1} value={v} onChange={(e) => set(k, e.target.value)} className="flex-1 accent-teal-500" />
              <span className="font-mono text-white w-6">{v}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" className={tabClass(!flat)} onClick={() => setFlat(false)}>reshape(1, -1)</button>
          <button type="button" className={tabClass(flat)} onClick={() => setFlat(true)}>forget the reshape</button>
        </div>
        <div className={`inline-flex gap-1 rounded-lg border p-1 ${flat ? 'border-rose-400/50' : 'border-teal-400/40'}`}>
          {vals.map((v, i) => (
            <div key={i} className="w-12 h-8 rounded bg-teal-500/15 text-center font-mono text-[11px] leading-8 text-white">{v}</div>
          ))}
        </div>
        {flat ? (
          <Mono className="text-rose-100">ValueError: Expected 2D array, got 1D array instead. shape (4,)</Mono>
        ) : (
          <>
            <p className="font-mono text-[11px] text-emerald-200">input_array.shape == (1, 4)</p>
            <Pill code={200} text="OK" />
            <Mono className="text-emerald-100">{JSON.stringify({ prediction: idx, probability: proba }, null, 2)}</Mono>
            <p className="text-[10px] text-gray-400">prediction[0].item() is a Python int. probability[0].tolist() is a Python list. NumPy types are not left in the JSON.</p>
          </>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Batch                                                                  */
/* ------------------------------------------------------------------ */

const EMPTY = { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2 };

export function BatchIrisVisualizer() {
  const [rows, setRows] = useState([
    { ...EMPTY },
    { sepal_length: 6.0, sepal_width: 2.9, petal_length: 4.5, petal_width: 1.5 },
  ]);
  const [mode, setMode] = useState('batch');
  const add = () => setRows((r) => [...r, { sepal_length: 6.5, sepal_width: 3.0, petal_length: 5.5, petal_width: 2.0 }]);

  return (
    <Frame
      title="Many rows, one predict call"
      hint="Add flowers. Batch sends them as one JSON array; separate calls repeat the whole HTTP round trip."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(mode === 'batch')} onClick={() => setMode('batch')}>POST /predict/batch</button>
          <button type="button" className={tabClass(mode === 'many')} onClick={() => setMode('many')}>{rows.length} separate calls</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <button type="button" onClick={add} className="px-2 py-1 rounded bg-teal-600 text-white text-[11px]">+ instance</button>
          <button type="button" onClick={() => setRows((r) => r.slice(0, -1))} disabled={rows.length < 2} className="px-2 py-1 rounded bg-gray-800 text-gray-200 text-[11px] disabled:opacity-30">remove</button>
        </div>
        <div className="rounded-xl border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-4 px-2 py-1 text-[9px] uppercase text-gray-500 border-b border-gray-800">
            <span>sepal L</span><span>sepal W</span><span>petal L</span><span>petal W</span>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-4 px-2 py-1 font-mono text-[11px] text-white border-b border-gray-900">
              {Object.values(row).map((v, j) => <span key={j}>{v}</span>)}
            </div>
          ))}
        </div>
        <p className="font-mono text-[11px] text-teal-200">np.array(batch_features).shape == ({rows.length}, 4)</p>
        <div className="flex gap-1 items-end h-10">
          {mode === 'batch' ? (
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="origin-left h-6 flex-1 rounded bg-teal-500/70 text-[10px] text-white flex items-center justify-center">1 request · 1 predict</motion.div>
          ) : (
            rows.map((_, i) => (
              <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} className="origin-bottom flex-1 h-6 rounded bg-amber-500/70 text-[9px] text-white flex items-center justify-center">call {i + 1}</motion.div>
            ))
          )}
        </div>
        {mode === 'batch' && (
          <Mono className="text-emerald-100">
            {JSON.stringify({
              predictions: rows.map((row) => {
                const { idx, proba } = irisCall(row);
                return { prediction: idx, probability: proba };
              }),
            }, null, 2)}
          </Mono>
        )}
        <p className="text-[10px] text-gray-400">One batch call avoids repeating the HTTP overhead and lets the library run its vectorized predict.</p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Text                                                                   */
/* ------------------------------------------------------------------ */

export function TextPredictVisualizer() {
  const [text, setText] = useState('I love this product');
  const [pipeline, setPipeline] = useState(true);
  const [cut, setCut] = useState(0.5);
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const POS = ['love', 'great', 'excellent', 'good', 'amazing'];
  const NEG = ['hate', 'bad', 'terrible', 'awful', 'poor'];
  const score = clamp(0.5 + words.filter((w) => POS.includes(w)).length * 0.2 - words.filter((w) => NEG.includes(w)).length * 0.2, 0.05, 0.95);
  const label = score > cut ? 'positive' : 'negative';

  return (
    <Frame
      title="Text in, and where the vectorizer lives"
      hint="If the saved artifact is a Pipeline with a TfidfVectorizer, the endpoint passes the raw string. Otherwise you must vectorize first."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(pipeline)} onClick={() => setPipeline(true)}>Pipeline includes vectorizer</button>
          <button type="button" className={tabClass(!pipeline)} onClick={() => setPipeline(false)}>you preprocess</button>
        </div>
      }
    >
      <div className="space-y-3">
        <input value={text} onChange={(e) => setText(e.target.value)} className="w-full rounded-lg bg-black/70 border border-gray-700 focus:border-teal-400 outline-none px-2 py-1.5 text-[12px] text-sky-100" />
        <div className="flex items-center gap-2 flex-wrap">
          {words.map((w, i) => (
            <span key={`${w}-${i}`} className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${POS.includes(w) ? 'bg-emerald-500/20 text-emerald-100' : NEG.includes(w) ? 'bg-rose-500/20 text-rose-100' : 'bg-gray-800 text-gray-400'}`}>{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <div className="rounded-lg border border-sky-400/40 p-2 font-mono text-[10px] text-sky-100">"{text}"</div>
          <ArrowRight className="w-4 h-4 text-gray-500" />
          <div className={`rounded-lg border p-2 text-[11px] ${pipeline ? 'border-emerald-400/40 text-emerald-100' : 'border-amber-400/40 text-amber-100'}`}>
            {pipeline ? 'model.predict([text]) — the Pipeline tokenizes and vectorizes internally' : 'preprocess_text(text) → vector, then model.predict(vector). These steps must match training exactly.'}
          </div>
        </div>
        <label className="flex items-center gap-2 text-[11px] text-gray-300">
          <span className="font-mono">cut {cut.toFixed(2)}</span>
          <input type="range" min={0.1} max={0.9} step={0.05} value={cut} onChange={(e) => setCut(Number(e.target.value))} className="flex-1 accent-teal-500" />
        </label>
        <div className="h-3 rounded bg-gray-800 overflow-hidden relative">
          <motion.div animate={{ width: `${score * 100}%` }} className={`h-full ${label === 'positive' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          <div className="absolute top-0 bottom-0 w-px bg-white" style={{ left: `${cut * 100}%` }} />
        </div>
        <Mono className="text-emerald-100">{JSON.stringify({ input_text: text, sentiment_score: r1(score), sentiment_label: label })}</Mono>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Image preprocess                                                       */
/* ------------------------------------------------------------------ */

const RGB = [
  [[196, 92, 58], [214, 120, 72], [64, 48, 40], [36, 32, 30]],
  [[232, 140, 90], [240, 168, 110], [80, 60, 48], [40, 34, 32]],
  [[180, 80, 52], [200, 100, 64], [70, 52, 44], [32, 28, 26]],
  [[120, 64, 44], [90, 50, 36], [48, 40, 36], [24, 22, 20]],
];
const grayOf = ([r, g, b]) => {
  const y = Math.round(0.3 * r + 0.59 * g + 0.11 * b);
  return [y, y, y];
};

const PRE_LINES = [
  'img = Image.open(io.BytesIO(image_bytes))',
  'img = img.resize((224, 224))',
  'img_array = np.array(img)',
  'if img_array.ndim == 2:',
  '    img_array = np.stack((img_array,) * 3, axis=-1)',
  'img_array = img_array / 255.0',
  'img_array = np.expand_dims(img_array, axis=0)',
  'return img_array.astype(np.float32)',
];

const IMG_STEPS = [
  { title: 'read() → the raw file bytes', line: 'contents = await image_file.read()', active: [] },
  { title: 'Image.open turns those bytes into a picture', line: PRE_LINES[0], active: [0] },
  { title: 'resize((224, 224)) — the size this model was trained on', line: PRE_LINES[1], active: [1] },
  { title: 'np.array(img) — every pixel becomes a number', line: PRE_LINES[2], active: [2] },
  { title: 'A gray photo has one channel. Stack it into three.', line: PRE_LINES[4], active: [3, 4] },
  { title: 'Divide by 255 so values sit between 0 and 1', line: PRE_LINES[5], active: [5] },
  { title: 'expand_dims(axis=0) adds a batch of length 1', line: PRE_LINES[6], active: [6] },
  { title: 'astype(float32) — the dtype the model expects', line: PRE_LINES[7], active: [7] },
  { title: 'predict, argmax, then close the file', line: 'np.argmax(prediction[0])', active: [] },
];

function PixelGrid({ cells, numbers, norm, channel, box = 'w-7 h-7' }) {
  return (
    <div className="inline-grid grid-cols-4 gap-0.5">
      {cells.map((rgb, i) => {
        const shown = channel === undefined ? rgb : [0, 0, 0].map((_, c) => (c === channel ? rgb[c] : 0));
        const label = norm ? (shown[channel ?? 0] / 255).toFixed(2) : shown[channel ?? 0];
        return (
          <motion.div
            key={i}
            layout
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: norm ? 0.8 : 1 }}
            className={`${box} rounded-sm flex items-center justify-center`}
            style={{ background: `rgb(${shown[0]},${shown[1]},${shown[2]})` }}
          >
            {numbers && <span className="font-mono text-[7px] text-white drop-shadow">{label}</span>}
          </motion.div>
        );
      })}
    </div>
  );
}

export function ImagePipelineVisualizer() {
  const [gray, setGray] = useState(false);
  const [bad, setBad] = useState(false);
  return <ImageRun key={`${gray}-${bad}`} gray={gray} setGray={setGray} bad={bad} setBad={setBad} />;
}

function ImageRun({ gray, setGray, bad, setBad }) {
  const stepper = useStepper(IMG_STEPS.length, 1400);
  const step = stepper.index;
  const dead = bad && step >= 1;
  const cells = (gray ? RGB.map((row) => row.map(grayOf)) : RGB).flat();
  const s = IMG_STEPS[step];

  const shape = ['bytes', 'PIL Image 640×480', 'PIL Image 224×224', gray ? '(224, 224)  uint8' : '(224, 224, 3)  uint8', '(224, 224, 3)  uint8', '(224, 224, 3)  float', '(1, 224, 224, 3)', '(1, 224, 224, 3) float32', 'class index'][step];

  return (
    <Frame
      title="preprocess_image, one line at a time"
      hint="Step through the function. Grayscale photos get copied into 3 channels. A corrupt file dies at Image.open, and the file is still closed."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(gray)} onClick={() => setGray(!gray)}>{gray ? 'grayscale photo' : 'RGB photo'}</button>
            <button type="button" className={tabClass(bad)} onClick={() => setBad(!bad)}>{bad ? 'corrupt file' : 'valid image'}</button>
          </div>
          <StepControls stepper={stepper} total={IMG_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-1">
          {IMG_STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${dead && i >= 1 ? 'bg-rose-500/40' : i <= step ? 'bg-teal-400' : 'bg-gray-800'}`} />
          ))}
        </div>
        <Caption text={dead ? 'Image.open failed. ValueError("Invalid image file or format") — finally still runs await image_file.close().' : `${step + 1}. ${step === 4 ? (gray ? 'ndim == 2, so the one channel is copied into R, G, and B' : 'ndim == 3 already, so the stack line is skipped') : s.title}`} />

        <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 min-h-[9rem] flex items-center justify-center">
          {dead ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-1">
              <p className="font-mono text-[11px] text-rose-200">UnidentifiedImageError</p>
              <p className="text-[10px] text-gray-400">cannot identify image file</p>
            </motion.div>
          ) : (
            <Stage key={step} step={step} cells={cells} gray={gray} />
          )}
        </div>
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <p className="font-mono text-[10px] text-teal-200">{dead ? 'raise ValueError(...)' : s.line}</p>
          <p className="font-mono text-[12px] text-white">{dead ? 'no array' : shape}</p>
        </div>
        <CodeLines lines={PRE_LINES} active={dead ? [0] : s.active} />

        {step === 8 && !dead && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
            <div className="flex gap-1 items-end h-12">
              {[
                ['siamese', 0.05],
                ['persian', 0.12],
                ['tabby', 0.71],
                ['other', 0.12],
              ].map(([name, v]) => (
                <div key={name} className="flex-1 text-center">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${v * 40}px` }} className={`mx-auto w-full rounded-t ${name === 'tabby' ? 'bg-teal-400' : 'bg-gray-600'}`} />
                  <p className={`text-[8px] mt-0.5 ${name === 'tabby' ? 'text-teal-200' : 'text-gray-500'}`}>{name}</p>
                </div>
              ))}
            </div>
            <Pill code={200} text="OK" />
            <Mono className="text-emerald-100">{'{ "filename": "cat.jpg", "prediction_index": 2, "predicted_label": "tabby" }'}</Mono>
          </motion.div>
        )}
        {dead && <Mono className="text-rose-100">{'{ "error": "Invalid image file or format: cannot identify image file" }'}</Mono>}
      </div>
    </Frame>
  );
}

function Stage({ step, cells, gray }) {
  if (step === 0) {
    return (
      <div className="space-y-2 w-full">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">file bytes</p>
        <div className="flex flex-wrap gap-1">
          {['ff', 'd8', 'ff', 'e0', '00', '10', '4a', '46', '49', '46', '00', '01'].map((b, i) => (
            <motion.span key={b + i} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.04 }} className="px-1.5 py-0.5 rounded bg-sky-500/15 font-mono text-[10px] text-sky-100">
              {b}
            </motion.span>
          ))}
          <span className="text-gray-600 text-[10px] self-center">… {gray ? '12 KB' : '48 KB'}</span>
        </div>
      </div>
    );
  }
  if (step === 1 || step === 2) {
    const square = step === 2;
    return (
      <div className="text-center space-y-2">
        <motion.div
          initial={{ width: 200, height: 100 }}
          animate={{ width: square ? 128 : 200, height: square ? 128 : 100 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className="mx-auto overflow-hidden rounded-lg border border-gray-600"
        >
          <div className="w-full h-full grid grid-cols-4 grid-rows-4">
            {cells.map((rgb, i) => (
              <div key={i} style={{ background: `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` }} />
            ))}
          </div>
        </motion.div>
        <p className="font-mono text-[11px] text-white">{square ? '224 × 224' : '640 × 480  →  shrinking'}</p>
      </div>
    );
  }
  if (step === 3) {
    const p = cells[5];
    return (
      <div className="space-y-2 text-center">
        <PixelGrid cells={cells} />
        <p className="font-mono text-[11px] text-white">pixel [1, 1] = {gray ? String(p[0]) : `[${p.join(', ')}]`}</p>
        <p className="text-[10px] text-gray-400">{gray ? 'ndim == 2, one number per pixel' : 'ndim == 3, three numbers (R, G, B) per pixel'}</p>
      </div>
    );
  }
  if (step === 4) {
    if (!gray) {
      return (
        <div className="space-y-2">
          <div className="flex gap-2 justify-center">
            {['R', 'G', 'B'].map((name, ch) => (
              <motion.div key={name} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: ch * 0.1 }} className="text-center">
                <p className="text-[9px] text-gray-400 mb-1">{name}</p>
                <PixelGrid cells={cells} channel={ch} box="w-4 h-4" />
              </motion.div>
            ))}
          </div>
          <p className="text-center text-[10px] text-gray-400">already 3 channels — np.stack does not run</p>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <div className="text-center">
          <p className="text-[9px] text-gray-500 mb-1">ndim 2</p>
          <PixelGrid cells={cells} box="w-4 h-4" />
        </div>
        <span className="font-mono text-teal-300 text-sm">×3</span>
        <div className="flex gap-1">
          {['R', 'G', 'B'].map((name, ch) => (
            <motion.div key={name} initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 + ch * 0.12 }} className="text-center">
              <p className="text-[9px] text-gray-400 mb-1">{name}</p>
              <PixelGrid cells={cells} box="w-4 h-4" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
  if (step === 5) {
    const sample = cells[5];
    return (
      <div className="space-y-2 w-full max-w-xs">
        <div className="flex justify-center"><PixelGrid cells={cells} norm /></div>
        <div className="space-y-1">
          {['R', 'G', 'B'].map((name, i) => (
            <div key={name} className="grid grid-cols-[1rem_2rem_1fr_3rem] items-center gap-2 font-mono text-[10px]">
              <span className="text-gray-500">{name}</span>
              <span className="text-gray-400">{sample[i]}</span>
              <div className="h-1.5 rounded bg-gray-800 overflow-hidden"><motion.div initial={{ width: '100%' }} animate={{ width: `${(sample[i] / 255) * 100}%` }} className="h-full bg-teal-400" /></div>
              <span className="text-teal-200">{(sample[i] / 255).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (step === 6) {
    return (
      <div className="flex items-center gap-2">
        <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="font-mono text-2xl text-teal-300">[</motion.span>
        <div className="rounded-lg border border-teal-400/50 p-1">
          <PixelGrid cells={cells} />
          <p className="text-center text-[8px] text-gray-500 mt-1">the one image</p>
        </div>
        <motion.span initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="font-mono text-2xl text-teal-300">]</motion.span>
        <p className="text-[10px] text-gray-400 max-w-[8rem]">axis 0 is the batch. Length 1, because this request has one photo.</p>
      </div>
    );
  }
  if (step === 7) {
    return (
      <div className="text-center space-y-2">
        <motion.div initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} className="font-mono text-sm text-white">
          uint8 &nbsp;→&nbsp; <span className="text-teal-200">float32</span>
        </motion.div>
        <p className="font-mono text-[11px] text-gray-300">0.80 becomes 0.8000000… stored as 32-bit float</p>
        <PixelGrid cells={cells} numbers norm />
      </div>
    );
  }
  return <p className="text-[11px] text-gray-400">The tensor is what model.predict receives.</p>;
}

/* ------------------------------------------------------------------ */
/* Base64 vs upload                                                       */
/* ------------------------------------------------------------------ */

export function Base64CompareVisualizer() {
  const [kb, setKb] = useState(80);
  const [mode, setMode] = useState('file');
  const b64 = Math.round(kb * 1.37);
  return (
    <Frame title="Upload the file, or put it inside JSON" hint="Base64 avoids multipart, and it inflates the payload by about a third. The decoder then feeds the same preprocess_image.">
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] text-gray-300">
          <span className="w-24">image size</span>
          <input type="range" min={10} max={2000} value={kb} onChange={(e) => setKb(Number(e.target.value))} className="flex-1 accent-teal-500" />
          <span className="font-mono text-white w-16">{kb} KB</span>
        </label>
        <div className="flex gap-2">
          <button type="button" className={tabClass(mode === 'file')} onClick={() => setMode('file')}><FileImage className="w-3.5 h-3.5 inline" /> multipart file</button>
          <button type="button" className={tabClass(mode === 'b64')} onClick={() => setMode('b64')}><Braces className="w-3.5 h-3.5 inline" /> Base64 in JSON</button>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-gray-400"><span className="w-16">raw</span><div className="h-3 rounded bg-teal-400/80" style={{ width: `${(kb / 2000) * 100}%` }} /><span className="font-mono text-white">{kb} KB</span></div>
          <div className="flex items-center gap-2 text-[10px] text-gray-400"><span className="w-16">on the wire</span><div className={`h-3 rounded ${mode === 'b64' ? 'bg-amber-400/80' : 'bg-teal-400/80'}`} style={{ width: `${((mode === 'b64' ? b64 : kb) / (2000 * 1.37)) * 100}%` }} /><span className="font-mono text-white">{mode === 'b64' ? `${b64} KB` : `${kb} KB`}</span></div>
        </div>
        <Mono className={mode === 'b64' ? 'text-amber-100' : 'text-sky-100'}>
          {mode === 'b64' ? '{ "image_b64": "iVBORw0KGgoAAA...", "filename": "cat.png" }' : 'Content-Type: multipart/form-data; file=@cat.png'}
        </Mono>
        {mode === 'b64' && <p className="text-[11px] text-gray-300">base64.b64decode(request.image_b64) → the same bytes preprocess_image already knows. A bad string raises binascii.Error.</p>}
        <Lesson title="Pick by size">
          File upload is the better default for larger binary data. Base64 fits small images when the client can only send JSON.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Data-flow diagram                                                      */
/* ------------------------------------------------------------------ */

const JSON_PATH = ['client-json', 'endpoint', 'validate', 'prep', 'model'];
const FILE_PATH = ['client-file', 'endpoint', 'read', 'prep', 'model'];

export function DataFlowVisualizer() {
  const [kind, setKind] = useState('json');
  return <FlowRun key={kind} kind={kind} setKind={setKind} />;
}

function FlowRun({ kind, setKind }) {
  const path = kind === 'json' ? JSON_PATH : FILE_PATH;
  const stepper = useStepper(path.length, 1100);
  const step = stepper.index;
  const on = (id) => path.indexOf(id) !== -1 && path.indexOf(id) <= step;

  const Box = ({ id, x, y, w, h, title, sub, fill }) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={on(id) ? fill : '#f3f4f6'} stroke={on(id) ? '#0f766e' : '#9ca3af'} strokeWidth={on(id) ? 2 : 1} />
      <text x={x + w / 2} y={y + 16} textAnchor="middle" fontSize={9} fill="#111827">{title}</text>
      {sub && <text x={x + w / 2} y={y + 28} textAnchor="middle" fontSize={8} fill="#4b5563">{sub}</text>}
    </g>
  );

  return (
    <Frame
      title="Two ways in, one model"
      hint="Send JSON or a file. Both paths meet at preprocessing, then model.predict, then a JSON response."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(kind === 'json')} onClick={() => setKind('json')}>JSON payload</button>
            <button type="button" className={tabClass(kind === 'file')} onClick={() => setKind('file')}>file upload</button>
          </div>
          <StepControls stepper={stepper} total={path.length} />
        </div>
      }
    >
      <div className="space-y-2">
        <div className="rounded-xl bg-white p-2 overflow-x-auto">
          <svg viewBox="0 0 760 200" className="w-full min-w-[520px]">
            <rect x={150} y={8} width={470} height={170} rx={6} fill="#f9fafb" stroke="#e5e7eb" />
            <text x={385} y={168} textAnchor="middle" fontSize={9} fill="#6b7280">FastAPI Application</text>
            <Box id="client-json" x={8} y={24} w={110} h={36} title="JSON payload" sub="single or batch" fill="#dbeafe" />
            <Box id="client-file" x={8} y={100} w={110} h={36} title="File upload" sub="image, audio…" fill="#dbeafe" />
            <Box id="endpoint" x={170} y={62} w={100} h={36} title="API endpoint" sub="/predict/…" fill="#e5e7eb" />
            <Box id="validate" x={300} y={20} w={120} h={36} title="Pydantic validation" sub="JSON only" fill="#fde68a" />
            <Box id="read" x={300} y={108} w={120} h={36} title="Read file / bytes" fill="#e5e7eb" />
            <Box id="prep" x={450} y={62} w={110} h={36} title="Preprocess" sub="array or tensor" fill="#bbf7d0" />
            <Box id="model" x={590} y={62} w={120} h={36} title="model.predict()" fill="#bbf7d0" />
            <line x1={118} y1={42} x2={168} y2={70} stroke={on('endpoint') && kind === 'json' ? '#0d9488' : '#d1d5db'} strokeWidth={2} />
            <line x1={118} y1={118} x2={168} y2={90} stroke={on('endpoint') && kind === 'file' ? '#0d9488' : '#d1d5db'} strokeWidth={2} />
            <line x1={270} y1={70} x2={298} y2={40} stroke={on('validate') ? '#0d9488' : '#d1d5db'} strokeWidth={2} />
            <line x1={270} y1={90} x2={298} y2={120} stroke={on('read') ? '#0d9488' : '#d1d5db'} strokeWidth={2} />
            <line x1={420} y1={40} x2={448} y2={70} stroke={on('prep') && kind === 'json' ? '#0d9488' : '#d1d5db'} strokeWidth={2} />
            <line x1={420} y1={120} x2={448} y2={90} stroke={on('prep') && kind === 'file' ? '#0d9488' : '#d1d5db'} strokeWidth={2} />
            <line x1={560} y1={80} x2={588} y2={80} stroke={on('model') ? '#0d9488' : '#d1d5db'} strokeWidth={2} />
          </svg>
        </div>
        <p className="text-[11px] text-gray-300">
          {step === path.length - 1 ? 'The prediction comes back as JSON either way. The input format changed; the pattern did not.' : 'Follow the teal path.'}
        </p>
      </div>
    </Frame>
  );
}
