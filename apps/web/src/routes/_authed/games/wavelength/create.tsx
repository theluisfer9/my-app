import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Users, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "@my-app/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authed/games/wavelength/create")({
  component: CreateRoom,
});

function CreateRoom() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const createRoom = useMutation(api.wavelength.mutations.createRoom);

  const [name, setName] = useState(`Sala de ${session?.user?.name ?? "Jugador"}`);
  const [gameMode, setGameMode] = useState<"individual" | "teams">("individual");
  const [totalRounds, setTotalRounds] = useState(5);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const roundOptions = [3, 5, 7, 10];

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Ingresa un nombre para la sala");
      return;
    }

    if (isPrivate && !password.trim()) {
      toast.error("Ingresa una contraseña para la sala privada");
      return;
    }

    setIsCreating(true);

    try {
      const result = await createRoom({
        name: name.trim(),
        gameMode,
        totalRounds,
        isPrivate,
        password: isPrivate ? password : undefined,
      });

      toast.success(`Sala creada: ${result.code}`);
      navigate({ to: "/games/wavelength/room/$roomId", params: { roomId: result.roomId } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear sala");
      setIsCreating(false);
    }
  };

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
          Crear Sala
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          {/* Room Name */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Nombre de la sala</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi sala de Wavelength"
              maxLength={50}
            />
          </div>

          {/* Game Mode Selector */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Modo de juego</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGameMode("individual")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  gameMode === "individual"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full",
                    gameMode === "individual"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <User className="size-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Individual</p>
                  <p className="text-xs text-muted-foreground">
                    Todos contra todos
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGameMode("teams")}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  gameMode === "teams"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-full",
                    gameMode === "teams"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Users className="size-6" />
                </div>
                <div className="text-center">
                  <p className="font-semibold">Por Equipos</p>
                  <p className="text-xs text-muted-foreground">
                    Mínimo 4 jugadores
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Rounds Selector */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Rondas por jugador</label>
            <div className="flex gap-2">
              {roundOptions.map((rounds) => (
                <button
                  key={rounds}
                  type="button"
                  onClick={() => setTotalRounds(rounds)}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-3 text-center font-semibold transition-all",
                    totalRounds === rounds
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground/50"
                  )}
                >
                  {rounds}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Cada jugador será psíquico {totalRounds} {totalRounds === 1 ? "vez" : "veces"}
            </p>
          </div>

          {/* Private Room Toggle */}
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Lock className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Sala Privada</p>
                  <p className="text-sm text-muted-foreground">
                    Solo con contraseña
                  </p>
                </div>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>

            {/* Password Input */}
            {isPrivate && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium uppercase text-muted-foreground">
                  Contraseña de acceso
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    maxLength={20}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Info */}
          <p className="text-center text-sm text-muted-foreground">
            Se generará un código único para que otros puedan unirse a tu sala.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-background p-6">
        <Button
          onClick={handleCreate}
          disabled={isCreating}
          size="lg"
          className="h-14 w-full rounded-xl text-base"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Sala"
          )}
        </Button>
      </div>
    </div>
  );
}
