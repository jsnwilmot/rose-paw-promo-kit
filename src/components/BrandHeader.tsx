import type { BusinessProfile } from "@/lib/storage";

type Props = {
  profile: Pick<BusinessProfile, "businessName" | "mainBrandColour" | "secondaryBrandColour">;
  logoDataUrl?: string;
  useLogo: boolean;
  subtitle?: string;
};

export function BrandHeader({ profile, logoDataUrl, useLogo, subtitle }: Props) {
  const showLogo = useLogo && !!logoDataUrl;
  return (
    <div
      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5"
      style={{
        background: `linear-gradient(135deg, ${profile.secondaryBrandColour || "#F5EFE6"}33, transparent 60%)`,
      }}
    >
      <div
        className="flex h-16 w-[140px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background/60 px-2"
        aria-label="Brand mark"
      >
        {showLogo ? (
          <img
            src={logoDataUrl}
            alt={`${profile.businessName} logo`}
            className="max-h-[80px] max-w-[160px] h-auto w-auto object-contain"
            style={{ maxHeight: 64 }}
          />
        ) : (
          <span
            className="font-display text-lg font-bold leading-tight text-center"
            style={{ color: profile.mainBrandColour || undefined }}
          >
            {profile.businessName || "Your Business"}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="font-display text-xl font-semibold text-foreground truncate">
          {profile.businessName || "Your Business"}
        </div>
        {subtitle && <div className="text-sm text-muted-foreground truncate">{subtitle}</div>}
      </div>
    </div>
  );
}
