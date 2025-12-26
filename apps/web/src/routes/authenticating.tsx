import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2, Wrench } from "lucide-react";

import { authClient } from "@/lib/auth-client";

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

export const Route = createFileRoute("/authenticating")({
  beforeLoad: async () => {
    // Poll for session with retries
    for (let i = 0; i < 20; i++) {
      const session = await authClient.getSession();
      if (session.data) {
        throw redirect({ to: "/home", viewTransition: false });
      }
      // Wait 500ms between checks
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    // After 10 seconds (20 * 500ms), redirect to signin
    throw redirect({ to: "/signin", viewTransition: false });
  },
  pendingComponent: LoadingScreen,
  component: AuthenticatingComponent,
});

function AuthenticatingComponent() {
  // This shouldn't render since beforeLoad always redirects
  return <LoadingScreen />;
}
