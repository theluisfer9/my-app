import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, HelpCircle, LogIn, Plus } from "lucide-react";

import { WaveAnimation } from "@/components/wavelength/wave-animation";

export const Route = createFileRoute("/_authed/games/wavelength/")({
  component: WavelengthHome,
});

function WavelengthHome() {
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
        <h1 className="flex-1 text-center text-xl font-semibold pr-10">
          Wavelength
        </h1>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-6">
        {/* Wave Animation Card */}
        <div className="mt-2 w-full overflow-hidden rounded-3xl bg-[#1a2634]">
          <div className="flex h-48 items-center justify-center">
            <WaveAnimation className="h-full w-full" />
          </div>
        </div>

        {/* Title */}
        <div className="mt-6 text-center">
          <h2 className="text-[28px] font-bold leading-tight">
            Sintoniza tu mente
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            ¿Puedes leer la mente de tus amigos?
          </p>
          <p className="text-base text-muted-foreground">
            Adivina dónde cae la pista en el espectro.
          </p>
        </div>

        {/* Spacer */}
        <div className="min-h-8 flex-1" />

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 pb-4">
          <Link
            to="/games/wavelength/create"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            <Plus className="size-5" />
            Crear una Sala
          </Link>

          <Link
            to="/games/wavelength/join"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500/20 font-semibold text-cyan-400 transition-transform active:scale-[0.98]"
          >
            <LogIn className="size-5" />
            Unirse a una Sala
          </Link>
        </div>

        {/* How to play */}
        <div className="flex justify-center pb-8">
          <Link
            to="/games/wavelength/how-to-play"
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
