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
  Landmark,
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
  workspace,
  getSeatsWithHolders,
  commitmentsForSeat,
  computeGaps,
  openCommitments,
} from "@/lib/data";
import type { SeatKey } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
};

const seatIcons: Record<SeatKey, React.ComponentType<{ className?: string }>> = {
  eqp: Crown,
  eq1: Users,
  eq2: Users,
  eqs: ClipboardList,
  hc: Landmark,
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Command",
    items: [{ href: "/dashboard", label: "Dashboard", icon: Home }],
  },
  {
    label: "EQ Leadership",
    items: getSeatsWithHolders().map((seat) => ({
      href: `/leadership/${seat.id}`,
      // The seat is permanent; the holder is whoever currently occupies it.
      label: seat.holder?.name ?? seat.title,
      description: seat.title,
      icon: seatIcons[seat.id],
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

/*
  Badge counts are derived from the model rather than from hand-written status
  string matching. A seat's badge is its open commitments; a work area's badge
  is the number of computed gaps in that area. Nothing here can disagree with
  the underlying records because nothing here stores anything.
*/
function getBadgeCount(href: string): number | null {
  if (href.startsWith("/leadership/")) {
    const seatId = href.split("/").pop() as SeatKey;
    const count = commitmentsForSeat(seatId).length;
    return count > 0 ? count : null;
  }

  if (href === "/meetings") {
    const count = openCommitments().filter(
      (item) => item.state === "on_agenda" || item.state === "proposed",
    ).length;
    return count > 0 ? count : null;
  }

  const areaForHref: Record<string, string> = {
    "/lessons": "lessons",
    "/service": "service",
    "/cleaning": "cleaning",
    "/signups": "signups",
    "/program": "program",
  };

  const area = areaForHref[href];
  if (!area) return null;

  const count = computeGaps().filter((gap) => gap.area === area).length;
  return count > 0 ? count : null;
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
