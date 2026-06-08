# Release Notes

## June 2026

- Applied a Stitch-inspired Heritage & Heart UI refresh across app shell, dashboard, campaign
  builder, saved kits, kit preview, profile, and settings while preserving existing kit logic.
- Updated typography to Libre Caslon Text and Hanken Grotesk with `display=swap` and limited
  weights for performance.
- Added the Rose & Paw Local Marketing Kit source logo asset usage in shell, dashboard, kit header,
  printable summary header, and Design Help Request form branding.
- Improved Settings with storage usage visibility, archived-kit cleanup, and a clear danger zone
  reset flow with confirmations.
- Fixed Web3Forms key readiness checks so missing-key warnings appear only when
  `VITE_WEB3FORMS_ACCESS_KEY` is missing or still placeholder text.
- Refined storage handling for larger kit libraries by reducing premature near-quota warnings and
  keeping deduplicated logo snapshot storage behavior.
- Improved Business Profile with optional local SEO/trust fields and clearer logo resizing warnings
  at a 900px maximum dimension.
- Added Campaign Builder output selection with recommended defaults and a mandatory seven-day
  calendar that adapts to the selected content and channels.
- Improved Saved Kits so imported requests are labeled and searchable by requester details and
  requested services.
- Added an internal Requests page for validating, previewing, and importing downloaded client design
  request packages into new saved kits with optional active-profile replacement.
- Improved Saved Kits with combined search, business and campaign filters, sorting, duplication,
  internal notes, and non-destructive archive and restore actions.
- Added seven local business profile presets with a confirmation step that updates only the active
  profile and preserves existing saved kits.
- Improved local promo kit copy with shorter social posts, direct Google Business Profile updates,
  cleaner flyer bullets, natural review requests, and campaign-calendar purposes.
- Design help request emails are now formatted as readable plain-text briefs instead of raw JSON
  data dumps.
- Added a complete Web3Forms design help request flow with editable messages, requested-service
  selection, consent, readable kit context, and copy/JSON fallbacks.
- Generated kits now preserve the logo used at creation time.
- Friendly tone has dedicated local-business wording, and extra notes influence relevant content.
- Added email newsletter copy, separate hashtag suggestions, and draft/active/completed statuses.
- Added deletion undo and accessible rename/delete/import dialogs.
- Improved active navigation semantics and mobile menu keyboard behavior.
- Fixed invalid kit links, SPA profile navigation, and repeated localStorage reads.
- Tightened generated-content cleanup so template labels are removed only when they appear as
  leaked line prefixes, and improved fallback topics in the campaign calendar when local details
  are sparse.
- Updated Generated Kit website copy rendering to preserve intentional line breaks for improved
  readability.
- Removed unused starter code, React Query setup, shadcn components, and dependencies.
