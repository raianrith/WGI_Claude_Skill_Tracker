import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SubmitForm } from "@/components/SubmitForm";
import { requireLinkedPerson } from "@/lib/auth";
import { getPeople } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import type { Skill } from "@/lib/types";

export default async function EditSkillPage({
  params,
}: {
  params: { id: string };
}) {
  const person = await requireLinkedPerson();
  const supabase = createClient();

  const [{ data: skill, error }, people, { data: collabs }] = await Promise.all([
    supabase.from("skills").select("*").eq("id", params.id).maybeSingle(),
    getPeople(),
    supabase
      .from("skill_collaborators")
      .select("person_id")
      .eq("skill_id", params.id),
  ]);

  if (error || !skill) notFound();

  const row = skill as Skill;
  if (row.creator_id !== person.id) {
    redirect("/library");
  }

  return (
    <AppShell person={person}>
      <div className="border-t-4 border-antique bg-white px-6 py-8 sm:px-8">
        <SubmitForm
          people={people}
          creatorId={person.id}
          initialSkill={{
            id: row.id,
            title: row.title,
            description: row.description,
            category: row.category,
            time_saved: row.time_saved,
            fun_fact: row.fun_fact,
            collaboratorIds: ((collabs ?? []) as { person_id: string }[]).map(
              (c) => c.person_id,
            ),
          }}
        />
      </div>
    </AppShell>
  );
}
