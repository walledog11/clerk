"use client";

import { useEffect, useState } from "react";
import { useOrganizationList } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import AuthShell from "../_components/AuthShell";
import { OrgAvatar } from "@/components/OrgAvatar";
import { formatRole } from "@/lib/format/role";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MembershipItem = {
  role?: string | null;
  organization: {
    id: string;
    name: string;
    imageUrl?: string | null;
  };
};

const highlights = [
  {
    icon: Workflow,
    title: "Separate inboxes, same product",
    description: "Every workspace keeps its own conversations, settings, and analytics.",
  },
  {
    icon: ShieldCheck,
    title: "Safe to switch",
    description: "Changing workspaces updates your active org before returning to the dashboard.",
  },
  {
    icon: CheckCircle2,
    title: "Pick up where you left off",
    description: "Selecting a workspace drops you straight back into its inbox and settings.",
  },
];

export default function SelectOrgPage() {
  const { isLoaded, userMemberships, setActive } = useOrganizationList({
    userMemberships: { infinite: false },
  });
  const router = useRouter();
  const [pendingOrgId, setPendingOrgId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orgs = (userMemberships?.data ?? []) as MembershipItem[];

  useEffect(() => {
    if (isLoaded && orgs.length === 0) {
      router.replace("/onboarding");
    }
  }, [isLoaded, orgs.length, router]);

  async function handleSelect(orgId: string) {
    if (!setActive || pendingOrgId) return;

    setError(null);
    setPendingOrgId(orgId);

    try {
      await setActive({ organization: orgId });
      router.push("/dashboard");
    } catch {
      setPendingOrgId(null);
      setError("Could not switch workspaces. Please try again.");
    }
  }

  return (
    <AuthShell
      backHref="/"
      backLabel="Back to website"
      eyebrow="Workspace access"
      title="Choose the workspace you want to drop into."
      description="Select an active workspace and go straight back to the dashboard with the right team, inbox, and settings already in context."
      aside={
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {highlights.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_80px_-56px_rgba(0,0,0,0.95)]"
            >
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <Icon className="size-4 text-green-400" />
              </div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/55">{description}</p>
            </div>
          ))}
        </div>
      }
      contentClassName="max-w-[30rem]"
    >
      <Card className="overflow-hidden rounded-[1.75rem] border-white/10 bg-[#0f0f0f]/95 shadow-[0_24px_100px_-48px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <CardHeader className="border-b border-white/10 pb-5">
          <CardTitle className="text-lg font-semibold text-white">Your workspaces</CardTitle>
          <CardDescription className="text-white/55">
            {isLoaded
              ? `${orgs.length} available ${orgs.length === 1 ? "workspace" : "workspaces"}`
              : "Loading your workspace access"}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {!isLoaded || orgs.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-5 animate-spin text-white/45" />
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {orgs.map((membership) => {
                const org = membership.organization;
                const isPending = pendingOrgId === org.id;

                return (
                  <li key={org.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(org.id)}
                      disabled={pendingOrgId !== null}
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] disabled:cursor-wait"
                    >
                      <OrgAvatar
                        name={org.name}
                        imageUrl={org.imageUrl}
                        className="size-11 rounded-xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-white/70"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{org.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/35">
                          {formatRole(membership.role)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-white/30 transition-colors group-hover:text-white/65">
                        {isPending ? (
                          <Loader2 className="size-4 animate-spin text-green-400" />
                        ) : (
                          <ArrowRight className="size-4" />
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {error ? (
            <div className="border-t border-white/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </AuthShell>
  );
}
