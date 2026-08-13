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
  LogOut,
  Megaphone,
  Menu,
  NotebookTabs,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { IconKey, NavGroup, NavItem } from "@/lib/nav";

/*
  Presentational only. Everything it renders is decided on the server in
  lib/nav.ts and handed down as props -- which seats exist, which areas this
  seat may reach, and every badge count.

  It used to build its own nav at module scope by importing the seed data. That
  could not survive seats moving to Postgres, and it was also the root cause of
  known defect 7: module-level counts cannot react to anything.
*/

/**
 * Icons cross the server/client boundary as string keys, because a function is
 * not serializable. This is where they become components again.
 */
const icons: Record<IconKey, React.ComponentType<{ className?: string }>> = {
  dashboard: Home,
  president: Crown,
  counselor: Users,
  secretary: ClipboardList,
  liaison: Landmark,
  meetings: NotebookTabs,
  lessons: CalendarDays,
  service: HandHeart,
  cleaning: Sparkles,
  budget: DollarSign,
  program: Megaphone,
  signups: Users,
  sources: LinkIcon,
  admin: Settings,
};

export type AppShellIdentity = {
  personName: string;
  seatTitle: string;
  /** The ward. Context, not identity — set quiet. */
  wardName: string;
  /** The organisation whose workspace this is. This is who you are here. */
  organizationName: string | null;
  workspaceSlug: string;
};

function isRouteActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  aside,
  nav,
  adminItem,
  identity,
}: {
  children: React.ReactNode;
  /** Persistent reference rail. Fixed to the right at xl, inside the drawer below it. */
  aside?: React.ReactNode;
  nav: NavGroup[];
  adminItem: NavItem | null;
  identity: AppShellIdentity;
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

  const sidebar = (
    <SidebarBody
      pathname={pathname}
      nav={nav}
      adminItem={adminItem}
      identity={identity}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col overflow-y-auto border-r border-border bg-surface lg:flex">
        {sidebar}
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
          {/* One line only — the ward is already implied on a phone at church. */}
          <Link
            href="/dashboard"
            className="min-w-0 truncate text-[15px] font-semibold tracking-[-0.01em]"
          >
            {identity.organizationName ?? identity.wardName}
          </Link>
        </div>
        <Link
          href={`/p/${identity.workspaceSlug}/program`}
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
            {sidebar}
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

function SidebarBody({
  pathname,
  nav,
  adminItem,
  identity,
}: {
  pathname: string | null;
  nav: NavGroup[];
  adminItem: NavItem | null;
  identity: AppShellIdentity;
}) {
  return (
    <>
      {/*
        Ward above, organisation below — address order, narrowing from where you
        are to which part of it you are in.

        No product mark and no product name. Once several organisations of a
        ward use wardOS, the useful question at the top of the sidebar is "whose
        workspace am I in", and "wardOS" answers a question nobody is asking.
        Removing it also retires the one licensed decorative use of cobalt, so
        the accent is now purely wayfinding.
      */}
      <Link
        href="/dashboard"
        className="block min-w-0 px-4 pb-3.5 pt-4 transition-opacity hover:opacity-80"
      >
        {identity.organizationName ? (
          <>
            <span className="block truncate text-[11.5px] leading-tight text-muted-foreground">
              {identity.wardName}
            </span>
            <span className="mt-0.5 block truncate text-[15px] font-semibold leading-tight tracking-[-0.01em]">
              {identity.organizationName}
            </span>
          </>
        ) : (
          <span className="block truncate text-[15px] font-semibold leading-tight tracking-[-0.01em]">
            {identity.wardName}
          </span>
        )}
      </Link>

      <nav className="flex flex-1 flex-col gap-6 px-2.5 pb-4">
        {nav.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {group.label}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isRouteActive(pathname, item.href)}
              />
            ))}
          </div>
        ))}
      </nav>

      {adminItem ? (
        <div className="border-t border-border px-2.5 py-3">
          <NavLink item={adminItem} active={isRouteActive(pathname, adminItem.href)} />
        </div>
      ) : null}

      {/*
        Who you are signed in as. Worth the space: work is owned by the seat, so
        the seat is the thing that decides what this session may do, and during
        testing one person signs in as several.
      */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-3">
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-medium">
            {identity.personName}
          </span>
          <span className="block truncate text-[11.5px] text-muted-foreground">
            {identity.seatTitle}
          </span>
        </span>
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut data-icon="" />
          </button>
        </form>
      </div>
    </>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = icons[item.icon];

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
      <Icon
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
      {item.badge !== null ? (
        <span
          data-numeric
          className={cn(
            "ml-auto shrink-0 text-[12px] font-medium",
            active ? "text-primary/80" : "text-muted-foreground",
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}
