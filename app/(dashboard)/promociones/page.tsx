import { db } from "@/lib/db";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { Tag, Plus, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PromocionesPage() {
  const promotions = await db.promotion.findMany({
    include: { product: true, variant: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-3xl border border-rose-100 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-rose-950">🏷️ Gestión de Promociones y Ofertas</h1>
          <p className="text-xs text-slate-500">Descuentos por porcentaje, monto fijo o precios especiales</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.length === 0 ? (
          <div className="col-span-full bg-white p-8 text-center text-slate-400 rounded-3xl border border-rose-100">
            <Tag className="w-10 h-10 mx-auto mb-2 text-rose-200 stroke-1" />
            <p className="text-xs">No hay promociones activas actualmente.</p>
          </div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs">
              <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-block mb-2">
                ✨ Promoción Especial
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">{promo.name}</h3>
              <p className="text-xs font-bold text-rose-700 mt-1">
                {promo.discountType === "PERCENTAGE"
                  ? `${promo.discountValue}% de descuento`
                  : formatCurrency(promo.discountValue)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
