import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines } from './VisualKit';
import {
  SCHEMAS,
  validateModel,
  instanceRepr,
  errorsV1,
  errorsV2,
  parseJson,
  pyRepr,
  pyJson,
  Mono,
  Pill,
  FieldTable,
  ModelPlayground,
} from './PydanticKit';

/* ------------------------------------------------------------------ */
/* 8. AdPredictionInput                                                   */
/* ------------------------------------------------------------------ */

const AD_CODE = [
  'from pydantic import BaseModel',
  '',
  'class AdPredictionInput(BaseModel):',
  '    age: int',
  '    previous_interaction: bool',
  '    campaign_id: str | None = None # Optional field with a default value',
];

const AD_PRESETS = [
  { id: 'full', label: 'all fields', json: '{\n  "age": 35,\n  "previous_interaction": true,\n  "campaign_id": "spring_sale"\n}', note: 'Everything present and correctly typed.' },
  { id: 'nocamp', label: 'no campaign_id', json: '{\n  "age": 35,\n  "previous_interaction": false\n}', note: 'campaign_id is optional: it is not provided, so it defaults to None.' },
  { id: 'agestr', label: 'age as "35"', json: '{\n  "age": "35",\n  "previous_interaction": true\n}', note: 'A string of digits is convertible to an int, so "35" becomes 35.' },
  { id: 'yes', label: 'interaction "yes"', json: '{\n  "age": 35,\n  "previous_interaction": "yes"\n}', note: 'Booleans accept true/false, and also common spellings like "yes"/"no", "on"/"off", 1/0.' },
  { id: 'float', label: 'age 35.5', json: '{\n  "age": 35.5,\n  "previous_interaction": true\n}', note: '35.5 has a fractional part — converting it to an int would lose data, so it is rejected.' },
  { id: 'campnum', label: 'campaign_id 123', json: '{\n  "age": 35,\n  "previous_interaction": true,\n  "campaign_id": 123\n}', note: 'campaign_id expects a string. Pydantic does not silently turn numbers into strings.' },
  { id: 'missing', label: 'missing field', json: '{\n  "age": 35\n}', note: 'previous_interaction has no default, so it is required.' },
];

const AD_NOTES = {
  age: 'age: int — Pydantic (and FastAPI) expect an integer value. Clean integer strings like "35" are converted; 35.5 or "thirty" are rejected.',
  previous_interaction: 'previous_interaction: bool — expects a boolean: true or false in JSON.',
  campaign_id: 'campaign_id: str | None = None — expects a string, but is optional. If it is not provided, it defaults to None. (The X | None syntax needs Python 3.10+; on older versions write Optional[str].)',
};

export function AdPredictionVisualizer() {
  return (
    <ModelPlayground
      schemaKey="AdPredictionInput"
      code={AD_CODE}
      fieldLines={{ age: 3, previous_interaction: 4, campaign_id: 5 }}
      presets={AD_PRESETS}
      notes={AD_NOTES}
      title="Your first model: AdPredictionInput"
      hint="Inputs for an ad-click model: age and previous interaction, plus an optional campaign. Try each payload or edit the JSON. Click a field to read what its annotation means."
      header={
        <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
          {[
            ['inherits', 'BaseModel'],
            ['declares', '3 fields'],
            ['each field', 'name + type hint'],
          ].map(([a, b]) => (
            <div key={a} className="rounded-lg border border-gray-700 py-1.5">
              <p className="text-gray-500 text-[10px]">{a}</p>
              <p className="font-mono text-teal-200">{b}</p>
            </div>
          ))}
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Shared: a step-by-step validation pipeline                            */
/* ------------------------------------------------------------------ */

const CHECK_ICON = {
  pass: <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />,
  fail: <XCircle className="w-4 h-4 text-rose-300 shrink-0" />,
  na: <MinusCircle className="w-4 h-4 text-gray-500 shrink-0" />,
};

function PipelineRun({ config, presetId, setPresetId }) {
  const { schemaKey, presets, checks, stepTitles, stepTexts, callName, endpoint } = config;
  const schema = SCHEMAS[schemaKey];
  const preset = presets.find((p) => p.id === presetId);
  const parsed = parseJson(preset.json);
  const result = parsed.ok ? validateModel(schema, parsed.value) : null;
  const ok = parsed.ok && result.ok;
  const stepper = useStepper(5, 1700);
  const step = stepper.index;
  const checkList = parsed.ok ? checks(result, parsed.value) : [];

  return (
    <Frame
      title={`What FastAPI does at ${endpoint}`}
      hint="Pick a request body and step through the five stages. Stages that do not apply to this request are dimmed."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={5} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button key={p.id} type="button" className={tabClass(p.id === presetId)} onClick={() => setPresetId(p.id)}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {stepTitles.map((t, i) => {
            const skipped = (i === 3 && !ok) || (i === 4 && ok) || (!parsed.ok && (i === 2 || i === 3));
            return (
              <button
                key={t}
                type="button"
                onClick={() => stepper.pick(i)}
                className={`rounded-lg border px-1.5 py-1.5 text-center transition-all ${
                  i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'
                } ${skipped ? 'opacity-40' : ''}`}
              >
                <p className="text-sm font-bold leading-none">{i + 1}</p>
                <p className="text-[9px] leading-tight mt-0.5">{t}</p>
              </button>
            );
          })}
        </div>

        <Lesson title={`${step + 1}. ${stepTitles[step]}`}>{stepTexts[step]}</Lesson>

        <AnimatePresence mode="wait">
          <motion.div key={`${presetId}-${step}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
            {step === 0 && (
              <>
                <Mono className="text-gray-300">{`POST ${endpoint} HTTP/1.1\ncontent-type: application/json\n\n`}<span className="text-sky-200">{preset.json.replace(/\n\s*/g, ' ')}</span></Mono>
                <p className="text-[11px] text-gray-400">At this point it is just bytes — FastAPI has no idea yet whether they are valid.</p>
              </>
            )}
            {step === 1 &&
              (parsed.ok ? (
                <>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                    <Mono className="text-sky-100">{preset.json}</Mono>
                    <span className="text-amber-300 text-xs">json →</span>
                    <Mono className="text-violet-100">{pyRepr(parsed.value)}</Mono>
                  </div>
                  <p className="text-[11px] text-gray-400">JSON text became a Python dict: true → True, null → None, strings stay strings. Types are not checked yet.</p>
                </>
              ) : (
                <div className="rounded-xl border border-rose-400/50 bg-rose-500/10 p-3 space-y-1">
                  <Pill code={422} text="Unprocessable Entity" />
                  <Mono className="text-rose-100">{JSON.stringify({ detail: [{ type: 'json_invalid', loc: ['body', parsed.pos ?? 0], msg: 'JSON decode error', input: {} }] }, null, 2)}</Mono>
                  <p className="text-[11px] text-gray-400">Parsing failed: this is not valid JSON, so validation never starts.</p>
                </div>
              ))}
            {step === 2 &&
              (parsed.ok ? (
                <>
                  <div className="rounded-xl border border-gray-700 bg-gray-950 p-3 space-y-1.5">
                    {checkList.map((c, i) => (
                      <motion.div key={c.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.25 }} className="flex items-center gap-2 text-[11px]">
                        {CHECK_ICON[c.status]}
                        <span className={c.status === 'fail' ? 'text-rose-100' : c.status === 'na' ? 'text-gray-500' : 'text-gray-200'}>{c.label}</span>
                        {c.detail && <span className="ml-auto font-mono text-[10px] text-gray-500">{c.detail}</span>}
                      </motion.div>
                    ))}
                  </div>
                  <FieldTable rows={result.rows} extras={result.extras} />
                </>
              ) : (
                <p className="text-[11px] text-gray-500">Skipped — the body could not be parsed.</p>
              ))}
            {step === 3 &&
              (ok ? (
                <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-300">FastAPI calls your function</p>
                  <p className="font-mono text-[11px] text-white break-all">{callName}={instanceRepr(schema, result.rows)})</p>
                  <p className="text-[10px] text-gray-400">Your function receives an instance of the model, guaranteed to match the schema.</p>
                </div>
              ) : (
                <p className="text-[11px] text-gray-500">Skipped — validation failed, so your function is never called.</p>
              ))}
            {step === 4 &&
              (ok ? (
                <p className="text-[11px] text-gray-500">Nothing to do — validation passed. (This stage only runs when something is wrong.)</p>
              ) : (
                <div className="rounded-xl border border-rose-400/50 bg-rose-500/10 p-3 space-y-1.5">
                  <Pill code={422} text="Unprocessable Entity" />
                  <Mono className="text-rose-100 max-h-56 overflow-auto">
                    {parsed.ok ? errorsV2(result.errors) : JSON.stringify({ detail: [{ type: 'json_invalid', loc: ['body', parsed.pos ?? 0], msg: 'JSON decode error', input: {} }] }, null, 2)}
                  </Mono>
                  <p className="text-[10px] text-gray-400">Generated automatically — you wrote no error-handling code.</p>
                </div>
              ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </Frame>
  );
}

function statusOf(rows, name) {
  const r = rows.find((x) => x.name === name);
  return r;
}

/* ------------------------------------------------------------------ */
/* 9. How FastAPI uses these models (AdPredictionInput)                  */
/* ------------------------------------------------------------------ */

const AD_PIPE = {
  schemaKey: 'AdPredictionInput',
  endpoint: '/predict_click',
  callName: 'predict_click(data',
  presets: [
    { id: 'valid', label: 'valid', json: '{"age": 35, "previous_interaction": true, "campaign_id": "spring_sale"}' },
    { id: 'conv', label: 'convertible values', json: '{"age": "35", "previous_interaction": "no"}' },
    { id: 'words', label: 'age "thirty-five"', json: '{"age": "thirty-five", "previous_interaction": true}' },
    { id: 'missing', label: 'missing field', json: '{"age": 35}' },
    { id: 'camp', label: 'campaign_id 42', json: '{"age": 35, "previous_interaction": true, "campaign_id": 42}' },
    { id: 'broken', label: 'not JSON', json: '{"age": 35, previous_interaction: true}' },
  ],
  stepTitles: ['Reads the Request Body', 'Parses the JSON', 'Validates the Data', 'Provides Data', 'Generates Errors'],
  stepTexts: [
    'FastAPI expects the incoming request to have a JSON body, because the parameter’s type is a Pydantic model.',
    'It converts the JSON data into Python objects.',
    'It checks whether the parsed data conforms to the structure and types defined in AdPredictionInput.',
    'If validation succeeds, FastAPI passes the validated data as an instance of your Pydantic model to your function.',
    'If validation fails (missing required fields, incorrect types), FastAPI automatically generates a detailed JSON error response saying exactly what went wrong.',
  ],
  checks: (result) => {
    const age = statusOf(result.rows, 'age');
    const prev = statusOf(result.rows, 'previous_interaction');
    const camp = statusOf(result.rows, 'campaign_id');
    return [
      { label: 'Does the JSON contain fields named age and previous_interaction?', status: age.present && prev.present ? 'pass' : 'fail', detail: [!age.present && 'age', !prev.present && 'previous_interaction'].filter(Boolean).join(', ') && `missing: ${[!age.present && 'age', !prev.present && 'previous_interaction'].filter(Boolean).join(', ')}` },
      { label: 'Is the value for age an integer (or convertible to one)?', status: !age.present ? 'na' : age.status === 'error' ? 'fail' : 'pass', detail: age.present ? `${JSON.stringify(age.raw)} → ${age.status === 'error' ? '✗' : pyRepr(age.value)}` : '' },
      { label: 'Is previous_interaction a boolean (or convertible to one)?', status: !prev.present ? 'na' : prev.status === 'error' ? 'fail' : 'pass', detail: prev.present ? `${JSON.stringify(prev.raw)} → ${prev.status === 'error' ? '✗' : pyRepr(prev.value)}` : '' },
      { label: 'If campaign_id is present, is it a string?', status: !camp.present ? 'na' : camp.status === 'error' ? 'fail' : 'pass', detail: camp.present ? JSON.stringify(camp.raw) : 'not sent → None' },
    ];
  },
};

export function FastAPIUsesModelVisualizer() {
  const [presetId, setPresetId] = useState('valid');
  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <PipelineRun key={presetId} config={AD_PIPE} presetId={presetId} setPresetId={setPresetId} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 10. The request body code, line by line                               */
/* ------------------------------------------------------------------ */

const MAIN_CODE = [
  '# main.py',
  'from fastapi import FastAPI',
  'from pydantic import BaseModel, Field',
  'from typing import Optional # Use Optional or | None for optional fields',
  '',
  'app = FastAPI()',
  '',
  'class ModelInput(BaseModel):',
  '    feature_alpha: float',
  '    feature_beta: int = Field(gt=0, description="Beta feature must be positive")',
  '    category: str',
  '    optional_param: Optional[float] = None # Or use: float | None = None',
  '',
  '@app.post("/process_data/")',
  'async def process_data_endpoint(input_data: ModelInput):',
  '    """',
  '    Receives and processes data according to the ModelInput schema.',
  '    """',
  '    # If the code reaches here, input_data is guaranteed to be a valid',
  '    # instance of ModelInput. FastAPI handled the validation.',
  '    print(f"Received valid data: {input_data.dict()}")',
  '',
  '    # Access validated data fields directly:',
  '    result = input_data.feature_alpha * input_data.feature_beta',
  '',
  '    # You can proceed with using this validated data, perhaps for ML inference',
  '    return {"status": "success", "processed_result": result, "received_data": input_data}',
];

const CODE_STEPS = [
  { lines: [1, 2, 3], title: 'Imports', text: 'FastAPI for the app, BaseModel to define models, Field to attach extra rules and metadata to a field, and Optional for fields that may be None.' },
  { lines: [7], title: 'class ModelInput(BaseModel)', text: 'The expected structure of the request body for this prediction task.' },
  { lines: [8, 10], title: 'Required fields', text: 'feature_alpha must be a float and category a str. No default value means they are required.' },
  { lines: [9], title: 'Field(gt=0, description=…)', text: 'feature_beta must be an int AND greater than 0. The description also shows up in the API docs. Drag the slider to test the rule.' },
  { lines: [11], title: 'Optional[float] = None', text: 'optional_param may be a float or None, and defaults to None when omitted. float | None = None means the same thing.' },
  { lines: [13, 14], title: 'The model as a parameter type', text: 'input_data: ModelInput — because the type is a Pydantic model, FastAPI knows this parameter comes from the request body and validates it automatically.' },
  { lines: [18, 19, 20], title: 'Guaranteed valid here', text: 'If execution reaches this line, input_data is a valid ModelInput. No if-checks needed. (.dict() is the Pydantic v1 name; in Pydantic v2 it is .model_dump() — .dict() still works but is deprecated.)' },
  { lines: [22, 23], title: 'Typed attribute access', text: 'Fields are plain attributes with real Python types: a float times an int gives a float. Your editor knows it too.' },
  { lines: [25, 26], title: 'Return the result', text: 'You can return the model instance itself inside the dict — FastAPI serializes it to JSON in the response.' },
];

export function RequestBodyCodeVisualizer() {
  const stepper = useStepper(CODE_STEPS.length, 2300);
  const [beta, setBeta] = useState(5);
  const step = stepper.index;
  const frame = CODE_STEPS[step];
  const fieldsShown = [
    step >= 2 && ['feature_alpha', 'float', 'required'],
    step >= 3 && ['feature_beta', 'int', 'required, > 0'],
    step >= 2 && ['category', 'str', 'required'],
    step >= 4 && ['optional_param', 'float | None', 'default None'],
  ].filter(Boolean);

  return (
    <Frame
      title="Request body validation, line by line"
      hint="Step through the example. The panel on the right builds up what FastAPI knows after each part."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={CODE_STEPS.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <Lesson title={`${step + 1}. ${frame.title}`}>{frame.text}</Lesson>
        <div className="grid md:grid-cols-[1.35fr_1fr] gap-3">
          <div className="max-h-[27rem] overflow-auto custom-scroll rounded-xl">
            <CodeLines
              lines={MAIN_CODE}
              active={frame.lines}
              title="main.py"
              onLineClick={(i) => {
                const t = CODE_STEPS.findIndex((s) => s.lines.includes(i));
                if (t >= 0) stepper.pick(t);
              }}
            />
          </div>
          <div className="space-y-2">
            <div className={`rounded-xl border p-3 transition-all ${step >= 1 ? 'border-teal-400/50' : 'border-gray-800 opacity-40'}`}>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">ModelInput blueprint</p>
              {fieldsShown.length ? (
                fieldsShown.map(([n, t, r]) => (
                  <motion.p key={n} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between font-mono text-[11px] py-0.5">
                    <span className="text-white">{n}</span>
                    <span className="text-violet-200">{t}</span>
                    <span className="text-gray-500 font-sans text-[10px]">{r}</span>
                  </motion.p>
                ))
              ) : (
                <p className="text-[10px] text-gray-600">(no fields yet)</p>
              )}
            </div>

            {step === 3 && (
              <div className="rounded-xl border border-gray-700 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-gray-300 w-28">feature_beta = {beta}</span>
                  <input type="range" min={-3} max={8} value={beta} onChange={(e) => setBeta(Number(e.target.value))} className="flex-1 accent-teal-500" />
                </div>
                <Mono className={beta > 0 ? 'text-emerald-100' : 'text-rose-100'}>
                  {beta > 0 ? `✓ ${beta} > 0` : `422  {"type":"greater_than","loc":["body","feature_beta"],\n      "msg":"Input should be greater than 0","input":${beta},"ctx":{"gt":0}}`}
                </Mono>
              </div>
            )}

            {step >= 5 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-gray-700 p-3 space-y-1 text-[11px]">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">POST /process_data/</p>
                <p className="text-gray-300">request body <span className="text-amber-300">→ validated as ModelInput →</span> <span className="font-mono text-teal-200">input_data</span></p>
              </motion.div>
            )}
            {step === 6 && (
              <div className="rounded-xl border border-gray-700 bg-black/80 p-3 font-mono text-[10px] text-gray-300">
                <p className="text-[9px] font-sans uppercase tracking-wider text-gray-500 mb-1">server console</p>
                Received valid data: {"{'feature_alpha': 10.5, 'feature_beta': 5, 'category': 'A', 'optional_param': 99.9}"}
              </div>
            )}
            {step === 7 && (
              <div className="rounded-xl border border-gray-700 p-3 font-mono text-[11px] space-y-1">
                <p className="text-gray-400">input_data.feature_alpha <span className="text-violet-300">float</span> = 10.5</p>
                <p className="text-gray-400">input_data.feature_beta <span className="text-violet-300">int</span> = 5</p>
                <p className="text-emerald-200">result = 10.5 * 5 = 52.5 <span className="text-violet-300">float</span></p>
              </div>
            )}
            {step === 8 && (
              <Mono className="text-emerald-100">{'{"status":"success","processed_result":52.5,\n "received_data":{"feature_alpha":10.5,"feature_beta":5,\n                  "category":"A","optional_param":99.9}}'}</Mono>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 11. What FastAPI does at /process_data/                               */
/* ------------------------------------------------------------------ */

const TYPE_ERRORS = ['float_parsing', 'float_type', 'int_parsing', 'int_type', 'int_from_float', 'string_type'];

const BODY_PIPE = {
  schemaKey: 'ModelInput',
  endpoint: '/process_data/',
  callName: 'process_data_endpoint(input_data',
  presets: [
    { id: 'valid', label: 'course example', json: '{"feature_alpha": 10.5, "feature_beta": 5, "category": "A", "optional_param": 99.9}' },
    { id: 'zero', label: 'feature_beta 0', json: '{"feature_alpha": 10.5, "feature_beta": 0, "category": "A"}' },
    { id: 'strnum', label: 'feature_beta "5"', json: '{"feature_alpha": 10.5, "feature_beta": "5", "category": "A"}' },
    { id: 'nocat', label: 'category missing', json: '{"feature_alpha": 10.5, "feature_beta": 5}' },
    { id: 'many', label: 'three problems', json: '{"feature_alpha": "big", "feature_beta": -2, "optional_param": 1.5}' },
    { id: 'broken', label: 'not JSON', json: '{"feature_alpha": 10.5, "feature_beta": 5,}' },
  ],
  stepTitles: ['Reads the Request Body', 'Parses JSON', 'Validates with Pydantic', 'Injects Validated Data', 'Handles Validation Errors'],
  stepTexts: [
    'FastAPI reads the raw bytes of the request body.',
    'It assumes the body contains JSON and parses it into a Python dictionary.',
    'It tries to create a ModelInput instance from the dictionary. This runs every check in the model: required fields present, types match the annotations, and extra constraints like gt=0 hold.',
    'If validation succeeds, FastAPI creates the ModelInput instance and passes it as the input_data argument. Your code can use it safely, knowing it conforms to the schema.',
    'If parsing fails or the data does not conform (a missing field, a wrong type, or feature_beta > 0 violated), FastAPI stops processing and returns 422 Unprocessable Entity with details pinpointing which fields failed and why.',
  ],
  checks: (result) => {
    const missing = result.errors.filter((e) => e.type === 'missing').map((e) => e.loc[1]);
    const typeErr = result.errors.filter((e) => TYPE_ERRORS.includes(e.type)).map((e) => e.loc[1]);
    const gtErr = result.errors.filter((e) => e.type === 'greater_than');
    const beta = result.rows.find((r) => r.name === 'feature_beta');
    const betaTyped = beta.present && !result.errors.some((e) => e.loc[1] === 'feature_beta' && TYPE_ERRORS.includes(e.type));
    return [
      { label: 'Required fields (feature_alpha, feature_beta, category) are present', status: missing.length ? 'fail' : 'pass', detail: missing.length ? `missing: ${missing.join(', ')}` : '' },
      { label: 'Data types match the annotations (float, int, str)', status: typeErr.length ? 'fail' : 'pass', detail: typeErr.length ? `wrong type: ${typeErr.join(', ')}` : '' },
      { label: 'Additional constraints hold (gt=0 for feature_beta)', status: !betaTyped ? 'na' : gtErr.length ? 'fail' : 'pass', detail: betaTyped ? `feature_beta = ${pyRepr(beta.status === 'error' ? beta.raw : beta.value)}` : 'needs a valid int first' },
    ];
  },
};

export function BodyPipelineVisualizer() {
  const [presetId, setPresetId] = useState('valid');
  return (
    <div className="flex flex-col w-full h-full min-h-0">
      <PipelineRun key={presetId} config={BODY_PIPE} presetId={presetId} setPresetId={setPresetId} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 12. Example: valid request                                             */
/* ------------------------------------------------------------------ */

const VALID_STAGES = ['Request body (JSON)', 'ModelInput instance', 'Your function computes', '200 OK response'];

export function ValidRequestVisualizer() {
  const [alpha, setAlpha] = useState(10.5);
  const [beta, setBeta] = useState(5);
  const [category, setCategory] = useState('A');
  const [withOpt, setWithOpt] = useState(true);
  const stepper = useStepper(VALID_STAGES.length, 1500);
  const step = stepper.index;

  const body = { feature_alpha: alpha, feature_beta: beta, category, ...(withOpt ? { optional_param: 99.9 } : {}) };
  const result = validateModel(SCHEMAS.ModelInput, body);
  const inst = result.ok ? instanceRepr(SCHEMAS.ModelInput, result.rows) : null;
  const product = alpha * beta;
  const bodyJson = `{\n  "feature_alpha": ${pyJson(alpha, 'float')},\n  "feature_beta": ${beta},\n  "category": "${category}"${withOpt ? ',\n  "optional_param": 99.9' : ''}\n}`;
  const responseJson = `{\n  "status": "success",\n  "processed_result": ${pyJson(product, 'float')},\n  "received_data": {\n    "feature_alpha": ${pyJson(alpha, 'float')},\n    "feature_beta": ${beta},\n    "category": "${category}",\n    "optional_param": ${withOpt ? '99.9' : 'null'}\n  }\n}`;

  return (
    <Frame
      title="A valid request, end to end"
      hint="Change the inputs, then step through: JSON in, validated object, computation, JSON out. Push feature_beta to 0 to see the rule kick in."
      footer={
        <div className="flex justify-end">
          <StepControls stepper={stepper} total={VALID_STAGES.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-2">
          <label className="rounded-lg border border-gray-700 px-2 py-1.5 text-[11px] text-gray-300 flex items-center gap-2">
            <span className="font-mono w-32">feature_alpha {pyJson(alpha, 'float')}</span>
            <input type="range" min={0.5} max={20} step={0.5} value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} className="flex-1 accent-teal-500" />
          </label>
          <label className="rounded-lg border border-gray-700 px-2 py-1.5 text-[11px] text-gray-300 flex items-center gap-2">
            <span className="font-mono w-32">feature_beta {beta}</span>
            <input type="range" min={-2} max={10} value={beta} onChange={(e) => setBeta(Number(e.target.value))} className="flex-1 accent-teal-500" />
          </label>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
            <span className="font-mono">category</span>
            {['A', 'B', 'C'].map((c) => (
              <button key={c} type="button" className={tabClass(category === c)} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[11px] text-gray-300">
            <input type="checkbox" className="accent-teal-500" checked={withOpt} onChange={(e) => setWithOpt(e.target.checked)} />
            send <span className="font-mono">optional_param: 99.9</span>
          </label>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {VALID_STAGES.map((s, i) => (
            <button key={s} type="button" onClick={() => stepper.pick(i)} className={`rounded-lg border px-1.5 py-1 text-[10px] transition-all ${i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'}`}>
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">POST /process_data/</p>
            <Mono className="text-sky-100">{bodyJson}</Mono>
          </div>
          <div className="space-y-2">
            {step >= 1 &&
              (result.ok ? (
                <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-300">input_data</p>
                  <p className="font-mono text-[11px] text-white break-all">{inst}</p>
                  {!withOpt && <p className="text-[10px] text-amber-200 mt-1">optional_param was omitted → None</p>}
                </motion.div>
              ) : (
                <div className="rounded-xl border border-rose-400/50 bg-rose-500/10 p-2.5 space-y-1">
                  <Pill code={422} text="Unprocessable Entity" />
                  <Mono className="text-rose-100">{errorsV2(result.errors)}</Mono>
                  <p className="text-[10px] text-gray-400">feature_beta must be greater than 0 — the function never runs.</p>
                </div>
              ))}
            {step >= 2 && result.ok && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-gray-700 p-2.5 font-mono text-[12px] text-center">
                <span className="text-sky-200">{pyJson(alpha, 'float')}</span> <span className="text-gray-500">×</span> <span className="text-sky-200">{beta}</span>{' '}
                <span className="text-gray-500">=</span> <span className="text-emerald-300 font-bold">{pyJson(product, 'float')}</span>
                <p className="text-[10px] font-sans text-gray-500 mt-0.5">result = input_data.feature_alpha * input_data.feature_beta</p>
              </motion.div>
            )}
            {step >= 3 && result.ok && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                <Pill code={200} text="OK" />
                <Mono className="text-emerald-100">{responseJson}</Mono>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 13. Example: invalid request                                           */
/* ------------------------------------------------------------------ */

const MISSING = '__missing__';

const CHOICES = {
  feature_alpha: ['not-a-float', 10.5, MISSING],
  feature_beta: [MISSING, 5, -1, '5'],
  category: ['B', 7, MISSING],
  optional_param: [MISSING, 99.9, 'high'],
};

const show = (v) => (v === MISSING ? '(omit)' : JSON.stringify(v));

export function InvalidRequestVisualizer() {
  const [vals, setVals] = useState({ feature_alpha: 'not-a-float', feature_beta: MISSING, category: 'B', optional_param: MISSING });
  const [format, setFormat] = useState('v1');
  const body = Object.fromEntries(Object.entries(vals).filter(([, v]) => v !== MISSING));
  const result = validateModel(SCHEMAS.ModelInput, body);
  const badFields = result.errors.map((e) => e.loc[1]);
  const course = vals.feature_alpha === 'not-a-float' && vals.feature_beta === MISSING && vals.category === 'B' && vals.optional_param === MISSING;

  return (
    <Frame
      title="An invalid request — and how to read the 422"
      hint="Starts with the course’s invalid body. Change field values to fix or break things; each error points at a field. Fix everything to get 200."
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-gray-700 p-2.5 space-y-1.5">
          {Object.entries(CHOICES).map(([field, options]) => (
            <div key={field} className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-mono text-[11px] w-28 ${badFields.includes(field) ? 'text-rose-300' : 'text-gray-300'}`}>{field}</span>
              {options.map((o) => (
                <button key={String(o)} type="button" className={`${tabClass(vals[field] === o)} font-mono !py-0.5`} onClick={() => setVals((v) => ({ ...v, [field]: o }))}>
                  {show(o)}
                </button>
              ))}
            </div>
          ))}
          {!course && (
            <button type="button" onClick={() => setVals({ feature_alpha: 'not-a-float', feature_beta: MISSING, category: 'B', optional_param: MISSING })} className="text-[10px] text-teal-300 underline">
              reset to the course example
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">request body</p>
            <div className="rounded-xl border border-gray-700 bg-black/70 p-3 font-mono text-[11px] leading-relaxed">
              <p className="text-gray-400">{'{'}</p>
              {Object.keys(CHOICES).map((field) => {
                const v = vals[field];
                const bad = badFields.includes(field);
                if (v === MISSING) {
                  return bad ? (
                    <motion.p key={field} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pl-3 rounded border border-dashed border-rose-400/60 text-rose-300/80">
                      "{field}": <span className="font-sans text-[10px]">missing (required)</span>
                    </motion.p>
                  ) : null;
                }
                return (
                  <motion.p key={field} layout className={`pl-3 rounded ${bad ? 'bg-rose-500/20 text-rose-100' : 'text-sky-100'}`}>
                    "{field}": {JSON.stringify(v)}
                  </motion.p>
                );
              })}
              <p className="text-gray-400">{'}'}</p>
            </div>
            <div className="mt-2 space-y-1">
              {result.errors.map((e, i) => (
                <motion.div key={`${e.loc.join('.')}-${e.type}`} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-2 text-[11px]">
                  <span className="w-5 h-5 rounded-full bg-rose-500/30 text-rose-100 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="font-mono text-amber-200">{e.loc.join(' → ')}</span>
                  <span className="text-gray-400 truncate">{e.msg}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {result.ok ? (
              <>
                <Pill code={200} text="OK" />
                <Mono className="text-emerald-100">
                  {`{"status":"success",\n "processed_result":${pyJson(result.rows[0].value * result.rows[1].value, 'float')},\n "received_data":{...}}`}
                </Mono>
                <p className="text-[11px] text-gray-400">All fields valid — the function ran.</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <Pill code={422} text="Unprocessable Entity" />
                  <button type="button" className={tabClass(format === 'v1')} onClick={() => setFormat('v1')}>as in the course text</button>
                  <button type="button" className={tabClass(format === 'v2')} onClick={() => setFormat('v2')}>current FastAPI (Pydantic v2)</button>
                </div>
                <Mono className="text-rose-100 max-h-72 overflow-auto">{format === 'v1' ? errorsV1(result.errors) : errorsV2(result.errors)}</Mono>
              </>
            )}
          </div>
        </div>

        <Lesson title="Reading each error">
          <span className="font-mono text-amber-200">loc</span> = where (<span className="font-mono">"body"</span>, then the field name). <span className="font-mono text-amber-200">msg</span> = a human-readable reason.{' '}
          <span className="font-mono text-amber-200">type</span> = a machine-readable error code. Every problem is listed, not just the first — so a client can fix everything in one go.
        </Lesson>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 14. Self-documenting: schemas in /docs                                */
/* ------------------------------------------------------------------ */

const MODEL_LINES = [
  'class ModelInput(BaseModel):',
  '    feature_alpha: float',
  '    feature_beta: int = Field(gt=0, description="Beta feature must be positive")',
  '    category: str',
  '    optional_param: Optional[float] = None',
];

const SCHEMA_LINES = [
  '{',
  '  "title": "ModelInput",',
  '  "type": "object",',
  '  "properties": {',
  '    "feature_alpha": {"title": "Feature Alpha", "type": "number"},',
  '    "feature_beta": {"title": "Feature Beta", "type": "integer",',
  '                     "exclusiveMinimum": 0,',
  '                     "description": "Beta feature must be positive"},',
  '    "category": {"title": "Category", "type": "string"},',
  '    "optional_param": {"title": "Optional Param", "default": null,',
  '                       "anyOf": [{"type": "number"}, {"type": "null"}]}',
  '  },',
  '  "required": ["feature_alpha", "feature_beta", "category"]',
  '}',
];

const FIELD_MAP = {
  feature_alpha: { model: 1, schema: [4, 12] },
  feature_beta: { model: 2, schema: [5, 6, 7, 12] },
  category: { model: 3, schema: [8, 12] },
  optional_param: { model: 4, schema: [9, 10] },
};

const SWAGGER_FIELDS = [
  { name: 'feature_alpha', req: true, type: 'number' },
  { name: 'feature_beta', req: true, type: 'integer', extra: 'exclusiveMinimum: 0 · Beta feature must be positive' },
  { name: 'category', req: true, type: 'string' },
  { name: 'optional_param', req: false, type: 'number | null', extra: 'default: null' },
];

export function DocsSchemaVisualizer() {
  const [field, setField] = useState('feature_beta');
  const [view, setView] = useState('swagger');
  const [text, setText] = useState('{\n  "feature_alpha": 10.5,\n  "feature_beta": 5,\n  "category": "A",\n  "optional_param": 99.9\n}');
  const [sent, setSent] = useState(null);
  const map = FIELD_MAP[field];

  const execute = () => {
    const parsed = parseJson(text);
    if (!parsed.ok) {
      setSent({ code: 422, body: JSON.stringify({ detail: [{ type: 'json_invalid', loc: ['body', parsed.pos ?? 0], msg: 'JSON decode error', input: {} }] }, null, 2) });
      return;
    }
    const r = validateModel(SCHEMAS.ModelInput, parsed.value);
    if (!r.ok) {
      setSent({ code: 422, body: errorsV2(r.errors) });
      return;
    }
    const a = r.rows[0].value;
    const b = r.rows[1].value;
    setSent({
      code: 200,
      body: `{\n  "status": "success",\n  "processed_result": ${pyJson(a * b, 'float')},\n  "received_data": {\n    "feature_alpha": ${pyJson(a, 'float')},\n    "feature_beta": ${b},\n    "category": ${JSON.stringify(r.rows[2].value)},\n    "optional_param": ${r.rows[3].value === null ? 'null' : pyJson(r.rows[3].value, 'float')}\n  }\n}`,
    });
  };

  return (
    <Frame
      title="The model documents your API"
      hint="Click a field in the model to see where it shows up in the generated schema. Then try the endpoint straight from the docs."
      footer={
        <div className="flex gap-2">
          <button type="button" className={tabClass(view === 'swagger')} onClick={() => setView('swagger')}>/docs view</button>
          <button type="button" className={tabClass(view === 'schema')} onClick={() => setView('schema')}>raw JSON Schema</button>
          <button type="button" className={tabClass(view === 'try')} onClick={() => setView('try')}>Try it out</button>
        </div>
      }
    >
      <div className="space-y-3">
        <CodeLines
          lines={MODEL_LINES}
          active={[map.model]}
          title="the model you wrote"
          onLineClick={(i) => {
            const hit = Object.entries(FIELD_MAP).find(([, m]) => m.model === i);
            if (hit) setField(hit[0]);
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {view === 'schema' && <CodeLines lines={SCHEMA_LINES} active={map.schema} title="generated by FastAPI (openapi.json → components.schemas)" />}

            {view === 'swagger' && (
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 space-y-2">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-2 py-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">POST</span>
                  <span className="font-mono text-[11px] text-white">/process_data/</span>
                  <span className="text-[11px] text-gray-400">Process Data Endpoint</span>
                </div>
                <p className="text-[11px] text-gray-400">Request body <span className="text-rose-400">required</span> · application/json · schema: <span className="text-white font-semibold">ModelInput</span></p>
                <div className="rounded-lg border border-gray-700 p-2.5 text-[11px] space-y-1">
                  <p className="font-semibold text-white">ModelInput <span className="text-gray-500 font-normal">{'{'}</span></p>
                  {SWAGGER_FIELDS.map((f) => (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => setField(f.name)}
                      className={`w-full text-left pl-3 rounded font-mono py-0.5 ${field === f.name ? 'bg-teal-500/20' : 'hover:bg-gray-800'}`}
                    >
                      <span className="text-white">{f.name}</span>
                      {f.req && <span className="text-rose-400">*</span>} <span className="text-cyan-200">{f.type}</span>
                      {f.extra && <span className="block pl-4 font-sans text-[10px] text-gray-400">{f.extra}</span>}
                    </button>
                  ))}
                  <p className="text-gray-500">{'}'}</p>
                </div>
                <p className="text-[10px] text-gray-500">The response for a failed validation (422) is documented automatically too.</p>
              </div>
            )}

            {view === 'try' && (
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-3 space-y-2">
                <p className="text-[11px] text-gray-400">Edit the request body and press Execute — it runs the same validation as the real endpoint.</p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  spellCheck={false}
                  className="w-full rounded-lg bg-black/70 border border-gray-700 focus:border-teal-400 outline-none p-2.5 font-mono text-[11px] text-sky-100 resize-none"
                />
                <button type="button" onClick={execute} className="w-full rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-1.5">
                  Execute
                </button>
                {sent && (
                  <motion.div key={sent.body} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                    <Pill code={sent.code} text={sent.code === 200 ? 'OK' : 'Unprocessable Entity'} />
                    <Mono className={sent.code === 200 ? 'text-emerald-100' : 'text-rose-100'}>{sent.body}</Mono>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Frame>
  );
}
