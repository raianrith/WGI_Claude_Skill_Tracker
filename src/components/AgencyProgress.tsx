"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { fireMilestoneConfetti } from "@/lib/confetti";

const REWARD_MILESTONES = [
  {
    at: 33,
    label: "Doughnuts",
    icon: "🍩",
    hint: "Agency sugar hit unlocked",
  },
  {
    at: 66,
    label: "Pizza",
    icon: "🍕",
    hint: "Slices on the horizon",
  },
  {
    at: 100,
    label: "BIG SURPRISE AWAITS",
    icon: "🎁",
    hint: "Rock complete — show up October 1",
  },
] as const;

export function AgencyProgress({
  shipped,
  target,
}: {
  shipped: number;
  target: number;
}) {
  const percent = Math.min(100, target === 0 ? 0 : (shipped / target) * 100);
  const celebrated = useRef(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (celebrated.current || shipped === 0) return;
    const peopleApprox = Math.max(1, Math.round(target / 3));
    const thresholds = [peopleApprox, peopleApprox * 2, peopleApprox * 3];
    if (thresholds.includes(shipped)) {
      celebrated.current = true;
      setPulse(true);
      fireMilestoneConfetti();
      const t = setTimeout(() => setPulse(false), 1200);
      return () => clearTimeout(t);
    }
  }, [shipped, target]);

  return (
    <section
      className={`relative overflow-hidden bg-suede px-6 py-8 text-white sm:px-8 sm:py-10 ${
        pulse ? "ring-2 ring-orange ring-offset-2 ring-offset-lt-gray" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 85% 20%, rgba(255,103,0,0.35), transparent 45%)",
        }}
      />
      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm tracking-[0.25em] text-lt-suede uppercase">
              Agency rock · 3 skills each by Oct 1
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <p className="font-display text-6xl leading-none tracking-wide sm:text-7xl">
                <AnimatedCounter value={shipped} />
                <span className="text-lt-suede"> / {target}</span>
              </p>
              <p className="mb-2 font-display text-2xl tracking-wide text-orange uppercase">
                skills shipped
              </p>
            </div>
            <p className="mt-3 max-w-xl text-sm text-lt-suede">
              {shipped === 0
                ? "Day one. The board is blank and the bar is waiting — first ship gets the ticker humming."
                : percent >= 100
                  ? "Rock complete. BIG SURPRISE AWAITS — someone start the wrap-party playlist."
                  : `${Math.round(percent)}% of the way there. Hit 33% for doughnuts, 66% for pizza, 100% for the big one.`}
            </p>
          </div>

          <div className="shrink-0 lg:pt-2">
            <div className="inline-flex flex-col items-center">
              <Link
                href="/library?cheer=1"
                className="inline-flex items-center gap-2 bg-orange px-4 py-2 font-display text-sm tracking-wider text-white uppercase transition-opacity hover:opacity-90"
              >
                <span aria-hidden>▲</span>
                Cheer on a buddy, upvote skills
              </Link>
              <p className="mt-2 text-center text-[11px] text-lt-suede">
                Library → tap ▲ on a skill
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-10 pb-2">
          <div className="relative mb-3 h-14 sm:h-12">
            {REWARD_MILESTONES.map((m) => {
              const hit = percent >= m.at;
              const atEnd = m.at === 100;
              return (
                <div
                  key={m.at}
                  className={`absolute top-0 flex max-w-[42%] flex-col sm:max-w-none ${
                    atEnd ? "items-end text-right" : "items-center text-center"
                  } ${hit ? "opacity-100" : "opacity-55"}`}
                  style={{
                    left: atEnd ? "auto" : `${m.at}%`,
                    right: atEnd ? "0" : "auto",
                    transform: atEnd ? "none" : "translateX(-50%)",
                  }}
                >
                  <span className="text-lg leading-none" aria-hidden>
                    {m.icon}
                  </span>
                  <span
                    className={`mt-1 font-display text-[10px] leading-tight tracking-wider uppercase sm:text-xs ${
                      hit ? "text-orange" : "text-lt-suede"
                    }`}
                  >
                    {m.label}
                  </span>
                  <span className="hidden text-[10px] text-lt-suede sm:block">
                    {m.at}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative h-3 w-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 bg-orange transition-[width] duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
            {REWARD_MILESTONES.map((m) => {
              const hit = percent >= m.at;
              return (
                <span
                  key={`tick-${m.at}`}
                  className={`absolute top-1/2 h-5 w-0.5 -translate-y-1/2 ${
                    hit ? "bg-orange" : "bg-lt-suede/70"
                  }`}
                  style={{
                    left: m.at === 100 ? "calc(100% - 2px)" : `${m.at}%`,
                  }}
                  aria-hidden
                />
              );
            })}
          </div>

          <ul className="mt-4 flex flex-col gap-1 sm:hidden">
            {REWARD_MILESTONES.map((m) => {
              const hit = percent >= m.at;
              return (
                <li
                  key={`mobile-${m.at}`}
                  className={`text-xs ${hit ? "text-orange" : "text-lt-suede"}`}
                >
                  {m.icon}{" "}
                  <span className="font-display tracking-wider uppercase">
                    {m.at}% · {m.label}
                  </span>
                  {hit ? " — unlocked" : ""}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
