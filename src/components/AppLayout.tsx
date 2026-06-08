import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Store,
  Sparkles,
  FolderHeart,
  Inbox,
  Settings as SettingsIcon,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AppLogo } from "@/components/AppLogo";
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
  { to: "/requests", label: "Requests", icon: Inbox },
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
                ? "bg-primary text-primary-foreground shadow-soft"
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

export function AppLayout({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[285px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r border-sidebar-border bg-sidebar px-5 py-6 lg:flex">
        <AppLogo subtitle="Heritage & Heart Toolkit" />
        <NavItems />
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-card/80 p-3 text-xs text-muted-foreground">
          Built for small local businesses. Data stays on this device unless you export or submit a
          design request.
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <AppLogo compact subtitle="Local Kit Builder" />
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
              <AppLogo compact subtitle="Heritage & Heart Toolkit" />
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
