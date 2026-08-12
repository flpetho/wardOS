import { AppShell } from "@/components/app-shell";
import { TemplePanel } from "@/components/temple-panel";

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return <AppShell aside={<TemplePanel />}>{children}</AppShell>;
}
