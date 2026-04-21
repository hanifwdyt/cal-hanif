'use client';

import { useState, useMemo } from 'react';
import { CalEvent, CATEGORY_COLORS, CATEGORY_LABELS, DayOfWeek } from '@/lib/types';
import EventDetailModal from './EventDetailModal';

// Monday-first: Mon=0 ... Sun=6
const DAY_TO_IDX: Record<DayOfWeek, number> = {
  monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
  friday: 4, saturday: 5, sunday: 6,
};

const WEEK_HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', "Jum'at", 'Sab', 'Min'];

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function getMondayFirstOffset(date: Date): number {
  const d = date.getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getEventsForDate(events: CalEvent[], date: Date): CalEvent[] {
  const dateStr = toDateStr(date);
  const jsDay = date.getDay();
  const mondayIdx = jsDay === 0 ? 6 : jsDay - 1;
  return events.filter(ev => {
    if (ev.date) return ev.date === dateStr;          // specific dated event
    return DAY_TO_IDX[ev.day] === mondayIdx;          // recurring weekly
  });
}

interface Props {
  events: CalEvent[];
}

export default function CalendarClient({ events }: Props) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<{ event: CalEvent; date: Date } | null>(null);

  const minYear = today.getFullYear();
  const minMonth = today.getMonth() - 1;
  const maxYear = today.getFullYear();
  const maxMonth = today.getMonth() + 11;

  const toMonthIdx = (y: number, m: number) => y * 12 + m;
  const curIdx = toMonthIdx(year, month);
  const canPrev = curIdx > toMonthIdx(minYear, minMonth);
  const canNext = curIdx < toMonthIdx(maxYear, maxMonth);

  const navigate = (dir: -1 | 1) => {
    setMonth(m => {
      const next = m + dir;
      if (next < 0) { setYear(y => y - 1); return 11; }
      if (next > 11) { setYear(y => y + 1); return 0; }
      return next;
    });
  };

  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  // Build calendar grid cells
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = getMondayFirstOffset(firstDay);
    const total = Math.ceil((offset + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const dayNum = i - offset + 1;
      if (dayNum < 1 || dayNum > daysInMonth) return null;
      return new Date(year, month, dayNum);
    });
  }, [year, month]);

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  return (
    <div>
      {/* Month navigator */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          disabled={!canPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-lg font-light"
          style={{
            color: canPrev ? 'var(--pk-gold)' : 'var(--pk-text-dim)',
            background: canPrev ? 'rgba(200,163,90,0.08)' : 'transparent',
            border: `1px solid ${canPrev ? 'rgba(200,163,90,0.2)' : 'transparent'}`,
          }}
        >
          ‹
        </button>

        <div className="flex-1 flex items-baseline gap-2">
          <span className="text-xl font-semibold" style={{ color: 'var(--pk-text)' }}>
            {MONTH_NAMES[month]}
          </span>
          <span className="text-sm" style={{ color: 'var(--pk-text-dim)' }}>{year}</span>
        </div>

        {!isCurrentMonth && (
          <button
            onClick={goToday}
            className="text-[11px] px-3 py-1 rounded-full transition-all"
            style={{
              color: 'var(--pk-gold)',
              border: '1px solid rgba(200,163,90,0.25)',
              background: 'rgba(200,163,90,0.06)',
            }}
          >
            Hari ini
          </button>
        )}

        <button
          onClick={() => navigate(1)}
          disabled={!canNext}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-lg font-light"
          style={{
            color: canNext ? 'var(--pk-gold)' : 'var(--pk-text-dim)',
            background: canNext ? 'rgba(200,163,90,0.08)' : 'transparent',
            border: `1px solid ${canNext ? 'rgba(200,163,90,0.2)' : 'transparent'}`,
          }}
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK_HEADERS.map(h => (
          <div key={h} className="text-center text-[10px] font-semibold pb-2 tracking-wide" style={{ color: 'var(--pk-text-dim)' }}>
            {h}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="rounded-xl" style={{ minHeight: 80 }} />;
          }
          const isToday = date.getTime() === today.getTime();
          const dayEvents = getEventsForDate(events, date);
          const MAX_SHOW = 3;
          const overflow = Math.max(0, dayEvents.length - MAX_SHOW);

          return (
            <div
              key={date.toISOString()}
              className="rounded-xl p-1.5 transition-colors"
              style={{
                minHeight: 80,
                background: isToday ? 'rgba(200,163,90,0.06)' : 'rgba(255,255,255,0.02)',
                border: isToday
                  ? '1px solid rgba(200,163,90,0.3)'
                  : '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {/* Date number */}
              <div className="flex justify-end mb-1">
                <span
                  className="text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full leading-none"
                  style={isToday ? {
                    background: 'var(--pk-gold)',
                    color: '#1a1410',
                    fontWeight: 700,
                  } : {
                    color: 'var(--pk-text-dim)',
                  }}
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, MAX_SHOW).map(ev => (
                  <EventPill key={ev.id} event={ev} onClick={() => setSelected({ event: ev, date })} />
                ))}
                {overflow > 0 && (
                  <button
                    className="w-full text-left text-[9px] px-1.5 py-0.5 rounded transition-colors"
                    style={{ color: 'var(--pk-text-dim)', background: 'rgba(255,255,255,0.04)' }}
                    onClick={() => setSelected({ event: dayEvents[MAX_SHOW], date })}
                  >
                    +{overflow} lagi
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Month summary bar */}
      <MonthSummary events={events} year={year} month={month} cells={cells} />

      {/* Detail modal */}
      {selected && (
        <EventDetailModal
          event={selected.event}
          date={selected.date}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function EventPill({ event, onClick }: { event: CalEvent; onClick: () => void }) {
  const colors = CATEGORY_COLORS[event.category];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded px-1.5 py-0.5 text-[9px] leading-tight font-medium transition-opacity hover:opacity-80 active:opacity-60 truncate ${colors.bg} ${colors.text}`}
      title={`${event.title}${event.time_start ? ` · ${event.time_start}` : ''}`}
    >
      {event.time_start && (
        <span className="opacity-70 mr-0.5">{event.time_start.slice(0, 5)}</span>
      )}
      {event.title}
    </button>
  );
}

function MonthSummary({ events, year, month, cells }: {
  events: CalEvent[];
  year: number;
  month: number;
  cells: (Date | null)[];
}) {
  const summary = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const date of cells) {
      if (!date) continue;
      const dayEvs = getEventsForDate(events, date);
      for (const ev of dayEvs) {
        counts[ev.category] = (counts[ev.category] ?? 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [events, year, month, cells]);

  if (!summary.length) return null;

  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--pk-border-soft)' }}>
      <p className="text-[10px] uppercase tracking-widest mb-2 font-medium" style={{ color: 'var(--pk-text-dim)' }}>
        Ringkasan Bulan Ini
      </p>
      <div className="flex flex-wrap gap-2">
        {summary.map(([cat, count]) => {
          const colors = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
          return (
            <span
              key={cat}
              className={`text-[10px] px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${colors.bg} ${colors.text} ${colors.border}`}
            >
              {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
              <span
                className="text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(0,0,0,0.25)' }}
              >
                {count}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
