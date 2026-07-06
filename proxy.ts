import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPrefixes = ["/p/", "/signup/"];

export function proxy(request: NextRequest) {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const isPublic = publicPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (!hasClerk || isPublic) {
    return NextResponse.next();
  }

  // Clerk protection can be enabled here once keys are added.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
