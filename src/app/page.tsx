import { ActivityTicker } from "@/components/ActivityTicker";
import { AgencyProgress } from "@/components/AgencyProgress";
import { AppShell } from "@/components/AppShell";
import { MilestoneStrip } from "@/components/MilestoneStrip";
import { RosterGrid } from "@/components/RosterGrid";
import { requireLinkedPerson } from "@/lib/auth";
import {
  getAgencyProgress,
  getCollaboratorsBySkill,
  getPersonSkillCounts,
  getRecentActivity,
} from "@/lib/data";
import Link from "next/link";

export default async function DashboardPage() {
  const person = await requireLinkedPerson();
  const [{ people, skills, shipped, target }, counts, activity, collabsBySkill] =
    await Promise.all([
      getAgencyProgress(),
      getPersonSkillCounts(),
      getRecentActivity(),
      getCollaboratorsBySkill(),
    ]);

  const myCount = counts[person.id] ?? 0;

  return (
    <AppShell person={person}>
      <div className="space-y-8">
        <AgencyProgress shipped={shipped} target={target} />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t-4 border-antique bg-white px-5 py-4">
          <div>
            <p className="font-display text-xs tracking-[0.2em] text-antique uppercase">
              Your board
            </p>
            <p className="font-display text-2xl tracking-wide text-suede uppercase">
              {myCount === 0
                ? "You're on deck"
                : myCount >= 3
                  ? "Three shipped — legend"
                  : `${myCount} of 3 shipped`}
            </p>
          </div>
          <Link
            href="/submit"
            className="bg-orange px-4 py-2.5 font-display text-sm tracking-wider text-white uppercase hover:opacity-90"
          >
            Ship a skill
          </Link>
        </div>

        <MilestoneStrip />

        <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
          <RosterGrid
            people={people}
            skills={skills}
            counts={counts}
            collabsBySkill={collabsBySkill}
          />
          <ActivityTicker initialItems={activity} />
        </div>
      </div>
    </AppShell>
  );
}
