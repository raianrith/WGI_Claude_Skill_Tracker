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
  /** Ballot only shows skills in this category (team-vote awards) */
  ballotCategory?: SkillCategory;
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
    aka: "Team vote — client work",
    description:
      "The skill doing the most for client work. Won by team vote — Client Work skills only.",
    ballotCategory: "client work",
    decision: "team-vote",
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
    aka: "Team vote — personal",
    description:
      "Best skill for life outside work. Meal planners, this is your moment. Won by team vote — Personal skills only.",
    ballotCategory: "personal",
    decision: "team-vote",
    accent: "antique",
  },
  {
    id: "ops-hero",
    number: "05",
    name: "Ops Hero",
    aka: "Team vote — internal ops",
    description:
      "Best internal ops skill — the work behind the work. Won by team vote — Internal Ops skills only.",
    ballotCategory: "internal ops",
    decision: "team-vote",
    accent: "orange",
  },
  {
    id: "unhinged",
    number: "06",
    name: "Delightfully Unhinged",
    aka: "Most delightfully weird",
    description:
      "The weirdest, most unexpected thing anyone taught Claude to do. Won by team vote — any skill in the library.",
    decision: "team-vote",
    accent: "suede",
  },
  {
    id: "stolen-idea",
    number: "07",
    name: "Stolen Idea Energy",
    aka: "Most-borrowed idea",
    description:
      "The most-borrowed idea in the library. Copying is the highest compliment. Won by team vote — any skill in the library.",
    decision: "team-vote",
    accent: "orange",
  },
];

export const TEAM_VOTE_AWARDS = WRAP_PARTY_AWARDS.filter(
  (a) => a.decision === "team-vote",
);

export const TEAM_VOTE_AWARD_IDS = TEAM_VOTE_AWARDS.map((a) => a.id);

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
