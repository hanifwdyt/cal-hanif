'use client';

import { useMemo } from 'react';

type Block =
  | { type: 'header'; title: string; meta?: string }
  | { type: 'exercise'; name: string; spec: string; tip?: string }
  | { type: 'text'; text: string }
  | { type: 'footer'; text: string }
  | { type: 'spacer' };

const HEADER_RE = /^([A-Z][A-Z\s&]+?)(?:\s*\((.+?)\))?\s*$/;
const SPEC_HINT = /^(?:\d+\s*[x×]\s*\d+|\d+s\b|\d+\s*menit|~\d|\d+\s*min)/i;

function parseNote(note: string): Block[] {
  const lines = note.split('\n');
  const out: Block[] = [];

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) {
      if (out.length && out[out.length - 1].type !== 'spacer') {
        out.push({ type: 'spacer' });
      }
      continue;
    }

    const headerMatch = line.match(HEADER_RE);
    if (headerMatch && headerMatch[1].trim().length >= 3) {
      out.push({
        type: 'header',
        title: headerMatch[1].trim(),
        meta: headerMatch[2]?.trim(),
      });
      continue;
    }

    const dashSplit = line.split(/\s+[—–]\s+/);
    if (dashSplit.length >= 2 && SPEC_HINT.test(dashSplit[1])) {
      const [name, spec, ...rest] = dashSplit;
      out.push({
        type: 'exercise',
        name: name.trim(),
        spec: spec.trim(),
        tip: rest.length ? rest.join(' — ').trim() : undefined,
      });
      continue;
    }

    if (/^total\b/i.test(line)) {
      out.push({ type: 'footer', text: line });
      continue;
    }

    out.push({ type: 'text', text: line });
  }

  while (out.length && out[out.length - 1].type === 'spacer') out.pop();
  return out;
}

interface Props {
  text: string;
}

export default function FormattedNote({ text }: Props) {
  const blocks = useMemo(() => parseNote(text), [text]);
  const hasStructure = blocks.some(b => b.type === 'header' || b.type === 'exercise');

  if (!hasStructure) {
    return (
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: 'var(--pk-text-muted)' }}
      >
        {text}
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'header':
            return <Header key={i} title={b.title} meta={b.meta} />;
          case 'exercise':
            return <Exercise key={i} name={b.name} spec={b.spec} tip={b.tip} />;
          case 'text':
            return (
              <p
                key={i}
                className="text-[13px] leading-relaxed pl-1"
                style={{ color: 'var(--pk-text-muted)' }}
              >
                {b.text}
              </p>
            );
          case 'footer':
            return (
              <div
                key={i}
                className="mt-3 pt-3 text-[11px] uppercase tracking-widest font-semibold"
                style={{
                  color: 'var(--pk-gold)',
                  borderTop: '1px dashed var(--pk-border-soft)',
                }}
              >
                {b.text}
              </div>
            );
          case 'spacer':
            return <div key={i} className="h-1.5" />;
        }
      })}
    </div>
  );
}

function Header({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-baseline gap-2 pt-2 first:pt-0">
      <span
        className="text-[11px] uppercase tracking-[0.18em] font-bold"
        style={{ color: 'var(--pk-gold)' }}
      >
        {title}
      </span>
      {meta && (
        <span
          className="text-[10px]"
          style={{ color: 'var(--pk-text-dim)' }}
        >
          · {meta}
        </span>
      )}
    </div>
  );
}

function Exercise({ name, spec, tip }: { name: string; spec: string; tip?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1 pl-1">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] leading-snug" style={{ color: 'var(--pk-text)' }}>
          {name}
        </p>
        {tip && (
          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--pk-text-dim)' }}>
            {tip}
          </p>
        )}
      </div>
      <span
        className="flex-shrink-0 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md tabular-nums"
        style={{
          color: 'var(--pk-gold-bright)',
          background: 'rgba(200, 163, 90, 0.10)',
          border: '1px solid rgba(200, 163, 90, 0.18)',
        }}
      >
        {spec}
      </span>
    </div>
  );
}
