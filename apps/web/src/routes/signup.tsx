import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  component: SignUpComponent,
});

function SignUpComponent() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center p-6 sm:p-8">
      <div className="flex w-full max-w-120 flex-col gap-6 sm:gap-8">
        {/* Header Section */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 shadow-sm backdrop-blur-sm">
            <Briefcase className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Crear Cuenta</h1>
            <p className="text-base font-normal text-muted-foreground">
              Accede a todas tus herramientas y juegos.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <form className="flex flex-col gap-5">
          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username" className="ml-1 text-base font-medium">
              Nombre de usuario
            </Label>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors">
                <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
              </div>
              <Input
                id="username"
                type="text"
                placeholder="Tu nombre de usuario"
                className="h-14 rounded-xl pl-12 text-base"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="ml-1 text-base font-medium">
              Correo electrónico
            </Label>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors">
                <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
              </div>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                className="h-14 rounded-xl pl-12 text-base"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="ml-1 text-base font-medium">
              Contraseña
            </Label>
            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors">
                <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-14 rounded-xl pl-12 pr-12 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4"
              >
                {showPassword ? (
                  <Eye className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                ) : (
                  <EyeOff className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="mt-4 h-14 w-full rounded-xl text-lg font-bold shadow-lg shadow-primary/25"
          >
            Registrarse
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-border" />
          <span className="mx-4 shrink-0 text-sm font-medium text-muted-foreground">
            O continúa con
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-12 gap-3 rounded-xl font-medium"
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
            <span>Google</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-12 gap-3 rounded-xl font-medium"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span>Apple</span>
          </Button>
        </div>

        {/* Login Link */}
        <div className="pt-2 text-center">
          <p className="text-base text-muted-foreground">
            ¿Ya tienes una cuenta?
            <Link
              to="/signin"
              className="ml-1 font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
