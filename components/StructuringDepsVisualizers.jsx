import React, { useState } from 'react';
import { useStepper, Frame, StepControls, tabClass, Lesson, Caption, Terminal } from './VisualKit';
import { Mono } from './PydanticKit';

const SKLEARN = {
  train: '1.3.2',
  colleague: '1.0.2',
  prod: '1.5.0',
};

/* ------------------------------------------------------------------ */
/* Why pin versions                                                       */
/* ------------------------------------------------------------------ */

const PIN_STORY = [
  { who: 'you', ver: SKLEARN.train, result: 0.62, ok: true, note: 'You trained and served with scikit-learn 1.3.2. The score is 0.62.' },
  { who: 'colleague', ver: SKLEARN.colleague, result: null, ok: false, note: 'They install an older wheel. A function you call is missing.' },
  { who: 'prod', ver: SKLEARN.prod, result: 0.71, ok: true, note: 'Production silently installs a newer wheel. The API still 200s. The number moved.' },
  { who: 'pinned', ver: SKLEARN.train, result: 0.62, ok: true, note: 'Everyone installs scikit-learn==1.3.2. The score matches the training run.' },
];

export function WhyPinVisualizer() {
  const stepper = useStepper(PIN_STORY.length, 1500);
  const step = stepper.index;
  const item = PIN_STORY[step];
  return (
    <Frame
      title="The same code, three different scikit-learn versions"
      hint="A missing function is loud. A changed default is quiet. Pinning is how the prediction stays the prediction."
      footer={<StepControls stepper={stepper} total={PIN_STORY.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${item.note}`} />
        <div className="grid grid-cols-3 gap-2">
          {['you', 'colleague', 'prod'].map((who) => {
            const row = PIN_STORY.find((entry) => entry.who === who) || item;
            const live = item.who === 'pinned' ? who === 'you' || true : item.who === who;
            const ver = item.who === 'pinned' ? SKLEARN.train : (who === 'you' ? SKLEARN.train : who === 'colleague' ? SKLEARN.colleague : SKLEARN.prod);
            const broken = item.who !== 'pinned' && who === 'colleague' && step >= 1;
            const drifted = item.who !== 'pinned' && who === 'prod' && step >= 2;
            return (
              <div key={who} className={`rounded-xl border p-3 ${live && step < 3 ? 'border-teal-400' : item.who === 'pinned' ? 'border-teal-400' : 'border-gray-800'}`}>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">{who}</p>
                <p className="font-mono text-[12px] text-white mt-1">sklearn {ver}</p>
                <p className={`text-[11px] mt-2 ${broken ? 'text-rose-200' : drifted ? 'text-amber-200' : 'text-emerald-200'}`}>
                  {broken ? 'ImportError' : drifted ? 'score 0.71' : 'score 0.62'}
                </p>
              </div>
            );
          })}
        </div>
        {step === 2 && <p className="text-[12px] text-amber-200">The client still got HTTP 200. The model’s number is what changed.</p>}
        {step === 3 && <Lesson title="Four jobs of a lock">Reproducibility, fewer version fights, one install command, and a written list of what the app needs.</Lesson>}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* pip freeze                                                             */
/* ------------------------------------------------------------------ */

const FREEZE = [
  'fastapi==0.104.1',
  'uvicorn[standard]==0.23.2',
  'pydantic==2.4.2',
  'scikit-learn==1.3.2',
  'joblib==1.3.2',
  'numpy==1.26.1',
];

const FREEZE_STEPS = [
  { title: 'Install the libraries this app actually imports', cmd: 'pip install fastapi uvicorn[standard] scikit-learn joblib' },
  { title: 'pip freeze writes every installed package, including ones you did not name', cmd: 'pip freeze > requirements.txt' },
  { title: 'A new machine or a deploy pipeline reads that file', cmd: 'pip install -r requirements.txt' },
  { title: 'The environment matches. sklearn is 1.3.2 again.', cmd: 'python -c "import sklearn; print(sklearn.__version__)"' },
];

export function RequirementsVisualizer() {
  const stepper = useStepper(FREEZE_STEPS.length, 1400);
  const step = stepper.index;
  return (
    <Frame
      title="freeze captures. install -r recreates."
      hint="== pins the exact wheel. That is the usual choice for an ML API, because a patch can change a prediction."
      footer={<StepControls stepper={stepper} total={FREEZE_STEPS.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${FREEZE_STEPS[step].title}`} />
        <Terminal
          title="shell"
          lines={[
            { kind: 'cmd', text: FREEZE_STEPS[step].cmd },
            ...(step === 1 ? FREEZE.map((line) => ({ kind: 'out', text: line })) : []),
            ...(step === 3 ? [{ kind: 'ok', text: '1.3.2' }] : []),
          ]}
        />
        {step >= 1 && (
          <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 font-mono text-[11px] text-gray-200 space-y-0.5">
            {FREEZE.map((line, i) => (
              <p key={line} className={step >= 1 && (line.startsWith('scikit') || i < 3) ? 'text-teal-100' : ''}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Version specifiers                                                     */
/* ------------------------------------------------------------------ */

const SPECS = [
  { id: 'eq', token: 'scikit-learn==1.3.2', allow: ['1.3.2'], deny: ['1.3.1', '1.3.3', '1.4.0'], note: 'Only this wheel. pip freeze writes this. Safest for a served model.' },
  { id: 'ge', token: 'scikit-learn>=1.0', allow: ['1.0.2', '1.3.2', '1.5.0'], deny: ['0.24.2'], note: '1.0 or anything newer, including a future major. Breaking changes can land uninvited.' },
  { id: 'lt', token: 'scikit-learn<2.0', allow: ['1.3.2', '1.9.9'], deny: ['2.0.0'], note: 'Anything below 2.0. Still a wide window of minors.' },
  { id: 'tilde', token: 'scikit-learn~=1.3.2', allow: ['1.3.2', '1.3.9'], deny: ['1.4.0', '2.0.0'], note: 'Compatible release: 1.3.2 or later 1.3.x, not 1.4. Fine for a library, loose for a production API.' },
];

export function VersionSpecVisualizer() {
  const [id, setId] = useState('eq');
  const spec = SPECS.find((item) => item.id === id);
  return (
    <Frame
      title="The operator decides which wheels are legal"
      hint="For this course’s ML API, == is the recommended pin. ~= is the next tightest. >= is the loosest."
      footer={
        <div className="flex gap-2 flex-wrap">
          {SPECS.map((item) => (
            <button key={item.id} type="button" className={tabClass(id === item.id)} onClick={() => setId(item.id)}>{item.id === 'eq' ? '==' : item.id === 'ge' ? '>=' : item.id === 'lt' ? '<' : '~='}</button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        <p className="font-mono text-sm text-teal-100">{spec.token}</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-emerald-300 mb-1">installs</p>
            {spec.allow.map((ver) => (
              <p key={ver} className="rounded-lg bg-emerald-500/10 border border-emerald-400/30 px-2 py-1 font-mono text-[11px] text-emerald-100 mb-1">{ver}</p>
            ))}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-rose-300 mb-1">rejected</p>
            {spec.deny.map((ver) => (
              <p key={ver} className="rounded-lg bg-rose-500/10 border border-rose-400/30 px-2 py-1 font-mono text-[11px] text-rose-100 mb-1">{ver}</p>
            ))}
          </div>
        </div>
        <p className="text-[12px] text-gray-200">{spec.note}</p>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Poetry                                                                 */
/* ------------------------------------------------------------------ */

const POETRY_STEPS = [
  { title: 'pyproject.toml names the project and the top-level packages', file: 'pyproject.toml', lines: ['fastapi = "^0.104.1"', 'scikit-learn = "^1.3.2"', 'python = "^3.9"'] },
  { title: 'poetry install resolves the whole tree and writes poetry.lock', file: 'poetry.lock', lines: ['fastapi 0.104.1', 'pydantic 2.4.2', 'starlette 0.27.0', 'scikit-learn 1.3.2', 'numpy 1.26.1', 'joblib 1.3.2'] },
  { title: 'A second machine reads the lock, not a freeze of whatever was sitting in a venv', file: 'poetry.lock', lines: ['install from lock → sklearn 1.3.2 everywhere'] },
  { title: '^0.104.1 in pyproject still allows 0.104.x. The lock is what pins production.', file: 'pyproject.toml', lines: ['^0.104.1  →  0.104.1 … 0.104.99', 'lock file  →  0.104.1 exactly'] },
];

export function PoetryVisualizer() {
  const stepper = useStepper(POETRY_STEPS.length, 1500);
  const step = stepper.index;
  const s = POETRY_STEPS[step];
  return (
    <Frame
      title="Poetry records the resolved tree, not just what you typed"
      hint="pip freeze is a snapshot of one environment. poetry.lock is the solver’s answer, including packages you never listed."
      footer={<StepControls stepper={stepper} total={POETRY_STEPS.length} />}
    >
      <div className="space-y-3">
        <Caption text={`${step + 1}. ${s.title}`} />
        <div className="grid grid-cols-2 gap-2">
          <div className={`rounded-xl border p-3 ${step === 0 || step === 3 ? 'border-teal-400' : 'border-gray-700'}`}>
            <p className="text-[10px] text-gray-500">pyproject.toml</p>
            <p className="font-mono text-[11px] text-gray-200 mt-2">fastapi = "^0.104.1"</p>
            <p className="font-mono text-[11px] text-gray-200">scikit-learn = "^1.3.2"</p>
            <p className="text-[10px] text-gray-500 mt-2">what you asked for</p>
          </div>
          <div className={`rounded-xl border p-3 ${step >= 1 ? 'border-teal-400' : 'border-gray-700'}`}>
            <p className="text-[10px] text-gray-500">poetry.lock</p>
            <p className="font-mono text-[11px] text-teal-100 mt-2">fastapi 0.104.1</p>
            <p className="font-mono text-[11px] text-teal-100">starlette 0.27.0</p>
            <p className="font-mono text-[11px] text-teal-100">scikit-learn 1.3.2</p>
            <p className="text-[10px] text-gray-500 mt-2">what actually installs</p>
          </div>
        </div>
        <Terminal title="shell" lines={[{ kind: 'cmd', text: step === 0 ? 'poetry add fastapi' : 'poetry install' }]} />
        {step >= 1 && <p className="text-[11px] text-gray-300">{s.lines[s.lines.length - 1]}</p>}
        {step === 3 && <Lesson title="Caret is not a production pin">Commit poetry.lock (or requirements.txt with ==) with the app. The caret range is for the next install on a developer machine if the lock is missing.</Lesson>}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* Testing intro                                                          */
/* ------------------------------------------------------------------ */

const TESTS = [
  {
    id: 'contract',
    title: 'Contract adherence',
    ask: 'Does the JSON match PredictionOut?',
    pass: '{ "prediction": 1.0, "probability": 0.85 }',
    fail: '{ "score": 1.0 }',
  },
  {
    id: 'valid',
    title: 'Input validation',
    ask: 'A nonsense body never reaches the model.',
    pass: '422 · sepal_width is not a float',
    fail: 'model.predict ran on "not-a-number"',
  },
  {
    id: 'pipe',
    title: 'Integration correctness',
    ask: 'Did the API call predict, and is the result in the body?',
    pass: 'preprocess → model.predict → PredictionOut',
    fail: 'forgot to call predict, always returns 0',
  },
  {
    id: 'err',
    title: 'Error handling',
    ask: 'Missing model file is 503, not a stack trace.',
    pass: '503 · Model is not loaded',
    fail: '500 with a Python traceback in the body',
  },
  {
    id: 'reg',
    title: 'Regression prevention',
    ask: 'A refactor still returns setosa for the example flower.',
    pass: 'same 200 body as last week',
    fail: 'class id flipped after a rename',
  },
];

export function TestingIntroVisualizer() {
  const [id, setId] = useState('contract');
  const [ok, setOk] = useState(true);
  const item = TESTS.find((row) => row.id === id);
  return (
    <Frame
      title="These tests check the API around the model, not the model’s accuracy"
      hint="A unit test can call a service function. An integration test sends HTTP through TestClient. Neither replaces a holdout score from training."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {TESTS.map((row) => (
              <button key={row.id} type="button" className={tabClass(id === row.id)} onClick={() => setId(row.id)}>{row.title.split(' ')[0]}</button>
            ))}
          </div>
          <button type="button" className={tabClass(!ok)} onClick={() => setOk(!ok)}>{ok ? 'passing' : 'failing'}</button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-[12px] text-gray-200">{item.ask}</p>
        <div className={`rounded-xl border p-3 ${ok ? 'border-emerald-400/40 bg-emerald-500/5' : 'border-rose-400/40 bg-rose-500/5'}`}>
          <p className="font-mono text-[12px] text-white">{ok ? item.pass : item.fail}</p>
        </div>
        <div className={`rounded-xl border px-3 py-2 text-[12px] font-semibold ${ok ? 'border-emerald-400/40 text-emerald-200' : 'border-rose-400/40 text-rose-200'}`}>
          {ok ? 'test passed' : 'test failed'}
        </div>
        {id === 'pipe' && <p className="text-[11px] text-gray-400">Statistical accuracy of the classifier is a training concern. This test only asks: did predict run, and did the JSON wrap it.</p>}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* TestClient vs unit                                                     */
/* ------------------------------------------------------------------ */

export function TestKindsVisualizer() {
  const [kind, setKind] = useState('unit');
  const unit = kind === 'unit';
  return (
    <Frame
      title="Unit tests call Python. Integration tests send HTTP."
      hint="TestClient is httpx talking to the app in-process. No uvicorn. The service function can be tested with neither."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(unit)} onClick={() => setKind('unit')}>unit · call the service</button>
          <button type="button" className={tabClass(!unit)} onClick={() => setKind('http')}>integration · TestClient</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-mono flex-wrap">
          {unit ? (
            <>
              <span className="px-2 py-1 rounded bg-gray-800 text-gray-500 line-through">HTTP</span>
              <span className="px-2 py-1 rounded bg-teal-500/15 text-teal-100">predict_sentiment(features)</span>
              <span className="text-gray-500">→</span>
              <span className="text-white">dict</span>
            </>
          ) : (
            <>
              <span className="px-2 py-1 rounded bg-teal-500/15 text-teal-100">TestClient POST /predict</span>
              <span className="text-gray-500">→</span>
              <span className="text-white">router → service → JSON</span>
            </>
          )}
        </div>
        <Mono className="text-sky-100">
          {unit
            ? 'result = predict_sentiment({"text": "great"})'
            : 'response = client.post("/predict", json={"text": "great"})'}
        </Mono>
        <p className="text-[12px] text-gray-200">
          {unit
            ? 'No FastAPI, no status code. Fast, and it still needs the layers to be split.'
            : 'Uses Pydantic, status codes, and the router. Needs TestClient from FastAPI, backed by httpx.'}
        </p>
      </div>
    </Frame>
  );
}
