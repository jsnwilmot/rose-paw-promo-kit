# Manual Test Checklist

## Import Design Request

- Download a design request package JSON from an existing generated kit.
- Open Requests and upload the JSON; repeat by pasting the same JSON.
- Confirm the preview shows requester, business, service area, colours, kit, requested services,
  generated-section status, and logo-metadata status.
- Import with the default options and confirm a new active saved kit opens with generated content.
- Confirm existing saved kits and the current active profile are unchanged by the default import.
- Import again with profile replacement selected and confirm the warning appears before applying.
- Confirm profile replacement preserves the current uploaded local logo data.
- Confirm invalid JSON, unsupported package type, and missing or unsupported version show clear
  errors.
- Confirm raw base64 logo data in an input package is not stored.
- Export and import a backup containing an imported request kit and confirm its source metadata and
  internal notes remain.
- Confirm Design Help Request and business profile presets still work after importing.

## Saved kit management

- Open Saved Kits with existing campaigns and confirm archived kits are hidden by default.
- Search by campaign name, business name, business type, campaign goal, service area, and internal
  notes.
- Combine search with the business and campaign goal or type filters.
- Test newest, oldest, business A-Z, and campaign A-Z sorting.
- Duplicate a kit and confirm it has a new ID, current timestamps, and a name ending in `copy`.
- Open the duplicate and confirm its generated content, form inputs, and logo snapshot still load.
- Rename one kit and confirm other saved kits and generated content are unchanged.
- Save internal notes, reload Saved Kits, and confirm the notes remain searchable.
- Confirm archive asks for confirmation and hides the kit from the default view.
- Show archived kits, restore one, and confirm it returns to the default view.
- Export and import a backup containing duplicated, archived, and internally noted kits.
- Open a saved kit and confirm Design Help Request still uses the active profile and selected kit.

## Business profile presets

- Open Business Profile and confirm all seven presets show a business name, type, and description.
- Select a preset and confirm the replacement warning appears.
- Cancel the warning and confirm the current profile fields are unchanged.
- Apply the Heidi’s Hair Salon preset and confirm its profile fields and brand colours are loaded.
- Apply the Bear Essential Dog Care preset and confirm its profile fields and brand colours are
  loaded.
- Confirm applying a preset preserves the uploaded logo and does not change saved kits or settings.
- Generate a kit from each real-business preset.
- Export a backup, import it, and confirm the current active profile is restored.
- Open Design Help Request and confirm the active preset profile appears in the readable request.

## Generated content quality

- Generate a kit for a mobile dog groomer with a specific service, service area, and offer.
- Generate a kit for a hair salon with a specific service and no offer.
- Generate a kit with optional service area, offer, target customer, CTA, and notes left empty.
- Confirm Facebook posts are readable, local, and roughly 40 to 90 words.
- Confirm Instagram captions are practical and roughly 35 to 80 words.
- Confirm Google Business Profile posts are short, direct, and roughly 40 to 80 words.
- Confirm flyer copy has a short headline, one clear subheadline, and three to five useful bullets.
- Confirm review requests sound natural and do not use fake hype.
- Confirm image prompts specify no text overlay and describe one clear visual.
- Confirm the seven-day plan has a clear topic and purpose for every day.
- Confirm public-facing copy does not show `Not provided` or invent an offer or location.
- Confirm the printable summary is clean and does not show an empty-offer placeholder.

## Regression checks

- Open an existing saved kit and confirm all sections still load.
- Open the Design Help Request dialog and confirm its readable request message is generated.
- Submit a Design Help Request through an intercepted or test Web3Forms request.
- Confirm backup export and import still validate existing saved-kit data.
