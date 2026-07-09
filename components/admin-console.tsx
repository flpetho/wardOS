"use client";

import { useEffect, useState } from "react";
import { Building2, Crown, Save, ShieldCheck, Users } from "lucide-react";
import { PageHeading } from "@/components/page-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LeadershipRole, WardOrganization } from "@/lib/types";

type AdminState = {
  workspace: {
    name: string;
    slug: string;
  };
  leadershipRoles: LeadershipRole[];
  organizations: WardOrganization[];
};

const storageKey = "wardos-admin-prototype";

export function AdminConsole({
  workspace,
  leadershipRoles,
  organizations,
}: {
  workspace: { name: string; slug: string };
  leadershipRoles: LeadershipRole[];
  organizations: WardOrganization[];
}) {
  const [adminState, setAdminState] = useState<AdminState>({
    workspace,
    leadershipRoles,
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

  const updateRole = (roleId: string, nextRole: LeadershipRole) => {
    setAdminState((current) => ({
      ...current,
      leadershipRoles: current.leadershipRoles.map((role) =>
        role.id === roleId ? nextRole : role,
      ),
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
          <CardTitle>EQ leadership</CardTitle>
          <CardDescription>Manage the current presidency roster and calling labels.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {adminState.leadershipRoles.map((role) => (
            <div key={role.id} className="rounded-md border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{role.title}</p>
                  <p className="text-sm text-muted-foreground">{role.id.toUpperCase()}</p>
                </div>
                <Badge variant="outline">{role.calling}</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${role.id}-person`} className="text-sm font-medium">
                    Person
                  </label>
                  <Input
                    id={`${role.id}-person`}
                    value={role.person}
                    onChange={(event) => updateRole(role.id, { ...role, person: event.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor={`${role.id}-calling`} className="text-sm font-medium">
                    Calling title
                  </label>
                  <Input
                    id={`${role.id}-calling`}
                    value={role.calling}
                    onChange={(event) => updateRole(role.id, { ...role, calling: event.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor={`${role.id}-summary`} className="text-sm font-medium">
                    Summary
                  </label>
                  <Textarea
                    id={`${role.id}-summary`}
                    value={role.summary}
                    onChange={(event) => updateRole(role.id, { ...role, summary: event.target.value })}
                  />
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
                <Badge variant={organization.status === "Active" ? "default" : "outline"}>
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
                    <option value="Active">Active</option>
                    <option value="Planned">Planned</option>
                    <option value="Later">Later</option>
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
