import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BottomNav } from "@/components/BottomNav";
import { useTheme } from "@/hooks/useTheme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-3" aria-hidden>⚽️</div>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page wandered offside.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex items-center px-5 py-2.5">Back to Learn</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try refreshing the page.</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="btn-primary mt-6 px-5 py-2.5"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#16a34a" },
      { title: "Learn — Basic Football Tactics Edu" },
      { name: "description", content: "Browse football tactics learning categories: basics, passing, attacking, defending, set pieces and more." },
      { property: "og:title", content: "Learn — Basic Football Tactics Edu" },
      { property: "og:description", content: "Browse football tactics learning categories: basics, passing, attacking, defending, set pieces and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Learn — Basic Football Tactics Edu" },
      { name: "twitter:description", content: "Browse football tactics learning categories: basics, passing, attacking, defending, set pieces and more." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6fa2d22f-bcbd-494d-85dc-e1f80e1c5feb/id-preview-1224ac6e--bd90c43a-df74-461e-9a60-684a2df7741f.lovable.app-1783135901219.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6fa2d22f-bcbd-494d-85dc-e1f80e1c5feb/id-preview-1224ac6e--bd90c43a-df74-461e-9a60-684a2df7741f.lovable.app-1783135901219.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  // initialize theme + font size on the client
  useTheme();
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <main className="page-container fade-in">{children}</main>
      <BottomNav />
    </div>
  );
}
