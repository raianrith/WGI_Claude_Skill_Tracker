import type { SkillCategory } from "@/lib/types";

export type AwardId =
  | "crowd-favorite"
  | "personal-fave"
  | "client-crush"
  | "ops-hero"
  | "time-bandit"
  | "unhinged"
  | "stolen-idea";

export type AwardDecision =
  | "upvotes"
  | "time-saved"
  | "team-vote";

export type AwardDef = {
  id: AwardId;
  number: string;
  name: string;
  aka: string;
  description: string;
  /** If set, we can tease a live frontrunner from upvotes in this category */
  upvoteCategory?: SkillCategory;
  decision: AwardDecision;
  accent: "orange" | "antique" | "suede";
};

export const WRAP_PARTY_AWARDS: AwardDef[] = [
  {
    id: "crowd-favorite",
    number: "01",
    name: "Crowd Favorite",
    aka: "Most upvoted — overall",
    description:
      "The skill we all wish we'd built. Won by the most upvotes in the Skills Tracker.",
    decision: "upvotes",
    accent: "orange",
  },
  {
    id: "client-crush",
    number: "02",
    name: "Client Crush",
    aka: "Most upvoted — client work",
    description:
      "The skill doing the most for client work. Won by the most upvotes in Client Work.",
    upvoteCategory: "client work",
    decision: "upvotes",
    accent: "suede",
  },
  {
    id: "time-bandit",
    number: "03",
    name: "Time Bandit",
    aka: "Biggest time-saver",
    description:
      "No votes, just math. Highest weekly time-savings estimate in the tracker wins.",
    decision: "time-saved",
    accent: "antique",
  },
  {
    id: "personal-fave",
    number: "04",
    name: "Personal Fave",
    aka: "Most upvoted — personal",
    description:
      "Best skill for life outside work. Meal planners, this is your moment. Won by the most Personal upvotes.",
    upvoteCategory: "personal",
    decision: "upvotes",
    accent: "antique",
  },
  {
    id: "ops-hero",
    number: "05",
    name: "Ops Hero",
    aka: "Most upvoted — internal ops",
    description:
      "Best internal ops skill — the work behind the work. Won by the most Internal Ops upvotes.",
    upvoteCategory: "internal ops",
    decision: "upvotes",
    accent: "orange",
  },
  {
    id: "unhinged",
    number: "06",
    name: "Delightfully Unhinged",
    aka: "Most delightfully weird",
    description:
      "The weirdest, most unexpected thing anyone taught Claude to do. Won by team vote.",
    decision: "team-vote",
    accent: "suede",
  },
  {
    id: "stolen-idea",
    number: "07",
    name: "Stolen Idea Energy",
    aka: "Most-borrowed idea",
    description:
      "The most-borrowed idea in the library. Copying is the highest compliment. Won by team vote.",
    decision: "team-vote",
    accent: "orange",
  },
];

export const TEAM_VOTE_AWARDS = WRAP_PARTY_AWARDS.filter(
  (a) => a.decision === "team-vote",
);

export function decisionLabel(decision: AwardDecision): string {
  switch (decision) {
    case "upvotes":
      return "Decided by upvotes";
    case "time-saved":
      return "Decided by time saved";
    case "team-vote":
      return "Team vote";
  }
}
