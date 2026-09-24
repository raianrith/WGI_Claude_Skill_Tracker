import { SKILLS_PER_PERSON } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Person, Skill, SkillCategory, SkillWithRelations } from "@/lib/types";

export async function getPeople(): Promise<Person[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Person[];
}

export async function getSkillsRaw(): Promise<Skill[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .order("shipped_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Skill[];
}

export async function getCollaboratorsBySkill(): Promise<Record<string, string[]>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("skill_collaborators")
    .select("skill_id, person_id");

  if (error) throw error;

  const map: Record<string, string[]> = {};
  for (const row of (data ?? []) as { skill_id: string; person_id: string }[]) {
    const list = map[row.skill_id] ?? [];
    list.push(row.person_id);
    map[row.skill_id] = list;
  }
  return map;
}

/** Distinct skills credited to a person as creator or collaborator. */
export async function getPersonSkillCounts(): Promise<Record<string, number>> {
  const supabase = createClient();
  const [{ data: skills, error: skillsError }, { data: collabs, error: collabError }] =
    await Promise.all([
      supabase.from("skills").select("id, creator_id"),
      supabase.from("skill_collaborators").select("skill_id, person_id"),
    ]);

  if (skillsError) throw skillsError;
  if (collabError) throw collabError;

  const credited = new Map<string, Set<string>>();

  function credit(personId: string, skillId: string) {
    const set = credited.get(personId) ?? new Set<string>();
    set.add(skillId);
    credited.set(personId, set);
  }

  for (const skill of (skills ?? []) as { id: string; creator_id: string }[]) {
    credit(skill.creator_id, skill.id);
  }

  for (const row of (collabs ?? []) as { skill_id: string; person_id: string }[]) {
    credit(row.person_id, row.skill_id);
  }

  const counts: Record<string, number> = {};
  Array.from(credited.entries()).forEach(([personId, skillIds]) => {
    counts[personId] = skillIds.size;
  });
  return counts;
}

/** @deprecated use getPersonSkillCounts — kept as alias */
export async function getSkillCountsByCreator(): Promise<Record<string, number>> {
  return getPersonSkillCounts();
}

export async function getAgencyProgress() {
  const [people, skills, counts] = await Promise.all([
    getPeople(),
    getSkillsRaw(),
    getPersonSkillCounts(),
  ]);
  const target = Math.max(people.length * SKILLS_PER_PERSON, SKILLS_PER_PERSON);
  // Rock progress: each person's credited skills count (creator or collaborator), capped at 3
  const shipped = people.reduce((sum, person) => {
    const n = counts[person.id] ?? 0;
    return sum + Math.min(SKILLS_PER_PERSON, n);
  }, 0);
  return {
    people,
    skills,
    shipped,
    target,
    percent: Math.min(100, Math.round((shipped / target) * 100)),
  };
}

type UpvoteRow = { skill_id: string; voter_id: string };

export async function getSkillsWithRelations(
  viewerId: string,
): Promise<SkillWithRelations[]> {
  const supabase = createClient();

  const [
    { data: skills, error: skillsError },
    { data: people, error: peopleError },
    { data: collabs, error: collabError },
    { data: upvotes, error: upvoteError },
  ] = await Promise.all([
    supabase.from("skills").select("*").order("shipped_at", { ascending: false }),
    supabase.from("people").select("*"),
    supabase.from("skill_collaborators").select("skill_id, person_id"),
    supabase.from("skill_upvotes").select("skill_id, voter_id"),
  ]);

  if (skillsError) throw skillsError;
  if (peopleError) throw peopleError;
  if (collabError) throw collabError;
  if (upvoteError) throw upvoteError;

  const peopleById = new Map(
    ((people ?? []) as Person[]).map((p) => [p.id, p]),
  );

  const collaboratorsBySkill = new Map<string, Person[]>();
  for (const row of (collabs ?? []) as { skill_id: string; person_id: string }[]) {
    const list = collaboratorsBySkill.get(row.skill_id) ?? [];
    const person = peopleById.get(row.person_id);
    if (person) list.push(person);
    collaboratorsBySkill.set(row.skill_id, list);
  }

  const upvoteCounts = new Map<string, number>();
  const viewerVotes = new Set<string>();
  for (const row of (upvotes ?? []) as UpvoteRow[]) {
    upvoteCounts.set(row.skill_id, (upvoteCounts.get(row.skill_id) ?? 0) + 1);
    if (row.voter_id === viewerId) viewerVotes.add(row.skill_id);
  }

  return ((skills ?? []) as Skill[]).map((skill) => {
    const creator = peopleById.get(skill.creator_id);
    return {
      ...skill,
      creator: creator ?? {
        id: skill.creator_id,
        full_name: "Unknown",
        email: "",
        auth_user_id: null,
        avatar_url: null,
        created_at: skill.created_at,
      },
      collaborators: collaboratorsBySkill.get(skill.id) ?? [],
      upvote_count: upvoteCounts.get(skill.id) ?? 0,
      viewer_has_upvoted: viewerVotes.has(skill.id),
    };
  });
}

export async function getRecentActivity(limit = 15) {
  const supabase = createClient();
  const [{ data: skills }, { data: upvotes }, { data: people }] = await Promise.all([
    supabase
      .from("skills")
      .select("id, title, shipped_at, creator_id")
      .order("shipped_at", { ascending: false })
      .limit(limit),
    supabase
      .from("skill_upvotes")
      .select("skill_id, voter_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase.from("people").select("id, full_name"),
  ]);

  const peopleById = new Map(
    ((people ?? []) as { id: string; full_name: string }[]).map((p) => [
      p.id,
      p.full_name,
    ]),
  );

  const skillTitles = new Map(
    ((skills ?? []) as { id: string; title: string }[]).map((s) => [s.id, s.title]),
  );

  // Fetch titles for upvote skill ids that might not be in the recent ships slice
  const upvoteSkillIds = Array.from(
    new Set(
      ((upvotes ?? []) as { skill_id: string }[]).map((u) => u.skill_id),
    ),
  ).filter((id) => !skillTitles.has(id));

  if (upvoteSkillIds.length > 0) {
    const { data: extraSkills } = await supabase
      .from("skills")
      .select("id, title")
      .in("id", upvoteSkillIds);
    for (const s of (extraSkills ?? []) as { id: string; title: string }[]) {
      skillTitles.set(s.id, s.title);
    }
  }

  type ShipRow = {
    id: string;
    title: string;
    shipped_at: string;
    creator_id: string;
  };
  type UpvoteActivity = {
    skill_id: string;
    voter_id: string;
    created_at: string;
  };

  const items = [
    ...((skills ?? []) as ShipRow[]).map((s) => ({
      id: `ship-${s.id}`,
      type: "ship" as const,
      message: `${peopleById.get(s.creator_id) ?? "Someone"} just shipped ${s.title}`,
      created_at: s.shipped_at,
    })),
    ...((upvotes ?? []) as UpvoteActivity[]).map((u) => ({
      id: `upvote-${u.skill_id}-${u.voter_id}`,
      type: "upvote" as const,
      message: `${peopleById.get(u.voter_id) ?? "Someone"} upvoted ${skillTitles.get(u.skill_id) ?? "a skill"}`,
      created_at: u.created_at,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, limit);

  return items;
}

export async function getMyAwardVotes(
  voterId: string,
): Promise<Partial<Record<"unhinged" | "stolen-idea", string>>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("award_votes")
    .select("award_id, skill_id")
    .eq("voter_id", voterId);

  if (error) throw error;

  const votes: Partial<Record<"unhinged" | "stolen-idea", string>> = {};
  for (const row of data ?? []) {
    const awardId = row.award_id as "unhinged" | "stolen-idea";
    votes[awardId] = row.skill_id as string;
  }
  return votes;
}

export function categoryCounts(skills: { category: SkillCategory }[]) {
  return {
    "client work": skills.filter((s) => s.category === "client work").length,
    "internal ops": skills.filter((s) => s.category === "internal ops").length,
    personal: skills.filter((s) => s.category === "personal").length,
  };
}
