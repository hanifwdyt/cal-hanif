export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type Category =
  | 'wfo'
  | 'wfh'
  | 'gym'
  | 'renang'
  | 'lari'
  | 'client'
  | 'belajar'
  | 'ibadah'
  | 'personal'
  | 'other';

export interface CalEvent {
  id: number;
  title: string;
  day: DayOfWeek;
  time_start: string | null;  // HH:MM
  time_end: string | null;    // HH:MM
  category: Category;
  note: string | null;
  repeat: 'none' | 'weekly';  // weekly = recurring every week
  date: string | null;        // YYYY-MM-DD — if set, only show on this specific date
  created_at: string;
  updated_at: string;
}

export interface CalEventInput {
  title: string;
  day: DayOfWeek;
  time_start?: string | null;
  time_end?: string | null;
  category?: Category;
  note?: string | null;
  repeat?: 'none' | 'weekly';
  date?: string | null;
}

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: "Jum'at",
  saturday: 'Sabtu',
  sunday: 'Minggu',
};

export const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const CATEGORY_LABELS: Record<Category, string> = {
  wfo: 'WFO',
  wfh: 'WFH',
  gym: 'Gym',
  renang: 'Renang',
  lari: 'Lari',
  client: 'Client',
  belajar: 'Belajar',
  ibadah: 'Ibadah',
  personal: 'Personal',
  other: 'Lainnya',
};

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string }> = {
  wfo:     { bg: 'bg-blue-900/50',    text: 'text-blue-300',    border: 'border-blue-700/50' },
  wfh:     { bg: 'bg-cyan-900/50',    text: 'text-cyan-300',    border: 'border-cyan-700/50' },
  gym:     { bg: 'bg-orange-900/50',  text: 'text-orange-300',  border: 'border-orange-700/50' },
  renang:  { bg: 'bg-sky-900/50',     text: 'text-sky-300',     border: 'border-sky-700/50' },
  lari:    { bg: 'bg-green-900/50',   text: 'text-green-300',   border: 'border-green-700/50' },
  client:  { bg: 'bg-violet-900/50',  text: 'text-violet-300',  border: 'border-violet-700/50' },
  belajar: { bg: 'bg-yellow-900/50',  text: 'text-yellow-300',  border: 'border-yellow-700/50' },
  ibadah:  { bg: 'bg-emerald-900/50', text: 'text-emerald-300', border: 'border-emerald-700/50' },
  personal:{ bg: 'bg-pink-900/50',    text: 'text-pink-300',    border: 'border-pink-700/50' },
  other:   { bg: 'bg-slate-800/50',   text: 'text-slate-300',   border: 'border-slate-700/50' },
};
