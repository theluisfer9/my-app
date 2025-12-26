import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signin")({
  component: SignInComponent,
});

function SignInComponent() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-full w-full flex-col overflow-x-hidden">
      {/* Header Image Section */}
      <div className="px-4 py-3">
        <div
          className="relative flex min-h-[220px] w-full flex-col justify-end overflow-hidden rounded-lg bg-surface bg-cover bg-center bg-no-repeat shadow-sm"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60")`,
          }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
        </div>
      </div>

      {/* Headline */}
      <div className="px-4 pb-2 pt-4">
        <h1 className="text-center text-[32px] font-bold leading-tight tracking-tight">
          Bienvenido
        </h1>
        <p className="pt-2 text-center text-sm font-normal leading-normal text-muted-foreground">
          Accede a tus herramientas y juegos favoritos
        </p>
      </div>

      {/* Form Section */}
      <div className="mx-auto flex w-full max-w-120 flex-1 flex-col gap-4 px-4 py-4">
        {/* Email Field */}
        <div className="flex w-full flex-col gap-1">
          <Label htmlFor="email" className="pb-1 text-sm font-medium">
            Correo electrónico
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              className="h-14 rounded-xl pr-12 text-base"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div className="flex w-full flex-col gap-1">
          <Label htmlFor="password" className="pb-1 text-sm font-medium">
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Introduce tu contraseña"
              className="h-14 rounded-xl pr-12 text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-muted-foreground transition-colors hover:text-primary"
            >
              {showPassword ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end pt-1">
          <a
            href="#"
            className="text-sm font-medium leading-normal text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {/* Login Button */}
        <div className="pt-4">
          <Button
            size="lg"
            className="h-14 w-full gap-2 rounded-xl text-base font-bold shadow-lg shadow-primary/25"
          >
            <Lock className="h-5 w-5" />
            Iniciar Sesión
          </Button>
        </div>
      </div>

      {/* Footer / Sign Up */}
      <div className="mt-auto w-full bg-transparent pb-8 pt-4">
        <div className="flex flex-col items-center justify-center gap-4 px-4">
          {/* Divider */}
          <div className="flex w-full max-w-[200px] items-center gap-2 opacity-50">
            <div className="h-px flex-1 bg-muted-foreground" />
            <span className="text-xs text-muted-foreground">O</span>
            <div className="h-px flex-1 bg-muted-foreground" />
          </div>
          <p className="text-center text-sm font-normal leading-normal text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/signup"
              className="ml-1 font-bold text-primary hover:underline"
            >
              Crear una cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
