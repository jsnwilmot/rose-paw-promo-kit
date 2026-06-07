import { useEffect, useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PromoKit } from "@/lib/storage";

export function RenameKitDialog({
  kit,
  onOpenChange,
  onRename,
}: {
  kit: PromoKit | null;
  onOpenChange: (open: boolean) => void;
  onRename: (title: string) => void;
}) {
  const [title, setTitle] = useState("");

  useEffect(() => setTitle(kit?.campaignName ?? ""), [kit]);

  return (
    <Dialog open={!!kit} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (title.trim()) onRename(title.trim());
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Rename promo kit</DialogTitle>
            <DialogDescription>Use a clear name that will be easy to find later.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rename-kit-title">Kit name</Label>
            <Input
              id="rename-kit-title"
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Save name
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteKitDialog({
  kit,
  onOpenChange,
  onDelete,
}: {
  kit: PromoKit | null;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <AlertDialog open={!!kit} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this promo kit?</AlertDialogTitle>
          <AlertDialogDescription>
            “{kit?.campaignName}” will be removed from this device. You can undo immediately after
            deleting.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete kit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ArchiveKitDialog({
  kit,
  onOpenChange,
  onArchive,
}: {
  kit: PromoKit | null;
  onOpenChange: (open: boolean) => void;
  onArchive: () => void;
}) {
  return (
    <AlertDialog open={!!kit} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive this promo kit?</AlertDialogTitle>
          <AlertDialogDescription>
            “{kit?.campaignName}” will be hidden from the default Saved Kits view. It will not be
            deleted, and you can restore it later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onArchive}>Archive kit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function KitNotesDialog({
  kit,
  onOpenChange,
  onSave,
}: {
  kit: PromoKit | null;
  onOpenChange: (open: boolean) => void;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState("");

  useEffect(() => setNotes(kit?.internalNotes ?? ""), [kit]);

  return (
    <Dialog open={!!kit} onOpenChange={onOpenChange}>
      <DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(notes);
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>Internal kit notes</DialogTitle>
            <DialogDescription>
              Add private working notes for this saved kit. These notes are included in backups.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kit-internal-notes">Notes</Label>
            <Textarea
              id="kit-internal-notes"
              rows={6}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add follow-up details, client requests, or production notes."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save notes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
