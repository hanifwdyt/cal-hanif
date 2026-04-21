import { NextRequest, NextResponse } from 'next/server';
import { insertEvent, listEvents, updateEvent, deleteEvent } from '@/lib/db';
import { DayOfWeek, Category } from '@/lib/types';

const MINION_SECRET = process.env.MINION_SECRET ?? 'cal-hanif-secret-change-me';

const VALID_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const VALID_CATEGORIES: Category[] = ['wfo', 'wfh', 'gym', 'renang', 'lari', 'client', 'belajar', 'ibadah', 'personal', 'other'];
const VALID_REPEATS = ['none', 'weekly'];

const JS_DAY_TO_DOW: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function auth(req: NextRequest): boolean {
  return req.headers.get('x-minion-secret') === MINION_SECRET;
}

function deriveDayFromDate(dateStr: string): DayOfWeek | null {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  return JS_DAY_TO_DOW[d.getDay()];
}

export async function GET(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const events = listEvents();
  return NextResponse.json({ ok: true, events });
}

export async function POST(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 });
  }

  const { title, day, time_start, time_end, category, note, repeat, date } = body;

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ ok: false, error: 'title required' }, { status: 400 });
  }

  // If date provided, derive day automatically. Otherwise day is required.
  let resolvedDay: DayOfWeek;
  if (date) {
    const derived = deriveDayFromDate(String(date));
    if (!derived) return NextResponse.json({ ok: false, error: 'invalid date format, use YYYY-MM-DD' }, { status: 400 });
    resolvedDay = day && VALID_DAYS.includes(day) ? day : derived;
  } else {
    if (!VALID_DAYS.includes(day)) {
      return NextResponse.json({ ok: false, error: `day required when no date provided. Must be one of: ${VALID_DAYS.join(', ')}` }, { status: 400 });
    }
    resolvedDay = day;
  }

  if (category && !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ ok: false, error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 });
  }
  if (repeat && !VALID_REPEATS.includes(repeat)) {
    return NextResponse.json({ ok: false, error: `repeat must be none or weekly` }, { status: 400 });
  }

  const event = insertEvent({
    title: String(title).slice(0, 100),
    day: resolvedDay,
    time_start: time_start ? String(time_start).slice(0, 5) : null,
    time_end: time_end ? String(time_end).slice(0, 5) : null,
    category: category ?? 'other',
    note: note ? String(note).slice(0, 300) : null,
    repeat: date ? 'none' : (repeat ?? 'weekly'),
    date: date ? String(date).slice(0, 10) : null,
  });

  return NextResponse.json({ ok: true, event });
}

export async function PATCH(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
  }

  const allowed = ['title', 'day', 'time_start', 'time_end', 'category', 'note', 'repeat', 'date'];
  const input: Record<string, unknown> = {};
  for (const k of allowed) {
    if (body[k] !== undefined) input[k] = body[k];
  }

  const event = updateEvent(id, input as Parameters<typeof updateEvent>[1]);
  if (!event) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, event });
}

export async function DELETE(req: NextRequest) {
  if (!auth(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: 'need id' }, { status: 400 });
  }
  const ok = deleteEvent(id);
  return NextResponse.json({ ok });
}
