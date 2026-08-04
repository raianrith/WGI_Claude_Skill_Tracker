import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import { WORKSPACE_DOMAIN } from "@/lib/constants";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getSessionUser();
  if (user) redirect("/");

  const domainError = searchParams.error === "domain";

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #112721 0%, #1a3a32 45%, #272727 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,103,0,0.35), transparent 40%), radial-gradient(circle at 80% 80%, rgba(168,106,64,0.3), transparent 35%)",
        }}
      />

      <div className="relative w-full max-w-lg border-t-4 border-orange bg-white px-8 py-10 shadow-xl">
        <p className="font-display text-sm tracking-[0.25em] text-antique uppercase">
          Weidert Group
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-wide text-suede uppercase">
          Skill Tracker
        </h1>
        <p className="mt-4 text-md-gray">
          Everyone builds three Claude Skills by October. Sign in with your
          Weidert Google account — no signup form, you&apos;re either on the
          roster or you ping Raian.
        </p>

        {domainError && (
          <p className="mt-4 border-l-4 border-orange bg-lt-gray px-3 py-2 text-sm text-dk-gray">
            That account isn&apos;t on the @{WORKSPACE_DOMAIN} workspace. Use
            your Weidert Google login.
          </p>
        )}

        <div className="mt-8">
          <LoginButton />
        </div>

        <p className="mt-6 text-xs text-lt-suede">
          Internal only. Friendly pressure. Ship something good.
        </p>
      </div>
    </div>
  );
}
