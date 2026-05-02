"use client";

import { useEffect, useState } from "react";
import type { Album, Track } from "@/lib/lpb";
import { makeAlbums } from "@/lib/lpb";
import Archive from "./Archive";
import Turntable from "./Turntable";
import Tracklist from "./Tracklist";
import type { SignedInUser } from "./SignIn";

const STORAGE_KEY = "lpbar:albums:v1";

type Props = {
  theme?: "popart" | "luxury" | "jazzbar";
  user: SignedInUser | null;
  onSignOut: () => void;
  onToast: (message: string) => void;
};

function loadInitialAlbums(): Album[] {
  if (typeof window === "undefined") return makeAlbums();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Album[];
  } catch {}
  return makeAlbums();
}

export default function LPBarApp({
  theme = "popart",
  user,
  onSignOut,
  onToast,
}: Props) {
  const [albums, setAlbums] = useState<Album[]>(loadInitialAlbums);
  const [selectedKey, setSelectedKey] = useState<string>("2026-05-2");

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
    } catch {}
  }, [albums]);

  const selected =
    albums.find((a) => a.key === selectedKey) || albums.find((a) => !a.padding);

  function selectAlbum(a: Album) {
    if (a.padding) return;
    setSelectedKey(a.key);
  }

  function updateAlbum(updater: (a: Album) => Album) {
    setAlbums((prev) =>
      prev.map((a) => (a.key === selectedKey ? updater(a) : a))
    );
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
    onToast?.("Cut to vinyl.");
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
    onToast?.("Cut to vinyl.");
  }

  function handleToday() {
    setSelectedKey("2026-05-2");
  }

  // Keyboard shortcuts: ←/→ day, T = today
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
  }, [albums, selectedKey]);

  return (
    <div className={`lpb lpb-${theme}`}>
      <Archive
        albums={albums}
        selectedKey={selectedKey}
        onSelect={selectAlbum}
        monthLabel={{ month: 5, year: 2026 }}
        onPrevMonth={() => onToast?.("Volume 4 not yet pressed.")}
        onNextMonth={() => onToast?.("Volume 6 not yet pressed.")}
        onToday={handleToday}
        user={user}
        onSignOut={onSignOut}
      />
      <div className="tt">
        <Turntable album={selected} />
        <Tracklist
          album={selected}
          onToggle={toggleTrack}
          onAdd={addTrack}
          onDelete={deleteTrack}
          onUpdate={updateTrack}
        />
      </div>
    </div>
  );
}
