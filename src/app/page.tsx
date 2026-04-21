import { listEvents } from '@/lib/db';
import { CATEGORY_COLORS, CATEGORY_LABELS, CalEvent } from '@/lib/types';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import CalendarClient from '@/components/CalendarClient';

export const dynamic = 'force-dynamic';

async function logout() {
  'use server';
  const session = await getSession();
  session.destroy();
  revalidatePath('/');
  redirect('/login');
}

function CategoryLegend({ events }: { events: CalEvent[] }) {
  const usedCategories = [...new Set(events.map(e => e.category))];
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {usedCategories.map(cat => {
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
          <p className="text-xs mt-0.5" style={{ color: 'var(--pk-text-dim)' }}>
            {events.length} jadwal aktif
          </p>
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

      <main className="p-4 max-w-5xl mx-auto">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--pk-text-dim)' }}>Belum ada jadwal.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--pk-text-dim)', opacity: 0.5 }}>Semar bisa nambahin via API.</p>
          </div>
        ) : (
          <>
            <CategoryLegend events={events} />
            <CalendarClient events={events} />
          </>
        )}
      </main>
    </div>
  );
}
