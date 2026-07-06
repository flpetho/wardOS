import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">This wardOS route is not available.</p>
        <Link href="/dashboard" className="mt-5 inline-flex">
          <Button>Go to dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
