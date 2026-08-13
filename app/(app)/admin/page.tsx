import { notFound } from "next/navigation";
import { AdminConsole } from "@/components/admin-console";
import { wardOrganizations, workspace } from "@/lib/data";
import { getActiveSession, getSeatsWithHolders, seatCanAccess } from "@/lib/identity";

export default async function AdminPage() {
  const session = await getActiveSession();

  // Hiding the nav item is presentation. This is the check that matters: a seat
  // without admin rights gets a 404 on direct navigation, not a rendered page.
  if (!session?.canAdminister || !seatCanAccess(session.seat, "admin")) {
    notFound();
  }

  return (
    <AdminConsole
      workspace={workspace}
      seats={await getSeatsWithHolders()}
      organizations={wardOrganizations}
    />
  );
}
