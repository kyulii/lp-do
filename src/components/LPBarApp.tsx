"use client";

import { useCallback, useEffect, useState } from "react";
import type { Album, Track } from "@/lib/lpb";
import { makeAlbums, pad2 } from "@/lib/lpb";
import Archive from "./Archive";
import Turntable from "./Turntable";
import Tracklist from "./Tracklist";
import type { SignedInUser } from "./SignIn";

const STORAGE_KEY = "lpbar:albums:v2";
const TODAY_YEAR = 2026;
const TODAY_MONTH = 5;
const TODAY_DAY = 2;

type MonthData = Record<string, Album[]>;
type CurrentMonth = { year: number; month: number };

type Props = {
  theme?: "popart" | "luxury" | "jazzbar";
  user: SignedInUser | null;
  onSignOut: () => void;
  onToast: (message: string) => void;
};

function monthKeyOf(year: number, month: number): string {
  return `${year}-${pad2(month)}`;
}

function albumKeyOf(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${day}`;
}

function loadInitialMonthData(): MonthData {
  const seed: MonthData = {
    [monthKeyOf(TODAY_YEAR, TODAY_MONTH)]: makeAlbums(TODAY_YEAR, TODAY_MONTH),
  };
  if (typeof window === "undefined") return seed;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as MonthData;
  } catch {}
  return seed;
}

export default function LPBarApp({
  theme = "popart",
  user,
  onSignOut,
  onToast,
}: Props) {
  const [currentMonth, setCurrentMonth] = useState<CurrentMonth>({
    year: TODAY_YEAR,
    month: TODAY_MONTH,
  });
  const [monthData, setMonthData] = useState<MonthData>(loadInitialMonthData);
  const [selectedKey, setSelectedKey] = useState<string>(
    albumKeyOf(TODAY_YEAR, TODAY_MONTH, TODAY_DAY)
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(monthData));
    } catch {}
  }, [monthData]);

  const monthKey = monthKeyOf(currentMonth.year, currentMonth.month);
  const albums =
    monthData[monthKey] ?? makeAlbums(currentMonth.year, currentMonth.month);

  const selected =
    albums.find((a) => a.key === selectedKey) || albums.find((a) => !a.padding);

  function selectAlbum(a: Album) {
    if (a.padding) return;
    setSelectedKey(a.key);
  }

  function ensureMonth(prev: MonthData, year: number, month: number): MonthData {
    const key = monthKeyOf(year, month);
    if (prev[key]) return prev;
    return { ...prev, [key]: makeAlbums(year, month) };
  }

  function updateAlbum(updater: (a: Album) => Album) {
    setMonthData((prev) => {
      const ensured = ensureMonth(prev, currentMonth.year, currentMonth.month);
      const current = ensured[monthKey];
      return {
        ...ensured,
        [monthKey]: current.map((a) => (a.key === selectedKey ? updater(a) : a)),
      };
    });
  }

  function toggleTrack(id: string) {
    updateAlbum((a) => ({
      ...a,
      tracks: a.tracks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    }));
  }

  function addTrack(text: string): string {
    const id = `t-${selectedKey}-${Date.now()}`;
    const newTrack: Track = { id, text, done: false };
    updateAlbum((a) => ({ ...a, tracks: [...a.tracks, newTrack] }));
    return id;
  }

  function deleteTrack(id: string) {
    updateAlbum((a) => ({ ...a, tracks: a.tracks.filter((t) => t.id !== id) }));
  }

  function updateTrack(id: string, text: string) {
    updateAlbum((a) => ({
      ...a,
      tracks: a.tracks.map((t) => (t.id === id ? { ...t, text } : t)),
    }));
    onToast?.("Cut A Record.");
  }

  function shiftMonth(delta: number) {
    const m = currentMonth.month + delta;
    const next: CurrentMonth =
      m < 1
        ? { year: currentMonth.year - 1, month: 12 }
        : m > 12
        ? { year: currentMonth.year + 1, month: 1 }
        : { year: currentMonth.year, month: m };
    setCurrentMonth(next);
    setMonthData((prev) => ensureMonth(prev, next.year, next.month));
    setSelectedKey(albumKeyOf(next.year, next.month, 1));
  }

  const handleToday = useCallback(() => {
    setCurrentMonth({ year: TODAY_YEAR, month: TODAY_MONTH });
    setMonthData((prev) => ensureMonth(prev, TODAY_YEAR, TODAY_MONTH));
    setSelectedKey(albumKeyOf(TODAY_YEAR, TODAY_MONTH, TODAY_DAY));
  }, []);

  // Keyboard shortcuts: ←/→ day within current month, T = today
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT") return;
      const idx = albums.findIndex((a) => a.key === selectedKey);
      if (e.key === "ArrowLeft") {
        for (let i = idx - 1; i >= 0; i--)
          if (!albums[i].padding) {
            setSelectedKey(albums[i].key);
            break;
          }
      } else if (e.key === "ArrowRight") {
        for (let i = idx + 1; i < albums.length; i++)
          if (!albums[i].padding) {
            setSelectedKey(albums[i].key);
            break;
          }
      } else if (e.key === "t" || e.key === "T") {
        handleToday();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [albums, selectedKey, handleToday]);

  return (
    <div className={`lpb lpb-${theme}`}>
      <Archive
        albums={albums}
        selectedKey={selectedKey}
        onSelect={selectAlbum}
        monthLabel={{ month: currentMonth.month, year: currentMonth.year }}
        onPrevMonth={() => shiftMonth(-1)}
        onNextMonth={() => shiftMonth(1)}
        onToday={handleToday}
        user={user}
        onSignOut={onSignOut}
      />
      <div className="tt">
        <Turntable
          album={selected}
          year={currentMonth.year}
          month={currentMonth.month}
        />
        <Tracklist
          album={selected}
          year={currentMonth.year}
          month={currentMonth.month}
          onToggle={toggleTrack}
          onAdd={addTrack}
          onDelete={deleteTrack}
          onUpdate={updateTrack}
        />
      </div>
    </div>
  );
}
