import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Frame, tabClass, Lesson, CodeLines } from './VisualKit';

/* ------------------------------------------------------------------ */
/* Schemas used across the Pydantic slides                               */
/* ------------------------------------------------------------------ */

export const SCHEMAS = {
  InputFeatures: {
    name: 'InputFeatures',
    fields: [
      { name: 'sepal_length', type: 'float', label: 'float', required: true },
      { name: 'sepal_width', type: 'float', label: 'float', required: true },
      { name: 'petal_length', type: 'float', label: 'float', required: true },
      { name: 'petal_width', type: 'float', label: 'float', required: true },
      { name: 'tags', type: 'list_str', label: 'List[str] = []', required: false, default: [] },
    ],
  },
  AdPredictionInput: {
    name: 'AdPredictionInput',
    fields: [
      { name: 'age', type: 'int', label: 'int', required: true },
      { name: 'previous_interaction', type: 'bool', label: 'bool', required: true },
      { name: 'campaign_id', type: 'str', label: 'str | None = None', required: false, nullable: true, default: null },
    ],
  },
  ModelInput: {
    name: 'ModelInput',
    fields: [
      { name: 'feature_alpha', type: 'float', label: 'float', required: true },
      { name: 'feature_beta', type: 'int', label: 'int = Field(gt=0)', required: true, gt: 0 },
      { name: 'category', type: 'str', label: 'str', required: true },
      { name: 'optional_param', type: 'float', label: 'Optional[float] = None', required: false, nullable: true, default: null },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* A small model of Pydantic v2 "lax mode" validation                    */
/* ------------------------------------------------------------------ */

const BOOL_TRUE = ['1', 'on', 't', 'true', 'y', 'yes'];
const BOOL_FALSE = ['0', 'off', 'f', 'false', 'n', 'no'];

const fail = (type, msg) => ({ ok: false, err: { type, msg } });

export function coerce(type, raw) {
  switch (type) {
    case 'int':
      if (typeof raw === 'boolean') return { ok: true, value: raw ? 1 : 0, coerced: true };
      if (typeof raw === 'number') {
        return Number.isInteger(raw) ? { ok: true, value: raw } : fail('int_from_float', 'Input should be a valid integer, got a number with a fractional part');
      }
      if (typeof raw === 'string') {
        return /^\s*[-+]?\d+\s*$/.test(raw)
          ? { ok: true, value: parseInt(raw, 10), coerced: true }
          : fail('int_parsing', 'Input should be a valid integer, unable to parse string as an integer');
      }
      return fail('int_type', 'Input should be a valid integer');
    case 'float':
      if (typeof raw === 'boolean') return { ok: true, value: raw ? 1 : 0, coerced: true };
      if (typeof raw === 'number') return { ok: true, value: raw, coerced: Number.isInteger(raw) };
      if (typeof raw === 'string') {
        return /^\s*[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?\s*$/.test(raw)
          ? { ok: true, value: parseFloat(raw), coerced: true }
          : fail('float_parsing', 'Input should be a valid number, unable to parse string as a number');
      }
      return fail('float_type', 'Input should be a valid number');
    case 'str':
      return typeof raw === 'string' ? { ok: true, value: raw } : fail('string_type', 'Input should be a valid string');
    case 'bool':
      if (typeof raw === 'boolean') return { ok: true, value: raw };
      if (typeof raw === 'number') {
        if (raw === 0 || raw === 1) return { ok: true, value: raw === 1, coerced: true };
        return fail('bool_parsing', 'Input should be a valid boolean, unable to interpret input');
      }
      if (typeof raw === 'string') {
        const s = raw.trim().toLowerCase();
        if (BOOL_TRUE.includes(s)) return { ok: true, value: true, coerced: true };
        if (BOOL_FALSE.includes(s)) return { ok: true, value: false, coerced: true };
        return fail('bool_parsing', 'Input should be a valid boolean, unable to interpret input');
      }
      return fail('bool_type', 'Input should be a valid boolean');
    default:
      return fail('unknown', 'unsupported type');
  }
}

function checkConstraints(field, value) {
  if (field.gt !== undefined && !(value > field.gt)) {
    return { type: 'greater_than', msg: `Input should be greater than ${field.gt}`, ctx: { gt: field.gt } };
  }
  if (field.ge !== undefined && !(value >= field.ge)) {
    return { type: 'greater_than_equal', msg: `Input should be greater than or equal to ${field.ge}`, ctx: { ge: field.ge } };
  }
  if (field.le !== undefined && !(value <= field.le)) {
    return { type: 'less_than_equal', msg: `Input should be less than or equal to ${field.le}`, ctx: { le: field.le } };
  }
  return null;
}

export function validateField(field, obj, locPrefix = ['body']) {
  const present = Object.prototype.hasOwnProperty.call(obj, field.name);
  const raw = obj[field.name];
  const loc = [...locPrefix, field.name];
  const row = { name: field.name, type: field.type, label: field.label, present, raw, errors: [] };

  if (!present) {
    if (field.required) {
      row.status = 'error';
      row.errors.push({ type: 'missing', loc, msg: 'Field required', input: obj });
    } else {
      row.status = 'default';
      row.value = field.default;
    }
    return row;
  }
  if (raw === null) {
    if (field.nullable) {
      row.status = 'ok';
      row.value = null;
      return row;
    }
  }
  if (field.type === 'list_str') {
    if (!Array.isArray(raw)) {
      row.status = 'error';
      row.errors.push({ type: 'list_type', loc, msg: 'Input should be a valid list', input: raw });
      return row;
    }
    raw.forEach((item, i) => {
      if (typeof item !== 'string') row.errors.push({ type: 'string_type', loc: [...loc, i], msg: 'Input should be a valid string', input: item });
    });
    row.status = row.errors.length ? 'error' : 'ok';
    row.value = raw;
    return row;
  }
  const res = coerce(field.type, raw);
  if (!res.ok) {
    row.status = 'error';
    row.errors.push({ ...res.err, loc, input: raw });
    return row;
  }
  const c = checkConstraints(field, res.value);
  if (c) {
    row.status = 'error';
    row.errors.push({ ...c, loc, input: raw });
    return row;
  }
  row.status = res.coerced && !(field.type === 'float' && typeof raw === 'number') ? 'coerced' : 'ok';
  row.value = res.value;
  return row;
}

export function validateModel(schema, obj, locPrefix = ['body']) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    const errors = [{ type: 'model_attributes_type', loc: locPrefix, msg: 'Input should be a valid dictionary or object to extract fields from', input: obj }];
    return { rows: [], errors, extras: [], ok: false };
  }
  const rows = schema.fields.map((f) => validateField(f, obj, locPrefix));
  const errors = rows.flatMap((r) => r.errors);
  const known = schema.fields.map((f) => f.name);
  const extras = Object.keys(obj).filter((k) => !known.includes(k));
  return { rows, errors, extras, ok: errors.length === 0 };
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                     */
/* ------------------------------------------------------------------ */

export function pyRepr(value, type) {
  if (value === null || value === undefined) return 'None';
  if (value === true) return 'True';
  if (value === false) return 'False';
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'number') return type === 'float' && Number.isInteger(value) ? `${value}.0` : String(value);
  if (Array.isArray(value)) return `[${value.map((v) => pyRepr(v)).join(', ')}]`;
  return `{${Object.entries(value).map(([k, v]) => `'${k}': ${pyRepr(v)}`).join(', ')}}`;
}

export function pyJson(value, type) {
  if (typeof value === 'number' && type === 'float' && Number.isInteger(value)) return `${value}.0`;
  return JSON.stringify(value === undefined ? null : value);
}

export function instanceRepr(schema, rows) {
  return `${schema.name}(${rows.map((r) => `${r.name}=${pyRepr(r.value, r.type)}`).join(', ')})`;
}

export function errorsV2(errors) {
  return JSON.stringify(
    {
      detail: errors.map((e) => {
        const out = { type: e.type, loc: e.loc, msg: e.msg, input: e.input };
        if (e.ctx) out.ctx = e.ctx;
        return out;
      }),
    },
    null,
    2,
  );
}

const V1 = {
  missing: ['field required', 'value_error.missing'],
  float_parsing: ['value is not a valid float', 'type_error.float'],
  float_type: ['value is not a valid float', 'type_error.float'],
  int_parsing: ['value is not a valid integer', 'type_error.integer'],
  int_type: ['value is not a valid integer', 'type_error.integer'],
  string_type: ['str type expected', 'type_error.str'],
  bool_parsing: ['value could not be parsed to a boolean', 'type_error.bool'],
};

export function errorsV1(errors) {
  return JSON.stringify(
    {
      detail: errors.map((e) => {
        if (e.type === 'greater_than') {
          return { loc: e.loc, msg: `ensure this value is greater than ${e.ctx.gt}`, type: 'value_error.number.not_gt', ctx: { limit_value: e.ctx.gt } };
        }
        const [msg, type] = V1[e.type] || [e.msg, e.type];
        return { loc: e.loc, msg, type };
      }),
    },
    null,
    2,
  );
}

export function parseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    const m = /position (\d+)/.exec(e.message);
    return { ok: false, pos: m ? Number(m[1]) : null };
  }
}

/* ------------------------------------------------------------------ */
/* UI pieces                                                              */
/* ------------------------------------------------------------------ */

export const STATUS_BADGE = {
  ok: ['valid', 'bg-emerald-500/20 text-emerald-200'],
  coerced: ['converted', 'bg-cyan-500/20 text-cyan-200'],
  default: ['default used', 'bg-amber-500/20 text-amber-200'],
  error: ['error', 'bg-rose-500/20 text-rose-200'],
};

export const Mono = ({ children, className = '' }) => (
  <pre className={`font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all rounded-lg bg-black/60 border border-gray-800 p-2.5 text-gray-200 ${className}`}>
    {children}
  </pre>
);

export const Pill = ({ code, text }) => {
  const tone =
    code < 300 ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/50' : code < 500 ? 'bg-amber-500/20 text-amber-200 border-amber-400/50' : 'bg-rose-500/20 text-rose-200 border-rose-400/50';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full border font-mono text-[11px] font-bold ${tone}`}>{code} {text}</span>;
};

export function FieldTable({ rows, reveal = true, extras = [], onPick, picked }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950 overflow-hidden">
      <div className="grid grid-cols-[1.3fr_1.2fr_1fr_5.5rem_1fr] gap-2 px-3 py-1.5 text-[9px] uppercase tracking-wider text-gray-500 border-b border-gray-800">
        <span>field</span><span>type hint</span><span>JSON input</span><span>result</span><span>Python value</span>
      </div>
      {rows.map((r) => {
        const [label, tone] = STATUS_BADGE[r.status];
        return (
          <div
            key={r.name}
            onClick={onPick ? () => onPick(r.name) : undefined}
            className={`grid grid-cols-[1.3fr_1.2fr_1fr_5.5rem_1fr] gap-2 px-3 py-1.5 font-mono text-[11px] items-center ${onPick ? 'cursor-pointer hover:bg-gray-800/60' : ''} ${
              picked === r.name ? 'bg-teal-500/10' : ''
            }`}
          >
            <span className="text-white truncate">{r.name}</span>
            <span className="text-violet-200 truncate">{r.label}</span>
            <span className="text-gray-300 truncate">{r.present ? JSON.stringify(r.raw) : <span className="text-gray-600">(missing)</span>}</span>
            <span>
              {reveal ? (
                <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`inline-block px-1.5 rounded text-[10px] font-sans font-semibold ${tone}`}>
                  {label}
                </motion.span>
              ) : (
                <span className="text-gray-700">…</span>
              )}
            </span>
            <span className={`truncate ${reveal ? (r.status === 'error' ? 'text-rose-300' : 'text-emerald-200') : 'text-gray-700'}`}>
              {reveal ? (r.status === 'error' ? `✗ ${r.errors[0].type}` : pyRepr(r.value, r.type)) : '…'}
            </span>
          </div>
        );
      })}
      {extras.length > 0 && (
        <p className="px-3 py-1 text-[10px] text-gray-500 border-t border-gray-800">
          Extra keys ignored: <span className="font-mono text-gray-400">{extras.join(', ')}</span> (not part of the model)
        </p>
      )}
    </div>
  );
}

export function Outcome({ schema, result, parsed, format = 'v2', successText }) {
  if (!parsed.ok) {
    return (
      <div className="rounded-xl border border-rose-400/50 bg-rose-500/10 p-3 space-y-1.5">
        <Pill code={422} text="Unprocessable Entity" />
        <Mono className="text-rose-100">
          {JSON.stringify({ detail: [{ type: 'json_invalid', loc: ['body', parsed.pos ?? 0], msg: 'JSON decode error', input: {} }] }, null, 2)}
        </Mono>
        <p className="text-[10px] text-gray-400">The body is not valid JSON, so parsing fails before Pydantic even sees it.</p>
      </div>
    );
  }
  if (!result.ok) {
    return (
      <div className="rounded-xl border border-rose-400/50 bg-rose-500/10 p-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <Pill code={422} text="Unprocessable Entity" />
          <span className="text-[10px] text-gray-400">{result.errors.length} error{result.errors.length > 1 ? 's' : ''} — all reported at once</span>
        </div>
        <Mono className="text-rose-100 max-h-56 overflow-auto">{format === 'v1' ? errorsV1(result.errors) : errorsV2(result.errors)}</Mono>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 space-y-1">
      <p className="text-[10px] uppercase tracking-wider text-emerald-300">validated Python object</p>
      <p className="font-mono text-[11px] text-white break-all">{instanceRepr(schema, result.rows)}</p>
      {successText && <p className="text-[10px] text-gray-400">{successText}</p>}
    </div>
  );
}

/** Editable JSON body + preset buttons, validated live against a schema. */
export function ModelPlayground({ schemaKey, code, fieldLines = {}, presets, title, hint, notes = {}, header }) {
  const schema = SCHEMAS[schemaKey];
  const [presetId, setPresetId] = useState(presets[0].id);
  const [text, setText] = useState(presets[0].json);
  const [picked, setPicked] = useState(null);
  const parsed = parseJson(text);
  const result = parsed.ok ? validateModel(schema, parsed.value) : { rows: [], errors: [], extras: [], ok: false };
  const preset = presets.find((p) => p.id === presetId);
  const errorFields = result.rows.filter((r) => r.status === 'error').map((r) => fieldLines[r.name]).filter((x) => x !== undefined);
  const pickedLine = picked !== null && fieldLines[picked] !== undefined ? [fieldLines[picked]] : [];

  return (
    <Frame title={title} hint={hint}>
      <div className="space-y-3">
        {header}
        <div className="grid md:grid-cols-2 gap-3">
          <CodeLines
            lines={code}
            active={pickedLine.length ? pickedLine : errorFields}
            title="the model"
            onLineClick={(i) => {
              const hit = Object.entries(fieldLines).find(([, line]) => line === i);
              if (hit) setPicked(hit[0]);
            }}
          />
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={tabClass(p.id === presetId)}
                  onClick={() => {
                    setPresetId(p.id);
                    setText(p.json);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setPresetId(null);
              }}
              spellCheck={false}
              rows={Math.min(8, text.split('\n').length + 1)}
              className="w-full rounded-lg bg-black/70 border border-gray-700 focus:border-teal-400 outline-none p-2.5 font-mono text-[11px] text-sky-100 resize-none"
            />
            <p className="text-[10px] text-gray-500">Edit the JSON freely — validation reruns as you type.</p>
          </div>
        </div>

        {parsed.ok && result.rows.length > 0 && (
          <FieldTable rows={result.rows} extras={result.extras} onPick={setPicked} picked={picked} />
        )}

        {picked && notes[picked] ? (
          <Lesson title={picked}>{notes[picked]}</Lesson>
        ) : preset?.note ? (
          <Lesson title={preset.label}>{preset.note}</Lesson>
        ) : null}

        <Outcome schema={schema} result={result} parsed={parsed} />
      </div>
    </Frame>
  );
}
