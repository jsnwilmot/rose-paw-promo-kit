import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Image as ImageIcon,
  ClipboardList,
  Inbox,
} from "lucide-react";
import {
  isProfileComplete,
  loadKits,
  loadProfile,
  type BusinessProfile,
  type PromoKit,
} from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Rose & Paw" },
      {
        name: "description",
        content:
          "Your Rose & Paw dashboard. Create promo kits, track recent campaigns, and check your business profile.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [kits, setKits] = useState<PromoKit[]>([]);

  useEffect(() => {
    const refresh = () => {
      setProfile(loadProfile());
      setKits(loadKits());
    };
    refresh();
    window.addEventListener("rp:profile-changed", refresh);
    window.addEventListener("rp:kits-changed", refresh);
    return () => {
      window.removeEventListener("rp:profile-changed", refresh);
      window.removeEventListener("rp:kits-changed", refresh);
    };
  }, []);

  const visibleKits = kits.filter((kit) => kit.status !== "archived");
  const activeKits = kits.filter((kit) => kit.status === "active");
  const archivedKits = kits.filter((kit) => kit.status === "archived");
  const requestKits = kits.filter((kit) => kit.source === "design-request-import");
  const completion = profile ? isProfileComplete(profile) : null;
  const completedCount = completion ? Object.values(completion).filter(Boolean).length : 0;
  const totalCount = completion ? Object.values(completion).length : 6;
  const profilePct = Math.round((completedCount / totalCount) * 100);

  const suggestion = !profile?.businessName
    ? { text: "Start by filling in your Business Profile.", to: "/profile", cta: "Set up profile" }
    : !profile?.logoDataUrl
      ? { text: "Add your logo so it appears on your kits.", to: "/profile", cta: "Upload logo" }
      : visibleKits.length === 0
        ? {
            text: "Create your first promo kit in under 2 minutes.",
            to: "/create",
            cta: "Create promo kit",
          }
        : { text: "Plan a new campaign for this week.", to: "/create", cta: "New promo kit" };

  return (
    <AppLayout>
      <div className="space-y-8">
        <header>
          <div className="mb-4 rounded-3xl border border-border bg-card p-4 shadow-card sm:p-5">
            <AppLogo linkToHome={false} subtitle="Heritage & Heart Campaign Builder" />
          </div>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Dashboard</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold text-foreground">
            Welcome{profile?.businessName ? `, ${profile.businessName}` : ""} 👋
          </h1>
          <p className="mt-2 text-muted-foreground">
            Build a complete local promo kit from one short form — posts, flyer copy, ad copy,
            review requests, and a 7-day plan.
          </p>
        </header>

        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex-1">
              <h2 className="font-display text-2xl font-semibold">Suggested next step</h2>
              <p className="mt-1 text-muted-foreground">{suggestion.text}</p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <Link to={suggestion.to}>
                {suggestion.cta}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Saved kits" value={String(visibleKits.length)} />
          <StatCard label="Active kits" value={String(activeKits.length)} />
          <StatCard label="Archived kits" value={String(archivedKits.length)} />
          <StatCard label="Profile complete" value={`${profilePct}%`} />
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold mb-3">Business profile</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{profilePct}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${profilePct}%` }}
                />
              </div>
            </div>
            <ul className="space-y-1.5 text-sm">
              {[
                ["Business name", completion?.businessName],
                ["Business type", completion?.businessType],
                ["Service area", completion?.serviceArea],
                ["Main services", completion?.mainServices],
                ["Brand colours", completion?.brandColours],
                ["Logo uploaded", completion?.logoUploaded],
              ].map(([label, done]) => (
                <li key={label as string} className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle2 className="size-4 text-accent" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/40" />
                  )}
                  <span className={done ? "text-foreground" : "text-muted-foreground"}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to="/profile">Edit profile</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold mb-3">Getting started checklist</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold">
                  1
                </span>
                <span>
                  <strong className="text-foreground">Fill in your business profile</strong> once —
                  name, services, colours, logo.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold">
                  2
                </span>
                <span>
                  <strong className="text-foreground">Tell us about a campaign</strong> — the offer,
                  dates, and tone.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold">
                  3
                </span>
                <span>
                  <strong className="text-foreground">Get a full promo kit</strong> — copy,
                  captions, flyer, ad, plan, and image prompts.
                </span>
              </li>
            </ol>
            <Button asChild className="mt-4 w-full">
              <Link to="/create">Create Promo Kit</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Recent saved kits</h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/kits">View all</Link>
            </Button>
          </div>
          {visibleKits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
              <ClipboardList className="mx-auto size-8 text-muted-foreground/60" />
              <p className="mt-2 text-sm text-muted-foreground">No promo kits saved yet.</p>
              <Button asChild className="mt-4 gap-2">
                <Link to="/create">
                  <Sparkles className="size-4" />
                  Create your first kit
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {visibleKits.slice(0, 4).map((k) => (
                <li key={k.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{k.campaignName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {k.campaignGoal} · {new Date(k.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/kit/$id" params={{ id: k.id }}>
                      Open
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Recent design requests</h3>
            <Button asChild variant="ghost" size="sm">
              <Link to="/requests">Open requests</Link>
            </Button>
          </div>
          {requestKits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
              <Inbox className="mx-auto mb-2 size-6 text-muted-foreground/70" />
              No imported design requests yet. Use the Requests page to import a client package.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {requestKits.slice(0, 4).map((requestKit) => (
                <li key={requestKit.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{requestKit.campaignName}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {requestKit.requesterName || "Requester not provided"} ·{" "}
                      {new Date(requestKit.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/kit/$id" params={{ id: requestKit.id }}>
                      Open
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-cream/50 p-5 flex items-center gap-3 text-sm text-muted-foreground">
          <ImageIcon className="size-5 text-accent shrink-0" />
          {profile?.logoDataUrl ? (
            <span>Your logo is uploaded and ready to appear on new kits.</span>
          ) : (
            <span>
              No logo uploaded yet.{" "}
              <Link to="/profile" className="underline font-medium text-foreground">
                Add one
              </Link>{" "}
              to brand your kits automatically.
            </span>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
