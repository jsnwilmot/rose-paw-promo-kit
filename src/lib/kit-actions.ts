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
    campaignName: `${kit.campaignName} (copy)`,
    createdAt: now,
    updatedAt: now,
  };
  return upsertKit(duplicate).ok ? duplicate : null;
}
