import { AppShell } from "@/components/AppShell";
import { AwardsView } from "@/components/AwardsView";
import { requireLinkedPerson } from "@/lib/auth";

export default async function AwardsPage() {
  const person = await requireLinkedPerson();

  return (
    <AppShell person={person}>
      <AwardsView />
    </AppShell>
  );
}
