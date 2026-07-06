import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serviceOpportunities } from "@/lib/data";

export default function ServicePage() {
  return (
    <>
      <PageHeading
        title="Service opportunities"
        description="Create service needs, track ownership, and publish simple signup links."
        action={
          <Button>
            <Plus data-icon="inline-start" />
            New service
          </Button>
        }
      />
      <section className="grid gap-4 lg:grid-cols-2">
        {serviceOpportunities.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.date} · {item.location}</CardDescription>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm">{item.description}</p>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Owner</p>
                  <p className="font-medium">{item.owner}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Needed</p>
                  <p className="font-medium">{item.needed}</p>
                </div>
              </div>
              <Link href={`/signup/${item.signupFormId}`}>
                <Button variant="outline">
                  Public signup
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
