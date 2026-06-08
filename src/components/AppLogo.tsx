import { Link } from "@tanstack/react-router";
import logoSrc from "@/assets/logo-rnp-local-marketing-kit.png";

export function AppLogo({
  compact = false,
  linkToHome = true,
  subtitle = "Local Marketing Kit Builder",
}: {
  compact?: boolean;
  linkToHome?: boolean;
  subtitle?: string;
}) {
  const content = (
    <div className="flex min-w-0 items-center gap-3">
      <div className={compact ? "rounded-xl bg-card p-2" : "rounded-2xl bg-card p-2.5"}>
        <img
          src={logoSrc}
          alt="Rose and Paw Local Marketing Kit"
          className={compact ? "h-12 w-12 object-contain" : "h-16 w-16 object-contain"}
        />
      </div>
      <div className="min-w-0 leading-tight">
        <div className="font-display text-lg font-semibold text-foreground">Rose &amp; Paw</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );

  if (!linkToHome) return content;
  return <Link to="/">{content}</Link>;
}
