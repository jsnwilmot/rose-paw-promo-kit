import type { AppSettings, BusinessProfile, PromoFormInputs, SelectedOutputs } from "./storage";
import { resolveSelectedOutputs } from "./output-selection";

export type CampaignBrief = {
  businessName: string;
  businessType: string;
  serviceArea: string;
  targetCustomer: string;
  campaignType: string;
  campaignGoal: string;
  mainOffer: string;
  featuredServices: string[];
  proofPoints: string[];
  localDetails: string[];
  callToAction: string;
  tone: string;
  selectedOutputs: SelectedOutputs;
  campaignTheme: string;
  campaignName: string;
  dates: string;
  contactMethod: string;
  bookingHint: string;
};

function clean(value: string | undefined) {
  return (value || "").trim().replace(/\s+/g, " ");
}

function list(value: string | undefined) {
  return (value || "")
    .split(/\r?\n|,/)
    .map((part) => clean(part).replace(/^[-*]\s*/, ""))
    .filter(Boolean);
}

function unique(values: string[]) {
  return [...new Set(values.map((item) => clean(item)).filter(Boolean))];
}

function inferTargetCustomer(businessType: string) {
  const lower = businessType.toLowerCase();
  if (/(hair|salon|colour|highlights|beauty)/.test(lower)) {
    return "local clients looking for cuts, colour, highlights, or grey coverage";
  }
  if (/(mobile dog|dog groom|pet groom|pet|dog)/.test(lower)) {
    return "local dog owners who want convenient grooming at home";
  }
  if (/(clean|cleaner|housekeep|janitor)/.test(lower)) {
    return "local homeowners or small businesses looking for reliable cleaning";
  }
  if (/(contract|repair|reno|builder|plumb|electric|hvac|home service)/.test(lower)) {
    return "local homeowners planning repairs or improvements";
  }
  if (/(tutor|lesson|education|school|coach)/.test(lower)) {
    return "local families looking for extra school support";
  }
  return "local customers looking for practical, friendly service";
}

function fmtDates(start: string, end: string) {
  if (!start && !end) return "Ongoing";
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

function chooseCampaignType(goal: string, outputs: SelectedOutputs, offer: string) {
  const selected = Object.entries(outputs)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);
  const contentSelected = selected.filter((key) => key !== "printableSummary");
  if (contentSelected.length === 1 && contentSelected[0] === "flyerCopy") return "Flyer Copy Pack";
  if (contentSelected.length === 1 && contentSelected[0] === "googleBusinessPosts") {
    return "Google Business Profile Pack";
  }
  if (contentSelected.length === 1 && contentSelected[0] === "reviewRequests") {
    return "Review Request Campaign";
  }
  if (/monthly/i.test(goal)) return "Monthly Content Kit";
  if (offer || /(new service|seasonal|new business)/i.test(goal)) return "New Customer Promo";
  return "Monthly Content Kit";
}

function ctaFromContact(provided: string, profile: BusinessProfile) {
  const inputCta = clean(provided);
  if (inputCta) return inputCta;
  const contact = clean(profile.contactMethod).toLowerCase();
  if (/(call|phone)/.test(contact)) return "Call to book.";
  if (/(message|text|dm|facebook|instagram|email)/.test(contact)) return "Message to book.";
  if (clean(profile.websiteLink)) return "Request an appointment.";
  return "Message to book.";
}

export function buildCampaignBrief(
  inputs: PromoFormInputs,
  profile: BusinessProfile,
  settings: AppSettings,
): CampaignBrief {
  const selectedOutputs = resolveSelectedOutputs(inputs.selectedOutputs);
  const businessName = clean(profile.businessName) || "Our local business";
  const businessType =
    clean(inputs.businessType || profile.businessType) || "Local service business";
  const serviceArea = clean(inputs.location || profile.serviceArea || settings.defaultServiceArea);
  const featuredServices = unique([
    ...list(inputs.featuredService),
    ...list(profile.mainServices),
    clean(inputs.featuredService),
  ]).slice(0, 5);
  const primaryService = featuredServices[0] || "your service";
  const mainOffer = clean(inputs.offer);
  const campaignGoal = clean(inputs.campaignGoal) || "Get more bookings";
  const targetCustomer =
    clean(inputs.targetCustomer || profile.targetCustomer) || inferTargetCustomer(businessType);
  const tone = clean(inputs.tone || profile.brandTone || settings.defaultBrandTone) || "Friendly";
  const callToAction = ctaFromContact(inputs.callToAction, profile);
  const proofPoints = unique([
    clean(inputs.mainBenefit),
    clean(inputs.extraNotes),
    clean(profile.businessDescription),
    ...(serviceArea
      ? [`Serving ${serviceArea}`]
      : ["Serving local customers with practical, friendly service"]),
    /mobile/i.test(businessType) ? "Convenient mobile service" : "Clear local service details",
    /(one.?on.?one|calm|gentle|friendly)/i.test(
      `${inputs.mainBenefit} ${inputs.extraNotes} ${profile.businessDescription}`,
    )
      ? "Friendly one-on-one care"
      : "Practical next steps before booking",
  ]).slice(0, 6);
  const localDetails = unique([
    serviceArea ? `Serving ${serviceArea}` : "Serving local customers",
    clean(profile.contactMethod),
    /mobile/i.test(businessType)
      ? "At-home convenience when available"
      : "Local appointment options",
    /lethbridge/i.test(serviceArea) ? "Local Lethbridge service" : "Local community service",
  ]).slice(0, 5);
  const campaignTheme = mainOffer
    ? `${mainOffer} for ${primaryService}`
    : `${primaryService} for ${targetCustomer}`;

  return {
    businessName,
    businessType,
    serviceArea,
    targetCustomer,
    campaignType: chooseCampaignType(campaignGoal, selectedOutputs, mainOffer),
    campaignGoal,
    mainOffer,
    featuredServices,
    proofPoints,
    localDetails,
    callToAction,
    tone,
    selectedOutputs,
    campaignTheme,
    campaignName: clean(inputs.campaignName) || `${primaryService} campaign`,
    dates: fmtDates(inputs.startDate, inputs.endDate),
    contactMethod: clean(profile.contactMethod),
    bookingHint: clean(profile.contactMethod) || "Message to ask about availability.",
  };
}
