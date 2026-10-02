import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ShoppingCart, PlusCircle, ArrowUpRight, Ban } from "lucide-react";
import { cancelSale } from "@/lib/actions/sales";

export const dynamic = "force-dynamic";

export default async function VentasHistorialPage() {
  const sales = await db.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
      items: true,
      payments: true,
      user: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-rose-950">🛒 Historial de Ventas</h1>
          <p className="text-xs text-slate-500">Registro histórico inmutable de transacciones</p>
        </div>

        <Link
          href="/ventas/nueva"
          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md"
        >
          <PlusCircle className="w-4 h-4" />
          <span>NUEVA VENTA</span>
        </Link>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-rose-50/50 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3 rounded-l-xl">Folio</th>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Ítems</th>
                <th className="py-2.5 px-3">Pago</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 rounded-r-xl text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-rose-50/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-rose-950">{sale.saleNumber}</td>
                  <td className="py-3 px-3">{formatDate(sale.createdAt)}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {sale.customer?.name || "CLIENTE MOSTRADOR"}
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                      {sale.items.reduce((a, b) => a + b.quantity, 0)} prendas
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {sale.payments[0]?.paymentMethod || "Efectivo"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        sale.status === "CANCELLED"
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {sale.status === "CANCELLED" ? "CANCELADA" : "COMPLETADA"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-rose-700 text-sm">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
