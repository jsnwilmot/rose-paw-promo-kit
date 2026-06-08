import type { BusinessProfile } from "@/lib/storage";
import { AppLogo } from "@/components/AppLogo";

type Props = {
  profile: Pick<BusinessProfile, "businessName" | "mainBrandColour" | "secondaryBrandColour">;
  logoDataUrl?: string;
  useLogo: boolean;
  subtitle?: string;
  showAppBrand?: boolean;
};

export function BrandHeader({ profile, logoDataUrl, useLogo, subtitle, showAppBrand }: Props) {
  const showLogo = useLogo && !!logoDataUrl;
  return (
    <div
      className="rounded-3xl border border-border bg-card p-4 shadow-card sm:p-5"
      style={{
        background: `linear-gradient(135deg, ${profile.secondaryBrandColour || "#F5EFE6"}33, transparent 58%)`,
      }}
    >
      {showAppBrand && (
        <div className="mb-3 border-b border-border pb-3">
          <AppLogo compact linkToHome={false} subtitle="Generated with Heritage & Heart style" />
        </div>
      )}
      <div className="flex items-center gap-4">
        <div
          className="flex h-16 w-[140px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background/60 px-2"
          aria-label="Brand mark"
        >
          {showLogo ? (
            <img
              src={logoDataUrl}
              alt={`${profile.businessName} logo`}
              className="h-auto max-h-20 w-auto max-w-[160px] object-contain"
            />
          ) : (
            <span
              className="text-center font-display text-lg font-bold leading-tight"
              style={{ color: profile.mainBrandColour || undefined }}
            >
              {profile.businessName || "Your Business"}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-xl font-semibold text-foreground">
            {profile.businessName || "Your Business"}
          </div>
          {subtitle && <div className="truncate text-sm text-muted-foreground">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
