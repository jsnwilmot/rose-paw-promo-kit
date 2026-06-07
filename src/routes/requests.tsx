import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  buildImportPreview,
  mapRequestBusinessProfileToProfile,
  mapRequestPackageToSavedKit,
  parseDesignRequestPackage,
  type DesignRequestImportPreview,
  type DesignRequestPackage,
} from "@/lib/design-request-import";
import { loadProfile, loadSettings, saveProfile, upsertKit } from "@/lib/storage";
import { AlertCircle, CheckCircle2, FileJson, Inbox, Upload, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Requests - Rose & Paw" },
      {
        name: "description",
        content: "Import a client design request package into the local marketing kit builder.",
      },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [jsonText, setJsonText] = useState("");
  const [fileName, setFileName] = useState("");
  const [requestPackage, setRequestPackage] = useState<DesignRequestPackage | null>(null);
  const [preview, setPreview] = useState<DesignRequestImportPreview | null>(null);
  const [error, setError] = useState("");
  const [replaceProfile, setReplaceProfile] = useState(false);
  const [createSavedKit, setCreateSavedKit] = useState(true);
  const [addInternalNotes, setAddInternalNotes] = useState(true);
  const [confirmProfileReplace, setConfirmProfileReplace] = useState(false);
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState<{ kitId?: string; profileUpdated: boolean } | null>(null);

  function parseInput(input: string, selectedFileName = "") {
    setError("");
    setSuccess(null);
    const result = parseDesignRequestPackage(input);
    if (!result.ok) {
      setRequestPackage(null);
      setPreview(null);
      setError(result.error);
      return;
    }
    setJsonText(input);
    setFileName(selectedFileName);
    setRequestPackage(result.data);
    setPreview(buildImportPreview(result.data));
  }

  async function handleFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError("The request package must be 10 MB or smaller.");
      return;
    }
    parseInput(await file.text(), file.name);
  }

  function cancelPreview() {
    setJsonText("");
    setFileName("");
    setRequestPackage(null);
    setPreview(null);
    setError("");
    setReplaceProfile(false);
    setCreateSavedKit(true);
    setAddInternalNotes(true);
    setSuccess(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function startImport() {
    if (!requestPackage || (!replaceProfile && !createSavedKit)) return;
    if (replaceProfile) {
      setConfirmProfileReplace(true);
      return;
    }
    applyImport();
  }

  function applyImport() {
    if (!requestPackage) return;
    setImporting(true);
    const settings = loadSettings();
    let kitId: string | undefined;
    let profileUpdated = false;

    if (createSavedKit) {
      const kit = mapRequestPackageToSavedKit(requestPackage, {
        addRequestDetailsAsInternalNotes: addInternalNotes,
        settings,
      });
      const result = upsertKit(kit);
      if (!result.ok) {
        setImporting(false);
        setConfirmProfileReplace(false);
        toast.error(result.error);
        return;
      }
      kitId = kit.id;
    }

    if (replaceProfile) {
      const profile = mapRequestBusinessProfileToProfile(requestPackage, loadProfile());
      const result = saveProfile(profile);
      if (!result.ok) {
        setImporting(false);
        setConfirmProfileReplace(false);
        toast.error(result.error);
        return;
      }
      profileUpdated = true;
    }

    setImporting(false);
    setConfirmProfileReplace(false);
    setSuccess({ kitId, profileUpdated });
    if (kitId)
      toast.success("Design request imported. A saved kit was created from the client request.");
    if (profileUpdated) toast.success("Business profile was updated from the request.");
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Requests</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">
            Import Design Request
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Import a client design request package JSON to create a business profile and saved promo
            kit from their request.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-5">
          <div>
            <h2 className="font-display text-xl font-semibold">Request package</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload the downloaded request package or paste its JSON below.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-4" /> Upload request JSON
            </Button>
            {fileName && (
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
                <FileJson className="size-4 text-accent" />
                {fileName}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="request-package-json" className="text-sm font-medium">
              Paste request package JSON
            </label>
            <Textarea
              id="request-package-json"
              rows={8}
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              placeholder='{"packageType":"rose-paw-design-help-request", ...}'
            />
            <Button
              type="button"
              variant="outline"
              disabled={!jsonText.trim()}
              onClick={() => parseInput(jsonText)}
            >
              Preview pasted JSON
            </Button>
          </div>

          {error && (
            <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <strong>Request package could not be loaded.</strong>
                <p className="mt-1">{error}</p>
              </div>
            </div>
          )}
        </section>

        {preview && requestPackage && !success && (
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Import preview</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review the client request before changing local app data.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cancel import preview"
                onClick={cancelPreview}
              >
                <X className="size-4" />
              </Button>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <PreviewItem label="Requester name" value={preview.requesterName} />
              <PreviewItem label="Requester email" value={preview.requesterEmail} />
              <PreviewItem label="Business name" value={preview.businessName} />
              <PreviewItem label="Business type" value={preview.businessType} />
              <PreviewItem label="Service area" value={preview.serviceArea} />
              <PreviewItem label="Primary colour" value={preview.primaryColour} />
              <PreviewItem label="Secondary colour" value={preview.secondaryColour} />
              <PreviewItem label="Promo kit name" value={preview.promoKitName} />
              <PreviewItem label="Campaign goal" value={preview.campaignGoal} />
              <PreviewItem
                label="Generated sections included"
                value={preview.generatedSectionsIncluded ? "Yes" : "No"}
              />
              <PreviewItem
                label="Logo metadata included"
                value={preview.logoMetadataIncluded ? "Yes" : "No"}
              />
              <PreviewItem
                label="Requested services"
                value={
                  preview.requestedServices.length
                    ? preview.requestedServices.join(", ")
                    : "Not provided"
                }
              />
            </dl>

            <fieldset className="space-y-3 border-t border-border pt-5">
              <legend className="font-display text-lg font-semibold">Import options</legend>
              <Option
                label="Replace current business profile with imported business profile"
                checked={replaceProfile}
                onCheckedChange={setReplaceProfile}
              />
              <Option
                label="Create saved promo kit from imported request"
                checked={createSavedKit}
                onCheckedChange={setCreateSavedKit}
              />
              <Option
                label="Add request details as internal notes"
                checked={addInternalNotes}
                disabled={!createSavedKit}
                onCheckedChange={setAddInternalNotes}
              />
            </fieldset>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={cancelPreview}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={startImport}
                disabled={importing || (!replaceProfile && !createSavedKit)}
              >
                {importing ? "Importing..." : "Apply import"}
              </Button>
            </div>
          </section>
        )}

        {success && (
          <section className="rounded-2xl border border-accent/30 bg-accent/10 p-5 sm:p-6">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
              <div>
                <h2 className="font-display text-xl font-semibold">Design request imported</h2>
                {success.kitId && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    A saved kit was created from the client request.
                  </p>
                )}
                {success.profileUpdated && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Business profile was updated from the request.
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {success.kitId && (
                    <Button asChild>
                      <Link to="/kit/$id" params={{ id: success.kitId }}>
                        Open imported kit
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" onClick={cancelPreview}>
                    Import another request
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {!preview && !error && !success && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Inbox className="mx-auto size-10 text-muted-foreground/50" />
            <h2 className="mt-3 font-display text-xl">No request package selected</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload or paste a design request package to begin.
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={confirmProfileReplace} onOpenChange={setConfirmProfileReplace}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace current business profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current active business profile. Saved kits will not be
              changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={applyImport}>Replace profile and import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-medium">{value}</dd>
    </div>
  );
}

function Option({
  label,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        aria-label={label}
      />
      <span>{label}</span>
    </label>
  );
}
