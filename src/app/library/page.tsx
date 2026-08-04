import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { LibraryClient } from "@/components/LibraryClient";
import { requireLinkedPerson } from "@/lib/auth";
import { getPeople, getSkillsWithRelations } from "@/lib/data";

export default async function LibraryPage() {
  const person = await requireLinkedPerson();
  const [skills, people] = await Promise.all([
    getSkillsWithRelations(person.id),
    getPeople(),
  ]);

  return (
    <AppShell person={person}>
      <Suspense fallback={<p className="text-sm text-md-gray">Loading library…</p>}>
        <LibraryClient skills={skills} people={people} viewerId={person.id} />
      </Suspense>
    </AppShell>
  );
}
