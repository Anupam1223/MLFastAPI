import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { useStepper, Frame, StepControls, tabClass, Lesson, CodeLines, Terminal, Caption } from './VisualKit';
import { Mono, Pill } from './PydanticKit';
import { validateObject, validateValue, errorBody, VersionToggle, pyValue } from './ConstraintKit';

const REGIONS = ['North', 'South', 'East', 'West'];

export const HP_FIELDS = [
  { name: 'area_sqft', type: 'float', required: true, gt: 0 },
  { name: 'bedrooms', type: 'int', required: true, ge: 0 },
  { name: 'bathrooms', type: 'float', required: true, gt: 0 },
  { name: 'region', type: 'enum', required: true, values: REGIONS },
];

const MODELS_PY = [
  '# models.py',
  'from pydantic import BaseModel, Field, validator',
  'from enum import Enum',
  '',
  'class HouseRegion(str, Enum):',
  '    """Permitted regions for house location."""',
  '    NORTH = "North"',
  '    SOUTH = "South"',
  '    EAST = "East"',
  '    WEST = "West"',
  '',
  'class HouseFeatures(BaseModel):',
  '    """Input features for the house price prediction model."""',
  '    area_sqft: float = Field(..., gt=0, description="Living area in square feet, must be positive.")',
  '    bedrooms: int = Field(..., ge=0, description="Number of bedrooms, must be non-negative.")',
  '    bathrooms: float = Field(..., gt=0, description="Number of bathrooms, must be positive (e.g., 1.5 for 1 full, 1 half).")',
  '    region: HouseRegion = Field(..., description="Region where the house is located.")',
  '',
  '    # Example of a custom validator if needed, though Field constraints cover this case',
  "    # @validator('area_sqft')",
  '    # def area_must_be_positive(cls, v):',
  '    #     if v <= 0:',
  "    #         raise ValueError('Area must be positive')",
  '    #     return v',
  '',
  '    class Config:',
  '        # Provides example data for documentation',
  '        schema_extra = {',
  '            "example": {',
  '                "area_sqft": 1500.5,',
  '                "bedrooms": 3,',
  '                "bathrooms": 2.5,',
  '                "region": "North"',
  '            }',
  '        }',
];

const fmtFloat = (v) => (Number.isInteger(v) ? `${v}.0` : String(v));

/* ------------------------------------------------------------------ */
/* 13. Requirements → schema                                             */
/* ------------------------------------------------------------------ */

const REQS = [
  { field: 'area_sqft', text: 'The living area in square feet', rule: 'must be a positive number', code: [13], tests: [['1500.5', 1500.5], ['0', 0], ['-100', -100], ['"2000"', '2000']] },
  { field: 'bedrooms', text: 'The number of bedrooms', rule: 'must be a non-negative integer', code: [14], tests: [['3', 3], ['0', 0], ['-1', -1], ['2.5', 2.5]] },
  { field: 'bathrooms', text: 'The number of bathrooms', rule: 'can be half-bathrooms, so a positive float (e.g. 1.5)', code: [15], tests: [['1.5', 1.5], ['2', 2], ['0', 0], ['-1', -1]] },
  { field: 'region', text: 'The region where the house is located', rule: "must be one of 'North', 'South', 'East', 'West'", code: [4, 5, 6, 7, 8, 9, 16], tests: [['"North"', 'North'], ['"north"', 'north'], ['"Central"', 'Central'], ['"West "', 'West ']] },
];

export function HouseRequirementsVisualizer() {
  const [req, setReq] = useState(3);
  const [test, setTest] = useState(1);
  const r = REQS[req];
  const spec = HP_FIELDS.find((f) => f.name === r.field);
  const [label, raw] = r.tests[test];
  const res = validateValue(spec, raw, ['body', r.field]);
  const ok = res.errors.length === 0;
  const matchIdx = r.field === 'region' && ok ? REGIONS.indexOf(res.value) : -1;

  return (
    <Frame title="From requirements to a Pydantic schema" hint="Pick a requirement to find where the model encodes it, then throw test values at it.">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-1.5">
          {REQS.map((x, i) => (
            <button
              key={x.field}
              type="button"
              onClick={() => {
                setReq(i);
                setTest(1);
              }}
              className={`rounded-lg border p-2 text-left ${req === i ? 'border-teal-400 bg-teal-500/15' : 'border-gray-700 hover:bg-gray-800'}`}
            >
              <p className="font-mono text-[11px] text-white">{x.field}</p>
              <p className="text-[10px] text-gray-400">{x.text} — {x.rule}</p>
            </button>
          ))}
        </div>

        <div className="max-h-56 overflow-auto custom-scroll rounded-xl">
          <CodeLines lines={MODELS_PY.slice(0, 17)} active={r.code} title="models.py" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {r.tests.map(([l], i) => (
            <button key={l} type="button" className={`${tabClass(test === i)} font-mono`} onClick={() => setTest(i)}>
              {l}
            </button>
          ))}
        </div>

        {r.field === 'region' ? (
          <div className="rounded-xl border border-gray-700 p-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">HouseRegion gate — exact, case-sensitive match</p>
            <div className="flex items-center gap-3">
              <motion.div key={label} initial={{ x: -30, opacity: 0 }} animate={{ x: ok ? 0 : [0, 12, 0], opacity: 1 }} className={`rounded-lg border px-2 py-1 font-mono text-[12px] ${ok ? 'border-emerald-400 text-emerald-100' : 'border-rose-400 text-rose-100'}`}>
                {label}
              </motion.div>
              <div className="flex-1 grid grid-cols-4 gap-1">
                {REGIONS.map((reg, i) => (
                  <motion.div key={reg} animate={{ scale: matchIdx === i ? 1.08 : 1 }} className={`rounded-lg border px-1 py-1.5 text-center font-mono text-[10px] ${matchIdx === i ? 'border-emerald-400 bg-emerald-500/25 text-emerald-100' : 'border-gray-700 text-gray-400'}`}>
                    {reg.toUpperCase()} = "{reg}"
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className={`rounded-lg border px-3 py-2 ${ok ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-rose-400/50 bg-rose-500/10'}`}>
          <p className={`flex items-center gap-1.5 text-[12px] font-semibold ${ok ? 'text-emerald-200' : 'text-rose-200'}`}>
            {ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {r.field} = {label} → {ok ? (r.field === 'region' ? `HouseRegion.${res.value.toUpperCase()}` : pyValue(res.value, spec.type)) : res.errors[0].type}
          </p>
          <p className="text-[10px] text-gray-300 mt-0.5">{ok ? (res.coerced ? 'Converted from a string, then checked.' : 'Passes the rule.') : res.errors[0].msg}</p>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 14. Anatomy of HouseFeatures                                          */
/* ------------------------------------------------------------------ */

const ANATOMY = [
  { id: 'types', label: 'Type hints', lines: [13, 14, 15, 16] },
  { id: 'ellipsis', label: '... = required', lines: [13, 14, 15, 16] },
  { id: 'gt', label: 'gt=0', lines: [13, 15] },
  { id: 'ge', label: 'ge=0', lines: [14] },
  { id: 'description', label: 'description', lines: [13, 14, 15, 16] },
  { id: 'enum', label: 'HouseRegion enum', lines: [4, 5, 6, 7, 8, 9, 16] },
  { id: 'schema_extra', label: 'Config.schema_extra', lines: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34] },
  { id: 'validator', label: '@validator', lines: [18, 19, 20, 21, 22, 23] },
];

const V2_MAP = [
  ['class Config: schema_extra = {...}', 'model_config = ConfigDict(json_schema_extra={...})'],
  ["@validator('area_sqft')", "@field_validator('area_sqft')"],
  ['features.dict()', 'features.model_dump()'],
  ['Field(..., example=1500.5)', 'Field(..., examples=[1500.5])'],
  ['Field(..., min_items=1)', 'Field(..., min_length=1)'],
];

function AnatomyEffect({ id }) {
  const run = (body) => validateObject(HP_FIELDS, body);
  const base = { area_sqft: 1500.5, bedrooms: 3, bathrooms: 2.5, region: 'North' };
  switch (id) {
    case 'types': {
      const r = run({ ...base, bedrooms: '3' });
      const bad = run({ ...base, bedrooms: 'three' });
      return (
        <div className="space-y-1.5 text-[11px]">
          <p className="text-gray-300">Type hints (float, int, HouseRegion) give basic type validation and conversion:</p>
          <Mono className="text-emerald-100">{`"bedrooms": "3"     → bedrooms = ${r.value.bedrooms}  (int)`}</Mono>
          <Mono className="text-rose-100">{`"bedrooms": "three" → 422 ${bad.errors[0].type}`}</Mono>
        </div>
      );
    }
    case 'ellipsis': {
      const { area_sqft, ...rest } = base;
      const r = run(rest);
      return (
        <div className="space-y-1.5 text-[11px]">
          <p className="text-gray-300">
            The <span className="font-mono">...</span> as the first argument of Field means “no default”: the field is required. Sending a body without area_sqft:
          </p>
          <Mono className="text-rose-100">{errorBody(r.errors)}</Mono>
        </div>
      );
    }
    case 'gt':
    case 'ge': {
      const vals = id === 'gt' ? [-1, 0, 0.5, 1500.5] : [-1, 0, 1, 3];
      const field = id === 'gt' ? 'area_sqft' : 'bedrooms';
      return (
        <div className="space-y-1.5 text-[11px]">
          <p className="text-gray-300">
            {id === 'gt' ? 'gt=0 means "greater than 0": 0 itself is rejected.' : 'ge=0 means "greater than or equal to 0": 0 is allowed.'}
          </p>
          <div className="grid grid-cols-4 gap-1">
            {vals.map((v) => {
              const r = run({ ...base, [field]: v });
              const ok = !r.errors.length;
              return (
                <div key={v} className={`rounded-lg border p-1.5 text-center font-mono ${ok ? 'border-emerald-400/50 text-emerald-100' : 'border-rose-400/50 bg-rose-500/10 text-rose-100'}`}>
                  <p className="text-[12px]">{v}</p>
                  <p className="text-[9px]">{ok ? '✓' : r.errors[0].type}</p>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-500">field: {field}</p>
        </div>
      );
    }
    case 'description':
      return (
        <div className="space-y-1.5 text-[11px]">
          <p className="text-gray-300">description helps document the field in the API schema (openapi.json → Swagger UI):</p>
          <Mono className="text-cyan-100">{`"area_sqft": {\n  "type": "number",\n  "exclusiveMinimum": 0,\n  "title": "Area Sqft",\n  "description": "Living area in square feet, must be positive."\n}`}</Mono>
        </div>
      );
    case 'enum':
      return (
        <div className="space-y-1.5 text-[11px]">
          <p className="text-gray-300">The HouseRegion enum restricts region to specific string values. It becomes an enum in the schema, and Swagger shows a dropdown:</p>
          <div className="grid grid-cols-2 gap-2">
            <Mono className="text-cyan-100">{`"HouseRegion": {\n  "type": "string",\n  "enum": ["North", "South",\n           "East", "West"]\n}`}</Mono>
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-2 space-y-0.5">
              <p className="text-[9px] text-gray-500">region * (Swagger)</p>
              {REGIONS.map((r, i) => (
                <p key={r} className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${i === 0 ? 'bg-sky-600 text-white' : 'text-gray-300'}`}>{r}</p>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-500">Subclassing str makes each member behave like its string value, so it serializes to "North" in JSON.</p>
        </div>
      );
    case 'schema_extra':
      return (
        <div className="space-y-1.5 text-[11px]">
          <p className="text-gray-300">Config.schema_extra provides an example payload that appears in the automatically generated docs:</p>
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-2">
            <p className="text-[9px] text-gray-500 mb-1">Request body · Example Value</p>
            <Mono className="text-sky-100">{`{\n  "area_sqft": 1500.5,\n  "bedrooms": 3,\n  "bathrooms": 2.5,\n  "region": "North"\n}`}</Mono>
          </div>
        </div>
      );
    case 'validator':
      return (
        <div className="space-y-1.5 text-[11px]">
          <p className="text-gray-300">A custom validator is shown commented out: the built-in Field constraint already does the same job for a simple positivity check.</p>
          <div className="grid grid-cols-2 gap-2">
            <Mono className="text-gray-300">{`@validator('area_sqft')\ndef area_must_be_positive(cls, v):\n    if v <= 0:\n        raise ValueError(...)\n    return v`}</Mono>
            <Mono className="text-emerald-100">{`area_sqft: float = Field(\n    ..., gt=0\n)`}</Mono>
          </div>
          <p className="text-[10px] text-gray-500">Reach for a validator when the rule cannot be expressed as a constraint (e.g. comparing two fields).</p>
        </div>
      );
    default:
      return null;
  }
}

export function SchemaAnatomyVisualizer() {
  const [pick, setPick] = useState('gt');
  const [showV2, setShowV2] = useState(false);
  const a = ANATOMY.find((x) => x.id === pick);

  return (
    <Frame
      title="Anatomy of the HouseFeatures model"
      hint="Click each ingredient to see it highlighted in the code and what it does."
      footer={
        <button type="button" className={tabClass(showV2)} onClick={() => setShowV2(!showV2)}>
          {showV2 ? 'hide' : 'show'} Pydantic v2 equivalents
        </button>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {ANATOMY.map((x) => (
            <button key={x.id} type="button" className={`${tabClass(pick === x.id)} font-mono`} onClick={() => setPick(x.id)}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-[1.25fr_1fr] gap-3">
          <div className="max-h-80 overflow-auto custom-scroll rounded-xl">
            <CodeLines lines={MODELS_PY} active={a.lines} title="models.py" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={pick} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <AnatomyEffect id={pick} />
            </motion.div>
          </AnimatePresence>
        </div>
        {showV2 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-gray-700 overflow-hidden">
            <div className="grid grid-cols-2 text-[9px] uppercase tracking-wider text-gray-500 px-2 py-1 border-b border-gray-800">
              <span>course (Pydantic v1 style)</span>
              <span>Pydantic v2</span>
            </div>
            {V2_MAP.map(([a1, b]) => (
              <div key={a1} className="grid grid-cols-2 gap-2 px-2 py-1 font-mono text-[10px] border-b border-gray-900">
                <span className="text-gray-400">{a1}</span>
                <span className="text-teal-200">{b}</span>
              </div>
            ))}
            <p className="px-2 py-1 text-[10px] text-gray-500">The v1 spellings still run on v2 with deprecation warnings, so the course code works.</p>
          </motion.div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 15. The endpoint: from JSON to a price                                */
/* ------------------------------------------------------------------ */

export function housePrice(f) {
  let p = f.area_sqft * 100 + f.bedrooms * 5000 + f.bathrooms * 3000;
  if (f.region === 'North') p *= 1.2;
  else if (f.region === 'West') p *= 1.1;
  return Math.round(p * 100) / 100;
}

const MULT = { North: 1.2, West: 1.1, South: 1, East: 1 };
const EP_STEPS = ['Read the JSON body', 'Parse & validate against HouseFeatures', 'features is a HouseFeatures instance', 'Run the (dummy) prediction and return'];

export function PriceEndpointVisualizer() {
  const [f, setF] = useState({ area_sqft: 2150.75, bedrooms: 4, bathrooms: 3, region: 'West' });
  const stepper = useStepper(EP_STEPS.length, 1300);
  const step = stepper.index;

  const parts = [
    { k: 'area_sqft × 100', v: f.area_sqft * 100, c: 'bg-sky-500' },
    { k: 'bedrooms × 5000', v: f.bedrooms * 5000, c: 'bg-violet-500' },
    { k: 'bathrooms × 3000', v: f.bathrooms * 3000, c: 'bg-amber-500' },
  ];
  const base = parts.reduce((s, p) => s + p.v, 0);
  const price = housePrice(f);
  const maxScale = 4000 * 100 + 8 * 5000 + 5 * 3000;

  const bodyJson = `{\n  "area_sqft": ${f.area_sqft},\n  "bedrooms": ${f.bedrooms},\n  "bathrooms": ${f.bathrooms},\n  "region": "${f.region}"\n}`;
  const response = `{\n  "validated_features": {\n    "area_sqft": ${fmtFloat(f.area_sqft)},\n    "bedrooms": ${f.bedrooms},\n    "bathrooms": ${fmtFloat(f.bathrooms)},\n    "region": "${f.region}"\n  },\n  "estimated_price": ${fmtFloat(price)}\n}`;

  const code = [
    '@app.post("/predict/house_price")',
    'async def predict_house_price(features: HouseFeatures):',
    '    print(f"Received valid features: {features.dict()}")',
    '    estimated_price = (features.area_sqft * 100) + (features.bedrooms * 5000) + (features.bathrooms * 3000)',
    '    if features.region == "North":',
    '        estimated_price *= 1.2',
    '    elif features.region == "West":',
    '        estimated_price *= 1.1',
    '    return {"validated_features": features, "estimated_price": round(estimated_price, 2)}',
  ];
  const active = step === 0 ? [0] : step === 1 ? [1] : step === 2 ? [2] : [3, f.region === 'North' ? 5 : f.region === 'West' ? 7 : 3, 8];

  return (
    <Frame
      title="POST /predict/house_price"
      hint="Set the house features, then step through what FastAPI and your function do with them."
      footer={<StepControls stepper={stepper} total={EP_STEPS.length} />}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            ['area_sqft', 100, 4000, 50],
            ['bedrooms', 0, 8, 1],
            ['bathrooms', 0.5, 5, 0.5],
          ].map(([k, min, max, st]) => (
            <label key={k} className="flex items-center gap-2 text-[11px] text-gray-300">
              <span className="font-mono w-28">{k}={f[k]}</span>
              <input type="range" min={min} max={max} step={st} value={f[k]} onChange={(e) => setF((c) => ({ ...c, [k]: Number(e.target.value) }))} className="flex-1 accent-teal-500" />
            </label>
          ))}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[11px] text-gray-300 mr-1">region</span>
            {REGIONS.map((r) => (
              <button key={r} type="button" className={`${tabClass(f.region === r)} !px-2 !py-0.5`} onClick={() => setF((c) => ({ ...c, region: r }))}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {EP_STEPS.map((s, i) => (
            <div key={s} className={`rounded-lg border px-1.5 py-1.5 text-[10px] text-center ${i === step ? 'border-teal-400 bg-teal-500/15 text-white' : i < step ? 'border-gray-700 text-gray-300' : 'border-gray-800 text-gray-600'}`}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            {step === 0 && <Mono className="text-sky-100">{bodyJson}</Mono>}
            {step === 1 && (
              <div className="space-y-1">
                {HP_FIELDS.map((fd) => (
                  <motion.div key={fd.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 font-mono text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-white">{fd.name}</span>
                    <span className="text-gray-500">{fd.type === 'enum' ? 'HouseRegion' : fd.type} {fd.gt !== undefined ? `gt=${fd.gt}` : fd.ge !== undefined ? `ge=${fd.ge}` : ''}</span>
                  </motion.div>
                ))}
                <p className="text-[10px] text-gray-500">Any failure here would return 422 — see the next slide.</p>
              </div>
            )}
            {step >= 2 && (
              <Mono className="text-emerald-100">{`features = HouseFeatures(area_sqft=${fmtFloat(f.area_sqft)}, bedrooms=${f.bedrooms}, bathrooms=${fmtFloat(f.bathrooms)}, region=<HouseRegion.${f.region.toUpperCase()}: '${f.region}'>)`}</Mono>
            )}
            {step === 3 && (
              <div className="space-y-1.5">
                <div className="flex h-5 rounded overflow-hidden bg-gray-800">
                  {parts.map((p) => (
                    <motion.div key={p.k} animate={{ width: `${(p.v / maxScale) * 100 * 0.8}%` }} className={`${p.c} h-full`} />
                  ))}
                  <motion.div animate={{ width: `${((price - base) / maxScale) * 100 * 0.8}%` }} className="bg-emerald-400 h-full" />
                </div>
                {parts.map((p) => (
                  <div key={p.k} className="flex justify-between font-mono text-[10px]">
                    <span className="flex items-center gap-1 text-gray-300"><span className={`w-2 h-2 rounded-sm ${p.c}`} />{p.k}</span>
                    <span className="text-white">{p.v.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between font-mono text-[10px] border-t border-gray-800 pt-1">
                  <span className="text-gray-300">× region {f.region}</span>
                  <span className="text-emerald-200">× {MULT[f.region]}</span>
                </div>
                <div className="flex justify-between font-mono text-[12px]">
                  <span className="text-white">estimated_price</span>
                  <span className="text-emerald-200 font-bold">{price.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <CodeLines lines={code} active={active} title="main.py" />
            {step === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                <Pill code={200} text="OK" />
                <Mono className="text-emerald-100">{response}</Mono>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 16. Testing the validation                                            */
/* ------------------------------------------------------------------ */

const TESTS = {
  valid: { label: 'Valid request', body: { area_sqft: 2150.75, bedrooms: 4, bathrooms: 3, region: 'West' } },
  neg: { label: 'Invalid: negative area', body: { area_sqft: -100, bedrooms: 2, bathrooms: 1, region: 'South' } },
  region: { label: 'Invalid: incorrect region', body: { area_sqft: 1200, bedrooms: 2, bathrooms: 1.5, region: 'Central' } },
};

export function ValidationTestVisualizer() {
  const [test, setTest] = useState('valid');
  const [version, setVersion] = useState('v1');
  return <ValidationTestRun key={test} {...{ test, setTest, version, setVersion }} />;
}

function ValidationTestRun({ test, setTest, version, setVersion }) {
  const stepper = useStepper(3, 1100);
  const step = stepper.index;
  const t = TESTS[test];
  const res = validateObject(HP_FIELDS, t.body);
  const bodyLines = JSON.stringify(t.body, null, 4).split('\n');

  const lines = [
    { kind: 'cmd', text: 'curl -X POST "http://127.0.0.1:8000/predict/house_price" \\' },
    { kind: 'out', text: '-H "Content-Type: application/json" \\' },
    { kind: 'out', text: `-d '${bodyLines[0]}` },
    ...bodyLines.slice(1).map((l, i) => ({ kind: 'out', text: i === bodyLines.length - 2 ? `${l}'` : l })),
  ];
  if (step >= 1) lines.push({ kind: 'dim', text: `> POST /predict/house_price HTTP/1.1  (${JSON.stringify(t.body).length} bytes)` });

  const okBody = res.errors.length
    ? null
    : `{\n  "validated_features": {\n    "area_sqft": ${fmtFloat(res.value.area_sqft)},\n    "bedrooms": ${res.value.bedrooms},\n    "bathrooms": ${fmtFloat(res.value.bathrooms)},\n    "region": "${res.value.region}"\n  },\n  "estimated_price": ${fmtFloat(housePrice(res.value))}\n}`;

  return (
    <Frame
      title="Testing the validation with curl"
      hint="Run uvicorn main:app --reload, then send each request. Switch the error format to compare the course’s output with current Pydantic."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <VersionToggle version={version} setVersion={setVersion} />
          <StepControls stepper={stepper} total={3} showPlay={false} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TESTS).map(([id, x]) => (
            <button key={id} type="button" className={tabClass(test === id)} onClick={() => setTest(id)}>
              {x.label}
            </button>
          ))}
        </div>
        <Terminal title="zsh — curl" lines={lines} />
        {step >= 1 && (
          <div className="grid grid-cols-4 gap-1.5">
            {HP_FIELDS.map((f, i) => {
              const row = res.rows[i];
              const bad = row.status === 'error';
              return (
                <motion.div key={f.name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`rounded-lg border px-1.5 py-1 text-center ${bad ? 'border-rose-400 bg-rose-500/15' : 'border-emerald-400/40'}`}>
                  <p className="font-mono text-[10px] text-white">{f.name}</p>
                  <p className={`text-[9px] ${bad ? 'text-rose-200' : 'text-emerald-200'}`}>{bad ? row.errors[0].type : '✓'}</p>
                </motion.div>
              );
            })}
          </div>
        )}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
            {res.errors.length ? (
              <>
                <Pill code={422} text="Unprocessable Entity" />
                <Mono className="text-rose-100">{errorBody(res.errors, version)}</Mono>
              </>
            ) : (
              <>
                <Pill code={200} text="OK" />
                <Mono className="text-emerald-100">{okBody}</Mono>
                <p className="text-[10px] text-gray-400">
                  (2150.75×100 + 4×5000 + 3×3000) × 1.1 = 244,075 × 1.1 = <span className="text-white">268,482.5</span>. The course text shows 268582.5, which is an
                  arithmetic slip. Also, bathrooms is a float field, so 3 comes back as 3.0.
                </p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ */
/* 17. Request validation flow                                           */
/* ------------------------------------------------------------------ */

const FLOW_NODES = {
  client: { x: 10, y: 70, w: 100, label: ['API Client', '(curl, Web UI)'], fill: '#f3f4f6' },
  route: { x: 140, y: 70, w: 120, label: ['/predict/house_price', '(POST)'], fill: '#bfdbfe' },
  parse: { x: 290, y: 70, w: 110, label: ['Parse & Validate', 'Body'], fill: '#e5e7eb' },
  model: { x: 430, y: 70, w: 110, label: ['Pydantic Model', '(HouseFeatures)'], fill: '#fde68a' },
  logic: { x: 575, y: 20, w: 115, label: ['Endpoint Logic', '(Dummy Prediction)'], fill: '#bbf7d0' },
  ok: { x: 720, y: 20, w: 90, label: ['Success (200 OK)', '{prediction: ...}'], fill: '#bbf7d0' },
  err: { x: 720, y: 125, w: 90, label: ['Error (422)', '{detail: [...]}'], fill: '#fecaca' },
};

const center = (n) => ({ x: FLOW_NODES[n].x + FLOW_NODES[n].w / 2, y: FLOW_NODES[n].y + 20 });

const FLOW = {
  valid: {
    path: ['client', 'route', 'parse', 'model', 'logic', 'ok'],
    captions: [
      'The client sends an HTTP request with a JSON payload.',
      'FastAPI routes it to POST /predict/house_price.',
      'The JSON body is parsed.',
      'Pydantic validates it against HouseFeatures — all rules pass, so a HouseFeatures object is created.',
      'The endpoint logic runs with valid data (the dummy prediction).',
      'FastAPI generates the response: 200 OK with the prediction.',
    ],
  },
  invalid: {
    path: ['client', 'route', 'parse', 'model', 'err'],
    captions: [
      'The client sends an HTTP request with a JSON payload (area_sqft: -100).',
      'FastAPI routes it to POST /predict/house_price.',
      'The JSON body is parsed.',
      'Pydantic validates it against HouseFeatures — gt=0 fails.',
      'Invalid data triggers an automatic 422 response. The endpoint logic is never reached.',
    ],
  },
};

export function RequestFlowVisualizer() {
  const [mode, setMode] = useState('valid');
  return <RequestFlowRun key={mode} mode={mode} setMode={setMode} />;
}

function RequestFlowRun({ mode, setMode }) {
  const flow = FLOW[mode];
  const stepper = useStepper(flow.path.length, 1100);
  const step = stepper.index;
  const visited = flow.path.slice(0, step + 1);
  const dot = center(flow.path[step]);

  const edges = [
    ['client', 'route'],
    ['route', 'parse'],
    ['parse', 'model'],
    ['model', 'logic'],
    ['logic', 'ok'],
    ['model', 'err'],
  ];

  return (
    <Frame
      title="Request validation flow"
      hint="Send a valid or an invalid payload and follow it through the application."
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button type="button" className={tabClass(mode === 'valid')} onClick={() => setMode('valid')}>valid payload</button>
            <button type="button" className={tabClass(mode === 'invalid')} onClick={() => setMode('invalid')}>invalid payload</button>
          </div>
          <StepControls stepper={stepper} total={flow.path.length} />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl bg-white p-2 overflow-x-auto">
          <svg viewBox="0 0 820 180" className="w-full min-w-[560px]">
            <rect x={275} y={5} width={425} height={165} rx={6} fill="#f9fafb" stroke="#d1d5db" />
            <text x={487} y={165} textAnchor="middle" fontSize={10} fill="#6b7280">FastAPI Application</text>
            {edges.map(([a, b]) => {
              const on = visited.includes(a) && visited.includes(b);
              const A = FLOW_NODES[a];
              const B = FLOW_NODES[b];
              const isErr = b === 'err';
              return (
                <line
                  key={`${a}-${b}`}
                  x1={A.x + A.w}
                  y1={A.y + 20}
                  x2={B.x}
                  y2={B.y + 20}
                  stroke={on ? (isErr ? '#dc2626' : '#0d9488') : '#d1d5db'}
                  strokeWidth={on ? 3 : 1.5}
                />
              );
            })}
            {Object.entries(FLOW_NODES).map(([id, n]) => {
              const on = visited.includes(id);
              return (
                <g key={id}>
                  <rect x={n.x} y={n.y} width={n.w} height={40} rx={4} fill={n.fill} stroke={on ? '#0f766e' : '#9ca3af'} strokeWidth={on ? 2.5 : 1} opacity={on ? 1 : 0.55} />
                  <text x={n.x + n.w / 2} y={n.y + 17} textAnchor="middle" fontSize={10} fill="#111827">{n.label[0]}</text>
                  <text x={n.x + n.w / 2} y={n.y + 30} textAnchor="middle" fontSize={8.5} fill="#4b5563">{n.label[1]}</text>
                </g>
              );
            })}
            <motion.circle r={7} fill={mode === 'invalid' && step >= 3 ? '#dc2626' : '#0d9488'} animate={{ cx: dot.x, cy: dot.y - 26 }} transition={{ type: 'spring', stiffness: 120, damping: 16 }} />
          </svg>
        </div>
        <Caption text={`${step + 1}. ${flow.captions[step]}`} />
        <Lesson title="A shield for your model">
          Valid data proceeds to the endpoint logic, while invalid data triggers an automatic error response. Validation shields downstream logic — including ML inference — from
          malformed or nonsensical input, and the clear error messages help API consumers debug their requests.
        </Lesson>
      </div>
    </Frame>
  );
}
