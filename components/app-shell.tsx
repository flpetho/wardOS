"use client";

import { useEffect, useState } from "react";
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
  Menu,
  NotebookTabs,
  Settings,
  Sparkles,
  Users,
  X,
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

const adminItem: NavItem = {
  href: "/admin",
  label: "Admin",
  description: "Ward settings",
  icon: Settings,
};

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

function isRouteActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  aside,
}: {
  children: React.ReactNode;
  /** Persistent reference rail. Fixed to the right at xl, inside the drawer below it. */
  aside?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col overflow-y-auto border-r border-border bg-surface lg:flex">
        <SidebarBody pathname={pathname} />
      </aside>

      {aside ? (
        <aside
          aria-label="Temple"
          className="fixed bottom-4 right-4 top-4 z-20 hidden w-[300px] overflow-y-auto rounded-xl border border-border bg-card shadow-subtle xl:block"
        >
          {aside}
        </aside>
      ) : null}

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            className="-ml-1.5 inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <Menu data-icon="" />
          </button>
          <Link href="/dashboard" className="text-[15px] font-semibold tracking-[-0.01em]">
            wardOS
          </Link>
        </div>
        <Link
          href={`/p/${workspace.slug}/program`}
          className="text-[13px] font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Public program
        </Link>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-foreground/20 backdrop-blur-[2px]"
          />
          <div className="animate-[content-enter_240ms_cubic-bezier(0.16,1,0.3,1)_both] absolute inset-y-0 left-0 flex w-[286px] max-w-[86vw] flex-col overflow-y-auto border-r border-border bg-surface shadow-raised">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-3.5 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X data-icon="" />
            </button>
            <SidebarBody pathname={pathname} />
            {aside ? (
              <div className="border-t border-border bg-background">{aside}</div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Right padding clears the floating rail: 300px card + 16px edge inset + 16px gutter. */}
      <div className="lg:pl-[260px] xl:pr-[332px]">
        <main className="content-enter mx-auto flex w-full max-w-[1120px] flex-col gap-9 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarBody({ pathname }: { pathname: string | null }) {
  return (
    <>
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 px-4 py-4 transition-opacity hover:opacity-80"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ClipboardList data-icon="" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold leading-tight tracking-[-0.01em]">
            wardOS
          </span>
          <span className="block truncate text-[12px] leading-tight text-muted-foreground">
            {workspace.name}
          </span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-6 px-2.5 pb-4">
        {navGroups.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isRouteActive(pathname, item.href)}
                badge={getBadgeCount(item.href)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-2.5 py-3">
        <NavLink
          item={adminItem}
          active={isRouteActive(pathname, adminItem.href)}
          badge={getBadgeCount(adminItem.href)}
        />
      </div>
    </>
  );
}

function NavLink({
  item,
  active,
  badge,
}: {
  item: NavItem;
  active: boolean;
  badge: number | null;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[14px] transition-colors duration-150",
        active
          ? "bg-primary-soft font-medium text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <item.icon
        data-icon=""
        className={cn(active ? "text-primary" : "text-subtle-foreground group-hover:text-muted-foreground")}
      />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate">{item.label}</span>
        {item.description ? (
          <span
            className={cn(
              "truncate text-[11.5px] font-normal",
              active ? "text-primary/75" : "text-muted-foreground",
            )}
          >
            {item.description}
          </span>
        ) : null}
      </span>
      {badge !== null ? (
        <span
          data-numeric
          className={cn(
            "ml-auto shrink-0 text-[12px] font-medium",
            active ? "text-primary/80" : "text-muted-foreground",
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
