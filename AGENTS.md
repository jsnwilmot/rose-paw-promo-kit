# Rose & Paw Local Marketing Kit Builder, Project Instructions

## Product Purpose

Build the Rose & Paw Local Marketing Kit Builder as a practical internal marketing tool for Rose & Paw Digital Designs.

The app helps small local businesses create ready-to-use marketing content without needing to understand AI, prompts, SEO, social media strategy, or graphic design.

This should feel like a guided campaign builder, not a generic AI chat app.

The core promise:

Rose & Paw helps small local businesses create professional monthly marketing content without hiring a full agency.

## Primary Users

Design the app for small local service businesses, especially:

- Home-based hair salons
- Dog groomers
- Pet service businesses
- Cleaners
- Contractors
- Tutors
- Small local service businesses

The first strong use cases are salons and pet businesses.

Use Heidi’s Hair Salon and Bear Essentials Dog Care as real-world validation examples.

## Business Goal

The app should help Rose & Paw Digital Designs produce and sell service-backed marketing packages.

Recommended offer ladder:

- Free Marketing Scorecard
- $49 Starter Kit
- $99 Branded Kit
- $149/month Monthly Pack
- $299/month Growth Pack
- $699+ website and marketing setup

Every feature should help one or more of these goals:

- Produce better client marketing content faster
- Reduce manual work
- Make outputs useful for real local businesses
- Help sell Rose & Paw services
- Keep the tool simple enough for non-technical users
- Preserve the option to turn it into SaaS later

Do not overbuild early.

## MVP Scope

The first version should be an internal production tool.

Build these core features first:

- Business Profile
- Campaign Builder
- Generated Marketing Kit
- Saved Campaigns
- Copy buttons
- PDF export
- Basic brand colour settings
- Prompt templates
- Campaign history
- Request Rose & Paw design service button
- JSON export/import backup

Do not add these yet:

- Login
- Stripe
- Social scheduling
- Admin dashboards
- Analytics
- Complex cloud sync
- Multi-user SaaS features

Those can come after the tool proves real demand.

## Main Campaign Types

Start with these campaign types:

- Monthly Content Kit
- New Customer Promo
- Review Request Campaign
- Google Business Profile Pack
- Flyer Copy Pack

Future campaign types can be added after the MVP works well.

## Output Types

The app should generate practical marketing assets, including:

- Facebook posts
- Instagram captions
- Google Business Profile posts
- Promo flyer copy
- Review request messages
- Website section copy
- FAQ content
- Seasonal campaigns
- Service descriptions
- Simple ad copy
- AI image prompts
- Short video script ideas
- Simple campaign calendars
- Printable PDF summaries

Outputs should be easy to copy, export, and hand to a client.

## Tone and Copy Rules

Generated copy must sound human, local, and useful.

Avoid:

- Generic AI wording
- Over-polished agency language
- Fake hype
- Pushy sales language
- Hashtag stuffing
- Overused phrases like “elevate your business”
- Empty filler copy

Prefer:

- Clear local-business language
- Friendly wording
- Specific service details
- Simple calls to action
- Benefit-focused copy
- Plain English

Good example tone:

“Need your dog groomed without the extra trip across town? Bear Essentials brings calm, caring mobile grooming right to your door in Lethbridge.”

Bad example tone:

“Transform your pet’s grooming experience with our unparalleled, premium, luxury mobile grooming solutions.”

## Design Direction

The app should look professional, clean, warm, and local-business friendly.

Use the approved Rose & Paw Local Marketing Kit branding:

- Puppy logo direction
- Cream and warm brown palette
- Friendly local business feel
- Clean rounded cards
- Soft spacing
- Simple navigation
- Clear action buttons

The UI should feel like a polished business tool, not a dashboard template.

Avoid:

- Dark SaaS-heavy styling
- Crypto/trading visuals
- Overly corporate layouts
- Busy charts
- Cluttered forms
- Unclear button labels

Prefer:

- Mobile-first layout
- Clear sections
- Simple steps
- Helpful empty states
- Plain labels
- Strong copy/export actions
- Obvious saved campaign flow

## Suggested App Structure

Use a simple structure like this:

```txt
src/
  components/
    AppShell.jsx
    Header.jsx
    Sidebar.jsx
    Button.jsx
    Card.jsx
    FormField.jsx
    CopyButton.jsx
    EmptyState.jsx
    ExportActions.jsx

  pages/
    Dashboard.jsx
    BusinessProfile.jsx
    CampaignBuilder.jsx
    GeneratedKit.jsx
    SavedCampaigns.jsx
    BrandSettings.jsx
    PromptTemplates.jsx
    Settings.jsx
    Help.jsx

  data/
    defaultBusinessProfile.js
    campaignTypes.js
    promptTemplates.js
    sampleCampaigns.js
    releaseNotes.js

  logic/
    campaignGenerator.js
    promptBuilder.js
    exportLogic.js
    importLogic.js
    validation.js
    localStorageStore.js

  styles/
    tokens.css
    app.css