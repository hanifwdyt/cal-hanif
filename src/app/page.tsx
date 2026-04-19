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
        <div className="text-slate-400 mt-0.5 text-[10px]">
          {event.time_start ?? ''}
          {event.time_start && event.time_end ? ' – ' : ''}
          {event.time_end ?? ''}
        </div>
      )}
      {event.note && (
        <div className="text-slate-500 mt-0.5 text-[10px] leading-tight truncate">{event.note}</div>
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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100 tracking-wide">cal.hanif</h1>
          <p className="text-slate-500 text-xs mt-0.5">Jadwal Mingguan</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
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
                  className={`text-xs font-semibold mb-2 px-1 py-1.5 rounded-lg text-center ${
                    isToday
                      ? 'bg-slate-700 text-slate-100'
                      : 'text-slate-500'
                  }`}
                >
                  {DAY_LABELS[day]}
                </div>
                {dayEvents.length === 0 ? (
                  <div className="text-slate-800 text-[10px] text-center mt-4">—</div>
                ) : (
                  dayEvents.map((ev) => <EventCard key={ev.id} event={ev} />)
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: stacked per day, only show days with events + today */}
        <div className="md:hidden space-y-5">
          {DAYS.map((day) => {
            const isToday = day === todayStr;
            const dayEvents = byDay[day];
            if (dayEvents.length === 0 && !isToday) return null;
            return (
              <div key={day}>
                <div
                  className={`text-xs font-semibold mb-2 px-2 py-1.5 rounded-lg inline-block ${
                    isToday ? 'bg-slate-700 text-slate-100' : 'text-slate-500'
                  }`}
                >
                  {DAY_LABELS[day]}
                </div>
                {dayEvents.length === 0 ? (
                  <p className="text-slate-700 text-xs ml-2">Kosong</p>
                ) : (
                  <div>
                    {dayEvents.map((ev) => <EventCard key={ev.id} event={ev} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <p className="text-sm">Belum ada jadwal.</p>
            <p className="text-xs mt-1">Semar bisa nambahin via API.</p>
          </div>
        )}
      </main>
    </div>
  );
}
