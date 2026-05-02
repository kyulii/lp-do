"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type SignedInUser = { name: string; email: string };

export default function SignIn() {
  const [pressing, setPressing] = useState(false);

  const handleClick = async () => {
    setPressing(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className={`signin ${pressing ? "is-leaving" : ""}`}>
      <div className="signin-inner">
        <div className="signin-brand">LP BAR</div>
        <div className="signin-tagline">EST. 2026 · A QUIET PLACE FOR DAILY RECORDS</div>

        <div className="signin-lp">
          <div className="signin-lp-disc">
            <div className="signin-lp-grooves" />
            <div className="signin-lp-label">
              <svg viewBox="0 0 200 200" className="signin-label-svg">
                <defs>
                  <path id="memberArcTop" d="M 36 100 A 64 64 0 0 1 164 100" />
                  <path id="memberArcBot" d="M 36 100 A 64 64 0 0 0 164 100" />
                </defs>
                <text>
                  <textPath href="#memberArcTop" startOffset="50%" textAnchor="middle">
                    MEMBERS
                  </textPath>
                </text>
                <text>
                  <textPath href="#memberArcBot" startOffset="50%" textAnchor="middle">
                    ONLY
                  </textPath>
                </text>
              </svg>
            </div>
            <div className="signin-lp-spindle" />
          </div>
        </div>

        <div className="signin-copy">Insert your member card to enter the bar.</div>

        <button className="signin-google" onClick={handleClick}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="signin-footer">track 01 / side a</div>
      </div>
    </div>
  );
}
