import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isLocale, type Locale } from "@/lib/i18n";
import { CreateClubForm } from "./CreateClubForm";

export default async function NewClubPage(
  props: PageProps<"/[locale]/clubs/new">,
) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${loc}/auth?next=/${loc}/clubs/new`);
  const sp = await props.searchParams as Record<string, string | string[] | undefined>;
  const kind = typeof sp.kind === "string" ? sp.kind : "club";
  return <CreateClubForm locale={loc} userId={user.id} kind={kind} />;
}
