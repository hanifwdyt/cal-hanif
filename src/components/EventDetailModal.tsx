'use client';

import { useEffect } from 'react';
import { CalEvent, CATEGORY_COLORS, CATEGORY_LABELS, DAY_LABELS } from '@/lib/types';
import FormattedNote from './FormattedNote';

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

  const timeText =
    event.time_start && event.time_end
      ? `${event.time_start} – ${event.time_end}`
      : event.time_start ?? event.time_end ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl relative flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        style={{
          background: 'var(--pk-bg-elevated)',
          border: '1px solid var(--pk-border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header (sticky) */}
        <div
          className="px-5 pt-5 pb-4 relative flex-shrink-0"
          style={{ borderBottom: '1px solid var(--pk-border-soft)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors text-base"
            style={{ color: 'var(--pk-text-dim)', background: 'rgba(255,255,255,0.05)' }}
            aria-label="Tutup"
          >
            ✕
          </button>

          <span
            className={`inline-block text-[10px] font-medium px-2.5 py-0.5 rounded-full border mb-2.5 ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {CATEGORY_LABELS[event.category]}
          </span>

          <h2
            className="text-xl font-semibold pr-10 leading-snug mb-2.5"
            style={{ color: 'var(--pk-text)' }}
          >
            {event.title}
          </h2>

          {/* Date + time inline meta */}
          <div className="flex items-center gap-3 flex-wrap text-[12px]" style={{ color: 'var(--pk-text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <span className="opacity-70">📅</span>
              {dateLabel}
            </span>
            {timeText && (
              <span className="flex items-center gap-1.5">
                <span className="opacity-70">🕐</span>
                {timeText}
              </span>
            )}
            {event.repeat === 'weekly' && (
              <span className="flex items-center gap-1.5" style={{ color: 'var(--pk-text-dim)' }}>
                <span>🔁</span>
                Mingguan
              </span>
            )}
          </div>
        </div>

        {/* Note body (scrollable) */}
        {event.note && (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p
              className="text-[10px] uppercase tracking-widest mb-3 font-semibold"
              style={{ color: 'var(--pk-text-dim)' }}
            >
              Detail
            </p>
            <FormattedNote text={event.note} />
          </div>
        )}
      </div>
    </div>
  );
}
