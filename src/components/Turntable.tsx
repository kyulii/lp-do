"use client";

import type { Album } from "@/lib/lpb";
import { DAYNAMES, pad2, weekdayOfMay } from "@/lib/lpb";

type Props = { album: Album | undefined };

export default function Turntable({ album }: Props) {
  const day = album?.day ?? 1;
  const monthLabel = "MAY 2026";
  const dayName = DAYNAMES[weekdayOfMay(day)];

  return (
    <div className="tt-graphic">
      <div className="tt-base" style={{ backgroundColor: "rgb(230, 57, 70)" }}>
        <div className="tt-platter">
          <div className="tt-vinyl spinning">
            <div className="tt-grooves" />
            <div className="tt-label">
              <svg viewBox="0 0 200 200" className="tt-label-svg">
                <defs>
                  <path id="topArc" d="M 32 100 A 68 68 0 0 1 168 100" />
                  <path id="botArc" d="M 32 100 A 68 68 0 0 0 168 100" />
                  <path id="leftArc" d="M 100 168 A 68 68 0 0 1 100 32" />
                  <path id="rightArc" d="M 100 32 A 68 68 0 0 1 100 168" />
                </defs>
                <text className="tt-arc-top">
                  <textPath href="#topArc" startOffset="50%" textAnchor="middle">
                    {monthLabel}
                  </textPath>
                </text>
                <text className="tt-arc-bot">
                  <textPath href="#botArc" startOffset="50%" textAnchor="middle">
                    {dayName}
                  </textPath>
                </text>
                <text className="tt-arc-side tt-arc-left">
                  <textPath href="#leftArc" startOffset="50%" textAnchor="middle">
                    No. {pad2(day)}
                  </textPath>
                </text>
                <text className="tt-arc-side tt-arc-right">
                  <textPath href="#rightArc" startOffset="50%" textAnchor="middle">
                    No. {pad2(day)}
                  </textPath>
                </text>
              </svg>
            </div>
            <div className="tt-spindle" />
          </div>
        </div>
        <div className="tt-tonearm">
          <div className="tt-tonearm-pivot" />
          <div className="tt-tonearm-rod" />
          <div className="tt-tonearm-head" />
        </div>
      </div>
    </div>
  );
}
