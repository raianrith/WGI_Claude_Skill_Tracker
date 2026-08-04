"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { CHART_COLORS } from "@/lib/constants";
import type { Person, SkillCategory, SkillWithRelations } from "@/lib/types";

export function LeaderboardView({
  skills,
  people,
}: {
  skills: SkillWithRelations[];
  people: Person[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const topSkills = [...skills]
    .sort((a, b) => b.upvote_count - a.upvote_count)
    .slice(0, 8);

  const collabCounts = new Map<string, number>();
  for (const skill of skills) {
    for (const c of skill.collaborators) {
      collabCounts.set(c.id, (collabCounts.get(c.id) ?? 0) + 1);
    }
  }

  const mostCollaborative = Array.from(collabCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({
      person: people.find((p) => p.id === id),
      count,
    }))
    .filter((x) => x.person);

  const categories: SkillCategory[] = [
    "client work",
    "internal ops",
    "personal",
  ];
  const categoryTotals = categories.map((c) => ({
    category: c,
    count: skills.filter((s) => s.category === c).length,
  }));
  const maxCat = Math.max(1, ...categoryTotals.map((c) => c.count));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-suede uppercase">
          Crowd favorites
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-md-gray">
          Not the official awards — those land at the wrap party. This is just
          what the agency is vibing with right now. Click a skill to peek under
          the hood.
        </p>
      </div>

      <section>
        <h2 className="font-display text-2xl tracking-wide text-suede uppercase">
          Most upvoted
        </h2>
        {topSkills.length === 0 ? (
          <p className="mt-3 text-sm text-md-gray">
            No votes yet. Ship something worth cheering for.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {topSkills.map((skill, i) => {
              const open = openId === skill.id;
              return (
                <li key={skill.id} className="border-t-4 border-orange bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenId((prev) => (prev === skill.id ? null : skill.id))
                    }
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-lt-gray/60"
                  >
                    <span className="font-display text-3xl text-lt-suede tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-xl tracking-wide text-suede uppercase">
                          {skill.title}
                        </p>
                        <CategoryBadge category={skill.category} />
                      </div>
                      <p className="mt-1 text-sm text-md-gray">
                        by {skill.creator.full_name}
                        {skill.collaborators.length > 0 && (
                          <>
                            {" "}
                            with{" "}
                            {skill.collaborators
                              .map((c) => c.full_name)
                              .join(", ")}
                          </>
                        )}{" "}
                        · {skill.upvote_count} upvote
                        {skill.upvote_count === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 font-display text-lg text-orange transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      ▾
                    </span>
                  </button>

                  {open && (
                    <div className="border-t border-lt-gray px-4 pb-5 pt-3 sm:pl-[4.5rem]">
                      <p className="text-sm leading-relaxed text-dk-gray">
                        {skill.description}
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="border-l-4 border-antique bg-lt-gray px-3 py-2">
                          <p className="font-display text-xs tracking-[0.15em] text-antique uppercase">
                            Time saved
                          </p>
                          <p className="mt-1 text-sm text-dk-gray">
                            {skill.time_saved?.trim()
                              ? skill.time_saved
                              : "Not logged — still counts."}
                          </p>
                        </div>
                        <div className="border-l-4 border-orange bg-lt-gray px-3 py-2">
                          <p className="font-display text-xs tracking-[0.15em] text-orange uppercase">
                            Fun fact
                          </p>
                          <p className="mt-1 text-sm text-dk-gray">
                            {skill.fun_fact?.trim()
                              ? skill.fun_fact
                              : "Keeping that one close to the vest."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border-t-4 border-antique bg-white p-5">
          <h2 className="font-display text-2xl tracking-wide text-suede uppercase">
            Most collaborative
          </h2>
          <p className="mt-1 text-sm text-md-gray">
            Tagged as a collaborator the most often.
          </p>
          {mostCollaborative.length === 0 ? (
            <p className="mt-4 text-sm text-md-gray">
              Tag a partner when you ship — drafting pairs count.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {mostCollaborative.map(({ person, count }) =>
                person ? (
                  <li key={person.id} className="flex items-center gap-3">
                    <Avatar
                      name={person.full_name}
                      url={person.avatar_url}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-dk-gray">
                        {person.full_name}
                      </p>
                      <p className="text-xs text-md-gray">
                        On {count} skill{count === 1 ? "" : "s"}
                      </p>
                    </div>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </div>

        <div className="border-t-4 border-suede bg-white p-5">
          <h2 className="font-display text-2xl tracking-wide text-suede uppercase">
            Category mix
          </h2>
          <p className="mt-1 text-sm text-md-gray">
            Agency-wide breakdown of what&apos;s shipping.
          </p>
          <div className="mt-5 space-y-4">
            {categoryTotals.map((row, i) => (
              <div key={row.category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="capitalize text-dk-gray">{row.category}</span>
                  <span className="font-display tracking-wide text-suede">
                    {row.count}
                  </span>
                </div>
                <div className="h-3 bg-lt-gray">
                  <div
                    className="h-full transition-all duration-700"
                    style={{
                      width: `${(row.count / maxCat) * 100}%`,
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
