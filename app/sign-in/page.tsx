import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/sign-in-form";
import { getActiveSession } from "@/lib/identity";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Sign in · wardOS" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const target = safeRedirect(next);

  // Already signed in and seated: nothing to do here.
  const session = await getActiveSession();
  if (session) redirect(target);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-[380px]">
        <div className="mb-7">
          <p className="text-[19px] font-semibold tracking-[-0.02em]">wardOS</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
            Sign in with the email address your presidency has on file. No password
            to remember — we send you a link.
          </p>
        </div>

        <SignInForm next={target} initialError={error} />

        <p className="mt-6 text-[12px] leading-relaxed text-subtle-foreground">
          wardOS is an independent tool built by a quorum member. It is not an
          official product of The Church of Jesus Christ of Latter-day Saints.
        </p>
      </div>
    </main>
  );
}
