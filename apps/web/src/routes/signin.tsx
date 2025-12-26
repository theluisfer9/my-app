import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/signin")({
  component: SignInComponent,
});

function SignInComponent() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          toast.success("Sesión iniciada correctamente");
          navigate({ to: "/home" });
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Error al iniciar sesión");
        },
      },
    );

    setIsLoading(false);
  };

  const handleSocialSignIn = async (provider: "google" | "apple") => {
    setSocialLoading(provider);

    await authClient.signIn.social(
      {
        provider,
        callbackURL: "/authenticating",
      },
      {
        onError: (ctx) => {
          toast.error(ctx.error.message || `Error al iniciar sesión con ${provider}`);
          setSocialLoading(null);
        },
      },
    );
  };

  const isDisabled = isLoading || socialLoading !== null;

  return (
    <div className="flex min-h-full w-full flex-col overflow-x-hidden">
      {/* Header Image Section */}
      <div className="px-4 py-3">
        <div
          className="relative flex min-h-[180px] w-full flex-col justify-end overflow-hidden rounded-lg bg-surface bg-cover bg-center bg-no-repeat shadow-sm"
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
      <form
        onSubmit={handleSignIn}
        className="mx-auto flex w-full max-w-120 flex-1 flex-col gap-4 px-4 py-4"
      >
        {/* Email Field */}
        <div className="flex w-full flex-col gap-1">
          <Label htmlFor="email" className="pb-1 text-sm font-medium">
            Correo electrónico
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="h-14 rounded-xl pr-12 text-base"
              disabled={isDisabled}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu contraseña"
              className="h-14 rounded-xl pr-12 text-base"
              disabled={isDisabled}
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
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={isDisabled}
            className="h-14 w-full gap-2 rounded-xl text-base font-bold shadow-lg shadow-primary/25"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-border" />
          <span className="mx-4 shrink-0 text-sm font-medium text-muted-foreground">
            O continúa con
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 gap-3 rounded-xl font-medium"
            disabled={isDisabled}
            onClick={() => handleSocialSignIn("google")}
          >
            {socialLoading === "google" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
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
            )}
            <span>Google</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12 gap-3 rounded-xl font-medium"
            disabled={isDisabled}
            onClick={() => handleSocialSignIn("apple")}
          >
            {socialLoading === "apple" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            )}
            <span>Apple</span>
          </Button>
        </div>
      </form>

      {/* Footer / Sign Up */}
      <div className="mt-auto w-full bg-transparent pb-8 pt-4">
        <div className="flex flex-col items-center justify-center gap-4 px-4">
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
