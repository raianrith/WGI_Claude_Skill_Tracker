import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NotOnRosterPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="absolute inset-0 bg-suede" />
      <div className="relative max-w-lg border-t-4 border-orange bg-white px-8 py-10">
        <p className="font-display text-sm tracking-[0.2em] text-antique uppercase">
          Almost there
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-suede uppercase">
          You&apos;re not on the roster yet
        </h1>
        <p className="mt-4 text-md-gray">
          {user?.email ? (
            <>
              We see <strong className="text-dk-gray">{user.email}</strong>, but
              that address isn&apos;t in the people table yet.
            </>
          ) : (
            <>Your Google account isn&apos;t linked to a roster row yet.</>
          )}{" "}
          Ping <strong className="text-dk-gray">Raian</strong> and we&apos;ll
          get you added.
        </p>
        <form action="/auth/signout" method="post" className="mt-8">
          <button
            type="submit"
            className="bg-orange px-4 py-3 font-display tracking-wider text-white uppercase"
          >
            Sign out and try another account
          </button>
        </form>
        <p className="mt-4 text-xs text-lt-suede">
          Or{" "}
          <Link href="/login" className="underline hover:text-orange">
            back to login
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
