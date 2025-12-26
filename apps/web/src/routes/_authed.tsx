import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { Grid3X3, Loader2, User, Wrench } from "lucide-react";
import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function LoadingScreen() {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center gap-6 p-6">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/20">
        <Wrench className="size-10 text-primary" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Conectando...</h1>
        <p className="mt-2 text-muted-foreground">
          Estamos preparando tu cuenta
        </p>
      </div>
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}

const navItems = [
  { name: "Inicio", icon: Grid3X3, href: "/home" },
  { name: "Perfil", icon: User, href: "/profile" },
];

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isPending && !session) {
      navigate({ to: "/signin", replace: true });
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <LoadingScreen />;
  }

  // Ocultar navbar en rutas de juegos y herramientas
  const hideNavbarPrefixes = ["/games", "/tools"];
  const hideNavbar = hideNavbarPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className={cn("flex-1 overflow-hidden", !hideNavbar && "pb-20")}>
        <Outlet />
      </div>

      {/* Bottom Navigation Bar */}
      {!hideNavbar && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-6 pb-6 pt-2">
          <div className="mx-auto flex max-w-md items-center justify-center gap-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex w-16 flex-col items-center gap-1 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon
                    className={cn("size-6", isActive && "fill-primary")}
                  />
                  <span className="text-[10px] font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
