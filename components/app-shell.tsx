"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ClipboardList,
  Crown,
  DollarSign,
  HandHeart,
  Home,
  LinkIcon,
  Megaphone,
  NotebookTabs,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import {
  leadershipRoles,
  workspace,
  assignments,
  lessons,
  serviceOpportunities,
  cleaningAssignments,
  agendaItems,
  signupForms,
  sundayProgram,
} from "@/lib/data";

type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
};

const leadershipIcons = {
  eqp: Crown,
  eq1: Users,
  eq2: Users,
  eqs: ClipboardList,
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Command",
    items: [{ href: "/dashboard", label: "Dashboard", icon: Home }],
  },
  {
    label: "EQ Leadership",
    items: leadershipRoles.map((role) => ({
      href: `/leadership/${role.id}`,
      label: role.person,
      description: role.calling,
      icon: leadershipIcons[role.id],
    })),
  },
  {
    label: "Work Areas",
    items: [
      { href: "/meetings", label: "Meetings", icon: NotebookTabs },
      { href: "/lessons", label: "Lessons", icon: CalendarDays },
      { href: "/service", label: "Service", icon: HandHeart },
      { href: "/cleaning", label: "Cleaning", icon: Sparkles },
      { href: "/budget", label: "Budget", icon: DollarSign },
      { href: "/program", label: "Program", icon: Megaphone },
      { href: "/signups", label: "Signups", icon: Users },
      { href: "/sources", label: "Sources", icon: LinkIcon },
    ],
  },
];

function getBadgeCount(href: string): number | null {
  // Leadership Roles
  if (href.startsWith("/leadership/")) {
    const roleId = href.split("/").pop();
    const activeAssignments = assignments.filter(
      (a) => a.ownerRole === roleId && a.status !== "Completed" && a.status !== "Archived"
    );
    return activeAssignments.length > 0 ? activeAssignments.length : null;
  }

  // Work Areas
  switch (href) {
    case "/meetings":
      const activeAgenda = agendaItems.filter(
        (item) => item.status === "On agenda" || item.status === "Carried over"
      );
      return activeAgenda.length > 0 ? activeAgenda.length : null;
    
    case "/lessons":
      const incompleteLessons = lessons.filter(
        (l) =>
          l.status === "Needs teacher" ||
          l.topic.toLowerCase().includes("needs") ||
          l.teacher.toLowerCase().includes("needs")
      );
      return incompleteLessons.length > 0 ? incompleteLessons.length : null;

    case "/service":
      const activeService = serviceOpportunities.filter(
        (o) => o.status === "Open" || o.status === "Draft"
      );
      return activeService.length > 0 ? activeService.length : null;

    case "/cleaning":
      const incompleteCleaning = cleaningAssignments.filter(
        (c) => c.status === "Needs families" || c.status === "Partially filled"
      );
      return incompleteCleaning.length > 0 ? incompleteCleaning.length : null;

    case "/signups":
      const openSignups = signupForms.filter((f) => f.status === "Open");
      return openSignups.length > 0 ? openSignups.length : null;

    case "/program":
      return sundayProgram.status !== "Published" ? 1 : null;

    default:
      return null;
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const mobileNavItems = navGroups
    .flatMap((group) => group.items)
    .concat([{ href: "/admin", label: "Admin", description: "Ward settings", icon: Settings }]);

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
        <nav className="mt-8 flex flex-col gap-5">
          {navGroups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-3 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                {group.label}
              </p>
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} badge={getBadgeCount(item.href)} />
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <NavLink
            item={{
              href: "/admin",
              label: "Admin",
              description: "Ward settings",
              icon: Settings,
            }}
            badge={getBadgeCount("/admin")}
          />
          <div className="rounded-lg border bg-background p-3 text-sm">
            <p className="font-medium">Local prototype</p>
            <p className="mt-1 text-muted-foreground">
              Seeded data now. Clerk and Supabase are wired by env when ready.
            </p>
          </div>
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
            {mobileNavItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              const badge = getBadgeCount(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="flex items-center gap-1.5 leading-tight">
                    <span>{item.label}</span>
                    {badge !== null && (
                      <span
                        className={cn(
                          "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({
  item,
  badge,
}: {
  item: NavItem;
  badge: number | null;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-primary text-primary-foreground font-semibold shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate">{item.label}</span>
        {item.description ? (
          <span
            className={cn(
              "truncate text-xs font-normal",
              isActive ? "text-primary-foreground/80" : "text-muted-foreground"
            )}
          >
            {item.description}
          </span>
        ) : null}
      </span>
      {badge !== null && (
        <span
          className={cn(
            "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold transition-colors",
            isActive
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/10 group-hover:text-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
