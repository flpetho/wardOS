import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sundayProgram, workspace } from "@/lib/data";

export default async function PublicProgramPage({
  params,
}: {
  params: Promise<{ wardSlug: string }>;
}) {
  const { wardSlug } = await params;
  const isCurrentWard = wardSlug === workspace.slug;

  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-5">
        <header className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">{workspace.name}</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">Sunday Program</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays />
                  {sundayProgram.programDate}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin />
                  Sacrament meeting
                </span>
              </div>
            </div>
            <Badge variant={isCurrentWard ? "default" : "warning"}>
              {isCurrentWard ? sundayProgram.status : "Unknown ward"}
            </Badge>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Meeting order</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <ProgramRow label="Presiding" value={sundayProgram.presiding} />
            <ProgramRow label="Conducting" value={sundayProgram.conducting} />
            <ProgramRow label="Opening hymn" value={sundayProgram.openingHymn} />
            <ProgramRow label="Opening prayer" value={sundayProgram.openingPrayer} />
            <ProgramRow label="Ward business" value={sundayProgram.wardBusiness} />
            <ProgramRow label="Sacrament hymn" value={sundayProgram.sacramentHymn} />
            <ProgramRow label="Speakers" value={sundayProgram.speakers.join(", ")} />
            <ProgramRow label="Musical number" value={sundayProgram.intermediateHymn} />
            <ProgramRow label="Closing hymn" value={sundayProgram.closingHymn} />
            <ProgramRow label="Closing prayer" value={sundayProgram.closingPrayer} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {sundayProgram.announcements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {sundayProgram.upcomingEvents.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-md bg-muted p-3 text-sm">{sundayProgram.lessonSchedule}</p>
          </CardContent>
        </Card>

        <footer className="pb-6 text-center text-sm text-muted-foreground">
          <Link href="/dashboard">wardOS internal dashboard</Link>
        </footer>
      </div>
    </main>
  );
}

function ProgramRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-md border p-3 sm:grid-cols-[160px_1fr]">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  );
}
