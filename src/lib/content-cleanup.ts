import type { GeneratedSections } from "./storage";

const bannedPhraseReplacements: Array<[RegExp, string]> = [
  [/\belevate your business\b/gi, "support your local marketing"],
  [/\btransform your experience\b/gi, "make your next step easier"],
  [/\bpremium solutions\b/gi, "practical local service"],
  [/\bunlock your potential\b/gi, "take the next step"],
  [/\btake it to the next level\b/gi, "keep your campaign consistent"],
  [/\bunparalleled\b/gi, "reliable"],
  [/\bworld-class\b/gi, "local"],
  [/\bgame-changing\b/gi, "useful"],
  [/\brevolutionary\b/gi, "helpful"],
  [/\bluxury experience\b/gi, "comfortable experience"],
];

function cleanLine(line: string) {
  return line
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/([!?.,;:])\1+/g, "$1")
    .trim();
}

function dedupeBlankLines(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line, index, list) => {
      const isBlank = line.trim() === "";
      const prevBlank = index > 0 ? list[index - 1].trim() === "" : false;
      return !(isBlank && prevBlank);
    })
    .join("\n");
}

function removeEmptyBullets(value: string) {
  return value
    .split("\n")
    .filter((line) => !/^\s*[-*]\s*$/.test(line))
    .join("\n");
}

const leakedLabelPattern =
  /\b(Hook|Local detail|Local\/business detail|Service or offer|CTA|Angle|Caption line|Shot idea|Supporting line|Offer|Proof|Benefit|Question|Answer)\s*:\s*/gi;

function stripLeakedTemplateLabels(value: string) {
  return value
    .split("\n")
    .map((line) => line.replace(leakedLabelPattern, ""))
    .join("\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function reduceRepeatedCtaLines(value: string, cta: string) {
  if (!cta) return value;
  const normalizedCta = cta
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  let seenCta = false;
  return value
    .split("\n")
    .filter((line) => {
      const normalizedLine = line
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (!normalizedLine || normalizedLine !== normalizedCta) return true;
      if (seenCta) return false;
      seenCta = true;
      return true;
    })
    .join("\n");
}

function reduceBusinessNameRepetition(value: string, businessName: string) {
  const plainName = businessName.trim();
  if (!plainName || value.length > 220) return value;
  const regex = new RegExp(plainName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  let hitCount = 0;
  return value.replace(regex, (match) => {
    hitCount += 1;
    if (hitCount <= 2) return match;
    return "our team";
  });
}

export function cleanupGeneratedText(
  value: string,
  businessName: string,
  cta: string,
  options: { stripTemplateLabels?: boolean } = {},
) {
  const { stripTemplateLabels = true } = options;
  let next = value || "";
  next = dedupeBlankLines(next);
  next = removeEmptyBullets(next);
  next = next
    .split("\n")
    .map((line) => cleanLine(line))
    .join("\n");
  next = reduceRepeatedCtaLines(next, cta);
  next = reduceBusinessNameRepetition(next, businessName);
  if (stripTemplateLabels) next = stripLeakedTemplateLabels(next);
  for (const [pattern, replacement] of bannedPhraseReplacements) {
    next = next.replace(pattern, replacement);
  }
  next = next
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim();
  return next;
}

export function cleanupGeneratedSections(
  sections: GeneratedSections,
  businessName: string,
  cta: string,
): GeneratedSections {
  const walk = (value: unknown, path: string[] = []): unknown => {
    if (typeof value === "string") {
      const isCalendarPlanningNote =
        path.length >= 3 && path[path.length - 1] === "note" && path.includes("postingPlan");
      return cleanupGeneratedText(value, businessName, cta, {
        stripTemplateLabels: !isCalendarPlanningNote,
      });
    }
    if (Array.isArray(value)) return value.map((item, index) => walk(item, [...path, `${index}`]));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, walk(nestedValue, [...path, key])]),
      );
    }
    return value;
  };
  return walk(sections, []) as GeneratedSections;
}
