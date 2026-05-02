"use client";

import { useState } from "react";
import type { Album } from "@/lib/lpb";
import { WEEKDAYS } from "@/lib/lpb";
import AlbumCard from "./AlbumCard";
import type { SignedInUser } from "./SignIn";

type Props = {
  albums: Album[];
  selectedKey: string;
  onSelect: (album: Album) => void;
  monthLabel: { month: number; year: number };
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  user: SignedInUser | null;
  onSignOut: () => void;
};

export default function Archive({
  albums,
  selectedKey,
  onSelect,
  monthLabel,
  onPrevMonth,
  onNextMonth,
  onToday,
  user,
  onSignOut,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="ar">
      <div className="ar-header">
        <div className="ar-brand">LP BAR</div>
        <div className="ar-volume-block">
          <span className="ar-volume-text">
            Volume {monthLabel.month} : {monthLabel.year}
          </span>
        </div>
        <div className="ar-controls">
          <div className="ar-nav">
            <button
              className="ar-nav-btn"
              aria-label="prev"
              onClick={onPrevMonth}
              type="button"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="ar-today" onClick={onToday} type="button">
              TODAY
            </button>
            <button
              className="ar-nav-btn"
              aria-label="next"
              onClick={onNextMonth}
              type="button"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          <div className="ar-account">
            <button
              className="ar-cartridge"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="account menu"
              title="Account menu"
              type="button"
            >
              <svg
                viewBox="0 0 32 32"
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="16" cy="12" r="5" />
                <path d="M5 27c1.8-5 6-7.5 11-7.5S25.2 22 27 27" />
              </svg>
            </button>
            {menuOpen && (
              <div className="ar-menu" onMouseLeave={() => setMenuOpen(false)}>
                <div className="ar-menu-user">
                  <div className="ar-menu-avatar" />
                  <div className="ar-menu-meta">
                    <div className="ar-menu-name">{user?.name || "Guest"}</div>
                    <div className="ar-menu-email">{user?.email || ""}</div>
                  </div>
                </div>
                <div className="ar-menu-sep" />
                <button
                  className="ar-menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut?.();
                  }}
                  type="button"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ar-calendar">
        <div className="ar-weekdays">
          {WEEKDAYS.map((w) => (
            <div key={w} className="ar-wd">
              {w}
            </div>
          ))}
        </div>
        <div className="ar-grid">
          {albums.map((a) => (
            <AlbumCard
              key={a.key}
              album={a}
              isSelected={a.key === selectedKey}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
