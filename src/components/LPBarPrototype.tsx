"use client";

import { useEffect, useRef, useState } from "react";
import LPBarApp from "./LPBarApp";
import SignIn, { type SignedInUser } from "./SignIn";
import Toast from "./Toast";
import { createClient } from "@/lib/supabase/client";

type SupabaseUserLike = {
  email?: string | null;
  user_metadata: Record<string, unknown>;
};

function toSignedInUser(u: SupabaseUserLike): SignedInUser {
  const meta = u.user_metadata;
  const fullName = (meta.full_name as string) || (meta.name as string) || "";
  return { name: fullName, email: u.email ?? "" };
}

export default function LPBarPrototype() {
  const [user, setUser] = useState<SignedInUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? toSignedInUser(data.user) : null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toSignedInUser(session.user) : null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

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

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  if (loading) return null;
  if (!user) return <SignIn />;

  return (
    <div className="lpb-shell">
      <LPBarApp
        theme="popart"
        user={user}
        onSignOut={handleSignOut}
        onToast={showToast}
      />
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  );
}
