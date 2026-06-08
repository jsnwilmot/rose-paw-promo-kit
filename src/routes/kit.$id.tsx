import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/CopyButton";
import { SectionCard } from "@/components/SectionCard";
import { BrandHeader } from "@/components/BrandHeader";
import { DeleteKitDialog, RenameKitDialog } from "@/components/KitActionDialogs";
import { DesignHelpRequestDialog } from "@/components/DesignHelpRequestDialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { duplicateKitById, renameKitById } from "@/lib/kit-actions";
import {
  deleteKit,
  getKit,
  loadProfile,
  loadSettings,
  upsertKit,
  type AppSettings,
  type BusinessProfile,
  type KitStatus,
  type PromoKit,
} from "@/lib/storage";
import { ArrowLeft, Printer, Trash2, Pencil, Files } from "lucide-react";
import { toast } from "sonner";
import { resolveSelectedOutputs } from "@/lib/output-selection";

export const Route = createFileRoute("/kit/$id")({
  head: () => ({ meta: [{ title: "Promo Kit — Rose & Paw" }] }),
  component: KitPage,
  notFoundComponent: () => (
    <AppLayout>
      <div className="text-center py-12">
        <h1 className="font-display text-2xl">Kit not found</h1>
        <Button asChild className="mt-4">
          <Link to="/kits">Back to saved kits</Link>
        </Button>
      </div>
    </AppLayout>
  ),
});

function KitPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [kit, setKit] = useState<PromoKit | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [renameTarget, setRenameTarget] = useState<PromoKit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoKit | null>(null);

  useEffect(() => {
    const k = getKit(id);
    setKit(k ?? null);
    setNotFound(!k);
    setSettings(loadSettings());
    setProfile(loadProfile());
    setIsLoading(false);
  }, [id]);

  if (isLoading)
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      </AppLayout>
    );

  if (notFound || !kit || !profile) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="font-display text-2xl">Kit not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This kit may have been deleted or the link may be incorrect.
          </p>
          <Button asChild className="mt-4">
            <Link to="/kits">Back to saved kits</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const headerProfile = {
    businessName: kit.businessName || profile.businessName,
    mainBrandColour: profile.mainBrandColour,
    secondaryBrandColour: profile.secondaryBrandColour,
  };
  const logoUrl = kit.useLogo ? kit.logoSnapshotDataUrl || profile.logoDataUrl : "";
  const g = kit.generatedSections;
  const selectedOutputs = resolveSelectedOutputs(kit.formInputs.selectedOutputs);
  const showPrintableSummary = selectedOutputs.printableSummary;

  function rename(title: string) {
    if (!kit) return;
    const updated = renameKitById(kit.id, title);
    if (!updated) return toast.error("The kit could not be renamed.");
    setKit(updated);
    setRenameTarget(null);
    toast.success("Kit renamed.");
  }

  function duplicate() {
    if (!kit) return;
    const copy = duplicateKitById(kit.id);
    if (!copy) return toast.error("The kit could not be duplicated.");
    toast.success("Kit duplicated.");
    navigate({ to: "/kit/$id", params: { id: copy.id } });
  }

  function remove() {
    if (!kit) return;
    const deleted = kit;
    const result = deleteKit(deleted.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setDeleteTarget(null);
    navigate({ to: "/kits" });
    toast.success("Kit deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          const restored = upsertKit(deleted);
          if (!restored.ok) return toast.error(restored.error);
          toast.success("Kit restored.");
          navigate({ to: "/kit/$id", params: { id: deleted.id } });
        },
      },
    });
  }

  function changeStatus(status: KitStatus) {
    if (!kit) return;
    const updated = { ...kit, status, updatedAt: new Date().toISOString() };
    const result = upsertKit(updated);
    if (!result.ok) return toast.error(result.error);
    setKit(updated);
    toast.success(`Kit marked ${status}.`);
  }

  const fullText = buildFullText(kit);

  return (
    <AppLayout>
      <div className="space-y-6 print-area">
        <div className="no-print flex items-center justify-between flex-wrap gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link to="/kits">
              <ArrowLeft className="size-4" /> All kits
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={fullText} label="Copy full kit" />
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
              <Printer className="size-4" /> Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRenameTarget(kit)}
              className="gap-1.5"
            >
              <Pencil className="size-4" /> Rename
            </Button>
            <Button variant="outline" size="sm" onClick={duplicate} className="gap-1.5">
              <Files className="size-4" /> Duplicate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(kit)}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">Generated kit</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">
            {kit.campaignName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-muted-foreground">
              Saved {new Date(kit.createdAt).toLocaleString()}
            </p>
            <Badge variant="secondary" className="capitalize">
              {kit.status}
            </Badge>
            <Select value={kit.status} onValueChange={(value: KitStatus) => changeStatus(value)}>
              <SelectTrigger className="w-36" aria-label="Campaign status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived" disabled>
                  Archived
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <BrandHeader
          profile={headerProfile}
          logoDataUrl={logoUrl}
          useLogo={kit.useLogo}
          subtitle={`${kit.campaignGoal} · ${g.summary.dates}`}
        />

        <SectionCard title="1. Campaign summary" action={<CopyButton text={summaryText(kit)} />}>
          <dl className="grid gap-3 sm:grid-cols-2 text-sm">
            <Info label="Campaign" value={g.summary.campaignName} />
            <Info label="Goal" value={g.summary.goal} />
            <Info label="Audience" value={g.summary.audience} />
            {g.summary.offer !== "No offer added" && <Info label="Offer" value={g.summary.offer} />}
            <Info label="Dates" value={g.summary.dates} />
            <Info label="Recommended CTA" value={g.summary.recommendedCta} />
            {g.summary.notes && <Info label="Extra notes used" value={g.summary.notes} />}
          </dl>
        </SectionCard>

        {selectedOutputs.facebookPosts && g.facebookPosts && (
          <SectionCard title="Facebook posts" subtitle="Three ready-to-paste options.">
            <BlockList items={g.facebookPosts} />
          </SectionCard>
        )}

        {selectedOutputs.instagramCaptions && g.instagramCaptions && (
          <SectionCard
            title="Instagram captions"
            subtitle="Ready-to-paste captions with hashtags kept separate."
          >
            <BlockList items={g.instagramCaptions} />
          </SectionCard>
        )}

        {selectedOutputs.instagramCaptions && g.hashtagSuggestions?.length ? (
          <SectionCard
            title="Hashtag suggestions"
            action={<CopyButton text={g.hashtagSuggestions.join(" ")} />}
          >
            <p className="text-sm leading-relaxed">{g.hashtagSuggestions.join(" ")}</p>
          </SectionCard>
        ) : null}

        {selectedOutputs.googleBusinessPosts && g.googlePosts && (
          <SectionCard title="Google Business Profile posts">
            <BlockList items={g.googlePosts} />
          </SectionCard>
        )}

        {selectedOutputs.flyerCopy && g.flyer && (
          <SectionCard title="Flyer copy" action={<CopyButton text={flyerText(kit)} />}>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Headline
                </div>
                <div className="font-display text-2xl text-foreground">{g.flyer.headline}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Subheadline
                </div>
                <div className="text-base">{g.flyer.subheadline}</div>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {g.flyer.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <div className="rounded-lg bg-accent/10 px-3 py-2 text-accent-foreground/90">
                <strong>CTA:</strong> {g.flyer.cta}
              </div>
              <div className="text-muted-foreground">{g.flyer.contact}</div>
            </div>
          </SectionCard>
        )}

        {g.emailNewsletter && (
          <SectionCard title="Email newsletter" action={<CopyButton text={emailText(kit)} />}>
            <div className="flex flex-col gap-3 text-sm">
              <Info label="Subject line" value={g.emailNewsletter.subject} />
              <Info label="Preview text" value={g.emailNewsletter.previewText} />
              <Info label="Email body" value={g.emailNewsletter.body} />
              <Info label="CTA" value={g.emailNewsletter.cta} />
            </div>
          </SectionCard>
        )}

        {selectedOutputs.reviewRequests && g.reviewRequests && (
          <SectionCard title="Review request messages">
            <BlockList items={g.reviewRequests} />
          </SectionCard>
        )}

        {selectedOutputs.websiteCopy && g.websiteCopy && (
          <SectionCard
            title="Website section copy"
            action={
              <CopyButton
                text={`${g.websiteCopy.headline}\n\n${g.websiteCopy.paragraph}\n\n[${g.websiteCopy.button}]`}
              />
            }
          >
            <div className="space-y-2">
              <div className="font-display text-xl">{g.websiteCopy.headline}</div>
              <p className="text-sm">{g.websiteCopy.paragraph}</p>
              <Button size="sm" className="mt-2">
                {g.websiteCopy.button}
              </Button>
            </div>
          </SectionCard>
        )}

        {selectedOutputs.faqContent && g.faqContent && (
          <SectionCard title="FAQ content">
            <div className="space-y-3">
              {g.faqContent.map((item) => (
                <div
                  key={item.question}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="font-medium">{item.question}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {selectedOutputs.adCopy && g.adCopy && (
          <SectionCard title="Simple ad copy" action={<CopyButton text={adText(kit)} />}>
            <div className="space-y-2 text-sm">
              <Info label="Headline" value={g.adCopy.headline} />
              <Info label="Primary text" value={g.adCopy.primary} />
              <Info label="Description" value={g.adCopy.description} />
              <Info label="CTA button" value={g.adCopy.ctaButton} />
            </div>
          </SectionCard>
        )}

        {selectedOutputs.imagePrompts && g.imagePrompts && (
          <SectionCard
            title="AI image prompt ideas"
            subtitle="Paste into Canva, ChatGPT, or your favourite tool."
          >
            <div className="space-y-3">
              {g.imagePrompts.map((p, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      Prompt {i + 1}
                    </div>
                    <CopyButton text={p} />
                  </div>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{p}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {selectedOutputs.videoScripts && g.videoScripts && (
          <SectionCard title="Short video script ideas">
            <BlockList items={g.videoScripts} />
          </SectionCard>
        )}

        <SectionCard title="7-day campaign calendar">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-3">Day</th>
                  <th className="py-2 pr-3">Platform</th>
                  <th className="py-2 pr-3">Content type</th>
                  <th className="py-2 pr-3">Topic</th>
                  <th className="py-2">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {g.postingPlan.map((d) => (
                  <tr key={d.day} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3 font-medium">{d.day}</td>
                    <td className="py-2 pr-3">{d.platform}</td>
                    <td className="py-2 pr-3">{d.type}</td>
                    <td className="py-2 pr-3">{d.topic}</td>
                    <td className="py-2 text-muted-foreground">
                      {d.note || "Use this touchpoint to support the campaign."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {showPrintableSummary && (
          <SectionCard
            title="Printable summary"
            subtitle="Use your browser's Print to save as PDF."
          >
            <PrintableSummary kit={kit} headerProfile={headerProfile} logoUrl={logoUrl} />
          </SectionCard>
        )}

        {settings?.showServiceCta && (
          <div className="no-print rounded-2xl border border-accent/20 bg-accent/10 p-5 text-sm flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              Need help turning this kit into branded graphics, flyers, or social media posts?
              Create a design request package you can send to Rose &amp; Paw Digital Designs.
            </div>
            <DesignHelpRequestDialog currentKit={kit} profile={profile} settings={settings} />
          </div>
        )}

        <RenameKitDialog
          kit={renameTarget}
          onOpenChange={(open) => !open && setRenameTarget(null)}
          onRename={rename}
        />
        <DeleteKitDialog
          kit={deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          onDelete={remove}
        />
      </div>
    </AppLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-foreground whitespace-pre-wrap">{value}</div>
    </div>
  );
}

function BlockList({ items }: { items: { label: string; text: string }[] }) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {it.label}
            </div>
            <CopyButton text={it.text} />
          </div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{it.text}</p>
        </div>
      ))}
    </div>
  );
}

function PrintableSummary({
  kit,
  headerProfile,
  logoUrl,
}: {
  kit: PromoKit;
  headerProfile: { businessName: string; mainBrandColour: string; secondaryBrandColour: string };
  logoUrl: string;
}) {
  const g = kit.generatedSections;
  return (
    <div className="rounded-xl border border-border bg-background p-5 space-y-4">
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <div className="flex h-16 w-[140px] items-center justify-center overflow-hidden">
          {kit.useLogo && logoUrl ? (
            <img src={logoUrl} alt="logo" className="max-h-[64px] max-w-[140px] object-contain" />
          ) : (
            <span
              className="font-display text-lg font-bold"
              style={{ color: headerProfile.mainBrandColour }}
            >
              {headerProfile.businessName}
            </span>
          )}
        </div>
        <div>
          <div className="font-display text-2xl font-semibold">{kit.campaignName}</div>
          <div className="text-sm text-muted-foreground">
            {kit.campaignGoal} · {g.summary.dates}
          </div>
        </div>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <Info label="Audience" value={g.summary.audience} />
        {g.summary.offer !== "No offer added" && <Info label="Offer" value={g.summary.offer} />}
        <Info label="Call to action" value={g.summary.recommendedCta} />
        <Info label="Business type" value={kit.businessType} />
      </div>

      {g.flyer && (
        <div>
          <div className="font-display text-lg">{g.flyer.headline}</div>
          <div className="text-sm text-muted-foreground">{g.flyer.subheadline}</div>
          <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
            {g.flyer.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <div className="mt-2 text-sm">
            <strong>{g.flyer.cta}</strong> · {g.flyer.contact}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground border-t border-border pt-3">
        Generated with Rose &amp; Paw — Local Promo Kit Builder
      </div>
    </div>
  );
}

function summaryText(k: PromoKit) {
  const s = k.generatedSections.summary;
  return [
    `Campaign: ${s.campaignName}`,
    `Goal: ${s.goal}`,
    `Audience: ${s.audience}`,
    ...(s.offer !== "No offer added" ? [`Offer: ${s.offer}`] : []),
    `Dates: ${s.dates}`,
    `CTA: ${s.recommendedCta}`,
  ].join("\n");
}
function flyerText(k: PromoKit) {
  const f = k.generatedSections.flyer;
  if (!f) return "";
  return `${f.headline}\n${f.subheadline}\n\n- ${f.bullets.join("\n- ")}\n\nCTA: ${f.cta}\n${f.contact}`;
}
function adText(k: PromoKit) {
  const a = k.generatedSections.adCopy;
  if (!a) return "";
  return `Headline: ${a.headline}\nPrimary: ${a.primary}\nDescription: ${a.description}\nCTA: ${a.ctaButton}`;
}
function emailText(k: PromoKit) {
  const email = k.generatedSections.emailNewsletter;
  if (!email) return "";
  return `Subject: ${email.subject}\nPreview: ${email.previewText}\n\n${email.body}\n\nCTA: ${email.cta}`;
}
function buildFullText(k: PromoKit) {
  const g = k.generatedSections;
  const outputs = resolveSelectedOutputs(k.formInputs.selectedOutputs);
  const sec = (title: string, body: string) => `=== ${title} ===\n${body}\n`;
  return [
    sec("CAMPAIGN SUMMARY", summaryText(k)),
    outputs.facebookPosts && g.facebookPosts
      ? sec("FACEBOOK POSTS", g.facebookPosts.map((p) => `[${p.label}]\n${p.text}`).join("\n\n"))
      : "",
    outputs.instagramCaptions && g.instagramCaptions
      ? sec(
          "INSTAGRAM CAPTIONS",
          g.instagramCaptions.map((p) => `[${p.label}]\n${p.text}`).join("\n\n"),
        )
      : "",
    outputs.instagramCaptions && g.hashtagSuggestions?.length
      ? sec("HASHTAG SUGGESTIONS", g.hashtagSuggestions.join(" "))
      : "",
    outputs.googleBusinessPosts && g.googlePosts
      ? sec(
          "GOOGLE BUSINESS POSTS",
          g.googlePosts.map((p) => `[${p.label}]\n${p.text}`).join("\n\n"),
        )
      : "",
    outputs.flyerCopy && g.flyer ? sec("FLYER COPY", flyerText(k)) : "",
    g.emailNewsletter ? sec("EMAIL NEWSLETTER", emailText(k)) : "",
    outputs.reviewRequests && g.reviewRequests
      ? sec("REVIEW REQUESTS", g.reviewRequests.map((p) => `[${p.label}]\n${p.text}`).join("\n\n"))
      : "",
    outputs.websiteCopy && g.websiteCopy
      ? sec(
          "WEBSITE COPY",
          `${g.websiteCopy.headline}\n\n${g.websiteCopy.paragraph}\n\n[${g.websiteCopy.button}]`,
        )
      : "",
    outputs.faqContent && g.faqContent
      ? sec(
          "FAQ CONTENT",
          g.faqContent.map((item) => `${item.question}\n${item.answer}`).join("\n\n"),
        )
      : "",
    outputs.adCopy && g.adCopy ? sec("AD COPY", adText(k)) : "",
    outputs.imagePrompts && g.imagePrompts
      ? sec(
          "IMAGE PROMPT IDEAS",
          g.imagePrompts.map((p, i) => `Prompt ${i + 1}: ${p}`).join("\n\n"),
        )
      : "",
    outputs.videoScripts && g.videoScripts
      ? sec("VIDEO SCRIPT IDEAS", g.videoScripts.map((p) => `[${p.label}]\n${p.text}`).join("\n\n"))
      : "",
    sec(
      "7-DAY POSTING PLAN",
      g.postingPlan
        .map(
          (d) => `${d.day} — ${d.platform} — ${d.type} — ${d.topic}${d.note ? ` — ${d.note}` : ""}`,
        )
        .join("\n"),
    ),
  ]
    .filter(Boolean)
    .join("\n");
}
