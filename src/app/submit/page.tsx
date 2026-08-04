import { AppShell } from "@/components/AppShell";
import { SubmitForm } from "@/components/SubmitForm";
import { requireLinkedPerson } from "@/lib/auth";
import { getPeople } from "@/lib/data";

export default async function SubmitPage() {
  const person = await requireLinkedPerson();
  const people = await getPeople();

  return (
    <AppShell person={person}>
      <div className="border-t-4 border-orange bg-white px-6 py-8 sm:px-8">
        <SubmitForm people={people} creatorId={person.id} />
      </div>
    </AppShell>
  );
}
