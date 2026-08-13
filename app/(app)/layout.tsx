import { AppShell } from "@/components/app-shell";
import { NoAccess } from "@/components/no-access";
import { TemplePanel } from "@/components/temple-panel";
import { getActiveSession, getSeatsWithHolders } from "@/lib/identity";
import { buildNav } from "@/lib/nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/*
  The inner gate.

  proxy.ts has already established that someone is signed in. This is where the
  guest list is checked: a session with no current membership gets the no-access
  page and nothing else. Rendered in place rather than redirected to, so there
  is no route that can bounce between the two.
*/

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getActiveSession();

  if (!session) {
    // Their address is worth showing -- if someone has two accounts, it is the
    // single most useful fact for working out why they cannot get in.
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return <NoAccess email={user?.email} />;
  }

  const seats = await getSeatsWithHolders();
  const { groups, adminItem } = buildNav(session, seats);

  return (
    <AppShell
      aside={<TemplePanel />}
      nav={groups}
      adminItem={adminItem}
      identity={{
        personName: session.person.name,
        seatTitle: session.seat.title,
        workspaceName: session.workspace.name,
        workspaceSlug: session.workspace.slug,
      }}
    >
      {children}
    </AppShell>
  );
}
