import { Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, Bug, Home, PuzzleIcon } from "lucide-react";

export function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-svh flex-col justify-between overflow-x-hidden bg-background antialiased">
      {/* Header / Top Bar */}
      <header className="absolute left-0 top-0 z-10 flex w-full items-center justify-between bg-transparent px-4 pb-2 pt-4">
        <button
          onClick={() => router.history.back()}
          className="flex size-10 items-center justify-center rounded-full bg-surface/50 text-foreground backdrop-blur-md transition active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </button>
        {/* Placeholder for balance */}
        <div className="size-10" />
      </header>

      {/* Main Content */}
      <main className="relative z-0 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6">
        {/* Abstract Background Decorative Elements */}
        <div className="pointer-events-none absolute left-0 top-1/4 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-0 -z-10 h-48 w-48 rounded-full bg-purple-500/10 blur-[60px]" />

        {/* Illustration Area */}
        <div className="group relative mb-10">
          <div className="relative flex size-64 items-center justify-center overflow-hidden rounded-full border border-border bg-surface shadow-2xl">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent" />
            {/* Sad face icon */}
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary drop-shadow-lg"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 9h0" />
                <path d="M16 9h0" />
                <path d="m9 9 1.5 1.5L9 12" />
                <path d="m15 9-1.5 1.5L15 12" />
                <path d="M16 16c-.5-1.5-1.8-3-4-3s-3.5 1.5-4 3" />
              </svg>
            </div>
          </div>

          {/* Floating element decoration - Warning */}
          <div className="absolute -right-2 -top-4 rotate-12 rounded-2xl border border-border bg-surface p-3 shadow-lg">
            <AlertTriangle className="size-6 text-amber-400" />
          </div>

          {/* Floating element decoration - Puzzle */}
          <div className="absolute -bottom-2 -left-2 -rotate-12 rounded-2xl border border-border bg-surface p-3 shadow-lg">
            <PuzzleIcon className="size-6 text-rose-400" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2 text-center">
          <h1 className="select-none bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-8xl font-black leading-none tracking-tighter text-transparent">
            404
          </h1>
          <h2 className="mt-4 text-2xl font-bold text-foreground">
            Página no encontrada
          </h2>
          <p className="mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
            Parece que te has perdido en el juego. Esta herramienta o nivel no
            existe.
          </p>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="mx-auto w-full max-w-md bg-transparent px-6 pb-8 pt-4">
        <div className="flex flex-col gap-4">
          {/* Primary Action */}
          <Link
            to="/home"
            className="group flex h-14 w-full transform items-center justify-center gap-2 rounded-full bg-primary font-bold text-primary-foreground shadow-[0_0_20px_-5px_rgba(19,164,236,0.3)] transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <Home className="size-5 transition-transform group-hover:-translate-x-1" />
            Volver al Inicio
          </Link>

          {/* Secondary Action */}
          <button className="flex w-full items-center justify-center gap-2 rounded-full py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            <Bug className="size-[18px]" />
            Reportar un problema
          </button>
        </div>

        {/* Safe Area Spacer */}
        <div className="mx-auto mt-6 h-1 w-1/3 rounded-full bg-muted" />
      </footer>
    </div>
  );
}
