"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { SKILLS_PER_PERSON } from "@/lib/constants";
import type { Person, Skill } from "@/lib/types";

function Pip({ filled, index }: { filled: boolean; index: number }) {
  return (
    <span
      className={`inline-block h-3 w-3 ${
        filled ? "bg-orange animate-pip-pop" : "bg-lt-suede/50"
      }`}
      style={{ animationDelay: `${index * 80}ms` }}
      aria-hidden
    />
  );
}

export function RosterGrid({
  people,
  skills,
  counts,
  collabsBySkill = {},
}: {
  people: Person[];
  skills: Skill[];
  counts: Record<string, number>;
  collabsBySkill?: Record<string, string[]>;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => people.find((p) => p.id === selectedId) ?? null,
    [people, selectedId],
  );

  const selectedSkills = useMemo(() => {
    if (!selectedId) return [];
    return skills
      .filter(
        (s) =>
          s.creator_id === selectedId ||
          (collabsBySkill[s.id] ?? []).includes(selectedId),
      )
      .sort(
        (a, b) =>
          new Date(b.shipped_at).getTime() - new Date(a.shipped_at).getTime(),
      );
  }, [skills, selectedId, collabsBySkill]);

  useEffect(() => {
    if (!selectedId || !detailRef.current) return;
    detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedId]);

  function roleForSkill(skill: Skill): "shipped" | "collaborator" {
    if (!selectedId) return "shipped";
    if (skill.creator_id === selectedId) return "shipped";
    return "collaborator";
  }

  function selectPerson(personId: string) {
    setSelectedId((prev) => (prev === personId ? null : personId));
  }

  if (people.length === 0) {
    return (
      <div className="border border-dashed border-lt-suede bg-white px-6 py-10 text-center">
        <p className="font-display text-2xl tracking-wide text-suede uppercase">
          Roster loading…
        </p>
        <p className="mt-2 text-sm text-md-gray">
          Raian&apos;s still seeding the people table. Once names land, the pips
          light up here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl tracking-wide text-suede uppercase">
            The roster
          </h2>
          <p className="mt-1 text-sm text-md-gray">
            Three pips each. Creator or collaborator both count. Click a person
            to peek.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person) => {
          const count = counts[person.id] ?? 0;
          const complete = count >= SKILLS_PER_PERSON;
          const active = selectedId === person.id;
          return (
            <button
              key={person.id}
              type="button"
              onClick={() => selectPerson(person.id)}
              className={`flex items-center gap-3 border-t-4 bg-white px-4 py-4 text-left transition-shadow hover:shadow-md ${
                complete ? "border-orange" : "border-antique"
              } ${active ? "shadow-md ring-1 ring-orange" : ""}`}
            >
              <Avatar name={person.full_name} url={person.avatar_url} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-dk-gray">
                  {person.full_name}
                </p>
                <p className="text-xs text-md-gray">
                  {complete
                    ? "Rock solid — three shipped"
                    : count === 0
                      ? "On deck"
                      : `${count} of ${SKILLS_PER_PERSON} on the board`}
                </p>
                <div className="mt-2 flex gap-1.5">
                  {Array.from({ length: SKILLS_PER_PERSON }).map((_, i) => (
                    <Pip key={i} filled={i < count} index={i} />
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div
          ref={detailRef}
          id="roster-person-skills"
          className="mt-6 scroll-mt-6 border border-lt-suede/40 bg-white p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar
                name={selected.full_name}
                url={selected.avatar_url}
                size="lg"
              />
              <div>
                <p className="font-display text-2xl tracking-wide text-suede uppercase">
                  {selected.full_name}
                </p>
                <p className="text-sm text-md-gray">
                  {selectedSkills.length} skill
                  {selectedSkills.length === 1 ? "" : "s"} shipped
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="text-xs tracking-wide text-md-gray uppercase hover:text-orange"
            >
              Close
            </button>
          </div>

          {selectedSkills.length === 0 ? (
            <p className="mt-4 text-sm text-md-gray">
              Nothing shipped yet — they&apos;re still brewing the first one.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {selectedSkills.map((skill, i) => {
                const role = roleForSkill(skill);
                return (
                  <li
                    key={skill.id}
                    className="border-t-4 border-orange bg-lt-gray px-4 py-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-display text-2xl text-lt-suede tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-xl tracking-wide text-suede uppercase">
                            {skill.title}
                          </p>
                          <CategoryBadge category={skill.category} />
                          <span className="text-xs tracking-wide text-md-gray uppercase">
                            {role === "shipped" ? "Shipped" : "Collaborator"}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-dk-gray">
                          {skill.description}
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {skill.output_url && (
                            <div className="border-l-4 border-orange bg-white px-3 py-2 sm:col-span-2">
                              <p className="font-display text-xs tracking-[0.15em] text-orange uppercase">
                                Link to output
                              </p>
                              <a
                                href={skill.output_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-block break-all text-sm text-orange underline decoration-orange/40 underline-offset-2 hover:decoration-orange"
                              >
                                Open link
                              </a>
                            </div>
                          )}
                          <div className="border-l-4 border-antique bg-white px-3 py-2">
                            <p className="font-display text-xs tracking-[0.15em] text-antique uppercase">
                              Time saved
                            </p>
                            <p className="mt-1 text-sm text-dk-gray">
                              {skill.time_saved?.trim()
                                ? skill.time_saved
                                : "Not logged — still counts."}
                            </p>
                          </div>
                          <div className="border-l-4 border-orange bg-white px-3 py-2">
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
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
