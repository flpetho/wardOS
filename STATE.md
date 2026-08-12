# STATE

Where wardOS actually stands. Read this first, every session.

**Last updated:** 2026-08-12

---

## Resume here

**All work lives on the branch `design-system-and-core-model`, 10 commits ahead of `main` and not merged.** `main` still holds the original pre-redesign prototype. The working tree is clean. Merging is a decision the owner has not made yet — do not merge without asking.

**The next task is Clerk authentication** (step 2 in Next up). The schema already defines `people`, `seats`, and `memberships`, so there is something for identity to attach to. Clerk owns identity only — it must never hold callings.

**Before touching anything, read [`docs/plans/2026-08-11-mental-model-design.md`](docs/plans/2026-08-11-mental-model-design.md).** The core model is not derivable from the code alone, and getting it wrong will produce work that has to be thrown away.

**There is still no authentication of any kind. Do not deploy.**

### Running and verifying

```bash
pnpm dev        # port 3000, sometimes 3001
pnpm typecheck  # must pass before any commit
pnpm build      # must pass before any commit
```

`pnpm lint` is broken and stays broken until defect 11 is fixed.

Key routes: `/dashboard`, `/meetings` (shows the model most clearly), `/leadership/hc` (the scoped liaison seat), `/p/oak-hills/program` (the public bulletin — view at phone width).

### External references

- **Figma — Ward Program bulletin.** File key `DGbXfeBGOuRcNxJ5TvVDzD`, order-of-service node `1:17`, masthead node `1:11`. Reachable through the Figma MCP server, which is configured at **user scope** and already authenticated. The frame holds three variants at identical coordinates and renders blank above ~1,400px; the December 15 variant was treated as canonical. **This was never confirmed with the owner.**
- The bulletin's source typeface is Aktiv Grotesk; the owner chose DM Sans instead. Do not reopen this.

### Questions the owner has not answered

1. Is the December 15 Figma variant the right one?
2. Should the bulletin's two header icons be the exported Figma vectors rather than the lucide substitutes currently in place?
3. Delete `.agents/AGENTS.md`? It is now actively wrong, not merely stale.
4. **Personal commitments.** `held_by_person_id` exists in the schema and one seeded commitment uses it, but the release flow that would surface *"Ferenc personally held 2 items — still valid for his successor?"* is **not built**. The column is inert until it is.

---

## Phase

**Prototype → first real deployment.** The app is a complete clickable prototype with no persistence and no authentication. The goal is a version the owner's Elders Quorum presidency can use for one full Sunday cycle.

Working today: 17 routes render, `pnpm build` and `pnpm typecheck` pass clean, the structure and route groups are sound.

Not working today: nothing persists, nobody signs in, every "Add / Publish / Start meeting / New form" button is inert, and `lib/supabase.ts` is dead code that nothing imports.

---

## Landed 2026-08-11 → 2026-08-12

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

- **Schema and types rewritten to the core model — done 2026-08-11.**

  `supabase/migrations/202607060001_initial_schema.sql` was rewritten in place (it had never been applied anywhere) and **verified against a real Postgres 16**: it applies cleanly, and six constraint tests confirmed the model is enforced rather than merely described — invalid seat area rejected, two concurrent holders of one seat rejected, succession accepted, `committed` without an owner or due date rejected, orphaned `source_type` rejected, and a valid personally-held commitment accepted.

  Landed: `seats` (with `areas` scope and `can_administer`), `memberships` (dated, one current holder enforced by a partial unique index), `commitments` (merging `assignments` and `agenda_items`, with `held_by_person_id` and `source_type`/`source_id`), `commitment_appearances`, `temple_info`, `temple_closures`, and `meeting_attendees`. `users` became `people`, since Clerk owns identity.

  Gaps have **no table** and are computed in `lib/data.ts:computeGaps()`. Two former agenda items disappeared entirely because they were duplicates of computable gaps.

  All twelve consumer files were updated. Typecheck and build pass; every route returns 200.

- **Public Sunday bulletin — built 2026-08-12** from the owner's `Ward-Program` Figma file (`DGbXfeBGOuRcNxJ5TvVDzD`, node `1:17`), read via the Figma MCP server.

  This is the only surface in wardOS that is **Read** mode rather than Operate, so it deliberately carries its own typographic identity instead of the dashboard's. That does not contradict the brand commitment in `PRODUCT.md`, which was chosen for the app.

  Design language taken from the source: a single warm-olive ink `#404231` at two weights (the apparent lightness of values is *weight*, not colour), 13px rows at −0.03em, 16px Medium sub-headings, a signature two-part rule (short heavy dash, long hairline), and a 393px phone-first frame.

  **Typeface substituted:** the source is set in Aktiv Grotesk; the owner chose to stay on DM Sans, whose 500/300 map onto Aktiv's Medium/Light.

  **The model had to grow**, because a flat field set cannot express a running order. `SundayProgram` now carries `chorister`, `organist`, hymns as `{ number, title }` (they are set in different weights), a `speakingOrder` list that interleaves speakers, hymns, and musical numbers, and structured `announcements` with optional links. Standing ward info moved to `wardMeetingInfo`.

  **Known deviations from the source:**
  - The two 24×24 icons are lucide `Clock`/`Radio`, **not** the exported Figma vectors.
  - Hero artwork is the existing Gilbert Temple photo, reusing the same import as the temple rail rather than adding a second copy of a 4.6MB file. The source design used seasonal imagery; this is a stand-in the workspace actually owns. It is landscape and the slot is portrait, so `object-cover` keeps full height and crops the sides — the default centre crop keeps the spire and facade, no `object-position` tuning needed. Setting `heroImage: null` falls back to a marked placeholder at the same ratio.
  - No print stylesheet. "Bulletin" implies paper, but printing was never confirmed as a requirement.
  - The source Figma frame contains three variants at identical coordinates and renders blank above ~1,400px; the December 15 variant was used as canonical.

## Next up

Ordered by the core model agreed 2026-08-11. Read [`docs/plans/2026-08-11-mental-model-design.md`](docs/plans/2026-08-11-mental-model-design.md) before starting any of these.

1. ~~**Schema + types rewrite.**~~ **Done 2026-08-11.** See In flight above.
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
| 2026-08-12 | **Stay on DM Sans.** The source bulletin design is set in Aktiv Grotesk, which is available to the owner through his existing Creative Cloud subscription via Adobe Fonts. He chose DM Sans anyway. Note the tradeoff that decided nothing here: Adobe Fonts webfonts must be served from `use.typekit.net` and cannot be self-hosted, so Aktiv would add an external runtime dependency to a tool used on chapel wifi. DM Sans self-hosts through `next/font` with zero external requests. |
| 2026-08-12 | **Figma MCP added at user scope**, not project scope — project scope would write a `.mcp.json` into this repo and hand the server config to anyone cloning it. Figma's official plugin was skipped because the `claude-plugins-official` marketplace is not registered on this machine. |
| 2026-08-11 | **Gap vs. free-standing Commitment test:** is there a record with a checkable condition? If not, it is a Commitment closed by hand. See the design doc for the classification of all current seed items. |
| 2026-08-11 | **Seats carry an area scope, not a tier label.** Raised by the owner: ward callings outside the quorum (e.g. a Sunday program coordinator) will need access to one area only. The three tiers become configurations of one mechanism — a per-area capability matrix, never per-record rules. Built at schema time because retrofitting it after auth means touching every query. |
| 2026-08-11 | **Deferred:** whether the Sunday program, ward calendar, and building cleaning belong to a ward scope above organisation scope rather than to the Elders Quorum. Answers PRD §24 Q2. Not built; recorded so area-scoped seats do not block it. |

---

## Known defects

Found in the 2026-08-11 review. All verified by running the app, not inferred. None are fixed yet.

### Blocking deployment

1. **No authentication whatsoever.** `proxy.ts:12-17` — both branches return `NextResponse.next()`. `/admin` and `/dashboard` return HTTP 200 with no credentials. Do not deploy until this is closed.
2. ~~**Public program page ignores ward slug and publish status.**~~ **Fixed 2026-08-12.** A mismatched slug now returns 404 (verified: `/p/not-a-real-ward/program` → 404, `/p/oak-hills/program` → 200), and an unpublished program renders a "not published yet" notice instead of the content. Satisfies `prd` §14.7.
3. **Signup form does not gate on status.** `getSignupForm` ignores `status === "Open"`, so a closed form still renders and accepts submissions.

### Correctness

4. ~~**DM Sans is downloaded but never applied.**~~ **Fixed 2026-08-11.** The next/font variable is now `--font-dm-sans`, so it no longer collides with the `--font-sans` declaration in `globals.css`. The app renders in DM Sans.
5. ~~**Build-time dates on statically prerendered pages.**~~ **Fixed 2026-08-11.** Both `dashboard-calendar` and `dashboard-operations` now resolve "today" in a `useEffect`, so nothing compares against the clock during a prerendered render.
6. ~~**Calendar opens on a hardcoded July 2026.**~~ **Fixed 2026-08-11.** The opening month is now derived from the first event in the data. Note this is deliberately not "the current month" — that needs a client-side date, and with all seed data in July an August default would render an empty calendar.
7. **Nav badges don't react to edits.** `components/app-shell.tsx:75` reads module arrays directly while `DashboardOperations` holds edits in local state. Marking an assignment complete doesn't move the count. Lessons badge also string-matches on `"needs"` (`app-shell.tsx:96-98`).
8. **Admin "Save local changes" is misleading.** `components/admin-console.tsx:49` writes to localStorage that nothing reads. `JSON.parse` at line 44 has no try/catch — a corrupt entry white-screens the page.
9. ~~**`data-icon` attribute is used 22 times with no CSS behind it.**~~ **Fixed 2026-08-11.** `globals.css` now implements `[data-icon]` (1rem box, no shrink, optical inline spacing), so the existing 22 call sites work as intended instead of rendering at lucide's 24px default.
10. ~~**Seed data contradicts itself.**~~ **Fixed 2026-08-11.** Service opportunities carried both a free-text `owner` and a conflicting `ownerRole`. There is now a single `seatId`, and the person is resolved from the membership, so the two cannot disagree.

### Tooling and schema

11. **`pnpm lint` is broken.** `next lint` was removed in Next 16; it now reads "lint" as a directory path.
12. **Every dependency is pinned to `"latest"`** in `package.json`. The lockfile protects today; any `pnpm update` can jump majors silently.
13. ~~**Status vocabularies disagree.**~~ **Fixed 2026-08-11.** TypeScript now uses the database's lowercase snake_case values exactly. `components/status-badge.tsx` is the single mapping point to display labels.
14. ~~**Missing `signup_form_id`.**~~ **Fixed 2026-08-11.** Added to both `service_opportunities` and `cleaning_assignments`.
15. **RLS is enabled on every table with only public policies.** Once wired, nothing internal is readable via the anon key until authenticated policies exist.
16. **`createServiceSupabaseClient` uses the service-role key and bypasses RLS.** Harmless while unused; a full data leak if it ever reaches a client component or an unauthenticated route.
17. **No tests and no test framework.**
18. **`prd` has no file extension.** It is markdown; `prd.md` would render on GitHub.

---

## Notes

- **All work since 2026-08-11 is on the branch `design-system-and-core-model`, not merged to `main`.** Four commits: design system, temple rail, docs and core model, schema rewrite, bulletin. `main` still holds the pre-redesign prototype.
- `.agents/AGENTS.md` is now **actively misleading**, not merely stale — it documents `leadershipRoles`, `assignments`, and `agendaItems`, none of which exist after the model rewrite. Recommend deleting.
- Port 3000 is often occupied on the owner's machine; dev sometimes lands on 3001.

### Operational gotchas on this machine

Recording these because they cost real time to discover and are not recoverable from the code.

- **`python3` is broken** (`posix_spawn: Undefined error: 0`). Use shell tools or Node for scripting.
- **Chrome's CLI `--screenshot` misreports the viewport.** It lays out at a wider viewport and crops to `--window-size`, which makes a correct responsive layout look like it has horizontal overflow. This produced a false "mobile is broken" diagnosis once. Use the DevTools Protocol with `Emulation.setDeviceMetricsOverride` for any responsive check; scratch scripts `shot.mjs` / `measure.mjs` do this.
- `sips -c` crops from the **centre**, not the top; `--cropOffset` is centre-relative.
- Schema changes can be verified for real: `docker run postgres:16-alpine`, pipe the migration in with `ON_ERROR_STOP=1`, then assert constraints with deliberately invalid inserts. This caught nothing broken but proved the model is enforced.
