"use client";

import { useEffect, useRef, useState } from "react";
import LPBarApp from "./LPBarApp";
import SignIn, { type SignedInUser } from "./SignIn";
import Toast from "./Toast";

const AUTH_KEY = "lpbar:auth";

function loadInitialUser(): SignedInUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}

export default function LPBarPrototype() {
  const [user, setUser] = useState<SignedInUser | null>(loadInitialUser);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      if (user) window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      else window.localStorage.removeItem(AUTH_KEY);
    } catch {}
  }, [user]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      1800
    );
  }

  if (!user) return <SignIn onSignIn={setUser} />;

  return (
    <div className="lpb-shell">
      <LPBarApp
        theme="popart"
        user={user}
        onSignOut={() => setUser(null)}
        onToast={showToast}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
