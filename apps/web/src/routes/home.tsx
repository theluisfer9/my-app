import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calculator,
  CircuitBoard,
  Flashlight,
  Gamepad2,
  Grid3X3,
  Heart,
  History,
  Plus,
  RefreshCcw,
  Ruler,
  Search,
  Settings,
  Siren,
  User,
  Wrench,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/home")({
  component: HomeComponent,
});

const quickAccessItems = [
  {
    name: "Linterna",
    category: "Utilidades",
    icon: Flashlight,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnWMqWAWRlN7iUeHWhFdIt5JQew2yS9AVmi1Qdi4gqr5G6dlHwD-KeOuHEo_cfNxARliWeYExtYllGyWHG8sAUtByrexf7JPjPye8KvvatsDJzlpA-MFWlgkDQJUWSnaEnws4WjR5HNKktzdUaWOtpvanjX-ITAUvkaxSQZZgHuk7HpdYMw2wLvL161ltr3pqmhAKcDrvsAZq1gSAT7t5WObP-a4ceRW58ctyJRW5xnYtr_CZtVk5zdidGYd8GQ4pk3z9qPpunmE8",
  },
  {
    name: "Calculadora",
    category: "Matemáticas",
    icon: Calculator,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOGmjeuyElIdDNvmE2MZgsSVZGgoMjqXYr8keOmppaqDSOAafUAQOmxoElZD7bSCXL4MexSa9hVQ7gYm8t4hiiPZSQPAYBB325CRdbVcv76gbEK7osfYx-gR4rzwKZ3wweP1VtecF136iQPC3b3dEuuDFQERI2FtMlgHB8S0OCtKyu3_UF4PREeWMha8Vk_K7VL5KH4GR6eAlBOJOywKVCTJalW9frBBlrxDp3lV8iT_hzLAByTLiF9pECBrXnzViV-rwSrQv2yHQ",
  },
  {
    name: "Regla AR",
    category: "Medición",
    icon: Ruler,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAcfoLOz_si67754gDdLSHSLGO-R02Ku5LNvb9xPUlRT_InTu4Tbq-J8RX2GJao7O9iuBEaYeaH7qWwSrwn46YM4aF4-Cpu4oOS-z8KZqmrI_GVNhOfXBKFWcojELkLegDi62r8Vkiqpyw_vXjCfUEss51MeJKHF39gyNsvChSE2jsEwTcFYwxRnh5qp77xeCvJbVAGSh8BMLDfgec9gdSsUztS1ThAauwxR6A1fHIrefXKpTwp-g4cJZEEcZ_1GbmkreV7y_apBDQ",
  },
];

const modules = [
  {
    name: "Herramientas",
    description: "Nivel, Brújula...",
    icon: Wrench,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    name: "Minijuegos",
    description: "Arcade, Puzzle...",
    icon: Gamepad2,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    name: "Utilidades",
    description: "QR, Notas...",
    icon: CircuitBoard,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    name: "Conversor",
    description: "Divisas, Peso...",
    icon: RefreshCcw,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    name: "Emergencia",
    description: "SOS, Silbato...",
    icon: Siren,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    name: "Más",
    description: "Configurar",
    icon: Plus,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
];

const navItems = [
  { name: "Inicio", icon: Grid3X3, active: true },
  { name: "Favoritos", icon: Heart, active: false },
  { name: "Recientes", icon: History, active: false },
  { name: "Perfil", icon: User, active: false },
];

function HomeComponent() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden pb-20">
      {/* Top App Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 p-4 pb-2 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Wrench className="size-6" />
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">
            Mi app
          </h2>
        </div>
        <button
          type="button"
          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-transparent transition-colors hover:bg-muted"
        >
          <Settings className="size-6" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="sticky top-[68px] z-10 bg-background px-4 py-3">
        <div className="flex h-12 w-full items-stretch overflow-hidden rounded-xl shadow-sm">
          <div className="flex items-center justify-center rounded-l-xl border-r-0 bg-surface pl-4 text-muted-foreground">
            <Search className="size-5" />
          </div>
          <Input
            className="h-full flex-1 rounded-l-none rounded-r-xl border-none bg-surface pl-2 text-base focus-visible:ring-0"
            placeholder="Buscar herramienta o juego..."
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Section: Acceso Rápido */}
        <div className="flex flex-col pt-2">
          <div className="flex items-center justify-between px-4 pb-3">
            <h2 className="text-xl font-bold leading-tight tracking-tight">
              Acceso Rápido
            </h2>
            <button
              type="button"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Ver todo
            </button>
          </div>
          <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-4 pb-4">
            {quickAccessItems.map((item) => (
              <div
                key={item.name}
                className="flex min-w-[140px] snap-start flex-col gap-2"
              >
                <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                  <div className="absolute inset-0 z-10 bg-black/20 transition-colors group-hover:bg-black/10" />
                  <div
                    className="h-full w-full transform bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url("${item.image}")` }}
                  />
                  <div className="absolute right-2 top-2 z-20 flex items-center justify-center rounded-full bg-black/50 p-1.5 backdrop-blur-sm">
                    <item.icon className="size-4 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-normal">
                    {item.name}
                  </p>
                  <p className="text-xs font-normal leading-normal text-muted-foreground">
                    {item.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Módulos */}
        <div className="flex flex-col">
          <h2 className="px-4 pb-3 pt-2 text-left text-xl font-bold leading-tight tracking-tight">
            Módulos
          </h2>
          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            {modules.map((module) => (
              <div
                key={module.name}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-6 shadow-sm transition-transform active:scale-[0.98]"
              >
                <div
                  className={cn(
                    "flex size-14 items-center justify-center rounded-full",
                    module.bgColor,
                  )}
                >
                  <module.icon className={cn("size-8", module.color)} />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-semibold">{module.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {module.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-6 pb-6 pt-2">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={cn(
                "flex w-16 flex-col items-center gap-1 transition-colors",
                item.active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn("size-6", item.active && "fill-primary")}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
