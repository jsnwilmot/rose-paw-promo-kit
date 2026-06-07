import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { DeleteKitDialog, RenameKitDialog } from "@/components/KitActionDialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { duplicateKitById, renameKitById } from "@/lib/kit-actions";
import {
  deleteKit,
  emptyProfile,
  loadKits,
  loadProfile,
  upsertKit,
  type BusinessProfile,
  type PromoKit,
} from "@/lib/storage";
import { FolderHeart, Pencil, Files, Trash2, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/kits")({
  head: () => ({
    meta: [
      { title: "Saved Kits — Rose & Paw" },
      { name: "description", content: "View, rename, duplicate and delete your saved promo kits." },
    ],
  }),
  component: KitsPage,
});

function KitsPage() {
  const [kits, setKits] = useState<PromoKit[]>([]);
  const [q, setQ] = useState("");
  const [profile, setProfile] = useState<BusinessProfile>(emptyProfile);
  const [renameTarget, setRenameTarget] = useState<PromoKit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoKit | null>(null);

  useEffect(() => {
    const refresh = () => setKits(loadKits());
    setProfile(loadProfile());
    refresh();
    window.addEventListener("rp:kits-changed", refresh);
    return () => window.removeEventListener("rp:kits-changed", refresh);
  }, []);

  const filtered = kits.filter(
    (k) =>
      !q.trim() ||
      k.campaignName.toLowerCase().includes(q.toLowerCase()) ||
      k.campaignGoal.toLowerCase().includes(q.toLowerCase()),
  );

  function rename(title: string) {
    if (!renameTarget) return;
    const updated = renameKitById(renameTarget.id, title);
    if (!updated) return toast.error("The kit could not be renamed.");
    setRenameTarget(null);
    toast.success("Kit renamed.");
  }
  function duplicate(k: PromoKit) {
    if (!duplicateKitById(k.id)) return toast.error("The kit could not be duplicated.");
    toast.success("Kit duplicated.");
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
              Everything you've generated, saved locally on this device.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/create">
              <Sparkles className="size-4" /> New kit
            </Link>
          </Button>
        </header>

        {kits.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              aria-label="Search saved kits"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by campaign name or goal"
              className="pl-9"
            />
          </div>
        )}

        {filtered.length === 0 ? (
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
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((k) => (
              <div
                key={k.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-card flex flex-col"
              >
                <div className="flex items-start gap-3">
                  {k.useLogo && (k.logoSnapshotDataUrl || profile.logoDataUrl) ? (
                    <img
                      src={k.logoSnapshotDataUrl || profile.logoDataUrl}
                      alt={`${k.businessName || "Business"} logo`}
                      className="h-12 w-12 rounded-lg object-contain bg-muted p-1"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-accent/10 grid place-items-center text-accent font-display font-bold">
                      {(k.businessName || "?").charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-lg truncate">{k.campaignName}</div>
                    <div className="text-xs text-muted-foreground truncate">{k.campaignGoal}</div>
                    <Badge variant="secondary" className="mt-2 capitalize">
                      {k.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Saved {new Date(k.createdAt).toLocaleDateString()} · {k.businessName || "—"}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to="/kit/$id" params={{ id: k.id }}>
                      Open
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRenameTarget(k)}
                    className="gap-1.5"
                  >
                    <Pencil className="size-3.5" /> Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicate(k)}
                    className="gap-1.5"
                  >
                    <Files className="size-3.5" /> Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteTarget(k)}
                    className="gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
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
