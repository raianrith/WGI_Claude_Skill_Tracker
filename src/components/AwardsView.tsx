"use client";

import { useState } from "react";
import { WRAP_PARTY_AWARDS } from "@/lib/awards";

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

export function AwardsView() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="border-t-4 border-orange bg-suede px-6 py-8 text-white sm:px-8">
        <p className="font-display text-sm tracking-[0.25em] text-lt-suede uppercase">
          October 1 · Wrap party
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-wide uppercase">
          The awards
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-lt-suede">
          Not volume. Creativity. These are the trophies (metaphorical, unless
          ELT gets wild) handed out when the rock is done. Every winner is
          revealed at the wrap party — no spoilers from the algorithm.
        </p>
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
                      {award.aka}
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
                    Winner revealed at wrap party
                  </p>
                </div>
              </button>

              {open && (
                <div className="border-t border-lt-gray px-5 pb-5 pt-3">
                  <p className="text-sm text-md-gray">
                    This one&apos;s a human call. Lobby your friends, ship
                    something shameless, and show up October 1.
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
