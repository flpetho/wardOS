# STATE

Where wardOS actually stands. Read this first, every session.

**Last updated:** 2026-08-11

---

## Phase

**Prototype → first real deployment.** The app is a complete clickable prototype with no persistence and no authentication. The goal is a version the owner's Elders Quorum presidency can use for one full Sunday cycle.

Working today: 17 routes render, `pnpm build` and `pnpm typecheck` pass clean, the structure and route groups are sound.

Not working today: nothing persists, nobody signs in, every "Add / Publish / Start meeting / New form" button is inert, and `lib/supabase.ts` is dead code that nothing imports.

---

## In flight

- **Visual redesign — design system landed, not yet documented.** Two rounds of alternative visual worlds were rolled and declined; the owner took the category standard on 2026-08-11. Pinned decisions are recorded in `PRODUCT.md` under Brand Commitments: DM Sans, white field, near-black type, cobalt `#1D4ED8`, Notion as the craft reference.

  Rebuilt: `app/globals.css` (full token system), `app/layout.tsx`, all six `components/ui/` primitives, `status-badge`, `page-heading`, `app-shell` (including a real mobile drawer, replacing the horizontal pill scroller), `dashboard-calendar`, `dashboard-operations`, and the dashboard page. Other pages inherit the new primitives and improved without edits.

  Verified: typecheck and build pass, mechanical design detector returns clean, no horizontal overflow at 390px (`documentElement.scrollWidth` = 390, zero offending elements).

  **Still open:** `DESIGN.md` has not been written, and the formal finish review has not been run. The direction contract in `app/layout.tsx` is not discharged until both are done.

---

- **Temple rail (Gilbert Arizona Temple)** — added 2026-08-11 as a **persistent** right rail, not a dashboard section. It lives in `app/(app)/layout.tsx`, passed to `AppShell` as the `aside` prop, so it appears on every internal route.

  - **Desktop (`xl` / 1280px and up):** fixed full-height rail on the right, 300px, independently scrollable.
  - **Below `xl`:** rendered at the bottom of the mobile navigation drawer, so it stays reachable from any route rather than disappearing. Verified by opening the drawer under device emulation.
  - **Layout cost:** with a 260px left sidebar and a 300px right rail, content is 560px narrower. At 1280px that leaves ~640px of content, which is the tightest the calendar month grid gets. Watch this if more chrome is ever added.

  **Photo** is `img/gilbert-az-temple.png` (owner-supplied, 2164×1507), wired as a **static import** rather than a `/public` path so `next/image` gets real dimensions at build and serves resized modern-format variants plus a blur placeholder. Note the source file is 4.6 MB and is committed to git history as-is.

  Two things still deliberately open:
  - **Closures are empty on purpose.** No verifiable source published them, and inventing closure dates would send someone to a closed temple.
  - **Hours are not authoritative.** Taken from public third-party listings, shown with a visible `hoursVerified` date and a link to the official page. Nothing syncs, and editing these from Admin is not built.

  Not yet in the Supabase schema — needs a `temple_info` table (and a decision on whether the quorum temple night belongs there or in a general events table) when persistence is wired.

## Next up

Ordered by the core model agreed 2026-08-11. Read [`docs/plans/2026-08-11-mental-model-design.md`](docs/plans/2026-08-11-mental-model-design.md) before starting any of these.

1. **Schema + types rewrite.** `seats`, `memberships`, `commitments` (merging `assignments` + `agenda_items`), `commitment_appearances`. Free now because nothing is persisted; expensive once it is. Folds in defects 13 and 14.
2. **Clerk + memberships.** Identity only — Clerk never holds callings. Person → Membership → Seat → Workspace, with workspace switching for the high councilor. Closes defect 1.
3. **Emphasis on the shared dashboard.** Everyone sees everything; the signed-in seat's work renders loud and the rest quiet. No access control inside a workspace.
4. **Meeting Mode.** The highest-value flow in the PRD (§12 Flow 3) and still entirely unbuilt. Self-building agenda, four-column board, decisions recorded.
5. **Roll the design system across the remaining twelve pages.** They inherited tokens and primitives but keep their original layouts; dates are still raw ISO outside the dashboard.
6. **Persistence (Supabase) and deploy (Vercel).** Not before auth exists.
7. **Reconcile the real Google Sheet.** Deferred by the owner 2026-08-11. Accepted risk: rework when real columns arrive.

Clerk is deliberately step 2, not step 1 — the schema has to know what a Membership is before auth has anything to attach to.

---

## Decision log

| Date | Decision |
|---|---|
| 2026-08-11 | **Multi-tenant data model, single ward in production.** Workspaces and members are built into schema and auth from day one; only one workspace exists during testing. Adding another presidency later must be configuration, not a rewrite. (Answers `prd` §24 Q1.) |
| 2026-08-11 | **Device agnostic is a hard requirement.** All four usage scenes confirmed equally real: phone at church Sunday, phone during the week, laptop in the bi-monthly presidency meeting, laptop for weekly prep. Neither breakpoint is the "real" design. |
| 2026-08-11 | **Google Sheet reconciliation deferred.** Continue on seed data; accept some schema rework later. |
| 2026-08-11 | **Committed infrastructure:** Supabase Postgres, Clerk (Google sign-in), Vercel. |
| 2026-08-11 | **Test with the owner's own EQ presidency first,** then pitch to other presidencies in the same ward. |
| 2026-08-11 | **The spine is the commitment loop.** Meeting decides, Sunday delivers, Commitments thread between. Work areas become sources of work, not co-equal domains. |
| 2026-08-11 | **Domain records are the system of record; gaps are derived and never stored.** Kills the four-copies-of-one-fact problem. |
| 2026-08-11 | **Work belongs to the seat, not the person.** Release transfers the queue automatically. |
| 2026-08-11 | **Everyone in a workspace sees everything;** relevance is visual emphasis, not access control. |
| 2026-08-11 | **Five seats, not four** — the stake high councilor joins as a `liaison`-type seat with Participant (non-administering) rights. A person may hold seats in multiple workspaces. |
| 2026-08-11 | **Assignment + AgendaItem merge into one `Commitment`** with lifecycle proposed → on agenda → committed → done. "Carried over" becomes derived, yielding a carry-over count. |
| 2026-08-11 | **Kanban belongs in Meeting Mode only,** where the lifecycle states are the columns. The dashboard stays a list. |
| 2026-08-11 | **Secretary holds full Steward rights,** including publishing the Sunday program. |
| 2026-08-11 | **The high councilor cannot see the quorum budget.** The one area-level exclusion, and an amendment to "everyone sees everything" — which now holds *within the Steward tier*. Visibility is tier-scoped and per-area, never per-record. |
| 2026-08-11 | **Gap vs. free-standing Commitment test:** is there a record with a checkable condition? If not, it is a Commitment closed by hand. See the design doc for the classification of all current seed items. |

---

## Known defects

Found in the 2026-08-11 review. All verified by running the app, not inferred. None are fixed yet.

### Blocking deployment

1. **No authentication whatsoever.** `proxy.ts:12-17` — both branches return `NextResponse.next()`. `/admin` and `/dashboard` return HTTP 200 with no credentials. Do not deploy until this is closed.
2. **Public program page ignores ward slug and publish status.** `app/(public)/p/[wardSlug]/program/page.tsx:13` — `isCurrentWard` only swaps a badge; content renders for any slug. Verified: `/p/not-a-real-ward/program` returns the full program. No check on `status`, so a Draft program would be publicly visible. Violates `prd` §14.7.
3. **Signup form does not gate on status.** `getSignupForm` ignores `status === "Open"`, so a closed form still renders and accepts submissions.

### Correctness

4. ~~**DM Sans is downloaded but never applied.**~~ **Fixed 2026-08-11.** The next/font variable is now `--font-dm-sans`, so it no longer collides with the `--font-sans` declaration in `globals.css`. The app renders in DM Sans.
5. **Build-time dates on statically prerendered pages.** **Partially fixed 2026-08-11** — `dashboard-calendar` now resolves "today" in a `useEffect` (client-only, no mismatch), and the dashboard's "Needs attention" list is derived from status rather than from the clock. **Still open:** `components/dashboard-operations.tsx` `isOverdue()` still calls `new Date()` during render on a static route.
6. ~~**Calendar opens on a hardcoded July 2026.**~~ **Fixed 2026-08-11.** The opening month is now derived from the first event in the data. Note this is deliberately not "the current month" — that needs a client-side date, and with all seed data in July an August default would render an empty calendar.
7. **Nav badges don't react to edits.** `components/app-shell.tsx:75` reads module arrays directly while `DashboardOperations` holds edits in local state. Marking an assignment complete doesn't move the count. Lessons badge also string-matches on `"needs"` (`app-shell.tsx:96-98`).
8. **Admin "Save local changes" is misleading.** `components/admin-console.tsx:49` writes to localStorage that nothing reads. `JSON.parse` at line 44 has no try/catch — a corrupt entry white-screens the page.
9. ~~**`data-icon` attribute is used 22 times with no CSS behind it.**~~ **Fixed 2026-08-11.** `globals.css` now implements `[data-icon]` (1rem box, no shrink, optical inline spacing), so the existing 22 call sites work as intended instead of rendering at lucide's 24px default.
10. **Seed data contradicts itself.** `lib/data.ts:215-217` — service-1 has `owner: "Second Counselor"` with `ownerRole: "eq1"` (First Counselor); service-2 says `"EQ Secretary"` with `ownerRole: "eq1"`.

### Tooling and schema

11. **`pnpm lint` is broken.** `next lint` was removed in Next 16; it now reads "lint" as a directory path.
12. **Every dependency is pinned to `"latest"`** in `package.json`. The lockfile protects today; any `pnpm update` can jump majors silently.
13. **Status vocabularies disagree** between database and app. Migration uses `'published'` / `'on_agenda'`; `lib/types.ts` uses `"Published"` / `"On agenda"`. Needs a mapping layer or one side changes — resolve before wiring Supabase.
14. **`service_opportunities` and `cleaning_assignments` have no `signup_form_id` column** in the migration, though the app links by it and `prd` §20 lists it.
15. **RLS is enabled on every table with only public policies.** Once wired, nothing internal is readable via the anon key until authenticated policies exist.
16. **`createServiceSupabaseClient` uses the service-role key and bypasses RLS.** Harmless while unused; a full data leak if it ever reaches a client component or an unauthenticated route.
17. **No tests and no test framework.**
18. **`prd` has no file extension.** It is markdown; `prd.md` would render on GitHub.

---

## Notes

- `.agents/AGENTS.md` predates this system and has known drift (it documents `/leadership/[id]`; the route is `[role]`). Superseded by `CLAUDE.md` + this file. Recommend deleting once the owner confirms nothing there is still wanted.
- Port 3000 is often occupied on the owner's machine; dev commonly lands on 3001.
