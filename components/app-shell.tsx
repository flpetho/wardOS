import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  HandHeart,
  Home,
  LinkIcon,
  Megaphone,
  Sparkles,
  Users,
} from "lucide-react";
import { workspace } from "@/lib/data";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/lessons", label: "Lessons", icon: CalendarDays },
  { href: "/service", label: "Service", icon: HandHeart },
  { href: "/cleaning", label: "Cleaning", icon: Sparkles },
  { href: "/program", label: "Program", icon: Megaphone },
  { href: "/signups", label: "Signups", icon: Users },
  { href: "/sources", label: "Sources", icon: LinkIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card px-4 py-5 lg:flex lg:flex-col">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ClipboardList />
          </div>
          <div>
            <p className="text-lg font-semibold">wardOS</p>
            <p className="text-sm text-muted-foreground">{workspace.name}</p>
          </div>
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <item.icon />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-lg border bg-background p-3 text-sm">
          <p className="font-medium">Local prototype</p>
          <p className="mt-1 text-muted-foreground">
            Seeded data now. Clerk and Supabase are wired by env when ready.
          </p>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="font-semibold">
              wardOS
            </Link>
            <Link href="/p/oak-hills/program" className="text-sm text-muted-foreground">
              Public program
            </Link>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm"
              >
                <item.icon />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
