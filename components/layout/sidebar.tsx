"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  Users,
  Wallet,
  Receipt,
  ReceiptText,
  TrendingUp,
  Settings,
  PlusCircle,
  Tag,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Nueva Venta (POS)", href: "/ventas/nueva", icon: PlusCircle, highlight: true },
  { name: "Ventas", href: "/ventas", icon: ShoppingCart },
  { name: "Inventario", href: "/inventario", icon: Package },
  { name: "Productos", href: "/productos", icon: Boxes },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Caja", href: "/caja", icon: Wallet },
  { name: "Pedidos", href: "/pedidos", icon: Receipt },
  { name: "Gastos", href: "/gastos", icon: ReceiptText },
  { name: "Reportes", href: "/reportes", icon: TrendingUp },
  { name: "Promociones", href: "/promociones", icon: Tag },
  { name: "Configuración", href: "/configuracion", icon: Settings },
];

import { useState, useEffect } from "react";

export function Sidebar({ userPermissions }: { userPermissions?: any }) {
  const pathname = usePathname();
  const [loadingRoute, setLoadingRoute] = useState<string | null>(null);

  // Reset loading state when pathname changes (navigation completes)
  useEffect(() => {
    setLoadingRoute(null);
  }, [pathname]);

  const visibleNavigationItems = navigationItems.filter(item => {
    if (!userPermissions) return false;
    // Always show Dashboard
    if (item.href === "/") return true;
    
    if (item.href.startsWith("/ventas") || item.href.startsWith("/caja")) return userPermissions.canAccessPOS;
    if (item.href.startsWith("/inventario") || item.href.startsWith("/productos") || item.href.startsWith("/promociones")) return userPermissions.canAccessInventory;
    if (item.href.startsWith("/clientes") || item.href.startsWith("/pedidos")) return userPermissions.canAccessCustomers;
    if (item.href.startsWith("/gastos")) return userPermissions.canAccessExpenses;
    if (item.href.startsWith("/reportes")) return userPermissions.canAccessReports;
    if (item.href.startsWith("/configuracion")) return userPermissions.canAccessSettings;
    
    return false;
  });

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-0 bg-white border-r border-rose-100 overflow-y-auto overscroll-contain p-4 shadow-sm shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-2 border-b border-rose-50">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-400 to-amber-300 p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-rose-500" />
          </div>
        </div>
        <div>
          <h1 className="font-bold text-rose-950 text-base leading-tight tracking-tight">
            Compritas Bonitas
          </h1>
          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 inline-block mt-0.5">
            ✨ POS Boutique
          </span>
        </div>
      </div>

      {/* Quick POS Button */}
      {(!userPermissions || userPermissions.canAccessPOS) && (
        <div className="mb-4">
          <Link
            href="/ventas/nueva"
            onClick={() => {
              if (pathname !== "/ventas/nueva") setLoadingRoute("/ventas/nueva");
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm active:scale-[0.98]"
          >
            {loadingRoute === "/ventas/nueva" ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <PlusCircle className="w-5 h-5" />
            )}
            <span>{loadingRoute === "/ventas/nueva" ? "Cargando..." : "🛒 NUEVA VENTA"}</span>
          </Link>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {visibleNavigationItems.map((item) => {
          if (item.href === "/ventas/nueva") return null; // Already highlighted top
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const isLoading = loadingRoute === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (!isActive) setLoadingRoute(item.href);
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative",
                isActive
                  ? "bg-rose-50 text-rose-700 font-semibold shadow-sm border border-rose-200/60"
                  : "text-slate-600 hover:bg-rose-50/50 hover:text-rose-600"
              )}
            >
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-rose-200 border-t-rose-600 animate-spin" />
              ) : (
                <Icon className={cn("w-4 h-4", isActive ? "text-rose-600" : "text-slate-400")} />
              )}
              <span className={isLoading ? "opacity-70" : ""}>
                {item.name}
              </span>
              
              {/* Optional: A small "loading" text badge */}
              {isLoading && (
                <span className="absolute right-3 text-[10px] text-rose-500 font-bold animate-pulse">
                  cargando...
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="pt-4 mt-2 border-t border-rose-100">
        <form action={async () => {
          const { logoutAction } = await import("@/lib/actions/auth");
          await logoutAction();
        }}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
          >
            Cerrar Sesión
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="pt-4 mt-2 text-xs text-slate-400 text-center">
        Compritas Bonitas POS v1.0 • México 🇲🇽
      </div>
    </aside>
  );
}
