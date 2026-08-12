import { AdminConsole } from "@/components/admin-console";
import { getSeatsWithHolders, wardOrganizations, workspace } from "@/lib/data";

export default function AdminPage() {
  return (
    <AdminConsole
      workspace={workspace}
      seats={getSeatsWithHolders()}
      organizations={wardOrganizations}
    />
  );
}
