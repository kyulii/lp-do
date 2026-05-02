"use client";

import { useEffect, useRef, useState } from "react";
import type { Album } from "@/lib/lpb";
import { DAYNAMES_FULL, pad2, weekdayOfMay } from "@/lib/lpb";

type Props = {
  album: Album | undefined;
  onToggle: (id: string) => void;
  onAdd: (text: string) => string;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
};

export default function Tracklist({ album, onToggle, onAdd, onDelete, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const tracks = album?.tracks || [];
  const done = tracks.filter((t) => t.done).length;

  function handleAdd() {
    const id = onAdd("");
    setEditingId(id);
  }

  return (
    <div className="tl">
      <div className="tl-meta">
        <div className="tl-now">NOW PLAYING</div>
        <div className="tl-title">
          {DAYNAMES_FULL[weekdayOfMay(album?.day ?? 1)]}, May {album?.day ?? ""}
        </div>
        <div className="tl-progress-row">
          <span className="tl-progress-text">
            {tracks.length === 0
              ? "Unplayed"
              : done === tracks.length
              ? "Full Side Played"
              : `${done} of ${tracks.length} tracks played`}
          </span>
          <div className="tl-progress-bar">
            <div
              className="tl-progress-fill"
              style={{
                width: tracks.length ? `${(done / tracks.length) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>

      <div className="tl-head">
        <span>TRACKLIST</span>
        <span className="tl-count">
          {done}/{tracks.length}
        </span>
      </div>

      <div className="tl-body">
        {tracks.length === 0 && (
          <div className="tl-empty">
            Side A is blank.
            <br />
            Press the needle to start.
          </div>
        )}
        {tracks.map((t, i) => {
          const isEditing = editingId === t.id;
          return (
            <div className={`tl-row ${t.done ? "is-done" : ""}`} key={t.id}>
              <span className="tl-num">{pad2(i + 1)}</span>
              <button
                className={`tl-check ${t.done ? "is-checked" : ""}`}
                onClick={() => onToggle(t.id)}
                aria-label="Toggle track"
                type="button"
              />
              {isEditing ? (
                <input
                  ref={inputRef}
                  className="tl-input"
                  defaultValue={t.text}
                  placeholder="Side B, Track 04…"
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (!v) onDelete(t.id);
                    else onUpdate(t.id, v);
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
              ) : (
                <span className="tl-text" onDoubleClick={() => setEditingId(t.id)}>
                  {t.text}
                </span>
              )}
              <button
                className="tl-del"
                onClick={() => onDelete(t.id)}
                aria-label="Delete"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          );
        })}
      </div>

      <div className="tl-add">
        <button className="tl-add-btn" onClick={handleAdd} type="button">
          <span className="tl-add-plus">+</span>
          <span>Add Track</span>
        </button>
      </div>
    </div>
  );
}
