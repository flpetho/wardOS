import Link from "next/link";
import { ExternalLink, Send } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sundayProgram, workspace } from "@/lib/data";

export default function ProgramPage() {
  return (
    <>
      <PageHeading
        title="Sunday program"
        description="Ward-level program builder with a stable public QR-friendly route."
        action={
          <div className="flex gap-2">
            <Link href={`/p/${workspace.slug}/program`}>
              <Button variant="outline">
                Preview public
                <ExternalLink data-icon="inline-end" />
              </Button>
            </Link>
            <Button>
              <Send data-icon="inline-start" />
              Publish
            </Button>
          </div>
        }
      />
      <section className="grid gap-4 xl:grid-cols-[1fr_0.75fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Program details</CardTitle>
                <CardDescription>Seeded values show the intended editable shape.</CardDescription>
              </div>
              <StatusBadge status={sundayProgram.status} />
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Date" value={sundayProgram.programDate} />
            <Field label="Conducting" value={sundayProgram.conducting} />
            <Field label="Presiding" value={sundayProgram.presiding} />
            <Field label="Opening hymn" value={sundayProgram.openingHymn} />
            <Field label="Sacrament hymn" value={sundayProgram.sacramentHymn} />
            <Field label="Closing hymn" value={sundayProgram.closingHymn} />
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Announcements</label>
              <Textarea defaultValue={sundayProgram.announcements.join("\n")} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Public output</CardTitle>
            <CardDescription>Only published content appears publicly.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p className="font-medium">Speakers</p>
            <ul className="flex flex-col gap-2 text-muted-foreground">
              {sundayProgram.speakers.map((speaker) => (
                <li key={speaker}>{speaker}</li>
              ))}
            </ul>
            <p className="mt-2 font-medium">Lesson schedule</p>
            <p className="text-muted-foreground">{sundayProgram.lessonSchedule}</p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <Input defaultValue={value} />
    </div>
  );
}
