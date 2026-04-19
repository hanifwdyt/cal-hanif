import { NextRequest, NextResponse } from 'next/server';
import { insertEvent, listEvents, updateEvent, deleteEvent } from '@/lib/db';
import { DayOfWeek, Category } from '@/lib/types';

const MINION_SECRET = process.env.MINION_SECRET ?? 'cal-hanif-secret-change-me';

const VALID_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const VALID_CATEGORIES: Category[] = ['wfo', 'wfh', 'gym', 'renang', 'lari', 'client', 'belajar', 'ibadah', 'personal', 'other'];
const VALID_REPEATS = ['none', 'weekly'];

function auth(req: NextRequest): boolean {
  return req.headers.get('x-minion-secret') === MINION_SECRET;
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

  const { title, day, time_start, time_end, category, note, repeat } = body;

  if (!title || typeof title !== 'string') {
    return NextResponse.json({ ok: false, error: 'title required' }, { status: 400 });
  }
  if (!VALID_DAYS.includes(day)) {
    return NextResponse.json({ ok: false, error: `day must be one of: ${VALID_DAYS.join(', ')}` }, { status: 400 });
  }
  if (category && !VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ ok: false, error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 });
  }
  if (repeat && !VALID_REPEATS.includes(repeat)) {
    return NextResponse.json({ ok: false, error: `repeat must be none or weekly` }, { status: 400 });
  }

  const event = insertEvent({
    title: String(title).slice(0, 100),
    day,
    time_start: time_start ? String(time_start).slice(0, 5) : null,
    time_end: time_end ? String(time_end).slice(0, 5) : null,
    category: category ?? 'other',
    note: note ? String(note).slice(0, 300) : null,
    repeat: repeat ?? 'weekly',
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

  const allowed = ['title', 'day', 'time_start', 'time_end', 'category', 'note', 'repeat'];
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
