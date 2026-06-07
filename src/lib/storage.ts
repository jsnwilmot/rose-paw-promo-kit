import { z } from "zod";

export const STORAGE_SCHEMA_VERSION = 2;
export const EXPORT_VERSION = 2;

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
  selectedOutputs?: SelectedOutputs;
};

export type SelectedOutputs = {
  facebookPosts: boolean;
  instagramCaptions: boolean;
  googleBusinessPosts: boolean;
  flyerCopy: boolean;
  reviewRequests: boolean;
  websiteCopy: boolean;
  faqContent: boolean;
  adCopy: boolean;
  imagePrompts: boolean;
  videoScripts: boolean;
  printableSummary: boolean;
};

export type GeneratedSections = {
  summary: {
    campaignName: string;
    goal: string;
    audience: string;
    offer: string;
    dates: string;
    recommendedCta: string;
    notes: string;
  };
  facebookPosts?: { label: string; text: string }[];
  instagramCaptions?: { label: string; text: string }[];
  googlePosts?: { label: string; text: string }[];
  flyer?: {
    headline: string;
    subheadline: string;
    bullets: string[];
    cta: string;
    contact: string;
  };
  reviewRequests?: { label: string; text: string }[];
  websiteCopy?: { headline: string; paragraph: string; button: string };
  faqContent?: { question: string; answer: string }[];
  adCopy?: { headline: string; primary: string; description: string; ctaButton: string };
  emailNewsletter?: { subject: string; previewText: string; body: string; cta: string };
  hashtagSuggestions?: string[];
  imagePrompts?: string[];
  videoScripts?: { label: string; text: string }[];
  postingPlan: { day: string; platform: string; type: string; topic: string; note?: string }[];
};

export type KitStatus = "draft" | "active" | "completed" | "archived";

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
  status: KitStatus;
  internalNotes: string;
  source?: "design-request-import";
  sourcePackageVersion?: number;
  sourceImportedAt?: string;
  sourceCreatedAt?: string;
  requesterName?: string;
  requesterEmail?: string;
  requestedServices?: string[];
  customNotes?: string;
};

export type AppSettings = {
  agencyName: string;
  defaultBrandTone: string;
  defaultServiceArea: string;
  showServiceCta: boolean;
};

export type StorageResult = { ok: true } | { ok: false; error: string; quotaExceeded?: boolean };
export type ImportPreview = {
  businessName: string;
  promoKitCount: number;
  includesLogo: boolean;
  exportedAt: string;
  schemaVersion: number;
  exportVersion: number;
};

export type ValidatedImport = {
  preview: ImportPreview;
  businessProfile: BusinessProfile;
  promoKits: PromoKit[];
  appSettings: AppSettings;
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
  brandTone: "",
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

const isoDateTime = z.string().datetime({ offset: true });
const optionalIsoDateTime = z.union([z.literal(""), isoDateTime]);
const formDate = z.union([
  z.literal(""),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must use YYYY-MM-DD"),
]);
const colour = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a 6-digit hex colour");
const logoDataUrl = z.union([
  z.literal(""),
  z.string().regex(/^data:image\/(png|jpeg|webp);base64,/i, "must be a PNG, JPG, or WEBP data URL"),
]);
const nonEmpty = z.string().trim().min(1);
const labelledTextSchema = z.object({ label: nonEmpty, text: nonEmpty });
const selectedOutputsSchema = z.object({
  facebookPosts: z.boolean(),
  instagramCaptions: z.boolean(),
  googleBusinessPosts: z.boolean(),
  flyerCopy: z.boolean(),
  reviewRequests: z.boolean(),
  websiteCopy: z.boolean(),
  faqContent: z.boolean(),
  adCopy: z.boolean(),
  imagePrompts: z.boolean(),
  videoScripts: z.boolean(),
  printableSummary: z.boolean(),
});

const businessProfileSchema = z.object({
  businessName: z.string(),
  businessType: z.string(),
  serviceArea: z.string(),
  businessDescription: z.string(),
  mainServices: z.string(),
  targetCustomer: z.string(),
  brandTone: z.string(),
  websiteLink: z.string(),
  facebookLink: z.string(),
  instagramLink: z.string(),
  googleBusinessProfileLink: z.string(),
  contactMethod: z.string(),
  mainBrandColour: colour,
  secondaryBrandColour: colour,
  logoDataUrl,
  logoFileName: z.string(),
  logoMimeType: z.union([
    z.literal(""),
    z.literal("image/png"),
    z.literal("image/jpeg"),
    z.literal("image/jpg"),
    z.literal("image/webp"),
  ]),
  logoUploadedAt: optionalIsoDateTime,
});

const promoFormInputsSchema = z
  .object({
    campaignName: nonEmpty,
    campaignGoal: nonEmpty,
    businessType: z.string(),
    featuredService: z.string(),
    offer: z.string(),
    startDate: formDate,
    endDate: formDate,
    targetCustomer: z.string(),
    mainBenefit: z.string(),
    location: z.string(),
    tone: z.string(),
    callToAction: z.string(),
    extraNotes: z.string(),
    useLogo: z.boolean(),
    selectedOutputs: selectedOutputsSchema.optional(),
  })
  .refine((value) => !value.startDate || !value.endDate || value.endDate >= value.startDate, {
    message: "end date cannot be before start date",
    path: ["endDate"],
  });

const emailNewsletterSchema = z.object({
  subject: nonEmpty,
  previewText: nonEmpty,
  body: nonEmpty,
  cta: nonEmpty,
});

const generatedSectionsSchema = z.object({
  summary: z.object({
    campaignName: nonEmpty,
    goal: nonEmpty,
    audience: nonEmpty,
    offer: nonEmpty,
    dates: nonEmpty,
    recommendedCta: nonEmpty,
    notes: z.string().default(""),
  }),
  facebookPosts: z.array(labelledTextSchema).min(1).optional(),
  instagramCaptions: z.array(labelledTextSchema).min(1).optional(),
  googlePosts: z.array(labelledTextSchema).min(1).optional(),
  flyer: z
    .object({
      headline: nonEmpty,
      subheadline: nonEmpty,
      bullets: z.array(nonEmpty).min(1),
      cta: nonEmpty,
      contact: nonEmpty,
    })
    .optional(),
  reviewRequests: z.array(labelledTextSchema).min(1).optional(),
  websiteCopy: z.object({ headline: nonEmpty, paragraph: nonEmpty, button: nonEmpty }).optional(),
  faqContent: z
    .array(z.object({ question: nonEmpty, answer: nonEmpty }))
    .min(1)
    .optional(),
  adCopy: z
    .object({
      headline: nonEmpty,
      primary: nonEmpty,
      description: nonEmpty,
      ctaButton: nonEmpty,
    })
    .optional(),
  emailNewsletter: emailNewsletterSchema.optional(),
  hashtagSuggestions: z.array(nonEmpty).optional(),
  imagePrompts: z.array(nonEmpty).min(1).optional(),
  videoScripts: z.array(labelledTextSchema).min(1).optional(),
  postingPlan: z
    .array(
      z.object({
        day: nonEmpty,
        platform: nonEmpty,
        type: nonEmpty,
        topic: nonEmpty,
        note: z.string().default(""),
      }),
    )
    .min(1),
});

const promoKitSchema = z.object({
  id: z.string().uuid(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
  campaignName: nonEmpty,
  campaignGoal: nonEmpty,
  businessName: z.string(),
  businessType: z.string(),
  formInputs: promoFormInputsSchema,
  generatedSections: generatedSectionsSchema,
  useLogo: z.boolean(),
  logoSnapshotDataUrl: logoDataUrl.default(""),
  logoSnapshotFileName: z.string().default(""),
  status: z.enum(["draft", "active", "completed", "archived"]).default("draft"),
  internalNotes: z.string().default(""),
  source: z.literal("design-request-import").optional(),
  sourcePackageVersion: z.number().int().optional(),
  sourceImportedAt: isoDateTime.optional(),
  sourceCreatedAt: isoDateTime.optional(),
  requesterName: z.string().optional(),
  requesterEmail: z.string().optional(),
  requestedServices: z.array(z.string()).optional(),
  customNotes: z.string().optional(),
});

const appSettingsSchema = z.object({
  agencyName: nonEmpty,
  defaultBrandTone: nonEmpty,
  defaultServiceArea: z.string(),
  showServiceCta: z.boolean(),
});

const importSchema = z.object({
  schemaVersion: z.number().int(),
  exportVersion: z.number().int(),
  exportedAt: isoDateTime,
  businessProfile: businessProfileSchema,
  promoKits: z.array(promoKitSchema),
  appSettings: appSettingsSchema,
});

function isBrowser() {
  return typeof window !== "undefined";
}

function storageFailure(error: unknown): StorageResult {
  const quotaExceeded =
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");
  return {
    ok: false,
    quotaExceeded,
    error: quotaExceeded
      ? "This device's local storage is full. Remove an old kit or use a smaller logo, then try again."
      : "The app could not save data on this device. Your previous saved data is unchanged.",
  };
}

function write(key: string, value: unknown): StorageResult {
  if (!isBrowser()) return { ok: true };
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (error) {
    return storageFailure(error);
  }
}

function validationMessage(error: z.ZodError) {
  return error.issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join(".") || "file"}: ${issue.message}`)
    .join("; ");
}

function stripLegacySvgLogo(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const record = { ...(value as Record<string, unknown>) };
  if (
    record.logoMimeType === "image/svg+xml" ||
    (typeof record.logoDataUrl === "string" && record.logoDataUrl.startsWith("data:image/svg+xml"))
  ) {
    record.logoDataUrl = "";
    record.logoFileName = "";
    record.logoMimeType = "";
    record.logoUploadedAt = "";
  }
  return record;
}

function stripLegacyKitSvgLogo(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const record = { ...(value as Record<string, unknown>) };
  if (
    typeof record.logoSnapshotDataUrl === "string" &&
    record.logoSnapshotDataUrl.startsWith("data:image/svg+xml")
  ) {
    record.logoSnapshotDataUrl = "";
    record.logoSnapshotFileName = "";
  }
  return record;
}

export function loadProfile(): BusinessProfile {
  if (!isBrowser()) return emptyProfile;
  try {
    const raw = localStorage.getItem(KEYS.profile);
    if (!raw) return emptyProfile;
    const sanitized = stripLegacySvgLogo(JSON.parse(raw));
    const result = businessProfileSchema.safeParse({
      ...emptyProfile,
      ...(sanitized && typeof sanitized === "object" ? sanitized : {}),
    });
    return result.success ? result.data : emptyProfile;
  } catch {
    return emptyProfile;
  }
}

export function saveProfile(profile: BusinessProfile): StorageResult {
  const validated = businessProfileSchema.safeParse(profile);
  if (!validated.success) return { ok: false, error: validationMessage(validated.error) };
  const result = write(KEYS.profile, validated.data);
  if (result.ok && isBrowser()) window.dispatchEvent(new Event("rp:profile-changed"));
  return result;
}

export function loadKits(): PromoKit[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEYS.kits);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = z
      .array(promoKitSchema)
      .safeParse(Array.isArray(parsed) ? parsed.map(stripLegacyKitSvgLogo) : parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function saveKits(kits: PromoKit[]): StorageResult {
  const validated = z.array(promoKitSchema).safeParse(kits);
  if (!validated.success) return { ok: false, error: validationMessage(validated.error) };
  const result = write(KEYS.kits, validated.data);
  if (result.ok && isBrowser()) window.dispatchEvent(new Event("rp:kits-changed"));
  return result;
}

export function upsertKit(kit: PromoKit): StorageResult {
  const kits = loadKits();
  const idx = kits.findIndex((candidate) => candidate.id === kit.id);
  if (idx >= 0) kits[idx] = kit;
  else kits.unshift(kit);
  return saveKits(kits);
}

export function deleteKit(id: string): StorageResult {
  return saveKits(loadKits().filter((kit) => kit.id !== id));
}

export function getKit(id: string): PromoKit | undefined {
  return loadKits().find((kit) => kit.id === id);
}

export function parsePromoFormInputs(value: unknown): PromoFormInputs | null {
  const result = promoFormInputsSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function parseGeneratedSections(value: unknown): GeneratedSections | null {
  const result = generatedSectionsSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function loadSettings(): AppSettings {
  if (!isBrowser()) return defaultSettings;
  try {
    const raw = localStorage.getItem(KEYS.settings);
    if (!raw) return defaultSettings;
    const result = appSettingsSchema.safeParse({ ...defaultSettings, ...JSON.parse(raw) });
    return result.success ? result.data : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): StorageResult {
  const validated = appSettingsSchema.safeParse(settings);
  if (!validated.success) return { ok: false, error: validationMessage(validated.error) };
  const result = write(KEYS.settings, validated.data);
  if (result.ok && isBrowser()) window.dispatchEvent(new Event("rp:settings-changed"));
  return result;
}

export function exportAll(): string {
  return JSON.stringify(
    {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      exportVersion: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      businessProfile: loadProfile(),
      promoKits: loadKits(),
      appSettings: loadSettings(),
    },
    null,
    2,
  );
}

export function validateImport(
  jsonString: string,
): { ok: true; data: ValidatedImport } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { ok: false, error: "The selected file is not valid JSON." };
  }

  const versioned = parsed as { schemaVersion?: unknown; exportVersion?: unknown };
  if (
    versioned?.schemaVersion !== STORAGE_SCHEMA_VERSION ||
    versioned?.exportVersion !== EXPORT_VERSION
  ) {
    return {
      ok: false,
      error: `Unsupported backup version. Expected schemaVersion ${STORAGE_SCHEMA_VERSION} and exportVersion ${EXPORT_VERSION}.`,
    };
  }

  const result = importSchema.safeParse(parsed);
  if (!result.success) return { ok: false, error: validationMessage(result.error) };
  const data = result.data;
  return {
    ok: true,
    data: {
      businessProfile: data.businessProfile,
      promoKits: data.promoKits,
      appSettings: data.appSettings,
      preview: {
        businessName: data.businessProfile.businessName || "Unnamed business",
        promoKitCount: data.promoKits.length,
        includesLogo: !!data.businessProfile.logoDataUrl,
        exportedAt: data.exportedAt,
        schemaVersion: data.schemaVersion,
        exportVersion: data.exportVersion,
      },
    },
  };
}

export function importValidated(data: ValidatedImport): StorageResult {
  if (!isBrowser()) return { ok: false, error: "Import is only available in the browser." };
  const previous = {
    profile: localStorage.getItem(KEYS.profile),
    kits: localStorage.getItem(KEYS.kits),
    settings: localStorage.getItem(KEYS.settings),
  };

  try {
    localStorage.setItem(KEYS.profile, JSON.stringify(data.businessProfile));
    localStorage.setItem(KEYS.kits, JSON.stringify(data.promoKits));
    localStorage.setItem(KEYS.settings, JSON.stringify(data.appSettings));
  } catch (error) {
    try {
      for (const [key, value] of [
        [KEYS.profile, previous.profile],
        [KEYS.kits, previous.kits],
        [KEYS.settings, previous.settings],
      ] as const) {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      }
    } catch {
      return {
        ok: false,
        error: "Import failed and the browser could not fully restore the previous local data.",
      };
    }
    return storageFailure(error);
  }

  window.dispatchEvent(new Event("rp:profile-changed"));
  window.dispatchEvent(new Event("rp:kits-changed"));
  window.dispatchEvent(new Event("rp:settings-changed"));
  return { ok: true };
}

export function isProfileComplete(profile: BusinessProfile) {
  return {
    businessName: !!profile.businessName,
    businessType: !!profile.businessType,
    serviceArea: !!profile.serviceArea,
    mainServices: !!profile.mainServices,
    brandColours: !!profile.mainBrandColour && !!profile.secondaryBrandColour,
    logoUploaded: !!profile.logoDataUrl,
  };
}

/** Resize raster images before storing them locally. SVG is intentionally unsupported. */
export async function fileToDataUrl(file: File, maxDim = 800): Promise<string> {
  if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
    throw new Error("Unsupported logo format");
  }
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const image = new Image();
  image.src = dataUrl;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });
  const scale = Math.min(1, maxDim / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image processing is unavailable");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(
    file.type === "image/png"
      ? "image/png"
      : file.type === "image/webp"
        ? "image/webp"
        : "image/jpeg",
    0.88,
  );
}
