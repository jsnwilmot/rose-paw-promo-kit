import type { BusinessProfile } from "@/lib/storage";

export const BUSINESS_PRESET_FIELDS = [
  "businessName",
  "businessType",
  "serviceArea",
  "businessDescription",
  "mainServices",
  "targetCustomer",
  "brandTone",
  "contactMethod",
  "websiteLink",
  "facebookLink",
  "instagramLink",
  "googleBusinessProfileLink",
  "mainBrandColour",
  "secondaryBrandColour",
] as const satisfies readonly (keyof BusinessProfile)[];

export type BusinessPreset = Pick<BusinessProfile, (typeof BUSINESS_PRESET_FIELDS)[number]>;

const businessPresets: BusinessPreset[] = [
  {
    businessName: "Heidi’s Hair Salon",
    businessType: "Home-based hair salon",
    serviceArea: "Lethbridge",
    businessDescription:
      "Home-based hair salon in Lethbridge focused on friendly, appointment-based hair services.",
    mainServices: "Haircuts, Colour, Highlights, Grey coverage, Family hair services",
    targetCustomer: "Local adults and families looking for friendly, appointment-based hair care",
    brandTone: "Friendly",
    contactMethod: "",
    websiteLink: "",
    facebookLink: "",
    instagramLink: "",
    googleBusinessProfileLink: "",
    mainBrandColour: "#6B4035",
    secondaryBrandColour: "#D9B7A5",
  },
  {
    businessName: "Bear Essential Dog Care",
    businessType: "Mobile dog groomer",
    serviceArea: "Lethbridge",
    businessDescription:
      "Mobile dog grooming service in Lethbridge focused on calm, convenient grooming at the client’s home.",
    mainServices: "Mobile dog grooming, Bath and brush, Nail trims, De-shedding",
    targetCustomer: "Local dog owners who want convenient, lower-stress grooming at home",
    brandTone: "Warm",
    contactMethod: "",
    websiteLink: "",
    facebookLink: "",
    instagramLink: "",
    googleBusinessProfileLink: "",
    mainBrandColour: "#5B4636",
    secondaryBrandColour: "#C99A5B",
  },
  {
    businessName: "Home-Based Hair Salon",
    businessType: "Home-based hair salon",
    serviceArea: "",
    businessDescription:
      "Appointment-based local salon for cuts, colour, highlights, grey coverage, and family hair services.",
    mainServices: "Haircuts, Colour, Highlights, Grey coverage, Family hair services",
    targetCustomer: "Local adults and families looking for convenient, personal hair care",
    brandTone: "Friendly",
    contactMethod: "Send a message to ask about availability",
    websiteLink: "",
    facebookLink: "",
    instagramLink: "",
    googleBusinessProfileLink: "",
    mainBrandColour: "#704A45",
    secondaryBrandColour: "#D8B7AE",
  },
  {
    businessName: "Mobile Dog Groomer",
    businessType: "Mobile dog groomer",
    serviceArea: "",
    businessDescription:
      "Mobile grooming service for local dog owners who want convenient, lower-stress grooming at home.",
    mainServices: "Mobile dog grooming, Bath and brush, Nail trims, De-shedding",
    targetCustomer: "Local dog owners who want convenient grooming at home",
    brandTone: "Warm",
    contactMethod: "Send a message to ask about an appointment",
    websiteLink: "",
    facebookLink: "",
    instagramLink: "",
    googleBusinessProfileLink: "",
    mainBrandColour: "#4F5946",
    secondaryBrandColour: "#D7B878",
  },
  {
    businessName: "Local Cleaning Service",
    businessType: "Cleaner",
    serviceArea: "",
    businessDescription:
      "Local cleaning service for busy households, move-outs, small offices, and recurring cleaning support.",
    mainServices:
      "Recurring home cleaning, Deep cleaning, Move-out cleaning, Small office cleaning",
    targetCustomer: "Busy local households and small businesses",
    brandTone: "Simple and direct",
    contactMethod: "Send a message to request a quote",
    websiteLink: "",
    facebookLink: "",
    instagramLink: "",
    googleBusinessProfileLink: "",
    mainBrandColour: "#356B74",
    secondaryBrandColour: "#B9D9DA",
  },
  {
    businessName: "Local Home Service Contractor",
    businessType: "Home service contractor",
    serviceArea: "",
    businessDescription:
      "Local home service contractor focused on repairs, upgrades, maintenance, and clear communication.",
    mainServices: "Home repairs, Upgrades, Property maintenance, Small renovation projects",
    targetCustomer: "Local homeowners who need reliable help with repairs and improvements",
    brandTone: "Professional",
    contactMethod: "Send a message to request an estimate",
    websiteLink: "",
    facebookLink: "",
    instagramLink: "",
    googleBusinessProfileLink: "",
    mainBrandColour: "#3F5261",
    secondaryBrandColour: "#C7A66B",
  },
  {
    businessName: "Local Tutoring Support",
    businessType: "Tutor",
    serviceArea: "",
    businessDescription:
      "Local tutoring support for students who need help building confidence and keeping up with schoolwork.",
    mainServices: "One-to-one tutoring, Homework help, Test preparation, Study skills",
    targetCustomer: "Local students and families looking for patient, practical learning support",
    brandTone: "Friendly",
    contactMethod: "Send a message to discuss tutoring needs",
    websiteLink: "",
    facebookLink: "",
    instagramLink: "",
    googleBusinessProfileLink: "",
    mainBrandColour: "#4D5685",
    secondaryBrandColour: "#D6C47A",
  },
];

export function getBusinessPresets(): BusinessPreset[] {
  return businessPresets.map((preset) => ({ ...preset }));
}

export function mergePresetWithCurrentProfile(
  currentProfile: BusinessProfile,
  preset: BusinessPreset,
): BusinessProfile {
  return { ...currentProfile, ...preset };
}

export function applyBusinessPresetToProfile(
  currentProfile: BusinessProfile,
  preset: BusinessPreset,
): BusinessProfile {
  return mergePresetWithCurrentProfile(currentProfile, preset);
}
