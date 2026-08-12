# CLAUDE.md

wardOS — an operating dashboard for an Elders Quorum presidency.

This file is loaded into every session. It is deliberately short. It carries **only** the rules an agent could not know to go looking for, plus a map of where everything else lives. Read documents when the work calls for them, not on principle.

**Start every session by reading [STATE.md](STATE.md).** It is the only file that tells you where the work actually stands.

---

## Non-negotiables

These are resident because an agent who does not already know them will not know to ask.

1. **Operational, not pastoral.** wardOS coordinates work: lessons, cleaning rotations, service logistics, agenda items, budgets. It never stores worthiness concerns, financial need, counseling notes, private family circumstances, or confidential presidency discussion. When information is sensitive, store a link to the source document — never the content. If a change would put pastoral content in the database, stop and raise it.

2. **The seed data in `lib/data.ts` is fictional.** "Oak Hills Ward," "Nathan Placeholder," "the Porters" — invented. Only "Ferenc Petho" is a real person (the owner). Never present any of it as real ward data, never carry it into production, and never invent additional member names that could be mistaken for real ones.

3. **Nothing internal reaches a public URL.** Routes under `app/(public)/` render only deliberately published content and must reveal nothing about the workspace behind them — no internal notes, no unpublished records, no member data beyond what a signup deliberately collects.

4. **No claim of Church endorsement.** wardOS is an independent tool built by a quorum member. It is not an official Church product and must never imply affiliation, endorsement, or integration with official Church systems.

5. **Never fabricate** adoption numbers, testimonials, endorsements, or ward data.

---

## Where to find what

Read on demand. The parenthetical is what the document is good for — if that is not your task, do not open it.

| When you are… | Read |
|---|---|
| Starting any session | **`STATE.md`** — current phase, in-flight work, known defects, decision log |
| Making a product or scope decision | **`PRODUCT.md`** — users, purpose, positioning, operating context, confirmed constraints |
| Touching the data model, nav structure, permissions, or the meeting flow | **`docs/plans/2026-08-11-mental-model-design.md`** — the core model: the commitment loop, seats vs people, derived gaps, capability tiers, schema deltas. Read before any schema or auth work. |
| Needing exact module fields, statuses, or user flows | **`prd`** — full v0 requirements (see section map below) |
| Working on visual design, tokens, or components | **`DESIGN.md`** — *not yet written; created at the end of the current design build* |
| Changing the database | `supabase/migrations/` (live schema) + `lib/types.ts` (app-side domain types) |
| Setting up auth, Supabase, or deploying | `README.md` |
| Curious about pre-Claude project history | `.agents/AGENTS.md` — **stale, superseded by this file and STATE.md.** Contains known drift. Do not treat as authoritative. |

### `prd` section map

The PRD is ~1,200 lines. Jump to the section, do not read the file.

| § | Contents |
|---|---|
| 1–4 | Name, summary, product thesis, problem statement |
| 5–6 | Goals and non-goals |
| 7 | **Operational-not-pastoral principle** — safe vs. sensitive examples |
| 8 | Target users |
| 9–10 | Google Sheet source tabs and how each should be treated |
| 11 | MVP scope, in and out |
| 12 | Core user flows (1 login, 2 seed import, 3 run a meeting, 4 lessons, 5 service signup, 6 cleaning, 7 publish program) |
| 13 | Dashboard requirements and sections |
| 14 | **Module field lists and statuses** — 14.1 lessons · 14.2 assignments · 14.3 service · 14.4 cleaning · 14.5 signup forms · 14.6 meeting mode · 14.7 Sunday program |
| 15 | Import requirements and review states |
| 16 | Privacy requirements and sensitive-source handling |
| 17 | Roles and permissions |
| 18–19 | Stack recommendation and app architecture |
| 20 | Initial data model, entity by entity |
| 21 | Original same-day prototype scope |
| 22 | Success criteria |
| 23 | Roadmap v1 / v2 / v3 |
| 24 | Open questions (several now answered — check `PRODUCT.md` first) |

---

## Keeping STATE.md true

`STATE.md` is worthless the moment it drifts. Update it in the same change that causes the drift, not later:

- finishing a work item → move it out of **In flight**
- making a decision that closes an open question → add to **Decision log** with the date
- finding a defect you are not fixing now → add to **Known defects**
- fixing one → strike it
- learning a durable product fact → that belongs in `PRODUCT.md`, not here

Use absolute dates (`2026-08-11`), never "last week."

---

## Project commands

```bash
pnpm dev         # dev server
pnpm build       # production build — must pass before any commit
pnpm typecheck   # tsc --noEmit — must pass before any commit
```

`pnpm lint` is currently broken (`next lint` was removed in Next 16). See STATE.md.

---

# Behavioral guidelines

Derived from [Andrej Karpathy's observations](https://github.com/multica-ai/andrej-karpathy-skills) on LLM coding pitfalls.

**Tradeoff:** These bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
