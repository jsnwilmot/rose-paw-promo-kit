import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Trash2, ImageOff } from "lucide-react";
import { emptyProfile, fileToDataUrl, loadProfile, saveProfile, type BusinessProfile } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Business Profile — Rose & Paw" }, { name: "description", content: "Set up your business profile, brand colours, and logo." }] }),
  component: ProfilePage,
});

const TONES = ["Friendly", "Professional", "Fun", "Warm", "Boutique", "Local and personal", "Simple and direct"];
const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

function ProfilePage() {
  const [p, setP] = useState<BusinessProfile>(emptyProfile);
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setP(loadProfile());
    setLoaded(true);
  }, []);

  function update<K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
  }

  async function handleFile(file: File) {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Unsupported file type. Use PNG, JPG, SVG, or WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("That image is over 2 MB. Please choose a smaller file.");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setP((prev) => ({
        ...prev,
        logoDataUrl: dataUrl,
        logoFileName: file.name,
        logoMimeType: file.type,
        logoUploadedAt: new Date().toISOString(),
      }));
      toast.success("Logo ready — don't forget to save.");
    } catch {
      toast.error("Couldn't read that image. Please try another.");
    }
  }

  function removeLogo() {
    setP((prev) => ({ ...prev, logoDataUrl: "", logoFileName: "", logoMimeType: "", logoUploadedAt: "" }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveProfile(p);
    toast.success("Business profile saved.");
  }

  if (!loaded) return <AppLayout><div className="h-96" /></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Business profile</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">Tell us about your business</h1>
          <p className="mt-2 text-muted-foreground">We'll reuse this every time you create a promo kit.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl font-semibold">Basics</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name"><Input value={p.businessName} onChange={(e) => update("businessName", e.target.value)} placeholder="e.g. Rosie's Home Salon" /></Field>
              <Field label="Business type"><Input value={p.businessType} onChange={(e) => update("businessType", e.target.value)} placeholder="e.g. Dog groomer, Cleaner, Tutor" /></Field>
              <Field label="City or service area"><Input value={p.serviceArea} onChange={(e) => update("serviceArea", e.target.value)} placeholder="e.g. Galway and surrounding areas" /></Field>
              <Field label="Target customer"><Input value={p.targetCustomer} onChange={(e) => update("targetCustomer", e.target.value)} placeholder="e.g. Busy local families" /></Field>
            </div>
            <Field label="Short business description">
              <Textarea rows={3} value={p.businessDescription} onChange={(e) => update("businessDescription", e.target.value)} placeholder="One or two sentences about what you do." />
            </Field>
            <Field label="Main services" hint="Separate with commas.">
              <Textarea rows={2} value={p.mainServices} onChange={(e) => update("mainServices", e.target.value)} placeholder="e.g. Puppy grooming, Nail trims, De-shedding" />
            </Field>
            <Field label="Default brand tone">
              <Select value={p.brandTone} onValueChange={(v) => update("brandTone", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl font-semibold">Brand look</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Main brand colour">
                <ColorField value={p.mainBrandColour} onChange={(v) => update("mainBrandColour", v)} />
              </Field>
              <Field label="Secondary brand colour">
                <ColorField value={p.secondaryBrandColour} onChange={(v) => update("secondaryBrandColour", v)} />
              </Field>
            </div>

            <div>
              <Label className="mb-2 block">Business logo</Label>
              <p className="mb-3 text-xs text-muted-foreground">Use a clear PNG or SVG logo for best results.</p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex h-32 w-full sm:w-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-3 overflow-hidden">
                  {p.logoDataUrl ? (
                    <img src={p.logoDataUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground text-xs">
                      <ImageOff className="size-6 mb-1" />
                      No logo yet
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
                    <Upload className="size-4" /> {p.logoDataUrl ? "Replace logo" : "Upload logo"}
                  </Button>
                  {p.logoDataUrl && (
                    <Button type="button" variant="ghost" onClick={removeLogo} className="gap-2 text-destructive hover:text-destructive">
                      <Trash2 className="size-4" /> Remove
                    </Button>
                  )}
                  {p.logoFileName && <p className="text-xs text-muted-foreground">{p.logoFileName}</p>}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl font-semibold">Contact &amp; links</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business phone or contact"><Input value={p.contactMethod} onChange={(e) => update("contactMethod", e.target.value)} placeholder="e.g. 087 123 4567 or hello@you.com" /></Field>
              <Field label="Website link"><Input value={p.websiteLink} onChange={(e) => update("websiteLink", e.target.value)} placeholder="https://" /></Field>
              <Field label="Facebook link"><Input value={p.facebookLink} onChange={(e) => update("facebookLink", e.target.value)} placeholder="https://facebook.com/..." /></Field>
              <Field label="Instagram link"><Input value={p.instagramLink} onChange={(e) => update("instagramLink", e.target.value)} placeholder="https://instagram.com/..." /></Field>
              <Field label="Google Business Profile link"><Input value={p.googleBusinessProfileLink} onChange={(e) => update("googleBusinessProfileLink", e.target.value)} placeholder="https://g.page/..." /></Field>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button type="submit" size="lg">Save profile</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ColorField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value || "#7A3B2E"}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-12 cursor-pointer rounded-md border border-border bg-background"
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="#7A3B2E" />
    </div>
  );
}
