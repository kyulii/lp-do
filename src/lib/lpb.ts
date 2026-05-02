export type Track = { id: string; text: string; done: boolean };

export type Album = {
  key: string;
  day: number;
  month: number;
  padding: boolean;
  tracks: Track[];
};

const seedTracks: Record<number, string[]> = {
  1: ["Mix down vocals", "Email mastering eng.", "Update artwork brief"],
  2: [
    "Side B rehearsal",
    "Coffee w/ Jin",
    "Listen to demos",
    "Order new stylus",
    "Stretch 20m",
    "Read 30 pages",
    "Cut to vinyl",
  ],
  3: [],
  4: ["Standup notes", "Refactor router"],
  5: ["Yoga 7am", "Reply to Mira", "Q2 OKR draft"],
  6: ["Buy birthday gift", "Pick up dry-cleaning", "Run 5k"],
  7: ["Studio session", "Edit single cover"],
  8: [],
  9: ["Sunday roast", "Call mom", "Tidy desk"],
  10: ["Write newsletter", "Schedule shoot", "Pay invoice #1142"],
  11: ["Q3 roadmap", "1:1 w/ Sora", "Gym"],
  12: ["Print test pressing", "Email distributor"],
  13: ["Therapy 4pm", "Groceries"],
  14: ["Demo to label", "Walk Bowie"],
  15: ["Movie w/ Sam"],
  16: [],
  17: [],
};

const completedSet: Record<number, number[]> = {
  1: [0, 2],
  2: [0, 1, 2],
  4: [0, 1],
  5: [0],
  6: [0, 1, 2],
  7: [1],
  9: [0, 1, 2],
  10: [2],
  11: [0],
  12: [0, 1],
  13: [1],
  14: [0],
  15: [0],
};

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function firstWeekdayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function prevMonthOf(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function nextMonthOf(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

export function makeAlbums(year: number, month: number): Album[] {
  // 6x7 grid, Sunday-first.
  const days: Album[] = [];
  const isMaySeed = year === 2026 && month === 5;

  const leadCount = firstWeekdayOfMonth(year, month);
  const prev = prevMonthOf(year, month);
  const prevLast = daysInMonth(prev.year, prev.month);
  for (let i = leadCount - 1; i >= 0; i--) {
    const d = prevLast - i;
    days.push({
      key: `${prev.year}-${pad2(prev.month)}-${d}`,
      day: d,
      month: prev.month,
      padding: true,
      tracks: [],
    });
  }

  const last = daysInMonth(year, month);
  for (let d = 1; d <= last; d++) {
    const tracks: Track[] = isMaySeed
      ? (seedTracks[d] || []).map((text, i) => ({
          id: `t-${d}-${i}`,
          text,
          done: (completedSet[d] || []).includes(i),
        }))
      : [];
    days.push({
      key: `${year}-${pad2(month)}-${d}`,
      day: d,
      month,
      padding: false,
      tracks,
    });
  }

  const next = nextMonthOf(year, month);
  let nextD = 1;
  while (days.length < 42) {
    days.push({
      key: `${next.year}-${pad2(next.month)}-${nextD}`,
      day: nextD,
      month: next.month,
      padding: true,
      tracks: [],
    });
    nextD++;
  }
  return days;
}

export const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
export const DAYNAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;
export const DAYNAMES_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;

export const MONTH_NAMES_TITLE = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function weekdayOf(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay();
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
