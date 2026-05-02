"use client";

import { useCallback, useEffect, useState } from "react";
import type { Album, Track } from "@/lib/lpb";
import { makeAlbums, pad2 } from "@/lib/lpb";
import Archive from "./Archive";
import Turntable from "./Turntable";
import Tracklist from "./Tracklist";
import type { SignedInUser } from "./SignIn";
import {
  deleteTrack as dbDeleteTrack,
  fetchMonthTracks,
  insertTrack,
  setTrackCompleted,
  updateTrackTitle,
} from "@/lib/supabase/tracks";

const TODAY_YEAR = 2026;
const TODAY_MONTH = 5;
const TODAY_DAY = 2;

type MonthData = Record<string, Album[]>;
type CurrentMonth = { year: number; month: number };

type Props = {
  theme?: "popart" | "luxury" | "jazzbar";
  user: SignedInUser;
  onSignOut: () => void;
  onToast: (message: string) => void;
};

function monthKeyOf(year: number, month: number): string {
  return `${year}-${pad2(month)}`;
}

function albumKeyOf(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${day}`;
}

function dateStringOf(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
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
  const [monthData, setMonthData] = useState<MonthData>({});
  const [selectedKey, setSelectedKey] = useState<string>(
    albumKeyOf(TODAY_YEAR, TODAY_MONTH, TODAY_DAY)
  );

  const monthKey = monthKeyOf(currentMonth.year, currentMonth.month);
  const albums = monthData[monthKey] ?? makeAlbums(currentMonth.year, currentMonth.month);

  const selected =
    albums.find((a) => a.key === selectedKey) || albums.find((a) => !a.padding);

  // Fetch tracks for the current month if not already loaded
  useEffect(() => {
    if (monthData[monthKey]) return;
    let cancelled = false;
    fetchMonthTracks(user.id, currentMonth.year, currentMonth.month)
      .then((rows) => {
        if (cancelled) return;
        const calendar = makeAlbums(currentMonth.year, currentMonth.month);
        const grouped = new Map<number, Track[]>();
        for (const r of rows) {
          const day = parseInt(r.date.split("-")[2], 10);
          if (!grouped.has(day)) grouped.set(day, []);
          grouped.get(day)!.push({ id: r.id, text: r.title, done: r.is_completed });
        }
        const filled = calendar.map((a) =>
          a.padding ? a : { ...a, tracks: grouped.get(a.day) ?? [] }
        );
        setMonthData((prev) => ({ ...prev, [monthKey]: filled }));
      })
      .catch((err: Error) => {
        if (!cancelled) onToast(`Load failed: ${err.message}`);
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey, currentMonth.year, currentMonth.month, user.id, monthData, onToast]);

  function selectAlbum(a: Album) {
    if (a.padding) return;
    setSelectedKey(a.key);
  }

  function patchSelectedAlbum(updater: (a: Album) => Album) {
    setMonthData((prev) => {
      const current = prev[monthKey];
      if (!current) return prev;
      return {
        ...prev,
        [monthKey]: current.map((a) => (a.key === selectedKey ? updater(a) : a)),
      };
    });
  }

  function toggleTrack(id: string) {
    let prevDone = false;
    patchSelectedAlbum((a) => ({
      ...a,
      tracks: a.tracks.map((t) => {
        if (t.id !== id) return t;
        prevDone = t.done;
        return { ...t, done: !t.done };
      }),
    }));
    setTrackCompleted(id, !prevDone).catch((err: Error) => {
      patchSelectedAlbum((a) => ({
        ...a,
        tracks: a.tracks.map((t) =>
          t.id === id ? { ...t, done: prevDone } : t
        ),
      }));
      onToast(`Save failed: ${err.message}`);
    });
  }

  function addTrack(text: string): string {
    if (!selected || selected.padding) return "";
    const id = crypto.randomUUID();
    const date = dateStringOf(currentMonth.year, currentMonth.month, selected.day);
    const newTrack: Track = { id, text, done: false };
    patchSelectedAlbum((a) => ({ ...a, tracks: [...a.tracks, newTrack] }));
    insertTrack({ id, userId: user.id, date, title: text }).catch((err: Error) => {
      patchSelectedAlbum((a) => ({
        ...a,
        tracks: a.tracks.filter((t) => t.id !== id),
      }));
      onToast(`Save failed: ${err.message}`);
    });
    return id;
  }

  function deleteTrack(id: string) {
    let prevTrack: Track | undefined;
    patchSelectedAlbum((a) => {
      prevTrack = a.tracks.find((t) => t.id === id);
      return { ...a, tracks: a.tracks.filter((t) => t.id !== id) };
    });
    dbDeleteTrack(id).catch((err: Error) => {
      if (prevTrack) {
        const restored = prevTrack;
        patchSelectedAlbum((a) => ({ ...a, tracks: [...a.tracks, restored] }));
      }
      onToast(`Delete failed: ${err.message}`);
    });
  }

  function updateTrack(id: string, text: string) {
    let prevText = "";
    patchSelectedAlbum((a) => ({
      ...a,
      tracks: a.tracks.map((t) => {
        if (t.id !== id) return t;
        prevText = t.text;
        return { ...t, text };
      }),
    }));
    updateTrackTitle(id, text)
      .then(() => onToast("Cut A Record."))
      .catch((err: Error) => {
        patchSelectedAlbum((a) => ({
          ...a,
          tracks: a.tracks.map((t) =>
            t.id === id ? { ...t, text: prevText } : t
          ),
        }));
        onToast(`Save failed: ${err.message}`);
      });
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
    setSelectedKey(albumKeyOf(next.year, next.month, 1));
  }

  const handleToday = useCallback(() => {
    setCurrentMonth({ year: TODAY_YEAR, month: TODAY_MONTH });
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
