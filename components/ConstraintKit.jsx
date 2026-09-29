import React from 'react';
import { coerce, Mono, Pill } from './PydanticKit';
import { tabClass } from './VisualKit';

/* ------------------------------------------------------------------ */
/* Pydantic v2 (lax mode) validation with Field constraints              */
/* ------------------------------------------------------------------ */
/*
  Field spec:
    { name, type: 'int'|'float'|'bool'|'str'|'enum'|'list'|'model',
      required, default, nullable,
      gt, ge, lt, le,                 // numbers
      min_length, max_length, pattern, // str and list
      values,                          // enum
      items,                           // list item spec
      fields }                         // nested model
*/

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

export const enumExpected = (values) =>
  values.length === 1 ? `'${values[0]}'` : `${values.slice(0, -1).map((v) => `'${v}'`).join(', ')} or '${values[values.length - 1]}'`;

function numberChecks(spec, value, loc, input) {
  if (spec.gt !== undefined && !(value > spec.gt)) return { type: 'greater_than', loc, msg: `Input should be greater than ${spec.gt}`, input, ctx: { gt: spec.gt } };
  if (spec.ge !== undefined && !(value >= spec.ge)) return { type: 'greater_than_equal', loc, msg: `Input should be greater than or equal to ${spec.ge}`, input, ctx: { ge: spec.ge } };
  if (spec.lt !== undefined && !(value < spec.lt)) return { type: 'less_than', loc, msg: `Input should be less than ${spec.lt}`, input, ctx: { lt: spec.lt } };
  if (spec.le !== undefined && !(value <= spec.le)) return { type: 'less_than_equal', loc, msg: `Input should be less than or equal to ${spec.le}`, input, ctx: { le: spec.le } };
  return null;
}

export function validateValue(spec, raw, loc) {
  if (raw === null && spec.nullable) return { value: null, errors: [] };

  if (spec.type === 'model') return validateObject(spec.fields, raw, loc);

  if (spec.type === 'enum') {
    if (typeof raw === 'string' && spec.values.includes(raw)) return { value: raw, errors: [] };
    const expected = enumExpected(spec.values);
    return { errors: [{ type: 'enum', loc, msg: `Input should be ${expected}`, input: raw, ctx: { expected }, values: spec.values }] };
  }

  if (spec.type === 'list') {
    if (!Array.isArray(raw)) return { errors: [{ type: 'list_type', loc, msg: 'Input should be a valid list', input: raw }] };
    const errors = [];
    const value = raw.map((item, i) => {
      const r = validateValue(spec.items, item, [...loc, i]);
      errors.push(...r.errors);
      return r.value;
    });
    if (errors.length) return { errors };
    if (spec.min_length !== undefined && raw.length < spec.min_length) {
      return {
        errors: [{ type: 'too_short', loc, msg: `List should have at least ${plural(spec.min_length, 'item')} after validation, not ${raw.length}`, input: raw, ctx: { field_type: 'List', min_length: spec.min_length, actual_length: raw.length } }],
      };
    }
    if (spec.max_length !== undefined && raw.length > spec.max_length) {
      return {
        errors: [{ type: 'too_long', loc, msg: `List should have at most ${plural(spec.max_length, 'item')} after validation, not ${raw.length}`, input: raw, ctx: { field_type: 'List', max_length: spec.max_length, actual_length: raw.length } }],
      };
    }
    return { value, errors: [] };
  }

  if (spec.type === 'str') {
    if (typeof raw !== 'string') return { errors: [{ type: 'string_type', loc, msg: 'Input should be a valid string', input: raw }] };
    if (spec.min_length !== undefined && raw.length < spec.min_length) {
      return { errors: [{ type: 'string_too_short', loc, msg: `String should have at least ${plural(spec.min_length, 'character')}`, input: raw, ctx: { min_length: spec.min_length } }] };
    }
    if (spec.max_length !== undefined && raw.length > spec.max_length) {
      return { errors: [{ type: 'string_too_long', loc, msg: `String should have at most ${plural(spec.max_length, 'character')}`, input: raw, ctx: { max_length: spec.max_length } }] };
    }
    if (spec.pattern !== undefined && !new RegExp(spec.pattern).test(raw)) {
      return { errors: [{ type: 'string_pattern_mismatch', loc, msg: `String should match pattern '${spec.pattern}'`, input: raw, ctx: { pattern: spec.pattern } }] };
    }
    return { value: raw, errors: [] };
  }

  const res = coerce(spec.type, raw);
  if (!res.ok) return { errors: [{ ...res.err, loc, input: raw }] };
  const c = numberChecks(spec, res.value, loc, raw);
  if (c) return { errors: [c] };
  return { value: res.value, errors: [], coerced: res.coerced && !(spec.type === 'float' && typeof raw === 'number') };
}

export function validateObject(fields, raw, loc = ['body']) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { errors: [{ type: 'model_attributes_type', loc, msg: 'Input should be a valid dictionary or object to extract fields from', input: raw }], rows: [] };
  }
  const value = {};
  const errors = [];
  const rows = [];
  fields.forEach((f) => {
    const floc = [...loc, f.name];
    if (!has(raw, f.name)) {
      if (f.required) {
        errors.push({ type: 'missing', loc: floc, msg: 'Field required', input: raw });
        rows.push({ name: f.name, status: 'error', errors: [errors[errors.length - 1]] });
      } else {
        value[f.name] = f.default === undefined ? null : f.default;
        rows.push({ name: f.name, status: 'default', value: value[f.name] });
      }
      return;
    }
    const r = validateValue(f, raw[f.name], floc);
    if (r.errors.length) {
      errors.push(...r.errors);
      rows.push({ name: f.name, status: 'error', raw: raw[f.name], errors: r.errors });
    } else {
      value[f.name] = r.value;
      rows.push({ name: f.name, status: r.coerced ? 'coerced' : 'ok', raw: raw[f.name], value: r.value });
    }
  });
  return { value: errors.length ? undefined : value, errors, rows };
}

/* ------------------------------------------------------------------ */
/* Error formatting: FastAPI + Pydantic v2 and the course's v1 format    */
/* ------------------------------------------------------------------ */

const V1_SIMPLE = {
  missing: ['field required', 'value_error.missing'],
  int_parsing: ['value is not a valid integer', 'type_error.integer'],
  int_type: ['value is not a valid integer', 'type_error.integer'],
  int_from_float: ['value is not a valid integer', 'type_error.integer'],
  float_parsing: ['value is not a valid float', 'type_error.float'],
  float_type: ['value is not a valid float', 'type_error.float'],
  bool_parsing: ['value could not be parsed to a boolean', 'type_error.bool'],
  string_type: ['str type expected', 'type_error.str'],
  model_attributes_type: ['value is not a valid dict', 'type_error.dict'],
  list_type: ['value is not a valid list', 'type_error.list'],
};

export function toV1(e) {
  const c = e.ctx || {};
  switch (e.type) {
    case 'greater_than':
      return { loc: e.loc, msg: `ensure this value is greater than ${c.gt}`, type: 'value_error.number.not_gt', ctx: { limit_value: c.gt } };
    case 'greater_than_equal':
      return { loc: e.loc, msg: `ensure this value is greater than or equal to ${c.ge}`, type: 'value_error.number.not_ge', ctx: { limit_value: c.ge } };
    case 'less_than':
      return { loc: e.loc, msg: `ensure this value is less than ${c.lt}`, type: 'value_error.number.not_lt', ctx: { limit_value: c.lt } };
    case 'less_than_equal':
      return { loc: e.loc, msg: `ensure this value is less than or equal to ${c.le}`, type: 'value_error.number.not_le', ctx: { limit_value: c.le } };
    case 'enum':
      return {
        loc: e.loc,
        msg: `value is not a valid enumeration member; permitted: ${e.values.map((v) => `'${v}'`).join(', ')}`,
        type: 'type_error.enum',
        ctx: { enum_values: e.values },
      };
    case 'string_too_short':
      return { loc: e.loc, msg: `ensure this value has at least ${c.min_length} characters`, type: 'value_error.any_str.min_length', ctx: { limit_value: c.min_length } };
    case 'string_too_long':
      return { loc: e.loc, msg: `ensure this value has at most ${c.max_length} characters`, type: 'value_error.any_str.max_length', ctx: { limit_value: c.max_length } };
    case 'string_pattern_mismatch':
      return { loc: e.loc, msg: `string does not match regex "${c.pattern}"`, type: 'value_error.str.regex', ctx: { pattern: c.pattern } };
    case 'too_short':
      return { loc: e.loc, msg: `ensure this value has at least ${c.min_length} items`, type: 'value_error.list.min_items', ctx: { limit_value: c.min_length } };
    case 'too_long':
      return { loc: e.loc, msg: `ensure this value has at most ${c.max_length} items`, type: 'value_error.list.max_items', ctx: { limit_value: c.max_length } };
    default: {
      const [msg, type] = V1_SIMPLE[e.type] || [e.msg, e.type];
      return { loc: e.loc, msg, type };
    }
  }
}

export function toV2(e) {
  const out = { type: e.type, loc: e.loc, msg: e.msg, input: e.input };
  if (e.ctx) out.ctx = e.ctx;
  return out;
}

export function errorBody(errors, version = 'v2') {
  return JSON.stringify({ detail: errors.map(version === 'v1' ? toV1 : toV2) }, null, 2);
}

/* ------------------------------------------------------------------ */
/* Small shared UI                                                        */
/* ------------------------------------------------------------------ */

export function VersionToggle({ version, setVersion }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-gray-500">error format</span>
      <button type="button" className={tabClass(version === 'v2')} onClick={() => setVersion('v2')}>
        Pydantic v2 (current)
      </button>
      <button type="button" className={tabClass(version === 'v1')} onClick={() => setVersion('v1')}>
        v1 (course text)
      </button>
    </div>
  );
}

export function ResultBox({ errors, okBody, version = 'v2', okNote, errNote }) {
  if (errors.length) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Pill code={422} text="Unprocessable Entity" />
          <span className="text-[10px] text-gray-400">{plural(errors.length, 'error')}, reported together</span>
        </div>
        <Mono className="text-rose-100 max-h-72 overflow-auto custom-scroll">{errorBody(errors, version)}</Mono>
        {errNote && <p className="text-[10px] text-gray-400">{errNote}</p>}
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <Pill code={200} text="OK" />
      <Mono className="text-emerald-100">{okBody}</Mono>
      {okNote && <p className="text-[10px] text-gray-400">{okNote}</p>}
    </div>
  );
}

export const jsonToken = (v) => (v === undefined ? '—' : JSON.stringify(v));

export const pyValue = (v, type) => {
  if (v === null || v === undefined) return 'None';
  if (v === true) return 'True';
  if (v === false) return 'False';
  if (typeof v === 'string') return `'${v}'`;
  if (typeof v === 'number') return type === 'float' && Number.isInteger(v) ? `${v}.0` : String(v);
  if (Array.isArray(v)) return `[${v.map((x) => pyValue(x)).join(', ')}]`;
  return `{${Object.entries(v).map(([k, x]) => `'${k}': ${pyValue(x)}`).join(', ')}}`;
};
