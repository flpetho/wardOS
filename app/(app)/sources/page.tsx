import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TD, TH, TBody, THead, TR, Table } from "@/components/ui/table";
import { sources } from "@/lib/data";

export default function SourcesPage() {
  return (
    <>
      <PageHeading
        title="Sources"
        description="Safe operating tabs can be imported. Sensitive tabs remain link-only in v0."
      />
      <Card>
        <CardHeader>
          <CardTitle>Source treatment</CardTitle>
          <CardDescription>Current fake data mirrors the PRD import rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Source</TH>
                <TH>Type</TH>
                <TH>Sensitivity</TH>
                <TH>Treatment</TH>
              </TR>
            </THead>
            <TBody>
              {sources.map((source) => (
                <TR key={source.title}>
                  <TD className="font-medium">{source.title}</TD>
                  <TD>{source.type}</TD>
                  <TD>
                    <StatusBadge status={source.sensitivity} />
                  </TD>
                  <TD>{source.treatment}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
