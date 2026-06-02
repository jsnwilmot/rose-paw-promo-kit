import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateKit } from "@/lib/generator";
import { loadProfile, upsertKit, type BusinessProfile, type PromoFormInputs, type PromoKit } from "@/lib/storage";
import { BrandHeader } from "@/components/BrandHeader";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "Create Promo Kit — Rose & Paw" }, { name: "description", content: "Answer a short guided form and get a complete local promo kit." }] }),
  component: CreatePage,
});

const GOALS = [
  "Get more bookings",
  "Promote a new service",
  "Fill slow days",
  "Get more reviews",
  "Promote a seasonal offer",
  "Announce a new business",
  "Bring back past customers",
  "Promote a monthly content campaign",
];

const TONES = ["Friendly", "Professional", "Fun", "Warm", "Boutique", "Local and personal", "Simple and direct"];

function emptyForm(profile: BusinessProfile): PromoFormInputs {
  return {
    campaignName: "",
    campaignGoal: "Get more bookings",
    businessType: profile.businessType,
    featuredService: "",
    offer: "",
    startDate: "",
    endDate: "",
    targetCustomer: profile.targetCustomer,
    mainBenefit: "",
    location: profile.serviceArea,
    tone: profile.brandTone || "Friendly",
    callToAction: "",
    extraNotes: "",
    useLogo: !!profile.logoDataUrl,
  };
}

function CreatePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [form, setForm] = useState<PromoFormInputs | null>(null);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setForm(emptyForm(p));
  }, []);

  if (!profile || !form) return <AppLayout><div className="h-96" /></AppLayout>;

  function up<K extends keyof PromoFormInputs>(k: K, v: PromoFormInputs[K]) {
    setForm((prev) => (prev ? { ...prev, [k]: v } : prev));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !profile) return;
    if (!form.campaignName.trim()) { toast.error("Please give your campaign a name."); return; }
    const generated = generateKit(form, profile);
    const now = new Date().toISOString();
    const kit: PromoKit = {
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      campaignName: form.campaignName,
      campaignGoal: form.campaignGoal,
      businessName: profile.businessName,
      businessType: form.businessType || profile.businessType,
      formInputs: form,
      generatedSections: generated,
      useLogo: form.useLogo,
      logoSnapshotDataUrl: form.useLogo ? profile.logoDataUrl : "",
      logoSnapshotFileName: form.useLogo ? profile.logoFileName : "",
    };
    upsertKit(kit);
    toast.success("Promo kit generated.");
    navigate({ to: "/kit/$id", params: { id: kit.id } });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Create promo kit</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">Tell us about your campaign</h1>
          <p className="mt-2 text-muted-foreground">A short guided form. We'll handle the writing.</p>
        </header>

        {profile.businessName ? (
          <BrandHeader profile={profile} logoDataUrl={profile.logoDataUrl} useLogo={form.useLogo} subtitle="Kit header preview" />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Tip: fill in your <a className="underline font-medium text-foreground" href="/profile">business profile</a> first to brand your kit.
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl font-semibold">The campaign</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Campaign name"><Input value={form.campaignName} onChange={(e) => up("campaignName", e.target.value)} placeholder="e.g. Spring grooming offer" /></Field>
              <Field label="Campaign goal">
                <Select value={form.campaignGoal} onValueChange={(v) => up("campaignGoal", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GOALS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Business type"><Input value={form.businessType} onChange={(e) => up("businessType", e.target.value)} placeholder="e.g. Dog groomer" /></Field>
              <Field label="Featured service"><Input value={form.featuredService} onChange={(e) => up("featuredService", e.target.value)} placeholder="e.g. Full puppy groom" /></Field>
              <Field label="Offer or promotion" className="sm:col-span-2"><Input value={form.offer} onChange={(e) => up("offer", e.target.value)} placeholder="e.g. 15% off first groom" /></Field>
              <Field label="Start date"><Input type="date" value={form.startDate} onChange={(e) => up("startDate", e.target.value)} /></Field>
              <Field label="End date"><Input type="date" value={form.endDate} onChange={(e) => up("endDate", e.target.value)} /></Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl font-semibold">The message</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target customer"><Input value={form.targetCustomer} onChange={(e) => up("targetCustomer", e.target.value)} placeholder="e.g. Local dog owners" /></Field>
              <Field label="Location or service area"><Input value={form.location} onChange={(e) => up("location", e.target.value)} placeholder="e.g. Galway city" /></Field>
              <Field label="Main benefit" className="sm:col-span-2"><Input value={form.mainBenefit} onChange={(e) => up("mainBenefit", e.target.value)} placeholder="e.g. Calm, gentle grooming for nervous pups" /></Field>
              <Field label="Tone">
                <Select value={form.tone} onValueChange={(v) => up("tone", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Call to action"><Input value={form.callToAction} onChange={(e) => up("callToAction", e.target.value)} placeholder="e.g. Message us to book" /></Field>
              <Field label="Extra notes" className="sm:col-span-2"><Textarea rows={3} value={form.extraNotes} onChange={(e) => up("extraNotes", e.target.value)} placeholder="Anything else worth knowing." /></Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold">Use saved business logo</h2>
                <p className="text-sm text-muted-foreground">
                  {profile.logoDataUrl ? "Your saved logo will appear on this kit's header and printable summary." : "No logo saved yet — upload one in Business Profile."}
                </p>
              </div>
              <Switch
                checked={form.useLogo && !!profile.logoDataUrl}
                disabled={!profile.logoDataUrl}
                onCheckedChange={(v) => up("useLogo", v)}
              />
            </div>
          </section>

          <div className="flex justify-end">
            <Button type="submit" size="lg" className="gap-2">
              <Sparkles className="size-4" />
              Generate Promo Kit
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
