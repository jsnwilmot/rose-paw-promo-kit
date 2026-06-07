# Manual Test Checklist

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
