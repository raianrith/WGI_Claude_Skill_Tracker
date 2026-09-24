"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ProfilePhotoButton } from "@/components/ProfilePhotoButton";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/library", label: "Library" },
  { href: "/submit", label: "Ship a skill" },
  { href: "/leaderboard", label: "Crowd favorites" },
  { href: "/vote", label: "Vote", highlight: true },
  { href: "/awards", label: "Awards" },
];

export function AppShell({
  children,
  person,
}: {
  children: React.ReactNode;
  person: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    auth_user_id: string | null;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-lt-suede/40 bg-suede text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="group">
            <p className="font-display text-xs tracking-[0.2em] text-lt-suede uppercase">
              Weidert Group
            </p>
            <h1 className="font-display text-3xl tracking-wide text-white uppercase transition-colors group-hover:text-orange">
              Skill Tracker
            </h1>
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            {LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              const highlight = "highlight" in link && link.highlight && !active;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 font-display text-sm tracking-wider uppercase transition-colors ${
                    active
                      ? "bg-orange text-white"
                      : highlight
                        ? "bg-orange/20 text-orange ring-1 ring-orange/60 hover:bg-orange hover:text-white"
                        : "text-lt-gray hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            {person.auth_user_id && (
              <ProfilePhotoButton
                personId={person.id}
                personName={person.full_name}
                avatarUrl={person.avatar_url}
                authUserId={person.auth_user_id}
              />
            )}
            <span className="hidden text-lt-suede sm:inline">
              Hey,{" "}
              <span className="text-white">{person.full_name.split(" ")[0]}</span>
            </span>
            <button
              type="button"
              onClick={signOut}
              className="border border-lt-suede/50 px-3 py-1.5 text-xs tracking-wide text-lt-gray uppercase transition-colors hover:border-orange hover:text-orange"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
