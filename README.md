# Rose & Paw Local Promo Kit Builder

Rose & Paw Local Promo Kit Builder is a local-first MVP for small businesses. A short campaign form generates ready-to-paste Facebook posts, Instagram captions, hashtag suggestions, Google Business Profile updates, flyer copy, email newsletter copy, review requests, website copy, ad copy, image prompts, and a seven-day posting plan.

Generated kits preserve the logo used at creation time, use extra campaign notes as writing context,
and can be marked Draft, Active, or Completed. Saved-kit deletion includes a short Undo action.
Copy generation uses short, channel-specific local-business templates that favour clear services,
natural calls to action, scannable flyer bullets, and intentional seven-day campaign steps.
Business Profile includes local-business presets for quickly starting with realistic sample details
while keeping saved promo kits and uploaded logo data unchanged.
Saved Kits includes combined search, business and campaign filters, sorting, duplication, rename,
internal working notes, and a non-destructive archive and restore flow. Imported design requests
are clearly labeled and can be found by requester name, requester email, or requested services.
Requests can import a downloaded client design-request package JSON, preview its business and
campaign details, create a new local saved kit, and optionally update the active business profile.
Campaign Builder output selection lets each kit focus on the content a client actually uses.
Facebook, Instagram, Google Business Profile, flyer, review, website, FAQ, ad, image-prompt, video,
and printable-summary outputs are optional, while every kit always includes a seven-day campaign
calendar built around the selected channels.

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
The internal Requests page can import that structured package later. Imported packages always
create a new local kit ID, ignore raw logo data, and never replace the active profile without
explicit confirmation.

### Static submission security note

Design Help Request submission is currently static-only and sends directly to Web3Forms from the
browser. Configure the key with `VITE_WEB3FORMS_ACCESS_KEY` in a local `.env` file (see
`.env.example`).

Because this is static hosting, the Web3Forms key is included in the client bundle and is not
secret. Current static-only mitigations are:

- Hidden honeypot field (`botcheck`) blocks obvious bot submissions.
- Client-side cooldown limits repeated submissions from one browser to one request per 60 seconds.
- Required-field validation and trimmed values run before submission.
- Base64 logo data is not submitted.

If `VITE_WEB3FORMS_ACCESS_KEY` is missing, sending is disabled gracefully and users can still copy
the readable message and download the JSON request package.

Future hardening (post-MVP) should move request submission through a server-side proxy, keep the
Web3Forms key server-only, add IP-based rate limiting, and enforce origin checks.

## Development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
npm run lint
npm run build
```

Create `.env` from `.env.example` and set `VITE_WEB3FORMS_ACCESS_KEY` for live request sending.

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
