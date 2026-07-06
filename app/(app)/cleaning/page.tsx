import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cleaningAssignments } from "@/lib/data";

export default function CleaningPage() {
  return (
    <>
      <PageHeading
        title="Cleaning assignments"
        description="Track family coverage and publish Saturday signup links."
        action={
          <Button>
            <Plus data-icon="inline-start" />
            Add cleaning date
          </Button>
        }
      />
      <section className="grid gap-4 lg:grid-cols-2">
        {cleaningAssignments.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{item.cleaningDate}</CardTitle>
                  <CardDescription>{item.startTime} at the meetinghouse</CardDescription>
                </div>
                <StatusBadge status={item.status} />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Needed</p>
                  <p className="font-medium">{item.familiesNeeded} families</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Assigned</p>
                  <p className="font-medium">{item.assignedFamilies.length || 0}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-muted-foreground">Confirmed</p>
                  <p className="font-medium">{item.confirmedFamilies.length || 0}</p>
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
