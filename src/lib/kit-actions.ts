import { getKit, upsertKit, type PromoKit } from "./storage";

export function renameKitById(id: string, nextTitle: string): PromoKit | null {
  const kit = getKit(id);
  const title = nextTitle.trim();
  if (!kit || !title) return null;

  const updated = { ...kit, campaignName: title, updatedAt: new Date().toISOString() };
  return upsertKit(updated).ok ? updated : null;
}

export function duplicateKitById(id: string): PromoKit | null {
  const kit = getKit(id);
  if (!kit) return null;

  const now = new Date().toISOString();
  const duplicate = {
    ...kit,
    id: crypto.randomUUID(),
    campaignName: `${kit.campaignName} copy`,
    createdAt: now,
    updatedAt: now,
    status: "draft" as const,
    archivedFromStatus: undefined,
  };
  return upsertKit(duplicate).ok ? duplicate : null;
}

export function setKitArchivedById(id: string, archived: boolean): PromoKit | null {
  const kit = getKit(id);
  if (!kit) return null;

  if (!archived && kit.status !== "archived") return kit;

  const restoredStatus = kit.archivedFromStatus || "draft";
  const archivedFromStatus =
    kit.status === "archived" ? kit.archivedFromStatus || "draft" : kit.status;

  const updated = {
    ...kit,
    status: archived ? ("archived" as const) : restoredStatus,
    archivedFromStatus: archived ? archivedFromStatus : undefined,
    updatedAt: new Date().toISOString(),
  };
  return upsertKit(updated).ok ? updated : null;
}

export function saveKitInternalNotesById(id: string, internalNotes: string): PromoKit | null {
  const kit = getKit(id);
  if (!kit) return null;

  const updated = {
    ...kit,
    internalNotes: internalNotes.trim(),
    updatedAt: new Date().toISOString(),
  };
  return upsertKit(updated).ok ? updated : null;
}
