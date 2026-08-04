import { MILESTONES } from "@/lib/constants";
import { daysUntil, formatMilestoneDate } from "@/lib/dates";

export function MilestoneStrip() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {MILESTONES.map((m) => {
        const days = daysUntil(m.date);
        const done = days < 0;
        const today = days === 0;
        return (
          <div
            key={m.id}
            className="border-t-4 border-antique bg-white px-4 py-4 shadow-sm"
          >
            <p className="font-display text-xs tracking-[0.2em] text-antique uppercase">
              {formatMilestoneDate(m.date)}
            </p>
            <p className="mt-1 font-display text-xl tracking-wide text-suede uppercase">
              {m.label}
            </p>
            <p className="mt-1 text-sm text-md-gray">{m.hint}</p>
            <p
              className={`mt-3 font-display text-sm tracking-wider uppercase ${
                done
                  ? "text-lt-suede"
                  : today
                    ? "text-orange"
                    : "text-dk-gray"
              }`}
            >
              {done
                ? "Passed — how'd we do?"
                : today
                  ? "That's today"
                  : `${days} day${days === 1 ? "" : "s"} out`}
            </p>
          </div>
        );
      })}
    </section>
  );
}
