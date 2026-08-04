"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/dates";
import type { ActivityItem } from "@/lib/types";

export function ActivityTicker({
  initialItems,
}: {
  initialItems: ActivityItem[];
}) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("activity-ticker")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "skills" },
        async (payload) => {
          const row = payload.new as {
            id: string;
            title: string;
            creator_id: string;
            shipped_at: string;
          };
          const { data: person } = await supabase
            .from("people")
            .select("full_name")
            .eq("id", row.creator_id)
            .maybeSingle();

          setItems((prev) =>
            [
              {
                id: `ship-${row.id}-${Date.now()}`,
                type: "ship" as const,
                message: `${person?.full_name ?? "Someone"} just shipped ${row.title}`,
                created_at: row.shipped_at,
              },
              ...prev,
            ].slice(0, 15),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "skill_upvotes" },
        async (payload) => {
          const row = payload.new as {
            skill_id: string;
            voter_id: string;
            created_at: string;
          };
          const [{ data: person }, { data: skill }] = await Promise.all([
            supabase
              .from("people")
              .select("full_name")
              .eq("id", row.voter_id)
              .maybeSingle(),
            supabase
              .from("skills")
              .select("title")
              .eq("id", row.skill_id)
              .maybeSingle(),
          ]);

          setItems((prev) =>
            [
              {
                id: `upvote-${row.skill_id}-${row.voter_id}-${Date.now()}`,
                type: "upvote" as const,
                message: `${person?.full_name ?? "Someone"} upvoted ${skill?.title ?? "a skill"}`,
                created_at: row.created_at,
              },
              ...prev,
            ].slice(0, 15),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="flex max-h-[32rem] flex-col border-t-4 border-orange bg-white lg:sticky lg:top-6">
      <div className="flex shrink-0 items-center justify-between border-b border-lt-gray px-4 py-3">
        <h2 className="font-display text-xl tracking-wide text-suede uppercase">
          Live activity
        </h2>
        <span className="flex items-center gap-2 text-xs tracking-wide text-md-gray uppercase">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orange" />
          </span>
          Realtime
        </span>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-md-gray">
          Quiet for now. The first ship lights this up — go be first.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-lt-gray overflow-y-auto">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 px-4 py-3 animate-ticker-in"
            >
              <p className="text-sm text-dk-gray">
                <span className="mr-2" aria-hidden>
                  {item.type === "ship" ? "🚀" : "▲"}
                </span>
                {item.message}
              </p>
              <time className="shrink-0 text-xs text-lt-suede">
                {formatRelativeTime(item.created_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
