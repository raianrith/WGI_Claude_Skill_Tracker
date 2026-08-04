"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SkillCard } from "@/components/SkillCard";
import { CATEGORIES } from "@/lib/constants";
import type { Person, SkillCategory, SkillWithRelations } from "@/lib/types";

type SortKey = "newest" | "upvoted";

export function LibraryClient({
  skills,
  people,
  viewerId,
}: {
  skills: SkillWithRelations[];
  people: Person[];
  viewerId: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showCheerTip = searchParams.get("cheer") === "1";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SkillCategory | "all">("all");
  const [personId, setPersonId] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>(showCheerTip ? "upvoted" : "newest");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [tipOpen, setTipOpen] = useState(showCheerTip);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = skills.filter((s) => {
      if (category !== "all" && s.category !== category) return false;
      if (
        personId !== "all" &&
        s.creator_id !== personId &&
        !s.collaborators.some((c) => c.id === personId)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });

    if (sort === "upvoted") {
      list = [...list].sort((a, b) => b.upvote_count - a.upvote_count);
    } else {
      list = [...list].sort(
        (a, b) =>
          new Date(b.shipped_at).getTime() - new Date(a.shipped_at).getTime(),
      );
    }
    return list;
  }, [skills, query, category, personId, sort]);

  function surpriseMe() {
    if (skills.length === 0) return;
    const pick = skills[Math.floor(Math.random() * skills.length)];
    setHighlightId(pick.id);
    setQuery("");
    setCategory("all");
    setPersonId("all");
    setSort("newest");
    requestAnimationFrame(() => {
      document
        .getElementById(`skill-${pick.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  return (
    <div>
      {tipOpen && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-l-4 border-orange bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="font-display text-lg tracking-wide text-suede uppercase">
              How to cheer someone on
            </p>
            <p className="mt-1 text-sm text-md-gray">
              Spot a skill you love → tap the{" "}
              <span className="font-semibold text-orange">▲</span> on the card.
              One upvote per skill. You can&apos;t upvote your own (humble).
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setTipOpen(false);
              router.replace("/library");
            }}
            className="text-xs tracking-wide text-md-gray uppercase hover:text-orange"
          >
            Got it
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-suede uppercase">
            Skill library
          </h1>
          <p className="mt-1 text-sm text-md-gray">
            Browse what the agency has shipped. Upvote the ones you&apos;ll steal.
          </p>
        </div>
        <button
          type="button"
          onClick={surpriseMe}
          disabled={skills.length === 0}
          className="bg-suede px-4 py-2.5 font-display text-sm tracking-wider text-white uppercase transition-colors hover:bg-orange disabled:opacity-40"
        >
          Surprise me
        </button>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs tracking-wide text-md-gray uppercase">
            Search
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title or description…"
            className="w-full border border-lt-suede/50 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs tracking-wide text-md-gray uppercase">
            Category
          </span>
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as SkillCategory | "all")
            }
            className="w-full border border-lt-suede/50 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange"
          >
            <option value="all">All</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs tracking-wide text-md-gray uppercase">
            Person
          </span>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            className="w-full border border-lt-suede/50 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange"
          >
            <option value="all">Everyone</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex gap-2">
        {(
          [
            ["newest", "Newest"],
            ["upvoted", "Most upvoted"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSort(key)}
            className={`px-3 py-1.5 font-display text-xs tracking-wider uppercase ${
              sort === key
                ? "bg-orange text-white"
                : "bg-white text-md-gray hover:text-orange"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 border border-dashed border-lt-suede bg-white px-6 py-12 text-center">
          <p className="font-display text-2xl tracking-wide text-suede uppercase">
            {skills.length === 0 ? "Library's empty" : "Nothing matches"}
          </p>
          <p className="mt-2 text-sm text-md-gray">
            {skills.length === 0
              ? "Be the first to ship something weird and useful."
              : "Try clearing filters — or Surprise me for chaos mode."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              viewerId={viewerId}
              highlight={highlightId === skill.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
