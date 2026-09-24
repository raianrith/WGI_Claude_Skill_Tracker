"use client";

import Link from "next/link";
import { useState } from "react";
import {
  WRAP_PARTY_AWARDS,
  decisionLabel,
  type AwardDecision,
} from "@/lib/awards";
import { getVotingStatus } from "@/lib/voting";

const ACCENT_BORDER = {
  orange: "border-orange",
  antique: "border-antique",
  suede: "border-suede",
} as const;

const ACCENT_TEXT = {
  orange: "text-orange",
  antique: "text-antique",
  suede: "text-suede",
} as const;

const DECISION_HINT: Record<AwardDecision, string> = {
  upvotes: "Keep upvoting in the library — the leaderboard is the ballot.",
  "time-saved":
    "No campaigning needed. Highest weekly time-savings estimate wins.",
  "team-vote":
    "Cast your pick on the Vote page. Category awards only show matching skills. Mon 8am → Wed noon.",
};

export function AwardsView() {
  const [openId, setOpenId] = useState<string | null>(null);
  const votingOpen = getVotingStatus() === "open";

  return (
    <div className="space-y-8">
      <div className="border-t-4 border-orange bg-suede px-6 py-8 text-white sm:px-8">
        <p className="font-display text-sm tracking-[0.25em] text-lt-suede uppercase">
          Sept 30 · The Skillies wrap party
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-wide uppercase">
          The awards
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-lt-suede">
          Seven trophies. Crowd Favorite rides on upvotes; Time Bandit is pure
          math. The other five need a human vote on the ballot. Winners revealed
          live at the wrap party.
        </p>
        <Link
          href="/vote"
          className={`mt-6 inline-flex items-center gap-2 px-5 py-3 font-display text-sm tracking-wider uppercase transition-colors ${
            votingOpen
              ? "bg-orange text-white hover:bg-white hover:text-orange"
              : "border border-lt-suede/50 text-white hover:border-orange hover:text-orange"
          }`}
        >
          {votingOpen ? "Voting is open — cast your ballot" : "Go to the ballot"}
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {WRAP_PARTY_AWARDS.map((award) => {
          const open = openId === award.id;
          return (
            <article
              key={award.id}
              className={`flex flex-col border-t-4 bg-white ${ACCENT_BORDER[award.accent]}`}
            >
              <button
                type="button"
                onClick={() =>
                  setOpenId((prev) => (prev === award.id ? null : award.id))
                }
                className="flex flex-1 flex-col px-5 py-5 text-left transition-colors hover:bg-lt-gray/50"
                aria-expanded={open}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`font-display text-xs tracking-[0.2em] uppercase ${ACCENT_TEXT[award.accent]}`}
                    >
                      {award.number} · {award.aka}
                    </p>
                    <h2 className="mt-1 font-display text-3xl tracking-wide text-suede uppercase">
                      {award.name}
                    </h2>
                  </div>
                  <span
                    className={`font-display text-lg text-orange transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  >
                    ▾
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-md-gray">
                  {award.description}
                </p>

                <div className="mt-4 border-t border-lt-gray pt-3">
                  <p className="font-display text-xs tracking-wider text-lt-suede uppercase">
                    {decisionLabel(award.decision)} · Winner at wrap party
                  </p>
                </div>
              </button>

              {open && (
                <div className="border-t border-lt-gray px-5 pb-5 pt-3 space-y-3">
                  <p className="text-sm text-md-gray">
                    {DECISION_HINT[award.decision]}
                  </p>
                  {award.decision === "team-vote" && (
                    <Link
                      href="/vote"
                      className="inline-flex font-display text-sm tracking-wider text-orange uppercase hover:underline"
                    >
                      Open the ballot →
                    </Link>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
