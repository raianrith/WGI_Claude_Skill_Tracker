"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function UpvoteButton({
  skillId,
  voterId,
  creatorId,
  initialCount,
  initiallyVoted,
}: {
  skillId: string;
  voterId: string;
  creatorId: string;
  initialCount: number;
  initiallyVoted: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initiallyVoted);
  const [bounce, setBounce] = useState(false);
  const [pending, startTransition] = useTransition();
  const isOwn = voterId === creatorId;

  function handleClick() {
    if (isOwn || voted || pending) return;

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("skill_upvotes").insert({
        skill_id: skillId,
        voter_id: voterId,
      });

      if (error) {
        if (error.code === "23505") {
          setVoted(true);
        }
        return;
      }

      setVoted(true);
      setCount((c) => c + 1);
      setBounce(true);
      setTimeout(() => setBounce(false), 350);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isOwn || voted || pending}
      title={
        isOwn
          ? "Can't upvote your own skill — humble."
          : voted
            ? "Already counted"
            : "Upvote this"
      }
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-sm transition-colors ${
        voted
          ? "border-orange bg-orange text-white"
          : isOwn
            ? "cursor-not-allowed border-lt-suede/40 text-lt-suede"
            : "border-lt-suede text-dk-gray hover:border-orange hover:text-orange"
      } ${bounce ? "animate-upvote-bounce" : ""}`}
    >
      <span aria-hidden>▲</span>
      <span className="font-semibold tabular-nums">{count}</span>
    </button>
  );
}
