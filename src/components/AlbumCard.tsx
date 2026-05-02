"use client";

import { useMemo, useState } from "react";
import type { Album } from "@/lib/lpb";
import { pad2 } from "@/lib/lpb";

type Props = {
  album: Album;
  isSelected: boolean;
  onSelect: (album: Album) => void;
};

export default function AlbumCard({ album, isSelected, onSelect }: Props) {
  const [hover, setHover] = useState(false);
  const tracks = album.tracks;
  const allDone = tracks.length > 0 && tracks.every((t) => t.done);

  const summary = useMemo(() => {
    if (!tracks.length) return null;
    const visible = tracks.slice(0, 2).map((t) => ({ text: t.text, done: t.done }));
    const more = tracks.length - visible.length;
    return { visible, more };
  }, [tracks]);

  return (
    <button
      className={`album ${album.padding ? "is-padding" : ""} ${
        isSelected ? "is-selected" : ""
      } ${allDone ? "is-allDone" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(album)}
      aria-label={`Album for day ${album.day}`}
      type="button"
    >
      <div className="album-sleeve">
        <div className={`album-lp ${hover ? "is-out" : ""}`}>
          <div className="album-lp-disc">
            <div className="album-lp-grooves" />
            <div className="album-lp-label" />
            <div className="album-lp-spindle" />
          </div>
        </div>

        <div className="album-cover" aria-hidden />

        <div className="album-front">
          <div className="album-top">
            <span className="album-date">{pad2(album.day)}</span>
          </div>
          {summary && (
            <div className="album-summary">
              {summary.visible.map((t, i) => (
                <div
                  key={i}
                  className={`album-summary-line ${t.done ? "is-done" : ""}`}
                >
                  {t.text}
                </div>
              ))}
              {summary.more > 0 && (
                <div className="album-summary-more">+{summary.more} more</div>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
