"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { TEAM_VOTE_AWARDS } from "@/lib/awards";
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

function firstIncompleteStep(votes: VotesMap): number {
  const idx = TEAM_VOTE_AWARDS.findIndex(
    (a) => !votes[a.id as BallotAwardId],
  );
  return idx === -1 ? TEAM_VOTE_AWARDS.length : idx;
}

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
  const [step, setStep] = useState(() => firstIncompleteStep(initialVotes));
  const [votes, setVotes] = useState<VotesMap>(initialVotes);
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onReview = step >= TEAM_VOTE_AWARDS.length;
  const award = onReview ? null : TEAM_VOTE_AWARDS[step];
  const awardId = award?.id as BallotAwardId | undefined;

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

  const castCount = TEAM_VOTE_AWARDS.filter(
    (a) => votes[a.id as BallotAwardId],
  ).length;

  const filtered = useMemo(() => {
    if (!award) return [];
    const q = query.trim().toLowerCase();
    const category = award.ballotCategory;
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
  }, [skills, query, award]);

  const currentPick = awardId
    ? skills.find((s) => s.id === votes[awardId])
    : undefined;

  async function castVote(skill: SkillWithRelations) {
    if (!award || !awardId) return;
    if (status !== "open") return;
    if (skill.creator_id === viewerId) {
      setError("You can't vote for your own skill — humble.");
      return;
    }
    if (award.ballotCategory && skill.category !== award.ballotCategory) {
      setError(
        `This award only accepts ${CATEGORY_LABEL[award.ballotCategory]} skills.`,
      );
      return;
    }

    setSavingId(skill.id);
    setError(null);

    const supabase = createClient();
    const { error: upsertError } = await supabase.from("award_votes").upsert(
      {
        award_id: awardId,
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

    setVotes((prev) => ({ ...prev, [awardId]: skill.id }));
    fireVoteConfetti();
  }

  function goNext() {
    setQuery("");
    setError(null);
    setStep((s) => Math.min(s + 1, TEAM_VOTE_AWARDS.length));
  }

  function goBack() {
    setQuery("");
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function jumpTo(index: number) {
    setQuery("");
    setError(null);
    setStep(index);
  }

  const lane = award?.ballotCategory
    ? CATEGORY_LABEL[award.ballotCategory]
    : "Any category";

  return (
    <div className="space-y-6">
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
        <div className="relative px-6 py-8 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <p className="font-display text-sm tracking-[0.3em] text-orange uppercase">
                The Skillies
              </p>
              <h1 className="mt-1 font-display text-4xl tracking-wide uppercase sm:text-5xl">
                Cast your ballot
              </h1>
              <p className="mt-3 text-sm text-lt-suede">
                Five steps. One pick each. Tallies stay sealed until the wrap
                party.
              </p>
            </div>
            <div className="border border-white/15 bg-black/25 px-4 py-3 text-center">
              <p className="font-display text-xs tracking-[0.2em] text-lt-suede uppercase">
                Progress
              </p>
              <p className="font-display text-4xl text-orange">
                {castCount}
                <span className="text-xl text-lt-suede">
                  {" "}
                  / {BALLOT_AWARD_COUNT}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusChip status={status} countdown={countdown} />
            <p className="text-xs text-lt-suede">
              Opens {formatVotingInstant(VOTING_OPENS_ISO)} · Closes{" "}
              {formatVotingInstant(VOTING_CLOSES_ISO)}
            </p>
          </div>
        </div>
      </header>

      {/* Step rail */}
      <nav aria-label="Ballot steps" className="bg-white px-3 py-3 sm:px-4">
        <ol className="flex flex-wrap gap-2">
          {TEAM_VOTE_AWARDS.map((a, i) => {
            const id = a.id as BallotAwardId;
            const done = Boolean(votes[id]);
            const current = !onReview && step === i;
            return (
              <li key={a.id} className="min-w-0 flex-1 basis-[30%] sm:basis-0">
                <button
                  type="button"
                  onClick={() => jumpTo(i)}
                  className={`flex w-full flex-col gap-1 border-t-4 px-2 py-2 text-left transition-colors ${
                    current
                      ? "border-orange bg-orange/5"
                      : done
                        ? "border-antique bg-lt-gray/40"
                        : "border-lt-suede/40 hover:bg-lt-gray/30"
                  }`}
                >
                  <span
                    className={`font-display text-[10px] tracking-wider uppercase ${
                      current ? "text-orange" : "text-lt-suede"
                    }`}
                  >
                    Step {i + 1}
                    {done ? " · Done" : ""}
                  </span>
                  <span className="truncate font-display text-sm tracking-wide text-suede uppercase">
                    {a.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-3 h-1.5 overflow-hidden bg-lt-gray">
          <div
            className="h-full origin-left bg-orange transition-all duration-500"
            style={{
              width: `${(castCount / BALLOT_AWARD_COUNT) * 100}%`,
            }}
          />
        </div>
      </nav>

      {onReview ? (
        <ReviewStep
          votes={votes}
          skills={skills}
          castCount={castCount}
          onEdit={jumpTo}
        />
      ) : (
        award &&
        awardId && (
          <section className="space-y-5">
            <div className="border-t-4 border-orange bg-white px-5 py-6 sm:px-7">
              <p className="font-display text-xs tracking-[0.25em] text-orange uppercase">
                Step {step + 1} of {BALLOT_AWARD_COUNT} · {lane}
              </p>
              <h2 className="mt-2 font-display text-4xl tracking-wide text-suede uppercase sm:text-5xl">
                {award.name}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-md-gray sm:text-base">
                {award.description}
              </p>
              {currentPick ? (
                <p className="mt-4 inline-flex items-center gap-2 border border-orange/40 bg-orange/5 px-3 py-2 text-sm text-suede">
                  <span className="font-display text-xs tracking-wider text-orange uppercase">
                    Your pick
                  </span>
                  <span className="font-semibold">{currentPick.title}</span>
                </p>
              ) : (
                <p className="mt-4 text-sm text-lt-suede">
                  Pick one skill below
                  {status === "open" ? " — you can change it anytime before voting closes" : ""}.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-md-gray">
                {award.ballotCategory
                  ? `${CATEGORY_LABEL[award.ballotCategory]} skills only.`
                  : "Any skill in the library."}{" "}
                {status === "open"
                  ? "You can't vote for your own."
                  : status === "upcoming"
                    ? "Browsing only until Monday 8am."
                    : "Voting is closed."}
              </p>
              <label className="block w-full max-w-xs">
                <span className="sr-only">Search skills</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search this step…"
                  className="w-full border border-lt-suede/60 bg-white px-3 py-2.5 text-sm outline-none ring-orange focus:ring-2"
                />
              </label>
            </div>

            {error && (
              <p className="text-sm text-orange" role="status">
                {error}
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((skill) => {
                const isOwn = skill.creator_id === viewerId;
                const isSelected = votes[awardId] === skill.id;
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
                            ? "Selected"
                            : "Tap to vote"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="border border-dashed border-lt-suede bg-white px-4 py-8 text-center text-sm text-md-gray">
                No skills on this step
                {query ? " match that search" : ""}.
                {query ? " Clear the search and try again." : ""}
              </p>
            )}

            <div className="sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 border border-lt-suede/30 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="border border-lt-suede px-4 py-2 font-display text-sm tracking-wider text-suede uppercase transition-colors hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Back
              </button>
              <p className="text-xs text-md-gray">
                {currentPick
                  ? "Pick locked — continue when ready"
                  : status === "open"
                    ? "Pick a skill, then continue"
                    : "You can still browse ahead"}
              </p>
              <button
                type="button"
                onClick={goNext}
                className={`px-5 py-2 font-display text-sm tracking-wider uppercase transition-colors ${
                  currentPick
                    ? "bg-orange text-white hover:bg-suede"
                    : "border border-orange text-orange hover:bg-orange hover:text-white"
                }`}
              >
                {step === TEAM_VOTE_AWARDS.length - 1
                  ? "Review ballot →"
                  : "Next award →"}
              </button>
            </div>
          </section>
        )
      )}

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

function ReviewStep({
  votes,
  skills,
  castCount,
  onEdit,
}: {
  votes: VotesMap;
  skills: SkillWithRelations[];
  castCount: number;
  onEdit: (index: number) => void;
}) {
  const complete = castCount === BALLOT_AWARD_COUNT;

  return (
    <section className="space-y-5">
      <div className="border-t-4 border-orange bg-white px-5 py-6 sm:px-7">
        <p className="font-display text-xs tracking-[0.25em] text-orange uppercase">
          Final check
        </p>
        <h2 className="mt-2 font-display text-4xl tracking-wide text-suede uppercase sm:text-5xl">
          {complete ? "Ballot complete" : "Almost there"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-md-gray">
          {complete
            ? "Nice. Your five picks are in. You can still change any of them before voting closes."
            : `You've locked ${castCount} of ${BALLOT_AWARD_COUNT}. Jump back to finish the rest.`}
        </p>
      </div>

      <ul className="space-y-3">
        {TEAM_VOTE_AWARDS.map((award, i) => {
          const id = award.id as BallotAwardId;
          const pick = votes[id]
            ? skills.find((s) => s.id === votes[id])
            : undefined;
          return (
            <li
              key={award.id}
              className="flex flex-wrap items-center justify-between gap-3 border-t-4 border-antique bg-white px-5 py-4"
            >
              <div className="min-w-0">
                <p className="font-display text-xs tracking-[0.2em] text-orange uppercase">
                  Step {i + 1} · {award.number}
                </p>
                <p className="font-display text-2xl tracking-wide text-suede uppercase">
                  {award.name}
                </p>
                <p className="mt-1 truncate text-sm text-md-gray">
                  {pick ? (
                    <>
                      Your pick:{" "}
                      <span className="font-semibold text-orange">
                        {pick.title}
                      </span>
                    </>
                  ) : (
                    <span className="text-lt-suede">No pick yet</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEdit(i)}
                className="border border-lt-suede px-3 py-2 font-display text-xs tracking-wider text-suede uppercase transition-colors hover:border-orange hover:text-orange"
              >
                {pick ? "Change" : "Pick now"}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onEdit(0)}
          className="border border-lt-suede px-4 py-2 font-display text-sm tracking-wider text-suede uppercase transition-colors hover:border-orange hover:text-orange"
        >
          ← Start over
        </button>
        {!complete && (
          <button
            type="button"
            onClick={() => onEdit(firstIncompleteStep(votes))}
            className="bg-orange px-5 py-2 font-display text-sm tracking-wider text-white uppercase hover:bg-suede"
          >
            Finish remaining →
          </button>
        )}
      </div>
    </section>
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
