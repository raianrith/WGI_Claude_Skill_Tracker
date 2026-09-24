import { AppShell } from "@/components/AppShell";
import { VotingBallot } from "@/components/VotingBallot";
import { requireLinkedPerson } from "@/lib/auth";
import { getMyAwardVotes, getSkillsWithRelations } from "@/lib/data";

export default async function VotePage() {
  const person = await requireLinkedPerson();
  const [skills, votes] = await Promise.all([
    getSkillsWithRelations(person.id),
    getMyAwardVotes(person.id),
  ]);

  return (
    <AppShell person={person}>
      <VotingBallot
        skills={skills}
        viewerId={person.id}
        initialVotes={votes}
      />
    </AppShell>
  );
}
