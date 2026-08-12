"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, CheckCircle2, FilePenLine, RotateCcw } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import type { AgendaItem, Assignment, LeadershipRole, Status } from "@/lib/types";

const assignmentStatuses: Status[] = [
  "Not started",
  "In progress",
  "Waiting",
  "Completed",
  "Archived",
];

export function DashboardOperations({
  initialAssignments,
  agendaItems,
  leadershipRoles,
}: {
  initialAssignments: Assignment[];
  agendaItems: AgendaItem[];
  leadershipRoles: LeadershipRole[];
}) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const selectedAssignment =
    assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null;

  const updateAssignment = (nextAssignment: Assignment) => {
    setAssignments((currentAssignments) =>
      currentAssignments.map((assignment) =>
        assignment.id === nextAssignment.id ? nextAssignment : assignment,
      ),
    );
  };

  return (
    <>
      <section className="grid gap-5 lg:grid-cols-[1fr_1.35fr] xl:grid-cols-[1fr_1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>EQ Leadership</CardTitle>
            <CardDescription>Role-owned work across the presidency.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border border-t border-border">
              {leadershipRoles.map((role) => {
                const roleAssignments = assignments.filter((item) => item.ownerRole === role.id);
                const roleAgenda = agendaItems.filter((item) => item.ownerRole === role.id);
                const carriedOver = roleAgenda.filter((item) => item.status === "Carried over");
                const waiting = roleAssignments.filter((item) => item.status === "Waiting");
                const overdue = roleAssignments.filter((item) => isOverdue(item));
                const flags = [
                  overdue.length ? `${overdue.length} overdue` : null,
                  waiting.length ? `${waiting.length} waiting` : null,
                  carriedOver.length ? `${carriedOver.length} carried over` : null,
                ].filter(Boolean) as string[];

                return (
                  <li key={role.id} className="flex items-start justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-foreground">{role.person}</p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">{role.calling}</p>
                      <p data-numeric className="mt-1 text-[13px] text-muted-foreground">
                        {countLabel(roleAssignments.length, "assignment")} ·{" "}
                        {countLabel(roleAgenda.length, "agenda item")}
                      </p>
                    </div>
                    {flags.length ? (
                      <Badge variant="warning">{flags[0]}</Badge>
                    ) : (
                      <Badge variant="success">Clear</Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Select an assignment to update status or ownership.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border border-t border-border">
              {assignments.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedAssignmentId(item.id)}
                    className="flex w-full items-start justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className="min-w-0">
                      <span className="block text-[14px] font-medium text-foreground">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[13px] text-muted-foreground">
                        {resolveRoleLabel(leadershipRoles, item.ownerRole)}
                      </span>
                      <span className="mt-0.5 block text-[13px]">
                        <span className="text-muted-foreground">
                          Due <time dateTime={item.dueDate}>{formatDate(item.dueDate)}</time>
                        </span>
                        {isOverdue(item) ? (
                          <span className="font-medium text-attention"> · Overdue</span>
                        ) : null}
                      </span>
                    </span>
                    <StatusBadge status={item.status} />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Meeting agenda</CardTitle>
            <CardDescription>Current and carried-over agenda items.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ul className="divide-y divide-border border-t border-border">
              {agendaItems.slice(0, 4).map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium text-foreground">{item.title}</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">{item.responsibility}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {selectedAssignment ? (
        <AssignmentModal
          assignment={selectedAssignment}
          leadershipRoles={leadershipRoles}
          onClose={() => setSelectedAssignmentId(null)}
          onChange={updateAssignment}
        />
      ) : null}
    </>
  );
}

function AssignmentModal({
  assignment,
  leadershipRoles,
  onClose,
  onChange,
}: {
  assignment: Assignment;
  leadershipRoles: LeadershipRole[];
  onClose: () => void;
  onChange: (assignment: Assignment) => void;
}) {
  const [draft, setDraft] = useState(assignment);

  const selectedRole = useMemo(
    () => leadershipRoles.find((role) => role.id === draft.ownerRole),
    [draft.ownerRole, leadershipRoles],
  );

  const updateDraft = <Key extends keyof Assignment>(key: Key, value: Assignment[Key]) => {
    setDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
  };

  const saveAndClose = () => {
    onChange(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4">
      <div className="w-full max-w-2xl rounded-lg border bg-card shadow-lg">
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div>
            <h2 className="text-lg font-semibold">Assignment</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Local prototype edits only. Supabase updates come later.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="assignment-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="assignment-title"
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="assignment-owner" className="text-sm font-medium">
              Owner
            </label>
            <select
              id="assignment-owner"
              value={draft.ownerRole}
              onChange={(event) => {
                const nextRole = leadershipRoles.find((role) => role.id === event.target.value);
                if (!nextRole) return;
                updateDraft("ownerRole", nextRole.id);
                updateDraft("owner", nextRole.calling);
                updateDraft("responsibility", nextRole.responsibilities[0] ?? draft.responsibility);
              }}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {leadershipRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.person} · {role.calling}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="assignment-responsibility" className="text-sm font-medium">
              Responsibility
            </label>
            <select
              id="assignment-responsibility"
              value={draft.responsibility}
              onChange={(event) => updateDraft("responsibility", event.target.value)}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {(selectedRole?.responsibilities ?? [draft.responsibility]).map((responsibility) => (
                <option key={responsibility} value={responsibility}>
                  {responsibility}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="assignment-due-date" className="text-sm font-medium">
              Due date
            </label>
            <Input
              id="assignment-due-date"
              type="date"
              value={draft.dueDate}
              onChange={(event) => updateDraft("dueDate", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="assignment-status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="assignment-status"
              value={draft.status}
              onChange={(event) => updateDraft("status", event.target.value as Status)}
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {assignmentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 sm:col-span-2">
            <label htmlFor="assignment-context" className="text-sm font-medium">
              Context
            </label>
            <Textarea
              id="assignment-context"
              value={`${draft.relatedModule} assignment for ${draft.responsibility}. Keep notes operational and avoid sensitive personal details.`}
              readOnly
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t p-5 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setDraft((currentDraft) => ({ ...currentDraft, status: "Completed" }))}
            >
              <CheckCircle2 data-icon="inline-start" />
              Mark complete
            </Button>
            <Button
              variant="outline"
              onClick={() => setDraft((currentDraft) => ({ ...currentDraft, status: "Waiting" }))}
            >
              <CalendarPlus data-icon="inline-start" />
              Add to agenda
            </Button>
            <Button
              variant="outline"
              onClick={() => setDraft((currentDraft) => ({ ...currentDraft, status: "Archived" }))}
            >
              <RotateCcw data-icon="inline-start" />
              Archive
            </Button>
          </div>
          <Button onClick={saveAndClose}>
            <FilePenLine data-icon="inline-start" />
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function countLabel(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function resolveRoleLabel(leadershipRoles: LeadershipRole[], roleId: string) {
  const role = leadershipRoles.find((item) => item.id === roleId);
  return role ? `${role.person} · ${role.calling}` : "Unassigned";
}

function isOverdue(assignment: Assignment) {
  if (assignment.status === "Completed" || assignment.status === "Archived") {
    return false;
  }

  const today = new Date();
  const dueDate = new Date(`${assignment.dueDate}T23:59:59`);
  return dueDate < today;
}
