import type { SkillCategory } from "./types";

export const WORKSPACE_DOMAIN =
  process.env.NEXT_PUBLIC_WORKSPACE_DOMAIN || "weidert.com";

export const SKILLS_PER_PERSON = 3;

export const MILESTONES = [
  {
    id: "first",
    label: "First skill",
    date: "2026-08-29",
    hint: "Everyone ships #1",
  },
  {
    id: "second",
    label: "Second skill",
    date: "2026-09-19",
    hint: "Keep the streak",
  },
  {
    id: "three",
    label: "Three complete",
    date: "2026-09-26",
    hint: "Agency-wide triple",
  },
  {
    id: "rock",
    label: "Rock Complete",
    date: "2026-10-01",
    hint: "Wrap party",
  },
] as const;

export const CATEGORIES: {
  value: SkillCategory;
  label: string;
  icon: string;
  accent: string;
}[] = [
  {
    value: "client work",
    label: "Client work",
    icon: "💼",
    accent: "bg-orange text-white",
  },
  {
    value: "internal ops",
    label: "Internal ops",
    icon: "⚙️",
    accent: "bg-antique text-white",
  },
  {
    value: "personal",
    label: "Personal",
    icon: "🎨",
    accent: "bg-suede text-white",
  },
];

export const CONFETTI_COLORS = [
  "#FF6700",
  "#A86A40",
  "#112721",
  "#A0A9A6",
  "#F7F4F3",
];

export const CHART_COLORS = ["#FF6700", "#A86A40", "#112721", "#A0A9A6"];
