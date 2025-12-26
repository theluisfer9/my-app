import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/_authed/games/wavelength/how-to-play")({
  component: HowToPlay,
});

function HowToPlay() {
  const steps = [
    {
      number: 1,
      title: "El Espectro",
      description:
        'En cada ronda hay dos conceptos opuestos. Por ejemplo: "Frío" y "Caliente". El objetivo está oculto en algún lugar específico entre estos dos extremos.',
    },
    {
      number: 2,
      title: "El Psíquico",
      description:
        "Un jugador (el Psíquico) ve dónde está el objetivo y debe dar una pista única que sitúe el concepto en esa posición. Por ejemplo, si el objetivo está cerca de \"Caliente\", podría decir \"Café\".",
    },
    {
      number: 3,
      title: "El Equipo Adivina",
      description:
        "El resto del equipo discute y mueve el dial hacia la izquierda o derecha donde creen que encaja la pista. ¡Deben sintonizar con la mente del Psíquico!",
    },
    {
      number: 4,
      title: "Puntuación",
      description:
        "Cuanto más cerca del objetivo, más puntos ganan. ¡4 puntos si dan en el centro exacto, 3 si están cerca, 2 si es buen intento, y 0 si fallan!",
    },
  ];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <Link
          to="/games/wavelength"
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-6" />
        </Link>
        <h2 className="flex-1 pr-10 text-center text-lg font-bold leading-tight">
          Cómo jugar
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold">Sintoniza tu mente</h1>
            <p className="mt-2 text-muted-foreground">
              Wavelength es un juego de empatía y comunicación. ¿Puedes adivinar
              qué está pensando tu compañero?
            </p>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step.number}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Scoring */}
          <div className="rounded-2xl border border-border bg-surface p-4">
            <h3 className="mb-3 font-semibold">Puntuación</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-green-500" />
                <span className="text-sm">
                  <strong>4 puntos</strong> - Centro exacto
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-blue-500" />
                <span className="text-sm">
                  <strong>3 puntos</strong> - A los lados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-amber-500" />
                <span className="text-sm">
                  <strong>2 puntos</strong> - Buen intento
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-gray-400" />
                <span className="text-sm">
                  <strong>0 puntos</strong> - Fuera de zona
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-background p-6">
        <Link
          to="/games/wavelength"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <CheckCircle className="size-5" />
          <span>¡Entendido!</span>
        </Link>
      </div>
    </div>
  );
}
