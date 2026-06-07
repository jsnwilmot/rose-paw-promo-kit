import { APP_DOMAIN, APP_VERSION, WEB3FORMS_ACCESS_KEY } from "./app-config";
import type { AppSettings, BusinessProfile, PromoKit } from "./storage";

export const DESIGN_SERVICE_OPTIONS = [
  "Branded social media graphics",
  "Print-ready flyer",
  "Facebook ad creative",
  "Instagram post or reel graphics",
  "Google Business Profile image",
  "Website banner or section graphics",
  "Full branded campaign package",
  "Other",
] as const;

type BuildRequestPackageArgs = {
  kit: PromoKit;
  profile: BusinessProfile;
  settings: AppSettings;
  selectedServices: string[];
  customNotes: string;
  requesterName: string;
  requesterEmail: string;
  createdAt?: string;
};

export function buildDesignHelpMessage({
  kit,
  profile,
  selectedServices,
  customNotes,
}: Pick<BuildRequestPackageArgs, "kit" | "profile" | "selectedServices" | "customNotes">) {
  const services = selectedServices.length
    ? selectedServices.map((service) => `- ${service}`).join("\n")
    : "- Not selected yet";

  return `Hi Rose & Paw Digital Designs,

I'd like help turning this promo kit into finished design materials.

Business:
${profile.businessName || kit.businessName || "Not provided"}
${profile.businessType || kit.businessType || "Not provided"}
${profile.serviceArea || kit.formInputs.location || "Not provided"}

Campaign:
${kit.campaignName}
Goal: ${kit.campaignGoal}
Audience: ${kit.formInputs.targetCustomer || kit.generatedSections.summary.audience || "Not provided"}
Offer: ${kit.formInputs.offer || "Not provided"}
Call to action: ${kit.formInputs.callToAction || kit.generatedSections.summary.recommendedCta || "Not provided"}

Requested help:
${services}

Branding:
Main colour: ${profile.mainBrandColour}
Secondary colour: ${profile.secondaryBrandColour}
Logo included: ${profile.logoDataUrl || kit.logoSnapshotDataUrl ? "Yes" : "No"}

Links:
Website: ${profile.websiteLink || "Not provided"}
Facebook: ${profile.facebookLink || "Not provided"}
Instagram: ${profile.instagramLink || "Not provided"}
Google Business Profile: ${profile.googleBusinessProfileLink || "Not provided"}

Notes:
${customNotes}

Please review the kit details and let me know what you recommend.`;
}

export function buildDesignHelpRequestPackage({
  kit,
  profile,
  settings,
  selectedServices,
  customNotes,
  requesterName,
  requesterEmail,
  createdAt = new Date().toISOString(),
}: BuildRequestPackageArgs) {
  return {
    packageType: "rose-paw-design-help-request",
    packageVersion: 1,
    appDomain: APP_DOMAIN,
    createdAt,
    agencyName: settings.agencyName,
    requester: {
      name: requesterName.trim(),
      email: requesterEmail.trim(),
    },
    businessProfile: {
      businessName: profile.businessName,
      businessType: profile.businessType,
      serviceArea: profile.serviceArea,
      businessDescription: profile.businessDescription,
      mainServices: profile.mainServices,
      targetCustomer: profile.targetCustomer,
      brandTone: profile.brandTone,
      websiteLink: profile.websiteLink,
      facebookLink: profile.facebookLink,
      instagramLink: profile.instagramLink,
      googleBusinessProfileLink: profile.googleBusinessProfileLink,
      contactMethod: profile.contactMethod,
      mainBrandColour: profile.mainBrandColour,
      secondaryBrandColour: profile.secondaryBrandColour,
      logoIncluded: !!profile.logoDataUrl,
      logoFileName: profile.logoFileName,
    },
    promoKit: {
      id: kit.id,
      campaignName: kit.campaignName,
      campaignGoal: kit.campaignGoal,
      businessName: kit.businessName,
      businessType: kit.businessType,
      createdAt: kit.createdAt,
      updatedAt: kit.updatedAt,
      status: kit.status,
      formInputs: kit.formInputs,
      generatedSections: kit.generatedSections,
      useLogo: kit.useLogo,
      logoSnapshotIncluded: !!kit.logoSnapshotDataUrl,
      logoSnapshotFileName: kit.logoSnapshotFileName,
    },
    requestedServices: selectedServices,
    customNotes,
  };
}

export function buildDesignHelpFormData(
  args: BuildRequestPackageArgs & { message: string },
): FormData {
  const requestPackage = buildDesignHelpRequestPackage(args);
  const { businessProfile, promoKit } = requestPackage;
  const brandSettings = {
    agencyName: args.settings.agencyName,
    defaultBrandTone: args.settings.defaultBrandTone,
    defaultServiceArea: args.settings.defaultServiceArea,
    mainBrandColour: businessProfile.mainBrandColour,
    secondaryBrandColour: businessProfile.secondaryBrandColour,
    logoIncluded: businessProfile.logoIncluded,
    logoFileName: businessProfile.logoFileName,
    logoSnapshotIncluded: promoKit.logoSnapshotIncluded,
    logoSnapshotFileName: promoKit.logoSnapshotFileName,
  };
  const formData = new FormData();
  const businessName = businessProfile.businessName || promoKit.businessName || "Unnamed business";

  const fields: Record<string, string> = {
    access_key: WEB3FORMS_ACCESS_KEY,
    name: requestPackage.requester.name,
    email: requestPackage.requester.email,
    subject: `Rose & Paw Design Help Request - ${businessName} - ${promoKit.campaignName}`,
    message: args.message,
    requested_services: requestPackage.requestedServices.join(", "),
    selected_kit_name: promoKit.campaignName,
    app_domain: APP_DOMAIN,
    business_name: businessName,
    business_type: businessProfile.businessType || promoKit.businessType,
    service_area: businessProfile.serviceArea,
    contact_method: businessProfile.contactMethod,
    website_url: businessProfile.websiteLink,
    facebook_url: businessProfile.facebookLink,
    instagram_url: businessProfile.instagramLink,
    google_business_profile_url: businessProfile.googleBusinessProfileLink,
    brand_primary_colour: businessProfile.mainBrandColour,
    brand_secondary_colour: businessProfile.secondaryBrandColour,
    logo_included: businessProfile.logoIncluded || promoKit.logoSnapshotIncluded ? "Yes" : "No",
    logo_file_name: businessProfile.logoFileName || promoKit.logoSnapshotFileName,
    selected_kit_id: promoKit.id,
    selected_kit_goal: promoKit.campaignGoal,
    selected_kit_offer: promoKit.formInputs.offer,
    selected_kit_audience: promoKit.formInputs.targetCustomer,
    selected_kit_cta:
      promoKit.formInputs.callToAction || promoKit.generatedSections.summary.recommendedCta,
    selected_kit_created_at: promoKit.createdAt,
    business_profile_json: JSON.stringify(businessProfile),
    brand_settings_json: JSON.stringify(brandSettings),
    selected_kit_json: JSON.stringify(promoKit),
    generated_content_json: JSON.stringify(promoKit.generatedSections),
    app_version: APP_VERSION,
    request_created_at: requestPackage.createdAt,
  };

  for (const [key, value] of Object.entries(fields)) formData.append(key, value);
  return formData;
}

export function designHelpRequestFileName(kit: PromoKit, profile: BusinessProfile) {
  const safe = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "unnamed";
  return `rose-paw-design-request-${safe(profile.businessName || kit.businessName)}-${safe(kit.campaignName)}-${new Date().toISOString().slice(0, 10)}.json`;
}
