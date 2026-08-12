"use client";

import { useEffect, useState } from "react";
import { Building2, Crown, Save, ShieldCheck, Users } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SeatWithHolder, WardOrganization } from "@/lib/types";

type AdminState = {
  workspace: {
    name: string;
    slug: string;
  };
  seats: SeatWithHolder[];
  organizations: WardOrganization[];
};

const storageKey = "wardos-admin-prototype";

export function AdminConsole({
  workspace,
  seats,
  organizations,
}: {
  workspace: { name: string; slug: string };
  seats: SeatWithHolder[];
  organizations: WardOrganization[];
}) {
  const [adminState, setAdminState] = useState<AdminState>({
    workspace,
    seats,
    organizations,
  });
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (stored) {
      setAdminState(JSON.parse(stored) as AdminState);
    }
  }, []);

  const save = () => {
    window.localStorage.setItem(storageKey, JSON.stringify(adminState));
    setSavedAt(new Date().toLocaleTimeString());
  };

  const updateSeat = (seatId: string, nextSeat: SeatWithHolder) => {
    setAdminState((current) => ({
      ...current,
      seats: current.seats.map((seat) => (seat.id === seatId ? nextSeat : seat)),
    }));
  };

  const updateOrganization = (organizationId: string, nextOrganization: WardOrganization) => {
    setAdminState((current) => ({
      ...current,
      organizations: current.organizations.map((organization) =>
        organization.id === organizationId ? nextOrganization : organization,
      ),
    }));
  };

  return (
    <>
      <PageHeading
        title="Admin"
        description="Prototype control center for ward identity, leadership roster, organizations, and future wardOS expansion."
        action={
          <Button onClick={save}>
            <Save data-icon="inline-start" />
            Save local changes
          </Button>
        }
      />

      {savedAt ? (
        <div className="rounded-md border bg-card p-3 text-sm text-muted-foreground">
          Saved locally at {savedAt}. These changes are browser-local until Supabase writes are wired.
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ward identity</CardTitle>
            <CardDescription>The public name and URL slug for this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="ward-name" className="text-sm font-medium">
                Ward name
              </label>
              <Input
                id="ward-name"
                value={adminState.workspace.name}
                onChange={(event) =>
                  setAdminState((current) => ({
                    ...current,
                    workspace: { ...current.workspace, name: event.target.value },
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="ward-slug" className="text-sm font-medium">
                Public slug
              </label>
              <Input
                id="ward-slug"
                value={adminState.workspace.slug}
                onChange={(event) =>
                  setAdminState((current) => ({
                    ...current,
                    workspace: { ...current.workspace, slug: event.target.value },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin model</CardTitle>
            <CardDescription>One administrator has the keys for v0.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <AdminPrinciple
              icon={<Crown />}
              title="Single owner"
              text="One admin can manage ward identity, leadership roster, organizations, and future settings."
            />
            <AdminPrinciple
              icon={<Users />}
              title="Organization ready"
              text="The model is ready for Relief Society, youth, Primary, and other operating views."
            />
            <AdminPrinciple
              icon={<ShieldCheck />}
              title="Confidential boundary"
              text="Bishopric master view should coordinate operations without storing private bishopric matters."
            />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Seats</CardTitle>
          <CardDescription>
            Callings are permanent; who holds one is a membership with dates. Changing the
            holder is a release and a sustaining, not an edit here.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {adminState.seats.map((seat) => (
            <div key={seat.id} className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{seat.title}</p>
                  <p className="text-[13px] text-muted-foreground">
                    Currently held by {seat.holder?.name ?? "nobody"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge variant={seat.canAdminister ? "default" : "secondary"}>
                    {seat.canAdminister ? "Steward" : "Participant"}
                  </Badge>
                  <span className="text-[12px] text-muted-foreground">{seat.type}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`${seat.id}-title`} className="text-[13px] font-medium">
                    Calling title
                  </label>
                  <Input
                    id={`${seat.id}-title`}
                    value={seat.title}
                    onChange={(event) => updateSeat(seat.id, { ...seat, title: event.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`${seat.id}-summary`} className="text-[13px] font-medium">
                    Summary
                  </label>
                  <Textarea
                    id={`${seat.id}-summary`}
                    value={seat.summary}
                    onChange={(event) => updateSeat(seat.id, { ...seat, summary: event.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium">Areas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {seat.areas.map((area) => (
                      <Badge key={area} variant="outline">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>
            Roadmap for expanding from EQ-only operations into wardOS.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {adminState.organizations.map((organization) => (
            <div key={organization.id} className="rounded-md border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Building2 />
                  <div>
                    <p className="font-medium">{organization.name}</p>
                    <p className="text-sm text-muted-foreground">{organization.shortName}</p>
                  </div>
                </div>
                <Badge variant={organization.status === "active" ? "default" : "outline"}>
                  {organization.status}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${organization.id}-name`} className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id={`${organization.id}-name`}
                    value={organization.name}
                    onChange={(event) =>
                      updateOrganization(organization.id, {
                        ...organization,
                        name: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${organization.id}-leader`} className="text-sm font-medium">
                    Leader
                  </label>
                  <Input
                    id={`${organization.id}-leader`}
                    value={organization.leaderPlaceholder}
                    onChange={(event) =>
                      updateOrganization(organization.id, {
                        ...organization,
                        leaderPlaceholder: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${organization.id}-status`} className="text-sm font-medium">
                    Status
                  </label>
                  <select
                    id={`${organization.id}-status`}
                    value={organization.status}
                    onChange={(event) =>
                      updateOrganization(organization.id, {
                        ...organization,
                        status: event.target.value as WardOrganization["status"],
                      })
                    }
                    className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="active">Active</option>
                    <option value="planned">Planned</option>
                    <option value="later">Later</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor={`${organization.id}-description`} className="text-sm font-medium">
                    Description
                  </label>
                  <Textarea
                    id={`${organization.id}-description`}
                    value={organization.description}
                    onChange={(event) =>
                      updateOrganization(organization.id, {
                        ...organization,
                        description: event.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function AdminPrinciple({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-md border p-3 text-sm">
      <div className="flex items-center gap-2 font-medium">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-muted-foreground">{text}</p>
    </div>
  );
}
