import type { SelectedOutputs } from "./storage";

export const OUTPUT_OPTIONS: {
  key: keyof SelectedOutputs;
  label: string;
  contentOutput: boolean;
}[] = [
  { key: "facebookPosts", label: "Facebook posts", contentOutput: true },
  { key: "instagramCaptions", label: "Instagram captions", contentOutput: true },
  { key: "googleBusinessPosts", label: "Google Business Profile posts", contentOutput: true },
  { key: "flyerCopy", label: "Promo flyer copy", contentOutput: true },
  { key: "reviewRequests", label: "Review request messages", contentOutput: true },
  { key: "websiteCopy", label: "Website section copy", contentOutput: true },
  { key: "faqContent", label: "FAQ content", contentOutput: true },
  { key: "adCopy", label: "Simple ad copy", contentOutput: true },
  { key: "imagePrompts", label: "AI image prompts", contentOutput: true },
  { key: "videoScripts", label: "Short video script ideas", contentOutput: true },
  { key: "printableSummary", label: "Printable summary", contentOutput: false },
];

export const recommendedOutputs: SelectedOutputs = {
  facebookPosts: true,
  instagramCaptions: false,
  googleBusinessPosts: true,
  flyerCopy: true,
  reviewRequests: true,
  websiteCopy: false,
  faqContent: false,
  adCopy: false,
  imagePrompts: true,
  videoScripts: false,
  printableSummary: true,
};

export const allOutputs: SelectedOutputs = Object.fromEntries(
  OUTPUT_OPTIONS.map(({ key }) => [key, true]),
) as SelectedOutputs;

export const legacyOutputs: SelectedOutputs = {
  ...allOutputs,
  faqContent: false,
  videoScripts: false,
};

export function selectedOutputLabels(outputs: SelectedOutputs) {
  return OUTPUT_OPTIONS.filter(({ key }) => outputs[key]).map(({ label }) => label);
}

export function hasContentOutput(outputs: SelectedOutputs) {
  return OUTPUT_OPTIONS.some(({ key, contentOutput }) => contentOutput && outputs[key]);
}

export function normalizeSelectedOutputs(
  value: unknown,
  fallback: SelectedOutputs = legacyOutputs,
): SelectedOutputs {
  if (!value || typeof value !== "object") return { ...fallback };
  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    OUTPUT_OPTIONS.map(({ key }) => [
      key,
      typeof record[key] === "boolean" ? record[key] : fallback[key],
    ]),
  ) as SelectedOutputs;
}

export function resolveSelectedOutputs(value: unknown): SelectedOutputs {
  return normalizeSelectedOutputs(value, legacyOutputs);
}
