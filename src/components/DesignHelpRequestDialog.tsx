import { useState } from "react";
import { Download, Loader2, Send } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WEB3FORMS_ENDPOINT } from "@/lib/app-config";
import {
  buildDesignHelpFormData,
  buildDesignHelpMessage,
  buildDesignHelpRequestPackage,
  DESIGN_SERVICE_OPTIONS,
  designHelpRequestFileName,
} from "@/lib/design-help-request";
import { loadKits, type AppSettings, type BusinessProfile, type PromoKit } from "@/lib/storage";

type SubmitState = "idle" | "sending" | "success" | "error";

export function DesignHelpRequestDialog({
  currentKit,
  profile,
  settings,
}: {
  currentKit: PromoKit;
  profile: BusinessProfile;
  settings: AppSettings;
}) {
  const [open, setOpen] = useState(false);
  const [kits, setKits] = useState<PromoKit[]>([]);
  const [selectedKit, setSelectedKit] = useState(currentKit);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customNotes, setCustomNotes] = useState("");
  const [message, setMessage] = useState("");
  const [requestCreatedAt, setRequestCreatedAt] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  function makeMessage({
    kit = selectedKit,
    services = selectedServices,
    notes = customNotes,
    requesterName = name,
    requesterEmail = email,
    createdAt = requestCreatedAt,
  } = {}) {
    return buildDesignHelpMessage({
      kit,
      profile,
      selectedServices: services,
      customNotes: notes,
      requesterName,
      requesterEmail,
      createdAt,
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;
    const savedKits = loadKits();
    setKits(
      savedKits.some((kit) => kit.id === currentKit.id) ? savedKits : [currentKit, ...savedKits],
    );
    setSelectedKit(currentKit);
    setName("");
    setEmail("");
    setSelectedServices([]);
    setCustomNotes("");
    const createdAt = new Date().toISOString();
    setRequestCreatedAt(createdAt);
    setMessage(
      buildDesignHelpMessage({
        kit: currentKit,
        profile,
        selectedServices: [],
        customNotes: "",
        requesterName: "",
        requesterEmail: "",
        createdAt,
      }),
    );
    setConsent(false);
    setSubmitState("idle");
  }

  function selectKit(id: string) {
    const nextKit = kits.find((kit) => kit.id === id);
    if (!nextKit) return;
    setSelectedKit(nextKit);
    setMessage(makeMessage({ kit: nextKit }));
    setSubmitState("idle");
  }

  function toggleService(service: string, checked: boolean) {
    const nextServices = checked
      ? [...selectedServices, service]
      : selectedServices.filter((candidate) => candidate !== service);
    setSelectedServices(nextServices);
    setMessage(makeMessage({ services: nextServices }));
    setSubmitState("idle");
  }

  function updateNotes(notes: string) {
    setCustomNotes(notes);
    setMessage(makeMessage({ notes }));
    setSubmitState("idle");
  }

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit =
    !!name.trim() &&
    emailLooksValid &&
    !!selectedKit?.id &&
    selectedServices.length > 0 &&
    !!message.trim() &&
    consent &&
    submitState !== "sending";

  function packageArgs() {
    return {
      kit: selectedKit,
      profile,
      settings,
      selectedServices,
      customNotes,
      requesterName: name,
      requesterEmail: email,
      createdAt: requestCreatedAt,
    };
  }

  function downloadPackage() {
    const json = JSON.stringify(buildDesignHelpRequestPackage(packageArgs()), null, 2);
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = designHelpRequestFileName(selectedKit, profile);
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitState("sending");
    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        body: buildDesignHelpFormData({ ...packageArgs(), message }),
      });
      const result = (await response.json()) as { success?: boolean };
      if (!response.ok || result.success === false) throw new Error("Submission failed");
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Create Design Help Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Create design help request</DialogTitle>
            <DialogDescription>
              Review the package, add your contact details, and send it directly to Rose &amp; Paw
              Digital Designs.
            </DialogDescription>
          </DialogHeader>

          {submitState === "success" && (
            <Alert className="border-accent/30 bg-accent/10">
              <AlertTitle>Request sent</AlertTitle>
              <AlertDescription>
                Your design help request was sent. Rose &amp; Paw Digital Designs will review your
                kit and follow up by email.
              </AlertDescription>
            </Alert>
          )}
          {submitState === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Request not sent</AlertTitle>
              <AlertDescription>
                The request could not be sent. You can still copy the message and email it manually.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" htmlFor="design-request-name">
              <Input
                id="design-request-name"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => {
                  const requesterName = event.target.value;
                  setName(requesterName);
                  setMessage(makeMessage({ requesterName }));
                  setSubmitState("idle");
                }}
              />
            </Field>
            <Field label="Your email" htmlFor="design-request-email">
              <Input
                id="design-request-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => {
                  const requesterEmail = event.target.value;
                  setEmail(requesterEmail);
                  setMessage(makeMessage({ requesterEmail }));
                  setSubmitState("idle");
                }}
              />
            </Field>
          </div>

          <Field label="Promo kit" htmlFor="design-request-kit">
            <Select value={selectedKit.id} onValueChange={selectKit}>
              <SelectTrigger id="design-request-kit" aria-label="Promo kit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kits.map((kit) => (
                  <SelectItem key={kit.id} value={kit.id}>
                    {kit.campaignName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Requested design services</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {DESIGN_SERVICE_OPTIONS.map((service) => (
                <label
                  key={service}
                  className="flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm"
                >
                  <Checkbox
                    checked={selectedServices.includes(service)}
                    onCheckedChange={(checked) => toggleService(service, checked === true)}
                    aria-label={service}
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {selectedServices.includes("Other") && (
            <Field label="Other service notes" htmlFor="design-request-notes">
              <Textarea
                id="design-request-notes"
                rows={3}
                value={customNotes}
                onChange={(event) => updateNotes(event.target.value)}
                placeholder="Describe the other design help you need."
              />
            </Field>
          )}

          <Field label="Request message" htmlFor="design-request-message">
            <p className="text-xs text-muted-foreground">
              You can edit this before sending. The details below will be emailed to Rose &amp; Paw
              Digital Designs.
            </p>
            <Textarea
              id="design-request-message"
              name="message"
              required
              rows={18}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setSubmitState("idle");
              }}
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
            <Checkbox
              checked={consent}
              onCheckedChange={(checked) => {
                setConsent(checked === true);
                setSubmitState("idle");
              }}
              aria-label="Agree to send request details"
            />
            <span>
              I agree that my business profile, branding, and selected kit details will be sent to
              Rose &amp; Paw Digital Designs.
            </span>
          </label>

          <p className="text-xs leading-relaxed text-muted-foreground">
            This sends your selected kit details, business profile, and brand settings to Rose &amp;
            Paw Digital Designs so they can review your request. Nothing is sent until you submit
            this form.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <CopyButton text={message} label="Copy request message" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={downloadPackage}
              >
                <Download className="size-3.5" /> Download request package JSON
              </Button>
            </div>
            <Button type="submit" disabled={!canSubmit} className="gap-2">
              {submitState === "sending" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {submitState === "sending" ? "Sending..." : "Send request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
