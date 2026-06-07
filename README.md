# Rose & Paw Local Promo Kit Builder

Rose & Paw Local Promo Kit Builder is a local-first MVP for small businesses. A short campaign form generates ready-to-paste Facebook posts, Instagram captions, hashtag suggestions, Google Business Profile updates, flyer copy, email newsletter copy, review requests, website copy, ad copy, image prompts, and a seven-day posting plan.

Generated kits preserve the logo used at creation time, use extra campaign notes as writing context,
and can be marked Draft, Active, or Completed. Saved-kit deletion includes a short Undo action.
Copy generation uses short, channel-specific local-business templates that favour clear services,
natural calls to action, scannable flyer bullets, and intentional seven-day campaign steps.
Business Profile includes local-business presets for quickly starting with realistic sample details
while keeping saved promo kits and uploaded logo data unchanged.

## Privacy and local storage

Business profiles, uploaded logos, settings, and generated kits stay in the browser's LocalStorage on the current device. The production app does not send runtime errors or app data to Lovable.

Clearing browser data, using private browsing, changing browsers, or changing devices can remove or hide saved data. Export a backup regularly.

## Backup and import

Settings includes a versioned JSON export and import workflow. Imports are validated and previewed before overwrite, but importing still replaces the current profile, kits, and settings on that device. Keep a recent export before importing another file.

## Design help requests

The generated-kit page can build and submit a design help request to Rose & Paw Digital Designs
through Web3Forms. Nothing is sent until the user completes the consent checkbox and submits the
form. Web3Forms receives one readable plain-text request summary plus a compact set of searchable
fields. Raw JSON and base64 logo data are excluded. Users can copy the same readable message or
manually download the full structured request package as a JSON fallback.

## Development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
npm run lint
npm run build
```

Use `npm run preview` to serve a production build locally.

## Known MVP limitations

- Data is stored only in one browser's LocalStorage; there are no accounts, cloud sync, or automatic backups.
- Browser LocalStorage quotas vary. Large collections of kits or logos can exhaust available space.
- Logos are limited to PNG, JPG, and WEBP files up to 2 MB and are resized before storage. SVG upload is disabled.
- Generated copy is template-based and should be reviewed for accuracy, offer terms, and local advertising requirements.
- Design-help submission requires an internet connection; copy and JSON download remain available
  as fallbacks.

See [docs/roadmap.md](docs/roadmap.md) for intentionally deferred product improvements and
[docs/release-notes.md](docs/release-notes.md) for recent changes.
