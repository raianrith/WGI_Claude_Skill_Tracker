"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { TEAM_VOTE_AWARDS, type AwardDef } from "@/lib/awards";
import { fireVoteConfetti } from "@/lib/confetti";
import { createClient } from "@/lib/supabase/client";
import type { SkillWithRelations } from "@/lib/types";
import {
  BALLOT_AWARD_COUNT,
  formatCountdown,
  formatVotingInstant,
  getVotingStatus,
  msUntil,
  VOTING_CLOSES_ISO,
  VOTING_OPENS_ISO,
  type BallotAwardId,
  type VotingStatus,
} from "@/lib/voting";

type VotesMap = Partial<Record<BallotAwardId, string>>;

const CATEGORY_LABEL: Record<string, string> = {
  "client work": "Client Work",
  personal: "Personal",
  "internal ops": "Internal Ops",
};

export function VotingBallot({
  skills,
  viewerId,
  initialVotes,
}: {
  skills: SkillWithRelations[];
  viewerId: string;
  initialVotes: VotesMap;
}) {
  const [status, setStatus] = useState<VotingStatus>(() => getVotingStatus());
  const [countdown, setCountdown] = useState("");
  const [activeAward, setActiveAward] = useState<BallotAwardId>("client-crush");
  const [votes, setVotes] = useState<VotesMap>(initialVotes);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const awardMeta = useMemo(
    () =>
      Object.fromEntries(TEAM_VOTE_AWARDS.map((a) => [a.id, a])) as Record<
        BallotAwardId,
        AwardDef
      >,
    [],
  );

  const activeMeta = awardMeta[activeAward];
  const castCount = TEAM_VOTE_AWARDS.filter(
    (a) => votes[a.id as BallotAwardId],
  ).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const category = activeMeta.ballotCategory;
    return skills.filter((skill) => {
      if (category && skill.category !== category) return false;
      if (!q) return true;
      return (
        skill.title.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.creator.full_name.toLowerCase().includes(q) ||
        skill.fun_fact?.toLowerCase().includes(q)
      );
    });
  }, [skills, query, activeMeta.ballotCategory]);

  async function castVote(skill: SkillWithRelations) {
    if (status !== "open") return;
    if (skill.creator_id === viewerId) {
      setError("You can't vote for your own skill — humble.");
      return;
    }
    if (
      activeMeta.ballotCategory &&
      skill.category !== activeMeta.ballotCategory
    ) {
      setError(
        `This award only accepts ${CATEGORY_LABEL[activeMeta.ballotCategory]} skills.`,
      );
      return;
    }

    setSavingId(skill.id);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error: upsertError } = await supabase.from("award_votes").upsert(
      {
        award_id: activeAward,
        skill_id: skill.id,
        voter_id: viewerId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "award_id,voter_id" },
    );

    setSavingId(null);

    if (upsertError) {
      console.error(upsertError);
      setError(
        upsertError.message.includes("policy")
          ? "Voting isn't open right now (or that pick isn't allowed)."
          : "Couldn't save that vote. Try again?",
      );
      return;
    }

    const wasChange = Boolean(votes[activeAward]);
    setVotes((prev) => ({ ...prev, [activeAward]: skill.id }));
    setMessage(
      wasChange
        ? `Swapped your ${activeMeta.name} pick.`
        : `Locked in for ${activeMeta.name}.`,
    );
    fireVoteConfetti();
  }

  const ballotHint = activeMeta.ballotCategory
    ? `Showing ${CATEGORY_LABEL[activeMeta.ballotCategory]} skills only.`
    : "Showing every skill in the library.";

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden border-t-4 border-orange bg-suede text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 40%, rgba(255,103,0,0.25) 40%, rgba(255,103,0,0.25) 60%, transparent 60%), linear-gradient(225deg, transparent 35%, rgba(160,169,166,0.2) 35%, rgba(160,169,166,0.2) 55%, transparent 55%)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden
        />
        <div className="relative px-6 py-10 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <p className="font-display text-sm tracking-[0.3em] text-orange uppercase">
                The Skillies
              </p>
              <h1 className="mt-2 font-display text-5xl tracking-wide uppercase sm:text-6xl">
                Cast your ballot
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-lt-suede sm:text-base">
                Five awards need your vote:{" "}
                <span className="text-white">Client Crush</span>,{" "}
                <span className="text-white">Personal Fave</span>,{" "}
                <span className="text-white">Ops Hero</span>,{" "}
                <span className="text-white">Delightfully Unhinged</span>, and{" "}
                <span className="text-white">Stolen Idea Energy</span>. One pick
                each. Category awards stay in-lane. Tallies sealed until the wrap
                party.
              </p>
            </div>
            <div className="min-w-[11rem] border border-white/15 bg-black/25 px-4 py-4 text-center backdrop-blur-sm">
              <p className="font-display text-xs tracking-[0.2em] text-lt-suede uppercase">
                Your ballot
              </p>
              <p className="mt-1 font-display text-5xl text-orange">
                {castCount}
                <span className="text-2xl text-lt-suede">
                  {" "}
                  / {BALLOT_AWARD_COUNT}
                </span>
              </p>
              <p className="mt-1 text-xs text-lt-suede">
                {castCount === BALLOT_AWARD_COUNT
                  ? "Ballot complete ✨"
                  : "Picks locked in"}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StatusChip status={status} countdown={countdown} />
            <p className="text-xs text-lt-suede">
              Opens {formatVotingInstant(VOTING_OPENS_ISO)} · Closes{" "}
              {formatVotingInstant(VOTING_CLOSES_ISO)}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEAM_VOTE_AWARDS.map((award) => {
          const id = award.id as BallotAwardId;
          const pickedId = votes[id];
          const picked = pickedId
            ? skills.find((s) => s.id === pickedId)
            : undefined;
          const active = activeAward === id;
          const lane = award.ballotCategory
            ? CATEGORY_LABEL[award.ballotCategory]
            : "Any category";
          return (
            <button
              key={award.id}
              type="button"
              onClick={() => {
                setActiveAward(id);
                setQuery("");
                setMessage(null);
                setError(null);
              }}
              className={`border-t-4 bg-white px-5 py-5 text-left transition-shadow ${
                active
                  ? "border-orange shadow-md ring-1 ring-orange"
                  : "border-antique hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xs tracking-[0.25em] text-orange uppercase">
                    {award.number} · {lane}
                  </p>
                  <h2 className="mt-1 font-display text-3xl tracking-wide text-suede uppercase">
                    {award.name}
                  </h2>
                </div>
                <span
                  className={`mt-1 shrink-0 px-2 py-1 font-display text-xs tracking-wider uppercase ${
                    picked
                      ? "bg-orange text-white"
                      : "bg-lt-gray text-md-gray"
                  }`}
                >
                  {picked ? "Voted" : "Open"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-md-gray">
                {award.description}
              </p>
              {picked ? (
                <p className="mt-4 border-t border-lt-gray pt-3 text-sm text-suede">
                  Your pick:{" "}
                  <span className="font-semibold text-orange">
                    {picked.title}
                  </span>
                </p>
              ) : (
                <p className="mt-4 border-t border-lt-gray pt-3 text-sm text-lt-suede">
                  No pick yet — choose a skill below.
                </p>
              )}
            </button>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-xs tracking-[0.25em] text-antique uppercase">
              Ballot for
            </p>
            <h3 className="font-display text-4xl tracking-wide text-suede uppercase">
              {activeMeta.name}
            </h3>
            <p className="mt-1 max-w-xl text-sm text-md-gray">
              {ballotHint}{" "}
              {status === "open"
                ? "Tap a skill to cast (or change) your vote. You can't vote for your own."
                : status === "upcoming"
                  ? "Browse now — voting unlocks Monday at 8am."
                  : "Voting is closed. See you at the wrap party."}
            </p>
          </div>
          <label className="block w-full max-w-xs">
            <span className="sr-only">Search skills</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this ballot…"
              className="w-full border border-lt-suede/60 bg-white px-3 py-2.5 text-sm outline-none ring-orange focus:ring-2"
            />
          </label>
        </div>

        {(message || error) && (
          <p
            className={`text-sm ${error ? "text-orange" : "text-suede"}`}
            role="status"
          >
            {error ?? message}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skill) => {
            const isOwn = skill.creator_id === viewerId;
            const isSelected = votes[activeAward] === skill.id;
            const busy = savingId === skill.id;
            const canVote = status === "open" && !isOwn;

            return (
              <button
                key={skill.id}
                type="button"
                disabled={!canVote || busy}
                onClick={() => castVote(skill)}
                className={`flex h-full flex-col border-t-4 bg-white p-4 text-left transition-all ${
                  isSelected
                    ? "border-orange shadow-md ring-2 ring-orange"
                    : "border-antique hover:shadow-sm"
                } ${!canVote ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <CategoryBadge category={skill.category} />
                  {isSelected ? (
                    <span className="bg-orange px-2 py-1 font-display text-[10px] tracking-wider text-white uppercase">
                      Your vote
                    </span>
                  ) : isOwn ? (
                    <span className="bg-lt-gray px-2 py-1 font-display text-[10px] tracking-wider text-md-gray uppercase">
                      Yours
                    </span>
                  ) : null}
                </div>

                <h4 className="mt-3 font-display text-2xl tracking-wide text-suede uppercase">
                  {skill.title}
                </h4>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-md-gray">
                  {skill.description}
                </p>

                {skill.fun_fact && (
                  <p className="mt-3 line-clamp-2 border-t border-lt-gray pt-2 text-xs text-antique">
                    <span className="font-semibold">Fun fact: </span>
                    {skill.fun_fact}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-2 border-t border-lt-gray pt-3">
                  <Avatar
                    name={skill.creator.full_name}
                    url={skill.creator.avatar_url}
                    size="sm"
                  />
                  <p className="truncate text-sm font-semibold text-dk-gray">
                    {skill.creator.full_name}
                  </p>
                </div>

                {canVote && (
                  <span className="mt-3 font-display text-xs tracking-wider text-orange uppercase">
                    {busy
                      ? "Saving…"
                      : isSelected
                        ? "Selected — tap another to change"
                        : "Tap to vote"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="border border-dashed border-lt-suede bg-white px-4 py-8 text-center text-sm text-md-gray">
            No skills on this ballot
            {query ? " match that search" : ""}. Try another award tab
            {query ? " or clear the search" : ""}.
          </p>
        )}
      </section>

      <aside className="border-t-4 border-antique bg-white px-5 py-5">
        <p className="font-display text-xs tracking-[0.2em] text-antique uppercase">
          How the other awards work
        </p>
        <ul className="mt-3 space-y-2 text-sm text-md-gray">
          <li>
            <span className="font-semibold text-suede">Crowd Favorite</span> —
            decided by upvotes in the library. Keep cheering.
          </li>
          <li>
            <span className="font-semibold text-suede">Time Bandit</span> — pure
            math. Highest weekly time-savings estimate wins. No ballot needed.
          </li>
        </ul>
      </aside>
    </div>
  );
}

function StatusChip({
  status,
  countdown,
}: {
  status: VotingStatus;
  countdown: string;
}) {
  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-2 bg-orange px-3 py-2 font-display text-sm tracking-wider text-white uppercase animate-pulse">
        Voting open
        {countdown ? (
          <span className="normal-case tracking-normal">
            · closes in {countdown}
          </span>
        ) : null}
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span className="inline-flex items-center gap-2 border border-white/30 bg-white/10 px-3 py-2 font-display text-sm tracking-wider text-white uppercase">
        Opens in {countdown || "…"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 bg-black/40 px-3 py-2 font-display text-sm tracking-wider text-lt-suede uppercase">
      Voting closed
    </span>
  );
}
