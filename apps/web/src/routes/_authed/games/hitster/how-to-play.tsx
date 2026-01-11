import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Disc3,
  Headphones,
  ListOrdered,
  Music,
  Trophy,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_authed/games/hitster/how-to-play")({
  component: HowToPlay,
});

function HowToPlay() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <Link
          to="/games/hitster"
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="flex-1 pr-10 text-center text-xl font-semibold">
          ¿Cómo jugar?
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-lg flex-col gap-8">
          {/* Intro */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-purple-500/20">
              <Music className="size-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">Hitster</h2>
            <p className="mt-2 text-muted-foreground">
              Construye tu timeline musical ordenando canciones cronológicamente
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 font-bold">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Headphones className="size-5 text-purple-400" />
                  <h3 className="font-semibold">Escucha</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  En tu turno, escucha un fragmento de 30 segundos de una
                  canción. Todos los jugadores pueden escuchar al mismo tiempo.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 font-bold">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ListOrdered className="size-5 text-purple-400" />
                  <h3 className="font-semibold">Coloca</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Decide dónde colocar la canción en tu timeline según el año
                  en que fue lanzada. ¿Es más antigua o más reciente que las
                  demás?
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-400 font-bold">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Trophy className="size-5 text-purple-400" />
                  <h3 className="font-semibold">Gana puntos</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Si la posición es correcta, la carta se agrega a tu timeline
                  y obtienes puntos. Si es incorrecta, la carta se descarta.
                </p>
              </div>
            </div>
          </div>

          {/* Scoring */}
          <div className="rounded-2xl border border-border p-6">
            <h3 className="mb-4 text-center font-semibold">Sistema de puntos</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-green-500" />
                  <span>Posición correcta</span>
                </div>
                <span className="font-bold text-green-500">+1</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-green-500" />
                  <span>Adivinar artista</span>
                </div>
                <span className="font-bold text-green-500">+1</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-green-500" />
                  <span>Adivinar canción</span>
                </div>
                <span className="font-bold text-green-500">+1</span>
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-red-500/10 p-3">
                <div className="flex items-center gap-2">
                  <X className="size-4 text-red-500" />
                  <span className="text-red-400">Posición incorrecta</span>
                </div>
                <span className="font-bold text-red-500">0</span>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Solo puedes ganar bonus si la posición es correcta
            </p>
          </div>

          {/* Winning */}
          <div className="rounded-2xl bg-purple-500/10 p-6 text-center">
            <Disc3 className="mx-auto mb-2 size-8 text-purple-400" />
            <h3 className="font-semibold">¿Cómo ganar?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              El primer jugador en completar el número de cartas configurado en
              su timeline gana. Si se acaba el deck, gana quien tenga más
              puntos.
            </p>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-border p-6">
            <h3 className="mb-3 font-semibold">Consejos</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>
                  Presta atención al estilo musical y la producción para
                  estimar la época
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>
                  Si dos canciones son del mismo año, cualquier orden entre
                  ellas es válida
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>
                  Aunque no sea tu turno, intenta adivinar para practicar
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
