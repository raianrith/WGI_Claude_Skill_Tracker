"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { fireShipConfetti } from "@/lib/confetti";
import { CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { Person, Skill, SkillCategory } from "@/lib/types";

type EditableSkill = Pick<
  Skill,
  "id" | "title" | "description" | "category" | "time_saved" | "fun_fact"
> & {
  collaboratorIds?: string[];
};

export function SubmitForm({
  people,
  creatorId,
  initialSkill,
}: {
  people: Person[];
  creatorId: string;
  initialSkill?: EditableSkill;
}) {
  const router = useRouter();
  const editing = Boolean(initialSkill);
  const [title, setTitle] = useState(initialSkill?.title ?? "");
  const [description, setDescription] = useState(initialSkill?.description ?? "");
  const [category, setCategory] = useState<SkillCategory>(
    initialSkill?.category ?? "client work",
  );
  const [timeSaved, setTimeSaved] = useState(initialSkill?.time_saved ?? "");
  const [funFact, setFunFact] = useState(initialSkill?.fun_fact ?? "");
  const [collabQuery, setCollabQuery] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>(
    initialSkill?.collaboratorIds ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const others = useMemo(
    () => people.filter((p) => p.id !== creatorId),
    [people, creatorId],
  );

  const suggestions = useMemo(() => {
    const q = collabQuery.trim().toLowerCase();
    if (!q) return [];
    return others
      .filter(
        (p) =>
          !collaborators.includes(p.id) &&
          p.full_name.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [others, collaborators, collabQuery]);

  function toggleCollaborator(id: string) {
    setCollaborators((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setCollabQuery("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required — give it a real name.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        time_saved: timeSaved.trim() || null,
        fun_fact: funFact.trim() || null,
      };

      let skillId = initialSkill?.id;

      if (editing && skillId) {
        const { error: updateError } = await supabase
          .from("skills")
          .update(payload)
          .eq("id", skillId)
          .eq("creator_id", creatorId);

        if (updateError) {
          setError(updateError.message ?? "Couldn't save that — try again.");
          return;
        }

        await supabase.from("skill_collaborators").delete().eq("skill_id", skillId);
      } else {
        const { data: skill, error: skillError } = await supabase
          .from("skills")
          .insert({
            creator_id: creatorId,
            ...payload,
          })
          .select("id")
          .single();

        if (skillError || !skill) {
          setError(skillError?.message ?? "Couldn't ship that — try again.");
          return;
        }
        skillId = skill.id;
      }

      if (skillId && collaborators.length > 0) {
        const { error: collabError } = await supabase
          .from("skill_collaborators")
          .insert(
            collaborators.map((person_id) => ({
              skill_id: skillId,
              person_id,
            })),
          );
        if (collabError) {
          console.error(collabError);
        }
      }

      if (!editing) {
        fireShipConfetti();
        router.push("/");
      } else {
        router.push("/library");
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-suede uppercase">
          {editing ? "Edit skill" : "Ship a skill"}
        </h1>
        <p className="mt-1 text-sm text-md-gray">
          {editing
            ? "Tweak the copy, category, or collaborators — upvotes stay put."
            : "Log it once it's real. Half-baked drafts stay in your notebook."}
        </p>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs tracking-wide text-md-gray uppercase">
          Title *
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Client Onboarding Email Drafter"
          className="w-full border border-lt-suede/50 bg-white px-3 py-2.5 outline-none focus:border-orange"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs tracking-wide text-md-gray uppercase">
          Description *
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          placeholder="What does it do, and when would someone reach for it?"
          className="w-full border border-lt-suede/50 bg-white px-3 py-2.5 outline-none focus:border-orange"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs tracking-wide text-md-gray uppercase">
          Category *
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SkillCategory)}
          className="w-full border border-lt-suede/50 bg-white px-3 py-2.5 outline-none focus:border-orange"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="mb-1 block text-xs tracking-wide text-md-gray uppercase">
          Collaborators
        </span>
        <input
          value={collabQuery}
          onChange={(e) => setCollabQuery(e.target.value)}
          placeholder="Search the roster…"
          className="w-full border border-lt-suede/50 bg-white px-3 py-2.5 outline-none focus:border-orange"
        />
        {suggestions.length > 0 && (
          <ul className="mt-1 border border-lt-suede/40 bg-white">
            {suggestions.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => toggleCollaborator(p.id)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-lt-gray"
                >
                  {p.full_name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {collaborators.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {collaborators.map((id) => {
              const person = people.find((p) => p.id === id);
              if (!person) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleCollaborator(id)}
                  className="bg-antique px-2 py-1 text-xs text-white"
                >
                  {person.full_name} ×
                </button>
              );
            })}
          </div>
        )}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs tracking-wide text-md-gray uppercase">
          Time saved
        </span>
        <input
          value={timeSaved}
          onChange={(e) => setTimeSaved(e.target.value)}
          placeholder="10 min a week? An hour? Guess."
          className="w-full border border-lt-suede/50 bg-white px-3 py-2.5 outline-none focus:border-orange"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs tracking-wide text-md-gray uppercase">
          Fun fact
        </span>
        <input
          value={funFact}
          onChange={(e) => setFunFact(e.target.value)}
          placeholder="What's the weirdest thing this skill can do?"
          className="w-full border border-lt-suede/50 bg-white px-3 py-2.5 outline-none focus:border-orange"
        />
      </label>

      {error && (
        <p className="border-l-4 border-orange bg-white px-3 py-2 text-sm text-dk-gray">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-orange px-4 py-3 font-display text-lg tracking-wider text-white uppercase transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending
          ? editing
            ? "Saving…"
            : "Shipping…"
          : editing
            ? "Save changes"
            : "Ship it"}
      </button>
    </form>
  );
}
