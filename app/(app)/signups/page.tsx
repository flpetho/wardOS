import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signupForms } from "@/lib/data";

export default function SignupsPage() {
  return (
    <>
      <PageHeading
        title="Signup forms"
        description="Create shareable forms for service and cleaning. Public response pages collect name only."
        action={
          <Button>
            <Plus data-icon="inline-start" />
            New form
          </Button>
        }
      />
      <section className="grid gap-4 lg:grid-cols-2">
        {signupForms.map((form) => (
          <Card key={form.id}>
            <CardHeader>
              <CardTitle>{form.title}</CardTitle>
              <CardDescription>{form.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {form.slots.map((slot) => (
                <div key={slot.id} className="rounded-md border p-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <p className="font-medium">{slot.title}</p>
                    <p className="text-muted-foreground">
                      {slot.responses.length}/{slot.quantityNeeded}
                    </p>
                  </div>
                  <p className="mt-1 text-muted-foreground">
                    {slot.responses.length ? slot.responses.join(", ") : "No responses yet"}
                  </p>
                </div>
              ))}
              <Link href={`/signup/${form.id}`}>
                <Button variant="outline">
                  Open public form
                  <ExternalLink data-icon="inline-end" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
