import type { SkillCategory } from "@/lib/types";

export type AwardId =
  | "crowd-favorite"
  | "personal-fave"
  | "client-crush"
  | "ops-hero"
  | "time-bandit"
  | "unhinged"
  | "stolen-idea";

export type AwardDef = {
  id: AwardId;
  name: string;
  aka: string;
  description: string;
  /** If set, we can tease a live frontrunner from upvotes in this category */
  upvoteCategory?: SkillCategory;
  humanJudged: boolean;
  accent: "orange" | "antique" | "suede";
};

export const WRAP_PARTY_AWARDS: AwardDef[] = [
  {
    id: "crowd-favorite",
    name: "Crowd Favorite",
    aka: "Most Upvoted — Overall",
    description:
      "The skill with the most ▲ across every category. Agency-wide crush. No niche needed — just vibes and votes.",
    humanJudged: true,
    accent: "orange",
  },
  {
    id: "personal-fave",
    name: "Personal Fave",
    aka: "Most Upvoted — Personal",
    description:
      "The personal skill the agency upvoted into orbit. Training wheels that somehow went viral in Slack.",
    upvoteCategory: "personal",
    humanJudged: true,
    accent: "antique",
  },
  {
    id: "client-crush",
    name: "Client Crush",
    aka: "Most Upvoted — Client Work",
    description:
      "Billable brilliance with the most ▲ energy. The skill clients will never know they should thank.",
    upvoteCategory: "client work",
    humanJudged: true,
    accent: "suede",
  },
  {
    id: "ops-hero",
    name: "Ops Hero",
    aka: "Most Upvoted — Internal Ops",
    description:
      "Keeps the agency from inventing the same wheel every Tuesday. Quietly stolen by everyone.",
    upvoteCategory: "internal ops",
    humanJudged: true,
    accent: "orange",
  },
  {
    id: "time-bandit",
    name: "Time Bandit",
    aka: "Biggest Time-Saver",
    description:
      "Stole the most hours back from the calendar gods. Judged on brags, receipts, and collective envy — not a spreadsheet.",
    humanJudged: true,
    accent: "antique",
  },
  {
    id: "unhinged",
    name: "Delightfully Unhinged",
    aka: "Most Delightfully Weird",
    description:
      "Weird in the best way. Made someone say “wait… what?” and then immediately ask for the link.",
    humanJudged: true,
    accent: "suede",
  },
  {
    id: "stolen-idea",
    name: "Stolen Idea Energy",
    aka: "The Skill We All Wish We Thought of First",
    description:
      "So obvious in retrospect it hurts. Officially awarded by humans at the wrap party — the algorithm does not get a vote.",
    humanJudged: true,
    accent: "orange",
  },
];
