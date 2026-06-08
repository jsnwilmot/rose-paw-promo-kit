import { z } from "zod";
import { generateKit } from "./generator";
import {
  emptyProfile,
  parseGeneratedSections,
  parsePromoFormInputs,
  type AppSettings,
  type BusinessProfile,
  type PromoFormInputs,
  type PromoKit,
} from "./storage";
import { normalizeSelectedOutputs } from "./output-selection";

const EXPECTED_PACKAGE_TYPE = "rose-paw-design-help-request";
const EXPECTED_PACKAGE_VERSION = 1;

const recordSchema = z.record(z.unknown());
const requestPackageSchema = z
  .object({
    packageType: z.string(),
    packageVersion: z.number().int().optional(),
    createdAt: z.string().optional(),
    requester: z
      .object({
        name: z.string().optional(),
        email: z.string().optional(),
      })
      .optional(),
    businessProfile: recordSchema,
    promoKit: recordSchema,
    requestedServices: z.array(z.string()).optional(),
    customNotes: z.string().optional(),
  })
  .passthrough();

export type DesignRequestPackage = z.infer<typeof requestPackageSchema>;

export type DesignRequestImportPreview = {
  requesterName: string;
  requesterEmail: string;
  businessName: string;
  businessType: string;
  serviceArea: string;
  primaryColour: string;
  secondaryColour: string;
  promoKitName: string;
  campaignGoal: string;
  requestedServices: string[];
  generatedSectionsIncluded: boolean;
  logoMetadataIncluded: boolean;
};

export type DesignRequestImportOptions = {
  addRequestDetailsAsInternalNotes: boolean;
  settings: AppSettings;
};

export function parseDesignRequestPackage(
  input: string,
): { ok: true; data: DesignRequestPackage } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return { ok: false, error: "The request package is not valid JSON." };
  }

  const result = requestPackageSchema.safeParse(parsed);
  if (!result.success) {
    const missing = result.error.issues[0]?.path.join(".");
    return {
      ok: false,
      error: missing
        ? `The request package is missing or has an invalid ${missing}.`
        : "The request package is not valid.",
    };
  }

  return validateDesignRequestPackage(result.data);
}

export function validateDesignRequestPackage(
  packageData: DesignRequestPackage,
): { ok: true; data: DesignRequestPackage } | { ok: false; error: string } {
  if (packageData.packageType !== EXPECTED_PACKAGE_TYPE) {
    return { ok: false, error: "Unsupported package type. Select a Rose & Paw design request." };
  }
  if (packageData.packageVersion !== EXPECTED_PACKAGE_VERSION) {
    return {
      ok: false,
      error: packageData.packageVersion
        ? `Unsupported package version ${packageData.packageVersion}. Expected version 1.`
        : "The request package is missing packageVersion. Expected version 1.",
    };
  }
  if (!packageData.businessProfile) {
    return { ok: false, error: "The request package is missing businessProfile." };
  }
  if (!packageData.promoKit) {
    return { ok: false, error: "The request package is missing promoKit." };
  }
  if (!packageData.promoKit.generatedSections && !packageData.promoKit.formInputs) {
    return {
      ok: false,
      error: "The request package must include promoKit.generatedSections or promoKit.formInputs.",
    };
  }
  if (
    packageData.promoKit.generatedSections &&
    !parseGeneratedSections(packageData.promoKit.generatedSections)
  ) {
    return {
      ok: false,
      error: "The request package contains invalid generated promo kit sections.",
    };
  }
  if (packageData.promoKit.formInputs && !parsePromoFormInputs(packageData.promoKit.formInputs)) {
    return { ok: false, error: "The request package contains invalid promo kit form inputs." };
  }
  return { ok: true, data: packageData };
}

export function buildImportPreview(packageData: DesignRequestPackage): DesignRequestImportPreview {
  const business = packageData.businessProfile;
  const kit = packageData.promoKit;
  return {
    requesterName: text(packageData.requester?.name),
    requesterEmail: text(packageData.requester?.email),
    businessName: text(business.businessName || kit.businessName),
    businessType: text(business.businessType || kit.businessType),
    serviceArea: text(business.serviceArea),
    primaryColour: text(business.mainBrandColour),
    secondaryColour: text(business.secondaryBrandColour),
    promoKitName: text(kit.campaignName),
    campaignGoal: text(kit.campaignGoal),
    requestedServices: packageData.requestedServices?.filter(Boolean) ?? [],
    generatedSectionsIncluded: !!kit.generatedSections,
    logoMetadataIncluded: !!(
      business.logoIncluded ||
      business.logoFileName ||
      kit.logoSnapshotIncluded ||
      kit.logoSnapshotFileName
    ),
  };
}

export function mapRequestBusinessProfileToProfile(
  packageData: DesignRequestPackage,
  currentProfile: BusinessProfile = emptyProfile,
): BusinessProfile {
  const imported = packageData.businessProfile;
  return {
    ...currentProfile,
    businessName: storedText(imported.businessName),
    businessType: storedText(imported.businessType),
    serviceArea: storedText(imported.serviceArea),
    businessDescription: storedText(imported.businessDescription),
    mainServices: storedText(imported.mainServices),
    targetCustomer: storedText(imported.targetCustomer),
    brandTone: storedText(imported.brandTone),
    localSeoKeywords: storedText(imported.localSeoKeywords),
    gbpAttributes: storedText(imported.gbpAttributes),
    trustPoints: storedText(imported.trustPoints),
    reviewResponseTone: storedText(imported.reviewResponseTone),
    websiteLink: storedText(imported.websiteLink),
    facebookLink: storedText(imported.facebookLink),
    instagramLink: storedText(imported.instagramLink),
    googleBusinessProfileLink: storedText(imported.googleBusinessProfileLink),
    contactMethod: storedText(imported.contactMethod),
    mainBrandColour: validColour(imported.mainBrandColour) || currentProfile.mainBrandColour,
    secondaryBrandColour:
      validColour(imported.secondaryBrandColour) || currentProfile.secondaryBrandColour,
  };
}

export function mapRequestPackageToSavedKit(
  packageData: DesignRequestPackage,
  options: DesignRequestImportOptions,
): PromoKit {
  const importedKit = packageData.promoKit;
  const importedProfile = mapRequestBusinessProfileToProfile(packageData);
  const formInputs =
    parsePromoFormInputs(withImportedSelectedOutputs(importedKit)) ||
    buildFallbackFormInputs(packageData);
  const generatedSections =
    parseGeneratedSections(importedKit.generatedSections) ||
    generateKit(formInputs, importedProfile, options.settings);
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    campaignName: storedText(importedKit.campaignName) || formInputs.campaignName,
    campaignGoal: storedText(importedKit.campaignGoal) || formInputs.campaignGoal,
    businessName: storedText(importedKit.businessName) || importedProfile.businessName,
    businessType: storedText(importedKit.businessType) || importedProfile.businessType,
    formInputs: { ...formInputs, useLogo: false },
    generatedSections,
    useLogo: false,
    logoSnapshotDataUrl: "",
    logoSnapshotFileName: "",
    status: "active",
    internalNotes: options.addRequestDetailsAsInternalNotes
      ? buildRequestInternalNote(packageData)
      : "",
    source: "design-request-import",
    sourcePackageVersion: EXPECTED_PACKAGE_VERSION,
    sourceImportedAt: now,
    sourceCreatedAt: validIso(packageData.createdAt),
    requesterName: storedText(packageData.requester?.name),
    requesterEmail: storedText(packageData.requester?.email),
    requestedServices: packageData.requestedServices?.filter(Boolean) ?? [],
    customNotes: storedText(packageData.customNotes),
  };
}

export function buildRequestInternalNote(packageData: DesignRequestPackage): string {
  const business = packageData.businessProfile;
  const services = packageData.requestedServices?.filter(Boolean) ?? [];
  const requesterName = storedText(packageData.requester?.name);
  const requesterEmail = storedText(packageData.requester?.email);
  const requester = requesterEmail
    ? `${requesterName || "Requester"} <${requesterEmail}>`
    : requesterName;
  const createdAt = storedText(packageData.createdAt);
  const businessSummary = [
    storedText(business.businessName),
    storedText(business.businessType),
    storedText(business.serviceArea),
  ]
    .filter(Boolean)
    .join(", ");
  return [
    "Imported design request",
    requester ? `Requester: ${requester}` : "",
    "Requested services:",
    services.length ? services.map((service) => `- ${service}`).join("\n") : "- None selected",
    "",
    "Client notes:",
    storedText(packageData.customNotes) || "None provided",
    createdAt ? `\nOriginal request created: ${createdAt}` : "",
    businessSummary ? `\nBusiness profile import: ${businessSummary}` : "",
  ]
    .filter((line, index, lines) => line || lines[index - 1] !== "")
    .join("\n")
    .trim();
}

function buildFallbackFormInputs(packageData: DesignRequestPackage): PromoFormInputs {
  const business = packageData.businessProfile;
  const kit = packageData.promoKit;
  return {
    campaignName: storedText(kit.campaignName) || "Imported design request",
    campaignGoal: storedText(kit.campaignGoal) || "Get more bookings",
    businessType: storedText(kit.businessType || business.businessType),
    featuredService: "",
    offer: "",
    startDate: "",
    endDate: "",
    targetCustomer: storedText(business.targetCustomer),
    mainBenefit: "",
    location: storedText(business.serviceArea),
    tone: storedText(business.brandTone) || "Friendly",
    callToAction: "",
    extraNotes: storedText(packageData.customNotes),
    useLogo: false,
    selectedOutputs: packageData.promoKit.selectedOutputs
      ? normalizeSelectedOutputs(packageData.promoKit.selectedOutputs)
      : undefined,
  };
}

function withImportedSelectedOutputs(importedKit: Record<string, unknown>) {
  if (!importedKit.formInputs || typeof importedKit.formInputs !== "object") {
    return importedKit.formInputs;
  }
  const formInputs = importedKit.formInputs as Record<string, unknown>;
  const selectedOutputs = formInputs.selectedOutputs || importedKit.selectedOutputs;
  return selectedOutputs
    ? { ...formInputs, selectedOutputs: normalizeSelectedOutputs(selectedOutputs) }
    : formInputs;
}

function text(value: unknown) {
  return storedText(value) || "Not provided";
}

function storedText(value: unknown) {
  return typeof value === "string" && value.trim() !== "Not provided" ? value.trim() : "";
}

function validColour(value: unknown) {
  const colour = storedText(value);
  return /^#[0-9a-f]{6}$/i.test(colour) ? colour : "";
}

function validIso(value: unknown) {
  const candidate = storedText(value);
  return candidate && !Number.isNaN(Date.parse(candidate))
    ? new Date(candidate).toISOString()
    : undefined;
}
