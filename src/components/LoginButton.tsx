"use client";

import { useState } from "react";
import { WORKSPACE_DOMAIN } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const origin = window.location.origin;

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          hd: WORKSPACE_DOMAIN,
          prompt: "select_account",
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="w-full bg-orange px-4 py-3.5 font-display text-lg tracking-wider text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Opening Google…" : "Sign in with Google"}
      </button>
      {error && <p className="mt-3 text-sm text-antique">{error}</p>}
    </div>
  );
}
