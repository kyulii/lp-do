export type Track = { id: string; text: string; done: boolean };

export type Album = {
  key: string;
  day: number;
  month: number;
  padding: boolean;
  tracks: Track[];
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
  // 6x7 grid, Sunday-first. tracks는 빈 array — DB에서 fetch 후 채워짐.
  const days: Album[] = [];

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
    days.push({
      key: `${year}-${pad2(month)}-${d}`,
      day: d,
      month,
      padding: false,
      tracks: [],
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
