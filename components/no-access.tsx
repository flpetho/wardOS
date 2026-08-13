import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shown when someone is signed in but holds no current membership — either
 * their address is on no `people` row, or they have been released.
 *
 * Deliberately says nothing about who *does* have access, whether the address is
 * known, or what the workspace contains. A stranger who reaches this page should
 * learn only that they are not in it.
 */
export function NoAccess({ email }: { email?: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="w-full max-w-[420px] text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-surface">
          <KeyRound className="size-4 text-muted-foreground" />
        </div>

        <h1 className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">
          You don&apos;t have access to this workspace
        </h1>

        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          {email ? (
            <>
              You are signed in as{" "}
              <span className="font-medium text-foreground">{email}</span>, but that
              address is not attached to a calling in wardOS.
            </>
          ) : (
            <>Your account is not attached to a calling in wardOS.</>
          )}
        </p>

        <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
          Ask whoever administers your quorum&apos;s workspace to add you. If you
          were recently released, this is expected.
        </p>

        <form action="/auth/sign-out" method="post" className="mt-6">
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
