# Rose & Paw Local Promo Kit Builder

Rose & Paw Local Promo Kit Builder is a local-first MVP for small businesses. A short campaign form generates ready-to-paste Facebook posts, Instagram captions, Google Business Profile updates, flyer copy, review requests, website copy, ad copy, image prompts, and a seven-day posting plan.

## Privacy and local storage

Business profiles, uploaded logos, settings, generated kits, and design-help request drafts stay in the browser's LocalStorage on the current device. The production app does not send runtime errors or app data to Lovable.

Clearing browser data, using private browsing, changing browsers, or changing devices can remove or hide saved data. Export a backup regularly.

## Backup and import

Settings includes a versioned JSON export and import workflow. Imports are validated and previewed before overwrite, but importing still replaces the current profile, kits, and settings on that device. Keep a recent export before importing another file.

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
- Design-help requests stay local and must be copied into an email or messaging app.
