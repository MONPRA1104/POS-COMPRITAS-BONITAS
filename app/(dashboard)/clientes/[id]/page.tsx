import Link from "next/link";
import { getCustomerById } from "@/lib/actions/customers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, ShoppingBag, Phone, MapPin, Calendar, DollarSign } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  noStore();
  const customer = await getCustomerById(params.id);

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cliente no encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Clientes</span>
      </Link>

      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
            Perfil de Cliente
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">{customer.name}</h1>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
            {customer.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-rose-500" />
                {customer.phone}
              </span>
            )}
            {customer.address && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                {customer.address}, {customer.neighborhood}, {customer.city}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
          <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-100 text-center">
            <span className="text-[10px] text-slate-500 block">Total Comprado</span>
            <span className="font-extrabold text-rose-700 text-base">
              {formatCurrency(customer.totalSpent)}
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 block">Número de Compras</span>
            <span className="font-extrabold text-slate-900 text-base">
              {customer.totalPurchasesCount} ventas
            </span>
          </div>
        </div>
      </div>

      {/* Sales History */}
      <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-xs space-y-4">
        <h2 className="font-bold text-rose-950 text-base">🛍️ Historial de Ventas</h2>

        <div className="space-y-3">
          {customer.sales.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No hay compras registradas aún.</p>
          ) : (
            customer.sales.map((sale) => (
              <div
                key={sale.id}
                className="p-4 rounded-2xl border border-rose-100 bg-rose-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-950 text-sm">
                      {sale.saleNumber}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{formatDate(sale.createdAt)}</span>
                  </div>

                  <div className="mt-2 space-y-0.5">
                    {sale.items.map((item) => (
                      <p key={item.id} className="text-slate-700">
                        • {item.quantity}x {item.productName}{" "}
                        {item.variantName ? `(${item.variantName})` : ""} -{" "}
                        <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-rose-100">
                  <span className="font-extrabold text-rose-700 text-base block">
                    {formatCurrency(sale.total)}
                  </span>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                    {sale.payments[0]?.paymentMethod || "Efectivo"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
