import React from 'react';

function flatten(children) {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(flatten).join('');
  return '';
}

/** Split Python source so `#` comments can be colored apart from the code. `#` inside a string stays code. */
export function splitCodeComments(source) {
  const text = flatten(source);
  const parts = [];
  let code = '';
  const pushCode = () => {
    if (!code) return;
    parts.push({ comment: false, text: code });
    code = '';
  };

  let i = 0;
  while (i < text.length) {
    if (text.startsWith('"""', i) || text.startsWith("'''", i)) {
      const quote = text.slice(i, i + 3);
      const end = text.indexOf(quote, i + 3);
      const stop = end === -1 ? text.length : end + 3;
      code += text.slice(i, stop);
      i = stop;
      continue;
    }
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < text.length) {
        if (text[j] === '\\') {
          j += 2;
          continue;
        }
        if (text[j] === '\n' || text[j] === ch) {
          if (text[j] === ch) j += 1;
          break;
        }
        j += 1;
      }
      code += text.slice(i, j);
      i = j;
      continue;
    }
    if (ch === '#') {
      pushCode();
      let j = i;
      while (j < text.length && text[j] !== '\n') j += 1;
      parts.push({ comment: true, text: text.slice(i, j) });
      i = j;
      continue;
    }
    code += ch;
    i += 1;
  }
  pushCode();
  return parts;
}

export function CodeText({ text, codeClass = 'text-teal-100', commentClass = 'text-amber-200' }) {
  return splitCodeComments(text).map((part, index) => (
    <span key={index} className={part.comment ? commentClass : codeClass}>
      {part.text}
    </span>
  ));
}

export default function CodeBlock({ children, className = 'p-3' }) {
  return (
    <pre className={`font-mono text-[11px] leading-relaxed bg-gray-950/80 border border-gray-700 rounded-lg overflow-x-auto ${className}`}>
      <CodeText text={children} />
    </pre>
  );
}
