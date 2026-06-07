import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  defaultSettings,
  exportAll,
  importValidated,
  loadSettings,
  saveSettings,
  validateImport,
  type AppSettings,
  type ValidatedImport,
} from "@/lib/storage";
import { Download, Upload, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Rose & Paw" }] }),
  component: SettingsPage,
});

const TONES = [
  "Friendly",
  "Professional",
  "Fun",
  "Warm",
  "Boutique",
  "Local and personal",
  "Simple and direct",
];

function SettingsPage() {
  const [s, setS] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<ValidatedImport | null>(null);

  useEffect(() => {
    setS(loadSettings());
    setLoaded(true);
  }, []);

  function save() {
    const result = saveSettings(s);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Settings saved.");
  }

  function doExport() {
    const json = exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rose-paw-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded.");
  }

  async function doImport(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Import failed: backup files must be 10 MB or smaller.");
      return;
    }
    const result = validateImport(await file.text());
    if (!result.ok) {
      toast.error(`Import failed: ${result.error}`);
      return;
    }
    setPendingImport(result.data);
  }

  function confirmImport() {
    if (!pendingImport) return;
    const res = importValidated(pendingImport);
    if (!res.ok) {
      toast.error(`Import failed: ${res.error}`);
      return;
    }
    toast.success("Data imported.");
    setS(loadSettings());
    setPendingImport(null);
  }

  if (!loaded)
    return (
      <AppLayout>
        <div className="h-96" />
      </AppLayout>
    );

  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Settings</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">App settings</h1>
        </header>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
          <h2 className="font-display text-xl font-semibold">Defaults</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="agency-name">Agency name</Label>
              <Input
                id="agency-name"
                value={s.agencyName}
                onChange={(e) => setS({ ...s, agencyName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="default-brand-tone">Default brand tone</Label>
              <Select
                value={s.defaultBrandTone}
                onValueChange={(v) => setS({ ...s, defaultBrandTone: v })}
              >
                <SelectTrigger id="default-brand-tone">
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
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="default-service-area">Default city or service area</Label>
              <Input
                id="default-service-area"
                value={s.defaultServiceArea}
                onChange={(e) => setS({ ...s, defaultServiceArea: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
            <div>
              <div className="font-medium">Show Rose &amp; Paw service CTA</div>
              <div className="text-sm text-muted-foreground">
                A small callout at the bottom of generated kits.
              </div>
            </div>
            <Switch
              aria-label="Show service call to action"
              checked={s.showServiceCta}
              onCheckedChange={(v) => setS({ ...s, showServiceCta: v })}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Save settings</Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-4">
          <h2 className="font-display text-xl font-semibold">Backup &amp; restore</h2>
          <p className="text-sm text-muted-foreground">
            Export includes your business profile, uploaded logo, saved promo kits, and app
            settings. Import will validate the file before overwriting your data.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={doExport} variant="outline" className="gap-2">
              <Download className="size-4" /> Export all data (JSON)
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) doImport(f);
                if (fileRef.current) fileRef.current.value = "";
              }}
            />
            <Button onClick={() => fileRef.current?.click()} variant="outline" className="gap-2">
              <Upload className="size-4" /> Import from JSON
            </Button>
          </div>
          {pendingImport && (
            <div
              className="rounded-xl border border-accent/30 bg-accent/10 p-4 space-y-3"
              role="status"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Import preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Validated backup for {pendingImport.preview.businessName}.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPendingImport(null)}
                  aria-label="Dismiss import preview"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Promo kits</dt>
                  <dd className="font-medium">{pendingImport.preview.promoKitCount}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Logo included</dt>
                  <dd className="font-medium">
                    {pendingImport.preview.includesLogo ? "Yes" : "No"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Exported</dt>
                  <dd className="font-medium">
                    {new Date(pendingImport.preview.exportedAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Backup version</dt>
                  <dd className="font-medium">{pendingImport.preview.exportVersion}</dd>
                </div>
              </dl>
              <p className="text-sm text-destructive">
                Continuing will overwrite all current local data on this device.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Import and overwrite</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Overwrite local app data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Importing will replace your current profile, saved kits, and settings on this
                      device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmImport}>Import backup</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
