import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { UpvoteButton } from "@/components/UpvoteButton";
import type { SkillWithRelations } from "@/lib/types";

export function SkillCard({
  skill,
  viewerId,
  highlight = false,
}: {
  skill: SkillWithRelations;
  viewerId: string;
  highlight?: boolean;
}) {
  const isOwner = skill.creator_id === viewerId;

  return (
    <article
      id={`skill-${skill.id}`}
      className={`flex h-full flex-col border-t-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
        highlight ? "border-orange ring-1 ring-orange" : "border-antique"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <CategoryBadge category={skill.category} />
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link
              href={`/edit/${skill.id}`}
              className="border border-lt-suede px-2.5 py-1.5 text-xs tracking-wide text-md-gray uppercase transition-colors hover:border-orange hover:text-orange"
            >
              Edit
            </Link>
          )}
          <UpvoteButton
            skillId={skill.id}
            voterId={viewerId}
            creatorId={skill.creator_id}
            initialCount={skill.upvote_count}
            initiallyVoted={skill.viewer_has_upvoted}
          />
        </div>
      </div>

      <h3 className="mt-3 font-display text-2xl tracking-wide text-suede uppercase">
        {skill.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-md-gray">
        {skill.description}
      </p>

      {(skill.time_saved || skill.fun_fact || skill.output_url) && (
        <div className="mt-4 space-y-1 border-t border-lt-gray pt-3 text-xs text-md-gray">
          {skill.output_url && (
            <p>
              <span className="font-semibold text-antique">Output: </span>
              <a
                href={skill.output_url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-orange underline decoration-orange/40 underline-offset-2 hover:decoration-orange"
              >
                Open link
              </a>
            </p>
          )}
          {skill.time_saved && (
            <p>
              <span className="font-semibold text-antique">Time saved: </span>
              {skill.time_saved}
            </p>
          )}
          {skill.fun_fact && (
            <p>
              <span className="font-semibold text-antique">Fun fact: </span>
              {skill.fun_fact}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-lt-gray pt-3">
        <Avatar
          name={skill.creator.full_name}
          url={skill.creator.avatar_url}
          size="sm"
        />
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-dk-gray">{skill.creator.full_name}</p>
          {skill.collaborators.length > 0 && (
            <p className="truncate text-xs text-md-gray">
              with {skill.collaborators.map((c) => c.full_name).join(", ")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
