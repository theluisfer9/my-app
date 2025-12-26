import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: WelcomeComponent,
});

function WelcomeComponent() {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-y-auto overflow-x-hidden">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute left-[-20%] top-[-10%] h-[40%] w-[60%] rounded-full bg-primary/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[50%] rounded-full bg-primary/10 blur-[80px]" />

      {/* Main Content Area */}
      <div className="z-10 flex w-full flex-1 flex-col items-center justify-center px-6 pb-6 pt-12">
        {/* Hero Visual Area */}
        <div className="relative mb-8 flex aspect-square w-full max-w-80 items-center justify-center">
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-linear-to-br from-card to-background shadow-2xl shadow-primary/20">
            {/* Abstract background */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-overlay"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60")`,
              }}
            />
            {/* Icon Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-4">
              <div className="rounded-full border border-primary/30 bg-primary/20 p-4 backdrop-blur-sm">
                <Wrench className="h-14 w-14 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="w-full max-w-120 space-y-3 text-center">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
            Mi app
          </h1>
          <p className="text-base font-normal leading-relaxed text-muted-foreground">
            Tu kit digital definitivo. Herramientas esenciales y minijuegos
            divertidos, todo en un solo lugar.
          </p>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="z-10 w-full bg-linear-to-t from-background via-background/95 to-transparent px-6 pb-10 pt-4">
        <div className="mx-auto w-full max-w-120 space-y-4">
          {/* Primary Action */}
          <Link
            to="/signin"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-14 w-full rounded-xl text-[17px] font-bold shadow-lg shadow-primary/25",
            )}
          >
            Iniciar Sesión
          </Link>

          {/* Secondary Action */}
          <Link
            to="/signup"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-14 w-full rounded-xl text-[17px] font-semibold",
            )}
          >
            Registrarse
          </Link>

          {/* Social Login Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>

          {/* Social Buttons Row */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="h-12 flex-1 rounded-xl"
              aria-label="Continuar con Apple"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 flex-1 rounded-xl"
              aria-label="Continuar con Google"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </Button>
          </div>

          <p className="pt-2 text-center text-xs text-muted-foreground">
            Al continuar, aceptas nuestros{" "}
            <a href="#" className="underline hover:text-primary">
              Términos de Servicio
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
