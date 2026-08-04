import { CATEGORIES } from "@/lib/constants";
import type { SkillCategory } from "@/lib/types";

export function CategoryBadge({ category }: { category: SkillCategory }) {
  const meta = CATEGORIES.find((c) => c.value === category);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 font-display text-xs tracking-wider uppercase ${meta?.accent ?? "bg-lt-suede text-white"}`}
    >
      <span aria-hidden>{meta?.icon}</span>
      {meta?.label ?? category}
    </span>
  );
}
