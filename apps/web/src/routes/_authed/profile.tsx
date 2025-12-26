import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  ExternalLink,
  Globe,
  HelpCircle,
  Loader2,
  Lock,
  LogOut,
  Palette,
  Pencil,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/profile")({
  component: ProfileComponent,
});

function ProfileComponent() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Sesión cerrada correctamente");
          navigate({ to: "/signin" });
        },
        onError: () => {
          toast.error("Error al cerrar sesión");
          setIsLoggingOut(false);
        },
      },
    });
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 p-4 pb-2 backdrop-blur-md">
        <Link
          to="/home"
          className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-6" />
        </Link>
        <h2 className="flex-1 pr-10 text-center text-lg font-bold leading-tight">
          Perfil
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-10">
        {/* Profile Header */}
        <div className="flex flex-col items-center justify-center p-6">
          <div className="group relative mb-4 cursor-pointer">
            <div
              className="aspect-square size-28 rounded-full bg-cover bg-center bg-no-repeat shadow-xl ring-4 ring-surface"
              style={{
                backgroundImage: user.image
                  ? `url("${user.image}")`
                  : undefined,
              }}
            >
              {!user.image && (
                <div className="flex size-full items-center justify-center rounded-full bg-primary/20">
                  <User className="size-14 text-primary" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border-4 border-background bg-primary p-2 text-white shadow-sm">
              <Pencil className="size-4" />
            </div>
          </div>
          <div className="mb-5 flex flex-col items-center justify-center gap-1">
            <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
            <p className="text-sm font-medium text-muted-foreground">
              {user.email}
            </p>
          </div>
          <Button
            variant="ghost"
            className="flex w-full max-w-[200px] items-center justify-center gap-2 rounded-full bg-primary/10 px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
          >
            <Pencil className="size-4" />
            <span>Editar Perfil</span>
          </Button>
        </div>

        {/* Content Area - iOS Style Groups */}
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4">
          {/* Section: Cuenta */}
          <div className="flex flex-col gap-2">
            <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cuenta
            </h3>
            <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <MenuItem
                icon={User}
                iconBg="bg-blue-100 dark:bg-blue-900/30"
                iconColor="text-blue-600 dark:text-blue-400"
                label="Información Personal"
              />
              <MenuItem
                icon={Lock}
                iconBg="bg-blue-100 dark:bg-blue-900/30"
                iconColor="text-blue-600 dark:text-blue-400"
                label="Cambiar Contraseña"
                isLast
              />
            </div>
          </div>

          {/* Section: Ajustes */}
          <div className="flex flex-col gap-2">
            <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ajustes
            </h3>
            <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Bell className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">Notificaciones</p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              <MenuItem
                icon={Globe}
                iconBg="bg-orange-100 dark:bg-orange-900/30"
                iconColor="text-orange-600 dark:text-orange-400"
                label="Idioma"
                value="Español"
              />
              <MenuItem
                icon={Palette}
                iconBg="bg-teal-100 dark:bg-teal-900/30"
                iconColor="text-teal-600 dark:text-teal-400"
                label="Tema"
                isLast
              />
            </div>
          </div>

          {/* Section: Privacidad y Soporte */}
          <div className="flex flex-col gap-2">
            <h3 className="px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Privacidad y Soporte
            </h3>
            <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <MenuItem
                icon={Shield}
                iconBg="bg-gray-100 dark:bg-slate-700"
                iconColor="text-gray-600 dark:text-gray-300"
                label="Política de Privacidad"
                external
              />
              <MenuItem
                icon={HelpCircle}
                iconBg="bg-gray-100 dark:bg-slate-700"
                iconColor="text-gray-600 dark:text-gray-300"
                label="Ayuda y Soporte"
                isLast
              />
            </div>
          </div>

          {/* Logout */}
          <div className="mt-4 flex flex-col items-center gap-6">
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex h-auto w-full items-center justify-center gap-2 rounded-xl border-red-200 bg-surface py-3.5 font-bold text-red-500 shadow-sm transition-colors hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/10"
            >
              {isLoggingOut ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <LogOut className="size-5" />
              )}
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
            </Button>
            <p className="text-xs font-medium text-muted-foreground/60">
              Mi App v1.0.0 (Build 1)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  external?: boolean;
  isLast?: boolean;
}

function MenuItem({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  external,
  isLast,
}: MenuItemProps) {
  return (
    <div
      className={cn(
        "flex cursor-pointer items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/50",
        !isLast && "border-b border-border",
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          iconBg,
          iconColor,
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between pr-2">
        <p className="truncate text-sm font-medium">{label}</p>
        {value && <span className="text-xs text-muted-foreground">{value}</span>}
      </div>
      {external ? (
        <ExternalLink className="size-5 text-muted-foreground" />
      ) : (
        <ChevronRight className="size-5 text-muted-foreground" />
      )}
    </div>
  );
}
