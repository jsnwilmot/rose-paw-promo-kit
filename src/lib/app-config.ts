export const APP_DOMAIN = "marketingkit.roseandpaw.ca";
export const APP_VERSION = "1.0.0";
export const WEB3FORMS_ACCESS_KEY = String(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "").trim();
export const HAS_WEB3FORMS_ACCESS_KEY = WEB3FORMS_ACCESS_KEY.length > 0;
export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
