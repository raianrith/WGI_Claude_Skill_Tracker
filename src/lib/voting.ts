import type { AwardId } from "@/lib/awards";

/** Central time — Weidert HQ */
export const VOTING_TIMEZONE = "America/Chicago";

/** Mon Sept 28, 2026 · 8:00 AM CDT */
export const VOTING_OPENS_ISO = "2026-09-28T08:00:00-05:00";

/** Wed Sept 30, 2026 · 12:00 PM CDT */
export const VOTING_CLOSES_ISO = "2026-09-30T12:00:00-05:00";

export type BallotAwardId = Extract<
  AwardId,
  "unhinged" | "stolen-idea" | "client-crush" | "personal-fave" | "ops-hero"
>;

export const BALLOT_AWARD_COUNT = 5;

export type VotingStatus = "upcoming" | "open" | "closed";

export function getVotingStatus(now = new Date()): VotingStatus {
  const opens = new Date(VOTING_OPENS_ISO).getTime();
  const closes = new Date(VOTING_CLOSES_ISO).getTime();
  const t = now.getTime();
  if (t < opens) return "upcoming";
  if (t >= closes) return "closed";
  return "open";
}

export function formatVotingInstant(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: VOTING_TIMEZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function msUntil(iso: string, now = new Date()): number {
  return Math.max(0, new Date(iso).getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "0s";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}
