"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Wallet, AlertCircle, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CashRegisterInfo {
  id: string;
  expectedCash: number;
  status: string;
}

import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const [cashRegister, setCashRegister] = useState<CashRegisterInfo | null>(null);
  const [posLoading, setPosLoading] = useState(false);

  useEffect(() => {
    setPosLoading(false);
  }, [pathname]);

  useEffect(() => {
    // Fetch active cash register status
    fetch("/api/cash/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCashRegister(data.cashRegister);
      })
      .catch(() => null);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 px-4 lg:px-8 py-3 flex items-center justify-between shadow-xs">
      {/* Mobile Title Logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-bold text-rose-950 text-sm leading-none">Compritas Bonitas</h2>
          <span className="text-[10px] text-amber-600 font-medium">Boutique POS</span>
        </div>
      </div>

      <div className="hidden lg:block">
        <h2 className="text-lg font-bold text-rose-950">Sistema POS Compritas Bonitas</h2>
        <p className="text-xs text-slate-500">Punto de Venta & Control de Inventario</p>
      </div>

      {/* Header Actions & Cash Status */}
      <div className="flex items-center gap-3">
        <Link
          href="/caja"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold shadow-2xs"
          style={{
            backgroundColor: cashRegister ? "#F0FDF4" : "#FEF2F2",
            borderColor: cashRegister ? "#BBF7D0" : "#FECACA",
            color: cashRegister ? "#166534" : "#991B1B",
          }}
        >
          <Wallet className="w-4 h-4" />
          <span>
            {cashRegister
              ? `Caja Abierta: ${formatCurrency(cashRegister.expectedCash)}`
              : "Caja Cerrada ⚠️"}
          </span>
        </Link>

        <Link
          href="/ventas/nueva"
          onClick={() => setPosLoading(true)}
          className="hidden sm:flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
        >
          {posLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-rose-200 border-t-rose-600 animate-spin" />
          ) : (
            <ShoppingBag className="w-4 h-4 text-rose-600" />
          )}
          <span>{posLoading ? "Cargando..." : "Cobro POS"}</span>
        </Link>
      </div>
    </header>
  );
}
