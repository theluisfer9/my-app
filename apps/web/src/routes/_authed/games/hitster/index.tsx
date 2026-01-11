import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, HelpCircle, LogIn, Music2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authed/games/hitster/")({
  component: HitsterHome,
});

function HitsterHome() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center p-4">
        <Link
          to="/home"
          className="flex size-10 shrink-0 items-center justify-center"
        >
          <ChevronLeft className="size-7" />
        </Link>
        <h1 className="flex-1 pr-10 text-center text-xl font-semibold">
          Hitster
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-6">
        {/* Hero Card */}
        <div className="mt-2 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
          <div className="flex h-48 flex-col items-center justify-center gap-2">
            <Music2 className="size-16 text-white" />
            <span className="text-2xl font-bold text-white">Timeline Musical</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-6 text-center">
          <h2 className="text-[28px] font-bold leading-tight">
            Ordena las canciones
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Escucha, adivina el año y construye tu timeline.
          </p>
          <p className="text-base text-muted-foreground">
            +1 por posición correcta, +1 artista, +1 canción.
          </p>
        </div>

        {/* Spacer */}
        <div className="min-h-8 flex-1" />

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 pb-4">
          <Link
            to="/games/hitster/create"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <Plus className="size-5" />
            Crear una Sala
          </Link>

          <Link
            to="/games/hitster/join"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-purple-500/20 font-semibold text-purple-400 transition-transform active:scale-[0.98]"
          >
            <LogIn className="size-5" />
            Unirse a una Sala
          </Link>
        </div>

        {/* How to play */}
        <div className="flex justify-center pb-8">
          <Link
            to="/games/hitster/how-to-play"
            className="flex items-center gap-2 text-sm text-primary"
          >
            <HelpCircle className="size-4" />
            ¿Cómo jugar?
          </Link>
        </div>
      </div>
    </div>
  );
}
