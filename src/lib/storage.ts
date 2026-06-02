export type BusinessProfile = {
  businessName: string;
  businessType: string;
  serviceArea: string;
  businessDescription: string;
  mainServices: string;
  targetCustomer: string;
  brandTone: string;
  websiteLink: string;
  facebookLink: string;
  instagramLink: string;
  googleBusinessProfileLink: string;
  contactMethod: string;
  mainBrandColour: string;
  secondaryBrandColour: string;
  logoDataUrl: string;
  logoFileName: string;
  logoMimeType: string;
  logoUploadedAt: string;
};

export type PromoFormInputs = {
  campaignName: string;
  campaignGoal: string;
  businessType: string;
  featuredService: string;
  offer: string;
  startDate: string;
  endDate: string;
  targetCustomer: string;
  mainBenefit: string;
  location: string;
  tone: string;
  callToAction: string;
  extraNotes: string;
  useLogo: boolean;
};

export type GeneratedSections = {
  summary: {
    campaignName: string;
    goal: string;
    audience: string;
    offer: string;
    dates: string;
    recommendedCta: string;
  };
  facebookPosts: { label: string; text: string }[];
  instagramCaptions: { label: string; text: string }[];
  googlePosts: { label: string; text: string }[];
  flyer: {
    headline: string;
    subheadline: string;
    bullets: string[];
    cta: string;
    contact: string;
  };
  reviewRequests: { label: string; text: string }[];
  websiteCopy: { headline: string; paragraph: string; button: string };
  adCopy: { headline: string; primary: string; description: string; ctaButton: string };
  imagePrompts: string[];
  postingPlan: { day: string; platform: string; type: string; topic: string }[];
};

export type PromoKit = {
  id: string;
  createdAt: string;
  updatedAt: string;
  campaignName: string;
  campaignGoal: string;
  businessName: string;
  businessType: string;
  formInputs: PromoFormInputs;
  generatedSections: GeneratedSections;
  useLogo: boolean;
  logoSnapshotDataUrl: string;
  logoSnapshotFileName: string;
};

export type AppSettings = {
  agencyName: string;
  defaultBrandTone: string;
  defaultServiceArea: string;
  showServiceCta: boolean;
};

const KEYS = {
  profile: "rp.businessProfile",
  kits: "rp.promoKits",
  settings: "rp.appSettings",
} as const;

export const emptyProfile: BusinessProfile = {
  businessName: "",
  businessType: "",
  serviceArea: "",
  businessDescription: "",
  mainServices: "",
  targetCustomer: "",
  brandTone: "Friendly",
  websiteLink: "",
  facebookLink: "",
  instagramLink: "",
  googleBusinessProfileLink: "",
  contactMethod: "",
  mainBrandColour: "#7A3B2E",
  secondaryBrandColour: "#E8A87C",
  logoDataUrl: "",
  logoFileName: "",
  logoMimeType: "",
  logoUploadedAt: "",
};

export const defaultSettings: AppSettings = {
  agencyName: "Rose & Paw Digital Designs",
  defaultBrandTone: "Friendly",
  defaultServiceArea: "",
  showServiceCta: true,
};

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadProfile(): BusinessProfile {
  if (!isBrowser()) return emptyProfile;
  try {
    const raw = localStorage.getItem(KEYS.profile);
    if (!raw) return emptyProfile;
    return { ...emptyProfile, ...JSON.parse(raw) };
  } catch {
    return emptyProfile;
  }
}

export function saveProfile(profile: BusinessProfile) {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
  window.dispatchEvent(new Event("rp:profile-changed"));
}

export function loadKits(): PromoKit[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEYS.kits);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveKits(kits: PromoKit[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.kits, JSON.stringify(kits));
  window.dispatchEvent(new Event("rp:kits-changed"));
}

export function upsertKit(kit: PromoKit) {
  const kits = loadKits();
  const idx = kits.findIndex((k) => k.id === kit.id);
  if (idx >= 0) kits[idx] = kit;
  else kits.unshift(kit);
  saveKits(kits);
}

export function deleteKit(id: string) {
  saveKits(loadKits().filter((k) => k.id !== id));
}

export function getKit(id: string): PromoKit | undefined {
  return loadKits().find((k) => k.id === id);
}

export function loadSettings(): AppSettings {
  if (!isBrowser()) return defaultSettings;
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  window.dispatchEvent(new Event("rp:settings-changed"));
}

export function exportAll(): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      businessProfile: loadProfile(),
      promoKits: loadKits(),
      appSettings: loadSettings(),
    },
    null,
    2
  );
}

export function importAll(jsonString: string): { ok: boolean; error?: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== "object") return { ok: false, error: "Invalid file" };
    if (data.businessProfile) saveProfile({ ...emptyProfile, ...data.businessProfile });
    if (Array.isArray(data.promoKits)) saveKits(data.promoKits);
    if (data.appSettings) saveSettings({ ...defaultSettings, ...data.appSettings });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function isProfileComplete(p: BusinessProfile) {
  return {
    businessName: !!p.businessName,
    businessType: !!p.businessType,
    serviceArea: !!p.serviceArea,
    mainServices: !!p.mainServices,
    brandColours: !!p.mainBrandColour && !!p.secondaryBrandColour,
    logoUploaded: !!p.logoDataUrl,
  };
}

/** Compress raster images via canvas, return data URL. SVG returned as-is. */
export async function fileToDataUrl(file: File, maxDim = 800): Promise<string> {
  if (file.type === "image/svg+xml") {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = () => rej(r.error);
      r.readAsDataURL(file);
    });
  }
  const dataUrl: string = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(file);
  });
  const img = new Image();
  img.src = dataUrl;
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.9);
}
