import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Check, Minus } from "lucide-react";

import { DemoRequestForm } from "@/components/landing/demo-request-form";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "wardOS",
  description:
    "An operating dashboard for an elders quorum presidency. Lessons, assignments, service, cleaning, the agenda, and the Sunday program, on one page.",
};

/*
  The public landing page, and the only marketing surface wardOS has.

  It is a THIRD register, alongside the two in DESIGN.md. Operate is the app
  behind sign-in; Read is the Sunday bulletin. This is Introduce: a stranger who
  has never heard of wardOS, deciding in about fifteen seconds whether it is
  worth a reply.

  It shares the app's tokens, type and pill buttons, so the two read as one
  product, but it is composed for a scroll rather than for a glance.

  What it deliberately does NOT have, and why:

  - No testimonials, no logo wall, no adoption numbers. Nobody uses wardOS yet,
    and CLAUDE.md rule 5 forbids inventing any of it. The section "Two things
    worth saying plainly" turns that absence into the argument rather than
    hiding it.
  - No claim of Church affiliation anywhere, and an explicit disclaimer in the
    footer. Rule 4.
  - No real ward data. The preview panel carries invented work items and says
    so, and it deliberately contains no personal names at all.
*/

const BELONGS = [
  "Who is teaching on Sunday, and whether they know yet",
  "The building cleaning rotation",
  "Service project logistics and signups",
  "Agenda items, and what was decided about them",
  "Quorum budget lines",
  "The published Sunday program",
];

const NEVER = [
  "Worthiness concerns",
  "Financial need",
  "Counseling notes",
  "Private family circumstances",
  "Confidential presidency discussion",
];

const PREVIEW = [
  { work: "Sunday lesson, 24 August", status: "needs_teacher" },
  { work: "Building cleaning, 30 August", status: "partially_filled" },
  { work: "Quorum service project", status: "open" },
  { work: "Sunday program", status: "ready_for_review" },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string }>;
}) {
  const params = await searchParams;

  /*
    Fallback for a misconfigured redirect allow list.

    When `emailRedirectTo` is not on Supabase's allow list, Supabase does not
    fail -- it quietly redirects to the project's Site URL instead. The sign-in
    code then lands here rather than on /auth/callback, and the link appears to
    do nothing at all, which is the single most common way magic-link sign-in
    breaks.

    Forwarding it keeps that misconfiguration from looking like a broken app.
    The allow list should still be set correctly; see README.
  */
  if (params.code || params.token_hash) {
    const forwarded = new URLSearchParams();
    if (params.code) forwarded.set("code", params.code);
    if (params.token_hash) forwarded.set("token_hash", params.token_hash);
    if (params.type) forwarded.set("type", params.type);
    redirect(`/auth/callback?${forwarded.toString()}`);
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Navigation. One line, 64px, hairline base. */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-sm">
        <nav className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-6 px-5 sm:px-8">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            wardOS
          </span>
          {/*
            No "Sign in" here on purpose.

            signInWithOtp CREATES an auth user for any address, so a stranger who
            takes that invitation gets a real email, a real session, and then the
            no-access page. That is a dead end we would have walked them into,
            and it dilutes the one action this page is for.

            The door still exists, quietly, in the footer: the presidency has to
            be able to reach it from the domain they were given without being
            told a secret path. Principle 4, survivable by the next volunteer.
          */}
          <Link href="#demo">
            <Button size="sm" className="transition-transform active:translate-y-px">
              Request a demo
            </Button>
          </Link>
        </nav>
      </header>

      <main>
        {/* ------------------------------------------------------------------
            Hero. Asymmetric 7/5 split: the claim on the left, a real component
            preview on the right built from the app's own StatusBadge rather
            than a drawn screenshot.
        ------------------------------------------------------------------- */}
        <section className="content-enter mx-auto max-w-[1120px] px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h1 className="max-w-[16ch] text-[38px] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-[52px] lg:text-[58px]">
                Everything Sunday needs, on one page.
              </h1>
              <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-muted-foreground">
                An operating dashboard for an elders quorum presidency. Lessons,
                assignments, service, cleaning, the agenda, and the Sunday
                program.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="#demo" className="sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full transition-transform active:translate-y-px sm:w-auto"
                  >
                    Request a demo
                    <ArrowRight data-icon="" aria-hidden />
                  </Button>
                </Link>
                <Link href="/p/oak-hills/program" className="sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full transition-transform active:translate-y-px sm:w-auto"
                  >
                    See a sample bulletin
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Before Sunday
                </p>
                <ul className="mt-4 divide-y divide-border">
                  {PREVIEW.map((row) => (
                    <li
                      key={row.work}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="text-sm text-foreground">{row.work}</span>
                      <StatusBadge status={row.status} />
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 px-1 text-[12px] leading-relaxed text-muted-foreground">
                Sample data. Every item here is invented, and wardOS computes
                this list rather than storing it.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            The boundary. Two-column contrast. This is the differentiator and
            the reason the product exists, so it comes before the feature list.
        ------------------------------------------------------------------- */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-[1120px] px-5 py-20 sm:px-8 sm:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              The line that matters
            </p>
            <h2 className="mt-4 max-w-[20ch] text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[38px]">
              It holds the logistics. Never the confidences.
            </h2>
            <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-muted-foreground">
              A shared spreadsheet can hold the same rows. What it cannot do is
              know the difference between coordinating work and recording
              something that was told to you in confidence. That boundary is
              enforced in the database, in the import rules, and on every public
              page.
            </p>

            <div className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-2 md:gap-16">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  Belongs in wardOS
                </h3>
                <ul className="mt-5 grid gap-3.5">
                  {BELONGS.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed">
                      <Check
                        data-icon=""
                        aria-hidden
                        className="mt-[3px] text-ok"
                      />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  Never in wardOS
                </h3>
                <ul className="mt-5 grid gap-3.5">
                  {NEVER.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed">
                      <Minus
                        data-icon=""
                        aria-hidden
                        className="mt-[3px] text-subtle-foreground"
                      />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 max-w-[46ch] border-l-2 border-border-strong pl-4 text-[13px] leading-relaxed text-muted-foreground">
                  When something is genuinely sensitive, wardOS stores a link to
                  where it already lives. Never the content.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            What it holds. Asymmetric grid, five cells for five things. The
            first cell is the spine of the model and gets the weight.
        ------------------------------------------------------------------- */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1120px] px-5 py-20 sm:px-8 sm:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              What it runs
            </p>
            <h2 className="mt-4 max-w-[24ch] text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[38px]">
              The meeting decides. Sunday delivers.
            </h2>

            <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
              {/*
                col-span-2 with NO row-span: five articles then fill a 3x2 grid
                exactly. Spanning two rows as well leaves a sixth cell empty,
                which renders as a bare grey rectangle because the grid uses
                gap-px over a border-coloured background.
              */}
              <article className="bg-surface p-6 sm:p-8 md:col-span-2">
                <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-foreground">
                  The presidency meeting
                </h3>
                <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
                  The agenda builds itself out of whatever is still unresolved,
                  so nobody arrives having forgotten what was left open. What
                  gets decided becomes a commitment with an owner and a date.
                </p>
                <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
                  Anything carried from one meeting to the next is counted, so
                  work that keeps being deferred is visible instead of quietly
                  repeating.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <StatusBadge status="proposed" />
                  <StatusBadge status="on_agenda" />
                  <StatusBadge status="committed" />
                  <StatusBadge status="done" />
                </div>
              </article>

              <article className="bg-card p-6 sm:p-8">
                <h3 className="text-[15px] font-semibold text-foreground">Lessons</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  Who is teaching, what on, and whether they have been asked yet.
                </p>
              </article>

              <article className="bg-card p-6 sm:p-8">
                <h3 className="text-[15px] font-semibold text-foreground">
                  Service and cleaning
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  The rotation, the slots that are still empty, and who has not
                  been asked in a while.
                </p>
              </article>

              <article className="bg-card p-6 sm:p-8">
                <h3 className="text-[15px] font-semibold text-foreground">
                  Signup forms
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  A link you text to the quorum. Nobody needs an account at the
                  other end of it.
                </p>
              </article>

              <article className="bg-card p-6 sm:p-8">
                <h3 className="text-[15px] font-semibold text-foreground">
                  The Sunday program
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  Published to a page members reach from a QR code in the foyer.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            Turnover. Full-width statement, no grid. The strongest argument in
            the product and the one a spreadsheet cannot answer at all.
        ------------------------------------------------------------------- */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-[1120px] px-5 py-20 sm:px-8 sm:py-28">
            <h2 className="max-w-[18ch] text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[40px]">
              Built for the day you are released.
            </h2>
            <div className="mt-8 grid gap-6 md:max-w-[68ch]">
              <p className="text-[16px] leading-relaxed text-muted-foreground">
                Everyone in this calling leaves it eventually, usually with
                little notice, and the person called next inherits whatever was
                in your head. That is the actual failure mode in quorum
                administration, and it is not a filing problem.
              </p>
              <p className="text-[16px] leading-relaxed text-foreground">
                So work in wardOS belongs to the{" "}
                <span className="font-medium">seat</span>, not the person. When a
                counselor is released, the whole queue moves to whoever is called
                next, with its history intact. Nobody has to write a handoff
                document, because the tool already is one.
              </p>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            Independence and stage. Rules 4 and 5, stated as the argument
            rather than buried in a footer.
        ------------------------------------------------------------------- */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-[1120px] px-5 py-20 sm:px-8 sm:py-28">
            <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[38px]">
              Two things worth saying plainly.
            </h2>

            <div className="mt-10 grid gap-10 border-t border-border pt-10 md:grid-cols-2 md:gap-16">
              <div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  wardOS is not a Church product.
                </h3>
                <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
                  It is an independent tool, built by a quorum member for his own
                  presidency. It is not affiliated with, endorsed by, or
                  integrated with any official Church system, and it does not
                  read or store membership records.
                </p>
              </div>

              <div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  It is not in use anywhere yet.
                </h3>
                <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
                  There are no customers to point at and no numbers to quote. The
                  first real test is one presidency, for one full Sunday cycle.
                  If that is earlier than you want to be involved, it honestly
                  is.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            The form. Stacked heading over a full-width form rather than another
            split, so it does not repeat the hero's layout family.
        ------------------------------------------------------------------- */}
        <section id="demo" className="scroll-mt-16 border-t border-border bg-surface">
          <div className="mx-auto max-w-[1120px] px-5 py-20 sm:px-8 sm:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Request a demo
            </p>
            <h2 className="mt-4 max-w-[22ch] text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-[38px]">
              Have a look with your own quorum in mind.
            </h2>
            <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-muted-foreground">
              Tell us which seat you serve in and we will walk you through it.
              There is nothing to install and no account to create first.
            </p>

            <div className="mt-10 max-w-[46rem] rounded-lg border border-border bg-card p-6 sm:p-8">
              <DemoRequestForm />
            </div>
          </div>
        </section>
      </main>

      {/*
        Owner-directed 2026-08-19: no sign-in link anywhere on this page.

        Nothing public now points at /sign-in. The route is still live and still
        works; it is simply unadvertised, so the presidency reaches it from a
        bookmark rather than from here. The cost is real and accepted: someone
        setting up a new phone needs the URL from somewhere other than the
        domain they were given.

        This is the strongest argument yet for moving the app to
        app.ward-os.com, which would give the presidency a host to bookmark and
        leave this page with nothing to hide. See STATE.md, open question 6.
      */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-[1120px] px-5 py-10 sm:px-8">
          <p className="max-w-[62ch] text-[12px] leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">wardOS</span> is an
            independent tool and is not affiliated with, endorsed by, or
            sponsored by The Church of Jesus Christ of Latter-day Saints.
          </p>
        </div>
      </footer>
    </div>
  );
}
