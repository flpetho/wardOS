import { AdminConsole } from "@/components/admin-console";
import { leadershipRoles, wardOrganizations, workspace } from "@/lib/data";

export default function AdminPage() {
  return (
    <AdminConsole
      workspace={workspace}
      leadershipRoles={leadershipRoles}
      organizations={wardOrganizations}
    />
  );
}
