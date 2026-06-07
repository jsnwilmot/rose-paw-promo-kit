import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Store,
  Sparkles,
  FolderHeart,
  Settings as SettingsIcon,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Business Profile", icon: Store },
  { to: "/create", label: "Create Promo Kit", icon: Sparkles },
  { to: "/kits", label: "Saved Kits", icon: FolderHeart },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3">
      <img
        src="/rose-paw-logo.png"
        alt="Rose & Paw Digital Designs"
        className={
          small ? "h-12 w-14 shrink-0 object-contain" : "h-20 w-24 shrink-0 object-contain"
        }
      />
      <div className="min-w-0 leading-tight">
        <div className="font-display text-lg font-semibold text-primary">Rose &amp; Paw</div>
        <div className="text-xs text-muted-foreground">Local marketing made simple.</div>
      </div>
    </Link>
  );
}

export function AppLayout({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:flex lg:flex-col gap-6 border-r border-sidebar-border bg-sidebar px-5 py-6 sticky top-0 h-screen">
        <Brand />
        <NavItems />
        <div className="mt-auto rounded-xl bg-cream/60 p-3 text-xs text-muted-foreground">
          Built for small local businesses. Your data stays on this device.
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 backdrop-blur px-4 py-3">
        <Brand small />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open menu"
              className="rounded-lg p-2 hover:bg-muted"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-sidebar px-5 py-6">
            <SheetTitle className="sr-only">Main navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate between the marketing kit builder pages.
            </SheetDescription>
            <div className="flex flex-col gap-6 pt-6">
              <Brand small />
              <NavItems onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="px-4 py-6 sm:px-8 sm:py-10 max-w-5xl mx-auto w-full">
        {children ?? <Outlet />}
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}
