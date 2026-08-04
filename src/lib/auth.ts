import { redirect } from "next/navigation";
import { WORKSPACE_DOMAIN } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Person } from "@/lib/types";

export function isWorkspaceEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(`@${WORKSPACE_DOMAIN.toLowerCase()}`);
}

export async function getSessionUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Link the signed-in auth user to a pre-seeded people row, or bail out. */
export async function requireLinkedPerson(): Promise<Person> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  if (!isWorkspaceEmail(user.email)) {
    await supabase.auth.signOut();
    redirect(`/login?error=domain`);
  }

  const { data: person, error } = await supabase
    .from("people")
    .select("*")
    .ilike("email", user.email)
    .maybeSingle();

  if (error) {
    console.error("people lookup failed", error);
    redirect("/not-on-roster");
  }

  if (!person) {
    redirect("/not-on-roster");
  }

  if (person.auth_user_id !== user.id) {
    const { data: linked, error: linkError } = await supabase
      .from("people")
      .update({
        auth_user_id: user.id,
        avatar_url: person.avatar_url || user.user_metadata?.avatar_url || null,
      })
      .eq("id", person.id)
      .select("*")
      .single();

    if (linkError || !linked) {
      console.error("people link failed", linkError);
      redirect("/not-on-roster");
    }

    return linked as Person;
  }

  return person as Person;
}
