"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Wallet, Receipt, Package, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const mobileItems = [
    { name: "Inicio", href: "/", icon: LayoutDashboard },
    { name: "Cobrar", href: "/ventas/nueva", icon: PlusCircle, highlight: true },
    { name: "Caja", href: "/caja", icon: Wallet },
    { name: "Pedidos", href: "/pedidos", icon: Receipt },
    { name: "Stock", href: "/inventario", icon: Package },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-rose-100 shadow-lg px-2 py-1.5 backdrop-blur-md bg-white/95">
      <div className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-rose-500 to-rose-600 text-white p-3 shadow-lg shadow-rose-200 border-4 border-white flex items-center justify-center active:scale-95 transition-transform">
                  <PlusCircle className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-rose-600 mt-0.5">
                  VENDER
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors",
                isActive ? "text-rose-600 font-bold" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
