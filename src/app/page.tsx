import { listEvents } from '@/lib/db';
import { DAYS, DAY_LABELS, CATEGORY_LABELS, CATEGORY_COLORS, CalEvent, DayOfWeek } from '@/lib/types';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

async function logout() {
  'use server';
  const session = await getSession();
  session.destroy();
  revalidatePath('/');
  redirect('/login');
}

function EventCard({ event }: { event: CalEvent }) {
  const colors = CATEGORY_COLORS[event.category];
  return (
    <div className={`rounded-lg px-2.5 py-2 border text-xs ${colors.bg} ${colors.border} mb-1.5`}>
      <div className={`font-medium leading-tight ${colors.text}`}>{event.title}</div>
      {(event.time_start || event.time_end) && (
        <div className="mt-0.5 text-[10px]" style={{ color: 'var(--pk-text-dim)' }}>
          {event.time_start ?? ''}
          {event.time_start && event.time_end ? ' – ' : ''}
          {event.time_end ?? ''}
        </div>
      )}
      {event.note && (
        <div className="mt-0.5 text-[10px] leading-tight truncate" style={{ color: 'var(--pk-text-dim)' }}>{event.note}</div>
      )}
    </div>
  );
}

function CategoryLegend() {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {(Object.keys(CATEGORY_LABELS) as (keyof typeof CATEGORY_LABELS)[]).map((cat) => {
        const colors = CATEGORY_COLORS[cat];
        return (
          <span
            key={cat}
            className={`text-[10px] px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {CATEGORY_LABELS[cat]}
          </span>
        );
      })}
    </div>
  );
}

export default async function CalendarPage() {
  const session = await getSession();
  if (!session.authed) redirect('/login');

  const events = listEvents();

  const byDay: Record<DayOfWeek, CalEvent[]> = {
    monday: [], tuesday: [], wednesday: [], thursday: [],
    friday: [], saturday: [], sunday: [],
  };
  for (const ev of events) {
    byDay[ev.day].push(ev);
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;

  return (
    <div className="min-h-screen" style={{ background: 'var(--pk-bg)', color: 'var(--pk-text)' }}>
      <header
        className="px-4 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{
          background: 'var(--pk-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--pk-border-soft)',
        }}
      >
        <div>
          <h1 className="text-lg font-semibold tracking-wide">
            <span style={{ color: 'var(--pk-gold)' }}>cal</span>
            <span style={{ color: 'var(--pk-text)' }}>.hanif</span>
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--pk-text-dim)' }}>Jadwal Mingguan</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: 'var(--pk-text-dim)', border: '1px solid var(--pk-border-soft)' }}
          >
            Keluar
          </button>
        </form>
      </header>

      <main className="p-4 max-w-7xl mx-auto">
        <CategoryLegend />

        {/* Desktop: 7-column grid */}
        <div className="hidden md:grid md:grid-cols-7 gap-3">
          {DAYS.map((day) => {
            const isToday = day === todayStr;
            const dayEvents = byDay[day];
            return (
              <div key={day} className="min-h-48">
                <div
                  className="text-xs font-semibold mb-2 px-1 py-1.5 rounded-lg text-center"
                  style={isToday ? {
                    background: 'rgba(200, 163, 90, 0.12)',
                    color: 'var(--pk-gold)',
                    border: '1px solid rgba(200, 163, 90, 0.25)',
                  } : {
                    color: 'var(--pk-text-dim)',
                  }}
                >
                  {DAY_LABELS[day]}
                </div>
                {dayEvents.length === 0 ? (
                  <div className="text-[10px] text-center mt-4" style={{ color: 'var(--pk-border)' }}>—</div>
                ) : (
                  dayEvents.map((ev) => <EventCard key={ev.id} event={ev} />)
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: stacked per day */}
        <div className="md:hidden space-y-5">
          {DAYS.map((day) => {
            const isToday = day === todayStr;
            const dayEvents = byDay[day];
            if (dayEvents.length === 0 && !isToday) return null;
            return (
              <div key={day}>
                <div
                  className="text-xs font-semibold mb-2 px-2 py-1.5 rounded-lg inline-block"
                  style={isToday ? {
                    background: 'rgba(200, 163, 90, 0.12)',
                    color: 'var(--pk-gold)',
                    border: '1px solid rgba(200, 163, 90, 0.25)',
                  } : {
                    color: 'var(--pk-text-dim)',
                  }}
                >
                  {DAY_LABELS[day]}
                </div>
                {dayEvents.length === 0 ? (
                  <p className="text-xs ml-2" style={{ color: 'var(--pk-text-dim)' }}>Kosong</p>
                ) : (
                  <div>{dayEvents.map((ev) => <EventCard key={ev.id} event={ev} />)}</div>
                )}
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--pk-text-dim)' }}>Belum ada jadwal.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--pk-text-dim)', opacity: 0.5 }}>Semar bisa nambahin via API.</p>
          </div>
        )}
      </main>
    </div>
  );
}
