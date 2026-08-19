# DESIGN

The wardOS design system, as built. Not as intended — everything here is in the
code and can be checked against it.

**Last updated:** 2026-08-13

Read this before adding a screen or a component. The tokens live in
[`app/globals.css`](app/globals.css); the primitives live in `components/ui/`.

---

## The direction

**Thesis.** One page answers what Sunday needs. wardOS refuses the metric-card
row and the boxed-card grid that the admin-dashboard default ships with.

**Register.** Notion, roughly: low chrome, type-led hierarchy, generous
whitespace. Hierarchy comes from **type, spacing and hairline rules** — not from
boxes, fills, or shadow. When a section needs separating, the first instrument is
a rule and the last is a card.

**Why it matters here.** A presidency member opens wardOS on a phone in a chapel
hallway with a few minutes before the block. The design's job is to make what is
unresolved before Sunday legible in seconds. Decoration costs seconds.

Chosen by the owner on 2026-08-11 after two rounds of alternative visual worlds
were rolled and declined. It is the category standard, deliberately.

---

## Three registers, not one

wardOS has three surfaces with genuinely different jobs. **Operate** and **Read**
do not share a visual identity at all. **Introduce** shares Operate's tokens and
primitives, but is composed for a scroll rather than for a glance.

| | **Operate** | **Read** | **Introduce** |
|---|---|---|---|
| Where | everything behind sign-in | `/p/<ward>/program` — the Sunday bulletin | `/` — the landing page |
| Who | four or five people who use it weekly | a member who scanned a QR code in the foyer | a stranger deciding whether to reply |
| Ink | near-black `#18181b` on white | a single warm olive `#404231` | near-black `#18181b` on white |
| Type | DM Sans 400/500/600 | DM Sans 300/500 only | same, plus display sizes to 58px |
| Chrome | sidebar, rail, cards, badges | none — one scrolling column | 64px nav, full-bleed section bands |

### What constrains Introduce, and why it is not a normal landing page

Added 2026-08-18. The rules in `CLAUDE.md` remove most of the standard toolkit,
and that shaped the composition rather than merely trimming it:

- **No testimonials, logo wall, adoption numbers or endorsements.** Rule 5, and
  there is nothing true to put there anyway. The page argues from precision
  about the work instead, and the section "Two things worth saying plainly"
  states the absence outright rather than leaving a suspicious gap.
- **No implication of Church affiliation**, and an explicit disclaimer in the
  footer. Rule 4.
- **No real ward data.** The hero preview is built from the app's own
  `StatusBadge`, carries invented work items, is labelled as sample, and
  deliberately contains no personal names at all.
- **Light only, no dark mode.** The white field is a pinned brand commitment and
  the app has no dark mode, so a dark marketing page would be the only one.
- **CSS motion only, no animation library.** Adding `motion` would pull a
  dependency into a tree where everything is pinned to `"latest"`. The
  entrance reuses the existing `.content-enter`.

The bulletin carries its own identity **on purpose**. It was built from the
owner's Figma design, and its rules are stricter: one ink at two weights, where
the apparent lightness of a value is *weight, not colour*; a signature two-part
rule (short heavy dash, then long hairline); a 440px column.

Do not "unify" them. The split is the design.

---

## Colour has three jobs

Each colour does exactly one. This is the rule most easily broken and the one
worth guarding.

| Job | Colour | Where it appears |
|---|---|---|
| **Action** — commit something | near-black `--foreground` | every button |
| **Wayfinding** — where you are, where you can go, where the keyboard is | cobalt `--primary` `#1D4ED8` | active nav, today in the calendar, links, focus rings |
| **State** — how a thing stands | the status palette | badges, success confirmations |

**There is no decorative exception.** Cobalt appears nowhere that is not
wayfinding. The sidebar brand mark used to be the one licensed exception, on the
grounds that a brand colour there was doing brand work — it was removed on
2026-08-13 along with the wardOS wordmark, so the exception no longer needs
defending. If you find yourself wanting cobalt for emphasis, the answer is
weight or space, not colour.

**History, so it is not undone by accident.** Until 2026-08-13 cobalt filled
buttons *and* marked active navigation, *and* was sprinkled on progress meters, a
success tick and a ward name. One colour meaning four things is the same failure
the core model diagnosed in the layout: when everything is emphasised, nothing
is. Buttons moved to near-black pills, which left cobalt one unambiguous job.

### The palette

Every status pair clears 4.5:1 on its own tint.

| Token | Value | Use |
|---|---|---|
| `--background` | `#ffffff` | the field |
| `--surface` | `#fafafa` | sidebar, insets |
| `--foreground` | `#18181b` | body ink, button fills |
| `--muted-foreground` | `#71717a` | secondary copy — 4.83:1 on white |
| `--subtle-foreground` | `#a1a1aa` | decorative only, **never body copy** |
| `--border` | `#e7e7e9` | hairlines |
| `--border-strong` | `#d4d4d8` | inputs, outline buttons |
| `--primary` | `#1D4ED8` | wayfinding |
| `--ok` / `--ok-soft` | `#15803d` / `#f0fdf4` | resolved |
| `--attention` / `--attention-soft` | `#b91c1c` / `#fef2f2` | someone must act |
| `--progress` / `--progress-soft` | `#b45309` / `#fffbeb` | underway |
| `--info` / `--info-soft` | `#1d4ed8` / `#eff4ff` | scheduled |
| `--neutral` / `--neutral-soft` | `#52525b` / `#f4f4f5` | dormant |

Status colour is **functional and never decorative**: green means resolved, red
means someone has to act, amber means underway, blue means scheduled, grey means
dormant. `components/status-badge.tsx` is the single place a database value
becomes a label and a tone.

---

## Type

**DM Sans**, self-hosted through `next/font` so there are no external requests —
this runs on chapel wifi. Exposed as `--font-dm-sans`.

> Do not rename that variable to `--font-sans`. An earlier build declared both on
> `<html>` at equal specificity; `globals.css` won on source order and the app
> silently rendered in Arial while still downloading DM Sans.

Sizes are set in pixels rather than Tailwind's scale, because the steps between
13 and 15px matter here and `text-sm`/`text-base` skips them.

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Page title | 26px, 30px at `sm` | 600 | `-0.02em` |
| Section heading | 15px | 600 | `-0.01em` |
| Body | 14px | 400 | — |
| Secondary / meta | 13px | 400 | — |
| Table header, eyebrow | 11–12px | 500–600 | `+0.04em` to `+0.06em`, uppercase |

Negative tracking on large text, positive on small uppercase. Both are optical
corrections, not style.

**Numbers align.** `time` and `[data-numeric]` get `tabular-nums`, so dates,
counts and money line up in columns.

**Dates** always go through `formatDate()` in `lib/utils.ts`, which pins parsing
and formatting to UTC. Bare `YYYY-MM-DD` formatted in the ambient timezone
renders a different day either side of hydration for anyone west of Greenwich.

---

## Layout

```
┌──────────┬────────────────────────────┬──────────┐
│ sidebar  │  content, max 1120px       │ temple   │
│ 260px    │  gutters 20 / 32 / 40px    │ rail     │
│ ≥ lg     │                            │ 300px    │
│          │                            │ ≥ xl     │
└──────────┴────────────────────────────┴──────────┘
```

- **Sidebar** 260px, fixed, `--surface`, from `lg` (1024px). Below that it
  becomes a drawer behind a hamburger.
- **Temple rail** 300px, fixed, floating card with 16px inset, from `xl`
  (1280px). Below that it moves to the bottom of the drawer so it stays reachable
  from any route rather than disappearing.
- **Content** capped at 1120px, `gap-9` between sections.

**The tight spot:** at exactly 1280px, sidebar + rail leave ~640px of content.
That is the narrowest the calendar month grid ever gets. Check that width before
adding any more fixed chrome.

**Mobile is not the small case, it is a first-class case.** Device agnosticism is
a logged product decision — phone at church on Sunday and laptop in the
presidency meeting are equally real. Every change is checked at **390px** for
horizontal overflow.

---

## Components

Eight pieces carry the whole app. Add to them before adding beside them.

| Component | Notes |
|---|---|
| `ui/button` | Pill (`rounded-full`). `default` is near-black fill. Also `secondary`, `outline`, `ghost`, `destructive`; sizes `sm`/`default`/`lg`/`icon`. |
| `ui/input`, `ui/textarea` | 9-unit height, `rounded-md`, cobalt border + soft ring on focus. |
| `ui/card` | `rounded-lg`, hairline border, **no shadow by default**. Header `px-5 pt-5 pb-3`, content `px-5 pb-5`. |
| `ui/badge` | Seven tonal variants on soft tints. |
| `ui/table` | Wrapped in `overflow-x-auto` with `min-w-[34rem]` so it scrolls rather than bursting the page on a phone. |
| `status-badge` | The one mapping from DB value → label + tone. Never hand-write a status string. |
| `page-heading` | Title, description capped at `62ch`, optional action slot. Bottom hairline. Every page starts with one. |
| `app-shell` | Sidebar, drawer, rail slot, content frame. **Presentational only** — nav content is decided on the server in `lib/nav.ts`. |

### Cards are the last resort

A card means *this is a distinct object*. Lists of things are lists, separated by
`divide-y divide-border`. Reach for `Card` when a group genuinely needs a
boundary, not to give a section visual weight.

---

## Icons

lucide, sized via a `data-icon` attribute rather than per-instance classes:

```tsx
<Plus data-icon="inline-start" />   {/* 1rem, small trailing space */}
<Clock data-icon="" />              {/* 1rem, no spacing            */}
```

`[data-icon]` is implemented in `globals.css` as a 1rem box with `flex-shrink: 0`.
Before that rule existed the attribute was used on 22 elements with nothing
behind it, so every icon rendered at lucide's 24px default beside 14px text.

---

## Motion

**One authored entrance**, on the content region only: `.content-enter`, 420ms,
`cubic-bezier(0.16, 1, 0.3, 1)`, a 6px rise with a fade. The drawer reuses the
same curve at 240ms.

It is deliberately not repeated per section. A staggered cascade on every card is
an effect, not a moment.

`prefers-reduced-motion: reduce` collapses every animation and transition to
0.01ms globally.

---

## Accessibility

- Focus is never removed. `:focus-visible` draws a 2px cobalt outline at 2px
  offset, globally.
- `--muted-foreground` is the lightest colour permitted for body copy.
  `--subtle-foreground` is decorative only.
- Interactive targets are at least 32px; drawer and header controls are 36px.
- The drawer is a real dialog: `role="dialog"`, `aria-modal`, Escape closes it,
  body scroll locks.
- Active nav carries `aria-current="page"`, not just colour.

---

## Email

`supabase/templates/magic-link.html` carries the design into the sign-in email:
the same near-black pill button, the same restraint.

Email clients are not browsers. No SVG, no webfonts, no remote images (most
clients block them by default, and a broken image box is the worst possible thing
in the exact spot where trust is being established). Everything is inline styles
on tables. Outlook squares off `border-radius`; that degrades acceptably.

---

## Known inconsistencies

Recorded rather than hidden.

- **`Badge` `default` and `info` are the same thing.** `--info` and `--primary`
  are both `#1d4ed8`, so `bg-primary-soft text-primary` and `bg-info-soft
  text-info` render identically. Now that badges are STATE and cobalt is
  WAYFINDING, `default` should probably become `info` and the variant retired.
- **Only `/budget` and `/admin` guard on area scope.** Every other area page
  relies on the nav omitting it, which is fine today because no current seat is
  excluded from them — and wrong the moment a scoped seat exists.
- **The twelve non-dashboard pages inherited tokens and primitives but keep their
  original layouts.** Rolling the system across them is step 5 in `STATE.md`.

---

## Checking your work

```bash
pnpm build       # must pass
pnpm typecheck   # must pass
```

Then, at minimum:

1. **390px, no horizontal overflow.** `document.documentElement.scrollWidth`
   must equal `innerWidth`. Use the DevTools Protocol with
   `Emulation.setDeviceMetricsOverride` — Chrome's CLI `--screenshot` lays out at
   a wider viewport and crops, which once produced a false "mobile is broken"
   diagnosis.
2. **1280px**, where sidebar and rail squeeze content to ~640px.
3. **Reduced motion**, if you touched animation.
