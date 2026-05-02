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

export function makeAlbums(): Album[] {
  // 6x7 grid for May 2026, Sunday-first.
  // May 1 2026 = Friday → leading SUN..THU from previous month: Apr 26..Apr 30 (5 cells)
  const days: Album[] = [];
  for (let d = 26; d <= 30; d++) {
    days.push({ key: `2026-04-${d}`, day: d, month: 4, padding: true, tracks: [] });
  }
  for (let d = 1; d <= 31; d++) {
    const tracks: Track[] = (seedTracks[d] || []).map((text, i) => ({
      id: `t-${d}-${i}`,
      text,
      done: (completedSet[d] || []).includes(i),
    }));
    days.push({ key: `2026-05-${d}`, day: d, month: 5, padding: false, tracks });
  }
  let nextD = 1;
  while (days.length < 42) {
    days.push({ key: `2026-06-${nextD}`, day: nextD, month: 6, padding: true, tracks: [] });
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

// weekday for May D, 2026 (May 1 = Friday → 5)
export function weekdayOfMay(d: number): number {
  return (5 + (d - 1)) % 7;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
