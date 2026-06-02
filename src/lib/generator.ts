import type { BusinessProfile, GeneratedSections, PromoFormInputs } from "./storage";

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function fmtDates(start: string, end: string) {
  if (!start && !end) return "Ongoing";
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

function joinAnd(s: string) {
  return s
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .join(", ");
}

function toneOpener(tone: string) {
  switch (tone) {
    case "Professional": return "We're pleased to share";
    case "Fun": return "Heads up, friends —";
    case "Warm": return "A little something for our neighbours:";
    case "Boutique": return "A small note from the studio —";
    case "Local and personal": return "Hi neighbours,";
    case "Simple and direct": return "Quick update:";
    default: return "Hey there!";
  }
}

export function generateKit(
  inputs: PromoFormInputs,
  profile: BusinessProfile
): GeneratedSections {
  const name = profile.businessName || "our small business";
  const location = inputs.location || profile.serviceArea || "your area";
  const audience = inputs.targetCustomer || profile.targetCustomer || "local customers";
  const offer = inputs.offer || "our latest offer";
  const service = inputs.featuredService || profile.mainServices.split(",")[0]?.trim() || "our services";
  const benefit = inputs.mainBenefit || "real, friendly service you can count on";
  const cta = inputs.callToAction || "Send us a message to book";
  const tone = inputs.tone || profile.brandTone || "Friendly";
  const opener = toneOpener(tone);
  const dates = fmtDates(inputs.startDate, inputs.endDate);
  const goal = inputs.campaignGoal || "Get more bookings";

  const contactBits = [
    profile.contactMethod,
    profile.websiteLink,
  ].filter(Boolean).join(" · ");

  const fbShort = `${opener} ${offer} on ${service} for ${location}. ${cta}.`;
  const fbDetailed = `${opener} we're running ${offer} on ${service} for ${audience} in ${location}.\n\nWhy it's worth a look: ${benefit}.\n\n${dates !== "Ongoing" ? `Available ${dates}.\n\n` : ""}${cta} — ${contactBits || "message us anytime"}.`;
  const fbReminder = `Friendly reminder — ${offer} is still on for ${service}${dates !== "Ongoing" ? ` until ${inputs.endDate || dates}` : ""}. ${cta} 🐾`;

  const igShort = `${service} in ${location}. ${offer}. ${cta}.`;
  const igService = `Behind the scenes of ${service} — taking care of ${audience} across ${location}. ${benefit}. ${cta}.`;
  const igPromo = `${offer} 🌿\nFor ${audience} in ${location}.\n${benefit}.\n${cta}.`;

  const gbpMain = `${offer} on ${service} for ${location}. ${benefit}. ${cta}${contactBits ? ` — ${contactBits}` : ""}.`;
  const gbpReminder = `Last chance — ${offer} ${dates !== "Ongoing" ? `ends ${inputs.endDate || "soon"}` : "is still running"}. ${cta}.`;

  const flyerHeadline = inputs.campaignName || `${offer} at ${name}`;
  const flyerSub = `${service} for ${audience} in ${location}`;
  const flyerBullets = [
    benefit,
    `${offer}${dates !== "Ongoing" ? ` — ${dates}` : ""}`,
    `Trusted local service in ${location}`,
  ];

  const reviewShort = `Hi! Thanks so much for choosing ${name}. If you have a minute, a quick Google review would mean the world${profile.googleBusinessProfileLink ? `: ${profile.googleBusinessProfileLink}` : ""}. 🙏`;
  const reviewEmail = `Hi there,\n\nThanks so much for choosing ${name} — it was a pleasure helping you with ${service}.\n\nIf you have a moment, a short Google review really helps small local businesses like ours${profile.googleBusinessProfileLink ? `:\n${profile.googleBusinessProfileLink}` : ""}.\n\nThank you!\n${name}`;
  const reviewFb = `Hey! 👋 Just wanted to say thanks again. If you enjoyed ${service}, a quick review on Google or Facebook would really help us reach more neighbours in ${location}. ❤️`;

  const webHeadline = `${offer} — ${service} in ${location}`;
  const webPara = `${name} is offering ${offer} on ${service} for ${audience} across ${location}. ${benefit}. ${dates !== "Ongoing" ? `Available ${dates}. ` : ""}${cta}.`;
  const webButton = pick(["Book now", "Claim this offer", "Get in touch", "Reserve your spot"], goal.length);

  const adHeadline = `${offer} · ${service}`;
  const adPrimary = `${opener} ${name} is running ${offer} for ${audience} in ${location}. ${benefit}. ${cta} today.`;
  const adDesc = `${service} in ${location}${dates !== "Ongoing" ? ` — ${dates}` : ""}.`;
  const adCtaBtn = pick(["Book Now", "Learn More", "Contact Us", "Get Offer"], goal.length);

  const mainColour = profile.mainBrandColour || "#7A3B2E";
  const secondColour = profile.secondaryBrandColour || "#E8A87C";
  const businessType = inputs.businessType || profile.businessType || "local business";

  const imagePrompts = [
    `A clean, warm promotional graphic for a ${businessType} in ${location}, focused on "${offer}" and ${goal.toLowerCase()}. Use ${mainColour} as the main colour and ${secondColour} as the accent. Leave clear space at the top for an uploaded logo and space in the lower third for a headline and call to action. No text in the image. Friendly, local, photographic style.`,
    `A soft lifestyle illustration showing the feeling of ${service} for ${audience}. Main colour ${mainColour}, accent ${secondColour}. Reserve a clean area for a logo and a separate area for headline and CTA copy. No text overlay. Inviting, modern, small-business friendly.`,
    `A simple flat-style promo background for a ${businessType} running "${offer}". Uses ${mainColour} and ${secondColour}. Leave generous empty space for a logo top-left and for headline + CTA bottom-centre. No text in the image. Warm, approachable, print-ready.`,
  ];

  const platforms = ["Facebook", "Instagram", "Google Business", "Facebook", "Instagram", "Email/SMS", "Facebook"];
  const types = ["Short post", "Caption + photo", "Local update", "Reminder post", "Story / reel", "Review request", "Last-chance post"];
  const topics = [
    `Announce ${offer}`,
    `Show ${service} in action`,
    `Local update about ${location}`,
    `Reminder about ${offer}`,
    `Quick behind-the-scenes of ${service}`,
    `Ask happy clients for a review`,
    `Last chance for ${offer}`,
  ];
  const postingPlan = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    platform: platforms[i],
    type: types[i],
    topic: topics[i],
  }));

  return {
    summary: {
      campaignName: inputs.campaignName || `${offer} campaign`,
      goal,
      audience,
      offer,
      dates,
      recommendedCta: cta,
    },
    facebookPosts: [
      { label: "Short post", text: fbShort },
      { label: "Detailed post", text: fbDetailed },
      { label: "Friendly reminder", text: fbReminder },
    ],
    instagramCaptions: [
      { label: "Short caption", text: igShort },
      { label: "Service-focused", text: igService },
      { label: "Promo-focused", text: igPromo },
    ],
    googlePosts: [
      { label: "Main promo post", text: gbpMain },
      { label: "Reminder post", text: gbpReminder },
    ],
    flyer: {
      headline: flyerHeadline,
      subheadline: flyerSub,
      bullets: flyerBullets,
      cta,
      contact: contactBits || profile.contactMethod || "Get in touch",
    },
    reviewRequests: [
      { label: "Short text message", text: reviewShort },
      { label: "Friendly email", text: reviewEmail },
      { label: "Facebook message", text: reviewFb },
    ],
    websiteCopy: { headline: webHeadline, paragraph: webPara, button: webButton },
    adCopy: { headline: adHeadline, primary: adPrimary, description: adDesc, ctaButton: adCtaBtn },
    imagePrompts,
    postingPlan,
  };
}
