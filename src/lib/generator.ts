import type { AppSettings, BusinessProfile, GeneratedSections, PromoFormInputs } from "./storage";
import { legacyOutputs } from "./output-selection";

function pick<T>(items: T[], seed: string): T {
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return items[total % items.length];
}

function clean(value: string | undefined) {
  return (value || "").trim().replace(/\s+/g, " ");
}

function lowercaseFirst(value: string) {
  return value ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

export function cleanListItems(...values: (string | string[] | undefined)[]) {
  const items = values
    .flatMap((value) => (Array.isArray(value) ? value : (value || "").split(/\r?\n|,/)))
    .map((value) =>
      clean(value)
        .replace(/^[-*]\s*/, "")
        .replace(/[.!?]+$/, ""),
    )
    .filter(Boolean);
  return [...new Set(items)];
}

export function sentenceCaseFallback(value: string | undefined, fallback: string) {
  const result = clean(value) || fallback;
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function sentence(value: string | undefined) {
  const result = clean(value);
  return result ? `${result.replace(/[.!?]+$/, "")}.` : "";
}

export function trimRepeatedPhrases(value: string) {
  const seen = new Set<string>();
  return value
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((part) => {
      const key = part
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(" ")
    .trim();
}

export function limitWords(value: string, maximum: number) {
  const words = value.trim().split(/\s+/);
  if (words.length <= maximum) return value.trim();
  return `${words
    .slice(0, maximum)
    .join(" ")
    .replace(/[,:;.!?]+$/, "")}...`;
}

function joinCopy(parts: (string | undefined)[], maximum: number) {
  return limitWords(trimRepeatedPhrases(parts.map(sentence).filter(Boolean).join(" ")), maximum);
}

function fmtDates(start: string, end: string) {
  if (!start && !end) return "Ongoing";
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

function toneOpener(tone: string, seed: string) {
  const choices: Record<string, string[]> = {
    Friendly: ["A quick update from our team", "We wanted to share something useful", "Good news"],
    Professional: ["A local service update", "Now available", "A quick update from our team"],
    Fun: ["Good news", "Here is something worth sharing", "A local favourite is back"],
    Warm: ["A note for our neighbours", "We would love to help", "From our local team"],
    Boutique: ["A note from the studio", "Created with our local clients in mind", "Now available"],
    "Local and personal": ["Hi neighbours", "A quick local update", "For our neighbours nearby"],
    "Simple and direct": ["Now booking", "Quick update", "Here is what is available"],
  };
  return pick(choices[tone] || ["A quick local update", "Now available", "Good news"], seed);
}

function formatExtraNotes(notes: string) {
  return clean(notes).replace(/[.!?]+$/, "");
}

function hashtag(value: string) {
  const cleaned = value
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return cleaned ? `#${cleaned}` : "";
}

function hashtagSuggestions(
  businessType: string,
  location: string,
  goal: string,
  service: string,
  tone: string,
) {
  const tags = new Set([
    hashtag(businessType),
    hashtag(service),
    hashtag(location),
    hashtag(location ? `${location} Small Business` : ""),
    hashtag(goal),
    hashtag(`${tone} Service`),
    "#SupportLocal",
    "#ShopLocal",
  ]);
  if (/lethbridge/i.test(location)) {
    tags.add("#YQLBusiness");
    tags.add("#LethbridgeSmallBusiness");
  }
  return [...tags].filter(Boolean).slice(0, 10);
}

function goalLanguage(goal: string) {
  const options: Record<
    string,
    { hook: string; cta: string; launchPurpose: string; reminderPurpose: string }
  > = {
    "Get more bookings": {
      hook: "Make your next appointment easy",
      cta: "Message us to find a time that works",
      launchPurpose: "Introduce the service and invite bookings",
      reminderPurpose: "Remind local customers to choose a time",
    },
    "Promote a new service": {
      hook: "Meet our newest service",
      cta: "Ask us if this service is right for you",
      launchPurpose: "Introduce the new service and explain who it helps",
      reminderPurpose: "Answer a common question about the new service",
    },
    "Fill slow days": {
      hook: "A quieter day can be easier to book",
      cta: "Ask about our quieter appointment times",
      launchPurpose: "Share the available times and make booking easy",
      reminderPurpose: "Remind customers about quieter-day availability",
    },
    "Get more reviews": {
      hook: "Your experience helps neighbours choose local",
      cta: "Share a quick review",
      launchPurpose: "Explain why local reviews matter",
      reminderPurpose: "Thank customers and invite a short review",
    },
    "Promote a seasonal offer": {
      hook: "A useful seasonal offer is here",
      cta: "Ask us about the seasonal offer",
      launchPurpose: "Introduce the seasonal offer and its timing",
      reminderPurpose: "Remind customers before the offer ends",
    },
    "Announce a new business": {
      hook: "A new local business is ready to help",
      cta: "Get in touch and say hello",
      launchPurpose: "Introduce the business and its main service",
      reminderPurpose: "Invite neighbours to learn more",
    },
    "Bring back past customers": {
      hook: "It would be great to see you again",
      cta: "Get in touch when you are ready",
      launchPurpose: "Welcome past customers back",
      reminderPurpose: "Give past customers a simple reason to return",
    },
    "Promote a monthly content campaign": {
      hook: "This month, we are focusing on something useful",
      cta: "Follow along or get in touch",
      launchPurpose: "Introduce the monthly theme",
      reminderPurpose: "Recap the theme and invite a response",
    },
  };
  return (
    options[goal] || {
      hook: "A helpful local update",
      cta: "Get in touch to learn more",
      launchPurpose: "Introduce the campaign clearly",
      reminderPurpose: "Give customers a simple reminder",
    }
  );
}

function businessLanguage(type: string) {
  const lower = type.toLowerCase();
  if (/(groom|pet|dog|cat|animal)/.test(lower))
    return {
      trust: "calm, caring service",
      process: "Show a gentle step in the grooming process",
      visual: "a relaxed pet with a groomer in a clean, calm setting",
      benefits: ["Calm, caring approach", "Clear booking and service details"],
    };
  if (/(salon|hair|beauty|spa|nail)/.test(lower))
    return {
      trust: "friendly service and personal attention",
      process: "Show the service, consultation, or finished result",
      visual: "a welcoming local salon with a stylist working with a real client",
      benefits: ["Personal attention", "Clear service and appointment details"],
    };
  if (/(clean|landscap|repair|contract|home)/.test(lower))
    return {
      trust: "reliable local help and tidy results",
      process: "Show a simple before-and-after or work-in-progress detail",
      visual: "a local professional working carefully in a real home",
      benefits: ["Reliable local service", "Clear scope and next steps"],
    };
  if (/(tutor|coach|lesson|class|education)/.test(lower))
    return {
      trust: "patient guidance and practical progress",
      process: "Show a useful teaching moment or simple learning activity",
      visual: "a friendly one-to-one learning session with natural expressions",
      benefits: ["Patient guidance", "Practical next steps"],
    };
  return {
    trust: "friendly, dependable local service",
    process: "Show the service in action",
    visual: "a real local business serving a customer in a natural setting",
    benefits: ["Friendly local service", "Clear, practical next steps"],
  };
}

export function buildLocalServiceLine(service: string, location: string) {
  return location ? `${service} in ${location}` : service;
}

export function buildSimpleCTA(goal: string, provided: string) {
  return clean(provided) || goalLanguage(goal).cta;
}

export function formatBenefitBullets(
  benefit: string,
  defaults: string[],
  offer: string,
  dates: string,
  extraNotes: string,
) {
  const bullets = cleanListItems(
    benefit,
    defaults,
    offer ? `${offer}${dates !== "Ongoing" ? ` (${dates})` : ""}` : "",
    extraNotes,
  );
  for (const fallback of ["Simple next steps", "Questions welcome before you book"]) {
    if (bullets.length >= 3) break;
    bullets.push(fallback);
  }
  return bullets.slice(0, 5).map((bullet) => sentenceCaseFallback(bullet, bullet));
}

function shortHeadline(service: string, offer: string, seed: string) {
  const usableOffer =
    offer && offer.split(/\s+/).length <= 8 ? sentenceCaseFallback(offer, "") : "";
  return limitWords(
    pick(
      [
        usableOffer || `Make time for ${service}`,
        `Local ${service}, made simple`,
        `${sentenceCaseFallback(service, "Local service")} for your next visit`,
      ],
      seed,
    ),
    8,
  );
}

function buildCampaignCalendar(
  inputs: PromoFormInputs,
  service: string,
  offer: string,
  cta: string,
): GeneratedSections["postingPlan"] {
  const outputs = inputs.selectedOutputs || legacyOutputs;
  const day = (index: number, platform: string, type: string, topic: string, note: string) => ({
    day: `Day ${index}`,
    platform,
    type,
    topic,
    note,
  });

  if (
    outputs.facebookPosts &&
    !Object.entries(outputs).some(
      ([key, value]) => key !== "facebookPosts" && key !== "printableSummary" && value,
    )
  ) {
    return [
      day(1, "Facebook", "Campaign launch post", offer || service, "Introduce the campaign"),
      day(2, "Facebook", "Service benefit post", service, "Explain one practical benefit"),
      day(3, "Facebook", "Behind-the-scenes post", service, "Build trust by showing the process"),
      day(4, "Facebook", "Customer question post", service, "Answer a common customer question"),
      day(
        5,
        "Facebook",
        "Offer reminder post",
        offer || service,
        "Give customers a useful reminder",
      ),
      day(6, "Facebook", "Trust post", service, "Share a review-style trust message"),
      day(7, "Facebook", "Final call-to-action post", cta, "Close with one clear next step"),
    ];
  }
  if (
    outputs.flyerCopy &&
    !Object.entries(outputs).some(
      ([key, value]) => key !== "flyerCopy" && key !== "printableSummary" && value,
    )
  ) {
    return [
      day(1, "Flyer", "Finalize copy", offer || service, "Review the headline, details, and CTA"),
      day(2, "Flyer", "Print or export", offer || service, "Prepare a shareable flyer"),
      day(3, "Local outreach", "Share flyer", service, "Place or share the flyer locally"),
      day(
        4,
        "Customer communication",
        "Share flyer directly",
        service,
        "Use an existing customer channel",
      ),
      day(
        5,
        "Direct follow-up",
        "Warm lead follow-up",
        offer || service,
        "Answer questions from interested customers",
      ),
      day(6, "Flyer", "Refresh placement", service, "Check and refresh flyer visibility"),
      day(7, "Direct reminder", "Final reminder", cta, "Give one clear final next step"),
    ];
  }
  if (
    outputs.reviewRequests &&
    !Object.entries(outputs).some(
      ([key, value]) => key !== "reviewRequests" && key !== "printableSummary" && value,
    )
  ) {
    return [
      day(1, "Review request", "Prepare message", service, "Choose a short, natural request"),
      day(2, "Direct message", "Send first batch", service, "Contact recent happy customers"),
      day(
        3,
        "Direct follow-up",
        "Small follow-up batch",
        service,
        "Follow up with 2 to 3 customers",
      ),
      day(
        4,
        "Public channel",
        "Thank-you message",
        service,
        "Thank customers without pressuring them",
      ),
      day(
        5,
        "Direct message",
        "Send second batch",
        service,
        "Share the review link with another small batch",
      ),
      day(6, "Reviews", "Reply to reviews", service, "Respond to new reviews"),
      day(7, "Review request", "Review results", service, "Plan the next request batch"),
    ];
  }
  if (
    outputs.websiteCopy &&
    !Object.entries(outputs).some(
      ([key, value]) => key !== "websiteCopy" && key !== "printableSummary" && value,
    )
  ) {
    return [
      day(1, "Website", "Review service page", service, "Identify the page that needs updating"),
      day(2, "Website", "Update headline and intro", service, "Make the service clear"),
      day(3, "Website", "Add service benefits", service, "Explain practical customer benefits"),
      day(4, "Website", "Add FAQ", service, "Answer common questions"),
      day(5, "Website", "Add call to action", cta, "Make the next step clear"),
      day(6, "Website", "Check mobile view", service, "Review the update on a small screen"),
      day(7, "Website", "Publish and share", service, "Publish the update and tell customers"),
    ];
  }

  const channels: { platform: string; types: string[] }[] = [];
  if (outputs.facebookPosts)
    channels.push({
      platform: "Facebook",
      types: ["Campaign launch", "Benefit post", "Final reminder"],
    });
  if (outputs.instagramCaptions)
    channels.push({
      platform: "Instagram",
      types: ["Photo or reel", "Behind the scenes", "Reminder"],
    });
  if (outputs.googleBusinessPosts)
    channels.push({
      platform: "Google Business Profile",
      types: ["Local update", "Service reminder", "Offer reminder"],
    });
  if (outputs.flyerCopy)
    channels.push({ platform: "Flyer", types: ["Finalize copy", "Share locally"] });
  if (outputs.reviewRequests)
    channels.push({ platform: "Review request", types: ["Send request", "Follow up"] });
  if (outputs.websiteCopy || outputs.faqContent)
    channels.push({ platform: "Website", types: ["Update service page", "Add FAQ"] });
  if (outputs.adCopy)
    channels.push({ platform: "Ad campaign", types: ["Prepare ad", "Review response"] });
  if (outputs.imagePrompts)
    channels.push({ platform: "Creative", types: ["Create campaign image"] });
  if (outputs.videoScripts)
    channels.push({ platform: "Short video", types: ["Record service video", "Share video"] });
  if (!channels.length)
    channels.push({
      platform: "Campaign planning",
      types: ["Review campaign", "Prepare next step"],
    });

  return Array.from({ length: 7 }, (_, index) => {
    const channel = channels[index % channels.length];
    const type = channel.types[Math.floor(index / channels.length) % channel.types.length];
    return day(
      index + 1,
      channel.platform,
      type,
      index === 0 ? offer || service : service,
      index === 6
        ? `Close with a clear next step: ${cta}`
        : "Keep the campaign moving with a useful customer touchpoint",
    );
  });
}

export function generateKit(
  inputs: PromoFormInputs,
  profile: BusinessProfile,
  settings: AppSettings,
): GeneratedSections {
  const name = clean(profile.businessName) || "Our local team";
  const location = clean(inputs.location || profile.serviceArea || settings.defaultServiceArea);
  const audience = clean(inputs.targetCustomer || profile.targetCustomer) || "local customers";
  const businessType = clean(inputs.businessType || profile.businessType) || "local business";
  const business = businessLanguage(businessType);
  const service = lowercaseFirst(
    clean(inputs.featuredService) || cleanListItems(profile.mainServices)[0] || "our main service",
  );
  const offer = clean(inputs.offer);
  const benefit = clean(inputs.mainBenefit);
  const goal = clean(inputs.campaignGoal) || "Get more bookings";
  const goalCopy = goalLanguage(goal);
  const cta = buildSimpleCTA(goal, inputs.callToAction);
  const tone = clean(inputs.tone || profile.brandTone || settings.defaultBrandTone) || "Friendly";
  const seed = `${inputs.campaignName}-${goal}-${businessType}`;
  const opener = toneOpener(tone, seed);
  const dates = fmtDates(inputs.startDate, inputs.endDate);
  const extraNotes = formatExtraNotes(inputs.extraNotes);
  const serviceLine = buildLocalServiceLine(service, location);
  const localAudience = location ? `${audience} in ${location}` : audience;
  const contact = clean(profile.contactMethod || profile.websiteLink) || "Get in touch";
  const offerSentence = offer ? `Right now, we are sharing ${offer}` : "";
  const benefitSentence = benefit || business.trust;
  const benefitLine = sentenceCaseFallback(benefitSentence, business.trust);

  const facebookPosts = [
    {
      label: "Campaign launch",
      text: joinCopy(
        [
          opener,
          `${name} is highlighting ${serviceLine}`,
          offerSentence,
          benefitLine,
          `We keep the details clear so you know what to expect`,
          `If this has been on your list, ${cta.toLowerCase()}`,
        ],
        90,
      ),
    },
    {
      label: "Customer-focused post",
      text: joinCopy(
        [
          `${goalCopy.hook} for ${localAudience}`,
          `${sentenceCaseFallback(service, "Our service")} can be a good fit when you want ${benefitSentence}`,
          offer ? `The current offer is ${offer}` : "",
          extraNotes,
          `Questions are welcome before you decide`,
          `We will help you understand what to expect before you book`,
          cta,
        ],
        90,
      ),
    },
    {
      label: "Local reminder",
      text: joinCopy(
        [
          location ? `A quick reminder for ${location}` : "A quick reminder",
          `${name} offers ${service} with ${business.trust}`,
          offerSentence,
          `Questions are welcome`,
          `We will help you understand the next step`,
          `Tell us what you need and we will point you in the right direction`,
          cta,
        ],
        90,
      ),
    },
  ];

  const instagramCaptions = [
    {
      label: "Service spotlight",
      text: joinCopy(
        [
          `${sentenceCaseFallback(service, "Our service")} is the focus today`,
          `${name} helps ${localAudience} with ${benefitSentence}`,
          offerSentence,
          `We keep the process clear and practical`,
          `You can ask questions before choosing a time`,
          cta,
        ],
        80,
      ),
    },
    {
      label: "Behind the scenes",
      text: joinCopy(
        [
          `A simple look behind the scenes at ${name}`,
          business.process,
          `It is one way we make ${service} feel clear and approachable`,
          `Questions are always welcome`,
          cta,
        ],
        80,
      ),
    },
    {
      label: "Campaign reminder",
      text: joinCopy(
        [
          location
            ? `${sentenceCaseFallback(service, "Our service")} for ${location} customers`
            : sentenceCaseFallback(service, "Our service"),
          offerSentence,
          extraNotes,
          `We keep the details simple`,
          `It is a straightforward way to learn what is available from a local team`,
          `Questions are welcome`,
          `Save this for later or ${cta.toLowerCase()}`,
        ],
        80,
      ),
    },
  ];

  const mainColour = profile.mainBrandColour || "#7A3B2E";
  const secondColour = profile.secondaryBrandColour || "#E8A87C";
  const flyerBullets = formatBenefitBullets(benefit, business.benefits, offer, dates, extraNotes);

  const generated: GeneratedSections = {
    summary: {
      campaignName: inputs.campaignName,
      goal,
      audience,
      offer: offer || "No offer added",
      dates,
      recommendedCta: cta,
      notes: extraNotes,
    },
    facebookPosts,
    instagramCaptions,
    googlePosts: [
      {
        label: "Main local update",
        text: joinCopy(
          [
            `${name} offers ${serviceLine}`,
            benefitLine,
            offerSentence,
            dates !== "Ongoing" ? `Available ${dates}` : "",
            `We keep the details clear so local customers know what to expect`,
            `Questions are welcome before you decide`,
            `Tell us what you need and we will help with the next step`,
            cta,
          ],
          80,
        ),
      },
      {
        label: "Direct reminder",
        text: joinCopy(
          [
            location ? `Looking for ${service} in ${location}` : `Looking for ${service}`,
            `${name} provides ${business.trust}`,
            offerSentence,
            `We can explain the service, timing, and next step`,
            `Questions are welcome`,
            `Tell us what you need and we will help you decide`,
            cta,
          ],
          80,
        ),
      },
    ],
    flyer: {
      headline: shortHeadline(service, offer, seed),
      subheadline: joinCopy(
        [
          `${name} offers ${serviceLine} for ${audience}`,
          offer ? `Ask about ${offer}` : `Expect ${business.trust}`,
        ],
        35,
      ),
      bullets: flyerBullets,
      cta,
      contact,
    },
    reviewRequests: [
      {
        label: "Short text message",
        text: joinCopy(
          [
            `Thank you for choosing ${name} for ${service}`,
            `If you have a minute, a short review would help other local customers know what to expect`,
            profile.googleBusinessProfileLink || "Thank you for supporting a local business",
          ],
          60,
        ),
      },
      {
        label: "Friendly email",
        text: `Hi there,\n\n${joinCopy(
          [
            `Thank you for choosing ${name} for ${service}`,
            `We hope the experience made things easier`,
            `A short review helps other ${localAudience} feel confident choosing a local business`,
          ],
          50,
        )}${profile.googleBusinessProfileLink ? `\n\n${profile.googleBusinessProfileLink}` : ""}\n\nThank you,\n${name}`,
      },
      {
        label: "Social message",
        text: joinCopy(
          [
            `Thanks again for choosing ${name}`,
            `If you have a moment, sharing a quick review would help more local customers find ${service}`,
            `We appreciate your support`,
          ],
          60,
        ),
      },
    ],
    websiteCopy: {
      headline: location
        ? `${sentenceCaseFallback(service, "Local service")} in ${location}`
        : sentenceCaseFallback(service, "Helpful local service"),
      paragraph: joinCopy(
        [
          `${name} offers ${service} for ${audience}`,
          benefitLine,
          offerSentence,
          `Clear answers and simple next steps are always welcome`,
        ],
        70,
      ),
      button: cta,
    },
    faqContent: [
      {
        question: `What does ${service} include?`,
        answer: `${name} can explain the service details, timing, and next steps before you book.`,
      },
      {
        question: location ? `Do you serve ${location}?` : "What area do you serve?",
        answer: location
          ? `${name} serves customers in ${location}.`
          : `Contact ${name} to confirm the service area.`,
      },
      {
        question: "How do I get started?",
        answer: `${cta}. We will help you understand the next step.`,
      },
    ],
    adCopy: {
      headline: limitWords(
        pick(
          [offer || serviceLine, serviceLine, `${sentenceCaseFallback(service, "Service")} nearby`],
          `${seed}-ad`,
        ),
        8,
      ),
      primary: joinCopy([`${name} offers ${serviceLine}`, benefitLine, offerSentence, cta], 60),
      description: joinCopy([sentenceCaseFallback(business.trust, business.trust), cta], 20),
      ctaButton: pick(["Book Now", "Learn More", "Contact Us", "Get Offer"], `${seed}-button`),
    },
    emailNewsletter: {
      subject: limitWords(
        pick([offer || `${service} from ${name}`, serviceLine, goalCopy.hook], `${seed}-email`),
        10,
      ),
      previewText: joinCopy([benefitLine, offerSentence], 20),
      body: `Hi there,\n\n${joinCopy(
        [
          opener,
          `${name} is highlighting ${serviceLine}`,
          benefitLine,
          offerSentence,
          extraNotes,
          cta,
        ],
        100,
      )}\n\nThank you,\n${name}`,
      cta,
    },
    hashtagSuggestions: hashtagSuggestions(businessType, location, goal, service, tone),
    imagePrompts: [
      `Authentic promotional photo for a ${businessType}${location ? ` in ${location}` : ""}, showing ${business.visual}. Natural light, real local-business setting, clean composition, ${mainColour} with ${secondColour} accents, space for separate campaign copy. No text overlay, no logos, no stock-photo look.`,
      `Clean lifestyle photo showing ${service} for ${audience}. Focus on one clear service moment, natural expressions, uncluttered background, ${mainColour} and ${secondColour} accents. No text overlay, no logos.`,
      `Simple print-friendly background for a ${businessType}${offer ? ` campaign about ${offer}` : ` campaign about ${service}`}. Subtle local details, generous empty space for branding added later, ${mainColour} and ${secondColour}. No text overlay, no logos.`,
    ],
    videoScripts: [
      {
        label: "Service in action",
        text: `Show one clear moment of ${service}. Explain who it helps, then close with: ${cta}.`,
      },
      {
        label: "Quick customer question",
        text: `Answer one common question about ${service} in under 30 seconds. Keep the answer practical and finish with: ${cta}.`,
      },
    ],
    postingPlan: buildCampaignCalendar(inputs, service, offer, cta),
  };

  const outputs = inputs.selectedOutputs || legacyOutputs;
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
  return generated;
}
