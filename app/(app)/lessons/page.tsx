import { Plus } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TD, TH, TBody, THead, TR, Table } from "@/components/ui/table";
import { lessons } from "@/lib/data";

export default function LessonsPage() {
  return (
    <>
      <PageHeading
        title="Lessons"
        description="Plan upcoming quorum lessons, teachers, backups, and preparation status."
        action={
          <Button>
            <Plus data-icon="inline-start" />
            Add lesson
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Upcoming lesson schedule</CardTitle>
          <CardDescription>Seeded from the safe lesson schedule source.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Date</TH>
                <TH>Topic</TH>
                <TH>Teacher</TH>
                <TH>Backup</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {lessons.map((lesson) => (
                <TR key={lesson.id}>
                  <TD>{lesson.date}</TD>
                  <TD>
                    <p className="font-medium">{lesson.topic}</p>
                    <p className="text-sm text-muted-foreground">{lesson.sourceMaterial}</p>
                  </TD>
                  <TD>{lesson.teacher}</TD>
                  <TD>{lesson.backupTeacher}</TD>
                  <TD>
                    <StatusBadge status={lesson.status} />
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
