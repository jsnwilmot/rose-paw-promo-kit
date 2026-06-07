import { APP_DOMAIN, WEB3FORMS_ACCESS_KEY } from "./app-config";
import type { AppSettings, BusinessProfile, PromoKit } from "./storage";
import { legacyOutputs, selectedOutputLabels } from "./output-selection";

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

export function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    const items = value.map(formatValue).filter((item) => item !== "Not provided");
    return items.length ? items.join(", ") : "Not provided";
  }
  if (typeof value === "string") return value.trim() || "Not provided";
  if (value === null || value === undefined) return "Not provided";
  return String(value);
}

export function formatBulletList(items: unknown): string {
  const values = Array.isArray(items)
    ? items
    : typeof items === "string"
      ? items.split(/\r?\n|,/)
      : [];
  const cleaned = values.map((item) => formatValue(item)).filter((item) => item !== "Not provided");
  return cleaned.length ? cleaned.map((item) => `- ${item}`).join("\n") : "- Not provided";
}

export function formatYesNo(value: unknown): string {
  return value ? "Yes" : "No";
}

export function buildDesignHelpMessage({
  kit,
  profile,
  selectedServices,
  customNotes,
  requesterName,
  requesterEmail,
  createdAt = new Date().toISOString(),
}: Omit<BuildRequestPackageArgs, "settings">) {
  const generated = kit.generatedSections;
  const outputs = kit.formInputs.selectedOutputs || legacyOutputs;
  const flyerCopy = generated.flyer
    ? [
        generated.flyer.headline,
        generated.flyer.subheadline,
        formatBulletList(generated.flyer.bullets),
        `Call to action: ${formatValue(generated.flyer.cta)}`,
        `Contact: ${formatValue(generated.flyer.contact)}`,
      ].join("\n")
    : "Not selected";
  const calendar = generated.postingPlan.length
    ? generated.postingPlan
        .map(
          (item) =>
            `${formatValue(item.day)}: ${formatValue(item.platform)} - ${formatValue(item.topic)}${item.note ? ` - ${formatValue(item.note)}` : ""}`,
        )
        .join("\n")
    : "Not provided";
  const generatedSummary = [
    outputs.flyerCopy && generated.flyer ? `Flyer copy:\n${flyerCopy}` : "",
    outputs.facebookPosts && generated.facebookPosts
      ? `Primary Facebook post:\n${formatValue(generated.facebookPosts[0]?.text)}`
      : "",
    outputs.instagramCaptions && generated.instagramCaptions
      ? `Primary Instagram caption:\n${formatValue(generated.instagramCaptions[0]?.text)}`
      : "",
    outputs.googleBusinessPosts && generated.googlePosts
      ? `Google Business Profile post:\n${formatValue(generated.googlePosts[0]?.text)}`
      : "",
    outputs.reviewRequests && generated.reviewRequests
      ? `Review request:\n${formatValue(generated.reviewRequests[0]?.text)}`
      : "",
    outputs.websiteCopy && generated.websiteCopy
      ? `Website copy:\n${formatValue(generated.websiteCopy.headline)}\n${formatValue(generated.websiteCopy.paragraph)}`
      : "",
    outputs.faqContent && generated.faqContent
      ? `FAQ content:\n${generated.faqContent.map((item) => `${item.question}: ${item.answer}`).join("\n")}`
      : "",
    outputs.adCopy && generated.adCopy ? `Ad copy:\n${formatValue(generated.adCopy.primary)}` : "",
    outputs.imagePrompts && generated.imagePrompts
      ? `Image prompt:\n${formatValue(generated.imagePrompts[0])}`
      : "",
    outputs.videoScripts && generated.videoScripts
      ? `Video script:\n${formatValue(generated.videoScripts[0]?.text)}`
      : "",
    `Campaign calendar:\n${calendar}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return `Rose & Paw Design Help Request

REQUESTER
Name: ${formatValue(requesterName)}
Email: ${formatValue(requesterEmail)}
Submitted: ${new Date(createdAt).toLocaleString()}
Source app: ${APP_DOMAIN}

BUSINESS
Business name: ${formatValue(profile.businessName || kit.businessName)}
Business type: ${formatValue(profile.businessType || kit.businessType)}
Service area: ${formatValue(profile.serviceArea || kit.formInputs.location)}
Description: ${formatValue(profile.businessDescription)}

Main services:
${formatBulletList(profile.mainServices)}

Target customer: ${formatValue(profile.targetCustomer || kit.formInputs.targetCustomer)}
Brand tone: ${formatValue(profile.brandTone || kit.formInputs.tone)}
Contact method: ${formatValue(profile.contactMethod)}

BRANDING
Primary colour: ${formatValue(profile.mainBrandColour)}
Secondary colour: ${formatValue(profile.secondaryBrandColour)}
Logo included in app: ${formatYesNo(profile.logoDataUrl || kit.logoSnapshotDataUrl)}
Logo file name: ${formatValue(profile.logoFileName || kit.logoSnapshotFileName)}

LINKS
Website: ${formatValue(profile.websiteLink)}
Facebook: ${formatValue(profile.facebookLink)}
Instagram: ${formatValue(profile.instagramLink)}
Google Business Profile: ${formatValue(profile.googleBusinessProfileLink)}

PROMO KIT
Kit name: ${formatValue(kit.campaignName)}
Kit ID: ${formatValue(kit.id)}
Created: ${new Date(kit.createdAt).toLocaleString()}
Campaign goal: ${formatValue(kit.campaignGoal)}
Audience: ${formatValue(kit.formInputs.targetCustomer || generated.summary.audience)}
Offer: ${formatValue(kit.formInputs.offer)}
Call to action: ${formatValue(kit.formInputs.callToAction || generated.summary.recommendedCta)}

SELECTED KIT OUTPUTS
${formatBulletList(selectedOutputLabels(outputs))}
Campaign calendar: Included

REQUESTED DESIGN HELP
${formatBulletList(selectedServices)}

CLIENT NOTES
${formatValue(customNotes)}

GENERATED KIT SUMMARY

${generatedSummary}

NEXT STEP
Please review this request and follow up with the requester by email.`;
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
      selectedOutputs: kit.formInputs.selectedOutputs || legacyOutputs,
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
    selected_kit_id: promoKit.id,
    campaign_goal: promoKit.campaignGoal,
    selected_kit_outputs: selectedOutputLabels(
      promoKit.formInputs.selectedOutputs || legacyOutputs,
    ).join(", "),
    campaign_calendar: "Included",
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
