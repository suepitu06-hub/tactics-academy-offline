import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, LayoutGrid, HelpCircle, Book, Trophy } from "lucide-react";

const TABS = [
  { to: "/", label: "Learn", icon: BookOpen },
  { to: "/formations", label: "Formations", icon: LayoutGrid },
  { to: "/quiz", label: "Quiz", icon: HelpCircle },
  { to: "/dictionary", label: "Dictionary", icon: Book },
  { to: "/progress", label: "Progress", icon: Trophy },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-[640px] grid-cols-5">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <li key={to}>
              <Link
                to={to}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium min-h-[56px] transition-colors"
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.8}
                  className={active ? "text-primary" : "text-muted-foreground"}
                />
                <span className={active ? "text-primary" : "text-muted-foreground"}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
