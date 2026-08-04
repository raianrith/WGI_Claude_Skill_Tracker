import { AppShell } from "@/components/AppShell";
import { LeaderboardView } from "@/components/LeaderboardView";
import { requireLinkedPerson } from "@/lib/auth";
import { getPeople, getSkillsWithRelations } from "@/lib/data";

export default async function LeaderboardPage() {
  const person = await requireLinkedPerson();
  const [skills, people] = await Promise.all([
    getSkillsWithRelations(person.id),
    getPeople(),
  ]);

  return (
    <AppShell person={person}>
      <LeaderboardView skills={skills} people={people} />
    </AppShell>
  );
}
