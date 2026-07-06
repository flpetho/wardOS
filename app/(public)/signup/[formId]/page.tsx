import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicSignupForm } from "@/components/public-signup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSignupForm, workspace } from "@/lib/data";

export default async function PublicSignupPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const form = getSignupForm(formId);

  if (!form) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <header>
          <p className="text-sm font-medium text-primary">{workspace.name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">{form.title}</h1>
          <p className="mt-2 text-muted-foreground">{form.description}</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Open slots</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {form.slots.map((slot) => (
              <div key={slot.id} className="rounded-md border p-3 text-sm">
                <div className="flex justify-between gap-3">
                  <p className="font-medium">{slot.title}</p>
                  <p className="text-muted-foreground">
                    {slot.responses.length}/{slot.quantityNeeded}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <PublicSignupForm form={form} />
        <footer className="pb-6 text-center text-sm text-muted-foreground">
          <Link href={`/p/${workspace.slug}/program`}>View Sunday program</Link>
        </footer>
      </div>
    </main>
  );
}
