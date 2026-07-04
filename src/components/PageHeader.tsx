import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Settings, Search } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  back?: string;
  showSettings?: boolean;
  showSearch?: boolean;
  right?: ReactNode;
}

export function PageHeader({ title, subtitle, back, showSettings, showSearch, right }: Props) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 border-b border-border bg-background/85 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex items-center gap-2 py-3">
        {back && (
          <Link
            to={back}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted"
          >
            <ChevronLeft size={22} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
        {showSearch && (
          <Link to="/search" aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
            <Search size={20} />
          </Link>
        )}
        {showSettings && (
          <Link to="/settings" aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted">
            <Settings size={20} />
          </Link>
        )}
      </div>
    </header>
  );
}
