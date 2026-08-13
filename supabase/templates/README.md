# Email templates

`magic-link.html` is the wardOS sign-in email. The file is **inert** — Supabase
never reads this repo. It lives here so the design can be reviewed and diffed
instead of being trapped in a dashboard field, but the dashboard is the truth.

## Applying it

Supabase dashboard → **Authentication → Emails**.

Paste the *entire* contents of `magic-link.html` into **both** templates, and set
both subject lines to `Sign in to wardOS`:

| Template | Who gets it |
|---|---|
| **Magic Link** | anyone whose auth user already exists |
| **Confirm signup** | a person's **first ever** sign-in |

**Do not skip Confirm signup.** `signInWithOtp` creates the auth user when it
does not exist, so a brand-new person triggers that template, not Magic Link.
Customising only Magic Link is easy to do and easy to believe you have finished
— you test with an address that already signed in, it looks right, and the first
genuinely new person still receives the stock Supabase email. That is the exact
moment the design mattered most, because an unfamiliar sender asking someone to
click a sign-in link is indistinguishable from phishing.

## Before a real member receives one

The template hard-codes **"Oak Hills Ward"**, which is fictional seed data. Change
it. See rule 2 in `CLAUDE.md`.

## Cross-device links

`{{ .ConfirmationURL }}` uses the PKCE flow: the link must be opened in the same
browser that requested it. Request on a laptop, open on a phone, and it fails.

To make links work across devices, replace **both** occurrences of
`{{ .ConfirmationURL }}` with:

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink&next=/dashboard
```

using `type=signup` in the Confirm signup template. `app/auth/callback/route.ts`
already accepts both shapes, so this is a dashboard change with no code change.

## Constraints that shaped the design

Email clients are not browsers:

- **No SVG, no webfonts.** Gmail strips both.
- **No remote images.** Most clients block them by default, and a broken image
  box is the worst possible thing in the spot where trust is being built.
- **Inline styles on tables only.** `<style>` blocks are stripped.
- **Outlook squares off `border-radius`.** The pill degrades to a rectangle; the
  fill and contrast survive, which is what makes it read as a button.

## Sending limits

Supabase's built-in mailer is rate-limited and documented as development-only.
Configure custom SMTP before the presidency relies on this.
