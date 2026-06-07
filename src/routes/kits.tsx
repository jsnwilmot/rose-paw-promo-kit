import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  ArchiveKitDialog,
  DeleteKitDialog,
  KitNotesDialog,
  RenameKitDialog,
} from "@/components/KitActionDialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  duplicateKitById,
  renameKitById,
  saveKitInternalNotesById,
  setKitArchivedById,
} from "@/lib/kit-actions";
import {
  deleteKit,
  emptyProfile,
  loadKits,
  loadProfile,
  upsertKit,
  type BusinessProfile,
  type PromoKit,
} from "@/lib/storage";
import {
  Archive,
  ArchiveRestore,
  Files,
  FolderHeart,
  Pencil,
  Search,
  Sparkles,
  StickyNote,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/kits")({
  head: () => ({
    meta: [
      { title: "Saved Kits — Rose & Paw" },
      {
        name: "description",
        content: "Search, filter, organize, duplicate, archive, and update saved promo kits.",
      },
    ],
  }),
  component: KitsPage,
});

type SortOption = "newest" | "oldest" | "business" | "campaign";

function KitsPage() {
  const [kits, setKits] = useState<PromoKit[]>([]);
  const [query, setQuery] = useState("");
  const [businessFilter, setBusinessFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showArchived, setShowArchived] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile);
  const [renameTarget, setRenameTarget] = useState<PromoKit | null>(null);
  const [notesTarget, setNotesTarget] = useState<PromoKit | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<PromoKit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoKit | null>(null);

  useEffect(() => {
    const refresh = () => setKits(loadKits());
    setProfile(loadProfile());
    refresh();
    window.addEventListener("rp:kits-changed", refresh);
    return () => window.removeEventListener("rp:kits-changed", refresh);
  }, []);

  const businessNames = uniqueSorted(kits.map((kit) => kit.businessName).filter(Boolean));
  const campaignGoals = uniqueSorted(kits.map((kit) => kit.campaignGoal).filter(Boolean));
  const businessTypes = uniqueSorted(kits.map((kit) => kit.businessType).filter(Boolean));
  const normalizedQuery = query.trim().toLowerCase();
  const visibleKits = kits
    .filter((kit) => showArchived || kit.status !== "archived")
    .filter((kit) => businessFilter === "all" || kit.businessName === businessFilter)
    .filter((kit) => {
      if (campaignFilter === "all") return true;
      const [kind, value] = campaignFilter.split(":", 2);
      return kind === "goal" ? kit.campaignGoal === value : kit.businessType === value;
    })
    .filter((kit) => !normalizedQuery || kitSearchText(kit).includes(normalizedQuery))
    .sort((a, b) => sortKits(a, b, sort));

  const archivedCount = kits.filter((kit) => kit.status === "archived").length;
  const hasActiveFilters =
    !!query.trim() || businessFilter !== "all" || campaignFilter !== "all" || showArchived;

  function rename(title: string) {
    if (!renameTarget) return;
    const updated = renameKitById(renameTarget.id, title);
    if (!updated) return toast.error("The kit could not be renamed.");
    setRenameTarget(null);
    toast.success("Kit renamed.");
  }

  function duplicate(kit: PromoKit) {
    const copy = duplicateKitById(kit.id);
    if (!copy) return toast.error("The kit could not be duplicated.");
    toast.success(`Kit duplicated as “${copy.campaignName}”.`);
  }

  function saveNotes(notes: string) {
    if (!notesTarget) return;
    const updated = saveKitInternalNotesById(notesTarget.id, notes);
    if (!updated) return toast.error("The notes could not be saved.");
    setNotesTarget(null);
    toast.success("Internal notes saved.");
  }

  function archive() {
    if (!archiveTarget) return;
    const updated = setKitArchivedById(archiveTarget.id, true);
    if (!updated) return toast.error("The kit could not be archived.");
    setArchiveTarget(null);
    toast.success("Kit archived.");
  }

  function restore(kit: PromoKit) {
    if (!setKitArchivedById(kit.id, false)) return toast.error("The kit could not be restored.");
    toast.success("Kit restored.");
  }

  function remove() {
    if (!deleteTarget) return;
    const deleted = deleteTarget;
    const result = deleteKit(deleted.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setDeleteTarget(null);
    toast.success("Kit deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          const restored = upsertKit(deleted);
          if (!restored.ok) return toast.error(restored.error);
          toast.success("Kit restored.");
        },
      },
    });
  }

  function clearFilters() {
    setQuery("");
    setBusinessFilter("all");
    setCampaignFilter("all");
    setSort("newest");
    setShowArchived(false);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <header className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-accent">Saved kits</p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold">
              Your promo kits
            </h1>
            <p className="mt-2 text-muted-foreground">
              Find and organize client campaigns saved on this device.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/create">
              <Sparkles className="size-4" /> New kit
            </Link>
          </Button>
        </header>

        {kits.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-card space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                aria-label="Search saved kits"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search campaigns, businesses, locations, or notes"
                className="pl-9"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FilterField label="Business">
                <Select value={businessFilter} onValueChange={setBusinessFilter}>
                  <SelectTrigger aria-label="Filter by business name">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All businesses</SelectItem>
                    {businessNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Campaign goal or type">
                <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                  <SelectTrigger aria-label="Filter by campaign goal or type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All goals and types</SelectItem>
                    {campaignGoals.map((goal) => (
                      <SelectItem key={`goal:${goal}`} value={`goal:${goal}`}>
                        Goal: {goal}
                      </SelectItem>
                    ))}
                    {businessTypes.map((type) => (
                      <SelectItem key={`type:${type}`} value={`type:${type}`}>
                        Type: {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
              <FilterField label="Sort">
                <Select value={sort} onValueChange={(value: SortOption) => setSort(value)}>
                  <SelectTrigger aria-label="Sort saved kits">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="business">Business name A-Z</SelectItem>
                    <SelectItem value="campaign">Campaign name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </FilterField>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Switch
                  aria-label="Show archived kits"
                  checked={showArchived}
                  onCheckedChange={setShowArchived}
                />
                Show archived kits{archivedCount > 0 ? ` (${archivedCount})` : ""}
              </label>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>
                  {visibleKits.length} of {kits.length} kits
                </span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </section>
        )}

        {kits.length === 0 ? (
          <EmptyKits />
        ) : visibleKits.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Search className="mx-auto size-9 text-muted-foreground/50" />
            <h2 className="mt-3 font-display text-xl">No saved kits match</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search or filter
              {!showArchived && archivedCount > 0 ? ", or show archived kits" : ""}.
            </p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleKits.map((kit) => (
              <KitCard
                key={kit.id}
                kit={kit}
                profile={profile}
                onRename={() => setRenameTarget(kit)}
                onDuplicate={() => duplicate(kit)}
                onNotes={() => setNotesTarget(kit)}
                onArchive={() => setArchiveTarget(kit)}
                onRestore={() => restore(kit)}
                onDelete={() => setDeleteTarget(kit)}
              />
            ))}
          </div>
        )}

        <RenameKitDialog
          kit={renameTarget}
          onOpenChange={(open) => !open && setRenameTarget(null)}
          onRename={rename}
        />
        <KitNotesDialog
          kit={notesTarget}
          onOpenChange={(open) => !open && setNotesTarget(null)}
          onSave={saveNotes}
        />
        <ArchiveKitDialog
          kit={archiveTarget}
          onOpenChange={(open) => !open && setArchiveTarget(null)}
          onArchive={archive}
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

function KitCard({
  kit,
  profile,
  onRename,
  onDuplicate,
  onNotes,
  onArchive,
  onRestore,
  onDelete,
}: {
  kit: PromoKit;
  profile: BusinessProfile;
  onRename: () => void;
  onDuplicate: () => void;
  onNotes: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const updated = new Date(kit.updatedAt).toLocaleDateString();
  const created = new Date(kit.createdAt).toLocaleDateString();
  const preview =
    kit.generatedSections.summary.offer !== "No offer added"
      ? kit.generatedSections.summary.offer
      : kit.generatedSections.summary.audience;

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-card flex flex-col">
      <div className="flex items-start gap-3">
        {kit.useLogo && (kit.logoSnapshotDataUrl || profile.logoDataUrl) ? (
          <img
            src={kit.logoSnapshotDataUrl || profile.logoDataUrl}
            alt={`${kit.businessName || "Business"} logo`}
            className="h-12 w-12 rounded-lg object-contain bg-muted p-1"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-accent/10 grid place-items-center text-accent font-display font-bold">
            {(kit.businessName || "?").charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg leading-tight">{kit.campaignName}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {kit.businessName || "Unnamed business"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {kit.status}
            </Badge>
            <Badge variant="outline">{kit.campaignGoal}</Badge>
          </div>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{preview}</p>
      {kit.internalNotes && (
        <p className="mt-3 line-clamp-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <strong className="text-foreground">Internal notes:</strong> {kit.internalNotes}
        </p>
      )}
      <div className="mt-3 text-xs text-muted-foreground">
        Created {created}
        {updated !== created ? ` · Updated ${updated}` : ""}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link to="/kit/$id" params={{ id: kit.id }}>
            Open
          </Link>
        </Button>
        <Button size="sm" variant="outline" onClick={onDuplicate} className="gap-1.5">
          <Files className="size-3.5" /> Duplicate
        </Button>
        <Button size="sm" variant="outline" onClick={onRename} className="gap-1.5">
          <Pencil className="size-3.5" /> Rename
        </Button>
        <Button size="sm" variant="outline" onClick={onNotes} className="gap-1.5">
          <StickyNote className="size-3.5" /> Notes
        </Button>
        {kit.status === "archived" ? (
          <Button size="sm" variant="outline" onClick={onRestore} className="gap-1.5">
            <ArchiveRestore className="size-3.5" /> Restore
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={onArchive} className="gap-1.5">
            <Archive className="size-3.5" /> Archive
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="gap-1.5 text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" /> Delete
        </Button>
      </div>
    </article>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function EmptyKits() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <FolderHeart className="mx-auto size-10 text-muted-foreground/50" />
      <h2 className="mt-3 font-display text-xl">No kits yet</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Create your first promo kit in a couple of minutes.
      </p>
      <Button asChild className="mt-4 gap-2">
        <Link to="/create">
          <Sparkles className="size-4" /> Create promo kit
        </Link>
      </Button>
    </div>
  );
}

function kitSearchText(kit: PromoKit) {
  return [
    kit.campaignName,
    kit.businessName,
    kit.businessType,
    kit.campaignGoal,
    kit.formInputs.location,
    kit.internalNotes,
  ]
    .join(" ")
    .toLowerCase();
}

function uniqueSorted(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function sortKits(a: PromoKit, b: PromoKit, sort: SortOption) {
  if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
  if (sort === "business") return a.businessName.localeCompare(b.businessName);
  if (sort === "campaign") return a.campaignName.localeCompare(b.campaignName);
  return b.createdAt.localeCompare(a.createdAt);
}
