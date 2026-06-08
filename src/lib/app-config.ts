export const APP_DOMAIN = "marketingkit.roseandpaw.ca";
export const APP_VERSION = "1.0.0";
export const WEB3FORMS_ACCESS_KEY = String(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "").trim();
const PLACEHOLDER_KEYS = new Set(["replace_with_your_web3forms_key", "your_web3forms_key"]);
export const HAS_WEB3FORMS_ACCESS_KEY =
  WEB3FORMS_ACCESS_KEY.length > 0 && !PLACEHOLDER_KEYS.has(WEB3FORMS_ACCESS_KEY.toLowerCase());
export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
