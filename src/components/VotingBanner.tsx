"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatCountdown,
  formatVotingInstant,
  getVotingStatus,
  msUntil,
  VOTING_CLOSES_ISO,
  VOTING_OPENS_ISO,
  type VotingStatus,
} from "@/lib/voting";

const DISMISS_KEY = "skillies-vote-banner-dismissed";

export function VotingBanner({ pathname }: { pathname: string }) {
  const [status, setStatus] = useState<VotingStatus>(() => getVotingStatus());
  const [countdown, setCountdown] = useState("");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DISMISS_KEY);
      if (raw === getVotingStatus()) setDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    function tick() {
      const next = getVotingStatus();
      setStatus(next);
      if (next === "upcoming") {
        setCountdown(formatCountdown(msUntil(VOTING_OPENS_ISO)));
      } else if (next === "open") {
        setCountdown(formatCountdown(msUntil(VOTING_CLOSES_ISO)));
      } else {
        setCountdown("");
      }
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // After wrap party week, stop nagging
  if (status === "closed") {
    const daysSinceClose =
      (Date.now() - new Date(VOTING_CLOSES_ISO).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceClose > 3) return null;
  }

  if (dismissed) return null;

  const onVotePage = pathname.startsWith("/vote");

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, status);
    } catch {
      /* ignore */
    }
  }

  if (status === "open") {
    return (
      <div className="relative overflow-hidden bg-orange text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(0,0,0,0.12) 12px, rgba(0,0,0,0.12) 24px)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg tracking-wide uppercase sm:text-xl">
              🏆 Skillies voting is LIVE
            </p>
            <p className="text-sm text-white/90">
              Cast all 5 team-vote picks
              {countdown ? (
                <>
                  {" "}
                  · closes in <span className="font-semibold">{countdown}</span>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!onVotePage && (
              <Link
                href="/vote"
                className="bg-suede px-4 py-2 font-display text-sm tracking-wider text-white uppercase transition-colors hover:bg-white hover:text-orange"
              >
                Vote now →
              </Link>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="px-2 py-2 text-xs tracking-wide text-white/80 uppercase hover:text-white"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "upcoming") {
    return (
      <div className="border-b border-orange/30 bg-suede text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="font-display text-base tracking-wide text-orange uppercase sm:text-lg">
              Skillies ballot opens soon
            </p>
            <p className="text-sm text-lt-suede">
              Five team-vote awards open{" "}
              {formatVotingInstant(VOTING_OPENS_ISO)}
              {countdown ? (
                <>
                  {" "}
                  · <span className="text-white">{countdown}</span>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!onVotePage && (
              <Link
                href="/vote"
                className="border border-orange bg-orange/15 px-4 py-2 font-display text-sm tracking-wider text-orange uppercase transition-colors hover:bg-orange hover:text-white"
              >
                Preview ballot →
              </Link>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="px-2 py-2 text-xs tracking-wide text-lt-suede uppercase hover:text-white"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-lt-suede/40 bg-antique text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="font-display text-base tracking-wide uppercase sm:text-lg">
            Voting closed — see you at the wrap party
          </p>
          <p className="text-sm text-white/85">
            Winners for all seven Skillies awards drop live Wed, Sept 30.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="px-2 py-2 text-xs tracking-wide text-white/80 uppercase hover:text-white"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
