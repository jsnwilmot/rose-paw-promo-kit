import type { AppSettings, BusinessProfile, GeneratedSections, PromoFormInputs } from "./storage";

function pick<T>(items: T[], seed: string): T {
  const total = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return items[total % items.length];
}

function fmtDates(start: string, end: string) {
  if (!start && !end) return "Ongoing";
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

function toneOpener(tone: string, seed: string) {
  const choices: Record<string, string[]> = {
    Friendly: [
      "A quick friendly update from your local team:",
      "Here's something helpful for our local customers:",
      "We wanted to share this with you:",
    ],
    Professional: [
      "We're pleased to share",
      "Now available locally:",
      "A useful update from our team:",
    ],
    Fun: ["Good news, friends:", "Here's something worth smiling about:", "A local treat is here:"],
    Warm: [
      "A little something for our neighbours:",
      "We'd love to help with this:",
      "From our local team to you:",
    ],
    Boutique: [
      "A small note from the studio:",
      "Thoughtfully created for our local clients:",
      "A special local offering:",
    ],
    "Local and personal": [
      "Hi neighbours,",
      "A quick hello from your local team:",
      "For our neighbours nearby:",
    ],
    "Simple and direct": ["Quick update:", "Now booking:", "Here's what is available:"],
  };
  return pick(
    choices[tone] || ["Hello from your local team:", "Good news:", "Here's a local update:"],
    seed,
  );
}

function formatExtraNotes(notes: string) {
  const trimmed = notes.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return trimmed.replace(/[.!?]+$/, "");
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
    hashtag(`${location} Small Business`),
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
  const options: Record<string, { hook: string; urgency: string; cta: string; topic: string }> = {
    "Get more bookings": {
      hook: "Make your next appointment easy",
      urgency: "Popular times can fill quickly",
      cta: "Book your preferred time",
      topic: "Open booking times",
    },
    "Promote a new service": {
      hook: "Meet a new way we can help",
      urgency: "Now available",
      cta: "Ask us about the new service",
      topic: "Introduce the new service",
    },
    "Fill slow days": {
      hook: "A quieter day is a great time to visit",
      urgency: "Selected times are available",
      cta: "Claim a quieter-day spot",
      topic: "Highlight available times",
    },
    "Get more reviews": {
      hook: "Your experience helps neighbours choose local",
      urgency: "A minute makes a real difference",
      cta: "Share your experience",
      topic: "Invite customer feedback",
    },
    "Promote a seasonal offer": {
      hook: "A timely local offer has arrived",
      urgency: "Available for a limited time",
      cta: "Claim the seasonal offer",
      topic: "Feature the seasonal offer",
    },
    "Announce a new business": {
      hook: "A new local business is ready to welcome you",
      urgency: "Now open",
      cta: "Come say hello",
      topic: "Introduce the business",
    },
    "Bring back past customers": {
      hook: "It would be lovely to see you again",
      urgency: "A fresh reason to return",
      cta: "Plan your next visit",
      topic: "Welcome past customers back",
    },
    "Promote a monthly content campaign": {
      hook: "This month's local feature is here",
      urgency: "Follow along this month",
      cta: "Stay connected",
      topic: "Launch the monthly theme",
    },
  };
  return (
    options[goal] || {
      hook: "A helpful local offer",
      urgency: "Available now",
      cta: "Get in touch",
      topic: "Announce the offer",
    }
  );
}

function businessLanguage(type: string) {
  const lower = type.toLowerCase();
  if (/(groom|pet|dog|cat|animal)/.test(lower))
    return { trust: "gentle, attentive care", visual: "happy pets and calm, caring service" };
  if (/(salon|hair|beauty|spa|nail)/.test(lower))
    return {
      trust: "personal attention and polished results",
      visual: "welcoming studio details and confident clients",
    };
  if (/(clean|landscap|repair|contract|home)/.test(lower))
    return {
      trust: "reliable local help and tidy results",
      visual: "real before-and-after details and a well-kept local home",
    };
  if (/(tutor|coach|lesson|class|education)/.test(lower))
    return {
      trust: "patient guidance and practical progress",
      visual: "friendly one-to-one learning and visible progress",
    };
  if (/(restaurant|cafe|bak|food|cater)/.test(lower))
    return {
      trust: "fresh local flavour and thoughtful service",
      visual: "inviting food, warm light, and a neighbourhood setting",
    };
  return {
    trust: "friendly, dependable local service",
    visual: "real people, warm details, and an authentic neighbourhood setting",
  };
}

export function generateKit(
  inputs: PromoFormInputs,
  profile: BusinessProfile,
  settings: AppSettings,
): GeneratedSections {
  const name = profile.businessName || "our local business";
  const location =
    inputs.location || profile.serviceArea || settings.defaultServiceArea || "your area";
  const audience = inputs.targetCustomer || profile.targetCustomer || "local customers";
  const offer = inputs.offer || "a helpful local offer";
  const service =
    inputs.featuredService || profile.mainServices.split(",")[0]?.trim() || "our services";
  const businessType = inputs.businessType || profile.businessType || "local business";
  const business = businessLanguage(businessType);
  const benefit = inputs.mainBenefit || business.trust;
  const goal = inputs.campaignGoal || "Get more bookings";
  const goalCopy = goalLanguage(goal);
  const cta = inputs.callToAction || goalCopy.cta;
  const tone = inputs.tone || profile.brandTone || settings.defaultBrandTone || "Friendly";
  const seed = `${inputs.campaignName}-${goal}-${businessType}`;
  const opener = toneOpener(tone, seed);
  const dates = fmtDates(inputs.startDate, inputs.endDate);
  const contactBits = [profile.contactMethod, profile.websiteLink].filter(Boolean).join(" | ");
  const extraNotes = formatExtraNotes(inputs.extraNotes);
  const noteSentence = extraNotes ? ` A helpful detail: ${extraNotes}.` : "";

  const facebookPosts = [
    {
      label: "Short post",
      text: `${opener} ${offer} for ${service} in ${location}. ${goalCopy.urgency}. ${cta}.`,
    },
    {
      label: "Story-led post",
      text: `${goalCopy.hook}. At ${name}, ${audience} can count on ${benefit}. We're currently offering ${offer} for ${service}${dates !== "Ongoing" ? ` from ${dates}` : ""}.${noteSentence} ${cta}${contactBits ? `: ${contactBits}` : "."}`,
    },
    {
      label: "Local reminder",
      text: `For neighbours in ${location}: ${offer} is still available for ${service}. Expect ${business.trust}. ${cta}.`,
    },
  ];
  const instagramCaptions = [
    {
      label: "Quick caption",
      text: `${goalCopy.hook}. ${service}, ${offer}, and ${business.trust} right here in ${location}. ${cta}.`,
    },
    {
      label: "Behind the scenes",
      text: `A closer look at ${service} at ${name}: ${business.visual}. Made for ${audience} who value ${benefit}.`,
    },
    {
      label: "Offer caption",
      text: `${offer}\nFor ${audience} in ${location}.\n${goalCopy.urgency}. ${cta}.`,
    },
  ];

  const mainColour = profile.mainBrandColour || "#7A3B2E";
  const secondColour = profile.secondaryBrandColour || "#E8A87C";

  return {
    summary: {
      campaignName: inputs.campaignName,
      goal,
      audience,
      offer,
      dates,
      recommendedCta: cta,
      notes: extraNotes,
    },
    facebookPosts,
    instagramCaptions,
    googlePosts: [
      {
        label: "Main local update",
        text: `${name} is offering ${offer} for ${service} in ${location}. ${benefit}.${noteSentence} ${cta}${contactBits ? `: ${contactBits}` : "."}`,
      },
      {
        label: "Follow-up update",
        text: `${goalCopy.urgency}: ${offer} for ${service}. Local, straightforward, and ready when you are. ${cta}.`,
      },
    ],
    flyer: {
      headline: pick([inputs.campaignName, goalCopy.hook, `${offer} at ${name}`], seed),
      subheadline: `${service} for ${audience} in ${location}`,
      bullets: [
        benefit,
        `${offer}${dates !== "Ongoing" ? ` | ${dates}` : ""}`,
        business.trust,
        ...(extraNotes ? [extraNotes] : []),
      ],
      cta,
      contact: contactBits || profile.contactMethod || "Get in touch",
    },
    reviewRequests: [
      {
        label: "Short text message",
        text: `Hi! Thank you for choosing ${name}. If ${service} helped, would you share a quick review? It helps neighbours find a local business they can trust${profile.googleBusinessProfileLink ? `: ${profile.googleBusinessProfileLink}` : "."}`,
      },
      {
        label: "Friendly email",
        text: `Hi there,\n\nThank you for choosing ${name} for ${service}. We hope you enjoyed ${benefit}.\n\nA short review helps other people in ${location} feel confident choosing local${profile.googleBusinessProfileLink ? `:\n${profile.googleBusinessProfileLink}` : "."}\n\nThank you,\n${name}`,
      },
      {
        label: "Social message",
        text: `Thanks again for choosing ${name}. If you have a minute, sharing your experience would help more neighbours in ${location} discover ${business.trust}.`,
      },
    ],
    websiteCopy: {
      headline: `${goalCopy.hook} in ${location}`,
      paragraph: `${name} offers ${service} for ${audience} across ${location}. Choose us for ${benefit}. ${offer}${dates !== "Ongoing" ? ` is available ${dates}` : " is available now"}.`,
      button: cta,
    },
    adCopy: {
      headline: pick(
        [`${offer} | ${service}`, `${service} in ${location}`, goalCopy.hook],
        `${seed}-ad`,
      ),
      primary: `${goalCopy.hook}. ${name} brings ${business.trust} to ${audience} in ${location}. ${offer}. ${cta}.`,
      description: `${goalCopy.urgency}. ${benefit}.`,
      ctaButton: pick(["Book Now", "Learn More", "Contact Us", "Get Offer"], `${seed}-button`),
    },
    emailNewsletter: {
      subject: pick(
        [`${offer} from ${name}`, `${service} in ${location}`, goalCopy.hook],
        `${seed}-email`,
      ),
      previewText: `${goalCopy.urgency}. ${benefit}.`,
      body: `Hi there,\n\n${opener} ${name} is sharing ${offer} for ${service} in ${location}. ${benefit}.${noteSentence}\n\n${cta}${contactBits ? `: ${contactBits}` : "."}\n\nThank you,\n${name}`,
      cta,
    },
    hashtagSuggestions: hashtagSuggestions(businessType, location, goal, service, tone),
    imagePrompts: [
      `A warm promotional photo for a ${businessType} in ${location}, showing ${business.visual}. Focus on ${goal.toLowerCase()}.${extraNotes ? ` Include visual context for: ${extraNotes}.` : ""} Use ${mainColour} with ${secondColour} accents. Leave clear space for a logo, headline, and call to action. No text in the image. Authentic local-business style.`,
      `A polished lifestyle image representing ${service} for ${audience}, with ${business.visual}. Use ${mainColour} and ${secondColour}. Keep the composition uncluttered with room for campaign copy. No text overlay.`,
      `A simple print-ready promotional background for a ${businessType} featuring ${offer}. Use ${mainColour} and ${secondColour}, subtle local details, and generous empty space for branding and a call to action. No text in the image.`,
    ],
    postingPlan: [
      { day: "Day 1", platform: "Facebook", type: "Campaign launch", topic: goalCopy.topic },
      {
        day: "Day 2",
        platform: "Instagram",
        type: "Photo or reel",
        topic: `Show ${service} in action`,
      },
      {
        day: "Day 3",
        platform: "Google Business",
        type: "Local update",
        topic: `Explain ${benefit}`,
      },
      {
        day: "Day 4",
        platform: "Facebook",
        type: "Customer-focused post",
        topic: `Speak to ${audience}`,
      },
      { day: "Day 5", platform: "Instagram", type: "Behind the scenes", topic: business.visual },
      {
        day: "Day 6",
        platform: "Email or SMS",
        type: "Direct reminder",
        topic: extraNotes ? `${goalCopy.urgency}; mention ${extraNotes}` : goalCopy.urgency,
      },
      { day: "Day 7", platform: "Facebook", type: "Final follow-up", topic: `${cta}` },
    ],
  };
}
