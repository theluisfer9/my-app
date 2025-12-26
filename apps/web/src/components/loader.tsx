import { Loader2, Wrench } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center gap-6 p-6">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/20">
        <Wrench className="size-10 text-primary" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Cargando...</h1>
        <p className="mt-2 text-muted-foreground">
          Un momento por favor
        </p>
      </div>
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}
