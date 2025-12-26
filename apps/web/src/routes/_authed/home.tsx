import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Clock, Radio, Search, Settings, Wrench } from "lucide-react";

import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authed/home")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Top App Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 p-4 pb-2 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wrench className="size-6" />
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            Mi app
          </h2>
        </div>
        <button
          type="button"
          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-transparent transition-colors hover:bg-muted"
        >
          <Settings className="size-6" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="sticky top-[68px] z-10 bg-background px-4 py-3">
        <div className="flex h-12 w-full items-stretch overflow-hidden rounded-xl shadow-sm">
          <div className="flex items-center justify-center rounded-l-xl border-r-0 bg-surface pl-4 text-muted-foreground">
            <Search className="size-5" />
          </div>
          <Input
            className="h-full flex-1 rounded-l-none rounded-r-xl border-none bg-surface pl-2 text-base focus-visible:ring-0"
            placeholder="Buscar herramienta o juego..."
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Wavelength Card */}
        <div className="px-4 pt-4">
          <Link
            to="/games/wavelength"
            className="flex items-center gap-4 rounded-2xl bg-linear-to-r from-primary/20 to-cyan-500/20 p-4 transition-transform active:scale-[0.98]"
          >
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/20">
              <Radio className="size-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">Wavelength</h3>
              <p className="text-sm text-muted-foreground">
                ¿Puedes leer la mente de tus amigos?
              </p>
            </div>
            <ChevronRight className="size-6 text-muted-foreground" />
          </Link>
        </div>

        {/* Section: Recientes */}
        <div className="flex flex-col pt-6">
          <div className="flex items-center gap-2 px-4 pb-3">
            <Clock className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-bold leading-tight tracking-tight">
              Recientes
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <p className="text-muted-foreground">
              Aún no has usado ninguna herramienta o juego
            </p>
            <p className="text-sm text-muted-foreground/60">
              Tu actividad reciente aparecerá aquí
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
