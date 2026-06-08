import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateKit } from "@/lib/generator";
import {
  getStorageAudit,
  loadProfile,
  loadSettings,
  upsertKit,
  type AppSettings,
  type BusinessProfile,
  type PromoFormInputs,
  type PromoKit,
} from "@/lib/storage";
import { BrandHeader } from "@/components/BrandHeader";
import {
  allOutputs,
  hasContentOutput,
  OUTPUT_OPTIONS,
  recommendedOutputs,
} from "@/lib/output-selection";
import { CalendarCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create Promo Kit — Rose & Paw" },
      {
        name: "description",
        content: "Answer a short guided form and get a complete local promo kit.",
      },
    ],
  }),
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

const TONES = [
  "Friendly",
  "Professional",
  "Fun",
  "Warm",
  "Boutique",
  "Local and personal",
  "Simple and direct",
];

function emptyForm(profile: BusinessProfile, settings: AppSettings): PromoFormInputs {
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
    location: profile.serviceArea || settings.defaultServiceArea,
    tone: profile.brandTone || settings.defaultBrandTone,
    callToAction: "",
    extraNotes: "",
    useLogo: !!profile.logoDataUrl,
    selectedOutputs: { ...recommendedOutputs },
  };
}

function CreatePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [form, setForm] = useState<PromoFormInputs | null>(null);
  const [errors, setErrors] = useState<{
    campaignName?: string;
    endDate?: string;
    outputs?: string;
  }>({});

  useEffect(() => {
    const rehydrate = () => {
      const p = loadProfile();
      const appSettings = loadSettings();
      setProfile(p);
      setSettings(appSettings);
      setForm((previous) => previous ?? emptyForm(p, appSettings));
    };

    rehydrate();
    window.addEventListener("rp:profile-changed", rehydrate);
    window.addEventListener("rp:settings-changed", rehydrate);

    return () => {
      window.removeEventListener("rp:profile-changed", rehydrate);
      window.removeEventListener("rp:settings-changed", rehydrate);
    };
  }, []);

  if (!profile || !settings || !form)
    return (
      <AppLayout>
        <div className="h-96" />
      </AppLayout>
    );

  function up<K extends keyof PromoFormInputs>(k: K, v: PromoFormInputs[K]) {
    setForm((prev) => (prev ? { ...prev, [k]: v } : prev));
    if (k === "campaignName" || k === "endDate" || k === "startDate") {
      setErrors((previous) => ({
        ...previous,
        campaignName: k === "campaignName" ? undefined : previous.campaignName,
        endDate: undefined,
      }));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || !profile || !settings) return;
    const nextErrors: typeof errors = {};
    if (!form.campaignName.trim()) nextErrors.campaignName = "Campaign name is required.";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      nextErrors.endDate = "End date cannot be before the start date.";
    }
    if (!form.selectedOutputs || !hasContentOutput(form.selectedOutputs)) {
      nextErrors.outputs = "Choose at least one content output to generate a useful marketing kit.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    const generated = generateKit(form, profile, settings);
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
      logoSnapshotDataUrl: form.useLogo && profile.logoDataUrl ? profile.logoDataUrl : "",
      logoSnapshotFileName: form.useLogo && profile.logoFileName ? profile.logoFileName : "",
      status: "draft",
      internalNotes: "",
    };
    const result = upsertKit(kit);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    const audit = getStorageAudit();
    if (audit.nearQuota) {
      toast(
        "Storage warning: saved kits are getting large. Export a backup and remove old kits soon.",
      );
    }
    toast.success("Promo kit generated.");
    navigate({ to: "/kit/$id", params: { id: kit.id } });
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            Create promo kit
          </p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">
            Tell us about your campaign
          </h1>
          <p className="mt-2 text-muted-foreground">
            A short guided form. We'll handle the writing.
          </p>
        </header>

        {profile.businessName ? (
          <BrandHeader
            profile={profile}
            logoDataUrl={profile.logoDataUrl}
            useLogo={form.useLogo}
            subtitle="Kit header preview"
            showAppBrand
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Tip: fill in your{" "}
            <Link className="underline font-medium text-foreground" to="/profile">
              business profile
            </Link>{" "}
            first to brand your kit.
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl font-semibold">The Foundation</h2>
            <p className="text-sm text-muted-foreground">
              Define the campaign basics first so every section in your kit stays consistent.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Campaign name" htmlFor="campaign-name" error={errors.campaignName}>
                <Input
                  id="campaign-name"
                  aria-invalid={!!errors.campaignName}
                  aria-describedby={errors.campaignName ? "campaign-name-error" : undefined}
                  value={form.campaignName}
                  onChange={(e) => up("campaignName", e.target.value)}
                  placeholder="e.g. Spring grooming offer"
                />
              </Field>
              <Field label="Campaign goal" htmlFor="campaign-goal">
                <Select value={form.campaignGoal} onValueChange={(v) => up("campaignGoal", v)}>
                  <SelectTrigger id="campaign-goal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Business type" htmlFor="business-type">
                <Input
                  id="business-type"
                  value={form.businessType}
                  onChange={(e) => up("businessType", e.target.value)}
                  placeholder="e.g. Dog groomer"
                />
              </Field>
              <Field label="Featured service" htmlFor="featured-service">
                <Input
                  id="featured-service"
                  value={form.featuredService}
                  onChange={(e) => up("featuredService", e.target.value)}
                  placeholder="e.g. Full puppy groom"
                />
              </Field>
              <Field label="Offer or promotion" htmlFor="offer" className="sm:col-span-2">
                <Input
                  id="offer"
                  value={form.offer}
                  onChange={(e) => up("offer", e.target.value)}
                  placeholder="e.g. 15% off first groom"
                />
              </Field>
              <Field label="Start date" htmlFor="start-date">
                <Input
                  id="start-date"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => up("startDate", e.target.value)}
                />
              </Field>
              <Field label="End date" htmlFor="end-date" error={errors.endDate}>
                <Input
                  id="end-date"
                  type="date"
                  min={form.startDate || undefined}
                  aria-invalid={!!errors.endDate}
                  aria-describedby={errors.endDate ? "end-date-error" : undefined}
                  value={form.endDate}
                  onChange={(e) => up("endDate", e.target.value)}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl font-semibold">Who are we reaching?</h2>
            <p className="text-sm text-muted-foreground">
              Add customer and location context so generated copy sounds local and specific.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Target customer" htmlFor="target-customer">
                <Input
                  id="target-customer"
                  value={form.targetCustomer}
                  onChange={(e) => up("targetCustomer", e.target.value)}
                  placeholder="e.g. Local dog owners"
                />
              </Field>
              <Field label="Location or service area" htmlFor="location">
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => up("location", e.target.value)}
                  placeholder="e.g. Galway city"
                />
              </Field>
              <Field label="Main benefit" htmlFor="main-benefit" className="sm:col-span-2">
                <Input
                  id="main-benefit"
                  value={form.mainBenefit}
                  onChange={(e) => up("mainBenefit", e.target.value)}
                  placeholder="e.g. Calm, gentle grooming for nervous pups"
                />
              </Field>
              <Field label="Tone" htmlFor="tone">
                <Select value={form.tone} onValueChange={(v) => up("tone", v)}>
                  <SelectTrigger id="tone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Call to action" htmlFor="call-to-action">
                <Input
                  id="call-to-action"
                  value={form.callToAction}
                  onChange={(e) => up("callToAction", e.target.value)}
                  placeholder="e.g. Message us to book"
                />
              </Field>
              <Field label="Extra notes" htmlFor="extra-notes" className="sm:col-span-2">
                <Textarea
                  id="extra-notes"
                  rows={3}
                  value={form.extraNotes}
                  onChange={(e) => up("extraNotes", e.target.value)}
                  placeholder="Anything else worth knowing."
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-5">
            <div>
              <h2 className="font-display text-xl font-semibold">Delivery Channels</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick the content you actually need. Your campaign calendar will be built around
                these choices.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => up("selectedOutputs", { ...recommendedOutputs })}
              >
                Select recommended
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => up("selectedOutputs", { ...allOutputs })}
              >
                Select all
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  up(
                    "selectedOutputs",
                    Object.fromEntries(
                      OUTPUT_OPTIONS.map(({ key }) => [key, false]),
                    ) as typeof allOutputs,
                  )
                }
              >
                Clear optional outputs
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {OUTPUT_OPTIONS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm"
                >
                  <Checkbox
                    checked={form.selectedOutputs?.[key] ?? false}
                    onCheckedChange={(checked) => {
                      up("selectedOutputs", {
                        ...(form.selectedOutputs || recommendedOutputs),
                        [key]: checked === true,
                      });
                      setErrors((previous) => ({ ...previous, outputs: undefined }));
                    }}
                    aria-label={label}
                  />
                  <span>{label}</span>
                </label>
              ))}
              <div className="flex items-center gap-3 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm">
                <CalendarCheck className="size-5 text-accent" />
                <div>
                  <div className="font-medium">Campaign calendar included</div>
                  <div className="text-xs text-muted-foreground">Always included</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Campaign calendar is always included so you can see the recommended marketing flow.
            </p>
            {errors.outputs && <p className="text-sm text-destructive">{errors.outputs}</p>}
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold">Campaign Snapshot</h2>
                <p className="text-sm text-muted-foreground">
                  {profile.logoDataUrl
                    ? "Your saved logo will appear on this kit's header and printable summary."
                    : "No logo saved yet — upload one in Business Profile."}
                </p>
              </div>
              <Switch
                aria-label="Use saved business logo"
                checked={form.useLogo && !!profile.logoDataUrl}
                disabled={!profile.logoDataUrl}
                onCheckedChange={(v) => up("useLogo", v)}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-xl font-semibold">Ready to generate</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Once generated, your kit is saved locally and includes a campaign calendar by default.
            </p>
            <div className="mt-4 flex justify-end">
              <Button type="submit" size="lg" className="gap-2">
                <Sparkles className="size-4" />
                Generate Promo Kit
              </Button>
            </div>
          </section>
        </form>
      </div>
    </AppLayout>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
