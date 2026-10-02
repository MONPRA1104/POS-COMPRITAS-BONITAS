"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export function QuickSaleButton() {
  const [isPending, setIsPending] = useState(false);

  return (
    <Link
      href="/ventas/nueva"
      onClick={() => setIsPending(true)}
      className="bg-white hover:bg-rose-50 text-rose-700 font-bold px-5 py-3 rounded-2xl shadow-md text-sm transition-all flex items-center gap-2 active:scale-95"
    >
      {isPending ? (
        <div className="w-5 h-5 rounded-full border-2 border-rose-200 border-t-rose-600 animate-spin" />
      ) : (
        <PlusCircle className="w-5 h-5 text-rose-600" />
      )}
      <span>{isPending ? "Abriendo..." : "NUEVA VENTA"}</span>
    </Link>
  );
}
