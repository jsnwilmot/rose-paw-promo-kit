import type { AppSettings, BusinessProfile, GeneratedSections, PromoFormInputs } from "./storage";
import { buildCampaignBrief } from "./campaign-brief";
import { cleanupGeneratedSections } from "./content-cleanup";

function clean(value: string | undefined) {
  return (value || "").trim().replace(/\s+/g, " ");
}

function sentence(value: string | undefined) {
  const text = clean(value);
  return text ? `${text.replace(/[.!?]+$/, "")}.` : "";
}

function line(parts: Array<string | undefined>) {
  return parts.map(sentence).filter(Boolean).join(" ");
}

function words(value: string, max = 90) {
  const entries = value.trim().split(/\s+/);
  if (entries.length <= max) return value.trim();
  return `${entries
    .slice(0, max)
    .join(" ")
    .replace(/[,:;.!?]+$/, "")}...`;
}

function composeBlock(parts: Array<string | undefined>) {
  return parts
    .map((part) => clean(part))
    .filter(Boolean)
    .join("\n\n");
}

function localPhrase(serviceArea: string) {
  return serviceArea ? `in ${serviceArea}` : "for local customers";
}

function bulletList(values: string[]) {
  return values
    .map((value) => clean(value))
    .filter(Boolean)
    .slice(0, 5);
}

function calendarEntry(
  day: number,
  platform: string,
  type: string,
  topic: string,
  angle: string,
  cta: string,
): GeneratedSections["postingPlan"][number] {
  return {
    day: `Day ${day}`,
    platform,
    type,
    topic,
    note: `${angle} Goal: support this campaign theme. CTA: ${cta}`,
  };
}

function buildCampaignCalendar(
  brief: ReturnType<typeof buildCampaignBrief>,
): GeneratedSections["postingPlan"] {
  const outputs = brief.selectedOutputs;
  const service = brief.featuredServices[0] || "service";
  const theme = brief.campaignTheme;
  const cta = brief.callToAction;

  const enabled = Object.entries(outputs)
    .filter(([key, value]) => key !== "printableSummary" && value)
    .map(([key]) => key);

  if (enabled.length === 1 && enabled[0] === "facebookPosts") {
    return [
      calendarEntry(1, "Facebook", "Launch post", theme, "Introduce the campaign focus", cta),
      calendarEntry(
        2,
        "Facebook",
        "Service post",
        service,
        "Explain one practical service detail",
        cta,
      ),
      calendarEntry(
        3,
        "Facebook",
        "Local proof post",
        brief.localDetails[0],
        "Show local relevance",
        cta,
      ),
      calendarEntry(
        4,
        "Facebook",
        "Offer or benefit post",
        brief.mainOffer || service,
        "Clarify why to book",
        cta,
      ),
      calendarEntry(
        5,
        "Facebook",
        "FAQ post",
        `Question about ${service}`,
        "Answer one common question",
        cta,
      ),
      calendarEntry(
        6,
        "Facebook",
        "Trust post",
        brief.proofPoints[0],
        "Share a clear proof point",
        cta,
      ),
      calendarEntry(
        7,
        "Facebook",
        "Reminder post",
        theme,
        "Close the week with one clear reminder",
        cta,
      ),
    ];
  }

  if (
    enabled.length === 2 &&
    enabled.includes("facebookPosts") &&
    enabled.includes("googleBusinessPosts")
  ) {
    return [
      calendarEntry(1, "Facebook", "Launch post", theme, "Introduce the campaign", cta),
      calendarEntry(
        2,
        "Google Business Profile",
        "Local update",
        service,
        "Reinforce local service keywords",
        cta,
      ),
      calendarEntry(
        3,
        "Facebook",
        "Benefit post",
        brief.proofPoints[0],
        "Highlight one practical benefit",
        cta,
      ),
      calendarEntry(
        4,
        "Google Business Profile",
        "Offer reminder",
        brief.mainOffer || service,
        "Give a clear reason to book",
        cta,
      ),
      calendarEntry(
        5,
        "Facebook",
        "Customer question post",
        `Question about ${service}`,
        "Answer a common question",
        cta,
      ),
      calendarEntry(
        6,
        "Google Business Profile",
        "Service availability",
        brief.localDetails[0],
        "Confirm service area and availability",
        cta,
      ),
      calendarEntry(
        7,
        "Facebook",
        "Final reminder",
        theme,
        "Close campaign week with direct CTA",
        cta,
      ),
    ];
  }

  if (enabled.length === 1 && enabled[0] === "flyerCopy") {
    return [
      calendarEntry(
        1,
        "Flyer",
        "Finalize copy",
        theme,
        "Lock headline, support line, and CTA",
        cta,
      ),
      calendarEntry(
        2,
        "Flyer",
        "Prepare handouts",
        service,
        "Print or export handout version",
        cta,
      ),
      calendarEntry(
        3,
        "Local handout",
        "Share locally",
        brief.localDetails[0],
        "Place in community touchpoints",
        cta,
      ),
      calendarEntry(
        4,
        "Direct follow-up",
        "Check interest",
        service,
        "Follow up with interested contacts",
        cta,
      ),
      calendarEntry(
        5,
        "Flyer",
        "Refresh message",
        brief.mainOffer || service,
        "Adjust one line for clarity",
        cta,
      ),
      calendarEntry(
        6,
        "Local handout",
        "Second wave",
        theme,
        "Share updated flyers in local channels",
        cta,
      ),
      calendarEntry(
        7,
        "Direct follow-up",
        "Final reminder",
        theme,
        "Send one final reminder using flyer CTA",
        cta,
      ),
    ];
  }

  if (enabled.length === 1 && enabled[0] === "reviewRequests") {
    return [
      calendarEntry(
        1,
        "Review request",
        "Prepare list",
        "Recent happy clients",
        "Build a short target list",
        cta,
      ),
      calendarEntry(
        2,
        "Review request",
        "First ask",
        "Friendly thank-you request",
        "Send a polite first batch",
        cta,
      ),
      calendarEntry(
        3,
        "Review request",
        "Follow-up",
        "Short reminder",
        "Follow up with people who did not reply",
        cta,
      ),
      calendarEntry(
        4,
        "Review request",
        "Second ask",
        "Another small batch",
        "Ask another set of recent clients",
        cta,
      ),
      calendarEntry(
        5,
        "Review request",
        "Respond",
        "Reply to new reviews",
        "Thank reviewers quickly",
        cta,
      ),
      calendarEntry(
        6,
        "Review request",
        "Reminder",
        "Light follow-up message",
        "Keep tone friendly and brief",
        cta,
      ),
      calendarEntry(
        7,
        "Review request",
        "Weekly recap",
        "Review request results",
        "Plan next week's ask timing",
        cta,
      ),
    ];
  }

  if (enabled.length === 1 && enabled[0] === "websiteCopy") {
    return [
      calendarEntry(1, "Website", "Publish heading", service, "Update service page heading", cta),
      calendarEntry(2, "Website", "Publish paragraph", theme, "Add short campaign paragraph", cta),
      calendarEntry(
        3,
        "Website",
        "Add bullets",
        brief.proofPoints[0],
        "Insert practical benefit bullets",
        cta,
      ),
      calendarEntry(4, "Website", "CTA check", cta, "Confirm CTA appears clearly above fold", cta),
      calendarEntry(5, "Website", "Internal link", service, "Link from homepage or key page", cta),
      calendarEntry(
        6,
        "Website",
        "Mobile review",
        brief.localDetails[0],
        "Check mobile readability",
        cta,
      ),
      calendarEntry(
        7,
        "Website",
        "Share update",
        theme,
        "Share updated page in client messages",
        cta,
      ),
    ];
  }

  const mappedPlatforms: Array<{ platform: string; type: string; topic: string }> = [];
  if (outputs.facebookPosts)
    mappedPlatforms.push({ platform: "Facebook", type: "Post", topic: theme });
  if (outputs.instagramCaptions)
    mappedPlatforms.push({ platform: "Instagram", type: "Caption", topic: theme });
  if (outputs.googleBusinessPosts)
    mappedPlatforms.push({
      platform: "Google Business Profile",
      type: "Local post",
      topic: service,
    });
  if (outputs.flyerCopy)
    mappedPlatforms.push({ platform: "Flyer", type: "Handout", topic: service });
  if (outputs.reviewRequests)
    mappedPlatforms.push({
      platform: "Review request",
      type: "Message",
      topic: "Client thank-you ask",
    });
  if (outputs.websiteCopy || outputs.faqContent)
    mappedPlatforms.push({ platform: "Website", type: "Update", topic: service });
  if (outputs.adCopy)
    mappedPlatforms.push({ platform: "Ad copy", type: "Ad update", topic: theme });
  if (outputs.imagePrompts)
    mappedPlatforms.push({ platform: "Creative", type: "Image prompt", topic: service });
  if (outputs.videoScripts)
    mappedPlatforms.push({ platform: "Video", type: "Script", topic: service });

  if (!mappedPlatforms.length) {
    mappedPlatforms.push({ platform: "Campaign planning", type: "Planning", topic: theme });
  }

  return Array.from({ length: 7 }, (_, index) => {
    const source = mappedPlatforms[index % mappedPlatforms.length];
    return calendarEntry(
      index + 1,
      source.platform,
      source.type,
      source.topic,
      `Keep each touchpoint aligned with ${theme}`,
      cta,
    );
  });
}

export function generateKit(
  inputs: PromoFormInputs,
  profile: BusinessProfile,
  settings: AppSettings,
): GeneratedSections {
  const brief = buildCampaignBrief(inputs, profile, settings);
  const service = brief.featuredServices[0] || "service";
  const serviceLine = `${service} ${localPhrase(brief.serviceArea)}`.trim();
  const offerLine = brief.mainOffer || `Focused on ${service}`;
  const locationLine = brief.serviceArea
    ? `${brief.businessName} serving ${brief.serviceArea}`
    : `${brief.businessName} serving local customers`;
  const proof = brief.proofPoints[0] || "Serving local customers with practical, friendly service";
  const secondProof = brief.proofPoints[1] || "Clear next steps before booking";
  const cta = brief.callToAction;
  const isContractor = /(contract|repair|renov|handyman|home service|maintenance)/i.test(
    brief.businessType,
  );
  const primaryHook = isContractor
    ? "Need help with repairs or small upgrades around your home?"
    : brief.mainOffer
      ? `${brief.mainOffer} ${localPhrase(brief.serviceArea)}`
      : `Need ${service} ${localPhrase(brief.serviceArea)}?`;
  const serviceDetail = isContractor
    ? `${brief.businessName} helps homeowners${brief.serviceArea ? ` in ${brief.serviceArea}` : ""} with repairs, maintenance, upgrades, and clear communication.`
    : `${brief.businessName} helps ${brief.targetCustomer}${brief.serviceArea ? ` in ${brief.serviceArea}` : ""} with ${service}.`;

  const generated: GeneratedSections = {
    summary: {
      campaignName: brief.campaignName,
      goal: brief.campaignGoal,
      audience: brief.targetCustomer,
      offer: brief.mainOffer || "No offer added",
      dates: brief.dates,
      recommendedCta: cta,
      notes: brief.proofPoints.slice(0, 2).join(" | "),
    },
    facebookPosts: [
      {
        label: "Campaign launch",
        text: composeBlock([primaryHook, serviceDetail, offerLine, cta]),
      },
      {
        label: "Service detail",
        text: composeBlock([
          `${service} for ${brief.targetCustomer}.`,
          brief.localDetails[0] || locationLine,
          proof,
          cta,
        ]),
      },
      {
        label: "Weekly reminder",
        text: composeBlock([
          "A quick local reminder for this week.",
          brief.localDetails[1] || locationLine,
          brief.mainOffer || serviceLine,
          cta,
        ]),
      },
    ],
    instagramCaptions: [
      {
        label: "Campaign caption",
        text: words(
          line([`${brief.campaignTheme}`, `${locationLine}`, `${offerLine}`, `${cta}`]),
          80,
        ),
      },
      {
        label: "Proof caption",
        text: words(
          line([`${service} for ${brief.targetCustomer}`, `${proof}`, `${secondProof}`, `${cta}`]),
          80,
        ),
      },
      {
        label: "Booking caption",
        text: words(
          line([
            `${brief.businessName} ${localPhrase(brief.serviceArea)}`,
            `${brief.mainOffer || service}`,
            `${cta}`,
          ]),
          80,
        ),
      },
    ],
    googlePosts: [
      {
        label: "Primary local post",
        text: composeBlock([
          `${brief.businessName} ${localPhrase(brief.serviceArea)}`,
          `${brief.featuredServices.slice(0, 3).join(", ") || service}`,
          brief.mainOffer || proof,
          cta,
        ]),
      },
      {
        label: "Booking reminder",
        text: composeBlock([
          `${brief.businessName} ${localPhrase(brief.serviceArea)}`,
          service,
          brief.mainOffer || secondProof,
          cta,
        ]),
      },
    ],
    flyer: {
      headline: words(brief.mainOffer || `${service} ${localPhrase(brief.serviceArea)}`, 10),
      subheadline: words(line([`${brief.businessName} for ${brief.targetCustomer}`, proof]), 30),
      bullets: bulletList([
        proof,
        secondProof,
        brief.mainOffer
          ? `${brief.mainOffer}${brief.dates !== "Ongoing" ? ` (${brief.dates})` : ""}`
          : `Focused on ${service}`,
      ]),
      cta,
      contact: brief.contactMethod || "Message to ask about availability.",
    },
    reviewRequests: [
      {
        label: "Short thank-you",
        text: line([
          `Thank you for choosing ${brief.businessName}`,
          `If the service helped, we would appreciate a short review`,
          profile.googleBusinessProfileLink ||
            "Please reply and we can share where to leave a review",
        ]),
      },
      {
        label: "Follow-up message",
        text: `Hi there,\n\n${line([
          `Thanks again for choosing ${brief.businessName}`,
          `A quick review helps local customers know what to expect`,
          profile.googleBusinessProfileLink || "Reply and we will send our review link",
        ])}\n\nThank you.`,
      },
      {
        label: "Friendly reminder",
        text: line([
          `Thanks for your recent appointment with ${brief.businessName}`,
          `If you have a moment, we would value a short review`,
          profile.googleBusinessProfileLink || "Ask us for the review link",
        ]),
      },
    ],
    websiteCopy: {
      headline: words(`${service} ${localPhrase(brief.serviceArea)}`, 12),
      paragraph: `${line([
        `${brief.businessName} helps ${brief.targetCustomer}`,
        brief.mainOffer || `Service focus: ${service}`,
      ])}\n- ${proof}\n- ${secondProof}\n- ${cta}`,
      button: cta,
    },
    faqContent: [
      {
        question: `What services are included for ${service}?`,
        answer: line([
          `We can walk you through ${brief.featuredServices.slice(0, 4).join(", ") || service}`,
          `and explain the best fit for your needs.`,
        ]),
      },
      {
        question: brief.serviceArea
          ? `Do you serve ${brief.serviceArea}?`
          : "Do you serve local customers?",
        answer: brief.serviceArea
          ? `${brief.businessName} serves ${brief.serviceArea}.`
          : `${brief.businessName} serves local customers.`,
      },
      {
        question: "How do I book or ask about availability?",
        answer: cta,
      },
    ],
    adCopy: {
      headline: words(brief.mainOffer || `${service} ${localPhrase(brief.serviceArea)}`, 8),
      primary: words(line([`${brief.businessName}`, offerLine, proof, cta]), 60),
      description: words(line([brief.localDetails[0], secondProof]), 20),
      ctaButton: /call/i.test(cta) ? "Call Now" : /message/i.test(cta) ? "Message Us" : "Book Now",
    },
    emailNewsletter: {
      subject: words(brief.mainOffer || `${service} update from ${brief.businessName}`, 10),
      previewText: words(line([offerLine, proof]), 20),
      body: `Hi there,\n\n${line([locationLine, offerLine, proof, secondProof, cta])}\n\nThank you,\n${brief.businessName}`,
      cta,
    },
    hashtagSuggestions: [
      "#SupportLocal",
      brief.serviceArea ? `#${brief.serviceArea.replace(/[^a-zA-Z0-9]+/g, "")}` : "#LocalBusiness",
      `#${service.replace(/[^a-zA-Z0-9]+/g, "")}`,
      "#BookLocal",
    ].filter(Boolean),
    imagePrompts: [
      `${brief.businessType} campaign image ${localPhrase(brief.serviceArea)}, focused on ${service}. Include realistic local setting and practical service moment. No text overlay, no logos, no stock look.`,
      `${brief.businessName} style visual showing ${brief.mainOffer || service} with a clear local context and approachable tone. No text overlay, no logos.`,
      `Simple printable background for ${brief.campaignTheme}, local-business look, clean spacing, no text overlay, no logos.`,
    ],
    videoScripts: [
      {
        label: "Quick service intro",
        text: composeBlock([
          `${brief.campaignTheme}`,
          `Film one practical moment of ${service} ${localPhrase(brief.serviceArea)}.`,
          `${offerLine}.`,
          cta,
        ]),
      },
      {
        label: "FAQ short",
        text: composeBlock([
          "Quick answer for local customers.",
          `Answer one practical question about ${service}.`,
          proof,
          cta,
        ]),
      },
    ],
    postingPlan: buildCampaignCalendar(brief),
  };

  const outputs = brief.selectedOutputs;
  if (!outputs.facebookPosts) delete generated.facebookPosts;
  if (!outputs.instagramCaptions) {
    delete generated.instagramCaptions;
    delete generated.hashtagSuggestions;
  }
  if (!outputs.googleBusinessPosts) delete generated.googlePosts;
  if (!outputs.flyerCopy) delete generated.flyer;
  if (!outputs.reviewRequests) delete generated.reviewRequests;
  if (!outputs.websiteCopy) delete generated.websiteCopy;
  if (!outputs.faqContent) delete generated.faqContent;
  if (!outputs.adCopy) delete generated.adCopy;
  if (!outputs.imagePrompts) delete generated.imagePrompts;
  if (!outputs.videoScripts) delete generated.videoScripts;
  if (inputs.selectedOutputs) delete generated.emailNewsletter;

  return cleanupGeneratedSections(generated, brief.businessName, brief.callToAction);
}
