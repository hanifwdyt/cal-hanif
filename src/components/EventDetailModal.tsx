'use client';

import { useEffect } from 'react';
import { CalEvent, CATEGORY_COLORS, CATEGORY_LABELS, DAY_LABELS } from '@/lib/types';

interface Props {
  event: CalEvent;
  date?: Date;
  onClose: () => void;
}

export default function EventDetailModal({ event, date, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const colors = CATEGORY_COLORS[event.category];

  const dateLabel = date
    ? date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : DAY_LABELS[event.day];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5 relative"
        style={{
          background: 'var(--pk-bg-elevated)',
          border: '1px solid var(--pk-border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--pk-text-dim)', background: 'rgba(255,255,255,0.05)' }}
        >
          ✕
        </button>

        {/* Category badge */}
        <span
          className={`inline-block text-[10px] font-medium px-2.5 py-0.5 rounded-full border mb-3 ${colors.bg} ${colors.text} ${colors.border}`}
        >
          {CATEGORY_LABELS[event.category]}
        </span>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4 pr-8 leading-snug" style={{ color: 'var(--pk-text)' }}>
          {event.title}
        </h2>

        {/* Details */}
        <div className="space-y-3">
          <Row icon="📅" label="Hari" value={dateLabel} />

          {(event.time_start || event.time_end) && (
            <Row
              icon="🕐"
              label="Waktu"
              value={
                event.time_start && event.time_end
                  ? `${event.time_start} – ${event.time_end}`
                  : event.time_start ?? event.time_end ?? ''
              }
            />
          )}

          {event.note && <Row icon="📝" label="Catatan" value={event.note} multiline />}

          <Row
            icon="🔁"
            label="Pengulangan"
            value={event.repeat === 'weekly' ? 'Setiap minggu' : 'Tidak berulang'}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value, multiline }: { icon: string; label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex gap-3">
      <span className="text-base leading-none mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest mb-0.5 font-medium" style={{ color: 'var(--pk-text-dim)' }}>
          {label}
        </p>
        <p className={`text-sm ${multiline ? 'leading-relaxed' : ''}`} style={{ color: 'var(--pk-text-muted)' }}>
          {value}
        </p>
      </div>
    </div>
  );
}
